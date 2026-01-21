<template>
  <div class="my-page-container">
    <div class="profile-section">
      <div class="profile-info">
        <div class="name-line">
          <div class="scroll-text-wrapper nickname-wrapper" ref="nicknameWrapper">
            <div
              class="scrolling-track"
              :class="{ 'animate-scroll': isNicknameLong }"
              :style="{ '--scroll-amount': nicknameScrollAmount, '--scroll-duration': nicknameDuration }"
            >
              <span ref="nicknameText" class="highlight">{{ profile.nickname }}</span>
              <span v-if="isNicknameLong" class="highlight clone-text">{{ profile.nickname }}</span>
            </div>
          </div>
          <span class="greeting-suffix">님, {{ randomGreeting }}</span>
        </div>

        <div class="store-line">
          <div class="scroll-text-wrapper store-wrapper" ref="storeWrapper">
            <div
              class="scrolling-track"
              :class="{ 'animate-scroll': isStoreLong }"
              :style="{ '--scroll-amount': storeScrollAmount, '--scroll-duration': storeDuration }"
            >
              <span ref="storeText" class="store-name">{{ profile.userStoreName }}</span>
              <span v-if="isStoreLong" class="store-name clone-text">{{ profile.userStoreName }}</span>
            </div>
          </div>
        </div>

        <p class="business-type">{{ profile.region }}</p>
      </div>

      <div class="profile-actions">
        <button class="profile-change-btn" @click="showProfileModal = true">회원 정보 변경</button>
        <button class="logout-btn" @click="handleLogout">로그아웃</button>
      </div>
    </div>

    <div class="my-posts-section">
      <div class="section-header">
        <div class="section-title" @click="switchTab(activeTab === 'posts' ? 'comments' : 'posts')">
          <span class="section-icon">👤</span>
          <span class="tab-item">{{ activeTab === 'posts' ? '내가 작성한 글' : '내가 작성한 댓글' }}</span>
        </div>
        <div class="action-buttons">
          <button class="action-btn" @click="handleEditClick" :disabled="isActionDisabled">
            <span class="action-icon">✏️</span>
            <span>수정</span>
          </button>
          <button class="action-btn" @click="handleDeleteSelected" :disabled="isActionDisabled">
            <span class="action-icon">🗑️</span>
            <span>삭제</span>
          </button>
        </div>
      </div>

      <div class="list-container">
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

        <div v-if="activeTab === 'comments'" class="comments-list">
          <div
            v-for="comment in paginatedComments"
            :key="comment.commentId"
            class="comment-item-wrapper"
            :class="{ 'editing-mode': editingCommentId === comment.commentId }"
          >
            <div v-if="editingCommentId !== comment.commentId" class="comment-display-area" @click="goToPostDetail(comment.postId)">
              <div class="checkbox-wrapper">
                <input
                  type="checkbox"
                  :value="comment.commentId"
                  v-model="selectedCommentsForDelete"
                  @click.stop
                />
              </div>
              <HotBoardItem :post="transformCommentForHotBoardItem(comment)" />
            </div>

            <div v-else class="comment-edit-wrapper">
              <textarea
                v-model="editingCommentContent"
                class="comment-edit-input"
                placeholder="댓글 내용을 입력하세요"
                :style="{ height: getTextareaHeight(editingCommentContent) }"
              ></textarea>
              <div class="edit-actions">
                <button class="cancel-edit-btn" @click="cancelEditComment">취소</button>
                <button class="save-edit-btn" @click="saveCommentEdit(comment.commentId)">수정하기</button>
              </div>
            </div>
          </div>
          <div v-if="comments.length === 0" class="no-posts">작성한 댓글이 없습니다.</div>
        </div>
      </div>

      <div class="pagination-wrapper" v-if="(activeTab === 'posts' && posts.length > 0) || (activeTab === 'comments' && comments.length > 0)">
        <AppPagination
          :current-page="currentPage"
          :total-items="activeTab === 'posts' ? posts.length : comments.length"
          :page-size="pageSize"
          @page-change="handlePageChange"
        />
      </div>
    </div>

    <div v-if="showProfileModal" class="modal-overlay" @click="closeProfileModal">
      <div class="profile-modal-content" @click.stop>
        <h3 class="modal-title">회원 정보 변경</h3>

        <div class="form-group">
          <div class="label-wrapper">
            <label>닉네임</label>
            <span
              class="char-count"
              :class="{ 'max-limit': (editProfile.nickname?.length || 0) >= 32 }"
            >
              {{ editProfile.nickname?.length || 0 }}/32
            </span>
          </div>
          <input
            v-model="editProfile.nickname"
            type="text"
            class="modal-input"
            placeholder="닉네임을 입력해주세요"
            maxlength="32"
          />
          <p v-if="nicknameError" class="error-message">{{ nicknameError }}</p>
        </div>

        <div class="form-group">
          <div class="label-wrapper">
            <label>상호명</label>
            <span
              class="char-count"
              :class="{ 'max-limit': (editProfile.userStoreName?.length || 0) >= 32 }"
            >
              {{ editProfile.userStoreName?.length || 0 }}/32
            </span>
          </div>
          <input
            v-model="editProfile.userStoreName"
            type="text"
            class="modal-input"
            placeholder="상호명을 입력해주세요"
            maxlength="32"
          />
          <p v-if="storeNameError" class="error-message">{{ storeNameError }}</p>
        </div>

        <div class="form-group region-group">
          <label>활동 지역</label>
          <RegionDropdowns v-model:region="editRegion" />
          <p v-if="regionError" class="error-message">{{ regionError }}</p>
        </div>

        <div class="modal-buttons">
          <button class="modal-btn withdraw-btn" @click="showWithdrawConfirm = true">회원 탈퇴</button>
          <div class="right-buttons">
            <button class="modal-btn cancel-btn" @click="closeProfileModal">취소</button>
            <button
              class="modal-btn confirm-btn"
              @click="handleProfileUpdate"
              :disabled="isProfileUnchanged"
            >확인</button>
          </div>
        </div>
      </div>
    </div>

    <ModalDialog
      :message="'<span style=\'font-size: 1.1rem; font-weight: bold;\'>회원 탈퇴하시겠습니까?</span><br><br><span style=\'color: #ff4444; font-size: 0.85rem; font-weight: bold; text-decoration: underline;\'>회원 탈퇴 시 작성한 게시글과 댓글은<br>즉시 모두 삭제됩니다.</span>'"
      :is-visible="showWithdrawConfirm"
      button-type="double"
      primary-button-text="확인"
      secondary-button-text="취소"
      @close="showWithdrawConfirm = false"
      @primary="handleWithdraw"
      @secondary="showWithdrawConfirm = false"
    />

    <ModalDialog
      :message="'회원 탈퇴가 정상적으로 진행되었습니다.'"
      :is-visible="showWithdrawSuccess"
      @close="handleWithdrawSuccessClose"
    />

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

    <ModalDialog
      :message="modalMessage"
      :is-visible="isModalVisible"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
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
const profile = ref({ userId: null, nickname: '', userStoreName: '', region: '' })
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
const deleteType = ref('')
const deleteCount = ref(0)
const editProfile = ref({ nickname: '', userStoreName: '' })
const editRegion = ref({ sido: '', gugun: '', dong: '' })
const modalMessage = ref('')
const modalCallback = ref(null)
const isModalVisible = ref(false)
const currentPage = ref(1)
const pageSize = ref(3)

