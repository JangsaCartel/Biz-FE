<script setup>
import { useRouter } from 'vue-router'
import {
  clearTokens,
  clearRegisterToken,
  clearProviderId,
  clearPostLoginRedirect,
} from '@/stores/tokenStorage'

const router = useRouter()

const onAlarmClick = () => {
  alert('알림 클릭!')
}

const onProfileClick = () => {
  router.push({ name: 'mypage' })
}

const onLogoutClick = () => {
  clearTokens()
  clearRegisterToken()
  clearProviderId()
  clearPostLoginRedirect()
  router.replace({ name: 'login' })
}
</script>

<template>
  <div class="header-wrap">
    <div class="header-layout">
      <router-link to="/" class="header-logo">
        <img src="@/assets/icons/logo/logo.png" alt="Biz 로고" class="logo-image" />
      </router-link>

      <div class="header-icons">
        <!-- 임시 로그아웃 버튼 (프로필 페이지 완성 후 제거 예정) -->
        <button class="logout-button" @click="onLogoutClick">로그아웃</button>
        <!-- TODO: 추후 로그인 상태에 따라 다른 UI(로그인/마이페이지 등)로 변경 -->
        <button class="icon-button" @click="onAlarmClick">
          <img src="@/assets/icons/alarm/alarm.png" alt="알림" class="icon-image" />
        </button>
        <button class="icon-button" @click="onProfileClick">
          <img src="@/assets/icons/profile/profile.png" alt="프로필" class="icon-image" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/utils/_pxToRem.scss' as *;

.header-wrap {
  // position: fixed;
  // top: 0;
  // left: 0;
  // z-index: 100;
  width: 100%;
  display: flex;
  justify-content: center;
}

.header-layout {
  width: 100%;
  max-width: rem(430px);
  height: rem(56px);
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 rem(16px);
  position: relative;
  color: var(--white);

  background-image: url('@/assets/images/backgrounds/main-bg.jpg');
  background-size: cover;
  background-position: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--signature-color);
    opacity: 1; // 헤더 배경 투명도 기존 0.85에서 1로 변경
    z-index: -1;
  }
}

.header-logo {
  height: 100%;
  display: flex;
  align-items: center;
}

.logo-image {
  height: rem(36px);
  width: auto;
}

.header-icons {
  display: flex;
  align-items: center;
  gap: rem(12px);
}

.logout-button {
  padding: rem(4px) rem(8px);
  border-radius: rem(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: transparent;
  color: #fff;
  font-size: rem(12px);
  cursor: pointer;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: rem(4px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-image {
  width: rem(24px);
  height: rem(24px);
}
</style>
