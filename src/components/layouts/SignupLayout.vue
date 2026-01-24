<script setup></script>

<template>
  <div class="auth-layout-wrapper">
    <main class="slot-container">
      <router-view />
    </main>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/utils/_pxToRem.scss' as *;

.auth-layout-wrapper {
  /* DefaultLayout과 동일한 모바일 프레임 설정 */
  position: fixed;
  inset: 0;
  margin: 0 auto;
  max-width: rem(430px);
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-default);
}

.slot-container {
  flex: 1;
  width: 100%;
  box-sizing: border-box;

  /* 내부 스크롤 허용 */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  /* 여백은 페이지 내부에서 처리하거나 필요 시 여기에 추가 */
  padding: rem(24px) rem(16px);

  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
}
</style>
