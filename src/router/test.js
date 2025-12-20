import TestPage from '@/pages/test/TestPage.vue'
import PaginationTestPage from '@/pages/test/PaginationTestPage.vue'
import MapTestPage from '@/pages/test/maptest.vue'

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
  {
    path: '/test/map',
    name: 'map-test',
    component: MapTestPage,
  },
]

