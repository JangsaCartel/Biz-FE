import { createRouter, createWebHistory } from 'vue-router'

import DefaultLayout from '@/components/layouts/DefaultLayout.vue'

// 라우트 파일 import
import homeRoutes from './home'
import hotRoutes from './hot'
import mapRoutes from './map'
import aiRoutes from './ai'
import policyRoutes from './policy'
import testRoutes from './test'
import NotFoundPage from '@/pages/error/NotFoundPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        ...homeRoutes,
        ...hotRoutes,
        ...mapRoutes,
        ...aiRoutes,
        ...policyRoutes,
        ...testRoutes,
      ],
    },
    // Catch-all 라우트
    // 위에서 정의된 어떤 경로와도 일치하지 않을 경우, 이 라우트 사용
    // ** index.js 라우터 주소 수정시, 반드시 routes 배열의 맨 마지막에 위치하도록 수정 **
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: NotFoundPage,
    },
  ],
})

export default router
