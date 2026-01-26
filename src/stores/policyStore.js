import { defineStore } from 'pinia'

export const usePolicyStore = defineStore('policyStore', {
  state: () => ({
    selectedPolicy: null,
  }),
  actions: {
    setSelectedPolicy(item) {
      this.selectedPolicy = item
    },
  },
})
