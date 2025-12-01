<script setup>
import { onMounted, ref } from 'vue'
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

const isProcessing = ref(false) // 플래그 추가

const handleLogin = async () => {
  if (isProcessing.value) return // 이미 처리 중이면 중단
  isProcessing.value = true // 처리 시작

  const code = route.query.code

  if (!code) {
    router.replace({ name: 'login' })
    return
  }

  try {
    const res = await loginWithKakaoCode(code)

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

    router.replace({ name: 'login' })
  } catch (e) {
    console.error('Kakao login failed', e)
    alert('에러 발생! 콘솔을 확인하세요: ' + e.message) // 튕기지 말고 경고창 띄움
    // router.replace({ name: 'login' }) // 잠시 주석 처리
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
