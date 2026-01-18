import apiClient from '@/api/apiClient'

/**
 * 마이페이지 프로필 조회
 * @returns {Promise<{userId: number, nickname: string, userStoreName: string, region: string}>}
 */
export const getMyPageProfile = () => {
  return apiClient.get('/users/mypage')
}

/**
 * 닉네임 수정
 * @param {string} nickname - 변경할 닉네임
 * @returns {Promise<string>}
 */
export const updateNickname = (nickname) => {
  return apiClient.patch('/users/nickname', { nickname })
}

/**
 * 내가 작성한 게시글 조회
 * @returns {Promise<Array<{postId: number, title: string, createdAt: string, categoryName: string}>>}
 */
export const getMyPosts = () => {
  return apiClient.get('/users/posts')
}

/**
 * 내 게시글 삭제
 * @param {number} postId - 삭제할 게시글 ID
 * @returns {Promise<string>}
 */
export const deleteMyPost = (postId) => {
  return apiClient.delete(`/users/posts/${postId}`)
}

/**
 * 내가 작성한 댓글 조회
 * @returns {Promise<Array<{commentId: number, content: string, createdAt: string, likeCount: number, commentCount: number, postId: number}>>}
 */
export const getMyComments = () => {
  return apiClient.get('/users/comments')
}

/**
 * 댓글 수정
 * @param {number} commentId - 수정할 댓글 ID
 * @param {string} content - 수정할 내용
 * @returns {Promise}
 */
export const updateComment = (commentId, content) => {
  return apiClient.patch(`users/comments/${commentId}`, { content })
}

/**
 * 댓글 삭제
 * @param {number} commentId - 삭제할 댓글 ID
 * @returns {Promise}
 */
export const deleteComment = (commentId) => {
  return apiClient.delete(`users/comments/${commentId}`)
}

/**
 * 활동 지역 변경
 * @param {string} region - 변경할 지역명
 * @returns {Promise}
 */
export const updateRegion = (region) => {
  return apiClient.patch('users/region', { region })
}

/**
 * 상호명 변경
 * @param {string} userStoreName - 변경할 상호명
 * @returns {Promise}
 */
export const updateStoreName = (userStoreName) => {
  return apiClient.patch('users/store-name', { userStoreName })
}

/**
 * 회원 탈퇴
 * @returns {Promise}
 */
export const withdrawUser = () => {
  return apiClient.delete('users/withdraw')
}
