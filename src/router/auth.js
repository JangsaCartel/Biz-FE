import LoginPage from '@/pages/auth/LoginPage.vue'
import KakaoCallbackPage from '@/pages/auth/KakaoCallbackPage.vue'
import SignupPage from '@/pages/auth/SignupPage.vue'

export default [
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
  },
  {
    path: '/auth/kakao/callback',
    name: 'kakaoCallback',
    component: KakaoCallbackPage,
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignupPage,
  },
]
