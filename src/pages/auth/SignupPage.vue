<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { signupWithExtraInfo } from '@/api/authApi'
import {
  getProviderId,
  clearProviderId,
  saveTokens,
  getPostLoginRedirect,
  clearPostLoginRedirect,
} from '@/stores/tokenStorage'
import RegionDropdowns from '@/components/common/RegionDropdowns.vue'
import ModalDialog from '@/components/common/ModalDialog.vue'
import { termsTitle, termsOfService } from '@/assets/data/termsData'

const router = useRouter()
const route = useRoute()

const totalSteps = 2
const currentStep = ref(1)

const NICKNAME_MAX = 15
const STORE_NAME_MAX = 32

const nickname = ref('')
const region = ref('')
const regionData = ref({ sido: '', gugun: '', dong: '' })
const userStoreName = ref('')
const businessType = ref('')
const businessRegNo = ref('')
const businessStartDate = ref('')

const isAgreed = ref(false)
const termsModalVisible = ref(false)

const selectedYear = ref('')
const selectedMonth = ref('')
const selectedDay = ref('')

const isSubmitting = ref(false)
const globalError = ref('')
const futureDateModalVisible = ref(false)

const stepOneErrors = ref({
  businessRegNo: '',
  businessStartDate: '',
})

const stepTwoErrors = ref({
  nickname: '',
  region: '',
  userStoreName: '',
  businessType: '',
  agreement: '',
})

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 40 }, (_, idx) => currentYear - idx)
const monthOptions = Array.from({ length: 12 }, (_, idx) => idx + 1)
const dayOptions = computed(() => {
  if (!selectedYear.value || !selectedMonth.value) return []
  const lastDay = new Date(Number(selectedYear.value), Number(selectedMonth.value), 0).getDate()
  return Array.from({ length: lastDay }, (_, idx) => idx + 1)
})

watch([selectedYear, selectedMonth], () => {
  const lastDay = new Date(
    Number(selectedYear.value || currentYear),
    Number(selectedMonth.value || 1),
    0,
  ).getDate()
  if (Number(selectedDay.value) > lastDay) {
    selectedDay.value = ''
  }
})

watch([selectedYear, selectedMonth, selectedDay], () => {
  if (selectedYear.value && selectedMonth.value && selectedDay.value) {
    const year = selectedYear.value
    const month = String(selectedMonth.value).padStart(2, '0')
    const day = String(selectedDay.value).padStart(2, '0')
    businessStartDate.value = `${year}-${month}-${day}`
  } else {
    businessStartDate.value = ''
  }
})

const BUSINESS_REG_NO_LENGTH = 10

const handleBusinessRegNoInput = (event) => {
  const onlyDigits = event.target.value.replace(/\D/g, '')
  businessRegNo.value = onlyDigits.slice(0, BUSINESS_REG_NO_LENGTH)
}

const businessTypeOptions = [
  { label: '외식업', value: 1 },
  { label: '카페업', value: 2 },
  { label: '도·소매업', value: 3 },
  { label: '스포츠·오락', value: 4 },
  { label: '미용업', value: 5 },
  { label: '숙박업', value: 6 },
  { label: '부동산', value: 7 },
  { label: '제조업', value: 8 },
  { label: '건설업', value: 9 },
]

onMounted(() => {
  const tempNickname = route.query.tempNickname
  if (typeof tempNickname === 'string' && tempNickname.length > 0) {
    nickname.value = tempNickname.slice(0, NICKNAME_MAX)
  }

  const providerId = getProviderId()
  if (!providerId) {
    router.replace({ name: 'login' })
  }
})

const validateStepOne = () => {
  if (!businessRegNo.value) {
    stepOneErrors.value.businessRegNo = '사업자 등록번호를 입력해주세요.'
  } else if (businessRegNo.value.length !== BUSINESS_REG_NO_LENGTH) {
    stepOneErrors.value.businessRegNo = `사업자 등록번호는 ${BUSINESS_REG_NO_LENGTH}자리 숫자여야 합니다.`
  } else {
    stepOneErrors.value.businessRegNo = ''
  }
  stepOneErrors.value.businessStartDate = businessStartDate.value
    ? ''
    : '확인되는 정보가 없습니다. 날짜를 다시 선택해주세요.'

  return !stepOneErrors.value.businessRegNo && !stepOneErrors.value.businessStartDate
}

