<template>
  <div class="map-post-sheet" :class="{ 'is-open': isOpen }">
    <button class="close-btn" @click="$emit('close')">✕</button>
    <div class="sheet-header">
      <h3 class="sheet-title">{{ regionName }} 인기글</h3>
      <button class="go-to-board-btn" @click="$emit('navigate', regionName)">게시판 이동</button>
    </div>
    <div class="sheet-body">
      <ul v-if="posts && posts.length">
        <li v-for="post in posts" :key="post.postId" class="post-item">
          <div @click="$emit('select-post', post.postId)" class="post-title-link">
            <span class="post-title">{{ post.title }}</span>
          </div>
          <span class="post-meta">
            <img :src="likeIcon" alt="Likes" class="icon" /> {{ post.likeCount }}
            <img :src="commentIcon" alt="Comments" class="icon" /> {{ post.commentCount }}
          </span>
        </li>
      </ul>
      <p v-else class="no-posts">해당 지역의 인기 게시글이 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
import likeIcon from '@/assets/icons/board/like.png'
import commentIcon from '@/assets/icons/board/comment.png'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  regionName: {
    type: String,
    default: '선택된 지역',
  },
  posts: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['close', 'navigate', 'select-post'])
</script>

<style scoped lang="scss">
.map-post-sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  box-sizing: border-box;
  max-height: 50%;
  background-color: white;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  transform: translateY(100%);
  transition: transform 0.3s ease-out;
  z-index: 1000;
  display: flex;
  flex-direction: column;

  &.is-open {
    transform: translateY(0);
  }
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
  z-index: 1010;
  padding: 5px;
  line-height: 1;
  color: var(--text-subtitle);
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  padding-right: 40px; /* Make space for close button */
  border-bottom: 1px solid #eee;
}

.sheet-title {
  margin: 0;
  font-size: 1.1em;
  font-weight: bold;
}

.go-to-board-btn {
  background-color: var(--semi-signature-color);
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  margin-left: 10px;
  border: none;
}

.sheet-body {
  padding: 15px;
  overflow-y: auto;
  flex-grow: 1;
}

.post-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed #eee;
  &:last-child {
    border-bottom: none;
  }
}

.post-title-link {
  color: inherit;
  text-decoration: none;
  flex-grow: 1;
  margin-right: 10px;
  overflow: hidden;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.post-title {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-meta {
  font-size: 0.9em;
  color: var(--text-subtitle);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

.icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
}

.no-posts {
  text-align: center;
  color: var(--grey);
  padding: 20px;
}
</style>
