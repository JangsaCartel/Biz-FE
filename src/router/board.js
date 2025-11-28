import FreePage from '@/pages/board/FreePage.vue'
import InfoPage from '@/pages/board/InfoPage.vue'
import LocalPage from '@/pages/board/LocalPage.vue'

export default [
  {
    path: '/free',
    name: 'free',
    component: FreePage,
  },
  {
    path: '/info',
    name: 'info',
    component: InfoPage,
  },
  {
    path: '/local',
    name: 'local',
    component: LocalPage,
  },
]