const validateStepTwo = () => {
  stepTwoErrors.value.nickname = nickname.value ? '' : '닉네임을 입력해주세요.'

  // 지역 유효성 검사 로직 변경
  const { sido, gugun, dong } = regionData.value
  const isSejong = sido === '세종특별자치시'

  // 세종시는 sido와 dong만 체크, 그 외는 gugun까지 체크
  const isRegionValid = isSejong ? sido && dong : sido && gugun && dong

  stepTwoErrors.value.region = isRegionValid ? '' : '활동 지역을 선택해주세요.'

  stepTwoErrors.value.userStoreName = userStoreName.value ? '' : '가게 상호명을 입력해주세요.'
  stepTwoErrors.value.businessType = businessType.value ? '' : '사업 종류를 선택해주세요.'
  stepTwoErrors.value.agreement = isAgreed.value ? '' : '약관 및 AI 활용 동의는 필수입니다.'

  return (
    !stepTwoErrors.value.nickname &&
    !stepTwoErrors.value.region &&
    !stepTwoErrors.value.userStoreName &&
    !stepTwoErrors.value.businessType &&
    !stepTwoErrors.value.agreement
  )
}

const handleNextStep = () => {
  if (validateStepOne()) {
    if (businessStartDate.value) {
      const selectedDate = new Date(businessStartDate.value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate > today) {
        futureDateModalVisible.value = true
        return
      }
    }
    currentStep.value = 2
  }
}

const handleFutureDateModalPrimary = () => {
  futureDateModalVisible.value = false
  currentStep.value = 2
}

const handleFutureDateModalSecondary = () => {
  futureDateModalVisible.value = false
}

const handleRegionUpdate = (regionInfo) => {
  regionData.value = regionInfo
  const { sido, gugun, dong } = regionInfo

  // 세종특별자치시인 경우 gugun이 없어도 dong만 있으면 텍스트 완성
  if (sido === '세종특별자치시') {
    if (sido && dong) {
      region.value = `${sido} ${dong}`
    } else {
      region.value = ''
    }
  } else {
    // 그 외 지역은 gugun까지 모두 있어야 함
    if (sido && gugun && dong) {
      region.value = `${sido} ${gugun} ${dong}`
    } else {
      region.value = ''
    }
  }
}

const handlePrevStep = () => {
  currentStep.value = 1
}

const handleBackToLogin = () => {
  clearProviderId()
  router.replace({ name: 'login' })
}

const openTermsModal = () => {
  termsModalVisible.value = true
}

const closeTermsModal = () => {
  termsModalVisible.value = false
}

