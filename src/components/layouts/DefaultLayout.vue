<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// 헤더, 네비바 가져오기
import Header from '@/components/layouts/AppHeader.vue'
import Navbar from '@/components/layouts/AppNavbar.vue'

const route = useRoute()

// 헤더/네비바 표시 여부 결정

// (임시) 헤더를 숨길 페이지 이름 (예: 로그인, 스플래시)
const pathHideHeader = ['login', 'landing']

// (임시) 네비바를 보여줄 페이지 이름
const visableNav = ['hot', 'map', 'home', 'analysis', 'policy', 'test']

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
@use '@/assets/styles/utils/_pxToRem.scss' as *;

.layout-wrapper {
  margin: 0 auto;
  /* ★ 아이폰 15 Pro Max 너비 적용 */
  max-width: rem(430px);
  width: 100%;
  min-height: 100vh;

  /* main.css의 기본 배경색 적용 */
  background-color: var(--bg-default);

  /* 고정 헤더(56px)와 네비바(70px)에
    내용이 가려지지 않도록 패딩 추가
  */
  padding-top: rem(56px);
  padding-bottom: rem(70px);
}

.slot-container {
  /* 페이지 내용이 흰색 배경을 갖도록 */
  background-color: var(--bg-partition); /* */
  width: 100%;
  /* 레이아웃 래퍼의 min-height(100vh)에서
    패딩값을 뺀 실제 화면 높이를 채우도록 설정
  */
  min-height: calc(100vh - rem(56px) - rem(70px));
}
</style>
