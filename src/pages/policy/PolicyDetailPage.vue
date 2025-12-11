<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePolicyStore } from '@/stores/policyStore'

import fileIcon from '@/assets/icons/policy/file.png'
import nextIcon from '@/assets/icons/common/next.png'
import shareIcon from '@/assets/icons/common/share.png'

const router = useRouter()

const policyStore = usePolicyStore()

const detail = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

const goBack = () => {
  router.back()
}

const handleShare = () => {
  if (!detail.value) return

  const shareData = {
    title: detail.value.title,
    text: detail.value.title,
    url: window.location.href,
  }

  if (navigator.share) {
    navigator.share(shareData).catch(() => {})
  } else {
    window.navigator.clipboard?.writeText(window.location.href)
    alert('현재 페이지 주소가 복사되었습니다.')
  }
}

const handleOriginalClick = () => {
  if (detail.value?.originalUrl) {
    window.open(detail.value.originalUrl, '_blank')
  }
}

onMounted(() => {
  detail.value = policyStore.selectedPolicy
  if (!detail.value) {
    alert('유효하지 않은 접근입니다.')
    router.replace('/policy')
  }
})
</script>

<template>
  <div class="PolicyDetailWrapper">
    <!-- 상단 헤더 -->
    <header class="PolicyDetailHeader">
      <button type="button" class="HeaderIconButton" @click="goBack">
        <img :src="nextIcon" alt="뒤로가기" class="HeaderIconImage" />
      </button>
      <h1 class="HeaderTitle">정책</h1>
      <button type="button" class="HeaderIconButton" @click="handleShare">
        <img :src="shareIcon" alt="공유" class="HeaderIconImage" />
      </button>
    </header>

    <!-- 본문 영역 -->
    <main class="PolicyDetailMain">
      <div v-if="isLoading" class="PolicyDetailState">불러오는 중...</div>

      <div v-else-if="errorMessage" class="PolicyDetailState PolicyDetailState-error">
        {{ errorMessage }}
      </div>

      <template v-else-if="detail">
        <!-- 요약 카드 -->
        <section class="SummaryCard">
          <div class="SummaryCardScrollable">
            <p class="SummaryOrg">{{ detail.organization }}</p>

            <h2 class="SummaryTitle">
              {{ detail.title }}
            </h2>

            <div class="SummaryMeta">
              <p class="SummaryMetaItem">
                <span class="SummaryMetaLabel">대상</span>
                <span class="SummaryMetaValue">{{ detail.target }}</span>
              </p>
              <p class="SummaryMetaItem">
                <span class="SummaryMetaLabel">접수</span>
                <span class="SummaryMetaValue">
                  {{ detail.period }}
                  <span v-if="detail.dday" class="SummaryDDay">[{{ detail.dday }}]</span>
                </span>
              </p>
              <p class="SummaryMetaItem">
                <span class="SummaryMetaLabel">문의</span>
                <span class="SummaryMetaValue">{{ detail.contact }}</span>
              </p>
            </div>
          </div>

          <!-- 신청 / 원문 버튼 -->
          <div class="SummaryButtons">
            <button
              type="button"
              class="SummaryButton SummaryButton-outline"
              @click="handleOriginalClick"
            >
              <span>원문 보기</span>
              <img :src="fileIcon" alt="" class="OriginalLinkIcon" />
            </button>
          </div>
        </section>

        <!-- 본문 HTML -->
        <section class="BodySection">
          <h3 class="SectionTitle">사업 내용</h3>
          <div class="BodyScroll">
            <div class="BodyHtml" v-html="detail.htmlContent" />
          </div>
        </section>

        <!-- 첨부파일 -->
        <section
          v-if="detail.mainFileName || (detail.extraFileNames && detail.extraFileNames.length)"
          class="AttachmentSection"
        >
          <h3 class="SectionTitle">첨부파일</h3>

          <div class="AttachmentScroll">
            <ol class="AttachmentList">
              <!-- 대표 첨부 -->
              <li v-if="detail.mainFileName" class="AttachmentItem">
                1.
                <a
                  v-if="detail.printFlpthNm"
                  :href="detail.printFlpthNm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ detail.mainFileName }}
                </a>
                <span v-else>{{ detail.mainFileName }}</span>
              </li>

              <!-- 추가 첨부들 -->
              <li v-for="(file, idx) in detail.extraFileNames" :key="idx" class="AttachmentItem">
                {{ detail.mainFileName ? idx + 2 : idx + 1 }}.
                <template v-if="detail.extraFileUrls && detail.extraFileUrls[idx]">
                  <a :href="detail.extraFileUrls[idx]" target="_blank" rel="noopener noreferrer">
                    {{ file }}
                  </a>
                </template>
                <template v-else>
                  {{ file }}
                </template>
              </li>
            </ol>
          </div>
        </section>

        <!-- 등록일 -->
        <section class="FooterSection">
          <p class="CreatedAt">등록일: {{ detail.createdAt }}</p>
        </section>
      </template>

      <div v-else class="PolicyDetailState">표시할 정책 정보가 없습니다.</div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.PolicyDetailWrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: var(--bg-default);
}

