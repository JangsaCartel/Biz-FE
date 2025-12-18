<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import beeIcon from '@/assets/icons/ai/bee.png'
import { fetchWeeklyAiAnalysis } from '@/api/aiApi'

const router = useRouter()

// UI 상태
const week = ref('THIS')
const limit = ref(60)
const topK = ref(20)

// 서버 응답
const isLoading = ref(false)
const weekLabel = ref('')
const topKeywords = ref([])
const wordcloudPngBase64 = ref(null)

const topKeywordsToShow = computed(() => (topKeywords.value || []).slice(0, 10))
const wordcloudSrc = computed(() => wordcloudPngBase64.value || '')

function setWeek(next) {
  if (week.value === next) return
  week.value = next
}

function goAiChat() {
  router.push({ path: '/ai/chat' })
}

async function fetchWeekly() {
  isLoading.value = true
  try {
    const data = await fetchWeeklyAiAnalysis({
      week: week.value,
      limit: limit.value,
      topK: topK.value,
    })

    weekLabel.value = data?.weekLabel || ''
    topKeywords.value = data?.topKeywords || []
    wordcloudPngBase64.value = data?.wordcloudPngBase64 ?? data?.wordCloudPngBase64 ?? null
  } catch (e) {
    weekLabel.value = ''
    topKeywords.value = []
    wordcloudPngBase64.value = null
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

watch(week, fetchWeekly)
onMounted(fetchWeekly)
</script>

<template>
  <section class="AiPage">
    <!-- 워드클라우드 -->
    <div class="WordCloudArea">
      <div v-if="isLoading" class="StateText">분석 데이터를 불러오는 중…</div>

      <template v-else>
        <img v-if="wordcloudSrc" class="WordCloudImage" :src="wordcloudSrc" alt="워드 클라우드" />
        <div v-else class="StateText">해당 주차에 분석할 게시글이 없습니다.</div>
      </template>
    </div>

    <!-- 파일/서류 느낌 + 꿀벌 버튼 -->
    <div class="FolderRow">
      <div class="FolderArea">
        <!-- 탭(이번주/저번주) -->
        <div class="FolderTabs">
          <button
            type="button"
            class="TabBtn"
            :class="{ active: week === 'THIS' }"
            @click="setWeek('THIS')"
          >
            이번주
          </button>
          <button
            type="button"
            class="TabBtn"
            :class="{ active: week === 'LAST' }"
            @click="setWeek('LAST')"
          >
            저번주
          </button>
        </div>

        <!-- 카드 -->
        <div class="KeywordWrap">
          <div class="KeywordRow">
            <div class="KeywordCard">
              <div class="WeekLabel">{{ weekLabel }}</div>
              <div class="Underline" />
              <ol class="KeywordList">
                <li v-for="(item, idx) in topKeywordsToShow" :key="idx" class="KeywordItem">
                  <span class="Rank">{{ idx + 1 }}</span>
                  <span class="Keyword">{{ item.keyword }}</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <button type="button" class="BeeButton" @click="goAiChat" aria-label="AI 채팅 이동">
        <img :src="beeIcon" alt="" />
      </button>
    </div>
  </section>
</template>

<style scoped lang="scss">
.WordCloudArea {
  width: 100%;
  height: rem(340px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: rem(25px) 0;
}

.WordCloudImage {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;

  transform: scale(1.5);
}

/* 폴더 + 꿀벌 버튼 */
.FolderRow {
  display: flex;
  align-items: flex-end;
  gap: rem(10px);
  margin: rem(30px) rem(10px) rem(20px) rem(10px);
}

.FolderRow::before {
  content: '';
  flex: 0 0 rem(56px);
}

/* ====== 파일/서류 느낌 영역 ====== */
.FolderArea {
  flex: 1;
  position: relative;
  background: #ffbc0040;
  border-radius: 0 rem(18px) rem(18px) rem(18px);
  padding: rem(18px) rem(14px) rem(14px);
  margin: 0;

  max-width: rem(320px);
  width: 100%;
  margin-left: auto;
  margin-right: auto;

  overflow: visible;
}

/* 탭 */
.FolderTabs {
  position: absolute;
  left: 0;
  top: calc(-1 * #{rem(34px)});

  display: flex;
  gap: rem(5px);
  z-index: 2;
}

.TabBtn {
  height: rem(34px);
  padding: 0 rem(18px);
  border-radius: rem(18px) rem(18px) 0 0;
  font-weight: 800;
  background-color: #ffbc0080;
  cursor: pointer;

  border-bottom: 0;

  &.active {
    background: #ffbc0040;
  }
}

.KeywordWrap {
  flex: 1;
}

.KeywordRow {
  display: flex;
  align-items: flex-end;
  gap: rem(10px);
  margin-top: rem(10px);
}

.KeywordCard {
  flex: 1;
  background: #fff;
  border-radius: rem(14px);
  padding: rem(16px) rem(16px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);

  .WeekLabel {
    font-size: rem(18px);
    font-weight: 900;
    text-align: center;
  }

  .Underline {
    width: rem(200px);
    height: rem(4px);
    margin: rem(10px) auto rem(12px);
    border-radius: rem(99px);
    background: var(--signature-color);
  }

  .KeywordList {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .KeywordItem {
    display: grid;
    grid-template-columns: rem(18px) 1fr;
    gap: rem(10px);
    align-items: center;
    padding: rem(5px) rem(5px);
    line-height: rem(18px);

    .Rank {
      font-weight: var(--font-weight-extra-bold);
      text-align: right;
    }
    .Keyword {
      color: var(--color-text-strong);
      font-weight: var(--font-weight-bold);
      font-size: rem(14px);
    }
  }
}

/* 꿀벌 버튼 */
.BeeButton {
  width: rem(56px);
  height: rem(56px);
  border: none;
  background: var(--white);
  border-radius: 50%;
  padding: 0;
  cursor: pointer;
  flex: 0 0 rem(56px);

  img {
    width: rem(56px);
    height: rem(56px);
    display: block;
  }
}
</style>
