<template>
  <div class="my-page-container">
    <!-- 프로필 섹션 -->
    <div class="profile-section">
      <div class="profile-info">
        <h2 class="user-name">{{ profile.nickname }} ({{ profile.userStoreName }})</h2>
        <p class="business-type">{{ profile.region }}</p>
      </div>
      <button class="profile-change-btn" @click="showProfileModal = true">회원 정보 변경</button>
    </div>

    <!-- 내가 작성한 글/댓글 섹션 -->
    <div class="my-posts-section">
      <div class="section-header">
        <div class="section-title" @click="switchTab(activeTab === 'posts' ? 'comments' : 'posts')">
          <span class="section-icon">👤</span>
          <span class="tab-item">{{ activeTab === 'posts' ? '내가 작성한 글' : '내가 작성한 댓글' }}</span>
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
      <div v-if="activeTab === 'posts'" class="posts-list">
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

      <!-- 댓글 목록 -->
      <div v-if="activeTab === 'comments'" class="comments-list">
        <div
          v-for="comment in paginatedComments"
          :key="comment.commentId"
          class="comment-item-wrapper"
          :class="{ 'editing-mode': editingCommentId === comment.commentId }"
        >
          <div v-if="editingCommentId !== comment.commentId" class="comment-item" @click="goToPostDetail(comment.postId)">
            <div class="checkbox-wrapper">
              <input
                type="checkbox"
                :value="comment.commentId"
                v-model="selectedCommentsForDelete"
                @click.stop
              />
            </div>
            <div class="comment-content-area">
              <div class="comment-header">
                <span class="board-name" :style="{ color: getBoardColor(comment) }">
                  {{ getBoardName(comment) }}
                </span>
                <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
              </div>
              <h3 class="comment-post-title">{{ comment.postTitle || '게시글 제목' }}</h3>
              <p class="comment-content-text">{{ truncateContent(comment.content) }}</p>
              <div class="comment-footer">
                <div class="comment-stats">
                  <div class="stat-item">
                    <i class="like-icon"></i>
                    <span>{{ comment.likeCount || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="dit-wcomment-erapper">
            <button class="close-edit-btn" @click="cancelEditComment">✕</button>
            <textarea
              v-model="editingCommentContent"
              class="comment-edit-input"
              placeholder="댓글 내용을 입력하세요"
              :style="{ height: getTextareaHeight(editingCommentContent) }"
            ></textarea>
            <button class="save-edit-btn" @click="saveCommentEdit(comment.commentId)">수정하기</button>
          </div>
        </div>
        <div v-if="comments.length === 0" class="no-posts">작성한 댓글이 없습니다.</div>
      </div>

      <!-- 페이지네이션 -->
      <div class="pagination-wrapper" v-if="(activeTab === 'posts' && posts.length > 0) || (activeTab === 'comments' && comments.length > 0)">
        <AppPagination
          :current-page="currentPage"
          :total-items="activeTab === 'posts' ? posts.length : comments.length"
          :page-size="pageSize"
          @page-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 회원 정보 변경 모달 -->
    <div v-if="showProfileModal" class="modal-overlay" @click="closeProfileModal">
      <div class="profile-modal-content" @click.stop>
        <h3 class="modal-title">회원 정보 변경</h3>
        <div class="form-group">
          <label>닉네임</label>
          <input v-model="editProfile.nickname" type="text" class="modal-input" />
        </div>
        <div class="form-group">
          <label>상호명</label>
          <input v-model="editProfile.userStoreName" type="text" class="modal-input" />
        </div>
        <div class="form-group">
          <label>활동 지역</label>
          <RegionDropdowns v-model:region="editRegion" />
        </div>
        <div class="modal-buttons">
          <button class="modal-btn withdraw-btn" @click="showWithdrawConfirm = true">회원 탈퇴</button>
          <div class="right-buttons">
            <button class="modal-btn cancel-btn" @click="closeProfileModal">취소</button>
            <button class="modal-btn confirm-btn" @click="handleProfileUpdate">확인</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 회원 탈퇴 확인 모달 -->
    <ModalDialog
      :message="'회원 탈퇴하시겠습니까?'"
      :is-visible="showWithdrawConfirm"
      button-type="double"
      primary-button-text="확인"
      secondary-button-text="취소"
      @close="showWithdrawConfirm = false"
      @primary="handleWithdraw"
      @secondary="showWithdrawConfirm = false"
    />

    <!-- 회원 탈퇴 완료 모달 -->
    <ModalDialog
      :message="'회원 탈퇴가 정상적으로 진행되었습니다.'"
      :is-visible="showWithdrawSuccess"
      @close="handleWithdrawSuccessClose"
    />

    <!-- 삭제 확인 모달 -->
    <ModalDialog
      :message="`선택한 ${deleteCount}개의 ${deleteType === 'posts' ? '게시글' : '댓글'}을 삭제하시겠습니까?`"
      :is-visible="showDeleteConfirm"
      button-type="double"
      primary-button-text="확인"
      secondary-button-text="취소"
      @close="showDeleteConfirm = false"
      @primary="confirmDelete"
      @secondary="showDeleteConfirm = false"
    />

    <!-- 일반 알림 모달 -->
    <ModalDialog
      :message="modalMessage"
      :is-visible="isModalVisible"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  getMyPageProfile,
  updateNickname,
  getMyPosts,
  deleteMyPost,
  getMyComments,
  updateComment,
  deleteComment,
  updateRegion,
  updateStoreName,
  withdrawUser,
} from '@/api/userApi'
import AppPagination from '@/components/common/AppPagination.vue'
import HotBoardItem from '@/components/board/HotBoardItem.vue'
import ModalDialog from '@/components/common/ModalDialog.vue'
import RegionDropdowns from '@/components/common/RegionDropdowns.vue'

const router = useRouter()

const profile = ref({
  userId: null,
  nickname: '',
  userStoreName: '',
  region: '',
})

const posts = ref([])
const comments = ref([])
const loading = ref(false)
const activeTab = ref('posts')
const selectedPostsForDelete = ref([])
const selectedCommentsForDelete = ref([])
const showProfileModal = ref(false)
const showWithdrawConfirm = ref(false)
const showWithdrawSuccess = ref(false)
const editingCommentId = ref(null)
const editingCommentContent = ref('')
const showDeleteConfirm = ref(false)
const deleteType = ref('') // 'posts' or 'comments'
const deleteCount = ref(0)

const editProfile = ref({
  nickname: '',
  userStoreName: '',
})

const editRegion = ref({
  sido: '',
  gugun: '',
  dong: '',
})

const modalMessage = ref('')
const isModalVisible = ref(false)

const currentPage = ref(1)
const pageSize = ref(3)

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return posts.value.slice(start, end)
})

