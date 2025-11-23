<script setup>
import { onMounted, computed } from 'vue'
import { useBoardStore } from '@/stores/board/board.js'
import BoardListItem from '@/components/board/BoardListItem.vue'

const boardStore = useBoardStore()

const postsByCategory = computed(() => boardStore.getCategorizedPosts)

onMounted(() => {
  boardStore.fetchPosts()
})
</script>

<template>
  <div class="home-container">
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
