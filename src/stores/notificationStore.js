// src/stores/notificationStore.js
import { defineStore } from 'pinia'
import {
  streamNotifications,
  fetchMyNotifications,
  markNotificationRead,
  deleteReadNotifications,
} from '@/api/notificationApi'

export const useNotificationStore = defineStore('notificationStore', {
  state: () => ({
    items: [],
    unreadCount: 0,
    _streamHandle: null,
  }),

  actions: {
    async syncList({ page = 1, size = 50 } = {}) {
      const data = await fetchMyNotifications({ page, size })

      const list = Array.isArray(data) ? data : (data?.items ?? [])

      this.items = list.map((n) => ({
        eventId: `n-${n.notificationId}`,
        notificationId: n.notificationId,
        title: n.title,
        message: n.message,
        postId: n.postId,
        commentId: n.commentId,
        createdAt: n.createdAt,
        isRead: !!n.isRead,
      }))

      this.unreadCount = this.items.filter((x) => !x.isRead).length
    },

    connect() {
      if (this._streamHandle) return

      this._streamHandle = streamNotifications({
        onEvent: ({ event, data }) => {
          if (event !== 'notification') return

          const nid = data.notificationId
          if (nid != null) {
            const idx = this.items.findIndex((x) => x.notificationId === nid)
            if (idx !== -1) {
              this.items[idx] = { ...this.items[idx], ...data }
              this.items[idx].isRead = !!this.items[idx].isRead
              return
            }
          }

          this.items.unshift({ ...data, isRead: !!data.isRead })
          this.unreadCount = this.items.filter((x) => !x.isRead).length
        },
        onError: (e) => {
          console.error('[notification SSE] error:', e)
          this.disconnect()
        },
      })
    },

    disconnect() {
      if (this._streamHandle) {
        this._streamHandle.close()
        this._streamHandle = null
      }
    },

    async markRead(notification) {
      if (!notification) return
      const notificationId = notification.notificationId

      const target = this.items.find((x) => x.notificationId === notificationId)
      if (!target || target.isRead) return

      target.isRead = true
      this.unreadCount = Math.max(0, this.unreadCount - 1)

      try {
        await markNotificationRead(notificationId)
      } catch (e) {
        console.error('[notification] markRead failed:', e)
        target.isRead = false
        this.unreadCount += 1
      }
    },

    async deleteRead() {
      await deleteReadNotifications()
      this.items = this.items.filter((x) => !x.isRead)
      this.unreadCount = this.items.filter((x) => !x.isRead).length
    },

    clearLocal() {
      this.items = []
      this.unreadCount = 0
    },
  },
})
