<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fetchPolicyList } from '@/api/policyApi'

import { usePolicyStore } from '@/stores/policyStore'
const policyStore = usePolicyStore()

import PolicyCard from '@/components/policy/PolicyCard.vue'
import PolicyFilterModal from '@/components/policy/PolicyFilterModal.vue'
import AppPagination from '@/components/common/AppPagination.vue'

const router = useRouter()
const route = useRoute()

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

/* ================= query 파싱/생성 ================= */

const parsePage = (q) => {
  const n = Number(q)
  return Number.isFinite(n) && n > 0 ? n : 1
}

const parseHashtags = (q) => {
  if (Array.isArray(q)) {
    return q.flatMap((v) => String(v).split(',')).filter(Boolean)
  }
  if (typeof q === 'string' && q.trim()) {
    return q
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
  }
  return []
}

const buildQuery = ({ page, domain, hashtags }) => {
  const next = { ...route.query }

  // page는 항상 유지
  next.page = String(page)

  // domain 없으면 제거
  if (domain) next.domain = domain
  else delete next.domain

  // hashtags 없으면 제거 (CSV 한 칸으로 저장)
  const hs = (hashtags ?? []).length ? (hashtags ?? []).join(',') : ''
  if (hs) next.hashtags = hs
  else delete next.hashtags

  return next
}

/* ================= API 호출 ================= */

async function loadPolicies(page) {
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
  } catch (err) {
    console.error('[PolicyPage] 정책 목록 조회 실패:', err)
    errorMessage.value = '정책 목록을 불러오는 중 오류가 발생했습니다.'
    policyList.value = []
    totalItems.value = 0
  } finally {
    isLoading.value = false
  }
}

/* ================= route.query 변화에 따라 복원/로딩 ================= */
/**
 * - 상세로 갔다가 뒤로오면 query가 그대로 남아있음
 * - 브라우저 뒤/앞 이동에도 동일하게 복원됨
 */
watch(
  () => [route.query.page, route.query.domain, route.query.hashtags],
  async () => {
    currentPage.value = parsePage(route.query.page)
    selectedDomain.value = typeof route.query.domain === 'string' ? route.query.domain : ''
    selectedHashtags.value = parseHashtags(route.query.hashtags)

    await loadPolicies(currentPage.value)
  },
  { immediate: true },
)

/* ================= 이벤트 핸들러 ================= */

const handleCardClick = (item) => {
  policyStore.setSelectedPolicy(item)

  // ✅ 현재 목록 상태(query)를 상세로도 같이 넘겨두면, 상세의 "목록으로" 버튼에서도 그대로 복귀 가능
  router.push({
    name: 'policyDetail',
    params: { id: item.id },
    query: route.query,
  })
}

/** 페이지네이션에서 페이지 클릭 */
const handlePageChange = (newPage) => {
  // ✅ query만 바꾸면 watch가 알아서 loadPolicies 실행
  router.replace({
    query: buildQuery({
      page: newPage,
      domain: selectedDomain.value,
      hashtags: selectedHashtags.value,
    }),
  })
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

  // ✅ 필터 바꾸면 1페이지로 + query 갱신 → watch가 1페이지 로딩
  router.replace({
    query: buildQuery({ page: 1, domain: selectedDomain.value, hashtags: selectedHashtags.value }),
  })
}
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
    <div class="PolicyList">
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
  max-height: 100%;
  min-height: 0;

  display: flex;
  flex-direction: column;

  overflow: hidden;
  box-sizing: border-box;
}

.PolicyFilterBar {
  flex: 0 0 auto;
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
  flex: 1 1 auto;
  min-height: 0; /* ✅ overflow-y가 정상 동작하는 핵심 */
  overflow-y: auto; /* ✅ 리스트만 스크롤 */
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;

  overscroll-behavior: contain;

  scrollbar-width: none;
  -ms-overflow-style: none;
}

.PolicyList::-webkit-scrollbar {
  width: 0;
  height: 0;
}
.PolicyList::-webkit-scrollbar-thumb {
  background: transparent;
}
.PolicyList::-webkit-scrollbar-track {
  background: transparent;
}

.PolicyPagination {
  flex: 0 0 auto;
  margin-top: auto;
  padding: rem(6px) rem(12px) rem(10px);

  background-color: var(--bg-default);
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
