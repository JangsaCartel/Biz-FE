<template>
  <div class="comment-container" :style="{ marginLeft: `${indentationLevel * 20}px` }">
    <div class="comment-item">
      <div v-if="indentationLevel > 0" class="reply-icon">
        <img src="@/assets/icons/board/turn-right 1.png" alt="Reply" />
      </div>
      <div class="comment-box">
        <div class="comment-header">
          <span class="comment-user">{{ comment.author_nickname }}</span>
          <div class="comment-actions">
            <button class="comment-like" @click="handleLikeClick">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
              </svg>
              <span>{{ likeCount }}</span>
            </button>
            <button class="reply-btn" @click="onReplyClick">
              답글
            </button>
          </div>
        </div>
        <div class="comment-content" v-html="comment.content"></div>
        <div class="comment-date">{{ formattedDate }}</div>
      </div>
    </div>

    <div v-if="comment.replies && comment.replies.length > 0" class="replies-container">
      <Comment
        v-for="reply in comment.replies"
        :key="reply.comment_id"
        :comment="reply"
        :indentationLevel="indentationLevel + 1"
        @reply-to="emitReply"
      />
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref } from 'vue'
import { useBoardStore } from '@/stores/board/board.js'

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

const likeCount = ref(props.comment.like_count || 0)

const formattedDate = computed(() => {
  if (!props.comment.created_at) return ''
  const date = new Date(props.comment.created_at)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}/${day} ${hours}:${minutes}`
})

const onReplyClick = () => {
  emit('reply-to', props.comment.comment_id)
}

const emitReply = (commentId) => {
  emit('reply-to', commentId)
}

const handleLikeClick = () => {
  likeCount.value++
  boardStore.likeComment(props.comment.comment_id)
}
</script>

<style scoped>
.comment-container {
  border-bottom: 1px solid #f0f0f0;
}
.comment-container:last-child {
  border-bottom: none;
}

.comment-item {
  display: flex;
  gap: 10px;
  padding: 15px 20px;
  background: white;
}

.reply-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}
.reply-icon img {
  width: 100%;
  height: 100%;
}

.comment-box {
  flex-grow: 1;
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 12px 15px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.comment-user {
  font-weight: 700;
  font-size: 14px;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comment-like {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.reply-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 12px;
  cursor: pointer;
}

.comment-content {
  font-size: 14px;
  line-height: 1.4;
  color: #333;
  margin-bottom: 6px;
}

.comment-date {
  font-size: 11px;
  color: #aaa;
  text-align: right;
}

.replies-container {
  /* This is just a wrapper, no specific styles needed unless for spacing */
}
</style>
