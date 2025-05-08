import {createRouter, createWebHistory} from 'vue-router'
import {useAuthStore} from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import BoardView from '@/views/BoardView.vue'
import BoardV2View from "@/views/BoardV2View.vue";
import ErrorView from '@/views/ErrorView.vue'
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
      name: 'boardV2',
      component: BoardV2View,
      meta: {requiresAuth: true}
    },
    {
      path: '/boardV1/:id',
      name: 'board',
      component: BoardView,
    },
    {
      path: "/my-boards",
      name: 'my-board',
      component: MyBoardView,
      meta: {requiresAuth: true}
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

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({path: '/login', query: {redirect: to.fullPath}})
  } else {
    next()
  }
})

export default router
