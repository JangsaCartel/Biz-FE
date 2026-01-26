<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// 헤더, 네비바 가져오기
import Header from '@/components/layouts/AppHeader.vue'
import Navbar from '@/components/layouts/AppNavbar.vue'

const route = useRoute()

// 헤더/네비바 표시 여부 결정

// (임시) 헤더를 숨길 페이지 이름 (예: 로그인, 스플래시)
const pathHideHeader = ['login', 'landing', 'writePost', 'notifications']

// (임시) 네비바를 보여줄 페이지 이름
const visableNav = [
  'hot',
  'map',
  'home',
  'ai',
  'policy',
  'test',
  'free',
  'info',
  'local',
  'postDetail',
  'notifications',
  'policyDetail',
]

// computed로 현재 페이지에 따라 표시 여부 계산
const showHeader = computed(() => !pathHideHeader.includes(route.name))
const showNav = computed(() => visableNav.includes(route.name))
</script>

<template>
  <div class="layout-wrapper">
    <Header v-if="showHeader" />

    <main class="slot-container">
      <router-view />
    </main>

    <Navbar v-if="showNav" />
  </div>
</template>

<style scoped lang="scss">
.layout-wrapper {
  /* ✅ 뷰포트에 고정된 ‘앱 프레임’ */
  position: fixed;
  inset: 0; /* top:0; right:0; bottom:0; left:0 */
  margin: 0 auto;
  max-width: rem(430px);
  width: 100%;

  display: flex;
  flex-direction: column;

  /* main.css의 기본 배경색 적용 */
  background-color: var(--bg-default);
}

/* 가운데 영역만 스크롤 */
.slot-container {
  flex: 1;
  width: 100%;
  box-sizing: border-box;

  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  background-color: var(--bg-partition);
  &::-webkit-scrollbar {
    display: none;
  }
  /* 파이어폭스 */
  scrollbar-width: none;

  /* IE, 옛 엣지 */
  -ms-overflow-style: none;
}
</style>
