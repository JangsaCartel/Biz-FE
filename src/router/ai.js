import AiPage from '@/pages/ai/AiPage.vue'
import AiChatPage from '@/pages/ai/AiChatPage.vue'

export default [
  {
    path: '/ai',
    name: 'ai',
    component: AiPage,
  },
  {
    path: '/ai/chat',
    name: 'aiChat',
    component: AiChatPage,
  },
]
