<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import HotIcon from '@/assets/icons/hot/hot.png'
import MapIcon from '@/assets/icons/map/map.png'
import HomeIcon from '@/assets/icons/home/home.png'
import AiIcon from '@/assets/icons/ai/ai.png'
import PolicyIcon from '@/assets/icons/policy/policy.png'

const route = useRoute()

// 네비게이션 메뉴 배열
const navMenus = [
  {
    path: '/hot',
    icon: HotIcon,
    alt: 'HOT',
    text: 'HOT',
  },
  {
    path: '/map',
    icon: MapIcon,
    alt: '지도',
    text: '지도',
  },
  {
    path: '/',
    icon: HomeIcon,
    alt: '홈',
    text: '홈',
  },
  {
    path: '/ai',
    icon: AiIcon,
    alt: '분석',
    text: '분석',
  },
  {
    path: '/policy',
    icon: PolicyIcon,
    alt: '정책',
    text: '정책',
  },
]

// 현재 경로와 비교하여 활성 메뉴 결정
const isActive = computed(() => (menu) => {
  if (menu.path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(menu.path)
})
</script>

<template>
  <div class="nav-wrap">
    <div class="navbar">
      <div class="nav-box">
        <router-link
          v-for="menu in navMenus"
          :key="menu.path"
          :to="menu.path"
          class="icon-box"
          :class="{ active: isActive(menu) }"
        >
          <img :src="menu.icon" :alt="menu.alt" class="icon-image" />
          <span class="nav-text">{{ menu.text }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/utils/_pxToRem.scss' as *;

.nav-wrap {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 100;
  width: 100%;
  display: flex;
  justify-content: center;
}

.navbar {
  width: 100%;
  max-width: rem(430px);
  height: rem(70px);
  display: flex;
  justify-content: center;
  z-index: 100;
  background-color: var(--nav-bg);
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.05);
}

.nav-box {
  width: 90%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align: items-center;
}

.icon-box {
  display: flex;
  flex-direction: column; /* 세로 정렬 */
  justify-content: center; /* 수직 중앙 정렬 */
  align-items: center; /* 수평 중앙 정렬 */

  width: rem(60px);
  height: 100%;

  text-decoration: none;
  border-radius: rem(8px);
  transition: all 0.2s ease-in-out;

  /* 비활성 시 배경/텍스트색 (기본값) */
  background-color: transparent;
  color: var(--text-subtitle); /* (파란색 방지) */
  font-weight: var(--font-weight-medium);

  /* 활성 시 배경/텍스트색 */
  &.active {
    background-color: var(--nav-button-active);
    color: var(--signature-color);
    font-weight: var(--font-weight-bold);
  }
}

.icon-image {
  width: rem(28px);
  height: rem(28px);
  margin-top: rem(8px);
  transition: transform 0.2s ease-in-out;
}

/* nav-text 스타일 */
.nav-text {
  font-size: rem(12px);
  margin-top: rem(4px);
  color: #000;
}

.icon-box.active .icon-image {
  /* 활성 시 아이콘 약간 확대 */
  transform: scale(1.1);
}
</style>