const paginatedComments = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return comments.value.slice(start, end)
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
  let categoryId = null
  if (post.categoryName) {
    categoryId = categoryNameToIdMap[post.categoryName]
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

  return {
    postId: post.postId,
    title: post.title,
    content: post.content || '',
    createdAt: post.createdAt,
    categoryId: categoryId,
    likeCount: post.likeCount || 0,
    commentCount: post.commentCount || 0,
  }
}

const switchTab = async (tab) => {
  activeTab.value = tab
  currentPage.value = 1
  selectedPostsForDelete.value = []
  selectedCommentsForDelete.value = []
  editingCommentId.value = null

  if (tab === 'comments' && comments.value.length === 0) {
    await fetchMyComments()
  }
}

const handleEditClick = () => {
  if (activeTab.value === 'posts') {
    if (selectedPostsForDelete.value.length === 0) {
      showModal('수정할 게시글을 선택해주세요.')
      return
    }
    if (selectedPostsForDelete.value.length > 1) {
      showModal('수정할 게시글은 하나만 선택해주세요.')
      return
    }
    router.push({ name: 'editPost', params: { postId: selectedPostsForDelete.value[0] } })
  } else {
    if (selectedCommentsForDelete.value.length === 0) {
      showModal('수정할 댓글을 선택해주세요.')
      return
    }
    if (selectedCommentsForDelete.value.length > 1) {
      showModal('수정할 댓글은 하나만 선택해주세요.')
      return
    }
    const commentId = selectedCommentsForDelete.value[0]
    const comment = comments.value.find((c) => c.commentId === commentId)
    if (comment) {
      editingCommentId.value = commentId
      editingCommentContent.value = comment.content
    }
  }
}

const cancelEditComment = () => {
  editingCommentId.value = null
  editingCommentContent.value = ''
  selectedCommentsForDelete.value = []
}

