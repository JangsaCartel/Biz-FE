<template>
  <div class="my-page-container">
    <!-- 프로필 섹션 -->
    <div class="profile-section">
      <div class="profile-info">
        <h2 class="user-name">{{ profile.nickname }} ({{ profile.userStoreName }})</h2>
        <p class="business-type">{{ profile.region }}</p>
      </div>
      <button class="nickname-change-btn" @click="showNicknameModal = true">닉네임 변경</button>
    </div>

    <!-- 내가 작성한 글 섹션 -->
    <div class="my-posts-section">
      <div class="section-header">
        <div class="section-title">
          <span class="section-icon">👤</span>
          <span>내가 작성한 글</span>
        </div>
        <div class="action-buttons">
          <button class="action-btn" @click="handleEditClick">
            <span class="action-icon">✏️</span>
            <span>수정하기</span>
          </button>
          <button class="action-btn" @click="handleDeleteSelected">
            <span class="action-icon">🗑️</span>
            <span>삭제하기</span>
          </button>
        </div>
      </div>

      <!-- 게시글 목록 -->
      <div class="posts-list">
        <div
          v-for="post in paginatedPosts"
          :key="post.postId"
          class="post-item-wrapper"
          @click="goToPostDetail(post.postId)"
        >
          <div class="checkbox-wrapper">
            <input
              type="checkbox"
              :value="post.postId"
              v-model="selectedPostsForDelete"
              @click.stop
            />
          </div>
          <HotBoardItem :post="transformPostForHotBoardItem(post)" />
        </div>
        <div v-if="posts.length === 0" class="no-posts">작성한 게시글이 없습니다.</div>
      </div>

      <!-- 페이지네이션 -->
      <div class="pagination-wrapper" v-if="posts.length > 0">
        <AppPagination
          :current-page="currentPage"
          :total-items="posts.length"
          :page-size="pageSize"
          @page-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 닉네임 변경 모달 -->
    <div v-if="showNicknameModal" class="modal-overlay" @click="closeNicknameModal">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">닉네임 변경</h3>
        <input
          v-model="newNickname"
          type="text"
          class="modal-input"
          placeholder="새 닉네임을 입력하세요"
          @keyup.enter="handleNicknameUpdate"
        />
        <div class="modal-buttons">
          <button class="modal-btn cancel-btn" @click="closeNicknameModal">취소</button>
          <button class="modal-btn confirm-btn" @click="handleNicknameUpdate">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyPageProfile, updateNickname, getMyPosts, deleteMyPost } from '@/api/userApi'
import AppPagination from '@/components/common/AppPagination.vue'
import HotBoardItem from '@/components/board/HotBoardItem.vue'

const router = useRouter()

const profile = ref({
  userId: null,
  nickname: '',
  userStoreName: '',
  region: '',
})

const posts = ref([])
const loading = ref(false)
const selectedPostsForDelete = ref([])
const showNicknameModal = ref(false)
const newNickname = ref('')

const currentPage = ref(1)
const pageSize = ref(3)

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return posts.value.slice(start, end)
})

// categoryName을 categoryId로 변환하는 매핑 (다양한 형식 지원)
const categoryNameToIdMap = {
  '정보공유 게시판': 3,
  정보공유: 3,
  '자유 게시판': 2,
  자유: 2,
  '우리 동네 게시판': 4,
  '우리 동네': 4,
  'HOT 게시판': 1,
  HOT: 1,
}

// HotBoardItem에 맞게 게시글 데이터 변환
const transformPostForHotBoardItem = (post) => {
  console.log('변환 전 게시글 데이터:', post)

  // categoryName 매핑 (다양한 형식 지원)
  let categoryId = null
  if (post.categoryName) {
    // 정확한 매칭 먼저 시도
    categoryId = categoryNameToIdMap[post.categoryName]

    // 정확한 매칭이 안되면 부분 매칭 시도
    if (!categoryId) {
      const categoryNameLower = post.categoryName.toLowerCase()
      if (categoryNameLower.includes('정보')) {
        categoryId = 3
      } else if (categoryNameLower.includes('자유')) {
        categoryId = 2
      } else if (categoryNameLower.includes('동네')) {
        categoryId = 4
      } else if (categoryNameLower.includes('hot')) {
        categoryId = 1
      }
    }
  }

  console.log('categoryName:', post.categoryName, '-> categoryId:', categoryId)

  const transformed = {
    postId: post.postId,
    title: post.title,
    content: post.content || '', // 백엔드에 없으면 빈 문자열
    createdAt: post.createdAt,
    categoryId: categoryId,
    likeCount: post.likeCount || 0, // 백엔드에 없으면 0
    commentCount: post.commentCount || 0, // 백엔드에 없으면 0
  }
  console.log('변환 후 게시글 데이터:', transformed)
  return transformed
}

