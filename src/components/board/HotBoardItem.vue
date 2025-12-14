<template>
  <div class="hot-post-item" @click="goToDetailPage">
    <div class="post-header">
      <span class="board-name" :style="{ color: boardColor }">
        {{ boardName }}
      </span>
      <span class="post-date">{{ formattedDate }}</span>
    </div>

    <h3 class="post-title">{{ post.title }}</h3>

    <p class="post-content">{{ truncatedContent }}</p>

    <div class="post-footer">
      <div class="post-stats">
        <div class="stat-item">
          <i class="like-icon"></i>
          <span>{{ post.likeCount }}</span>
        </div>
        <div class="stat-item">
          <i class="comment-icon"></i>
          <span>{{ post.commentCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
})

const router = useRouter()

const categoryMap = {
  1: { name: 'HOT', color: 'var(--board-hot)' },
  2: { name: '자유', color: 'var(--board-free)' },
  3: { name: '정보공유', color: 'var(--board-info)' },
  4: { name: '우리 동네', color: 'var(--board-local)' },
}

const boardName = computed(() => {
  if (props.post && props.post.categoryId) {
    const category = categoryMap[props.post.categoryId]
    return (category ? category.name : '기타') + ' 게시판'
  }
  return '게시판'
})

const boardColor = computed(() => {
  if (props.post && props.post.categoryId) {
    const category = categoryMap[props.post.categoryId]
    return category ? category.color : 'var(--color-text-strong)'
  }
  return 'var(--color-text-strong)'
})

const truncatedContent = computed(() => {
  if (!props.post.content) return ''
  const strippedContent = props.post.content.replace(/<[^>]*>?/gm, '') // HTML 태그 제거
  const maxLength = 15 // 최대 글자 수
  if (strippedContent.length > maxLength) {
    return strippedContent.slice(0, maxLength) + '...'
  }
  return strippedContent
})

const formattedDate = computed(() => {
  if (!props.post.createdAt) return ''
  const date = new Date(props.post.createdAt)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
})

const goToDetailPage = () => {
  if (props.post && props.post.postId) {
    router.push(`/board/${props.post.postId}`)
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/utils/_pxToRem.scss';

.hot-post-item {
  display: flex;
  flex-direction: column;
  padding: rem(16px) rem(20px);
  border-bottom: rem(1px) solid var(--color-border-subtle);
  cursor: pointer;
  background-color: var(--white);
  transition: background-color 0.2s;

  &:hover {
    background-color: #e0e0e0;
  }

  &:last-child {
    border-bottom: none;
  }
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: rem(8px);
}

.board-name {
  font-size: rem(14px);
  font-weight: var(--font-weight-extra-bold);
}

.post-date {
  font-size: rem(13px);
  color: var(--color-text-subtle);
  white-space: nowrap;
  padding-top: rem(2px);
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
  color: var(--color-text-light);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: rem(4px);
}

.like-icon,
.comment-icon {
  display: inline-block;
  width: rem(16px);
  height: rem(16px);
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.6;
}

.like-icon {
  background-image: url('@/assets/icons/board/like.png');
}

.comment-icon {
  background-image: url('@/assets/icons/board/comment.png');
}
</style>
