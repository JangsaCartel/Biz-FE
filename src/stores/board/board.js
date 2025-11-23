import { defineStore } from 'pinia'
import axios from 'axios'

export const useBoardStore = defineStore('board', {
  state: () => ({
    postsByCagetory: {},
    freePosts: [],
  }),
  getters: {
    getCategorizedPosts: (state) => state.postsByCagetory,
    getFreeBoardPosts: (state) => state.freePosts,
  },
  actions: {
    async fetchPosts() {
      try {
        // API URL을 백엔드 엔드포인트에 맞게 수정
        const response = await axios.get('/api/') // 수정된 URL
        this.postsByCagetory = response.data
      } catch (error) {
        console.error('Error fetching posts:', error)
        // 데모용 테스트 데이터 (API 구조와 일치하도록 수정)
        this.postsByCagetory = {
          hot: [
            {
              post_id: 101,
              title: 'HOT 게시글 1 (테스트 데이터)',
              like_count: 99,
              comment_count: 23,
            },
            {
              post_id: 102,
              title: 'HOT 게시글 2 (테스트 데이터)',
              like_count: 88,
              comment_count: 12,
            },
            {
              post_id: 103,
              title: 'HOT 게시글 3 (테스트 데이터)',
              like_count: 77,
              comment_count: 31,
            },
          ],
          free: [
            {
              post_id: 201,
              title: '자유 게시글 1 (테스트 데이터)',
              like_count: 10,
              comment_count: 5,
            },
            {
              post_id: 202,
              title: '자유 게시글 2 (테스트 데이터)',
              like_count: 8,
              comment_count: 3,
            },
            {
              post_id: 203,
              title: '자유 게시글 3 (테스트 데이터)',
              like_count: 12,
              comment_count: 8,
            },
          ],
          info: [
            {
              post_id: 301,
              title: '정보 게시글 1 (테스트 데이터)',
              like_count: 15,
              comment_count: 51,
            },
            {
              post_id: 302,
              title: '정보 게시글 2 (테스트 데이터)',
              like_count: 45,
              comment_count: 3,
            },
            {
              post_id: 303,
              title: '정보 게시글 3 (테스트 데이터)',
              like_count: 2,
              comment_count: 8,
            },
          ],
          local: [
            {
              post_id: 401,
              title: '우리동네 게시글 1 (테스트 데이터)',
              like_count: 16,
              comment_count: 15,
            },
            {
              post_id: 402,
              title: '우리동네 게시글 2 (테스트 데이터)',
              like_count: 18,
              comment_count: 31,
            },
            {
              post_id: 403,
              title: '우리동네 게시글 3 (테스트 데이터)',
              like_count: 2,
              comment_count: 18,
            },
          ],
        }
      }
    },
    async fetchFreeBoardPosts(page = 1) {
      try {
        const response = await axios.get(`/api/free?page=${page}`)
        this.freePosts = response.data
      } catch (error) {
        console.error('Error fetching free board posts:', error)
        this.freePosts = [
          {
            post_id: 201,
            title: '자유 게시글 1 (테스트 데이터)',
            like_count: 10,
            comment_count: 5,
          },
          { post_id: 202, title: '자유 게시글 2 (테스트 데이터)', like_count: 8, comment_count: 3 },
          {
            post_id: 203,
            title: '자유 게시글 3 (테스트 데이터)',
            like_count: 12,
            comment_count: 8,
          },
          {
            post_id: 204,
            title: '자유 게시글 4 (테스트 데이터)',
            like_count: 15,
            comment_count: 7,
          },
          { post_id: 205, title: '자유 게시글 5 (테스트 데이터)', like_count: 2, comment_count: 1 },
        ]
      }
    },
  },
})
