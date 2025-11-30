import { defineStore } from 'pinia'
import axios from 'axios'

export const useBoardStore = defineStore('board', {
  state: () => ({
    postsByCagetory: {},
    hotPosts: [],
    freePosts: [],
    infoPosts: [],
    localPosts: [],
    hotPostsTotal: 0,
    freePostsTotal: 0,
    infoPostsTotal: 0,
    localPostsTotal: 0,
  }),
  getters: {
    getCategorizedPosts: (state) => state.postsByCagetory,
    getHotBoardPosts: (state) => state.hotPosts,
    getFreeBoardPosts: (state) => state.freePosts,
    getInfoBoardPosts: (state) => state.infoPosts,
    getLocalBoardPosts: (state) => state.localPosts,
    getHotBoardTotal: (state) => state.hotPostsTotal,
    getFreeBoardTotal: (state) => state.freePostsTotal,
    getInfoBoardTotal: (state) => state.infoPostsTotal,
    getLocalBoardTotal: (state) => state.localPostsTotal,
  },
  actions: {
    async fetchPosts() {
      try {
        const response = await axios.get('/api/')
        this.postsByCagetory = response.data
      } catch (error) {
        console.error('Error fetching posts:', error)
        this.postsByCagetory = {
          hot: [],
          free: [],
          info: [],
          local: [],
        }
      }
    },
    async fetchHotBoardPosts(page = 1) {
      try {
        const response = await axios.get(`/api/hot?page=${page}`)
        this.hotPosts = response.data.posts
        this.hotPostsTotal = response.data.totalCount
      } catch (error) {
        console.error('Error fetching hot board posts:', error)
        this.hotPosts = []
        this.hotPostsTotal = 0
      }
    },
    async fetchFreeBoardPosts(page = 1) {
      try {
        const response = await axios.get(`/api/free?page=${page}`)
        this.freePosts = response.data.posts
        this.freePostsTotal = response.data.totalCount
      } catch (error) {
        console.error('Error fetching free board posts:', error)
        this.freePosts = []
        this.freePostsTotal = 0
      }
    },
    async fetchInfoBoardPosts(page = 1) {
      try {
        const response = await axios.get(`/api/info?page=${page}`)
        this.infoPosts = response.data.posts
        this.infoPostsTotal = response.data.totalCount
      } catch (error) {
        console.error('Error fetching info board posts:', error)
        this.infoPosts = []
        this.infoPostsTotal = 0
      }
    },
    async fetchLocalBoardPosts(page = 1) {
      try {
        const response = await axios.get(`/api/local?page=${page}`)
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
        const response = await axios.post('/api/posts', postData)
        console.log('Post created successfully:', response.data)
      } catch (error) {
        console.error('Error creating post:', error)
      }
    },
  },
})
