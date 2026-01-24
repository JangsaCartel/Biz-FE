<template>
  <div v-if="isVisible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <p v-html="message"></p>
      <div v-if="buttonType === 'double'" class="button-group">
        <button class="modal-button secondary" @click="handleSecondary">
          {{ secondaryButtonText }}
        </button>
        <button class="modal-button primary" @click="handlePrimary">{{ primaryButtonText }}</button>
      </div>
      <button v-else class="modal-button single" @click="closeModal">확인</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  isVisible: {
    type: Boolean,
    required: true,
  },
  buttonType: {
    type: String,
    default: 'single', // 'single' or 'double'
  },
  primaryButtonText: {
    type: String,
    default: '다음',
  },
  secondaryButtonText: {
    type: String,
    default: '이전',
  },
})

const emit = defineEmits(['close', 'primary', 'secondary'])

const closeModal = () => {
  emit('close')
}

const handlePrimary = () => {
  emit('primary')
  emit('close')
}

const handleSecondary = () => {
  emit('secondary')
  emit('close')
}

const handleOverlayClick = () => {
  if (props.buttonType === 'single') {
    closeModal()
  }
}
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: rem(20px);
  border-radius: rem(8px);
  text-align: center;
  max-width: rem(300px);
  width: 90%;

  p {
    margin: 0 0 rem(20px);
    font-size: rem(16px);
    line-height: 1.5;
    white-space: pre-line;
    word-break: keep-all;
  }
}

.button-group {
  display: flex;
  gap: rem(8px);
}

.modal-button {
  flex: 1;
  padding: rem(12px);
  border: none;
  border-radius: rem(8px);
  font-size: rem(14px);
  font-weight: var(--font-weight-medium);
  cursor: pointer;

  &.single {
    width: 100%;
    background-color: var(--signature-color, #ffca2c);
    color: #111;
  }

  &.primary {
    background-color: var(--signature-color, #ffca2c);
    color: #111;
  }

  &.secondary {
    background-color: #dedede;
    color: #111;
  }
}
</style>
