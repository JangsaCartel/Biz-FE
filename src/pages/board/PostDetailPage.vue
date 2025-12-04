<template>
  <div class="post-detail-container">
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBoardStore } from '@/stores/board/board.js'
import PostContent from '@/components/board/PostContent.vue'
import CommentList from '@/components/board/CommentList.vue'

const route = useRoute()
const boardStore = useBoardStore()
const post = ref(null)
const loading = ref(true)
const postId = ref(null)

onMounted(async () => {
  postId.value = route.params.postId
  if (postId.value) {
    post.value = await boardStore.fetchPostById(postId.value)
    loading.value = false
  }
})
</script>
