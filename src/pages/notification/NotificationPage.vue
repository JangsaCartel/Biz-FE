<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'

const router = useRouter()
const notificationStore = useNotificationStore()

const items = computed(() => notificationStore.items)
const hasItems = computed(() => items.value.length > 0)
const isSyncing = computed(() => notificationStore.isSyncing)

const listRef = ref(null)

const goBack = () => router.back()

const refreshNow = async () => {
  await notificationStore.refreshList()
  try {
    listRef.value?.scrollTo?.({ top: 0, behavior: 'smooth' })
  } catch {}
}

const deleteRead = async () => {
  await notificationStore.deleteRead()
}

const openNotification = async (n) => {
  if (!n) return

  await notificationStore.markRead(n)

  if (!n.postId) return

  const query = {}
  if (n.commentId) query.commentId = String(n.commentId)

  try {
    await router.push({
      name: 'postDetail',
      params: { postId: String(n.postId) },
      query,
    })
    return
  } catch (e) {
    console.debug('[Notification] postDetail(postId) 라우팅 실패, id로 재시도', e)
  }

  try {
    await router.push({
      name: 'postDetail',
      params: { id: String(n.postId) },
      query,
    })
  } catch (e) {
    console.warn('[Notification] postDetail 이동 실패:', e)
  }
}

onMounted(async () => {
  await notificationStore.syncList({ page: 1, size: 50 })
  notificationStore.connect()
})

onBeforeUnmount(() => {
  notificationStore.disconnect()
})
</script>

<template>
  <div class="NotificationWrapper">
    <header class="NotificationHeader">
      <button type="button" class="HeaderBtn" @click="goBack" aria-label="뒤로가기">←</button>
      <h1 class="HeaderTitle">알림</h1>

      <div class="HeaderRight">
        <button
          type="button"
          class="HeaderIconBtn"
          :disabled="isSyncing"
          @click="refreshNow"
          aria-label="새로고침"
          title="새로고침"
        >
          ↻
        </button>

        <button type="button" class="HeaderAction" :disabled="!hasItems" @click="deleteRead">
          읽음 삭제
        </button>
      </div>
    </header>

    <main class="NotificationList" ref="listRef">
      <div v-if="!hasItems" class="EmptyState">알림이 없어요.</div>

      <ul v-else class="List">
        <li
          v-for="n in items"
          :key="n.eventId"
          class="Item"
          :class="{ read: n.isRead }"
          @click="openNotification(n)"
        >
          <div class="Dot" v-if="!n.isRead" />
          <div class="Body">
            <div class="TitleRow">
              <span class="Title">{{ n.title ?? '알림' }}</span>
              <span class="Time">{{ n.createdAt ?? '' }}</span>
            </div>
            <div class="Message">
              {{ n.message ?? '' }}
            </div>
          </div>
        </li>
      </ul>
    </main>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/utils/_pxToRem.scss' as *;

.NotificationWrapper {
  background-color: var(--bg-default);
  width: 100%;
  height: 100%;
  min-height: 0;

  display: flex;
  flex-direction: column;

  overflow: hidden;
  box-sizing: border-box;

  position: relative;
}

.NotificationHeader {
  flex: 0 0 auto;
  height: rem(56px);

  display: grid;
  grid-template-columns: rem(56px) 1fr auto;
  align-items: center;

  padding: 0 rem(12px);
  box-sizing: border-box;

  background: linear-gradient(90deg, var(--signature-color), var(--semi-signature-color));
}

.HeaderBtn {
  width: rem(40px);
  height: rem(40px);
  border: none;
  background: transparent;
  font-size: rem(20px);
  cursor: pointer;
  color: var(--text-title);
}

.HeaderTitle {
  margin: 0;
  text-align: center;
  font-size: rem(16px);
  font-weight: var(--font-weight-semibold);
  color: var(--text-title);
}

.HeaderRight {
  display: flex;
  align-items: center;
  gap: rem(8px);
}

.HeaderIconBtn {
  border: none;
  color: var(--text-title);
  height: rem(32px);
  padding: 0 rem(10px);
  border-radius: rem(999px);
  cursor: pointer;
  font-size: rem(15px);
  font-weight: var(--font-weight-semibold);
  background: transparent;
}

.HeaderIconBtn:disabled {
  opacity: 0.6;
  cursor: default;
}

.HeaderAction {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: rem(12px);
  font-weight: var(--font-weight-semibold);
  color: var(--text-title);
  padding: rem(6px) rem(10px);
  border-radius: rem(999px);
}

.HeaderAction:disabled {
  opacity: 0.5;
  cursor: default;
}

.NotificationList {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;

  padding: rem(12px);
  box-sizing: border-box;

  background-color: var(--bg-partition);

  scrollbar-width: none;
  -ms-overflow-style: none;
}
.NotificationList::-webkit-scrollbar {
  display: none;
}

.EmptyState {
  padding: rem(24px) 0;
  text-align: center;
  font-size: rem(13px);
  color: var(--color-text-light);
}

.List {
  list-style: none;
  padding: 0;
  margin: 0;

  display: flex;
  flex-direction: column;
  gap: rem(10px);
}

.Item {
  display: flex;
  gap: rem(10px);

  background: var(--white);
  border-radius: rem(14px);
  padding: rem(12px);
  box-sizing: border-box;

  cursor: pointer;
}

.Item.read {
  opacity: 0.6;
}

.Dot {
  width: rem(8px);
  height: rem(8px);
  border-radius: 50%;
  background: var(--board-hot);
  margin-top: rem(6px);
  flex: 0 0 auto;
}

.Body {
  flex: 1 1 auto;
  min-width: 0;
}

.TitleRow {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: rem(8px);
}

.Title {
  font-size: rem(13px);
  font-weight: var(--font-weight-semibold);
  color: var(--text-title);
}

.Time {
  font-size: rem(11px);
  color: var(--color-text-light);
  flex: 0 0 auto;
}

.Message {
  margin-top: rem(6px);
  font-size: rem(12px);
  color: var(--color-text-default);
  word-break: break-word;
}
</style>
