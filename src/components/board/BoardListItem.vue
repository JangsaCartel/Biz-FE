<template>
  <div class="board-widget-container">
    <div class="board-header">
      <h2 class="board-title" :style="{ color: boardInfo.color }">{{ boardInfo.name }} 게시판</h2>
      <button class="more-button" @click="goToBoardPage">더보기</button>
    </div>

    <ul class="post-list">
      <li v-for="post in posts" :key="post.post_id" class="post-item" @click="goToDetailPage(post)">
        <span class="post-title">{{ post.title }}</span>
        <div class="post-stats">
          <span class="stat-item like-icon">{{ post.like_count }}</span>
          <span class="stat-item comment-icon">{{ post.comment_count }}</span>
        </div>
      </li>
      <li v-if="posts.length === 0" class="post-item no-data">게시글이 없습니다.</li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  // 게시판 카테고리
  boardCategory: {
    type: [String, Number],
    required: true,
  },
  // 게시글 목록 데이터 배열
  posts: {
    type: Array,
    default: () => [],
    // 예시 데이터 형태: [{ post_id: 1, title: '제목', like_count: 10, comment_count: 2 }]
  },
})

const router = useRouter()

// 게시판 정보 (색상 및 이름 매핑)
const boardInfo = computed(() => {
  const categoryMap = {
    hot: { name: 'HOT', color: 'var(--board-hot)' },
    free: { name: '자유', color: 'var(--board-free)' },
    info: { name: '정보공유', color: 'var(--board-info)' },
    local: { name: '우리 동네', color: 'var(--board-local)' },
  }
  return (
    categoryMap[props.boardCategory] || {
      name: '게시판',
      color: 'var(--color-text-strong)',
    }
  )
})

// 게시판 라우트 정보
const boardRouteInfo = computed(() => {
  const routeMap = {
    hot: { path: '/hot', id: 1 },
    free: { path: '/free', id: 2 },
    info: { path: '/info', id: 3 },
    local: { path: '/local', id: 4 },
  }
  return routeMap[props.boardCategory]
})

// 더보기 버튼 클릭 시 해당 게시판 목록으로 이동
const goToBoardPage = () => {
  if (boardRouteInfo.value) {
    router.push(boardRouteInfo.value.path)
  }
}

// 개별 게시글 클릭 시 상세 페이지 이동
const goToDetailPage = (post) => {
  router.push({
    name: 'postDetail',
    params: { postId: post.postId },
  })
}
</script>

<style scoped lang="scss">
/* 위젯 전체 컨테이너 */
.board-widget-container {
  width: 100%;
  max-width: rem(400px);
  margin: rem(10px) auto;
  font-family: var(--font-family);
  min-height: rem(165px);
}

/* 헤더 영역 */
.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: rem(10px);
  padding: 0 rem(4px);
}

/* 게시판 제목 */
.board-title {
  font-size: rem(20px);
  font-weight: var(--font-weight-extra-bold);
  margin: 0;
}

/* 더보기 버튼 */
.more-button {
  font-size: rem(14px);
  color: var(--grey);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-weight: var(--font-weight-semibold);
}

.more-button:hover {
  text-decoration: underline;
  color: var(--text-title);
}

/* 게시글 리스트 박스 (둥근 회색 박스) */
.post-list {
  background-color: var(--bg-default);
  border-radius: rem(16px);
  padding: 0 rem(20px);
  margin: 0;
  list-style: none;
  box-shadow: 0 rem(2px) rem(8px) rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

/* 개별 게시글 항목 */
.post-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: rem(10px) 0;
  border-bottom: rem(1px) solid var(--grey-light);
  color: var(--color-text-strong);
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
  color: var(--text-subtitle);
  font-size: rem(14px);
}

/* 게시글 제목 텍스트 */
.post-title {
  flex-grow: 1;
  font-weight: var(--font-weight-bold);
  font-size: rem(15px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: rem(10px);
  color: var(--color-text-strong);
}

/* 좋아요/댓글 수 영역 */
.post-stats {
  display: flex;
  gap: rem(10px);
  font-size: rem(14px);
  color: var(--color-text-strong);
  font-weight: var(--font-weight-medium);
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
  width: rem(14px);
  height: rem(14px);
  background-image: url('/src/assets/icons/board/like.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin-right: rem(4px);
  transform: translateY(rem(-1px));
}

.comment-icon::before {
  content: '';
  display: inline-block;
  width: rem(14px);
  height: rem(14px);
  background-image: url('/src/assets/icons/board/comment.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin-right: rem(4px);
  transform: translateY(rem(-1px));
}
</style>
