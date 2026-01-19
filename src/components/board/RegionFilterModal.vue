<script setup>
import { ref, watch, computed } from 'vue'
import RegionDropdowns from '@/components/common/RegionDropdowns.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  region: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'confirm', 'update:region'])

const localRegion = ref(null)

const isConfirmDisabled = computed(() => {
  return !localRegion.value || !localRegion.value.sido || !localRegion.value.gugun || !localRegion.value.dong
})

watch(
  () => props.open,
  (val) => {
    if (val) {
      localRegion.value = props.region ? { ...props.region } : null
    }
  },
)

const updateLocalRegion = (region) => {
  localRegion.value = region
  emit('update:region', region)
}

const handleClose = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm', localRegion.value)
  emit('close')
}

const handleReset = () => {
  localRegion.value = null
  emit('confirm', null)
  emit('close')
}
</script>

<template>
  <div
    v-if="open"
    class="RegionFilterModal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="region-filter-modal-title"
    @click="handleClose"
  >
    <div class="RegionFilterModal" @click.stop>
      <div class="RegionFilterModal-header">
        <h2 id="region-filter-modal-title" class="RegionFilterModal-title">지역 설정</h2>
        <button class="RegionFilterModal-close" type="button" @click="handleClose">✕</button>
      </div>

      <div class="RegionFilterModal-body">
        <RegionDropdowns :region="localRegion" @update:region="updateLocalRegion" />
      </div>

      <div class="RegionFilterModal-footer">
        <button
          type="button"
          class="RegionFilterModal-btn RegionFilterModal-btn-reset"
          @click="handleReset"
        >
          초기화
        </button>
        <button
          type="button"
          class="RegionFilterModal-btn RegionFilterModal-btn-confirm"
          :disabled="isConfirmDisabled"
          :class="{ 'is-disabled': isConfirmDisabled }"
          @click="handleConfirm"
        >
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.RegionFilterModal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.RegionFilterModal {
  position: relative;
  width: min(rem(400px), 100% - rem(32px)); // 모달 창 가로폭
  height: auto;
  max-height: 80vh;
  background-color: #ffffff;
  border-radius: rem(12px);
  padding: rem(16px) rem(16px) rem(12px);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.RegionFilterModal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: rem(12px);
}

.RegionFilterModal-title {
  font-size: rem(16px);
  font-weight: var(--font-weight-bold);
  color: var(--black);
}

.RegionFilterModal-close {
  border: none;
  background: transparent;
  font-size: rem(18px);
  cursor: pointer;
}

.RegionFilterModal-body {
  flex: 0 0 auto;
  overflow: visible;
  display: flex;
  justify-content: center;
}

.RegionFilterModal-footer {
  margin-top: rem(12px);
  display: flex;
  justify-content: center;
  gap: rem(8px);
}

.RegionFilterModal-btn {
  min-width: rem(72px);
  padding: rem(6px) rem(12px);
  border-radius: rem(999px);
  font-size: rem(13px);
  border: rem(1px) solid transparent;
  cursor: pointer;
}

.RegionFilterModal-btn-reset {
  background-color: var(--white);
  border-color: var(--grey-light);
  color: var(--text-title);
}

.RegionFilterModal-btn-confirm {
  background-color: var(--semi-signature-color);
  color: var(--black);
}

.RegionFilterModal-btn-confirm.is-disabled {
  background-color: var(--grey);
  cursor: not-allowed;
}
</style>
