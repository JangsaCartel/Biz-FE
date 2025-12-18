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
      <div class="pagination-inner">
        <AppPagination
          :current-page="currentPage"
          :total-items="totalPosts"
          :page-size="pageSize"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBoardStore } from '@/stores/board/board.js'
import BoardItem from '@/components/board/BoardItem.vue'
import AppPagination from '@/components/common/AppPagination.vue'

const router = useRouter()
const route = useRoute()
const boardStore = useBoardStore()

const currentPage = ref(1)
const pageSize = 4

const posts = computed(() => boardStore.getLocalBoardPosts)
const totalPosts = computed(() => boardStore.getLocalBoardTotal)

const fetchPosts = (page) => {
  boardStore.fetchLocalBoardPosts(page, pageSize)
}

onMounted(() => {
  const pageFromUrl = parseInt(route.query.page) || 1
  currentPage.value = pageFromUrl
  fetchPosts(pageFromUrl)
})

watch(
  () => route.query.page,
  (newPage) => {
    const pageAsNumber = parseInt(newPage) || 1
    if (currentPage.value !== pageAsNumber) {
      currentPage.value = pageAsNumber
      fetchPosts(pageAsNumber)
      document.querySelector('.post-list-wrapper').scrollTop = 0
    }
  },
)

const handlePageChange = (page) => {
  router.push({ query: { page: page } })
}

const goToWritePage = () => {
  router.push({ name: 'writePost', params: { category: 'local' } })
}
</script>

<style scoped lang="scss">
/* 전체 컨테이너: 화면 높이 100% 고정 */
.board-container {
  max-width: rem(800px);
  margin: 0 auto;
  background-color: var(--bg-default);

  display: flex;
  flex-direction: column;
  height: 100%;

  box-sizing: border-box;
  position: relative;
}

/* 헤더 스타일 */
.board-header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: rem(20px) 0;

  /* 게시판 테마 색상 (배경) */
  background-color: var(--bg-header-local);
  border-bottom: rem(1px) solid var(--grey-light);

  flex-shrink: 0;
  z-index: 10;
}

.board-title {
  font-size: rem(19px);
  font-weight: var(--font-weight-extra-bold);
  color: var(--board-local);
  margin: 0;
}

.write-btn {
  position: absolute;
  right: rem(15px);
  display: flex;
  align-items: center;
  gap: rem(5px);
  background-color: var(--white);
  border: rem(1px) solid var(--board-local);
  border-radius: rem(6px);
  padding: rem(6px) rem(12px);
  font-size: rem(14px);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-strong);
  cursor: pointer;
  transition: background-color 0.2s;
}

.write-btn:hover {
  background-color: var(--bg-header-local);
}

.post-list-wrapper {
  background-color: var(--white);
  padding: 0 rem(15px);

  flex: 1;
  overflow-y: auto;

  display: flex;
  flex-direction: column;

  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.empty-state {
  margin: auto;
  padding: rem(50px);
  text-align: center;
  color: var(--grey);
}

.pagination-wrapper {
  flex-shrink: 0;
  background-color: var(--white);
  border-top: rem(1px) solid var(--grey-light);

  padding-bottom: rem(10px);
  padding-top: rem(10px);
  z-index: 10;
}

.pagination-inner {
  padding: rem(10px) 0;
}

/* 스크롤바 커스텀 (선택사항) */
.post-list-wrapper::-webkit-scrollbar {
  width: rem(6px);
}
.post-list-wrapper::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: rem(3px);
}
</style>
