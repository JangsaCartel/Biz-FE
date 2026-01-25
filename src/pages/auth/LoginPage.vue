<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BizIcon from '@/assets/icons/logo/logo-app-icon.png'
import MainBg from '@/assets/images/backgrounds/main-bg.jpg'
import { getAccessToken, savePostLoginRedirect } from '@/stores/tokenStorage'
import ModalDialog from '@/components/common/ModalDialog.vue'

const router = useRouter()
const route = useRoute()

const kakaoClientId = import.meta.env.VITE_KAKAO_REST_API_KEY
const kakaoRedirectUri =
  import.meta.env.VITE_KAKAO_REDIRECT_URI || `${window.location.origin}/auth/kakao/callback`

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

const modalMessage = ref('')
const isModalVisible = ref(false)

const showModal = (message) => {
  modalMessage.value = message
  isModalVisible.value = true
}

const closeModal = () => {
  isModalVisible.value = false
  modalMessage.value = ''
}

const handleLoginRedirect = (provider) => {
  if (provider !== 'kakao') {
    showModal(`${provider} 로그인은 준비 중입니다.`)
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
    <div class="login-bg" :style="{ backgroundImage: `url(${MainBg})` }"></div>

    <div class="login-card fixed-top">
      <img :src="BizIcon" alt="Biz 로고" class="hero-logo" />
      <p class="hero-title">장사 뭐하니?</p>
    </div>

    <div class="button-stack fixed-bottom">
      <button class="login-button kakao" @click="handleLoginRedirect('kakao')">Kakao 로그인</button>
    </div>

    <ModalDialog :message="modalMessage" :is-visible="isModalVisible" @close="closeModal" />
  </section>
</template>

<style scoped lang="scss">
.login-hero {
  margin: rem(-24px);
  width: calc(100% + #{rem(48px)});
  min-height: calc(100vh + #{rem(48px)});
  background-color: transparent;
  position: relative;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  opacity: 0.4;
  filter: blur(5px);
  z-index: 0;
  pointer-events: none;
}

.login-card.fixed-top {
  position: fixed;
  top: rem(200px);
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: rem(24px);
  z-index: 10;
  pointer-events: none;
}

.hero-logo {
  width: rem(138px);
  height: rem(138px);
  border-radius: rem(30px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
}

.hero-title {
  font-size: rem(24px);
  font-weight: var(--font-weight-bold);
  color: #000;
}

.button-stack.fixed-bottom {
  position: fixed;
  bottom: rem(238px);
  left: 0;
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 0 rem(24px);
  box-sizing: border-box;
  gap: rem(12px);
  z-index: 10;
}

.login-button {
  width: 100%;
  max-width: rem(360px);

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
  background-color: #fee500;
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}
</style>
