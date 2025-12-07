<template>
  <div class="comment-list-container">
    <div v-if="loading" class="loading-state">댓글을 불러오는 중...</div>
    <div v-else-if="comments.length === 0" class="empty-state">작성된 댓글이 없습니다.</div>
    <div v-else>
      <BoardComment
        v-for="comment in nestedComments"
        :key="comment.comment_id"
        :comment="comment"
        :indentationLevel="0"
        @reply-to="handleReplyTo"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, defineProps, defineEmits } from 'vue'
import { useBoardStore } from '@/stores/board/board.js'
import BoardComment from './BoardComment.vue'

const props = defineProps({
  postId: {
    type: [String, Number],
    required: true,
  },
})

const emit = defineEmits(['reply-to'])

const boardStore = useBoardStore()
const comments = ref([])
const loading = ref(true)

onMounted(async () => {
  comments.value = await boardStore.fetchCommentsByPostId(props.postId)
  loading.value = false
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
  emit('reply-to', commentId)
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/utils/_pxToRem.scss';

.loading-state,
.empty-state {
  padding: rem(40px);
  text-align: center;
  color: var(--grey);
}
</style>
