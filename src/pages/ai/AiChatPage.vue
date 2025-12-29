<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { fetchChatNode, streamChatLlm, streamChatAnswer } from '@/api/aiApi'

const router = useRouter()

const scrollEl = ref(null)
const messages = ref([])
const input = ref('')

const llmMode = ref(false)
const isStreaming = ref(false)
const abortCtrl = ref(null)

const currentNodeId = ref(null)

const followUpMode = ref(false)
const lastAnswerContext = ref(null) // { title, promptKey, trailSnapshot, answerText }

// ✅ 사용자가 버튼으로 선택한 의도 트레일 (LLM에 그대로 전달)
const trail = ref([]) // [{ from, label, to }]

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
  router.back()
}

// ===== Node API =====
async function fetchNode(nodeId) {
  return await fetchChatNode(nodeId)
}

function stopStream() {
  if (abortCtrl.value) {
    abortCtrl.value.abort()
    abortCtrl.value = null
  }
  isStreaming.value = false
}

async function _streamIntoMessage(payload, answerMsg) {
  isStreaming.value = true
  abortCtrl.value = new AbortController()

  let firstDelta = true

  await streamChatAnswer(
    payload,
    {
      onDelta(delta) {
        if (firstDelta) {
          // 첫 토큰 들어오면 placeholder 제거
          if ((answerMsg.text || '').startsWith('답변 생성 중')) {
            answerMsg.text = ''
          }
          firstDelta = false
        }

        answerMsg.text += delta
        scrollToBottom()
      },
      onDone() {},
      onError(err) {
        if (err?.name === 'AbortError') return
        answerMsg.text = answerMsg.text || '요청 중 오류가 발생했어요.'
      },
    },
    abortCtrl.value.signal,
  )

  stopStream()
  await scrollToBottom()
}

// node.type에 따라 메시지 추가
async function renderNode(node) {
  llmMode.value = node.type === 'LLM_MODE'
  currentNodeId.value = node.nodeId || currentNodeId.value

  if (node.type === 'CHOICE') {
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

  // ✅ 핵심: ANSWER_LLM (버튼 의도 기반 최종 답변 생성)
  if (node.type === 'ANSWER_LLM') {
    // 답변 박스 생성 후, 자동 스트리밍으로 채움
    const answerMsg = {
      id: uid(),
      role: 'bot',
      kind: 'llmAnswer',
      text: '답변 생성 중...\n',
      suggestions: [],
      title: node.title || null,
    }
    messages.value.push(answerMsg)
    await scrollToBottom()

    // Biz-AI로 보낼 payload (의도 트레일 + promptKey)
    const payload = {
      promptKey: node.promptKey || 'UNKNOWN',
      title: node.title || '',
      trail: trail.value,
      slots: node.slots || [],
      slotValues: {},
    }

    await _streamIntoMessage(payload, answerMsg)

    // ✅ 버튼 기반 답변 뒤에는 "후속 질문" 허용
    followUpMode.value = true
    lastAnswerContext.value = {
      title: node.title || '',
      promptKey: node.promptKey || 'UNKNOWN',
      trailSnapshot: [...trail.value],
      answerText: answerMsg.text || '',
    }

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
  llmMode.value = false
  followUpMode.value = false
  lastAnswerContext.value = null
  input.value = ''
  trail.value = []
  await moveTo('ROOT')
}

// ===== Choice click =====
async function onChoice(opt) {
  if (isStreaming.value) return

  // ✅ "메뉴로"는 trail 쌓지 말고 완전 리셋
  if (opt?.next === 'ROOT' && opt?.label === '메뉴로') {
    await resetToRoot()
    return
  }

  messages.value.push({ id: uid(), role: 'user', kind: 'userText', text: opt.label })
  await scrollToBottom()

  trail.value.push({ from: currentNodeId.value, label: opt.label, to: opt.next || null })

  if (opt.next) await moveTo(opt.next)
}

// ===== LLM stream (free 질문) =====
const canSend = computed(
  () =>
    (llmMode.value || followUpMode.value) && input.value.trim().length > 0 && !isStreaming.value,
)

async function sendLlm() {
  const text = input.value.trim()
  if (!text || isStreaming.value) return
  if (!llmMode.value && !followUpMode.value) return

  input.value = ''
  messages.value.push({ id: uid(), role: 'user', kind: 'userText', text })

  const answerMsg = { id: uid(), role: 'bot', kind: 'llmAnswer', text: '', suggestions: [] }
  messages.value.push(answerMsg)
  await scrollToBottom()

  isStreaming.value = true
  abortCtrl.value = new AbortController()

  // ✅ 후속 질문이면 컨텍스트 포함
  let sendText = text
  if (!llmMode.value && followUpMode.value && lastAnswerContext.value) {
    const ctx = lastAnswerContext.value
    sendText =
      `이전 주제: ${ctx.title} (promptKey=${ctx.promptKey})\n` +
      `버튼 선택 흐름:\n` +
      `${(ctx.trailSnapshot || []).map((t, i) => `${i + 1}. ${t.label}`).join('\n')}\n\n` +
      `이전 답변:\n${ctx.answerText}\n\n` +
      `추가 질문: ${text}`
  }

  await streamChatLlm(
    { text: sendText },
    {
      onDelta(delta) {
        answerMsg.text += delta
        scrollToBottom()
      },
      onDone(evt) {
        if (evt.suggestions?.length) answerMsg.suggestions = evt.suggestions
      },
      onError(err) {
        if (err?.name === 'AbortError') return
        answerMsg.text = answerMsg.text || '요청 중 오류가 발생했어요.'
      },
    },
    abortCtrl.value.signal,
  )

  // ✅ 답변 뒤 공통 버튼
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

  stopStream()
  await scrollToBottom()
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
      <button type="button" class="HeaderBtn" @click="resetToRoot">메뉴</button>
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
        placeholder="질문을 입력하세요 (그 외 질문에서 사용)"
        :disabled="!llmMode || isStreaming"
        @keydown.enter.prevent="sendLlm"
      />
      <button type="button" class="SendBtn" :disabled="!canSend" @click="sendLlm">전송</button>
      <button type="button" class="StopBtn" :disabled="!isStreaming" @click="stopStream">
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
  background: #ffcc3c80;
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

.Body {
  flex: 1;
  overflow-y: auto;
  padding: rem(14px) rem(12px) rem(18px);
  background: #ffcc3c80;
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
  cursor: not-allowed;
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
  background: #ffcc3c80;
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
