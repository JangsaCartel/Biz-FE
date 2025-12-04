<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BizIcon from '@/assets/icons/logo/logo-app-icon.png'
import { getAccessToken, savePostLoginRedirect } from '@/services/tokenStorage'

const router = useRouter()
const route = useRoute()

const kakaoClientId = import.meta.env.VITE_KAKAO_REST_API_KEY
const kakaoRedirectUri =
  import.meta.env.VITE_KAKAO_REDIRECT_URI ||
  `${window.location.origin}/auth/kakao/callback`

const kakaoAuthUrl = computed(() => {
  const base = 'https://kauth.kakao.com/oauth/authorize'
  const params = new URLSearchParams({
    client_id: kakaoClientId || '',
    redirect_uri: kakaoRedirectUri,
    response_type: 'code',
  })
  return `${base}?${params.toString()}`
})

const redirectTarget = computed(() => {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/')) {
    return redirect
  }
  return '/'
})

const handleLoginRedirect = (provider) => {
  if (provider !== 'kakao') {
    alert(`${provider} 로그인은 준비 중입니다.`)
    return
  }

  savePostLoginRedirect(redirectTarget.value)
  window.location.href = kakaoAuthUrl.value
}

onMounted(() => {
  if (getAccessToken()) {
    router.replace(redirectTarget.value)
  }
})
</script>

<template>
  <section class="login-hero">
    <div class="login-card">
      <img :src="BizIcon" alt="Biz 로고" class="hero-logo" />
      <p class="hero-title">장사 뭐하니?</p>

      <div class="button-stack">
        <button class="login-button" @click="handleLoginRedirect('google')">Google 로그인</button>
        <button class="login-button kakao" @click="handleLoginRedirect('kakao')">Kakao 로그인</button>
        <button class="login-button" @click="handleLoginRedirect('naver')">Naver 로그인</button>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/utils/_pxToRem.scss' as *;

.login-hero {
  width: 100%;
  max-width: rem(430px);
  background: linear-gradient(180deg, #ffe789 0%, #fcd266 100%);
  border-radius: rem(32px);
  padding: rem(48px) rem(24px) rem(64px);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}

.login-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: rem(24px);
}

.hero-logo {
  width: rem(138px);
  height: rem(138px);
  border-radius: rem(30px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.hero-title {
  font-size: rem(24px);
  font-weight: var(--font-weight-bold);
  color: #000;
}

.button-stack {
  margin-top: rem(12px);
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: rem(12px);
}

.login-button {
  width: 100%;
  padding: rem(14px);
  border: none;
  border-radius: rem(30px);
  font-size: rem(16px);
  font-weight: var(--font-weight-medium);
  background-color: #dedede;
  color: #000;
  cursor: pointer;
}

.login-button.kakao {
  background-color: #ffe812;
}
</style>


