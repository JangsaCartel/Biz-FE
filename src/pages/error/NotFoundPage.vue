<template>
  <div class="error-container">
    <h1>오류</h1>
    <p>유효하지 않은 페이지입니다.</p>
    <button @click="goHome">홈으로 돌아가기</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  font-family: var(--font-family);
  color: var(--text-title);
}
h1 {
  font-size: 24px;
  font-weight: var(--font-weight-bold);
  margin-bottom: 10px;
}
p {
  font-size: 16px;
  margin-bottom: 20px;
}
button {
  padding: 10px 20px;
  background-color: var(--signature-color);
  color: var(--black);
  border-radius: 8px;
  font-weight: var(--font-weight-medium);
}
</style>
