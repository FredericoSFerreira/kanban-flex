import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BoardView from '../views/BoardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
   {
      path: '/board/:id',
      name: 'board',
      component: BoardView,
    },
  ],
})

export default router
