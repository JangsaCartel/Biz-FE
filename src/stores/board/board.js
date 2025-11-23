import { defineStore } from 'pinia'
import axios from 'axios'

export const useBoardStore = defineStore('board', {
  state: () => ({
    postsByCategory: {},
  }),
  getters: {
    allPosts() {
      const posts = []
      for (const category in this.postsByCategory) {
        this.postsByCategory[category].forEach((post) => {
          posts.push({ ...post, boardCategory: category })
        })
      }
      // Sort by date, newest first
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return posts
    },
  },
  actions: {
    async fetchPosts() {
      try {
        const response = await axios.get('http://localhost:8080') // Assuming BE is on 8080
        this.postsByCategory = response.data
      } catch (error) {
        console.error('Error fetching posts:', error)
        // Handle error appropriately
      }
    },
  },
})
