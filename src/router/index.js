import { createRouter, createWebHistory } from 'vue-router'

import DefaultLayout from '@/components/layouts/DefaultLayout.vue'
import SignupLayout from '@/components/layouts/SignupLayout.vue'
import { getAccessToken } from '@/services/tokenStorage'

// 라우트 파일 import
import homeRoutes from './home'
import hotRoutes from './hot'
import mapRoutes from './map'
import aiRoutes from './ai'
import policyRoutes from './policy'
import boardRoutes from './board'
import testRoutes from './test'
import authRoutes from './auth'
import NotFoundPage from '@/pages/error/NotFoundPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      meta: { requiresAuth: true },
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
      path: '/',
      component: SignupLayout,
      children: [...authRoutes],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth)
  const hasToken = Boolean(getAccessToken())

  if (requiresAuth && !hasToken) {
    return next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
  }

  if (to.name === 'login' && hasToken) {
    const redirect =
      typeof to.query.redirect === 'string' && to.query.redirect.startsWith('/')
        ? to.query.redirect
        : '/'
    return next(redirect)
  }

  next()
})

export default router
