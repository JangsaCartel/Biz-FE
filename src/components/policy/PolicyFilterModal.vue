<!-- src/components/policy/PolicyFilterModal.vue -->
<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  domain: {
    type: String,
    default: '',
  },
  hashtag: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close', 'confirm'])

const localDomain = ref(props.domain)
const localHashtags = ref([...props.hashtag])
const openMenu = ref(null)

watch(
  () => props.open,
  (val) => {
    if (val) {
      localDomain.value = props.domain
      localHashtags.value = [...props.hashtag]
      openMenu.value = null
    }
  },
)

const toggleMenu = (menuKey) => {
  openMenu.value = openMenu.value === menuKey ? null : menuKey
}

const selectDomain = (option) => {
  localDomain.value = option
}

const toggleHashtag = (option) => {
  const idx = localHashtags.value.indexOf(option)
  if (idx === -1) {
    localHashtags.value.push(option)
  } else {
    localHashtags.value.splice(idx, 1)
  }
}

const hashtagDisplayText = computed(() => {
  if (!localHashtags.value.length) return '전체 해시태그 선택'
  return localHashtags.value.join(', ')
})

const handleClose = () => {
  openMenu.value = null
  emit('close')
}

const handleConfirm = () => {
  emit('confirm', {
    domain: localDomain.value,
    hashtag: [...localHashtags.value],
  })
  openMenu.value = null
  emit('close')
}

/* 초기화 + confirm */
const handleReset = () => {
  localDomain.value = ''
  localHashtags.value = []
  openMenu.value = null

  // 초기화된 값으로 바로 확정 + 모달 닫기
  emit('confirm', {
    domain: '',
    hashtag: [],
  })
  emit('close')
}

/** 옵션 목록 */
const domainOptions = [
  '금융 분야',
  '기술 분야',
  '인력 분야',
  '수출 분야',
  '내수 분야',
  '창업 분야',
  '경영 분야',
  '기타 분야',
]

const hashtagDomainOptions = ['금융', '기술', '인력', '수출', '내수', '창업', '경영', '기타']

const hashtagRegionOptions = [
  '서울',
  '부산',
  '대구',
  '인천',
  '광주',
  '대전',
  '울산',
  '세종',
  '경기',
  '강원',
  '충북',
  '충남',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
]
</script>

