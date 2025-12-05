<template>
  <div class="pagination-test-page">
    <h1>페이지네이션 테스트 페이지</h1>
    <p>현재 페이지: {{ currentPage }}</p>
    <!-- 이런식으로 패딩 위 아래 간격 맞추기 가능 -->
    <div style="padding: 40px 0">
      <AppPagination
        :current-page="currentPage"
        :total-items="totalItems"
        :page-size="pageSize"
        @page-change="updatePage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppPagination from '@/components/common/AppPagination.vue'

const currentPage = ref(1)
const totalItems = ref(100) // 총 게시글 수
const pageSize = ref(10) // 총 페이지네이션 수

const updatePage = (newPage) => {
  currentPage.value = newPage
}
</script>

<style scoped>
.pagination-test-page {
  padding: 20px;
  text-align: center;
}
</style>
