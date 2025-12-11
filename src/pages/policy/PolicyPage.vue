<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchPolicyList } from '@/api/policyApi'

import { usePolicyStore } from '@/stores/policyStore'
const policyStore = usePolicyStore()

import PolicyCard from '@/components/policy/PolicyCard.vue'
import PolicyFilterModal from '@/components/policy/PolicyFilterModal.vue'
import AppPagination from '@/components/common/AppPagination.vue'

const router = useRouter()

/* ================= 상태 ================= */

const currentPage = ref(1)
const pageSize = ref(4)
const totalItems = ref(0)

const policyList = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

/* ===== 필터 상태 ===== */
const isFilterModalOpen = ref(false)
const selectedDomain = ref('')
const selectedHashtags = ref([])

const filterSummary = computed(() => ({
  domainText: selectedDomain.value || '전체',
  hashtagsText: selectedHashtags.value.length ? selectedHashtags.value.join(', ') : '전체',
}))

/* ================= API 호출 ================= */

async function loadPolicies(page = currentPage.value) {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const res = await fetchPolicyList({
      page,
      size: pageSize.value,
      domain: selectedDomain.value,
      hashtags: selectedHashtags.value,
    })

    const items = res.items ?? []

    currentPage.value = res.page ?? page
    pageSize.value = res.size ?? pageSize.value
    totalItems.value = res.totalItems ?? 0

    policyList.value = items

    // console.log('[PolicyPage] items:', policyList.value.length, '개')
  } catch (err) {
    console.error('[PolicyPage] 정책 목록 조회 실패:', err)
    errorMessage.value = '정책 목록을 불러오는 중 오류가 발생했습니다.'
    policyList.value = []
    totalItems.value = 0
  } finally {
    isLoading.value = false
  }
}

/* ================= 이벤트 핸들러 ================= */

const handleCardClick = (item) => {
  console.log('카드 클릭, 공고 ID:', item.id)

  policyStore.setSelectedPolicy(item)

  router.push({
    name: 'policyDetail',
    params: { id: item.id },
  })
}

/** 페이지네이션에서 페이지 클릭 */
const handlePageChange = (newPage) => {
  loadPolicies(newPage)
}

/** 필터 모달 열기/닫기 */
const openFilterModal = () => {
  isFilterModalOpen.value = true
}
const closeFilterModal = () => {
  isFilterModalOpen.value = false
}

/** 모달에서 '완료' 클릭 */
const handleFilterConfirm = ({ domain, hashtag }) => {
  selectedDomain.value = domain || ''
  selectedHashtags.value = hashtag || []

  // console.log('[PolicyPage] 현재 필터:', {
  //   domain: selectedDomain.value,
  //   hashtag: selectedHashtags.value,
  // })

  currentPage.value = 1
  loadPolicies(1)
}

/* ================= 초기 로딩 ================= */

onMounted(() => {
  loadPolicies(1)
})
</script>

<template>
  <div class="PolicyWrapper">
    <!-- 상단 필터 버튼 -->
    <div class="PolicyFilterBar">
      <button type="button" class="PolicyFilterBar-button" @click="openFilterModal">
        필터 선택
      </button>

      <!-- 현재 선택값 표시 -->
      <div class="PolicyFilterBar-current">
        <span>분야: {{ filterSummary.domainText }}</span>
        <span>해시태그: {{ filterSummary.hashtagsText }}</span>
      </div>
    </div>

    <!-- 로딩/에러/목록 -->
    <div v-if="isLoading" class="PolicyState-text">불러오는 중...</div>

    <div v-else-if="errorMessage" class="PolicyState-text PolicyState-error">
      {{ errorMessage }}
    </div>

    <div v-else class="PolicyList">
      <PolicyCard
        v-for="item in policyList"
        :key="item.id"
        v-bind="item"
        @click="handleCardClick"
      />
      <div v-if="!policyList.length" class="PolicyState-text">표시할 공고가 없습니다.</div>
    </div>

    <!-- 페이지네이션 -->
    <div class="PolicyPagination">
      <AppPagination
        :current-page="currentPage"
        :total-items="totalItems"
        :page-size="pageSize"
        @page-change="handlePageChange"
      />
    </div>

    <!-- 필터 모달 -->
    <PolicyFilterModal
      :open="isFilterModalOpen"
      :domain="selectedDomain"
      :hashtag="selectedHashtags"
      @close="closeFilterModal"
      @confirm="handleFilterConfirm"
    />
  </div>
</template>

<style scoped lang="scss">
.PolicyWrapper {
  background-color: var(--bg-default);
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
}

.PolicyFilterBar {
  padding: rem(8px) rem(12px);
  display: flex;
  flex-direction: column;
  gap: rem(4px);
}

.PolicyFilterBar-button {
  width: 100%;
  height: rem(40px);
  border-radius: rem(999px);
  border: none;
  background: linear-gradient(90deg, var(--signature-color), var(--semi-signature-color));
  font-size: rem(14px);
  font-weight: var(--font-weight-semibold);
  color: var(--text-title);
  margin: rem(10px) 0;
}

.PolicyFilterBar-current {
  font-size: rem(11px);
  color: var(--color-text-default);
  display: flex;
  flex-direction: column;
  gap: rem(2px);
}

.PolicyList {
  overflow: hidden;
}

.PolicyPagination {
  flex: 0 0 auto;
  padding: rem(6px) rem(12px) rem(10px);
}

.PolicyState-text {
  padding: rem(16px);
  text-align: center;
  font-size: rem(13px);
  color: var(--color-text-light);
}

.PolicyState-error {
  color: var(--board-hot);
}
</style>
