import { defineStore } from 'pinia'
import axios from 'axios'

export const useBoardStore = defineStore('board', {
  state: () => ({
    postsByCagetory: {},
  }),
  getters: {
    getCategorizedPosts: (state) => state.postsByCagetory,
  },
  actions: {
    async fetchPosts() {
      try {
        // API URL을 백엔드 엔드포인트에 맞게 수정해야 함
        const response = await axios.get('/api/main-board') // 예시 URL
        this.postsByCagetory = response.data
      } catch (error) {
        console.error('Error fetching posts:', error)
        // 데모용 목 데이터
        this.postsByCagetory = {
          1: [
            { post_id: 101, title: 'HOT 게시글 1', like_count: 99, comment_count: 23 },
            { post_id: 102, title: 'HOT 게시글 2', like_count: 88, comment_count: 12 },
            { post_id: 103, title: 'HOT 게시글 3', like_count: 77, comment_count: 31 },
          ],
          2: [
            { post_id: 201, title: '자유 게시글 1', like_count: 10, comment_count: 5 },
            { post_id: 202, title: '자유 게시글 2', like_count: 8, comment_count: 3 },
            { post_id: 203, title: '자유 게시글 3', like_count: 12, comment_count: 8 },
          ],
          3: [
            { post_id: 201, title: '정보 게시글 1', like_count: 15, comment_count: 51 },
            { post_id: 202, title: '정보 게시글 2', like_count: 45, comment_count: 3 },
            { post_id: 203, title: '정보 게시글 3', like_count: 2, comment_count: 8 },
          ],
          4: [
            { post_id: 201, title: '우리동네 게시글 1', like_count: 16, comment_count: 15 },
            { post_id: 202, title: '우리동네 게시글 2', like_count: 18, comment_count: 31 },
            { post_id: 203, title: '우리동네 게시글 3', like_count: 2, comment_count: 18 },
          ],
        }
      }
    },
  },
})
