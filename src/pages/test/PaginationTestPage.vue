<template>
  <div class="pagination-test-page">
    <h1>페이지네이션 상태 유지 테스트 페이지</h1>
    <p style="font-size: 1.2rem; color: #ff6b6b">
      <strong>현재 페이지: {{ currentPage }}</strong>
    </p>
    <p>
      URL의 <code>?page={{ currentPage }}</code> 부분을 확인하세요.
    </p>
    <p>
      페이지 번호를 바꾸고 다른 페이지로 이동했다가 다시 돌아와도 페이지 번호가 유지되는거 확인 가능
    </p>

    <div style="padding: 40px 0; border-top: 1px solid #eee; margin-top: 20px">
      <AppPagination
        :current-page="currentPage"
        :total-items="totalItems"
        :page-size="pageSize"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppPagination from '@/components/common/AppPagination.vue'

const route = useRoute()
const router = useRouter()

const totalItems = ref(200)
const pageSize = ref(10)

const currentPage = ref(parseInt(route.query.page) || 1)

// 페이지네이션 컴포넌트에서 `page-change` 이벤트가 발생했을 때 호출될 함수
const handlePageChange = (newPage) => {
  // `router.push`를 사용하여 URL의 쿼리 파라미터를 업데이트함
  // { query: { page: newPage } }는 URL을 `/.../?page=newPage`와 같이 변경함
  router.push({ query: { page: newPage } })
}

// URL의 변경을 감지하는 부분
watch(
  () => route.query.page, // 감시할 대상: URL의 `page` 쿼리 파라미터
  (newPage) => {
    // `newPage`는 변경된 `page` 쿼리 파라미터의 새 값
    const pageAsNumber = parseInt(newPage) || 1
    currentPage.value = pageAsNumber
    console.log(`URL이 변경되었습니다. 새 페이지: ${pageAsNumber}`)
  },
)
</script>

<style scoped>
.pagination-test-page {
  padding: 20px;
  text-align: center;
  max-width: 800px;
  margin: 40px auto;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

code {
  background-color: #eee;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}
</style>
