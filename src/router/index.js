import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import FoodSelectorView from '../views/FoodSelectorView.vue'
import AuthView from '../views/AuthView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthView
  },
  {
    path: '/food-selector',
    name: 'food-selector',
    component: FoodSelectorView
  },
  {
    path: '/restaurant/:id',
    name: 'restaurant-detail',
    component: () => import('../views/RestaurantDetailView.vue')
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAdmin) {
    // 动态导入 useAuth，避免循环依赖
    const { supabase } = await import('../lib/supabase')
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      next('/auth')
      return
    }

    // 检查用户是否为管理员
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (!profile?.is_admin) {
      next('/')
      return
    }
  }
  next()
})

export default router