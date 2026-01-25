<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'

const router = useRouter()
const notificationStore = useNotificationStore()

const hasUnread = computed(() => notificationStore.unreadCount > 0)

const onAlarmClick = () => {
  router.push({ name: 'notifications' })
}

const onProfileClick = () => {
  router.push({ name: 'mypage' })
}
</script>

<template>
  <div class="header-wrap">
    <div class="header-layout">
      <router-link to="/" class="header-logo">
        <img src="@/assets/icons/logo/logo.png" alt="Biz 로고" class="logo-image" />
      </router-link>

      <div class="header-icons">
        <button class="icon-button alarm-button" @click="onAlarmClick" aria-label="알림">
          <img src="@/assets/icons/alarm/alarm.png" alt="알림" class="icon-image" />
          <span v-if="hasUnread" class="alarm-dot" />
        </button>
        <button class="icon-button" @click="onProfileClick">
          <img src="@/assets/icons/profile/profile.png" alt="프로필" class="icon-image" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.header-wrap {
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

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: rem(4px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.alarm-button {
  position: relative;
}

.alarm-dot {
  position: absolute;
  top: rem(2px);
  right: rem(2px);
  width: rem(8px);
  height: rem(8px);
  border-radius: 50%;
  background: #ff3b30;
}

.icon-image {
  width: rem(24px);
  height: rem(24px);
}
</style>
