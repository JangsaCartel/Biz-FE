<template>
  <div class="write-container">
    <header class="header">
      <button class="close-btn" aria-label="닫기" @click="closePage">
        <img src="@/assets/icons/common/close.png" alt="닫기" class="icon-img" />
      </button>
      <h1 class="page-title">{{ isEditMode ? '게시글 수정' : '글쓰기' }}</h1>
      <button class="complete-btn" @click="savePost">{{ isEditMode ? '수정' : '완료' }}</button>
    </header>

    <main class="editor-area">
      <div class="title-wrapper">
        <input
          v-model="title"
          type="text"
          class="input-title"
          placeholder="제목을 입력하세요"
          :maxlength="MAX_TITLE_CHARS"
        />
      </div>
      <div class="char-count title-char-count">
        {{ currentTitleChars }}자 / {{ MAX_TITLE_CHARS }}자
      </div>

      <textarea
        v-model="content"
        class="input-content"
        placeholder="내용을 입력하세요"
        :maxlength="MAX_CHARS"
      ></textarea>
      <div class="char-count">{{ currentChars }}자 / {{ MAX_CHARS }}자</div>
    </main>

    <ModalDialog :message="modalMessage" :is-visible="isModalVisible" @close="handleModalClose" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBoardStore } from '@/stores/board/board.js'
import ModalDialog from '@/components/common/ModalDialog.vue'

const route = useRoute()
const router = useRouter()
const boardStore = useBoardStore()

const localFilter = computed(() => boardStore.getLocalFilter)

const title = ref('')
const content = ref('')
const isEditMode = ref(false)
const postId = ref(null)
const currentCategoryId = ref(null)

// 모달 관련 상태
const isModalVisible = ref(false)
const modalMessage = ref('')
const modalCallback = ref(null)

const MAX_TITLE_CHARS = 30
const MAX_CHARS = 1000

const currentTitleChars = computed(() => title.value.length)
const currentChars = computed(() => content.value.length)

const categoryName = route.params.category
const postIdFromRoute = route.params.postId

// 수정 모드인지 확인
if (postIdFromRoute) {
  postId.value = Number(postIdFromRoute)
  isEditMode.value = true
}

const categoryMap = {
  free: 2,
  info: 3,
  local: 4,
}

const categoryId = computed(() => {
  return currentCategoryId.value || (categoryName ? categoryMap[categoryName] : null)
})

// [추가] 모달 표시 함수 (콜백 지원)
const showModal = (message, callback = null) => {
  modalMessage.value = message
  modalCallback.value = callback
  isModalVisible.value = true
}

// [추가] 모달 닫기 핸들러
const handleModalClose = () => {
  isModalVisible.value = false
  if (modalCallback.value) {
    modalCallback.value()
    modalCallback.value = null
  }
}

// 수정 모드일 때 게시글 데이터 로드
onMounted(async () => {
  if (isEditMode.value && postId.value) {
    try {
      const post = await boardStore.fetchPostById(postId.value)
      if (post) {
        title.value = post.title || ''
        content.value = post.content || ''
        currentCategoryId.value = post.categoryId || null
      }
    } catch (error) {
      console.error('게시글 조회 실패:', error)
      showModal('게시글을 불러오는데 실패했습니다.', () => {
        router.back()
      })
    }
  }
})

const savePost = async () => {
  if (!title.value.trim() || !content.value.trim()) {
    showModal('제목과 내용을 모두 입력해주세요.')
    return
  }

  if (!categoryId.value) {
    showModal('카테고리를 확인할 수 없습니다.')
    return
  }

  const postData = {
    title: title.value,
    content: content.value,
    categoryId: categoryId.value,
  }

  try {
    if (isEditMode.value && postId.value) {
      // 수정 모드: 업데이트 후 마이페이지로 이동
      await boardStore.updatePost(postId.value, postData)
      showModal('게시글이 수정되었습니다.', () => {
        router.push({ name: 'mypage' })
      })
    } else {
      // 작성 모드: 생성 후 목록으로 이동 (지역 필터 유지)
      await boardStore.createPost(postData)
      router.push({ name: categoryName, query: localFilter.value })
    }
  } catch (error) {
    console.error('Error saving post:', error)

    // 403 에러 처리 (권한 없음)
    if (error.response?.status === 403) {
      showModal('본인의 글만 수정할 수 있습니다.')
      return
    }

    // 401 에러 처리 (인증 실패) - apiClient에서 자동 처리됨
    if (error.response?.status === 401) {
      return
    }

    // 기타 에러
    showModal(isEditMode.value ? '게시글 수정에 실패했습니다.' : '게시글 작성에 실패했습니다.')
  }
}

const closePage = () => {
  if (isEditMode.value) {
    // 수정 취소 시 마이페이지로
    router.push({ name: 'mypage' })
  } else {
    // 작성 취소 시 목록으로 (지역 필터 유지)
    router.push({ name: categoryName, query: localFilter.value })
  }
}
</script>

<style scoped lang="scss">
.write-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-default);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: rem(56px);
  padding: 0 rem(16px);
}

.close-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn .icon-img {
  width: rem(18px);
  height: rem(18px);
}

.page-title {
  font-size: rem(18px);
  font-weight: var(--font-weight-bold);
  color: var(--black);
  margin: 0;
}

.complete-btn {
  background: none;
  border: none;
  font-size: rem(16px);
  font-weight: var(--font-weight-semibold);
  color: var(--signature-color);
  cursor: pointer;
  padding: 0;
}

.editor-area {
  flex: 1;
  padding: rem(20px);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.title-wrapper {
  border-bottom: rem(2px) solid var(--grey-light);
  /* margin-bottom: rem(20px); */
}

.input-title {
  width: 100%;
  border: none;
  font-size: rem(18px);
  padding: rem(10px) 0;
  outline: none;
  font-weight: var(--font-weight-medium);
  font-family: inherit;
  background-color: transparent;
}

.input-title::placeholder {
  color: var(--grey);
}

.input-content {
  width: 100%;
  flex: 1;
  border: none;
  resize: none;
  font-size: rem(16px);
  line-height: 1.6;
  outline: none;
  font-family: inherit;
  overflow-y: auto;

  background-color: var(--white);
  padding: rem(16px);
  border-radius: rem(8px);
  box-shadow: 0 rem(1px) rem(3px) rgba(0, 0, 0, 0.05);

  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.input-content::placeholder {
  color: var(--grey);
}

.char-count {
  text-align: right;
  font-size: rem(13px);
  color: var(--grey);
  margin-top: rem(5px);
  padding-right: rem(16px);
}

.title-char-count {
  margin-bottom: rem(20px);
  margin-top: rem(8px);
  padding-right: 0;
}
</style>
