// 1. 필요한 페이지 컴포넌트들 import
import HomePage from '@/pages/home/HomePage.vue'

// 2. DefaultLayout에서 사용할 라우트 배열 export
export default [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
]