const handleEditClick = () => {
  // 체크박스로 선택된 게시글 중 첫 번째 것을 수정
  if (selectedPostsForDelete.value.length === 0) {
    alert('수정할 게시글을 선택해주세요.')
    return
  }
  if (selectedPostsForDelete.value.length > 1) {
    alert('수정할 게시글은 하나만 선택해주세요.')
    return
  }
  router.push({ name: 'editPost', params: { postId: selectedPostsForDelete.value[0] } })
}

const handleDeleteSelected = async () => {
  if (selectedPostsForDelete.value.length === 0) {
    alert('삭제할 게시글을 선택해주세요.')
    return
  }

  if (!confirm(`선택한 ${selectedPostsForDelete.value.length}개의 게시글을 삭제하시겠습니까?`)) {
    return
  }

  try {
    for (const postId of selectedPostsForDelete.value) {
      await deleteMyPost(postId)
    }
    await fetchMyPosts()
    selectedPostsForDelete.value = []
    alert('게시글이 삭제되었습니다.')
  } catch (error) {
    console.error('게시글 삭제 실패:', error)
    alert('게시글 삭제에 실패했습니다.')
  }
}

const handleNicknameUpdate = async () => {
  if (!newNickname.value.trim()) {
    alert('닉네임을 입력해주세요.')
    return
  }

  try {
    const response = await updateNickname(newNickname.value.trim())
    console.log('닉네임 변경 응답:', response)
    await fetchProfile()
    closeNicknameModal()
    alert('닉네임이 변경되었습니다.')
  } catch (error) {
    console.error('닉네임 변경 실패:', error)
    console.error('에러 응답:', error.response)
    console.error('에러 상태:', error.response?.status)
    console.error('에러 데이터:', error.response?.data)
    console.error('에러 메시지:', error.message)
    alert('닉네임 변경에 실패했습니다.')
  }
}

const closeNicknameModal = () => {
  showNicknameModal.value = false
  newNickname.value = ''
}

const handlePageChange = (page) => {
  currentPage.value = page
  selectedPostsForDelete.value = []
}

const goToPostDetail = (postId) => {
  if (!selectedPostsForDelete.value.includes(postId)) {
    router.push(`/board/${postId}`)
  }
}

const fetchProfile = async () => {
  try {
    const response = await getMyPageProfile()
    console.log('프로필 응답:', response)
    profile.value = response.data
  } catch (error) {
    console.error('프로필 조회 실패:', error)
    console.error('에러 응답:', error.response)
    console.error('에러 메시지:', error.message)
    alert('프로필 정보를 불러오는데 실패했습니다.')
  }
}

