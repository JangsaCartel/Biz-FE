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
          if (event !== 'notification' && event !== 'message') return

          // 디버그
          console.debug('[notification SSE] recv:', event, data)

          const nid = data?.notificationId ?? data?.id ?? null

          // nid가 없으면(서버 payload 키가 다르거나 이상한 이벤트)
          // 안전하게 목록 재동기화로 복구
          if (nid == null) {
            this.syncList({ page: 1, size: 50 }).catch(() => {})
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
          setTimeout(() => this.connect(), 1000) // 1초 뒤 재연결
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
