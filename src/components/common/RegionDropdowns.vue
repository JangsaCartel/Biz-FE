<template>
  <div class="region-dropdowns">
    <select v-model="selectedSido" @change="handleSidoChange">
      <option disabled value="">시/도</option>
      <option v-for="sido in sidos" :key="sido" :value="sido">
        {{ sido }}
      </option>
    </select>

    <select v-model="selectedSigungu" @change="handleSigunguChange" :disabled="!selectedSido">
      <option disabled value="">시/군/구</option>
      <option v-for="sigungu in sigungus" :key="sigungu" :value="sigungu">
        {{ sigungu }}
      </option>
    </select>

    <select
      v-model="selectedEupmyeondong"
      @change="handleEupmyeondongChange"
      :disabled="!selectedSigungu"
    >
      <option disabled value="">읍/면/동</option>
      <option v-for="eupmyeondong in eupmyeondongs" :key="eupmyeondong" :value="eupmyeondong">
        {{ eupmyeondong }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import allDistricts from '@/assets/data/district.json'

const emit = defineEmits(['update:region'])

const districts = ref(allDistricts)

const selectedSido = ref('')
const selectedSigungu = ref('')
const selectedEupmyeondong = ref('')

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
  if (!selectedSido.value || !selectedSigungu.value) return []
  return districts.value
    .filter((d) => d.sido === selectedSido.value && d.sigungu === selectedSigungu.value)
    .map((d) => d.eupmyeondong)
})

const handleSidoChange = () => {
  selectedSigungu.value = ''
  selectedEupmyeondong.value = ''
}

const handleSigunguChange = () => {
  selectedEupmyeondong.value = ''
}

const handleEupmyeondongChange = () => {
  emit('update:region', {
    sido: selectedSido.value,
    gugun: selectedSigungu.value,
    dong: selectedEupmyeondong.value,
  })
}

watch([selectedSido, selectedSigungu, selectedEupmyeondong], () => {})
</script>

<style scoped lang="scss">
.region-dropdowns {
  display: flex;
  flex-wrap: wrap;
  gap: rem(10px);
}

select {
  padding-top: rem(8px);
  padding-bottom: rem(8px);
  border: rem(1px) solid #ccc;
  border-radius: rem(4px);
  font-size: rem(16px);
  flex: 1;
  min-width: rem(120px);
  text-align: center;
  text-align-last: center;
}

.region-dropdowns select:nth-child(2) {
  flex: 0.8;
  min-width: rem(100px);
}

select:disabled {
  background-color: #f2f2f2;
  cursor: not-allowed;
}
</style>
