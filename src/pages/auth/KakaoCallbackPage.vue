<script setup>
import { onMounted } from 'vue'
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

const handleLogin = async () => {
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
    router.replace({ name: 'login' })
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


