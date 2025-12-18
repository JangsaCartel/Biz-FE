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
import { computed } from 'vue'

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

const totalPages = computed(() => {
  if (props.totalItems === 0) return 1
  return Math.ceil(props.totalItems / props.pageSize)
})

const displayedPages = computed(() => {
  const current = props.currentPage
  const total = totalPages.value
  const sidePages = 2
  const pages = []

  if (total <= 1) {
    return [1]
  }

  for (let i = current - sidePages; i <= current + sidePages; i++) {
    if (i > 0 && i <= total) {
      pages.push(i)
    }
  }

  if (pages[0] > 2) {
    pages.unshift('...')
    pages.unshift(1)
  } else if (pages[0] === 2) {
    pages.unshift(1)
  }

  if (pages[pages.length - 1] < total - 1) {
    pages.push('...')
    pages.push(total)
  } else if (pages[pages.length - 1] === total - 1) {
    pages.push(total)
  }

  return pages
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

.page-btn:hover:not(.active):not(:disabled) {
  background-color: #f0f0f0;
  color: #333;
}

.page-btn.active {
  background-color: #ffe082;
  color: #000;
  font-weight: 700;
}

.prev-next {
  font-family: monospace;
  font-size: 1.1rem;
  color: #999;
}

.page-btn:disabled {
  color: #e0e0e0;
  cursor: not-allowed;
}

.dots {
  padding: 0 5px;
  color: #999;
  font-size: 0.9rem;
  letter-spacing: 1px;
}
</style>
