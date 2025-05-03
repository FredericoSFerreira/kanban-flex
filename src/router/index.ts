import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BoardView from '../views/BoardView.vue'
import ErrorView from '../views/ErrorView.vue'
import MyBoardView from "@/views/MyBoardView.vue";
import Login from "@/views/auth/Login.vue"
import Register from "@/views/auth/Register.vue"
import Terms from "@/views/Terms.vue"
import PrivacyPolicy from "@/views/PrivacyPolicy.vue"

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
    {
      path: "/my-boards",
      name: 'my-board',
      component: MyBoardView
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
    {
      path: '/terms',
      name: 'Terms',
      component: Terms
    },
    {
      path: '/privacy-policy',
      name: 'Privacy Policy',
      component: PrivacyPolicy
    },
    {
      path: "/:pathMatch(.*)*",
      name: 'error',
      component: ErrorView
    },
  ],
})

export default router
