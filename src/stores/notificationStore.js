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

    isSyncing: false,
    lastSyncedAt: null,
  }),

  actions: {
    async syncList({ page = 1, size = 50 } = {}) {
      if (this.isSyncing) return
      this.isSyncing = true

      try {
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
        this.lastSyncedAt = Date.now()
      } finally {
        this.isSyncing = false
      }
    },

    async refreshList() {
      await this.syncList({ page: 1, size: 50 })
    },

    connect() {
      if (this._streamHandle) return

      this._streamHandle = streamNotifications({
        onEvent: ({ event, data }) => {
          if (event !== 'notification' && event !== 'message') return

          // 디버그
          console.debug('[notification SSE] recv:', event, data)

          const nid = data?.notificationId ?? data?.id ?? null

          // nid가 없으면 payload 이상 → 목록 재동기화
          if (nid == null) {
            this.refreshList().catch(() => {})
            return
          }

          // 기존 항목 업데이트
          const idx = this.items.findIndex((x) => x.notificationId === nid)
          if (idx !== -1) {
            this.items[idx] = {
              ...this.items[idx],
              ...data,
              eventId: this.items[idx].eventId ?? `n-${nid}`,
              notificationId: nid,
              isRead: !!(data.isRead ?? this.items[idx].isRead),
            }
            this.unreadCount = this.items.filter((x) => !x.isRead).length
            return
          }

          // 새 항목 추가
          const item = {
            eventId: data.eventId ?? `n-${nid}`,
            notificationId: nid,
            title: data.title,
            message: data.message,
            postId: data.postId,
            commentId: data.commentId,
            createdAt: data.createdAt,
            isRead: !!data.isRead,
          }

          this.items.unshift(item)
          this.unreadCount = this.items.filter((x) => !x.isRead).length
        },

        onError: (e) => {
          console.error('[notification SSE] error:', e)
          this.disconnect()

          // 1초 뒤 재연결
          setTimeout(() => {
            if (!this._streamHandle) this.connect()
          }, 1000)
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
      this.lastSyncedAt = null
      this.isSyncing = false
    },
  },
})
