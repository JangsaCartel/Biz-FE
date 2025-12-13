<script setup>
import { onMounted, computed } from 'vue'
import { useBoardStore } from '@/stores/board/board.js'
import BoardListItem from '@/components/board/BoardListItem.vue'

const boardStore = useBoardStore()

const postsByCategory = computed(() => {
  const categories = boardStore.getCategorizedPosts
  // eslint-disable-next-line no-unused-vars
  const { hot, ...otherCategories } = categories
  const limitedCategories = {}
  for (const categoryId in otherCategories) {
    limitedCategories[categoryId] = otherCategories[categoryId].slice(0, 3)
  }
  return limitedCategories
})
const hotPosts = computed(() => boardStore.getHotBoardPosts.slice(0, 3))

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
  gap: 0.3rem;
  padding: 15px;
  max-width: 800px;
  margin: 0 auto;
  height: 100%;
  overflow-y: auto;

  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
