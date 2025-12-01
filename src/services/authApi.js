// 개발 환경에서는 Vite 프록시(`/biz-be` → `http://localhost:8080`)를 통해 CORS 없이 호출
// 배포 환경에서는 VITE_API_BASE_URL에 실제 백엔드 주소를 넣어서 사용
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/biz-be'

export async function loginWithKakaoCode(code) {
  const url = `${API_BASE_URL}/api/auth/login/kakao?code=${encodeURIComponent(code)}`

  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`Kakao login failed: ${res.status}`)
  }

  return await res.json()
}

export async function signupWithExtraInfo(body, registerToken) {
  const url = `${API_BASE_URL}/api/auth/signup`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Register-Token': registerToken,
    },
    body: JSON.stringify(body),
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`Signup failed: ${res.status}`)
  }

  return await res.json()
}
