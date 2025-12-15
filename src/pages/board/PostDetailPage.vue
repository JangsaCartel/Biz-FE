<template>
  <div class="post-detail-page">
    <header v-if="post" class="board-header">
      <button @click="goToBoardList" class="back-button">
        <img src="@/assets/icons/common/next.png" alt="뒤로가기" class="icon-img" />
      </button>
      <h1 class="board-title" :style="{ color: boardColor }">{{ boardName }}</h1>
    </header>

    <div class="scrollable-main-content">
      <div class="post-content-area">
        <PostContent v-if="post" :post="post" />
        <div v-else-if="loading" class="loading-state">게시글을 불러오는 중입니다...</div>
        <div v-else class="empty-state">게시글을 찾을 수 없습니다.</div>
      </div>

      <div class="comment-list-scroll-area">
        <CommentList
          v-if="postId"
          :post-id="postId"
          :key="commentListKey"
          @reply-to="handleReplyTo"
        />
      </div>

      <div class="pagination-wrapper">
        <div class="pagination-inner">
          <AppPagination
            :current-page="currentPage"
            :total-items="totalPosts"
            :page-size="pageSize"
            @page-change="handlePageChange"
          ></AppPagination>
        </div>
      </div>
    </div>

    <div class="comment-input-wrapper">
      <input
        type="text"
        class="comment-input"
        v-model="newCommentContent"
        :placeholder="replyingToCommentId ? '답글을 입력하세요...' : '댓글을 입력하세요...'"
        @keyup.enter="submitComment"
        ref="commentInput"
      />
      <button class="comment-submit-btn" @click="submitComment">등록</button>
      <button v-if="replyingToCommentId" class="cancel-reply-btn" @click="cancelReply">취소</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBoardStore } from '@/stores/board/board.js'
import PostContent from '@/components/board/PostContent.vue'
import CommentList from '@/components/board/CommentList.vue'

const route = useRoute()
const router = useRouter()
const boardStore = useBoardStore()
const post = ref(null)
const loading = ref(true)
const postId = ref(null)
const commentInput = ref(null)

const newCommentContent = ref('')
const replyingToCommentId = ref(null)
const commentListKey = ref(0)

const handleReplyTo = (commentId) => {
  replyingToCommentId.value = commentId
  commentInput.value?.focus()
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

  const createdComment = await boardStore.createComment(postId.value, newComment)

  if (createdComment) {
    newCommentContent.value = ''
    replyingToCommentId.value = null
    commentListKey.value++
  }
}

const categoryMap = {
  1: { name: 'HOT', color: 'var(--board-hot)', routeName: 'hot' },
  2: { name: '자유', color: 'var(--board-free)', routeName: 'free' },
  3: { name: '정보공유', color: 'var(--board-info)', routeName: 'info' },
  4: { name: '우리 동네', color: 'var(--board-local)', routeName: 'local' },
}

const boardName = computed(() => {
  if (post.value && post.value.categoryId) {
    const category = categoryMap[post.value.categoryId]
    return category ? `${category.name} 게시판` : '게시판'
  }
  return '게시판'
})

const boardColor = computed(() => {
  if (post.value && post.value.categoryId) {
    const category = categoryMap[post.value.categoryId]
    return category ? category.color : 'var(--color-text-strong)'
  }
  return 'var(--color-text-strong)'
})

const goToBoardList = () => {
  if (post.value && post.value.categoryId) {
    const category = categoryMap[post.value.categoryId]
    if (category && category.routeName) {
      const previousRoute = router.options.history.state.back
      if (previousRoute && previousRoute.startsWith('/' + category.routeName)) {
        router.back()
      } else {
        router.push({ name: category.routeName })
      }
    } else {
      router.back()
    }
  } else {
    router.back()
  }
}

onMounted(async () => {
  postId.value = route.params.postId
  if (postId.value) {
    post.value = await boardStore.fetchPostById(postId.value)
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.post-detail-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.scrollable-main-content {
  flex-grow: 1;
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.post-content-area {
  flex-shrink: 0;
  padding-bottom: rem(20px);
}

.comment-list-container {
  padding-bottom: rem(20px);
}

.board-header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: rem(20px) 0;
  background-color: var(--bg-header);
  border-bottom: rem(1px) solid var(--grey-light);
  flex-shrink: 0;
}

.board-title {
  font-size: rem(19px);
  font-weight: var(--font-weight-extra-bold);
  margin: 0;
}

.back-button {
  position: absolute;
  left: rem(20px);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.back-button .icon-img {
  width: rem(24px);
  height: rem(24px);
}

.pagination-wrapper {
  flex-shrink: 0;
  background-color: var(--white);
  border-top: rem(1px) solid var(--grey-light);
  padding-top: rem(10px);
  z-index: 10;
}

.pagination-inner {
  padding: rem(20px) 0;
}

.comment-input-wrapper {
  display: flex;
  padding: rem(10px);
  gap: rem(5px);
  border-top: rem(1px) solid var(--grey-light);
  background-color: var(--bg-default);
  flex-shrink: 0;
}
.comment-input {
  flex-grow: 1;
  border: rem(1px) solid var(--grey);
  border-radius: rem(6px);
  padding: rem(8px) rem(12px);
  font-size: rem(14px);
}
.comment-submit-btn,
.cancel-reply-btn {
  border: none;
  background-color: var(--board-free);
  color: var(--white);
  padding: rem(8px) rem(15px);
  border-radius: rem(6px);
  cursor: pointer;
}
.cancel-reply-btn {
  background-color: var(--color-text-subtle);
}
</style>
