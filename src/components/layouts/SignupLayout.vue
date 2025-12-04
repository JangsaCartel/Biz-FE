<script setup></script>

<template>
  <div class="auth-layout-wrapper">
    <router-view />
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/utils/_pxToRem.scss' as *;

.auth-layout-wrapper {
  min-height: 100vh;
  width: 100%;
  background-color: var(--bg-default);
  display: flex;
  justify-content: center;
  align-items: stretch;
  padding: rem(24px) rem(16px);
}
</style>
