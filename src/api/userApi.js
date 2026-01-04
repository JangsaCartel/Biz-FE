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
