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
  max-width: 400px; /* 필요에 따라 조절 */
  margin: 20px auto;
  font-family: 'Pretendard', sans-serif; /* 폰트가 있다면 적용 권장 */
}

/* 제목 + 더보기 버튼 헤더 */
.hot-board-header {
  display: flex;
  justify-content: space-between;
  align-items: center; /* 수직 중앙 정렬 */
  margin-bottom: 12px; /* 리스트와의 간격 */
  padding: 0 4px; /* 헤더 좌우 살짝 여백 */
}

/* HOT 게시글 제목 (색상 변수 유지) */
.hot-board-title {
  color: var(--board-hot); /* 기존 변수 유지 */
  font-size: 1.25rem; /* 크기 조절 */
  font-weight: 800; /* 굵게 */
  margin: 0;
}

/* 더보기 버튼 */
.more-button {
  font-size: 0.85rem;
  color: #888; /* 연한 회색 */
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
  background-color: #f9f9f9; /* 사진처럼 아주 연한 회색/흰색 */
  border-radius: 16px; /* 둥근 모서리 강조 */
  padding: 0 20px; /* 리스트 내부 좌우 여백 */
  margin: 0;
  list-style: none;
}

/* 각 게시글 항목 */
.post-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0; /* 상하 여백만 줌 (좌우는 리스트가 담당) */
  border-bottom: 1px solid #e0e0e0; /* 연한 구분선 */
  color: #333;
}

/* 마지막 항목은 구분선 제거 */
.post-item:last-child {
  border-bottom: none;
}

/* 게시글 제목 */
.post-title {
  flex-grow: 1;
  font-weight: 700; /* 제목 굵게 */
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 10px; /* 아이콘들과의 간격 */
}

/* 댓글, 좋아요 수 영역 */
.post-stats {
  display: flex;
  gap: 10px; /* 아이콘 그룹 간 간격 좁힘 */
  font-size: 0.85rem;
  color: #333;
  font-weight: 500;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  align-items: center;
}

/* 아이콘 스타일 (기존 유지하되 위치 조정) */
.like-icon::before {
  content: '';
  display: inline-block;
  width: 16px; /* 아이콘 크기 살짝 키움 */
  height: 16px;
  background-image: url('/src/assets/icons/board/like.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin-right: 4px;
  transform: translateY(-1px); /* 시각적 높이 보정 */
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
  transform: translateY(-1px); /* 시각적 높이 보정 */
}
</style>
