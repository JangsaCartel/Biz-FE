import apiClient from '@/api/apiClient'

function _getApiOrigin() {
  const baseURL = apiClient?.defaults?.baseURL || ''
  if (baseURL.endsWith('/api')) return baseURL.slice(0, -4)
  if (baseURL.endsWith('/api/')) return baseURL.slice(0, -5)

  return baseURL
}

/** =========================
 *  REST (axios) - policyApi 스타일
 *  ========================= */

export async function fetchMyNotifications({ page = 1, size = 20 } = {}) {
  const params = { page, size }
  const res = await apiClient.get('/notifications', { params })
  return res.data
}

export async function fetchUnreadCount() {
  const res = await apiClient.get('/notifications/unread-count')
  return res.data
}

export async function markNotificationRead(notificationId) {
  if (notificationId == null) throw new Error('notificationId is required')
  const res = await apiClient.post(`/notifications/${notificationId}/read`)
  return res.data
}

export async function deleteReadNotifications() {
  const res = await apiClient.delete('/notifications/read')
  return res.data
}

/** =========================
 *  SSE (fetch) - 스트림은 fetch로 유지
 *  ========================= */

export function streamNotifications(handlers = {}) {
  const { onEvent, onError } = handlers
  const controller = new AbortController()

  ;(async () => {
    try {
      const token = window.sessionStorage.getItem('accessToken')

      const origin = _getApiOrigin()
      const url = `${origin}/api/notifications/stream`

      const headers = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include',
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        const msg = await res.text().catch(() => '')
        throw new Error(msg || `HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) {
          throw new Error('SSE connection closed')
        }

        buffer += decoder.decode(value, { stream: true })

        while (true) {
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

          const lines = rawEvent.split(/\r?\n/)
          const eventLine = lines.find((l) => l.startsWith('event:'))
          const dataLines = lines
            .filter((l) => l.startsWith('data:'))
            .map((l) => l.replace(/^data:\s*/, ''))

          if (!dataLines.length) continue

          const eventName = eventLine ? eventLine.replace('event:', '').trim() : 'message'

          const jsonStr = dataLines.join('\n').trim()
          if (!jsonStr) continue

          let payload
          try {
            payload = JSON.parse(jsonStr)
          } catch {
            continue
          }

          onEvent?.({ event: eventName, data: payload })
        }
      }
    } catch (e) {
      if (!controller.signal.aborted) onError?.(e)
    }
  })()

  return {
    close: () => controller.abort(),
  }
}
