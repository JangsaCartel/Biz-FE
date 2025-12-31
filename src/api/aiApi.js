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

      while (true) {
        // \n\n 또는 \r\n\r\n 둘 다 처리
        const idxLF = buffer.indexOf('\n\n')
        const idxCRLF = buffer.indexOf('\r\n\r\n')

        let idx = -1
        let sepLen = 0

        if (idxCRLF !== -1 && (idxLF === -1 || idxCRLF < idxLF)) {
          idx = idxCRLF
          sepLen = 4
        } else if (idxLF !== -1) {
          idx = idxLF
          sepLen = 2
        } else {
          break
        }

        const rawEvent = buffer.slice(0, idx)
        buffer = buffer.slice(idx + sepLen)

        // 라인 split도 \r?\n 처리
        const lines = rawEvent.split(/\r?\n/)

        // SSE는 data: 가 여러 줄일 수 있음 → 누적
        const dataLines = lines
          .filter((l) => l.startsWith('data:'))
          .map((l) => l.replace(/^data:\s*/, ''))

        if (!dataLines.length) continue

        const jsonStr = dataLines.join('\n').trim()
        if (!jsonStr) continue

        let evt
        try {
          evt = JSON.parse(jsonStr)
        } catch {
          continue
        }

        if (evt.error) {
          // evt.error = { code, message } 형태 가정
          const msg = evt.error?.message || '요청 중 오류가 발생했어요.'
          const err = new Error(msg)
          err.code = evt.error?.code
          if (onError) onError(err)
          if (evt.done && onDone) onDone(evt)
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
 * 구조화 답변 스트리밍 (ANSWER_LLM)
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
 * 자유질문 스트리밍 (LLM_MODE)
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
