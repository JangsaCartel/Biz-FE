import { createRouter, createWebHistory } from 'vue-router'

import DefaultLayout from '@/components/layouts/DefaultLayout.vue'
import homeRoutes from './home' // '페이지 묶음' import

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        ...homeRoutes // '페이지 묶음'을 자식으로 포함
      ]
    },
  ],
})

export default router
