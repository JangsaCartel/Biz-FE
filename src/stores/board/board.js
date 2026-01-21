import { defineStore } from 'pinia'
import {
  fetchPosts,
  fetchHotBoardPosts,
  fetchFreeBoardPosts,
  fetchInfoBoardPosts,
  fetchLocalBoardPosts,
  createPost,
  updatePost,
  fetchPostById,
  fetchCommentsByPostId,
  createComment,
  likeComment,
  likePost,
} from '@/api/boardApi'

export const useBoardStore = defineStore('board', {
  state: () => ({
    postsByCategory: {},
    hotPosts: [],
    freePosts: [],
    infoPosts: [],
    localPosts: [],
    hotPostsTotal: 0,
    freePostsTotal: 0,
    infoPostsTotal: 0,
    localPostsTotal: 0,
    localFilter: {},
  }),
  getters: {
    getCategorizedPosts: (state) => state.postsByCategory,
    getHotBoardPosts: (state) => state.hotPosts,
    getFreeBoardPosts: (state) => state.freePosts,
    getInfoBoardPosts: (state) => state.infoPosts,
    getLocalBoardPosts: (state) => state.localPosts,
    getHotBoardTotal: (state) => state.hotPostsTotal,
    getFreeBoardTotal: (state) => state.freePostsTotal,
    getInfoBoardTotal: (state) => state.infoPostsTotal,
    getLocalBoardTotal: (state) => state.localPostsTotal,
    getLocalFilter: (state) => state.localFilter,
  },
  actions: {
    async fetchPosts() {
      try {
        const response = await fetchPosts()
        this.postsByCategory = response.data
      } catch (error) {
        console.error('Error fetching posts:', error)
        this.postsByCategory = {
          hot: [],
          free: [],
          info: [],
          local: [],
        }
      }
    },
    async fetchHotBoardPosts(page = 1, pageSize = 4) {
      try {
        const response = await fetchHotBoardPosts(page, pageSize)
        this.hotPosts = response.data.posts
        this.hotPostsTotal = response.data.totalCount
      } catch (error) {
        console.error('Error fetching hot board posts:', error)
        this.hotPosts = []
        this.hotPostsTotal = 0
      }
    },
    async fetchFreeBoardPosts(page = 1, pageSize = 4) {
      try {
        const response = await fetchFreeBoardPosts(page, pageSize)
        this.freePosts = response.data.posts
        this.freePostsTotal = response.data.totalCount
      } catch (error) {
        console.error('Error fetching free board posts:', error)
        this.freePosts = []
        this.freePostsTotal = 0
      }
    },
    async fetchInfoBoardPosts(page = 1, pageSize = 4) {
      try {
        const response = await fetchInfoBoardPosts(page, pageSize)
        this.infoPosts = response.data.posts
        this.infoPostsTotal = response.data.totalCount
      } catch (error) {
        console.error('Error fetching info board posts:', error)
        this.infoPosts = []
        this.infoPostsTotal = 0
      }
    },
    async fetchLocalBoardPosts(page = 1, pageSize = 4, region = null) {
      try {
        const response = await fetchLocalBoardPosts(page, pageSize, region)
        this.localPosts = response.data.posts
        this.localPostsTotal = response.data.totalCount
      } catch (error) {
        console.error('Error fetching local board posts:', error)
        this.localPosts = []
        this.localPostsTotal = 0
      }
    },
    async createPost(postData) {
      try {
        await createPost(postData)
      } catch (error) {
        console.error('Error creating post:', error)
        throw error
      }
    },
    async updatePost(postId, postData) {
      try {
        const response = await updatePost(postId, postData)
        console.log('Post updated successfully:', response.data)
        return response.data
      } catch (error) {
        console.error(`Error updating post with ID ${postId}:`, error)
        throw error
      }
    },
    async fetchPostById(postId) {
      try {
        const response = await fetchPostById(postId)
        return response.data
      } catch (error) {
        console.error(`Error fetching post with ID ${postId}:`, error)
        return null
      }
    },
    async fetchCommentsByPostId(postId) {
      try {
        const response = await fetchCommentsByPostId(postId)
        return response.data
      } catch (error) {
        console.error(`Error fetching comments for post ID ${postId}:`, error)
        return []
      }
    },
    async createComment(postId, commentData) {
      try {
        const response = await createComment(postId, commentData)
        return response.data
      } catch (error) {
        console.error(`Error creating comment for post ID ${postId}:`, error)
        return null
      }
    },
    async likeComment(commentId) {
      try {
        await likeComment(commentId)
      } catch (error) {
        console.error(`Error liking comment with ID ${commentId}:`, error)
      }
    },
    async likePost(postId) {
      await likePost(postId)
    },
    setLocalFilter(filter) {
      this.localFilter = filter
    },
    clearLocalFilter() {
      this.localFilter = {}
    },
  },
})