const onSubmit = async () => {
  globalError.value = ''

  const providerId = getProviderId()
  if (!providerId) {
    router.replace({ name: 'login' })
    return
  }

  if (!validateStepTwo()) {
    return
  }

  isSubmitting.value = true
  try {
    const payload = {
      nickname: nickname.value,
      userSido: regionData.value.sido,
      userGugun: regionData.value.gugun,
      userDong: regionData.value.dong,
      userStoreName: userStoreName.value,
      businessType: Number(businessType.value),
      businessRegNo: Number(businessRegNo.value),
      businessStartDate: businessStartDate.value,
    }

    const res = await signupWithExtraInfo(payload, providerId)
    if (res.status === 'LOGIN_SUCCESS' && res.accessToken) {
      saveTokens(res.accessToken, res.refreshToken)
      clearProviderId()
      const storedRedirect = getPostLoginRedirect()
      const redirectTarget = storedRedirect && storedRedirect.startsWith('/') ? storedRedirect : '/'
      clearPostLoginRedirect()
      router.replace(redirectTarget)
      return
    }

    globalError.value = '회원가입 처리에 실패했습니다. 다시 시도해주세요.'
  } catch (e) {
    console.error('Signup failed', e)
    globalError.value = '회원가입 중 오류가 발생했습니다.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="signup-page">
    <div class="step-card">
      <header class="step-header">
        <h1 class="step-title">
          {{ currentStep === 1 ? '사업자 정보 확인' : '사장님 정보 입력' }}
        </h1>
        <p class="step-indicator">{{ currentStep }}/{{ totalSteps }}</p>
      </header>

      <div v-if="currentStep === 1" class="form-section">
        <div class="form-group">
          <label class="form-label">사업자 등록번호 *</label>
          <input
            v-model="businessRegNo"
            class="form-input"
            placeholder="사업자 등록번호를 입력해주세요!"
            inputmode="numeric"
            @input="handleBusinessRegNoInput"
          />
          <p v-if="stepOneErrors.businessRegNo" class="error-text">
            {{ stepOneErrors.businessRegNo }}
          </p>
        </div>

        <div class="form-group">
          <label class="form-label">개업일자 *</label>
          <div class="date-select-row">
            <select v-model="selectedYear" class="date-select">
              <option value="" disabled>연도</option>
              <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</option>
            </select>
            <span class="date-divider">/</span>
            <select v-model="selectedMonth" class="date-select">
              <option value="" disabled>월</option>
              <option v-for="month in monthOptions" :key="month" :value="month">{{ month }}</option>
            </select>
            <span class="date-divider">/</span>
            <select v-model="selectedDay" class="date-select">
              <option value="" disabled>일</option>
              <option v-for="day in dayOptions" :key="day" :value="day">{{ day }}</option>
            </select>
          </div>
          <p v-if="stepOneErrors.businessStartDate" class="error-text">
            {{ stepOneErrors.businessStartDate }}
          </p>
        </div>

        <div class="button-row">
          <button type="button" class="ghost-button" @click="handleBackToLogin">처음으로</button>
          <button type="button" class="primary-button" @click="handleNextStep">다음</button>
        </div>
      </div>

      <div v-else class="form-section">
        <div class="form-group">
          <label class="form-label">닉네임 *</label>
          <div class="input-wrapper">
            <input
              v-model="nickname"
              class="form-input with-counter"
              placeholder="사장님을 어떻게 불러드릴까요?"
              :maxlength="NICKNAME_MAX"
            />
            <span class="char-counter" :class="{ 'text-danger': nickname.length >= NICKNAME_MAX }">
              {{ nickname.length }}/{{ NICKNAME_MAX }}
            </span>
          </div>
          <p v-if="stepTwoErrors.nickname" class="error-text">{{ stepTwoErrors.nickname }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">가게 상호명 *</label>
          <div class="input-wrapper">
            <input
              v-model="userStoreName"
              class="form-input with-counter"
              placeholder="사장님의 가게 상호명을 알고 싶어요!"
              :maxlength="STORE_NAME_MAX"
            />
            <span
              class="char-counter"
              :class="{ 'text-danger': userStoreName.length >= STORE_NAME_MAX }"
            >
              {{ userStoreName.length }}/{{ STORE_NAME_MAX }}
            </span>
          </div>
          <p v-if="stepTwoErrors.userStoreName" class="error-text">
            {{ stepTwoErrors.userStoreName }}
          </p>
        </div>

        <div class="form-group">
          <label class="form-label">사업 종류 *</label>
          <div class="select-wrapper">
            <select v-model="businessType" class="form-select">
              <option value="" disabled>사장님은 어떤 사업을 하시나요?</option>
              <option
                v-for="option in businessTypeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
          <p v-if="stepTwoErrors.businessType" class="error-text">
            {{ stepTwoErrors.businessType }}
          </p>
        </div>

        <div class="form-group">
          <label class="form-label">활동 지역 *</label>
          <RegionDropdowns @update:region="handleRegionUpdate" />
          <p v-if="stepTwoErrors.region" class="error-text">{{ stepTwoErrors.region }}</p>
        </div>

        <div class="form-group">
          <div class="checkbox-group">
            <div class="checkbox-row">
              <input id="agreement" v-model="isAgreed" type="checkbox" class="checkbox-input" />
              <label for="agreement" class="checkbox-label-text">
                <span class="terms-link" @click.prevent="openTermsModal">
                  서비스 이용약관 및 AI 활용 동의
                </span>
                (필수)
              </label>
            </div>
            <p v-if="stepTwoErrors.agreement" class="error-text">{{ stepTwoErrors.agreement }}</p>
          </div>
        </div>

        <div class="button-row">
          <button type="button" class="ghost-button" @click="handlePrevStep">이전 단계</button>
          <button type="button" class="primary-button" :disabled="isSubmitting" @click="onSubmit">
            {{ isSubmitting ? '처리 중...' : '완료' }}
          </button>
        </div>

        <p v-if="globalError" class="error-text global">{{ globalError }}</p>
      </div>

      <ModalDialog
        :message="'개업하실 예정이시군요! 미래의 사장님을 응원합니다!'"
        :is-visible="futureDateModalVisible"
        button-type="double"
        @primary="handleFutureDateModalPrimary"
        @secondary="handleFutureDateModalSecondary"
        @close="handleFutureDateModalSecondary"
      />

      <div v-if="termsModalVisible" class="modal-overlay" @click.self="closeTermsModal">
        <div class="modal-content terms-modal">
          <h2 class="terms-title">{{ termsTitle }}</h2>

          <div class="terms-body">
            <div v-for="(term, index) in termsOfService" :key="index" class="term-item">
              <h3>{{ term.article }}</h3>

              <div
                v-for="(paragraph, pIndex) in term.paragraphs"
                :key="pIndex"
                class="term-paragraph"
              >
                <div class="para-wrapper">
                  <span class="para-num">{{ pIndex + 1 }}항</span>
                  <span class="para-content" v-html="paragraph.content"></span>
                </div>

                <ul v-if="paragraph.items" class="term-list">
                  <li v-for="(item, iIndex) in paragraph.items" :key="iIndex">
                    <span class="item-num">{{ iIndex + 1 }}호</span>
                    <span class="item-content">{{ item }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <button class="primary-button full-width" @click="closeTermsModal">확인했습니다</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/utils/_pxToRem.scss' as *;

.signup-page {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.step-card {
  width: 100%;
  max-width: rem(420px);
  background-color: #f4f4f4;
  border-radius: rem(24px);
  padding: rem(28px) rem(24px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
  min-height: rem(540px);
  display: flex;
  flex-direction: column;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: rem(24px);
}

.step-title {
  font-size: rem(20px);
  font-weight: var(--font-weight-bold);
  color: #111;
}

.step-indicator {
  font-size: rem(14px);
  color: #555;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: rem(18px);
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: rem(8px);
}

.form-label {
  font-size: rem(16px);
  font-weight: var(--font-weight-medium);
}

.form-input,
.form-select {
  width: 100%;
  padding: rem(12px) rem(16px);
  border-radius: rem(24px);
  border: none;
  background-color: #fff;
  font-size: rem(15px);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 입력창 + 카운터 스타일 */
.input-wrapper {
  position: relative;
  width: 100%;
}

.form-input.with-counter {
  padding-right: rem(60px);
}

.char-counter {
  position: absolute;
  right: rem(16px);
  top: 50%;
  transform: translateY(-50%);
  font-size: rem(12px);
  color: #999;
  pointer-events: none;
}

.text-danger {
  color: #d93025;
  font-weight: bold;
}

.select-wrapper {
  position: relative;
}

.form-select {
  appearance: none;
}

.date-select-row {
  display: flex;
  align-items: center;
  gap: rem(8px);
}

.date-select {
  flex: 1;
  padding: rem(10px);
  border-radius: rem(20px);
  border: none;
  background-color: #fff;
  font-size: rem(14px);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.date-divider {
  font-size: rem(16px);
  color: #999;
}

.button-row {
  display: flex;
  gap: rem(12px);
  margin-top: auto;
}

.ghost-button,
.primary-button {
  flex: 1;
  border: none;
  border-radius: rem(24px);
  padding: rem(14px);
  font-size: rem(16px);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
}

.ghost-button {
  background-color: #dedede;
  color: #111;
}

.primary-button {
  background-color: #ffca2c;
  color: #111;
}

.primary-button:disabled {
  opacity: 0.7;
  cursor: default;
}

.error-text {
  font-size: rem(12px);
  color: #d93025;
}

.error-text.global {
  margin-top: rem(12px);
  text-align: center;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: rem(8px);
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: rem(8px);
}

.checkbox-label-text {
  font-size: rem(15px);
  color: #333;
  cursor: pointer;
}

.terms-link {
  text-decoration: underline;
  font-weight: bold;
  color: #555;
}

.checkbox-input {
  width: rem(18px);
  height: rem(18px);
  cursor: pointer;
  accent-color: #ffca2c;
}

/* 약관 모달 스타일 (앱 레이아웃 너비 제한) */
.modal-overlay {
  position: fixed;
  inset: 0;
  margin: 0 auto;
  max-width: rem(430px); /* 앱 레이아웃 최대 너비와 일치 */
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content.terms-modal {
  background-color: white;
  padding: rem(24px);
  border-radius: rem(16px);
  width: 90%;
  max-width: rem(500px);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.terms-title {
  font-size: rem(18px);
  font-weight: bold;
  margin-bottom: rem(16px);
  text-align: center;
}

.terms-body {
  flex: 1;
  overflow-y: auto;
  font-size: rem(14px);
  line-height: 1.6;
  color: #444;
  background-color: #f9f9f9;
  padding: rem(16px);
  border-radius: rem(8px);
  margin-bottom: rem(16px);

  :deep(h3) {
    font-size: rem(16px);
    font-weight: 800;
    margin-top: rem(24px);
    margin-bottom: rem(12px);
    color: #111;
    border-bottom: 2px solid #eee;
    padding-bottom: rem(8px);
  }

  /* 첫 번째 조의 상단 여백 제거 */
  .term-item:first-child :deep(h3) {
    margin-top: 0;
  }

  /* 항(Paragraph) 스타일 */
  :deep(.term-paragraph) {
    margin-bottom: rem(12px);
  }

  :deep(.para-wrapper) {
    display: flex;
    align-items: baseline;
    gap: rem(6px);
  }

  :deep(.para-num) {
    font-weight: 700;
    color: #333;
    flex-shrink: 0;
    min-width: rem(28px);
  }

  :deep(.para-content) {
    color: #555;
    word-break: keep-all;
  }

  /* 호(Item) 리스트 스타일 */
  :deep(.term-list) {
    background-color: #eee;
    padding: rem(10px) rem(12px);
    border-radius: rem(6px);
    margin-top: rem(6px);
    margin-left: rem(34px);
  }

  :deep(li) {
    list-style: none;
    display: flex;
    align-items: baseline;
    gap: rem(6px);
    margin-bottom: rem(4px);
  }

  :deep(li:last-child) {
    margin-bottom: 0;
  }

  :deep(.item-num) {
    font-size: rem(13px);
    font-weight: 700;
    color: #666;
    flex-shrink: 0;
  }

  :deep(.item-content) {
    font-size: rem(13px);
    color: #555;
  }

  :deep(strong) {
    font-weight: 700;
    color: #111;
    background-color: rgba(255, 202, 44, 0.2);
  }
}

.full-width {
  width: 100%;
}

.term-item {
  margin-bottom: rem(20px);
}

.terms-body :deep(h3) {
  font-size: rem(15px);
  font-weight: bold;
  margin-top: rem(16px);
  margin-bottom: rem(8px);
  color: #222;
}

.terms-body :deep(ol),
.terms-body :deep(ul) {
  padding-left: rem(20px);
  margin-bottom: rem(12px);
}

.terms-body :deep(li) {
  margin-bottom: rem(4px);
}

.terms-body :deep(strong) {
  font-weight: 700;
  color: #111;
}
</style>
