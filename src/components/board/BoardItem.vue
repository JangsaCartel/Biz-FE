<template>
  <div class="hot-board-container">
    <!-- 제목 -->
    <div class="hot-board-header">
      <h2 class="hot-board-title">HOT 게시글</h2>
      <button class="more-button" @click="goToDetailPage">더보기</button>
    </div>
    <!-- 내용 -->
    <ul class="hot-posts-list">
      <li v-for="(post, index) in posts" :key="index" class="post-item">
        <span class="post-title">{{ post.title }}</span>
        <div class="post-stats">
          <span class="stat-item like-icon">{{ post.likes }}</span>
          <span class="stat-item comment-icon">{{ post.comments }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import router from '@/router'
import { defineProps } from 'vue'

const props = defineProps({
  posts: {
    type: Array,
    required: true,
    default: () => [
      { title: '게시글 제목 예시', likes: 50, comments: 15 },
      { title: '게시글 제목 예시', likes: 50, comments: 15 },
      { title: '게시글 제목 예시', likes: 50, comments: 15 },
    ],
  },
})

const goToDetailPage = () => {
  // 추후 수정
  router.push(`/board/${props.id}`)
}
</script>

<style scoped>
/* 박스 전체 컨테이너 */
.hot-board-container {
  width: 100%;
  max-width: 400px;
  margin: 20px auto;
  font-family: 'Pretendard', sans-serif;
}

/* 제목 + 더보기 버튼 헤더 */
.hot-board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
}

/* HOT 게시글 제목 (색상 변수 유지) */
.hot-board-title {
  color: var(--board-hot);
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
}

/* 더보기 버튼 */
.more-button {
  font-size: 0.85rem;
  color: #888;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-weight: 600;
}

.more-button:hover {
  text-decoration: underline;
  color: #555;
}

/* 게시글 목록 (카드 형태) */
.hot-posts-list {
  background-color: #f9f9f9;
  border-radius: 16px;
  padding: 0 20px;
  margin: 0;
  list-style: none;
}

/* 각 게시글 항목 */
.post-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #e0e0e0;
  color: #333;
}

/* 마지막 항목은 구분선 제거 */
.post-item:last-child {
  border-bottom: none;
}

/* 게시글 제목 */
.post-title {
  flex-grow: 1;
  font-weight: 700;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 10px;
}

/* 댓글, 좋아요 수 영역 */
.post-stats {
  display: flex;
  gap: 10px;
  font-size: 0.85rem;
  color: #333;
  font-weight: 500;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  align-items: center;
}

/* 아이콘 스타일 */
.like-icon::before {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  background-image: url('/src/assets/icons/board/like.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin-right: 4px;
  transform: translateY(-1px);
}

.comment-icon::before {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  background-image: url('/src/assets/icons/board/comment.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin-right: 4px;
  transform: translateY(-1px);
}
</style>
