<template>
  <div class="post-container">
    <div class="post-header">
      <span class="username">{{ post.nickname }}</span>
      <span class="date">{{ formattedDate }}</span>
    </div>

    <h2 class="post-title">{{ post.title }}</h2>

    <div class="post-body" v-html="post.content"></div>

    <div class="post-footer" :class="{ 'no-border': !showBorder }">
      <div class="action-item" @click="handleLikeClick">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
          ></path>
        </svg>
        <span>좋아요 {{ likeCount }}</span>
      </div>
      <div class="action-item">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
          ></path>
        </svg>
        <span>댓글 {{ post.commentCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useBoardStore } from '@/stores/board/board.js'

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
  showBorder: {
    type: Boolean,
    default: true,
  },
})

const boardStore = useBoardStore()
const likeCount = ref(props.post.likeCount || 0)

const formattedDate = computed(() => {
  if (!props.post.createdAt) return ''
  const date = new Date(props.post.createdAt)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}/${day} ${hours}:${minutes}`
})

const handleLikeClick = async () => {
  likeCount.value++
  try {
    await boardStore.likePost(props.post.postId)
  } catch (error) {
    likeCount.value-- // Revert optimistic update
    alert(error.message || '좋아요 처리에 실패했습니다.')
  }
}
</script>

<style scoped lang="scss">
.post-container {
  padding: rem(20px);
  background-color: var(--white);
  border-bottom: rem(8px) solid var(--color-border-bold);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: rem(15px);
}

.username {
  font-weight: var(--font-weight-bold);
  font-size: rem(16px);
  color: var(--black);
}

.date {
  font-size: rem(13px);
  color: var(--text-subtitle);
}

.post-title {
  font-size: rem(20px);
  font-weight: var(--font-weight-bold);
  margin: 0 0 rem(15px) 0;
  color: var(--black);
}

.post-body {
  font-size: rem(15px);
  line-height: 1.5;
  color: var(--color-text-strong);
  margin-bottom: rem(30px);
  overflow-wrap: break-word;
}

.post-footer {
  display: flex;
  justify-content: space-around;
  border-top: rem(1px) solid var(--grey-light);
  padding-top: rem(15px);

  &.no-border {
    border-top: none;
  }
}

.action-item {
  display: flex;
  align-items: center;
  gap: rem(8px);
  font-size: rem(14px);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  color: var(--color-text-light);
}
</style>
