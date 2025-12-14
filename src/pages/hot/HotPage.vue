<template>
  <div class="hot-page-wrapper">
    <header class="page-header">
      <h1 class="page-title">HOT 게시판</h1>
    </header>

    <main class="hot-page-container">
      <div v-if="hotPosts.length > 0" class="post-list">
        <HotBoardItem v-for="post in hotPosts" :key="post.postId" :post="post" />
      </div>
      <div v-else class="no-posts">
        <p>현재 HOT 게시글이 없습니다.</p>
      </div>

      <div class="pagination-container" v-if="hotPosts.length > 0">
        <AppPagination
          :current-page="currentPage"
          :total-items="totalPosts"
          :page-size="pageSize"
          @page-change="handlePageChange"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import { useBoardStore } from '@/stores/board/board.js'
import HotBoardItem from '@/components/board/HotBoardItem.vue'
import AppPagination from '@/components/common/AppPagination.vue'

const boardStore = useBoardStore()

const hotPosts = computed(() => boardStore.getHotBoardPosts)
const totalPosts = computed(() => boardStore.getHotBoardTotal)

const currentPage = ref(1)
const pageSize = ref(4)

const fetchPosts = () => {
  boardStore.fetchHotBoardPosts(currentPage.value, pageSize.value)
}

const handlePageChange = (page) => {
  currentPage.value = page
}

onMounted(() => {
  fetchPosts()
})

watch(currentPage, () => {
  fetchPosts()
})
</script>

<style scoped lang="scss">
/* 전체 페이지 배경 */
.hot-page-wrapper {
  background-color: #f8f8f8;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 상단 헤더 디자인 */
.page-header {
  background-color: #fff0f0;
  padding: 15px 0;
  text-align: center;
  border-bottom: 1px solid #ffe0e0;
  margin-bottom: 10px;
}

/* 제목 */
.page-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #ff6b6b;
  margin: 0;
}

.hot-page-container {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  padding: 0 15px 20px 15px;
  box-sizing: border-box;

  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow-y: auto;
  padding: 10px;

  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

/* 게시글 없을 때 */
.no-posts {
  text-align: center;
  padding: 50px 0;
  color: #999;
  font-size: 0.95rem;
}
</style>
