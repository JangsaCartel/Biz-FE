const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const REGISTER_TOKEN_KEY = 'registerToken'
const PROVIDER_ID_KEY = 'providerId'
const POST_LOGIN_REDIRECT_KEY = 'postLoginRedirect'

export function saveTokens(accessToken, refreshToken) {
  if (accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  }
  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

export function getAccessToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function clearTokens() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function saveRegisterToken(token) {
  if (token) {
    window.sessionStorage.setItem(REGISTER_TOKEN_KEY, token)
  }
}

export function getRegisterToken() {
  return window.sessionStorage.getItem(REGISTER_TOKEN_KEY)
}

export function clearRegisterToken() {
  window.sessionStorage.removeItem(REGISTER_TOKEN_KEY)
}

// 신규 회원가입 플로우에서 사용할 providerId 저장
export function saveProviderId(providerId) {
  if (typeof providerId === 'string' && providerId.length > 0) {
    window.sessionStorage.setItem(PROVIDER_ID_KEY, providerId)
  }
}

export function getProviderId() {
  return window.sessionStorage.getItem(PROVIDER_ID_KEY)
}

export function clearProviderId() {
  window.sessionStorage.removeItem(PROVIDER_ID_KEY)
}

export function savePostLoginRedirect(path) {
  if (typeof path === 'string') {
    window.sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, path)
  }
}

export function getPostLoginRedirect() {
  return window.sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY)
}

export function clearPostLoginRedirect() {
  window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY)
}
