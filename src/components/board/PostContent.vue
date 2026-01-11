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
        <img src="@/assets/icons/board/like.png" alt="like" width="20" height="20" />
        <span>좋아요 {{ likeCount }}</span>
      </div>
      <div class="action-item">
        <img src="@/assets/icons/board/comment.png" alt="comment" width="20" height="20" />
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
    likeCount.value--
    if (error.response?.status === 409) {
      console.log('좋아요 누름 : ' + error.response?.data)
      alert(error.response.data || '이미 좋아요를 누른 글 입니다.')
    } else {
      alert('좋아요 처리에 실패했습니다.')
      console.error(error)
    }
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
