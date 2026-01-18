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

const router = useRouter()
const route = useRoute()

const totalSteps = 2
const currentStep = ref(1)

const nickname = ref('')
const region = ref('')
const regionData = ref({ sido: '', gugun: '', dong: '' })
const userStoreName = ref('')
const businessType = ref('')
const businessRegNo = ref('')
const businessStartDate = ref('')

const selectedYear = ref('')
const selectedMonth = ref('')
const selectedDay = ref('')

const isSubmitting = ref(false)
const globalError = ref('')

const aiConsent = ref(false)
const termsConsent = ref(false)

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
  aiConsent: '',
  termsConsent: '',
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
    nickname.value = tempNickname
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
  stepTwoErrors.value.region =
    regionData.value.sido && regionData.value.gugun && regionData.value.dong
      ? ''
      : '활동 지역을 선택해주세요.'
  stepTwoErrors.value.userStoreName = userStoreName.value ? '' : '가게 상호명을 입력해주세요.'
  stepTwoErrors.value.businessType = businessType.value ? '' : '사업 종류를 선택해주세요.'
  stepTwoErrors.value.aiConsent = aiConsent.value ? '' : 'AI 활용 동의는 필수입니다.'
  stepTwoErrors.value.termsConsent = termsConsent.value ? '' : '약관 동의는 필수입니다.'

  return (
    !stepTwoErrors.value.nickname &&
    !stepTwoErrors.value.region &&
    !stepTwoErrors.value.userStoreName &&
    !stepTwoErrors.value.businessType &&
    !stepTwoErrors.value.aiConsent &&
    !stepTwoErrors.value.termsConsent
  )
}

const handleNextStep = () => {
  if (validateStepOne()) {
    // 미래 날짜 검증
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
  // 다음 버튼 클릭 - 다음 단계로 진행
  futureDateModalVisible.value = false
  currentStep.value = 2
}

const handleFutureDateModalSecondary = () => {
  // 이전 버튼 클릭 - 모달만 닫고 현재 단계 유지
  futureDateModalVisible.value = false
}

const handleRegionUpdate = (regionInfo) => {
  regionData.value = regionInfo
  // 백엔드에 전달할 형식으로 변환 (예: "서울 강남구 역삼동")
  if (regionInfo.sido && regionInfo.gugun && regionInfo.dong) {
    region.value = `${regionInfo.sido} ${regionInfo.gugun} ${regionInfo.dong}`
  } else {
    region.value = ''
  }
}

const handlePrevStep = () => {
  currentStep.value = 1
}

const handleBackToLogin = () => {
  clearProviderId()
  router.replace({ name: 'login' })
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
      region: region.value,
      userStoreName: userStoreName.value,
      businessType: Number(businessType.value),
      businessRegNo: Number(businessRegNo.value),
      businessStartDate: businessStartDate.value,
    }

    const res = await signupWithExtraInfo(payload, providerId)
    if (res.status === 'LOGIN_SUCCESS' && res.accessToken) {
      // 회원가입 완료 후 로그인 성공 응답
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
          <input
            v-model="nickname"
            class="form-input"
            placeholder="사장님을 어떻게 불러드릴까요?"
          />
          <p v-if="stepTwoErrors.nickname" class="error-text">{{ stepTwoErrors.nickname }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">가게 상호명 *</label>
          <input
            v-model="userStoreName"
            class="form-input"
            placeholder="사장님의 가게 상호명을 알고 싶어요!"
          />
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
            <label class="checkbox-label">
              <input
                v-model="aiConsent"
                type="checkbox"
                class="checkbox-input"
              />
              <span>AI 활용 동의 *</span>
            </label>
            <p v-if="stepTwoErrors.aiConsent" class="error-text">{{ stepTwoErrors.aiConsent }}</p>
          </div>
        </div>

        <div class="form-group">
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input
                v-model="termsConsent"
                type="checkbox"
                class="checkbox-input"
              />
              <span>약관 동의 *</span>
            </label>
            <p v-if="stepTwoErrors.termsConsent" class="error-text">{{ stepTwoErrors.termsConsent }}</p>
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

      <!-- 미래 날짜 확인 모달 -->
      <ModalDialog
        :message="'개업하실 예정이시군요! 미래의 사장님을 응원합니다!'"
        :is-visible="futureDateModalVisible"
        button-type="double"
        @primary="handleFutureDateModalPrimary"
        @secondary="handleFutureDateModalSecondary"
        @close="handleFutureDateModalSecondary"
      />
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: rem(8px);
  font-size: rem(16px);
  cursor: pointer;
}

.checkbox-input {
  width: rem(18px);
  height: rem(18px);
  cursor: pointer;
}
</style>
