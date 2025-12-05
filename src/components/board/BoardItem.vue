<template>
  <div class="post-item" @click="goToDetailPage">
    <div class="post-header">
      <h3 class="post-title">{{ post.title }}</h3>
      <span class="post-date">{{ formattedDate }}</span>
    </div>

    <p class="post-content">{{ truncatedContent }}</p>

    <div class="post-footer">
      <div class="post-stats">
        <span class="stat-item like-icon">{{ post.likeCount }}</span>
        <span class="stat-item comment-icon">{{ post.commentCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { defineProps, computed } from 'vue'

const router = useRouter()

const props = defineProps({
  post: {
    type: Object,
    required: true,
    default: () => ({
      postId: 0,
      title: '게시글 예시 제목',
      content: '게시글 예시 내용 / 게시글 예시 내용 / 게시글 예시 내용 / 게시글 예시 내용 /',
      likeCount: 50,
      commentCount: 15,
      regDate: '2024-01-01T23:50:00',
    }),
  },
})

const truncatedContent = computed(() => {
  if (!props.post.content) return ''
  const strippedContent = props.post.content.replace(/<[^>]*>?/gm, '')
  return strippedContent
})

const formattedDate = computed(() => {
  const dateString = props.post.createdAt || props.post.regDate
  if (!dateString) return ''

  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${month}/${day} ${hours}:${minutes}`
})

const goToDetailPage = () => {
  if (props.post && props.post.postId) {
    router.push(`/board/${props.post.postId}`)
  }
}
</script>

<style scoped lang="scss">
.post-item {
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  border-bottom: 1px solid #f1f1f1;
  cursor: pointer;
  background-color: #fff;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f9f9f9;
  }

  &:last-child {
    border-bottom: none;
  }
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.post-title {
  font-weight: 700;
  font-size: 1rem;
  color: #222;
  margin: 0;
  line-height: 1.3;

  flex: 1;
  padding-right: 15px;
}

.post-date {
  font-size: 0.8rem;
  color: #aaa;
  white-space: nowrap;
  padding-top: 2px;
}

.post-content {
  font-size: 0.95rem;
  color: #444;
  margin: 0 0 8px 0;
  line-height: 1.4;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.post-stats {
  display: flex;
  gap: 12px;
  font-size: 0.9rem;
  color: #333;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.like-icon::before,
.comment-icon::before {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.like-icon::before {
  background-image: url('@/assets/icons/board/like.png');
}

.comment-icon::before {
  background-image: url('@/assets/icons/board/comment.png');
}
</style>