const nicknameWrapper = ref(null)
const nicknameText = ref(null)
const storeWrapper = ref(null)
const storeText = ref(null)
const isNicknameLong = ref(false)
const isStoreLong = ref(false)
const nicknameScrollAmount = ref('0px')
const storeScrollAmount = ref('0px')
const nicknameDuration = ref('0s')
const storeDuration = ref('0s')

const randomGreeting = ref('')
const greetings = [
  '환영합니다!',
  '오늘도 대박 나세요!',
  '성공적인 하루 되세요!',
  '힘내라 대한민국 소상공인!',
  '꿈을 향해 달려가는 당신!',
  '오늘도 화이팅하세요!',
  '손님으로 가득 찬 하루 되세요!',
  '웃음 가득한 장사 되세요!',
  '내일은 더 빛날 거예요!',
  '항상 응원합니다!',
  '긍정의 힘을 믿으세요!',
  '건강 챙기며 일하세요!'
]

const nicknameError = ref('')
const storeNameError = ref('')
const regionError = ref('')

const MAX_LENGTH = 32
const SCROLL_GAP = 20

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

const isProfileUnchanged = computed(() => {
  if (editProfile.value.nickname !== profile.value.nickname) return false
  if (editProfile.value.userStoreName !== profile.value.userStoreName) return false

  const currentRegionString = profile.value.region || ''
  const parts = currentRegionString.split(' ')
  const orgSido = parts[0] || ''
  const orgGugun = parts[1] || ''
  const orgDong = parts[2] || ''

  const newSido = editRegion.value.sido || ''
  const newGugun = editRegion.value.gugun || ''
  const newDong = editRegion.value.dong || ''

  if (newSido !== orgSido) return false
  if (newGugun !== orgGugun) return false
  if (newDong !== orgDong) return false

  return true
})

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