/* ===== 헤더 ===== */
.PolicyDetailHeader {
  margin-top: rem(10px);
  flex: 0 0 auto;
  height: rem(40px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 rem(12px);
  background-color: var(--yellow);
}

.HeaderIconButton {
  width: rem(32px);
  height: rem(32px);
  border: none;
  background: transparent;
  font-size: rem(18px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.HeaderIconImage {
  width: rem(20px);
  height: rem(20px);
  object-fit: contain;
  display: block;
}

.HeaderTitle {
  flex: 1;
  text-align: center;
  font-size: rem(18px);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

/* ===== 메인 ===== */
.PolicyDetailMain {
  flex: 1 1 auto;
  padding: rem(12px) rem(16px) rem(16px);
  overflow-y: auto;
}

.PolicyDetailState {
  padding: rem(16px);
  text-align: center;
  font-size: rem(13px);
  color: var(--color-text-light);
}

.PolicyDetailState-error {
  color: var(--board-hot--error);
}

/* ===== 요약 카드 ===== */
.SummaryCard {
  background-color: var(--white);
  border-radius: rem(6px);
  padding: rem(14px) rem(12px);
  margin-bottom: rem(12px);

  display: flex;
  flex-direction: column;
}

.SummaryCardScrollable {
  max-height: 30vh;
  overflow-y: auto;
  padding-right: rem(4px);
  margin-bottom: rem(8px);
}

.SummaryOrg {
  font-size: rem(12px);
  color: var(--board-info);
  margin-bottom: rem(4px);
}

.SummaryTitle {
  font-size: rem(14px);
  font-weight: var(--font-weight-bold);
  line-height: 1.5;
  margin-bottom: rem(8px);
}

.SummaryMeta {
  font-size: rem(12px);
  color: var(--text-title);
  margin-bottom: rem(10px);
}

.SummaryMetaItem {
  display: flex;
  gap: rem(4px);
  margin-bottom: rem(2px);
}

.SummaryMetaLabel {
  min-width: rem(36px);
  color: var(--text-subtitle);
}

.SummaryMetaValue {
  flex: 1 1 auto;
}

.SummaryDDay {
  margin-left: rem(4px);
  color: var(--board-hot);
  font-weight: var(--font-weight-semibold);
}

/* 버튼 */
.SummaryButtons {
  display: flex;
  gap: rem(8px);
  margin-top: rem(8px);
  flex-shrink: 0;
}

.SummaryButton {
  flex: 1 1 0;
  height: rem(40px);
  border-radius: rem(6px);
  font-size: rem(13px);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: rem(8px);
}

.SummaryButton-outline {
  background-color: var(--white);
  border: 1px solid var(--grey);
}

.OriginalLinkIcon {
  width: rem(20px);
  height: rem(20px);
  object-fit: contain;
  display: block;
}

/* ===== 본문 HTML ===== */
.BodySection {
  background-color: var(--white);
  border-radius: rem(6px);
  padding: rem(14px) rem(12px);
  margin-bottom: rem(12px);

  display: flex;
  flex-direction: column;
}

.SectionTitle {
  font-size: rem(13px);
  font-weight: var(--font-weight-bold);
  margin-bottom: rem(8px);
}

.BodyScroll {
  max-height: 40vh;
  overflow-y: auto;
  padding-right: rem(4px);
}

.BodyHtml {
  font-size: rem(12px);
  line-height: 1.6;

  :deep(p) {
    margin: 0 0 rem(4px);
  }

  :deep(li) {
    margin-left: rem(16px);
  }
}

/* ===== 첨부파일 ===== */
.AttachmentSection {
  background-color: var(--white);
  border-radius: rem(6px);
  padding: rem(14px) rem(12px);
  margin-bottom: rem(12px);

  display: flex;
  flex-direction: column;
}

.AttachmentScroll {
  max-height: 30vh;
  overflow-y: auto;
  padding-right: rem(4px);
}

.AttachmentList {
  margin: 0;
  padding-left: rem(16px);
  font-size: rem(12px);
}

.AttachmentItem + .AttachmentItem {
  margin-top: rem(4px);
}

/* ===== 등록일 ===== */
.FooterSection {
  padding: rem(4px) rem(2px) rem(8px);
  font-size: rem(11px);
  color: var(--text-subtitle);
}

.CreatedAt {
  margin: 0;
}
</style>
