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
      <span class="extra-info">추가정보</span>
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
import { computed, defineProps, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
})

onMounted(() => {
  console.log('--- Full HotBoardItem Post Object ---')
  console.log(JSON.stringify(props.post, null, 2))
})

const router = useRouter()

const categoryMap = {
  1: { name: 'HOT', color: '#FF6B6C' },
  2: { name: '자유', color: '#FFC145' },
  3: { name: '정보공유', color: '#2A428C' },
  4: { name: '우리 동네', color: '#2E6955' },
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
    return category ? category.color : '#333333'
  }
  return '#333333'
})

const truncatedContent = computed(() => {
  if (!props.post.content) return ''
  const strippedContent = props.post.content.replace(/<[^>]*>?/gm, '') // HTML 태그 제거
  return strippedContent.length > 100 ? strippedContent.substring(0, 100) + '...' : strippedContent
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
.hot-post-item {
  background-color: #ffffff;

  border-bottom: 1px solid #f0f0f0;
  padding: 20px 15px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #fcfcfc;
  }
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.board-name {
  font-size: 0.85rem;
  font-weight: 800;
}

.post-date {
  font-size: 0.8rem;
  color: #a0a0a0;
}

.post-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #222;
  margin: 0 0 6px 0;
  line-height: 1.3;
}

.post-content {
  font-size: 0.95rem;
  color: #555;
  margin: 0 0 14px 0;
  line-height: 1.4;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.extra-info {
  font-size: 0.8rem;
  color: #d1d5db;
}

.post-stats {
  display: flex;
  gap: 12px;
  font-size: 0.9rem;
  color: #666;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.like-icon,
.comment-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
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