const isActionDisabled = computed(() => {
  if (activeTab.value === 'posts') {
    return selectedPostsForDelete.value.length === 0
  } else {
    return selectedCommentsForDelete.value.length === 0
  }
})

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

const getCategoryId = (item) => {
  let categoryId = null
  if (item.categoryName) {
    categoryId = categoryNameToIdMap[item.categoryName]
    if (!categoryId) {
      const categoryNameLower = item.categoryName.toLowerCase()
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
  } else if (item.categoryId) {
    categoryId = item.categoryId
  }
  return categoryId
}

const transformPostForHotBoardItem = (post) => {
  return {
    postId: post.postId,
    title: truncateText(post.title, 25),
    content: truncateText(post.content || '', 50),
    createdAt: post.createdAt,
    categoryId: getCategoryId(post),
    categoryName: post.categoryName,
    likeCount: post.likeCount || 0,
    commentCount: post.commentCount || 0,
  }
}

const transformCommentForHotBoardItem = (comment) => {
  return {
    postId: comment.postId,
    title: truncateText(comment.postTitle || '게시글 제목 없음', 25),
    content: truncateText(comment.content || '', 50),
    createdAt: comment.createdAt,
    categoryId: getCategoryId(comment),
    categoryName: comment.categoryName,
    likeCount: comment.likeCount || 0,
    commentCount: null,
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
    if (selectedPostsForDelete.value.length === 0) return
    if (selectedPostsForDelete.value.length > 1) {
      showModal('수정할 게시글은 하나만 선택해주세요.')
      return
    }
    router.push({ name: 'editPost', params: { postId: selectedPostsForDelete.value[0] } })
  } else {
    if (selectedCommentsForDelete.value.length === 0) return
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
    if (selectedPostsForDelete.value.length === 0) return
    deleteType.value = 'posts'
    deleteCount.value = selectedPostsForDelete.value.length
    showDeleteConfirm.value = true
  } else {
    if (selectedCommentsForDelete.value.length === 0) return
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
      showModal('게시글이 삭제되었습니다.', () => {
        window.location.reload()
      })
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
  nicknameError.value = ''
  storeNameError.value = ''
  regionError.value = ''

  let isValid = true

  const nickname = editProfile.value.nickname ? editProfile.value.nickname.trim() : ''
  const storeName = editProfile.value.userStoreName ? editProfile.value.userStoreName.trim() : ''

  if (!nickname) {
    nicknameError.value = '닉네임을 입력해주세요.'
    isValid = false
  } else if (nickname.length > MAX_LENGTH) {
    nicknameError.value = `닉네임은 ${MAX_LENGTH}자 이내여야 합니다.`
    isValid = false
  }

  if (!storeName) {
    storeNameError.value = '상호명을 입력해주세요.'
    isValid = false
  } else if (storeName.length > MAX_LENGTH) {
    storeNameError.value = `상호명은 ${MAX_LENGTH}자 이내여야 합니다.`
    isValid = false
  }

  const { sido, gugun, dong } = editRegion.value
  const selectedCount = (sido ? 1 : 0) + (gugun ? 1 : 0) + (dong ? 1 : 0)

  if (selectedCount > 0 && selectedCount < 3) {
    regionError.value = '활동 지역을 모두 선택해주세요.'
    isValid = false
  }

  if (!isValid) return

  try {
    let hasUpdates = false

    if (nickname !== profile.value.nickname) {
      await updateNickname(nickname)
      hasUpdates = true
    }
    if (storeName !== profile.value.userStoreName) {
      await updateStoreName(storeName)
      hasUpdates = true
    }

    if (selectedCount === 3) {
      const regionString = `${sido} ${gugun} ${dong}`
      if (regionString !== profile.value.region) {
        await updateRegion(regionString)
        hasUpdates = true
      }
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

const handleLogout = () => {
  window.sessionStorage.removeItem('accessToken')
  window.sessionStorage.removeItem('refreshToken')
  router.push({ name: 'login' })
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
  window.sessionStorage.removeItem('accessToken')
  window.sessionStorage.removeItem('refreshToken')
  router.push({ name: 'home' })
}

const closeProfileModal = () => {
  showProfileModal.value = false
  nicknameError.value = ''
  storeNameError.value = ''
  regionError.value = ''

  editProfile.value = { nickname: profile.value.nickname, userStoreName: profile.value.userStoreName }
  const regionParts = profile.value.region ? profile.value.region.split(' ') : []
  editRegion.value = { sido: regionParts[0] || '', gugun: regionParts[1] || '', dong: regionParts[2] || '' }
}

const showModal = (message, callback = null) => {
  modalMessage.value = message
  modalCallback.value = callback
  isModalVisible.value = true
}

const closeModal = () => {
  isModalVisible.value = false
  modalMessage.value = ''

  if (modalCallback.value) {
    modalCallback.value()
    modalCallback.value = null
  }
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

const getTextareaHeight = (content) => {
  if (!content) return 'auto'
  const lines = content.split('\n').length
  const minHeight = 80
  const lineHeight = 24
  const calculatedHeight = Math.max(minHeight, lines * lineHeight + 20)
  return `${calculatedHeight}px`
}

const checkOverflow = () => {
  if (nicknameWrapper.value && nicknameText.value) {
    const wrapperWidth = nicknameWrapper.value.clientWidth
    const textWidth = nicknameText.value.scrollWidth

    if (textWidth > wrapperWidth) {
      isNicknameLong.value = true
      const scrollDistance = textWidth + SCROLL_GAP
      nicknameScrollAmount.value = `-${scrollDistance}px`
      nicknameDuration.value = `${scrollDistance * 0.03}s`
    } else {
      isNicknameLong.value = false
      nicknameScrollAmount.value = '0px'
    }
  }

  if (storeWrapper.value && storeText.value) {
    const wrapperWidth = storeWrapper.value.clientWidth
    const textWidth = storeText.value.scrollWidth

    if (textWidth > wrapperWidth) {
      isStoreLong.value = true
      const scrollDistance = textWidth + SCROLL_GAP
      storeScrollAmount.value = `-${scrollDistance}px`
      storeDuration.value = `${scrollDistance * 0.03}s`
    } else {
      isStoreLong.value = false
      storeScrollAmount.value = '0px'
    }
  }
}

const fetchProfile = async () => {
  try {
    const response = await getMyPageProfile()
    profile.value = response.data
    editProfile.value = { nickname: response.data.nickname, userStoreName: response.data.userStoreName }
    const regionParts = response.data.region ? response.data.region.split(' ') : []
    editRegion.value = { sido: regionParts[0] || '', gugun: regionParts[1] || '', dong: regionParts[2] || '' }

    await nextTick()
    checkOverflow()
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
  randomGreeting.value = greetings[Math.floor(Math.random() * greetings.length)]
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
  height: 100vh;
  overflow: hidden;
  padding: rem(20px) rem(16px);
  background-color: var(--bg-default);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.profile-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-top: rem(16px);
  padding-bottom: rem(16px);
  border-bottom: rem(1px) solid var(--grey-light);
  flex-shrink: 0;
  gap: rem(10px);
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  overflow: hidden;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: rem(8px);
  flex-shrink: 0;
  min-width: fit-content;
}

.name-line {
  display: flex;
  align-items: baseline;
  margin-bottom: rem(4px);
  width: 100%;
  overflow: hidden;
}

.scroll-text-wrapper {
  overflow: hidden;
  white-space: nowrap;
  position: relative;
  display: block;
}

.scrolling-track {
  display: inline-flex;
  white-space: nowrap;

  &.animate-scroll {
    animation: scroll-infinite var(--scroll-duration) linear infinite;
  }
}

.clone-text {
  padding-left: rem(20px);
}

@keyframes scroll-infinite {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(var(--scroll-amount));
  }
}

.nickname-wrapper {
  flex-shrink: 1;
  min-width: 0;
  max-width: rem(150px);
}

.highlight {
  font-size: rem(22px);
  font-weight: var(--font-weight-extra-bold);
  color: var(--color-text-strong);
}

.greeting-suffix {
  font-size: rem(14px);
  font-weight: 400;
  color: #000;
  white-space: nowrap;
  margin-left: rem(2px);
  flex-shrink: 0;
}

.store-line {
  display: flex;
  margin-bottom: rem(4px);
}

.store-wrapper {
  max-width: 100%;
}

.store-name {
  font-size: rem(15px);
  font-weight: 700;
  color: var(--color-text-strong);
  margin: 0;
}

.business-type {
  font-size: rem(14px);
  color: var(--color-text-light);
  margin: 0;
}

.profile-change-btn {
  padding: rem(8px) rem(16px);
  border: rem(1px) solid var(--signature-color);
  border-radius: rem(28px);
  background-color: transparent;
  color: var(--black);
  font-size: rem(14px);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.profile-change-btn:hover {
  background-color: rgba(255, 202, 44, 0.2);
}

.logout-btn {
  padding: rem(4px) rem(10px);
  border: rem(1px) solid var(--grey);
  border-radius: rem(20px);
  background-color: transparent;
  color: var(--color-text-subtle);
  font-size: rem(12px);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.logout-btn:hover {
  background-color: var(--grey-light);
  color: var(--color-text-default);
}

.my-posts-section {
  margin-top: rem(20px);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 내부 리스트만 스크롤 허용 */
  min-height: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: rem(16px);
  padding-bottom: rem(12px);
  border-bottom: rem(1px) solid var(--grey-light);
  flex-shrink: 0;
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
  border-radius: rem(28px);
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
  border: rem(1px) solid var(--signature-color);
  border-radius: rem(20px);
  background-color: transparent;
  color: var(--color-text-light);
  font-size: rem(12px);
  cursor: pointer;
  padding: rem(4px) rem(10px);
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: rgba(255, 202, 44, 0.2);
  color: var(--color-text-strong);
}

.action-btn:disabled {
  opacity: 0.5;
  filter: grayscale(100%);
  cursor: default;
  border-color: var(--grey);
  pointer-events: none;
}

.action-icon {
  font-size: rem(12px);
}

/* [수정] 리스트 컨테이너: flex: 1 및 자체 스크롤 적용 */
.list-container {
  flex: 1;
  overflow-y: auto;
  /* 고정된 페이지네이션 높이(약 60~80px)만큼 패딩 확보 */
  padding-bottom: rem(80px);

  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.posts-list,
.comments-list {
  display: flex;
  flex-direction: column;
  gap: rem(16px);
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

.post-item-wrapper:hover,
.comment-item-wrapper:hover {
  box-shadow: 0 rem(2px) rem(8px) rgba(0, 0, 0, 0.1);
}

.post-item-wrapper :deep(.post-content),
.comment-item-wrapper :deep(.post-content) {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  max-height: calc(1.4em * 3);
  line-height: 1.4;
  margin-top: rem(8px);
}

.comments-list :deep([class*="comment-count"]),
.comments-list :deep([class*="comment-icon"]) {
  display: none !important;
}
.comments-list :deep(.hot-board-item .info-area > *:last-child),
.comments-list :deep(.hot-board-item .board-footer .right > *:last-child) {
    display: none;
}

.comment-edit-wrapper {
  position: relative;
  padding: rem(16px) rem(16px);
}

.comment-item-wrapper.editing-mode .checkbox-wrapper {
  display: none;
}

.comment-edit-input {
  width: 100%;
  padding: rem(12px);
  border: rem(1px) solid var(--grey-light);
  border-radius: rem(8px);
  font-size: rem(15px);
  resize: none;
  box-sizing: border-box;
  overflow-y: auto;
  line-height: 1.5;
  margin-top: 0;
  margin-bottom: rem(8px);
}

.comment-edit-input:focus {
  outline: none;
  border-color: var(--signature-color);
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: rem(8px);
}

.cancel-edit-btn {
  padding: rem(8px) rem(16px);
  border: rem(1px) solid var(--grey);
  border-radius: rem(8px);
  background-color: var(--white);
  color: var(--color-text-default);
  font-size: rem(14px);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}

.cancel-edit-btn:hover {
  background-color: var(--grey-light);
}

.save-edit-btn {
  padding: rem(8px) rem(16px);
  border: rem(1px);
  border-radius: rem(8px);
  background-color: var(--signature-color);
  color: var(--black);
  font-size: rem(14px);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  margin: 0;
}

.save-edit-btn:hover {
  background-color: var(--semi-signature-color);
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

/* [수정] 페이지네이션 하단 고정 스타일 */
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
  /* 고정 위치에 따른 그림자 추가 (선택사항) */
  box-shadow: 0 rem(-2px) rem(8px) rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center;
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
  overflow: visible;
}

.modal-title {
  font-size: rem(20px);
  font-weight: var(--font-weight-bold);
  margin: 0 0 rem(20px) 0;
  color: var(--color-text-strong);
}

.form-group {
  margin-bottom: rem(20px);
}

.label-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: rem(8px);

  label {
    margin-bottom: 0;
    font-size: rem(14px);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-strong);
  }
}

.char-count {
  font-size: rem(12px);
  color: var(--grey);

  &.max-limit {
    color: #ff4444;
    font-weight: var(--font-weight-bold);
  }
}

.region-group {
  position: relative;
  z-index: 10;
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

.confirm-btn:disabled {
  background-color: var(--grey);
  color: var(--color-text-light);
  cursor: default;
  opacity: 0.7;
}

.modal-btn:not(:disabled):hover {
  opacity: 0.8;
}

.error-message {
  color: #ff4444;
  font-size: rem(13px);
  margin-top: rem(6px);
  margin-bottom: 0;
}
</style>