const fetchMyPosts = async () => {
  loading.value = true
  try {
    const response = await getMyPosts()
    console.log('게시글 응답:', response)
    console.log('게시글 데이터:', response.data)
    posts.value = response.data || []
    currentPage.value = 1
  } catch (error) {
    console.error('게시글 조회 실패:', error)
    console.error('에러 응답:', error.response)
    console.error('에러 상태:', error.response?.status)
    console.error('에러 데이터:', error.response?.data)
    console.error('에러 메시지:', error.message)
    alert('게시글 목록을 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchProfile()
  await fetchMyPosts()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/utils/_pxToRem.scss' as *;

.my-page-container {
  width: 100%;
  max-width: rem(430px);
  margin: 0 auto;
  padding: rem(20px) rem(16px);
  background-color: var(--bg-default);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.profile-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: rem(20px);
  padding-top: rem(24px);
  padding-bottom: rem(24px);
  border-bottom: rem(1px) solid var(--grey-light);
}

.profile-info {
  flex: 1;
}

.user-name {
  font-size: rem(24px);
  font-weight: var(--font-weight-extra-bold);
  color: var(--color-text-strong);
  margin: 0 0 rem(8px) 0;
}

.business-type {
  font-size: rem(16px);
  color: var(--color-text-light);
  margin: 0;
}

.nickname-change-btn {
  padding: rem(8px) rem(16px);
  border: rem(1px) solid var(--black);
  border-radius: rem(8px);
  background-color: var(--signature-color);
  color: var(--black);
  font-size: rem(14px);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  white-space: nowrap;
  margin-left: rem(16px);
}

.nickname-change-btn:hover {
  background-color: var(--semi-signature-color);
}

.my-posts-section {
  margin-top: rem(20px);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: rem(16px);
  padding-bottom: rem(12px);
  border-bottom: rem(1px) solid var(--grey-light);
}

.section-title {
  display: flex;
  align-items: center;
  gap: rem(8px);
  font-size: rem(18px);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-strong);
}

.section-icon {
  font-size: rem(20px);
}

.action-buttons {
  display: flex;
  gap: rem(12px);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: rem(4px);
  background: none;
  border: none;
  color: var(--color-text-light);
  font-size: rem(14px);
  cursor: pointer;
  padding: rem(4px) rem(8px);
}

.action-btn:hover {
  color: var(--color-text-strong);
}

.action-icon {
  font-size: rem(16px);
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: rem(16px);
  flex: 1;
  padding-bottom: rem(80px);
}

.post-item-wrapper {
  position: relative;
  background-color: var(--white);
  border-radius: rem(12px);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  border: rem(1px) solid var(--grey-light);
}

.post-item-wrapper:hover {
  box-shadow: 0 rem(2px) rem(8px) rgba(0, 0, 0, 0.1);
}

// HotBoardItem 내부의 내용이 침범하지 않도록 제한
.post-item-wrapper :deep(.post-content) {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  max-height: calc(1.4em * 2);
  line-height: 1.4;
}

.checkbox-wrapper {
  position: absolute;
  top: 50%;
  right: rem(16px);
  transform: translateY(-50%);
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: rem(4px);
  padding: rem(4px);
  width: rem(20px);
  height: rem(20px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-wrapper input[type='checkbox'] {
  width: rem(20px);
  height: rem(20px);
  cursor: pointer;
  accent-color: var(--signature-color);
  margin: 0;
}

.no-posts {
  text-align: center;
  padding: rem(40px) 0;
  color: var(--text-subtitle);
  font-size: rem(16px);
}

.pagination-wrapper {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: rem(430px);
  padding: rem(16px) rem(16px) rem(20px);
  background-color: var(--bg-default);
  border-top: rem(1px) solid var(--grey-light);
  z-index: 100;
  box-shadow: 0 rem(-2px) rem(8px) rgba(0, 0, 0, 0.05);
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--white);
  border-radius: rem(16px);
  padding: rem(24px);
  width: 90%;
  max-width: rem(400px);
}

.modal-title {
  font-size: rem(20px);
  font-weight: var(--font-weight-bold);
  margin: 0 0 rem(20px) 0;
  color: var(--color-text-strong);
}

.modal-input {
  width: 100%;
  padding: rem(12px);
  border: rem(1px) solid var(--grey);
  border-radius: rem(8px);
  font-size: rem(16px);
  margin-bottom: rem(20px);
  box-sizing: border-box;
}

.modal-input:focus {
  outline: none;
  border-color: var(--signature-color);
}

.modal-buttons {
  display: flex;
  gap: rem(12px);
  justify-content: flex-end;
}

.modal-btn {
  padding: rem(10px) rem(20px);
  border-radius: rem(8px);
  font-size: rem(14px);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border: none;
}

.cancel-btn {
  background-color: var(--bg-default);
  color: var(--color-text-strong);
}

.confirm-btn {
  background-color: var(--signature-color);
  color: var(--black);
}

.modal-btn:hover {
  opacity: 0.8;
}
</style>
