<template>
  <div class="hot-page-wrapper">
    <header class="page-header">
      <h1 class="page-title">HOT 게시판</h1>
    </header>

    <main class="hot-page-container">
      <div v-if="hotPosts.length > 0" class="post-list">
        <BoardItem v-for="post in hotPosts" :key="post.post_id" :post="post" />
      </div>
      <div v-else class="no-posts">
        <p>현재 HOT 게시글이 없습니다.</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useBoardStore } from '@/stores/board/board.js'
import BoardItem from '@/components/board/BoardItem.vue'

const boardStore = useBoardStore()
const hotPosts = computed(() => boardStore.getHotBoardPosts)

onMounted(() => {
  boardStore.fetchHotBoardPosts()
})
</script>

<style scoped lang="scss">
/* 전체 페이지 배경 */
.hot-page-wrapper {
  background-color: #f8f8f8;
  min-height: 100vh;
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
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 게시글 없을 때 */
.no-posts {
  text-align: center;
  padding: 50px 0;
  color: #999;
  font-size: 0.95rem;
}
</style>
