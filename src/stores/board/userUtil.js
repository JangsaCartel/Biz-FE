import { getAccessToken } from '@/stores/tokenStorage'

/**
 * JWT 액세스 토큰을 디코딩하여 페이로드(payload)를 반환
 * @returns {object | null} 디코딩된 토큰의 페이로드 또는 토큰이 없는 경우 null
 */
function decodeJwtPayload() {
  const token = getAccessToken()
  if (!token) {
    return null
  }

  try {
    const payloadBase64 = token.split('.')[1]
    const decodedJson = atob(payloadBase64)
    return JSON.parse(decodedJson)
  } catch (error) {
    console.error('Failed to decode JWT or parse payload:', error)
    return null
  }
}

/**
 * 현재 로그인된 사용자의 ID를 토큰에서 추출하여 반환
 * @returns {number | null} 사용자 ID 또는 ID를 찾을 수 없는 경우 null
 */
export function getCurrentUserIdFromToken() {
  const payload = decodeJwtPayload()
  return payload?.userId || null
}
