<template>
  <div class="comment-list-container">
    <div v-if="loading" class="loading-state">댓글을 불러오는 중...</div>
    <div v-else-if="comments.length === 0" class="empty-state">작성된 댓글이 없습니다.</div>
    <div v-else>
      <Comment
        v-for="comment in nestedComments"
        :key="comment.comment_id"
        :comment="comment"
        :indentationLevel="0"
        @reply-to="handleReplyTo"
      />
    </div>

    <div class="comment-input-wrapper">
      <input
        type="text"
        class="comment-input"
        v-model="newCommentContent"
        :placeholder="replyingToCommentId ? '답글을 입력하세요...' : '댓글을 입력하세요...'"
        @keyup.enter="submitComment"
      />
      <button class="comment-submit-btn" @click="submitComment">등록</button>
      <button v-if="replyingToCommentId" class="cancel-reply-btn" @click="cancelReply">취소</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, defineProps } from 'vue'
import { useBoardStore } from '@/stores/board/board.js'
import Comment from './Comment.vue'

const props = defineProps({
  postId: {
    type: [String, Number],
    required: true,
  },
  commentsData: {
    type: Array,
    default: null,
  },
})

const boardStore = useBoardStore()
const comments = ref([])
const loading = ref(true)
const newCommentContent = ref('')
const replyingToCommentId = ref(null)

onMounted(async () => {
  if (props.commentsData) {
    comments.value = props.commentsData
    loading.value = false
  } else {
    comments.value = await boardStore.fetchCommentsByPostId(props.postId)
    loading.value = false
  }
})

const nestedComments = computed(() => {
  const commentMap = {}
  const nested = []

  comments.value.forEach((comment) => {
    commentMap[comment.comment_id] = { ...comment, replies: [] }
  })

  comments.value.forEach((comment) => {
    if (comment.parent_comment_id) {
      const parent = commentMap[comment.parent_comment_id]
      if (parent) {
        parent.replies.push(commentMap[comment.comment_id])
      }
    } else {
      nested.push(commentMap[comment.comment_id])
    }
  })

  return nested
})

const handleReplyTo = (commentId) => {
  replyingToCommentId.value = commentId
  document.querySelector('.comment-input').focus()
}

const cancelReply = () => {
  replyingToCommentId.value = null
  newCommentContent.value = ''
}

const submitComment = async () => {
  if (!newCommentContent.value.trim()) return

  const newComment = {
    content: newCommentContent.value,
    parent_comment_id: replyingToCommentId.value,
  }

  const createdComment = await boardStore.createComment(props.postId, newComment)

  if (createdComment) {
    comments.value.push(createdComment)
    newCommentContent.value = ''
    replyingToCommentId.value = null
  }
}
</script>

<style scoped>
.comment-input-wrapper {
  display: flex;
  padding: 10px;
  gap: 5px;
  border-top: 1px solid #eee;
}
.comment-input {
  flex-grow: 1;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
}
.comment-submit-btn,
.cancel-reply-btn {
  border: none;
  background-color: #ffc145;
  color: white;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
}
.cancel-reply-btn {
  background-color: #aaa;
}
.loading-state,
.empty-state {
  padding: 40px;
  text-align: center;
  color: #888;
}
</style>
