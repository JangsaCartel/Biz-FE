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

  const NICKNAME_MAX = 15
  const STORE_NAME_MAX = 32

  const nickname = ref('')
  const region = ref('')

  // 지역 데이터 초기값 (유지되도록 설정)
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

  // v-model로 바인딩된 regionData가 변경될 때마다 region 문자열 업데이트
  watch(regionData, (newVal) => {
    const { sido, gugun, dong } = newVal
    if (sido === '세종특별자치시') {
      region.value = (sido && dong) ? `${sido} ${dong}` : ''
    } else {
      region.value = (sido && gugun && dong) ? `${sido} ${gugun} ${dong}` : ''
    }
  }, { deep: true })

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

    const { sido, gugun, dong } = regionData.value
    const isSejong = sido === '세종특별자치시'
    const isRegionValid = isSejong
      ? (sido && dong)
      : (sido && gugun && dong)

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
              <span class="char-counter" :class="{ 'text-danger': userStoreName.length >= STORE_NAME_MAX }">
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
            <RegionDropdowns v-model:region="regionData" />
            <p v-if="stepTwoErrors.region" class="error-text">{{ stepTwoErrors.region }}</p>
          </div>

          <div class="form-group">
            <div class="checkbox-group">
              <div class="checkbox-row">
                <input
                  id="agreement"
                  v-model="isAgreed"
                  type="checkbox"
                  class="checkbox-input"
                />
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
            <h2 class="terms-title">JangsaCartel 서비스 이용약관</h2>
            <div class="terms-body">
              <h3>제1조 (목적)</h3>
              <p>이 약관은 JangsaCartel(이하 "회사"라 함)이 제공하는 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>

              <h3>제2조 (정의)</h3>
              <ol>
                <li>"서비스"란 회사가 제공하는 모든 서비스를 의미합니다.</li>
                <li>"이용자"란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
                <li>"회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
                <li>"비회원"이란 회원에 가입하지 않고 회사가 제공하는 서비스를 이용하는 자를 말합니다.</li>
                <li>"콘텐츠"란 회사 또는 이용자가 서비스 상에 게시한 모든 글, 사진, 동영상, 첨부파일, 링크 등을 말합니다.</li>
              </ol>

              <h3>제3조 (약관 외 준칙)</h3>
              <p>이 약관에서 정하지 아니한 사항은 전기통신사업법, 전자상거래 등에서의 소비자보호에 관한 법률, 개인정보 보호법 등 관련 법령의 규정과 일반적인 상관례에 의합니다.</p>

              <h3>제4조 (약관의 효력과 변경)</h3>
              <ol>
                <li>이 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다.</li>
                <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있습니다.</li>
                <li>회사가 약관을 변경할 경우에는 적용일자 및 변경사유를 명시하여 현행 약관과 함께 서비스 내 공지사항에 그 적용일자 7일 전부터 적용일자 전일까지 공지합니다. 다만, 이용자에게 불리한 약관의 변경의 경우에는 30일 전부터 공지합니다.</li>
                <li>이용자는 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 회원 탈퇴를 요청할 수 있습니다. 변경된 약관의 효력 발생일 이후에도 서비스를 계속 이용할 경우 약관의 변경사항에 동의한 것으로 간주됩니다.</li>
              </ol>

              <h3>제5조 (이용계약의 체결)</h3>
              <ol>
                <li>이용계약은 이용자가 이 약관에 동의하고 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 가입을 신청하고, 회사가 이를 승낙함으로써 체결됩니다.</li>
                <li>회사는 이용신청 요건을 충족하는 모든 이용자의 신청을 승낙합니다. 다만, 회사는 다음 각 호에 해당하는 신청에 대해서는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.</li>
              </ol>

              <h3>제6조 (회원정보의 변경)</h3>
              <ol>
                <li>회원은 개인정보 관리화면을 통하여 언제든지 본인의 개인정보를 열람하고 수정할 수 있습니다.</li>
                <li>회원은 회원가입 시 기재한 사항이 변경되었을 경우 온라인으로 수정을 하거나 전자우편 또는 기타 방법으로 회사에 그 변경사항을 알려야 합니다.</li>
                <li>제2항의 변경사항을 회사에 알리지 않아 발생한 불이익에 대하여 회사는 책임을 지지 않습니다.</li>
              </ol>

              <h3>제7조 (개인정보보호 의무)</h3>
              <p>회사는 관련 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 사용에 대해서는 관련 법령 및 회사의 개인정보처리방침이 적용됩니다.</p>

              <h3>제7조의2 (AI 기술 활용 및 데이터 분석)</h3>
              <ol>
                <li>본 서비스는 사용자에게 최적화된 맞춤형 분석 및 추천 정보를 제공하기 위해 인공지능(AI) 기술을 활용합니다.</li>
                <li>회원이 입력한 닉네임, 지역, 상호명, 업종, 개업일자 등의 데이터는 AI 분석 모델의 학습 및 통계 처리에 활용될 수 있으며, 이는 개인을 식별할 수 없는 형태로 안전하게 처리됩니다. 회원은 서비스 가입 시 이에 동의한 것으로 간주합니다.</li>
              </ol>

              <h3>제8조 (회원의 아이디 및 비밀번호의 관리에 대한 의무)</h3>
              <ol>
                <li>회원의 아이디와 비밀번호에 관한 관리책임은 회원에게 있으며, 이를 제3자가 이용하도록 하여서는 안 됩니다.</li>
                <li>회사는 회원의 아이디가 개인정보 유출 우려가 있거나, 반사회적 또는 미풍양속에 어긋나거나 회사 및 회사의 운영자로 오인할 우려가 있는 경우, 해당 아이디의 이용을 제한할 수 있습니다.</li>
                <li>회원은 아이디 및 비밀번호가 도용되거나 제3자가 사용하고 있음을 인지한 경우에는 이를 즉시 회사에 통지하고 회사의 안내에 따라야 합니다.</li>
                <li>제3항의 경우에 해당 회원이 회사에 그 사실을 통지하지 않거나, 통지한 경우에도 회사의 안내에 따르지 않아 발생한 불이익에 대하여 회사는 책임을 지지 않습니다.</li>
              </ol>

              <h3>제9조 (이용자의 의무)</h3>
              <p>1. 이용자는 다음 행위를 하여서는 안 됩니다.</p>
              <ol>
                <li>신청 또는 변경 시 허위 내용의 등록</li>
                <li>타인의 정보 도용</li>
                <li>회사가 게시한 정보의 변경</li>
                <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                <li>회사와 기타 제3자의 저작권 등 지식재산권에 대한 침해</li>
                <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                <li>기타 불법적이거나 부당한 행위</li>
              </ol>
              <p>2. 이용자는 관계법령, 이 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항, 회사가 통지하는 사항 등을 준수하여야 하며, 기타 회사의 업무에 방해되는 행위를 하여서는 안 됩니다.</p>

              <h3>제10조 (서비스의 제공 및 변경)</h3>
              <ol>
                <li>회사는 다음과 같은 서비스를 제공합니다.
                  <ul>
                     <li>소상공인을 위한 마케팅 팁, 공공지원금 정보를 모은 커뮤니티형 서비스.</li>
                     <li>소상공인의 주변 지역을 지도를 통해 지역 소상공인끼리 게시글을 공유.</li>
                  </ul>
                </li>
                <li>회사는 상당한 이유가 있는 경우에 운영상, 기술상의 필요에 따라 제공하고 있는 서비스를 변경할 수 있습니다.</li>
                <li>회사는 이용자에게 서비스를 제공함에 있어 관련 법령, 약관, 운영정책 및 공지사항 등에서 정한 바에 따라 무료로 서비스를 제공합니다.</li>
              </ol>

              <h3>제11조 (서비스의 중단)</h3>
              <ol>
                <li>회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
                <li>회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상합니다. 단, 회사가 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.</li>
                <li>사업종목의 전환, 사업의 포기, 업체 간의 통합 등의 이유로 서비스를 제공할 수 없게 되는 경우에는 회사는 제4조에 정한 방법으로 이용자에게 통지하고 당초 회사에서 제시한 조건에 따라 소비자에게 보상합니다.</li>
              </ol>

              <h3>제12조 (회원탈퇴 및 자격 상실 등)</h3>
              <ol>
                <li>회원은 회사에 언제든지 탈퇴를 요청할 수 있으며 회사는 즉시 회원탈퇴를 처리합니다. <strong>단, 회원 탈퇴 시 회원의 개인정보 및 활동 데이터는 즉시 영구 삭제되며 복구할 수 없습니다.</strong></li>
                <li>회원이 다음 각 호의 사유에 해당하는 경우, 회사는 회원자격을 제한 및 정지시킬 수 있습니다.
                  <ul>
                    <li>가입 신청 시에 허위 내용을 등록한 경우</li>
                    <li>다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는 경우</li>
                    <li>서비스를 이용하여 법령 또는 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
                  </ul>
                </li>
                <li>회사가 회원 자격을 제한·정지시킨 후, 동일한 행위가 2회 이상 반복되거나 30일 이내에 그 사유가 시정되지 아니하는 경우 회사는 회원자격을 상실시킬 수 있습니다.</li>
                <li>회사가 회원자격을 상실시키는 경우에는 회원등록을 말소합니다. 이 경우 회원에게 이를 통지하고, 회원등록 말소 전에 최소한 30일 이상의 기간을 정하여 소명할 기회를 부여합니다.</li>
              </ol>

              <h3>제13조 (정보의 제공 및 광고의 게재)</h3>
              <p>회사는 회원에게 서비스 이용에 필요한 정보를 공지사항이나 전자우편 등의 방법으로 제공할 수 있습니다. 다만, 회사는 회원이 동의하지 않는 한 영리목적의 광고성 정보를 제공하지 않습니다.</p>

              <h3>제14조 (서비스 이용시간)</h3>
              <ol>
                <li>서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간 운영을 원칙으로 합니다.</li>
                <li>회사는 서비스를 일정범위로 분할하여 각 범위별로 이용가능 시간을 별도로 정할 수 있습니다. 이 경우 그 내용을 사전에 공지합니다.</li>
              </ol>

              <h3>제15조 (서비스 이용 제한)</h3>
              <ol>
                <li>회사는 전시, 사변, 천재지변 또는 이에 준하는 국가비상사태가 발생하거나 발생할 우려가 있는 경우와 전기통신사업법에 의한 기간통신사업자가 전기통신 서비스를 중지하는 등 기타 불가항력적 사유가 있는 경우에는 서비스의 전부 또는 일부를 제한하거나 중지할 수 있습니다.</li>
                <li>회사는 제1항에 의한 서비스 중단의 경우에는 상당한 기간 내에 그 사유를 공지하고, 사전에 공지할 수 없는 부득이한 사유가 있는 경우에는 사후에 공지합니다.</li>
              </ol>

              <h3>제16조 (게시물의 관리)</h3>
              <ol>
                <li>회원의 게시물이 관련 법령, 본 약관에 위반되거나 타인의 권리를 침해한다고 판단되는 경우, 회사는 관련 법령에 따라 해당 게시물에 대한 접근을 임시적으로 차단하거나 삭제할 수 있습니다.</li>
                <li>회사가 제1항에 따라 회원의 게시물을 삭제하거나 게시 중단 조치를 취하는 경우, 회사는 해당 조치의 사유를 회원에게 통지합니다. 다만, 긴급한 경우에는 사후에 통지할 수 있습니다.</li>
                <li><strong>회원이 직접 삭제를 요청한 게시글 및 댓글은 즉시 서비스 화면에서 비공개 처리되며, 법적 분쟁 및 불량 이용자 제재를 위한 운영 정책에 따라 삭제 시점으로부터 1년간 보관 후 영구 삭제 됩니다.</strong></li>
              </ol>

              <h3>제17조 (게시물의 저작권)</h3>
              <ol>
                <li>회원이 서비스 내에 게시한 게시물의 저작권은 해당 게시물의 저작자에게 귀속됩니다.</li>
                <li>회원이 서비스 내에 게시하는 게시물은 검색결과 내지 서비스 및 관련 프로모션 등에 노출될 수 있으며, 해당 노출을 위해 필요한 범위 내에서는 일부 수정, 복제, 편집되어 게시될 수 있습니다.</li>
                <li>회사는 회원의 명시적인 동의 없이 회원의 게시물을 상업적으로 이용하지 않습니다.</li>
                <li>회원은 언제든지 서비스 내 관리기능을 통해 자신의 게시물에 대해 삭제, 수정, 비공개 등의 조치를 취할 수 있습니다.</li>
              </ol>

              <h3>제18조 (책임제한)</h3>
              <ol>
                <li>회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
                <li>회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</li>
                <li>회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.</li>
                <li>회사는 회원이 게재한 정보, 자료, 사실의 신뢰도, 정확성 등 내용에 관하여는 책임을 지지 않습니다.</li>
                <li>회사는 회원 간 또는 회원과 제3자 상호간에 서비스를 매개로 하여 거래 등을 한 경우에는 책임이 면제됩니다.</li>
              </ol>

              <h3>제19조 (준거법 및 재판관할)</h3>
              <ol>
                <li>회사와 회원 간 제기된 소송은 대한민국법을 준거법으로 합니다.</li>
                <li>회사와 회원 간 발생한 분쟁에 관한 소송은 회사 소재지 관할법원의 관할로 합니다.</li>
              </ol>

              <h3>제20조 (기타)</h3>
              <ol>
                <li>이 약관에 명시되지 않은 사항은 관련 법령의 규정에 따릅니다.</li>
                <li>회사는 필요한 경우 특정 서비스에 관하여 별도의 이용약관 및 정책을 둘 수 있으며, 해당 내용이 이 약관과 상충할 경우에는 별도의 이용약관 및 정책이 우선하여 적용됩니다.</li>
              </ol>

              <h3>부칙</h3>
              <p>이 약관은 2026-01-23부터 시행합니다.</p>
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
  }

  .terms-body h3 {
    font-size: rem(15px);
    font-weight: bold;
    margin-top: rem(16px);
    margin-bottom: rem(8px);
    color: #222;
  }

  .terms-body ol {
    padding-left: rem(20px);
    margin-bottom: rem(12px);
  }

  .terms-body li {
    margin-bottom: rem(4px);
  }

  .terms-body ul {
    padding-left: rem(20px);
    list-style-type: disc;
  }

  .full-width {
    width: 100%;
  }
  </style>
