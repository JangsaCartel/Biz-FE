<template>
  <div class="write-container">
    <header class="header">
      <button class="close-btn" aria-label="닫기" @click="closePage">
        <img src="@/assets/icons/common/close.png" alt="닫기" class="icon-img" />
      </button>
      <h1 class="page-title">글쓰기</h1>
      <button class="complete-btn" @click="savePost">완료</button>
    </header>

    <main class="editor-area">
      <div class="title-wrapper">
        <input v-model="title" type="text" class="input-title" placeholder="제목을 입력하세요" />
      </div>

      <textarea
        v-model="content"
        class="input-content"
        placeholder="내용을 입력하세요"
        :maxlength="MAX_CHARS"
      ></textarea>
      <div class="char-count">{{ currentChars }}자 / {{ MAX_CHARS }}자</div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBoardStore } from '@/stores/board/board.js'

const route = useRoute()
const router = useRouter()
const boardStore = useBoardStore()

const title = ref('')
const content = ref('')

const MAX_CHARS = 1000

const currentChars = computed(() => content.value.length)

const categoryName = route.params.category

const categoryMap = {
  free: 2,
  info: 3,
  local: 4,
}

const categoryId = categoryMap[categoryName]

const savePost = async () => {
  if (!title.value.trim() || !content.value.trim()) {
    alert('제목과 내용을 모두 입력해주세요.')
    return
  }

  const postData = {
    title: title.value,
    content: content.value,
    categoryId: categoryId,
  }

  try {
    await boardStore.createPost(postData)
    router.push({ name: categoryName })
  } catch (error) {
    console.error('Error creating post:', error)
    alert('게시글 작성에 실패했습니다. 다시 시도해주세요.')
  }
}

const closePage = () => {
  router.push({ name: categoryName })
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/utils/_pxToRem.scss';

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
  margin-bottom: rem(20px);
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
</style>