<template>
  <div
    v-if="open"
    class="PolicyFilterModal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="policy-filter-modal-title"
    @click="handleClose"
  >
    <div class="PolicyFilterModal" @click.stop>
      <!-- 제목 영역-->
      <div class="PolicyFilterModal-header">
        <h2 id="policy-filter-modal-title" class="PolicyFilterModal-title">필터 설정</h2>
        <button class="PolicyFilterModal-close" type="button" @click="handleClose">✕</button>
      </div>

      <!-- 드롭다운 영역 -->
      <div class="PolicyFilterModal-body">
        <!-- 분야 드롭다운 -->
        <div class="FilterField">
          <p class="FilterField-label">분야</p>

          <button
            type="button"
            class="FilterField-trigger"
            :class="{ 'is-open': openMenu === 'domain' }"
            @click="toggleMenu('domain')"
          >
            <span class="FilterField-trigger-text">
              {{ localDomain || '전체 분야 선택' }}
            </span>
            <span class="FilterField-trigger-arrow" />
          </button>

          <div v-if="openMenu === 'domain'" class="FilterField-dropdown">
            <ul class="FilterField-list">
              <li
                v-for="option in domainOptions"
                :key="option"
                class="FilterField-item"
                :class="{ 'is-selected': localDomain === option }"
                @click="selectDomain(option)"
              >
                {{ option }}
              </li>
            </ul>
          </div>
        </div>

        <!-- 해시태그 드롭다운 (분야/지역 두 컬럼) -->
        <div class="FilterField">
          <p class="FilterField-label">해시태그</p>

          <button
            type="button"
            class="FilterField-trigger"
            :class="{ 'is-open': openMenu === 'hashtag' }"
            @click="toggleMenu('hashtag')"
          >
            <span class="FilterField-trigger-text">
              {{ hashtagDisplayText }}
            </span>
            <span class="FilterField-trigger-arrow" />
          </button>

          <div
            v-if="openMenu === 'hashtag'"
            class="FilterField-dropdown FilterField-dropdown--grid"
          >
            <div class="FilterField-column">
              <p class="FilterField-column-title">분야</p>
              <ul class="FilterField-list">
                <li
                  v-for="option in hashtagDomainOptions"
                  :key="option"
                  class="FilterField-item"
                  :class="{ 'is-selected': localHashtags.includes(option) }"
                  @click="toggleHashtag(option)"
                >
                  {{ option }}
                </li>
              </ul>
            </div>

            <div class="FilterField-column">
              <p class="FilterField-column-title">지역</p>
              <ul class="FilterField-list">
                <li
                  v-for="option in hashtagRegionOptions"
                  :key="option"
                  class="FilterField-item"
                  :class="{ 'is-selected': localHashtags.includes(option) }"
                  @click="toggleHashtag(option)"
                >
                  {{ option }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 버튼 영역 -->
      <div class="PolicyFilterModal-footer">
        <button
          type="button"
          class="PolicyFilterModal-btn PolicyFilterModal-btn-reset"
          @click="handleReset"
        >
          초기화
        </button>
        <button
          type="button"
          class="PolicyFilterModal-btn PolicyFilterModal-btn-confirm"
          @click="handleConfirm"
        >
          완료
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.PolicyFilterModal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.PolicyFilterModal {
  position: relative;
  width: min(rem(360px), 100% - rem(32px));
  height: auto;
  max-height: 80vh;
  background-color: #ffffff;
  border-radius: rem(12px);
  padding: rem(16px) rem(16px) rem(12px);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.PolicyFilterModal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: rem(12px);
}

.PolicyFilterModal-title {
  font-size: rem(16px);
  font-weight: var(--font-weight-bold);
  color: var(--black);
}

.PolicyFilterModal-close {
  border: none;
  background: transparent;
  font-size: rem(18px);
  cursor: pointer;
}

.PolicyFilterModal-body {
  flex: 0 0 auto;
  overflow: visible;
}

.FilterField {
  margin-bottom: rem(12px);
}

.FilterField-label {
  font-size: rem(12px);
  font-weight: var(--font-weight-semibold);
  color: var(--text-title);
  margin-bottom: rem(4px);
}

.FilterField-trigger {
  width: 100%;
  padding: rem(8px) rem(10px);
  border-radius: rem(8px);
  border: rem(1px) solid var(--grey-light);
  background-color: var(--white);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  gap: rem(10px);
  overflow: visible;

  &.is-open {
    border-color: var(--semi-signature-color);
  }
}

.FilterField-trigger-text {
  font-size: rem(13px);
  color: var(--black);
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: rem(3px);
}

.FilterField-trigger-arrow {
  flex: 0 0 auto;
  width: rem(8px);
  height: rem(8px);
  border-right: rem(2px) solid var(--text-subtitle);
  border-bottom: rem(2px) solid var(--text-subtitle);
  box-sizing: content-box;
  transform: translateY(rem(-1px)) rotate(45deg);
}

.FilterField-dropdown,
.FilterField-dropdown--grid {
  max-height: rem(220px);
  overflow-y: auto;
}

.FilterField-dropdown {
  margin-top: rem(4px);
  border-radius: rem(8px);
  border: rem(1px) solid var(--grey-light);
  background-color: var(--white);
  max-height: rem(220px);
}

/* 해시태그용 2컬럼 레이아웃 */
.FilterField-dropdown--grid {
  display: flex;
  max-height: rem(220px);
}

.FilterField-column {
  flex: 1 1 50%;
  border-right: rem(1px) solid #f0f0f0;

  &:last-child {
    border-right: none;
  }
}

.FilterField-column-title {
  padding: rem(6px) rem(10px) rem(4px);
  font-size: rem(11px);
  font-weight: var(--font-weight-semibold);
  color: var(--text-title);
}

.FilterField-list {
  list-style: none;
  margin: 0;
  padding: 0 0 rem(4px);
}

.FilterField-item {
  padding: rem(6px) rem(10px);
  font-size: rem(13px);
  color: var(--black);
  cursor: pointer;

  &:hover {
    background-color: var(--grey-light);
  }

  &.is-selected {
    background-color: #ffcc3c30;
    color: var(--text-title);
    font-weight: var(--font-weight-semibold);
  }
}

.PolicyFilterModal-footer {
  margin-top: rem(12px);
  display: flex;
  justify-content: flex-end;
  gap: rem(8px);
}

.PolicyFilterModal-btn {
  min-width: rem(72px);
  padding: rem(6px) rem(12px);
  border-radius: rem(999px);
  font-size: rem(13px);
  border: rem(1px) solid transparent;
  cursor: pointer;
}

.PolicyFilterModal-btn-reset {
  background-color: var(--white);
  border-color: var(--grey-light);
  color: var(--text-title);
}

.PolicyFilterModal-btn-confirm {
  background-color: var(--semi-signature-color);
  color: var(--black);
}
</style>
