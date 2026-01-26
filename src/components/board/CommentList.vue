<template>
  <div class="comment-list-container">
    <div v-if="loading" class="loading-state">댓글을 불러오는 중...</div>
    <div v-else-if="comments.length === 0" class="empty-state">작성된 댓글이 없습니다.</div>
    <div v-else>
      <BoardComment
        v-for="item in flatCommentsWithLevel"
        :key="item.comment.commentId"
        :comment="item.comment"
        :indentationLevel="item.level"
        @reply-to="handleReplyTo"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
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

const flatCommentsWithLevel = computed(() => {
  if (!comments.value || comments.value.length === 0) {
    return []
  }

  const commentMap = {}
  const topLevelComments = []
  
  comments.value.forEach(comment => {
    commentMap[comment.commentId] = { ...comment, replies: [] }
  })

  comments.value.forEach(comment => {
    if (comment.parentCommentId && commentMap[comment.parentCommentId]) {
      commentMap[comment.parentCommentId].replies.push(commentMap[comment.commentId])
    } else {
      topLevelComments.push(commentMap[comment.commentId])
    }
  })

  const flatList = []
  function flatten(comment, level) {
    flatList.push({ comment, level })
    if (comment.replies) {
      comment.replies.forEach(reply => {
        flatten(reply, level + 1)
      })
    }
  }

  topLevelComments.forEach(comment => {
    flatten(comment, 0)
  })
  
  return flatList
})

const handleReplyTo = (commentId) => {
  emit('reply-to', commentId)
}
</script>

<style scoped lang="scss">
.loading-state,
.empty-state {
  padding: rem(40px);
  text-align: center;
  color: var(--grey);
}
</style>
