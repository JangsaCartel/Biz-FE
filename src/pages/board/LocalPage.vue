<template>
  <div class="board-container">
    <header class="board-header">
      <h1 class="board-title">우리 동네 게시판</h1>
      <button class="write-btn" @click="goToWritePage"><span class="icon">✏️</span> 글 쓰기</button>
    </header>

    <div class="filter-wrapper">
      <button type="button" class="filter-btn" @click="openRegionModal">필터</button>
      <div class="filter-summary">
        <span>{{ regionSummary }}</span>
      </div>
    </div>

    <div class="post-list-wrapper">
      <div v-if="posts.length === 0" class="empty-state">게시글이 없습니다.</div>
      <BoardItem v-for="post in posts" :key="post.post_id" :post="post" />
    </div>

    <div class="pagination-wrapper">
      <div class="pagination-inner">
        <AppPagination
          :current-page="currentPage"
          :total-items="totalPosts"
          :page-size="pageSize"
          @page-change="handlePageChange"
        />
      </div>
    </div>
    <RegionFilterModal
      :open="isRegionModalOpen"
      v-model:region="tempRegion"
      @close="closeRegionModal"
      @confirm="handleRegionConfirm"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBoardStore } from '@/stores/board/board.js'
import BoardItem from '@/components/board/BoardItem.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import RegionFilterModal from '@/components/board/RegionFilterModal.vue'

const router = useRouter()
const route = useRoute()
const boardStore = useBoardStore()

const currentPage = ref(1)
const pageSize = 4
const selectedRegion = ref(null)
const tempRegion = ref(null)
const isRegionModalOpen = ref(false)

const posts = computed(() => boardStore.getLocalBoardPosts)
const totalPosts = computed(() => boardStore.getLocalBoardTotal)

const regionSummary = computed(() => {
  if (!selectedRegion.value || !selectedRegion.value.sido) {
    return '필터 없음'
  }

  return [selectedRegion.value.sido, selectedRegion.value.gugun, selectedRegion.value.dong]
    .filter(Boolean)
    .join(' ')
})

const fetchPosts = (page, region) => {
  let regionString = null
  if (region && region.sido) {
    regionString = [region.sido, region.gugun, region.dong].filter(Boolean).join(' ').trim()
  }
  boardStore.fetchLocalBoardPosts(page, pageSize, regionString)
}

const openRegionModal = () => {
  tempRegion.value = selectedRegion.value ? { ...selectedRegion.value } : null
  isRegionModalOpen.value = true
}

const closeRegionModal = () => {
  isRegionModalOpen.value = false
}

const handleRegionConfirm = (confirmedRegion) => {
  let regionQuery = ''
  if (confirmedRegion && confirmedRegion.sido) {
    regionQuery = [confirmedRegion.sido, confirmedRegion.gugun, confirmedRegion.dong]
      .filter(Boolean)
      .join('-')
  }

  router.push({ query: { ...route.query, region: regionQuery || undefined, page: 1 } })
  closeRegionModal()
}

watch(
  () => route.query,
  (query) => {
    const regionStr = query.region || ''
    if (regionStr) {
      const [sido, gugun, dong] = regionStr.split('-')
      selectedRegion.value = { sido, gugun: gugun || null, dong: dong || null }
    } else {
      selectedRegion.value = null
    }

    const pageAsNumber = parseInt(query.page) || 1
    currentPage.value = pageAsNumber

    boardStore.setLocalFilter(query)
    fetchPosts(pageAsNumber, selectedRegion.value)
  },
  { immediate: true },
)

const handlePageChange = (page) => {
  router.push({ query: { ...route.query, page: page } })
}

const goToWritePage = () => {
  router.push({ name: 'writePost', params: { category: 'local' } })
}
</script>

<style scoped lang="scss">
/* 전체 컨테이너: 화면 높이 100% 고정 */
.board-container {
  max-width: rem(800px);
  margin: 0 auto;
  background-color: var(--bg-default);

  display: flex;
  flex-direction: column;
  height: 100%;

  box-sizing: border-box;
  position: relative;
}

/* 헤더 스타일 */
.board-header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: rem(20px) 0;

  /* 게시판 테마 색상 (배경) */
  background-color: var(--bg-header-local);
  border-bottom: rem(1px) solid var(--grey-light);

  flex-shrink: 0;
  z-index: 10;
}

.board-title {
  font-size: rem(19px);
  font-weight: var(--font-weight-extra-bold);
  color: var(--board-local);
  margin: 0;
}

.write-btn {
  position: absolute;
  right: rem(15px);
  display: flex;
  align-items: center;
  gap: rem(5px);
  background-color: var(--white);
  border: rem(1px) solid var(--board-local);
  border-radius: rem(6px);
  padding: rem(6px) rem(12px);
  font-size: rem(14px);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-strong);
  cursor: pointer;
  transition: background-color 0.2s;
}

.write-btn:hover {
  background-color: var(--bg-header-local);
}

.filter-wrapper {
  padding: rem(10px) rem(15px);
  background-color: var(--white);
  border-bottom: 1px solid var(--grey-light);
  display: flex;
  align-items: center;
  gap: rem(10px);
}

.filter-btn {
  padding: rem(8px) rem(20px);
  height: rem(40px);
  border-radius: rem(999px);
  border: none;
  background: linear-gradient(90deg, #2e695560, #2e695560);
  font-size: rem(14px);
  font-weight: var(--font-weight-semibold);
  color: var(--text-title);
  cursor: pointer;
}

.filter-summary {
  font-size: rem(13px);
  color: var(--color-text-default);
}

.post-list-wrapper {
  background-color: var(--white);
  padding: 0 rem(15px);

  flex: 1;
  overflow-y: auto;

  display: flex;
  flex-direction: column;

  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.empty-state {
  margin: auto;
  padding: rem(50px);
  text-align: center;
  color: var(--grey);
}

.pagination-wrapper {
  flex-shrink: 0;
  background-color: var(--white);
  border-top: rem(1px) solid var(--grey-light);

  padding-bottom: rem(10px);
  padding-top: rem(10px);
  z-index: 10;
}

.pagination-inner {
  padding: rem(10px) 0;
}

/* 스크롤바 커스텀 */
.post-list-wrapper::-webkit-scrollbar {
  width: rem(6px);
}
.post-list-wrapper::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: rem(3px);
}
</style>
