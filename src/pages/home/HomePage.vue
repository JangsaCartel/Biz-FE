<script setup>
import { onMounted, computed } from 'vue'
import { useBoardStore } from '@/stores/board/board.js'
import BoardListItem from '@/components/board/BoardListItem.vue'

const boardStore = useBoardStore()

const posts = computed(() => boardStore.allPosts)

onMounted(() => {
  // boardStore.fetchPosts()   // <-- 잠시 주석 처리

  // 테스트 데이터
  boardStore.postsByCategory = {
    1: [
      // HOT
      {
        boardId: 1,
        title: '테스트 HOT 게시글',
        content: '이것은 HOT 테스트 게시글입니다.',
        createdAt: '2025-01-01 12:00:00',
        likes: 10,
        commentCount: 5,
      },
    ],
    2: [
      // 자유
      {
        boardId: 2,
        title: '테스트 자유 게시글',
        content: '이것은 자유 게시판 테스트입니다.',
        createdAt: '2025-01-02 13:30:00',
        likes: 2,
        commentCount: 1,
      },
    ],
    3: [
      // 정보공유
      {
        boardId: 3,
        title: '정보 공유글 테스트',
        content: '정보공유 게시판 테스트입니다.',
        createdAt: '2025-01-03 09:10:00',
        likes: 7,
        commentCount: 0,
      },
    ],
    4: [
      // 우리 동네
      {
        boardId: 4,
        title: '우리 동네 테스트',
        content: '우리 동네 게시판 테스트입니다.',
        createdAt: '2025-01-04 07:50:00',
        likes: 4,
        commentCount: 2,
      },
    ],
  }
})
</script>

<template>
  <div class="post-list-container">
    <ul>
      <li v-for="post in posts" :key="post.boardId">
        <BoardListItem
          :id="post.boardId"
          :boardCategory="post.boardCategory"
          :title="post.title"
          :content="post.content"
          :date="post.createdAt"
          :likes="post.likes"
          :comments="post.commentCount"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.post-list-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;

  h1 {
    text-align: center;
    margin-bottom: 2rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
}
</style>
