<template>
  <div class="comment-container" :style="{ marginLeft: indentationLevel > 0 ? '1.25rem' : '0' }">
    <div class="comment-item">
      <div v-if="indentationLevel > 0" class="reply-icon">
        <img
          v-if="indentationLevel === 1"
          src="@/assets/icons/board/turn-right 1.png"
          alt="Reply"
        />
      </div>
      <div class="comment-box">
        <div class="comment-header">
          <span class="comment-user">{{ comment.nickname }}</span>
          <div class="comment-actions">
            <button class="comment-like" @click="handleLikeClick">
              <img
                src="@/assets/icons/board/like.png"
                alt="Like"
                width="14"
                height="14"
              />
              <span>{{ likeCount }}</span>
            </button>
            <button class="reply-btn" @click="onReplyClick">답글</button>
          </div>
        </div>
        <div class="comment-content" v-html="comment.content"></div>
        <div class="comment-date">{{ formattedDate }}</div>
      </div>
    </div>
  </div>
  <ModalDialog
    :is-visible="showModal"
    :message="modalMessage"
    @close="closeModal"
  />
</template>
<script setup>
import { computed, ref } from 'vue'
import { useBoardStore } from '@/stores/board/board.js'
import { getCurrentUserIdFromToken } from '@/stores/board/userUtil.js'
import ModalDialog from '@/components/common/ModalDialog.vue'

const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
  indentationLevel: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['reply-to'])
const boardStore = useBoardStore()

const likeCount = ref(props.comment.likeCount || 0)
const isLiked = ref(props.comment.liked || false)
const showModal = ref(false)
const modalMessage = ref('')

const currentUserId = getCurrentUserIdFromToken()
const isMyComment = computed(() => {
  return props.comment.userId === currentUserId
})

const formattedDate = computed(() => {
  if (!props.comment.createdAt) return ''
  const date = new Date(props.comment.createdAt)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}/${day} ${hours}:${minutes}`
})

const onReplyClick = () => {
  emit('reply-to', props.comment.commentId)
}

const closeModal = () => {
  showModal.value = false
}

const handleLikeClick = async () => {
  if (isMyComment.value) {
    modalMessage.value = '자신의 댓글에는 좋아요를 누를 수 없습니다.'
    showModal.value = true
    return
  }
  if (isLiked.value) {
    modalMessage.value = '이미 좋아요를 누른 댓글입니다.'
    showModal.value = true
    return
  }

  isLiked.value = true
  likeCount.value++

  try {
    await boardStore.likeComment(props.comment.commentId)
  } catch (error) {
    console.error('Failed to like comment:', error.response?.data || error.message)

    isLiked.value = false
    likeCount.value--
  }
}
</script>

<style scoped lang="scss">
.comment-item {
  display: flex;
  gap: rem(10px);
  padding: rem(10px) rem(20px);
  background: var(--white);
}

.reply-icon {
  flex-shrink: 0;
  width: rem(20px);
  height: rem(20px);
}
.reply-icon img {
  width: 100%;
  height: 100%;
}

.comment-box {
  flex-grow: 1;
  background-color: var(--bg-subtle);
  border-radius: rem(12px);
  padding: rem(12px) rem(15px);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: rem(4px);
}

.comment-user {
  font-weight: var(--font-weight-bold);
  font-size: rem(14px);
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: rem(12px);
}

.comment-like {
  display: flex;
  align-items: center;
  gap: rem(4px);
  font-size: rem(12px);
  color: var(--color-text-light);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;

  svg {
    stroke: var(--color-text-light);
  }
}

.reply-btn {
  background: none;
  border: none;
  color: var(--color-text-light);
  font-size: rem(12px);
  cursor: pointer;
}

.comment-content {
  font-size: rem(14px);
  line-height: 1.4;
  color: var(--color-text-strong);
  margin-bottom: rem(6px);
}

.comment-date {
  font-size: rem(11px);
  color: var(--color-text-subtle);
  text-align: right;
}

.replies-container {
}
</style>
