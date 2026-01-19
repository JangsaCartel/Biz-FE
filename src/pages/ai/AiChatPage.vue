<script setup>
import { computed, nextTick, onMounted, ref, onBeforeUnmount } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'

import { fetchChatNode, streamChatLlm, streamChatAnswer } from '@/api/aiApi'

const router = useRouter()

const scrollEl = ref(null)
const messages = ref([])
const input = ref('')

const isStreaming = ref(false)
const abortCtrl = ref(null)

const currentNodeId = ref(null)

// 입력 모드: NONE(막힘) | FREE(자유질문 /llm/stream) | FOLLOWUP(버튼답변 후속 /answer/stream)
const inputMode = ref('NONE') // 'NONE' | 'FREE' | 'FOLLOWUP'

// 버튼 기반 답변 이후, 후속 입력을 같은 맥락으로 보내기 위한 컨텍스트
// { promptKey, title, trail, slotValues }
const followupCtx = ref(null)

// 사용자가 버튼으로 선택한 흐름 (Backend TrailItem(label,nodeId) 형태에 맞춤)
const trail = ref([]) // [{ label, nodeId }]

// ===== helpers =====
function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

async function scrollToBottom() {
  await nextTick()
  const el = scrollEl.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

function goBack() {
  abortStream()
  router.back()
}

// ===== streaming control =====
function abortStream() {
  const ctrl = abortCtrl.value
  if (ctrl) ctrl.abort()
  abortCtrl.value = null
  isStreaming.value = false
}

function endStream(ctrl) {
  // 내가 시작한 스트림의 ctrl일 때만 정리
  if (abortCtrl.value !== ctrl) return
  abortCtrl.value = null
  isStreaming.value = false
}

onBeforeRouteLeave(() => {
  abortStream()
})

onBeforeUnmount(() => {
  abortStream()
})

// ===== Node API =====
async function fetchNode(nodeId) {
  return await fetchChatNode(nodeId)
}

async function _streamAnswerIntoMessage(payload, answerMsg) {
  abortStream()

  isStreaming.value = true
  const ctrl = new AbortController()
  abortCtrl.value = ctrl

  try {
    await streamChatAnswer(
      payload,
      {
        onDelta(delta) {
          // 내 ctrl이 아닌 스트림이면 무시(늦게 오는 이벤트 방지)
          if (abortCtrl.value !== ctrl) return
          answerMsg.text += delta
          scrollToBottom()
        },
        onDone() {},
        onError(err) {
          if (err?.name === 'AbortError') {
            answerMsg.text = answerMsg.text || '요청을 중지했어요.'
            return
          }
          if (err?.code === 429) {
            answerMsg.text =
              answerMsg.text || '요청이 많아 일시적으로 제한됐어요. 20~60초 후 다시 시도해주세요.'
            return
          }
          answerMsg.text = answerMsg.text || '요청 중 오류가 발생했어요.'
        },
      },
      ctrl.signal,
    )
  } catch (e) {
    if (e?.name !== 'AbortError') {
      answerMsg.text = answerMsg.text || '요청 중 오류가 발생했어요.'
    }
  } finally {
    endStream(ctrl)
    await scrollToBottom()
  }
}

async function _streamLlmIntoMessage(payload, answerMsg) {
  abortStream()

  isStreaming.value = true
  const ctrl = new AbortController()
  abortCtrl.value = ctrl

  try {
    await streamChatLlm(
      payload,
      {
        onDelta(delta) {
          if (abortCtrl.value !== ctrl) return

          if (answerMsg.__placeholder) {
            answerMsg.text = ''
            answerMsg.__placeholder = false
          }

          answerMsg.text += delta
          scrollToBottom()
        },
        onDone() {},
        onError(err) {
          if (err?.name === 'AbortError') {
            answerMsg.text = answerMsg.text || '요청을 중지했어요.'
            return
          }
          if (err?.code === 429) {
            answerMsg.text =
              answerMsg.text || '요청이 많아 일시적으로 제한됐어요. 20~60초 후 다시 시도해주세요.'
            return
          }
          answerMsg.text = answerMsg.text || '요청 중 오류가 발생했어요.'
        },
      },
      ctrl.signal,
    )
  } catch (e) {
    if (e?.name !== 'AbortError') {
      answerMsg.text = answerMsg.text || '요청 중 오류가 발생했어요.'
    }
  } finally {
    endStream(ctrl)
    await scrollToBottom()
  }
}

// ===== node renderer =====
async function renderNode(node) {
  currentNodeId.value = node.nodeId || currentNodeId.value

  if (node.type === 'CHOICE') {
    inputMode.value = 'NONE'
    followupCtx.value = null

    messages.value.push({
      id: uid(),
      role: 'bot',
      kind: 'botText',
      title: null,
      text: node.title || '',
    })
    messages.value.push({
      id: uid(),
      role: 'bot',
      kind: 'quickReplies',
      title: null,
      options: node.options || [],
    })
    await scrollToBottom()
    return
  }

  if (node.type === 'ANSWER_STATIC') {
    inputMode.value = 'NONE'
    followupCtx.value = null

    messages.value.push({
      id: uid(),
      role: 'bot',
      kind: 'botAnswer',
      title: node.title || null,
      text: node.content || '',
    })

    if (node.afterOptions?.length) {
      messages.value.push({
        id: uid(),
        role: 'bot',
        kind: 'quickReplies',
        title: null,
        options: node.afterOptions,
      })
    }

    await scrollToBottom()
    return
  }

  if (node.type === 'ANSWER_LLM') {
    // 스트리밍 중엔 입력 막음
    inputMode.value = 'NONE'

    const answerMsg = {
      id: uid(),
      role: 'bot',
      kind: 'llmAnswer',
      text: '',
      suggestions: [],
      title: node.title || null,
    }
    messages.value.push(answerMsg)
    await scrollToBottom()

    const payload = {
      promptKey: node.promptKey || 'UNKNOWN',
      title: node.title || '',
      trail: JSON.parse(JSON.stringify(trail.value)), // 스냅샷
      slotValues: {},
      userText: '', // 첫 답변은 비움
    }

    await _streamAnswerIntoMessage(payload, answerMsg)

    // 후속 입력을 같은 promptKey + trail로 보내기 위해 컨텍스트 저장
    followupCtx.value = {
      promptKey: payload.promptKey,
      title: payload.title,
      trail: payload.trail,
      slotValues: payload.slotValues,
    }
    inputMode.value = 'FOLLOWUP'

    if (node.afterOptions?.length) {
      messages.value.push({
        id: uid(),
        role: 'bot',
        kind: 'quickReplies',
        title: null,
        options: node.afterOptions,
      })
    }

    await scrollToBottom()
    return
  }

  if (node.type === 'LLM_MODE') {
    inputMode.value = 'FREE'
    followupCtx.value = null

    messages.value.push({
      id: uid(),
      role: 'bot',
      kind: 'botText',
      title: node.title || '자유 질문',
      text: (node.hintExamples || []).map((x) => `• ${x}`).join('\n') || '자유롭게 질문해주세요.',
    })

    if (node.afterOptions?.length) {
      messages.value.push({
        id: uid(),
        role: 'bot',
        kind: 'quickReplies',
        title: null,
        options: node.afterOptions,
      })
    }

    await scrollToBottom()
    return
  }

  // fallback
  inputMode.value = 'NONE'
  followupCtx.value = null
  messages.value.push({
    id: uid(),
    role: 'bot',
    kind: 'botAnswer',
    title: '안내',
    text: `지원하지 않는 노드 타입: ${node.type}`,
  })
  await scrollToBottom()
}

async function moveTo(nodeId) {
  currentNodeId.value = nodeId
  const node = await fetchNode(nodeId)

  node.nodeId = nodeId

  await renderNode(node)
}

async function resetToRoot() {
  if (isStreaming.value) return
  input.value = ''
  inputMode.value = 'NONE'
  followupCtx.value = null
  trail.value = []
  await moveTo('ROOT')
}

// ===== Choice click =====
async function onChoice(opt) {
  if (isStreaming.value) return

  if (opt?.next === 'ROOT' && opt?.label === '메뉴로') {
    await resetToRoot()
    return
  }

  // "그 외 질문 계속"은 자유질문 모드로만 이동
  if (opt?.next === 'LLM_FREE') {
    messages.value.push({ id: uid(), role: 'user', kind: 'userText', text: opt.label })
    await scrollToBottom()
    await moveTo(opt.next)
    return
  }

  messages.value.push({ id: uid(), role: 'user', kind: 'userText', text: opt.label })
  await scrollToBottom()

  // TrailItem 형태로 누적
  trail.value.push({ label: opt.label, nodeId: opt.next || null })

  if (opt.next) await moveTo(opt.next)
}

// ===== send =====
const canSend = computed(() => {
  return input.value.trim().length > 0 && !isStreaming.value && inputMode.value !== 'NONE'
})

async function send() {
  const text = input.value.trim()
  if (!text || isStreaming.value || inputMode.value === 'NONE') return

  input.value = ''
  messages.value.push({ id: uid(), role: 'user', kind: 'userText', text })

  const answerMsg = {
    id: uid(),
    role: 'bot',
    kind: 'llmAnswer',
    text: inputMode.value === 'FREE' ? '자유 질문' : '',
    suggestions: [],
    __placeholder: inputMode.value === 'FREE',
  }
  messages.value.push(answerMsg)
  await scrollToBottom()

  // 1) 자유질문
  if (inputMode.value === 'FREE') {
    await _streamLlmIntoMessage({ text }, answerMsg)

    // 자유질문 끝나면 메뉴/계속 버튼
    messages.value.push({
      id: uid(),
      role: 'bot',
      kind: 'quickReplies',
      title: null,
      options: [
        { label: '메뉴로', next: 'ROOT' },
        { label: '그 외 질문 계속', next: 'LLM_FREE' },
      ],
    })

    await scrollToBottom()
    return
  }

  // 2) 버튼 기반 답변의 후속 입력
  if (inputMode.value === 'FOLLOWUP') {
    const ctx = followupCtx.value
    const payload = {
      promptKey: ctx?.promptKey || 'UNKNOWN',
      title: ctx?.title || '',
      trail: ctx?.trail || [],
      slotValues: ctx?.slotValues || {},
      userText: text, // 사용자가 방금 입력한 답
    }

    await _streamAnswerIntoMessage(payload, answerMsg)

    // FOLLOWUP은 계속 이어갈 수 있게 유지
    inputMode.value = 'FOLLOWUP'
    await scrollToBottom()
  }
}

onMounted(async () => {
  await resetToRoot()
})
</script>

<template>
  <div class="ChatPage">
    <header class="Header">
      <button type="button" class="HeaderBtn" @click="goBack">←</button>
      <h1 class="HeaderTitle">AI 챗봇</h1>
      <button type="button" class="HeaderBtn" :disabled="isStreaming" @click="resetToRoot">
        기본메뉴
      </button>
    </header>

    <main ref="scrollEl" class="Body">
      <div v-for="m in messages" :key="m.id" class="Row" :class="m.role">
        <div v-if="m.role === 'bot'" class="Avatar">🐝</div>

        <div class="Bubble">
          <!-- BOT TEXT -->
          <template v-if="m.kind === 'botText'">
            <div v-if="m.title" class="Title">{{ m.title }}</div>
            <div class="Text">{{ m.text }}</div>
          </template>

          <!-- BOT CHOICE BUTTONS -->
          <template v-else-if="m.kind === 'quickReplies'">
            <div v-if="m.title" class="Title">{{ m.title }}</div>
            <div class="BtnGrid">
              <button
                v-for="opt in m.options"
                :key="opt.label"
                type="button"
                class="ChoiceBtn"
                :disabled="isStreaming"
                @click="onChoice(opt)"
              >
                {{ opt.label }}
              </button>
            </div>
          </template>

          <!-- BOT ANSWER -->
          <template v-else-if="m.kind === 'botAnswer'">
            <div v-if="m.title" class="Title">{{ m.title }}</div>
            <div class="Text pre">{{ m.text }}</div>
          </template>

          <!-- USER -->
          <template v-else-if="m.kind === 'userText'">
            <div class="Text">{{ m.text }}</div>
          </template>

          <!-- LLM ANSWER (streaming) -->
          <template v-else-if="m.kind === 'llmAnswer'">
            <div v-if="m.title" class="Title">{{ m.title }}</div>
            <div class="Text pre">{{ m.text }}</div>

            <div v-if="m.suggestions?.length" class="BtnGrid mt8">
              <button
                v-for="opt in m.suggestions"
                :key="opt.label"
                type="button"
                class="ChoiceBtn"
                :disabled="isStreaming"
                @click="onChoice(opt)"
              >
                {{ opt.label }}
              </button>
            </div>
          </template>
        </div>
      </div>

      <div v-if="isStreaming" class="Hint">답변 생성 중…</div>
    </main>

    <footer class="InputBar">
      <input
        v-model="input"
        class="Input"
        type="text"
        :placeholder="
          inputMode === 'FREE'
            ? '질문을 입력하세요 (자유질문)'
            : inputMode === 'FOLLOWUP'
              ? '추가 정보를 입력하세요 (방금 답변 이어서)'
              : '버튼을 선택해주세요'
        "
        :disabled="inputMode === 'NONE' || isStreaming"
        @keydown.enter.prevent="send"
      />
      <button type="button" class="SendBtn" :disabled="!canSend" @click="send">전송</button>
      <button type="button" class="StopBtn" :disabled="!isStreaming" @click="abortStream">
        중지
      </button>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.ChatPage {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.Header {
  display: grid;
  grid-template-columns: rem(56px) 1fr rem(56px);
  align-items: center;
  height: rem(56px);
  padding: 0 rem(10px);
  background: #ffcc3c50;
  box-sizing: border-box;
}

.HeaderTitle {
  margin: 0;
  padding: 0;
  line-height: rem(56px);
  text-align: center;
  font-weight: var(--font-weight-extra-bold);
  font-size: rem(16px);
  align-self: center;
}

.HeaderBtn {
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  font-weight: var(--font-weight-extra-bold);
  font-size: rem(16px);
  line-height: 1;
  display: grid;
  place-items: center;
  height: rem(40px);
  width: rem(56px);
}

.HeaderBtn:disabled {
  opacity: 0.45;
  cursor: default;
  pointer-events: none;
}

.Body {
  flex: 1;
  overflow-y: auto;
  padding: rem(14px) rem(12px) rem(18px);
  background: #ffcc3c50;
}

.Row {
  display: flex;
  gap: rem(10px);
  margin: rem(10px) 0;
}

.Row.user {
  justify-content: flex-end;
}

.Avatar {
  width: rem(34px);
  height: rem(34px);
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--white);
  box-shadow: 0 rem(2px) rem(10px) rgba(0, 0, 0, 0.08);
  flex: 0 0 rem(34px);
}

.Bubble {
  max-width: 78%;
  background: var(--white);
  border-radius: rem(10px);
  padding: rem(12px) rem(12px);
  box-shadow: 0 rem(2px) rem(12px) rgba(0, 0, 0, 0.08);
}

.Title {
  font-weight: var(--font-weight-extra-bold);
  font-size: rem(14px);
  margin-bottom: rem(8px);
}

.Text {
  font-size: rem(14px);
  line-height: 1.35;
  white-space: pre-wrap;
  word-break: break-word;
}

.pre {
  white-space: pre-wrap;
}

.BtnGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: rem(10px);
}

