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
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router