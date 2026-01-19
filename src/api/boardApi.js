import apiClient from '@/api/apiClient'

export const fetchPosts = () => {
  return apiClient.get('/')
}

export const fetchHotBoardPosts = (page = 1, pageSize = 4) => {
  return apiClient.get(`/hot?page=${page}&pageSize=${pageSize}`)
}

export const fetchFreeBoardPosts = (page = 1, pageSize = 4) => {
  return apiClient.get(`/free?page=${page}&pageSize=${pageSize}`)
}

export const fetchInfoBoardPosts = (page = 1, pageSize = 4) => {
  return apiClient.get(`/info?page=${page}&pageSize=${pageSize}`)
}

export const fetchLocalBoardPosts = (page = 1, pageSize = 4, region = null) => {
  let url = `/local?page=${page}&pageSize=${pageSize}`
  if (region) {
    url += `&region=${region}`
  }
  return apiClient.get(url)
}

export const createPost = (postData) => {
  return apiClient.post('/posts', postData)
}

export const fetchPostById = (postId) => {
  return apiClient.get(`/board/${postId}`)
}

export const fetchCommentsByPostId = (postId) => {
  return apiClient.get(`/posts/${postId}/comments`)
}

export const createComment = (postId, commentData) => {
  return apiClient.post(`/posts/${postId}/comments`, commentData)
}

export const likeComment = (commentId) => {
  return apiClient.post(`/comments/${commentId}/like`)
}

export const likePost = (postId) => {
  return apiClient.post(`/board/${postId}/like`)
}
