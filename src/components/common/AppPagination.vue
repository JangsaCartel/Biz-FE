<template>
  <div class="pagination-container">
    <div class="pagination">
      <button
        class="page-btn prev-next"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        &lt;
      </button>

      <template v-for="(page, index) in displayedPages" :key="index">
        <button
          v-if="page !== '...'"
          class="page-btn"
          :class="{ active: page === currentPage }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>

        <span v-else class="dots"> ... </span>
      </template>

      <button
        class="page-btn prev-next"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        &gt;
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  pageSize: {
    type: Number,
    default: 5,
  },
})

const emit = defineEmits(['page-change'])

// 전체 페이지 수 계산
const totalPages = computed(() => {
  if (props.totalItems === 0) return 1
  return Math.ceil(props.totalItems / props.pageSize)
})

// *** 핵심: 이미지 같은 '...' 페이지네이션 로직 ***
const displayedPages = computed(() => {
  const total = totalPages.value
  const current = props.currentPage
  const delta = 2
  const range = []
  const rangeWithDots = []
  let l

  range.push(1)

  for (let i = current - delta; i <= current + delta; i++) {
    if (i < total && i > 1) {
      range.push(i)
    }
  }
  range.push(total)

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  }

  return rangeWithDots
})

const changePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    emit('page-change', page)
  }
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 40px 0;
  background-color: transparent;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn {
  background: none;
  border: none;
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  cursor: pointer;
  border-radius: 8px;
  font-size: 1rem;
  color: #555;
  font-weight: 400;
  transition: all 0.2s;
}

/* 마우스 올렸을 때 */
.page-btn:hover:not(.active):not(:disabled) {
  background-color: #f0f0f0;
  color: #333;
}

/* 활성화 된 페이지 */
.page-btn.active {
  background-color: #ffe082;
  color: #000;
  font-weight: 700;
}

/* 이전/다음 화살표 버튼 */
.prev-next {
  font-family: monospace;
  font-size: 1.1rem;
  color: #999;
}

.page-btn:disabled {
  color: #e0e0e0;
  cursor: not-allowed;
}

/* 점 (...) 스타일 */
.dots {
  padding: 0 5px;
  color: #999;
  font-size: 0.9rem;
  letter-spacing: 1px;
}
</style>
