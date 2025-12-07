<script setup>
import { onMounted, computed } from 'vue'
import { useBoardStore } from '@/stores/board/board.js'
import BoardListItem from '@/components/board/BoardListItem.vue'

const boardStore = useBoardStore()

const postsByCategory = computed(() => {
  const categories = boardStore.getCategorizedPosts
  const { hot, ...otherCategories } = categories
  return otherCategories
})
const hotPosts = computed(() => boardStore.getHotBoardPosts)

onMounted(() => {
  boardStore.fetchPosts()
  boardStore.fetchHotBoardPosts()
})
</script>

<template>
  <div class="home-container">
    <BoardListItem :boardCategory="'hot'" :posts="hotPosts" />
    <BoardListItem
      v-for="(posts, categoryId) in postsByCategory"
      :key="categoryId"
      :boardCategory="categoryId"
      :posts="posts"
    />
  </div>
</template>

<style scoped lang="scss">
.home-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
</style>
