import axios from 'axios'
import router from '@/router'

import { useNotificationStore } from '@/stores/notificationStore'

// 개발 환경에서는 Vite 프록시(`/biz-be` → `http://localhost:8080`)를 통해 CORS 없이 호출
// 배포 환경에서는 VITE_API_BASE_URL에 실제 백엔드 주소를 넣어서 사용
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/biz-be'

// dev: 프록시 사용
// prod: 반드시 VITE_API_BASE_URL 필요
// 로컬: vite proxy가 /biz-be -> http://localhost:8080
// 배포: vercel rewrite가 /biz-be -> http://13.158.142.74:8080
const API_BASE_URL = '/biz-be'

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is required in production')
}

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 토큰 저장소 키
const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

// 요청 인터셉터: sessionStorage에서 accessToken을 가져와 Authorization 헤더에 추가
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = window.sessionStorage.getItem(ACCESS_TOKEN_KEY)
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 응답 인터셉터: 401 발생 시 토큰 갱신 시도
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // 401 에러이고, 아직 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 대기열에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = window.sessionStorage.getItem(REFRESH_TOKEN_KEY)

      if (!refreshToken) {
        // refreshToken이 없으면 로그아웃 처리
        handleLogout()
        return Promise.reject(error)
      }

      try {
        // 토큰 갱신 요청
        const response = await axios.post(
          `${API_BASE_URL}/api/users/refresh`,
          { refreshToken },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data

        if (newAccessToken) {
          // 새 토큰 저장
          window.sessionStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken)
          if (newRefreshToken) {
            window.sessionStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken)
          }

          // 대기 중인 요청들 처리
          processQueue(null, newAccessToken)

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return apiClient(originalRequest)
        } else {
          throw new Error('토큰 갱신 실패: 새 토큰이 없습니다.')
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        processQueue(refreshError, null)
        handleLogout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

// 로그아웃 처리 함수
function handleLogout() {
  const notificationStore = useNotificationStore()
  notificationStore.disconnect()
  notificationStore.clearLocal()

  // sessionStorage 비우기
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  window.sessionStorage.removeItem(REFRESH_TOKEN_KEY)

  // 로그인 페이지로 이동
  router.push({ name: 'login' })
}

export default apiClient
