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
  dDay: {
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
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click', props.id)
}

//해쉬태그 13 + 12개로 분할
const tagsRow1 = computed(() => (Array.isArray(props.tags) ? props.tags.slice(0, 13) : []))
const tagsRow2 = computed(() => (Array.isArray(props.tags) ? props.tags.slice(13, 25) : []))
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
      <span class="PolicyCard-dday">[{{ dDay }}]</span>
    </p>

    <!-- 해시태그 -->
    <div class="PolicyCard-tags">
      <div class="PolicyCard-tag-row">
        <span v-for="(tag, idx) in tagsRow1" :key="'r1-' + idx" class="PolicyCard-tag">
          #{{ tag }}
        </span>
      </div>
      <div class="PolicyCard-tag-row">
        <span v-for="(tag, idx) in tagsRow2" :key="'r2-' + idx" class="PolicyCard-tag">
          #{{ tag }}
        </span>
      </div>
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
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
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
  }

  &-tag-row {
    display: flex;
    flex-wrap: nowrap;
    gap: rem(2px) rem(4px);
    font-size: rem(10px);
    line-height: 1.3;
    color: var(--text-subtitle);

    min-height: 1.3em;
  }

  &-tag {
    white-space: nowrap;
  }
}
</style>
