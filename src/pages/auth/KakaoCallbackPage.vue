<script>
let isGlobalProcessing = false
</script>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { loginWithKakaoCode } from '@/api/authApi'
import {
  saveTokens,
  saveProviderId,
  getPostLoginRedirect,
  clearPostLoginRedirect,
} from '@/stores/tokenStorage'

import { useNotificationStore } from '@/stores/notificationStore'

const router = useRouter()
const route = useRoute()
const notificationStore = useNotificationStore()

const handleLogin = async () => {
  const code = route.query.code

  // 코드 없으면 복귀
  if (!code) {
    router.replace({ name: 'login' })
    return
  }

  // 이미 처리 중이면 절대 실행하지 않음 (이중 방어)
  if (isGlobalProcessing) {
    console.log('중복 요청 방지: 이미 로그인 처리 중입니다.')
    return
  }

  // 락 걸기
  isGlobalProcessing = true

  try {
    console.log('카카오 로그인 요청 시작... code:', code.substring(0, 10) + '...')
    const res = await loginWithKakaoCode(code)

    // [CASE 1] 신규 회원 -> 회원가입 페이지
    if (res.status === 'NEED_SIGNUP') {
      if (res.providerId) {
        saveProviderId(res.providerId)
      }
      router.replace({
        name: 'signup',
        // 향후 백엔드에서 tempNickname 등을 내려줄 경우를 대비해 남겨둠
        query: { tempNickname: res.tempNickname || '' },
      })
      return
    }

    // [CASE 2] 기존 회원 -> 로그인 성공
    if (res.status === 'LOGIN_SUCCESS') {
      if (res.accessToken) {
        // refreshToken 은 선택값이므로 있어도 되고 없어도 됨
        saveTokens(res.accessToken, res.refreshToken)
      }

      notificationStore.connect(true)

      const storedRedirect = getPostLoginRedirect()
      const redirectTarget = storedRedirect && storedRedirect.startsWith('/') ? storedRedirect : '/'
      clearPostLoginRedirect()
      router.replace(redirectTarget)
      return
    }

    // 그 외 상태
    router.replace({ name: 'login' })
  } catch (e) {
    console.error('Kakao login failed', e)
    // 500 에러가 나더라도, 혹시 첫 번째 요청이 성공했을 수도 있으니
    // 무조건 튕기기보다는 개발 중엔 alert로 확인하는 게 좋습니다.
    // alert("로그인 처리 중 에러 발생: " + e.message)
    router.replace({ name: 'login' })
  } finally {
    // 페이지가 이동되므로 굳이 false로 돌릴 필요는 없으나,
    // 만약 이동 실패를 대비해 안전장치로 5초 뒤에만 풉니다.
    setTimeout(() => {
      isGlobalProcessing = false
    }, 5000)
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
