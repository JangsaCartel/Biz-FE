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
  const maxLength = 15 // 최대 글자 수
  if (strippedContent.length > maxLength) {
    return strippedContent.slice(0, maxLength) + '...'
  }
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
  padding: rem(16px) rem(20px);
  border-bottom: rem(1px) solid var(--color-border-subtle);
  cursor: pointer;
  background-color: var(--white);
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }

  &:last-child {
    border-bottom: none;
  }
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: rem(6px);
}

.post-title {
  font-weight: var(--font-weight-bold);
  font-size: rem(16px);
  color: var(--color-text-strong);
  margin: 0;
  line-height: 1.3;

  flex: 1;
  padding-right: rem(15px);
}

.post-date {
  font-size: rem(13px);
  color: var(--color-text-subtle);
  white-space: nowrap;
  padding-top: rem(2px);
}

.post-content {
  font-size: rem(15px);
  color: var(--color-text-default);
  margin: 0 0 rem(8px) 0;
  line-height: 1.4;
  height: calc(1.4em * 2);
  overflow: hidden;
}

.post-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.post-stats {
  display: flex;
  gap: rem(12px);
  font-size: rem(14px);
  color: var(--color-text-strong);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: rem(4px);
}

.like-icon::before,
.comment-icon::before {
  content: '';
  display: inline-block;
  width: rem(16px);
  height: rem(16px);
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
