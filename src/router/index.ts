import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BoardView from "@/views/BoardView.vue";
import BoardView2 from "@/views/BoardView2.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/v1/board/:id',
      name: 'board1',
      component: BoardView,
    },
   {
      path: '/board/:id',
      name: 'board',
      component: BoardView2,
    },
  ],
})

export default router