const saveCommentEdit = async () => {
  if (!editingCommentContent.value.trim()) {
    showModal('댓글 내용을 입력해주세요.')
    return
  }

  try {
    await updateComment(editingCommentId.value, editingCommentContent.value.trim())
    await fetchMyComments()
    editingCommentId.value = null
    editingCommentContent.value = ''
    selectedCommentsForDelete.value = []
    showModal('댓글이 수정되었습니다.')
  } catch (error) {
    console.error('댓글 수정 실패:', error)
    showModal('댓글 수정에 실패했습니다.')
  }
}

const handleDeleteSelected = () => {
  if (activeTab.value === 'posts') {
    if (selectedPostsForDelete.value.length === 0) {
      showModal('삭제할 게시글을 선택해주세요.')
      return
    }
    deleteType.value = 'posts'
    deleteCount.value = selectedPostsForDelete.value.length
    showDeleteConfirm.value = true
  } else {
    if (selectedCommentsForDelete.value.length === 0) {
      showModal('삭제할 댓글을 선택해주세요.')
      return
    }
    deleteType.value = 'comments'
    deleteCount.value = selectedCommentsForDelete.value.length
    showDeleteConfirm.value = true
  }
}

const confirmDelete = async () => {
  try {
    if (deleteType.value === 'posts') {
      for (const postId of selectedPostsForDelete.value) {
        await deleteMyPost(postId)
      }
      await fetchMyPosts()
      selectedPostsForDelete.value = []
      showModal('게시글이 삭제되었습니다.')
    } else {
      for (const commentId of selectedCommentsForDelete.value) {
        await deleteComment(commentId)
      }
      await fetchMyComments()
      selectedCommentsForDelete.value = []
      showModal('댓글이 삭제되었습니다.')
    }
    showDeleteConfirm.value = false
  } catch (error) {
    console.error('삭제 실패:', error)
    showModal(deleteType.value === 'posts' ? '게시글 삭제에 실패했습니다.' : '댓글 삭제에 실패했습니다.')
    showDeleteConfirm.value = false
  }
}

const handleProfileUpdate = async () => {
  try {
    let hasUpdates = false

    if (editProfile.value.nickname !== profile.value.nickname) {
      await updateNickname(editProfile.value.nickname.trim())
      hasUpdates = true
    }

    if (editProfile.value.userStoreName !== profile.value.userStoreName) {
      await updateStoreName(editProfile.value.userStoreName.trim())
      hasUpdates = true
    }

    const regionString = editRegion.value.sido && editRegion.value.gugun && editRegion.value.dong
      ? `${editRegion.value.sido} ${editRegion.value.gugun} ${editRegion.value.dong}`
      : ''

    if (regionString && regionString !== profile.value.region) {
      await updateRegion(regionString)
      hasUpdates = true
    }

    if (hasUpdates) {
      await fetchProfile()
      closeProfileModal()
      showModal('회원 정보가 변경되었습니다.')
    } else {
      closeProfileModal()
    }
  } catch (error) {
    console.error('회원 정보 변경 실패:', error)
    showModal('회원 정보 변경에 실패했습니다.')
  }
}

const handleWithdraw = async () => {
  try {
    await withdrawUser()
    showWithdrawConfirm.value = false
    showWithdrawSuccess.value = true
  } catch (error) {
    console.error('회원 탈퇴 실패:', error)
    showModal('회원 탈퇴에 실패했습니다.')
    showWithdrawConfirm.value = false
  }
}

const handleWithdrawSuccessClose = () => {
  showWithdrawSuccess.value = false
  // 로그아웃 및 메인 이동 처리
  window.sessionStorage.removeItem('accessToken')
  window.sessionStorage.removeItem('refreshToken')
  router.push({ name: 'home' })
}

const closeProfileModal = () => {
  showProfileModal.value = false
  editProfile.value = {
    nickname: profile.value.nickname,
    userStoreName: profile.value.userStoreName,
  }
  // region 파싱
  const regionParts = profile.value.region ? profile.value.region.split(' ') : []
  editRegion.value = {
    sido: regionParts[0] || '',
    gugun: regionParts[1] || '',
    dong: regionParts[2] || '',
  }
}

const showModal = (message) => {
  modalMessage.value = message
  isModalVisible.value = true
}

