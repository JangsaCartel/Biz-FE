<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: {
    type: [Number, String],
    required: true,
  },
  organization: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  period: {
    type: String,
    required: true,
  },
  dday: {
    type: String,
    required: true,
  },
  tags: {
    type: Array,
    default: () => [],
  },
  createdAt: {
    type: String,
    required: true,
  },
  target: {
    type: String,
    default: '',
  },
  contact: {
    type: String,
    default: '',
  },
  htmlContent: {
    type: String,
    default: '',
  },
  applyUrl: {
    type: String,
    default: null,
  },
  originalUrl: {
    type: String,
    default: null,
  },
  mainFileName: {
    type: String,
    default: '',
  },
  printFlpthNm: {
    type: String,
    default: '',
  },
  extraFileNames: {
    type: Array,
    default: () => [],
  },
  extraFileUrls: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click', { ...props })
}

const tagsText = computed(() => {
  if (!Array.isArray(props.tags) || props.tags.length === 0) return ''
  return props.tags.map((t) => `#${t}`).join(' ')
})
</script>

<template>
  <div class="PolicyCard" @click="handleClick" role="button">
    <!-- 상단: 기관명 · 수행기관 / 등록일 -->
    <div class="PolicyCard-top">
      <p class="PolicyCard-org">{{ organization }}</p>
      <p class="PolicyCard-created">{{ createdAt }}</p>
    </div>

    <!-- 제목 -->
    <p class="PolicyCard-title">
      {{ title }}
    </p>

    <!-- 기간 + D-DAY -->
    <p class="PolicyCard-period">
      기간 {{ period }}
      <span class="PolicyCard-dday">[{{ dday }}]</span>
    </p>

    <!-- 해시태그 -->
    <div class="PolicyCard-tags">
      {{ tagsText }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.PolicyCard {
  width: 100%;
  padding: rem(12px) rem(16px);
  box-sizing: border-box;
  background-color: var(--white);
  cursor: pointer;
  margin-bottom: rem(10px);

  &-top {
    display: flex;
    justify-content: center;
    gap: rem(6px);
    align-items: center;
    margin-bottom: rem(4px);
  }

  &-org {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    font-size: rem(12px);
    font-weight: var(--font-weight-semibold);
    color: var(--board-info);
  }

  &-created {
    flex: 0 0 auto;
    white-space: nowrap;
    font-size: rem(11px);
    color: var(--text-subtitle);
  }

  &-title {
    font-size: rem(14px);
    font-weight: var(--font-weight-bold);
    color: var(--black);
    margin-bottom: rem(4px);
    line-height: 1.4;

    display: -webkit-box;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;

    min-height: calc(1.4em * 2);
    max-height: calc(1.4em * 2);
  }

  &-period {
    font-size: rem(12px);
    color: var(--text-title);
    margin-bottom: rem(6px);
  }

  &-dday {
    margin-left: rem(4px);
    font-weight: var(--font-weight-semibold);
    color: var(--board-hot);
  }

  &-tags {
    margin-top: rem(2px);
    font-size: rem(10px);
    line-height: 1.3;
    color: var(--text-subtitle);

    display: -webkit-box;
    -webkit-box-orient: vertical;
    line-clamp: 2; /* 표준 속성 */
    -webkit-line-clamp: 2; /* 벤더 프리픽스 */
    overflow: hidden;
    text-overflow: ellipsis;

    min-height: calc(1.3em * 2);
    max-height: calc(1.3em * 2);
  }

  &-tag {
    white-space: nowrap;
    margin-right: rem(4px);
  }
}
</style>
