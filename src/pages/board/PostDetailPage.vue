<template>
  <div class="post-detail-container">
    <header v-if="post" class="board-header">
      <h1 class="board-title" :style="{ color: boardColor }">{{ boardName }}</h1>
    </header>

    <PostContent v-if="post" :post="post" />
    <div v-else-if="loading" class="loading-state">
      게시글을 불러오는 중입니다...
    </div>
    <div v-else class="empty-state">
      게시글을 찾을 수 없습니다.
    </div>
    <CommentList v-if="postId" :post-id="postId" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useBoardStore } from '@/stores/board/board.js'
import PostContent from '@/components/board/PostContent.vue'
import CommentList from '@/components/board/CommentList.vue'

const route = useRoute()
const boardStore = useBoardStore()
const post = ref(null)
const loading = ref(true)
const postId = ref(null)

const categoryMap = {
  '1': { name: 'HOT', color: '#FF6B6C' },
  '2': { name: '자유', color: '#FFC145' },
  '3': { name: '정보공유', color: '#2A428C' },
  '4': { name: '우리 동네', color: '#2E6955' },
}

const boardName = computed(() => {
  if (post.value && post.value.categoryId) {
    const category = categoryMap[post.value.categoryId]
    return category ? `${category.name} 게시판` : '게시판'
  }
  return '게시판'
})

const boardColor = computed(() => {
  if (post.value && post.value.categoryId) {
    const category = categoryMap[post.value.categoryId]
    return category ? category.color : '#333333'
  }
  return '#333333'
})

onMounted(async () => {
  console.log('Current route:', route)
  postId.value = route.params.postId
  if (postId.value) {
    post.value = await boardStore.fetchPostById(postId.value)
    loading.value = false
  }
})
</script>

<style scoped>
.board-header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 20px 0;
  background-color: #fcf8f0;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.board-title {
  font-size: 1.2rem;
  font-weight: 800;
  margin: 0;
}
</style>