const closeModal = () => {
  isModalVisible.value = false
  modalMessage.value = ''
}

const handlePageChange = (page) => {
  currentPage.value = page
  selectedPostsForDelete.value = []
  selectedCommentsForDelete.value = []
}

const goToPostDetail = (postId) => {
  if (activeTab.value === 'posts') {
    if (!selectedPostsForDelete.value.includes(postId)) {
      router.push(`/board/${postId}`)
    }
  } else {
    if (!selectedCommentsForDelete.value.includes(postId)) {
      router.push(`/board/${postId}`)
    }
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}/${day} ${hours}:${minutes}`
}

const truncateContent = (content) => {
  if (!content) return ''
  const strippedContent = content.replace(/<[^>]*>?/gm, '')
  const maxLength = 15 // HotBoardItem과 동일하게
  if (strippedContent.length > maxLength) {
    return strippedContent.slice(0, maxLength) + '...'
  }
  return strippedContent
}

const getBoardName = (comment) => {
  if (comment.categoryName) {
    return comment.categoryName + ' 게시판'
  }
  if (comment.categoryId) {
    const categoryMap = {
      1: 'HOT',
      2: '자유',
      3: '정보공유',
      4: '우리 동네',
    }
    return (categoryMap[comment.categoryId] || '기타') + ' 게시판'
  }
  return '게시판'
}

const getBoardColor = (comment) => {
  const categoryMap = {
    1: 'var(--board-hot)',
    2: 'var(--board-free)',
    3: 'var(--board-info)',
    4: 'var(--board-local)',
  }
  return categoryMap[comment.categoryId] || 'var(--color-text-strong)'
}

const getTextareaHeight = (content) => {
  if (!content) return 'auto'
  const lines = content.split('\n').length
  const minHeight = 80 // 최소 높이
  const lineHeight = 24 // 줄 높이
  const calculatedHeight = Math.max(minHeight, lines * lineHeight + 20)
  return `${calculatedHeight}px`
}

const fetchProfile = async () => {
  try {
    const response = await getMyPageProfile()
    profile.value = response.data
    editProfile.value = {
      nickname: response.data.nickname,
      userStoreName: response.data.userStoreName,
    }
    // region 파싱
    const regionParts = response.data.region ? response.data.region.split(' ') : []
    editRegion.value = {
      sido: regionParts[0] || '',
      gugun: regionParts[1] || '',
      dong: regionParts[2] || '',
    }
  } catch (error) {
    console.error('프로필 조회 실패:', error)
    showModal('프로필 정보를 불러오는데 실패했습니다.')
  }
}

const fetchMyPosts = async () => {
  loading.value = true
  try {
    const response = await getMyPosts()
    posts.value = response.data || []
    currentPage.value = 1
  } catch (error) {
    console.error('게시글 조회 실패:', error)
    showModal('게시글 목록을 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

const fetchMyComments = async () => {
  loading.value = true
  try {
    const response = await getMyComments()
    comments.value = response.data || []
    currentPage.value = 1
  } catch (error) {
    console.error('댓글 조회 실패:', error)
    showModal('댓글 목록을 불러오는데 실패했습니다.')
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

.profile-change-btn {
  padding: rem(8px) rem(16px);
  border: rem(1px) solid var(--signature-color);
  border-radius: rem(8px);
  background-color: transparent;
  color: var(--black);
  font-size: rem(14px);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  white-space: nowrap;
  margin-left: rem(16px);
  transition: background-color 0.2s;
}

.profile-change-btn:hover {
  background-color: rgba(255, 202, 44, 0.2);
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
  cursor: pointer;
  padding: rem(8px) rem(12px);
  border-radius: rem(4px);
  transition: background-color 0.2s;
  user-select: none;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
}

.section-icon {
  font-size: rem(20px);
}

.tab-item {
  margin-left: rem(16px);
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
  transition: color 0.2s;
}

.action-btn:hover {
  color: var(--color-text-strong);
}

.action-btn:first-child {
  border: rem(1px) solid var(--signature-color);
  border-radius: rem(8px);
  background-color: transparent;
  padding: rem(6px) rem(12px);
  transition: background-color 0.2s;
}

.action-btn:first-child:hover {
  background-color: rgba(255, 202, 44, 0.2);
}

.action-icon {
  font-size: rem(16px);
}

.posts-list,
.comments-list {
  display: flex;
  flex-direction: column;
  gap: rem(16px);
  flex: 1;
  padding-bottom: rem(80px);
}

.post-item-wrapper,
.comment-item-wrapper {
  position: relative;
  background-color: var(--white);
  border-radius: rem(12px);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  border: rem(1px) solid var(--grey-light);

  &.editing-mode {
    cursor: default;
  }
}

.post-item-wrapper:hover {
  box-shadow: 0 rem(2px) rem(8px) rgba(0, 0, 0, 0.1);
}

.comment-item {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: rem(16px) rem(20px);
  padding-right: rem(60px);
}

.comment-content-area {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: rem(8px);
}

.board-name {
  font-size: rem(14px);
  font-weight: var(--font-weight-extra-bold);
}

.comment-date {
  font-size: rem(13px);
  color: var(--color-text-subtle);
  white-space: nowrap;
  padding-top: rem(2px);
}

.comment-post-title {
  font-weight: var(--font-weight-bold);
  font-size: rem(16px);
  color: var(--color-text-strong);
  margin: 0 0 rem(8px) 0;
  line-height: 1.3;
  flex: 1;
  padding-right: rem(15px);
}

.comment-content-text {
  font-size: rem(15px);
  color: var(--color-text-default);
  margin: 0 0 rem(8px) 0;
  line-height: 1.4;
  height: calc(1.4em * 2);
  overflow: hidden;
}

.comment-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.comment-stats {
  display: flex;
  gap: rem(12px);
  font-size: rem(14px);
  color: var(--color-text-light);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: rem(4px);
}

.like-icon,
.comment-icon {
  display: inline-block;
  width: rem(16px);
  height: rem(16px);
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.6;
}

.like-icon {
  background-image: url('@/assets/icons/board/like.png');
}

.comment-icon {
  background-image: url('@/assets/icons/board/comment.png');
}

.comment-edit-wrapper {
  position: relative;
  padding: rem(16px) rem(20px);
  padding-right: rem(60px);
}

.comment-item-wrapper.editing-mode .checkbox-wrapper {
  display: none;
}

.close-edit-btn {
  position: absolute;
  top: rem(16px);
  right: rem(20px);
  width: rem(24px);
  height: rem(24px);
  border: none;
  background: none;
  font-size: rem(18px);
  color: var(--color-text-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-edit-btn:hover {
  color: var(--color-text-strong);
}

.comment-edit-input {
  width: 100%;
  padding: rem(12px);
  border: rem(1px) solid var(--grey-light);
  border-radius: rem(8px);
  font-size: rem(15px);
  resize: none;
  box-sizing: border-box;
  margin-bottom: rem(12px);
  overflow-y: auto;
  line-height: 1.5;
}

.comment-edit-input:focus {
  outline: none;
  border-color: var(--signature-color);
}

.save-edit-btn {
  padding: rem(8px) rem(16px);
  border: rem(1px) solid var(--black);
  border-radius: rem(8px);
  background-color: var(--signature-color);
  color: var(--black);
  font-size: rem(14px);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  float: right;
}

.save-edit-btn:hover {
  background-color: var(--semi-signature-color);
}

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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.profile-modal-content {
  background: white;
  padding: rem(24px);
  border-radius: rem(8px);
  width: 90%;
  max-width: rem(400px);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  font-size: rem(20px);
  font-weight: var(--font-weight-bold);
  margin: 0 0 rem(20px) 0;
  color: var(--color-text-strong);
}

.form-group {
  margin-bottom: rem(20px);

  label {
    display: block;
    margin-bottom: rem(8px);
    font-size: rem(14px);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-strong);
  }
}

.modal-input {
  width: 100%;
  padding: rem(12px);
  border: rem(1px) solid var(--grey);
  border-radius: rem(8px);
  font-size: rem(16px);
  box-sizing: border-box;
}

.modal-input:focus {
  outline: none;
  border-color: var(--signature-color);
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: rem(24px);
  gap: rem(12px);
}

.right-buttons {
  display: flex;
  gap: rem(12px);
}

.modal-btn {
  padding: rem(10px) rem(20px);
  border-radius: rem(8px);
  font-size: rem(14px);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border: none;
}

.withdraw-btn {
  background-color: #ff4444;
  color: white;
}

.withdraw-btn:hover {
  background-color: #cc0000;
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
