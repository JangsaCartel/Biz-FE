import apiClient from '@/api/apiClient'

export async function loginWithKakaoCode(code) {
  const { data } = await apiClient.get('/auth/login/kakao', {
    params: { code },
  })
  return data
}

export async function signupWithExtraInfo(payload, providerId) {
  const { data } = await apiClient.post('/auth/signup', payload, {
    params: { providerId },
  })
  return data
}