.ChoiceBtn {
  width: 100%;
  min-height: rem(46px);
  padding: rem(6px) rem(8px);
  border: rem(1px) solid #ffcc3c80;
  border-radius: rem(12px);
  background: #ffcc3c35;
  font-weight: var(--font-weight-extra-bold);
  font-size: rem(14px);
  line-height: 1.2;

  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  white-space: normal;
  word-break: keep-all;
  overflow-wrap: anywhere;

  cursor: pointer;
  transition:
    transform 0.06s ease,
    filter 0.12s ease;
}

.ChoiceBtn:active {
  transform: translateY(1px);
}

.ChoiceBtn:hover:not(:disabled) {
  filter: brightness(0.98);
}

.ChoiceBtn:disabled {
  opacity: 0.55;
  cursor: default;
  pointer-events: none;
}

/* 화면이 좁으면 1열로 */
@media (max-width: rem(360px)) {
  .BtnGrid {
    grid-template-columns: 1fr;
  }
}

.InputBar {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: rem(8px);
  padding: rem(10px) rem(12px);
  background: #ffcc3c50;
}

.Input {
  height: rem(44px);
  border-radius: rem(12px);
  border: rem(1px) solid var(--signature-color);
  padding: 0 rem(12px);
  background: var(--white);
  font-size: rem(14px);
}

.SendBtn,
.StopBtn {
  height: rem(44px);
  padding: 0 rem(12px);
  border: 0;
  border-radius: rem(12px);
  font-weight: var(--font-weight-extra-bold);
  background: var(--white);
  box-shadow: inset 0 0 0 rem(1px) var(--signature-color);
}

.Hint {
  margin-top: rem(8px);
  font-size: rem(12px);
  opacity: 0.65;
  text-align: center;
}

.mt8 {
  margin-top: rem(8px);
}
</style>
