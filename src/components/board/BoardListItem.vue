<template>
  <div class="board-widget-container">
    <div class="board-header">
      <h2 class="board-title" :style="{ color: boardInfo.color }">{{ boardInfo.name }} 게시판</h2>
      <button class="more-button" @click="goToBoardPage">더보기</button>
    </div>

    <ul class="post-list">
      <li v-for="post in posts" :key="post.id" class="post-item" @click="goToDetailPage(post.id)">
        <span class="post-title">{{ post.title }}</span>
        <div class="post-stats">
          <span class="stat-item like-icon">{{ post.likes }}</span>
          <span class="stat-item comment-icon">{{ post.comments }}</span>
        </div>
      </li>
      <li v-if="posts.length === 0" class="post-item no-data">게시글이 없습니다.</li>
    </ul>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  // 게시판 카테고리 (1: HOT, 2: 자유, 3: 정보공유 등)
  boardCategory: {
    type: [String, Number],
    required: true,
  },
  // 게시글 목록 데이터 배열
  posts: {
    type: Array,
    default: () => [],
    // 예시 데이터 형태: [{ id: 1, title: '제목', likes: 10, comments: 2 }]
  },
})

const router = useRouter()

// 게시판 정보 (색상 및 이름 매핑) - 작성하신 로직 유지
const boardInfo = computed(() => {
  const categoryMap = {
    1: { name: 'HOT', color: '#FF6B6C' }, // 사진의 붉은색
    2: { name: '자유', color: '#FFC145' }, // 사진의 노란색
    3: { name: '정보공유', color: '#2A428C' },
    4: { name: '우리 동네', color: '#2E6955' },
  }
  return (
    categoryMap[Number(props.boardCategory)] || {
      name: '게시판',
      color: '#333333',
    }
  )
})

// 더보기 버튼 클릭 시 해당 게시판 목록으로 이동
const goToBoardPage = () => {
  router.push(`/board/category/${props.boardCategory}`)
}

// 개별 게시글 클릭 시 상세 페이지 이동
const goToDetailPage = (id) => {
  router.push(`/board/${id}`)
}
</script>

<style scoped>
@charset "UTF-8";

/* 위젯 전체 컨테이너 */
.board-widget-container {
  width: 100%;
  max-width: 400px;
  margin: 20px auto;
  font-family: 'Pretendard', sans-serif;
}

/* 헤더 영역 */
.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 4px;
}

/* 게시판 제목 */
.board-title {
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

/* 게시글 리스트 박스 (둥근 회색 박스) */
.post-list {
  background-color: #f9f9f9;
  border-radius: 16px;
  padding: 0 20px;
  margin: 0;
  list-style: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

/* 개별 게시글 항목 */
.post-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #e0e0e0;
  color: #333;
  cursor: pointer;
  transition: opacity 0.2s;
}

.post-item:hover {
  opacity: 0.7;
}

/* 마지막 항목 구분선 제거 */
.post-item:last-child {
  border-bottom: none;
}

/* 데이터 없음 처리 */
.no-data {
  justify-content: center;
  color: #999;
  font-size: 0.9rem;
}

/* 게시글 제목 텍스트 */
.post-title {
  flex-grow: 1;
  font-weight: 700;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 10px;
  color: #333;
}

/* 좋아요/댓글 수 영역 */
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

/* 아이콘 */
.like-icon::before {
  content: '';
  display: inline-block;
  width: 14px;
  height: 14px;
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
  width: 14px;
  height: 14px;
  background-image: url('/src/assets/icons/board/comment.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin-right: 4px;
  transform: translateY(-1px);
}
</style>
