import {createRouter, createWebHistory} from 'vue-router'
import {useAuthStore} from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import BoardV2View from "@/views/BoardV2View.vue";
import ErrorView from '@/views/ErrorView.vue'
import MyBoardView from "@/views/MyBoardView.vue";
import Login from "@/views/auth/Login.vue"
import Register from "@/views/auth/Register.vue"
import Terms from "@/views/Terms.vue"
import PrivacyPolicy from "@/views/PrivacyPolicy.vue"
import MyProfileView from "@/views/MyProfileView.vue";
import MyAttachmentsView from "@/views/MyAttachmentsView.vue";
import BoardStatistics from "@/views/BoardStatistics.vue";

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
      meta: {requiresAuth: true, allowDemo: true},
    },
    {
      path: '/board/statistics/:id',
      name: 'boardStatistics',
      component: BoardStatistics,
      meta: {requiresAuth: true}
    },
    {
      path: "/my-boards",
      name: 'my-board',
      component: MyBoardView,
      meta: {requiresAuth: true}
    },
    {
      path: "/my-profile",
      name: 'my-profile',
      component: MyProfileView,
      meta: {requiresAuth: true}
    },
    {
      path: "/my-attachments",
      name: 'my-attachments',
      component: MyAttachmentsView,
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
    // ── Admin routes ────────────────────────────────────────────────────────────
    {
      path: '/admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: {requiresAuth: true, requiresAdmin: true},
      children: [
        {path: '', redirect: '/admin/dashboard'},
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/AdminDashboardView.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/views/admin/AdminUsersView.vue'),
        },
        {
          path: 'boards',
          name: 'admin-boards',
          component: () => import('@/views/admin/AdminBoardsView.vue'),
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────────────
    {
      path: "/:pathMatch(.*)*",
      name: 'error',
      component: ErrorView
    },
  ],
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return next({path: '/'})
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    if (to.meta.allowDemo && to.query?.demo) return next()
    next({path: '/login', query: {redirect: to.fullPath}})
  } else {
    next()
  }
})

export default router
