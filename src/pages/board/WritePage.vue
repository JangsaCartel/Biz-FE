<template>
  <div class="write-container">
    <header class="header">
      <button class="close-btn" aria-label="닫기" @click="closePage">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 6L6 18"
            stroke="black"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M6 6L18 18"
            stroke="black"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <h1 class="page-title">글쓰기</h1>
      <button class="complete-btn" @click="savePost">완료</button>
    </header>

    <main class="editor-area">
      <div class="title-wrapper">
        <input v-model="title" type="text" class="input-title" placeholder="제목을 입력하세요" />
      </div>

      <textarea v-model="content" class="input-content" placeholder="내용을 입력하세요"></textarea>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBoardStore } from '@/stores/board/board.js'

const route = useRoute()
const router = useRouter()
const boardStore = useBoardStore()

const title = ref('')
const content = ref('')

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
    category_id: categoryId,
  }

  await boardStore.createPost(postData)

  router.push({ name: categoryName })
}

const closePage = () => {
  router.push({ name: categoryName })
}
</script>

<style scoped>
.write-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f9f9f9;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px;
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

.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #000;
  margin: 0;
}

.complete-btn {
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: #ffcc00;
  cursor: pointer;
  padding: 0;
}

.editor-area {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.title-wrapper {
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 20px;
}

.input-title {
  width: 100%;
  border: none;
  font-size: 18px;
  padding: 10px 0;
  outline: none;
  font-weight: 500;
  font-family: inherit;
  background-color: transparent;
}

.input-title::placeholder {
  color: #bdbdbd;
}

.input-content {
  width: 100%;
  flex: 1;
  border: none;
  resize: none;
  font-size: 16px;
  line-height: 1.6;
  outline: none;
  font-family: inherit;

  background-color: #ffffff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.input-content::placeholder {
  color: #bdbdbd;
}
</style>
