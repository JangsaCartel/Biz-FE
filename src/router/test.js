import TestPage from '@/pages/test/TestPage.vue'
import PaginationTestPage from '@/pages/test/PaginationTestPage.vue'

export default [
  {
    path: '/test',
    name: 'test',
    component: TestPage,
  },
  {
    path: '/test/pagination',
    name: 'pagination-test',
    component: PaginationTestPage,
  },
]

