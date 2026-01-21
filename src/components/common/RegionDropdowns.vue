<template>
  <div class="region-dropdowns">
    <!-- 시/도 드롭다운 -->
    <div class="FilterField filter-field-sido">
      <button
        type="button"
        class="FilterField-trigger"
        :class="{ 'is-open': openMenu === 'sido' }"
        @click="toggleMenu('sido')"
      >
        <span class="FilterField-trigger-text">
          {{ selectedSido || '시/도 ' }}
        </span>
        <span class="FilterField-trigger-arrow" />
      </button>

      <div v-if="openMenu === 'sido'" class="FilterField-dropdown">
        <ul class="FilterField-list">
          <li
            v-for="option in sidos"
            :key="option"
            class="FilterField-item"
            :class="{ 'is-selected': selectedSido === option }"
            @click="selectSido(option)"
          >
            {{ option }}
          </li>
        </ul>
      </div>
    </div>

    <!-- 시/군/구 드롭다운 -->
    <div class="FilterField filter-field-sigungu">
      <button
        type="button"
        class="FilterField-trigger"
        :class="{ 'is-open': openMenu === 'sigungu' }"
        :disabled="!selectedSido || selectedSido === '세종특별자치시'"
        @click="toggleMenu('sigungu')"
      >
        <span class="FilterField-trigger-text">
          {{ selectedSigungu || '시/군/구 ' }}
        </span>
        <span class="FilterField-trigger-arrow" />
      </button>

      <div v-if="openMenu === 'sigungu'" class="FilterField-dropdown">
        <ul class="FilterField-list">
          <li
            v-for="option in sigungus"
            :key="option"
            class="FilterField-item"
            :class="{ 'is-selected': selectedSigungu === option }"
            @click="selectSigungu(option)"
          >
            {{ option }}
          </li>
        </ul>
      </div>
    </div>

    <!-- 읍/면/동 드롭다운 -->
    <div class="FilterField filter-field-eupmyeondong">
      <button
        type="button"
        class="FilterField-trigger"
        :class="{ 'is-open': openMenu === 'eupmyeondong' }"
        :disabled="!selectedSigungu && selectedSido !== '세종특별자치시'"
        @click="toggleMenu('eupmyeondong')"
      >
        <span class="FilterField-trigger-text">
          {{ selectedEupmyeondong || '읍/면/동 ' }}
        </span>
        <span class="FilterField-trigger-arrow" />
      </button>

      <div v-if="openMenu === 'eupmyeondong'" class="FilterField-dropdown">
        <ul class="FilterField-list">
          <li
            v-for="option in eupmyeondongs"
            :key="option"
            class="FilterField-item"
            :class="{ 'is-selected': selectedEupmyeondong === option }"
            @click="selectEupmyeondong(option)"
          >
            {{ option }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import allDistricts from '@/assets/data/district.json'

const props = defineProps({
  region: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:region'])

const districts = ref(allDistricts)
const openMenu = ref(null)

const selectedSido = ref('')
const selectedSigungu = ref('')
const selectedEupmyeondong = ref('')

watch(
  () => props.region,
  (newRegion) => {
    if (newRegion) {
      selectedSido.value = newRegion.sido || ''
      selectedSigungu.value = newRegion.gugun || ''
      selectedEupmyeondong.value = newRegion.dong || ''
    } else {
      selectedSido.value = ''
      selectedSigungu.value = ''
      selectedEupmyeondong.value = ''
    }
  },
  { immediate: true },
)

const sidos = computed(() => {
  return [...new Set(districts.value.map((d) => d.sido))]
})

const sigungus = computed(() => {
  if (!selectedSido.value) return []
  return [
    ...new Set(districts.value.filter((d) => d.sido === selectedSido.value).map((d) => d.sigungu)),
  ]
})

const eupmyeondongs = computed(() => {
  if (!selectedSido.value) return []
  // "세종특별자치시" 시/군/구 부분의 값이 비어있으므로 특별 처리
  if (!selectedSigungu.value && selectedSido.value !== '세종특별자치시') return []
  return districts.value
    .filter((d) => d.sido === selectedSido.value && d.sigungu === selectedSigungu.value)
    .map((d) => d.eupmyeondong)
})

const toggleMenu = (menu) => {
  if (menu === 'sigungu' && !selectedSido.value) return
  if (menu === 'eupmyeondong' && !selectedSigungu.value && selectedSido.value !== '세종특별자치시')
    return
  openMenu.value = openMenu.value === menu ? null : menu
}

const selectSido = (sido) => {
  selectedSido.value = sido
  selectedSigungu.value = ''
  selectedEupmyeondong.value = ''
  openMenu.value = null
  emit('update:region', { sido: sido, gugun: '', dong: '' })
}

const selectSigungu = (sigungu) => {
  selectedSigungu.value = sigungu
  selectedEupmyeondong.value = ''
  openMenu.value = null
  emit('update:region', {
    sido: selectedSido.value,
    gugun: sigungu,
    dong: '',
  })
}

const selectEupmyeondong = (eupmyeondong) => {
  selectedEupmyeondong.value = eupmyeondong
  openMenu.value = null
  const selectedRegion = {
    sido: selectedSido.value,
    gugun: selectedSigungu.value,
    dong: selectedEupmyeondong.value,
  }
  // console.log('RegionDropdowns emitting:', selectedRegion)
  emit('update:region', selectedRegion)
}
</script>

<style scoped lang="scss">
.region-dropdowns {
  display: flex;
  flex-wrap: nowrap;
  gap: rem(8px);
  justify-content: center;
}

.FilterField {
  position: relative;
}
// 드롭바 시/군/동 각각 크기
.filter-field-sido {
  width: rem(125px);
}
.filter-field-sigungu {
  width: rem(130px);
}
.filter-field-eupmyeondong {
  width: rem(110px);
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

  &:disabled {
    background-color: #f2f2f2;
    cursor: not-allowed;
    .FilterField-trigger-text {
      color: #999;
    }
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

.FilterField-dropdown {
  position: absolute;
  top: calc(100% + rem(4px));
  left: 0;
  width: 100%;
  z-index: 10;
  margin-top: rem(4px);
  border-radius: rem(8px);
  border: rem(1px) solid var(--grey-light);
  background-color: var(--white);
  max-height: rem(220px);
  overflow-y: auto;
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
</style>
