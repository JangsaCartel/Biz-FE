import apiClient from '@/api/apiClient'

export async function fetchWeeklyAiAnalysis({ week, limit, topK }) {
  const { data } = await apiClient.get('/ai/analysis/weekly', {
    params: { week, limit, topK },
  })
  return data
}

// =====================
// Chat Nodes (BE 프록시 경유)
// =====================
export async function fetchChatNode(nodeId) {
  const { data } = await apiClient.get('/ai/chat/node', { params: { nodeId } })
  return data
}

export async function fetchChatTree() {
  const { data } = await apiClient.get('/ai/chat/tree')
  return data
}

export async function refreshChatNodes() {
  const { data } = await apiClient.post('/ai/chat/nodes/refresh')
  return data
}

// =====================
// Streaming helpers
// =====================
function _normalizeBaseURL(baseURL) {
  if (!baseURL) return ''
  return baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL
}

// 네 프로젝트에서 ACCESS_TOKEN_KEY가 이미 있으면 그걸 import해서 쓰면 되고,
// 지금 파일 단독으로 완결되게 하려면 아래처럼 상수로 둬.
const ACCESS_TOKEN_KEY = 'accessToken'

function _extractAuthHeader() {
  const accessToken = window.sessionStorage.getItem(ACCESS_TOKEN_KEY)
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
}

/**
 * 공용 SSE 파서 (data: JSON\n\n 포맷)
 */
async function _consumeSse(res, handlers = {}) {
  const { onDelta, onDone, onError } = handlers

  try {
    if (!res.ok || !res.body) {
      const msg = await res.text().catch(() => '')
      throw new Error(msg || `HTTP ${res.status}`)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      let idx
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const rawEvent = buffer.slice(0, idx)
        buffer = buffer.slice(idx + 2)

        const dataLine = rawEvent.split('\n').find((l) => l.startsWith('data:'))
        if (!dataLine) continue

        const jsonStr = dataLine.replace(/^data:\s*/, '').trim()
        if (!jsonStr) continue

        let evt
        try {
          evt = JSON.parse(jsonStr)
        } catch {
          continue
        }

        if (evt.delta && onDelta) onDelta(evt.delta)
        if (evt.done && onDone) onDone(evt)
      }
    }
  } catch (e) {
    if (onError) onError(e)
    else throw e
  }
}

/**
 * ✅ 구조화 답변 스트리밍 (ANSWER_LLM)
 * POST /ai/chat/answer/stream
 */
export async function streamChatAnswer(payload, handlers = {}, signal) {
  const baseURL = _normalizeBaseURL(apiClient?.defaults?.baseURL)
  const url = `${baseURL}/ai/chat/answer/stream`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ..._extractAuthHeader(),
    },
    credentials: 'include',
    signal,
    body: JSON.stringify(payload),
  })

  await _consumeSse(res, handlers)
}

/**
 * ✅ 자유질문 스트리밍 (LLM_MODE)
 * POST /ai/chat/llm/stream
 */
export async function streamChatLlm(payload, handlers = {}, signal) {
  const baseURL = _normalizeBaseURL(apiClient?.defaults?.baseURL)
  const url = `${baseURL}/ai/chat/llm/stream`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ..._extractAuthHeader(),
    },
    credentials: 'include',
    signal,
    body: JSON.stringify(payload),
  })

  await _consumeSse(res, handlers)
}
