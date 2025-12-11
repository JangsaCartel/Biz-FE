import PolicyPage from '@/pages/policy/PolicyPage.vue'

export default [
  {
    path: '/policy',
    name: 'policy',
    component: PolicyPage,
  },
  {
    path: '/policy/:id',
    name: 'policyDetail',
    component: () => import('@/pages/policy/PolicyDetailPage.vue'),
  },
]
