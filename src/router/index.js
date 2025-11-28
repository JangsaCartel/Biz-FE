import { createRouter, createWebHistory } from 'vue-router'

import DefaultLayout from '@/components/layouts/DefaultLayout.vue'

// 라우트 파일 import
import homeRoutes from './home'
import hotRoutes from './hot'
import mapRoutes from './map'
import aiRoutes from './ai'
import policyRoutes from './policy'
import boardRoutes from './board'
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
        ...boardRoutes,
        ...testRoutes,
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: NotFoundPage,
    },
  ],
})

export default router
