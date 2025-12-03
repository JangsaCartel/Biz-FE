<template>
  <div class="board-container">
    <header class="board-header">
      <h1 class="board-title">우리 동네 게시판</h1>
      <button class="write-btn" @click="goToWritePage"><span class="icon">✏️</span> 글 쓰기</button>
    </header>

    <div class="post-list-wrapper">
      <div v-if="posts.length === 0" class="empty-state">게시글이 없습니다.</div>
      <BoardItem v-for="post in posts" :key="post.post_id" :post="post" />
    </div>

    <div class="pagination-wrapper">
      <AppPagination
        :current-page="currentPage"
        :total-items="totalPosts"
        :page-size="pageSize"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBoardStore } from '@/stores/board/board.js'
import BoardItem from '@/components/board/BoardItem.vue'
import AppNavbar from '@/components/layouts/AppNavbar.vue'
import AppPagination from '@/components/common/AppPagination.vue'

const router = useRouter()
const boardStore = useBoardStore()

const currentPage = ref(1)
const pageSize = 4 // 한 페이지당 게시글 수

const posts = computed(() => boardStore.getLocalBoardPosts)
const totalPosts = computed(() => boardStore.getLocalBoardTotal)

onMounted(() => {
  boardStore.fetchLocalBoardPosts(currentPage.value, pageSize)
})

const handlePageChange = (page) => {
  currentPage.value = page
  boardStore.fetchLocalBoardPosts(page, pageSize)
  // 전체 화면 대신 리스트 영역 내부 스크롤을 맨 위로 이동
  document.querySelector('.post-list-wrapper').scrollTop = 0
}

const goToWritePage = () => {
  router.push({ name: 'writePost', params: { category: 'local' } })
}
</script>

<style scoped>
/* 전체 컨테이너: 화면 높이 100% 고정 */
.board-container {
  max-width: 800px;
  margin: 0 auto;
  background-color: #fdfdfd;

  display: flex;
  flex-direction: column;

  box-sizing: border-box;
  position: relative;
}

/* 헤더 스타일 */
.board-header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 20px 0;

  /* 게시판 테마 색상 (배경) */
  background-color: rgba(46, 105, 85, 0.1);
  border-bottom: 1px solid #eee;

  flex-shrink: 0;
  z-index: 10;
}

.board-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #2e6955;
  margin: 0;
}

.write-btn {
  position: absolute;
  right: 15px;
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #fff;
  border: 1px solid #2e6955;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
}

.write-btn:hover {
  background-color: rgba(46, 105, 85, 0.15);
}

.post-list-wrapper {
  background-color: #fff;
  padding: 0 15px;

  flex: 1;

  display: flex;
  flex-direction: column;
}

.empty-state {
  margin: auto;
  padding: 50px;
  text-align: center;
  color: #888;
}

.pagination-wrapper {
  flex-shrink: 0;
  background-color: #fff;
  border-top: 1px solid #eee;

  padding-bottom: 80px;
  padding-top: 10px;
  z-index: 10;
}

/* 스크롤바 커스텀 (선택사항) */
.post-list-wrapper::-webkit-scrollbar {
  width: 6px;
}
.post-list-wrapper::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 3px;
}
</style>
