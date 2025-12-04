<template>
  <div class="post-item" @click="goToDetailPage">
    <span class="post-title">{{ post.title }}</span>
    <div class="post-stats">
      <span class="stat-item like-icon">{{ post.likeCount }}</span>
      <span class="stat-item comment-icon">{{ post.commentCount }}</span>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { defineProps } from 'vue'

const router = useRouter()

const props = defineProps({
  post: {
    type: Object,
    required: true,
    default: () => ({
      postId: 0,
      title: '게시글 제목 예시',
      likeCount: 50,
      commentCount: 15,
    }),
  },
})

const goToDetailPage = () => {
  console.log('게시글 클릭됨:', props.post)
  console.log('게시글 ID:', props.post ? props.post.postId : 'post 객체 없음')
  if (props.post && props.post.postId) {
    router.push(`/board/${props.post.postId}`)
  }
}
</script>

<style scoped>
/* 각 게시글 항목 */
.post-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #e0e0e0;
  color: #333;
  cursor: pointer;
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
