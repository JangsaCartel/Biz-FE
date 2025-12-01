<script setup>
import { onMounted, ref } from 'vue' // ref 추가 필수
import { useRouter, useRoute } from 'vue-router'
import { loginWithKakaoCode } from '@/services/authApi'
import {
  saveTokens,
  saveRegisterToken,
  getPostLoginRedirect,
  clearPostLoginRedirect,
} from '@/services/tokenStorage'

const router = useRouter()
const route = useRoute()

// 중복 요청 방지 플래그
const isProcessing = ref(false)

const handleLogin = async () => {
  // 1. 이미 처리 중이라면 함수 종료 (중복 실행 방지)
  if (isProcessing.value) return
  isProcessing.value = true

  const code = route.query.code

  if (!code) {
    router.replace({ name: 'login' })
    return
  }

  try {
    const res = await loginWithKakaoCode(code)

    // [CASE 1] 신규 회원 -> 회원가입 페이지로 이동
    if (res.status === 'NEED_SIGNUP') {
      if (res.registerToken) {
        saveRegisterToken(res.registerToken)
      }
      router.replace({
        name: 'signup',
        query: {
          tempNickname: res.tempNickname || '',
        },
      })
      return
    }

    // [CASE 2] 기존 회원 -> 로그인 성공 -> 홈으로 이동
    if (res.status === 'LOGIN_SUCCESS') {
      if (res.accessToken && res.refreshToken) {
        saveTokens(res.accessToken, res.refreshToken)
      }
      const storedRedirect = getPostLoginRedirect()
      const redirectTarget = storedRedirect && storedRedirect.startsWith('/') ? storedRedirect : '/'
      clearPostLoginRedirect()
      router.replace(redirectTarget)
      return
    }

    // 예외 상황
    router.replace({ name: 'login' })
  } catch (e) {
    console.error('Kakao login failed', e)
    alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
    router.replace({ name: 'login' })
  } finally {
    // 처리가 끝나면 락 해제 (필요한 경우)
    // isProcessing.value = false
    // 여기서는 페이지가 이동되므로 굳이 false로 돌릴 필요 없음
  }
}

onMounted(() => {
  handleLogin()
})
</script>

<template>
  <div class="callback-wrap">
    <p class="callback-text">카카오 로그인 처리 중입니다...</p>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/utils/_pxToRem.scss' as *;

.callback-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: rem(300px);
}

.callback-text {
  font-size: rem(16px);
  color: var(--text-subtitle);
}
</style>
