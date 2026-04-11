import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const { user } = useAuth()

// ============ 状态 ============
export const detailFood = ref(null)
export const showDetailModal = ref(false)
export const restaurantRatings = ref([])
export const restaurantDishes = ref([])
export const dishRatings = ref({})
export const dishesLoading = ref(false)
export const showAddDishInput = ref(false)
export const newDishName = ref('')
export const reviewsLoading = ref(false)

// ============ 辅助函数 ============
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
}

function getScoreText(score) {
  const texts = {
    0: '未评分',
    1: '很差',
    2: '较差',
    3: '一般',
    4: '不错',
    5: '超赞'
  }
  return texts[score] || '未评分'
}

// ============ 数据加载 ============
export async function loadRestaurantRatings(restaurantId) {
  if (!restaurantId) return

  reviewsLoading.value = true
  try {
    const data = await fetchRestaurantRatings(restaurantId)
    restaurantRatings.value = data || []
  } catch (error) {
    console.error('Error loading restaurant ratings:', error)
    restaurantRatings.value = []
  } finally {
    reviewsLoading.value = false
  }
}

export async function loadRestaurantDishes(restaurantId) {
  if (!restaurantId) return

  dishesLoading.value = true
  try {
    const dishes = await fetchRestaurantDishes(restaurantId)
    restaurantDishes.value = dishes || []

    // 加载每个菜品的平均评分
    const dishRatingsMap = {}
    for (const dishName of dishes) {
      const avg = await getDishAvgRating(restaurantId, dishName)
      dishRatingsMap[dishName] = avg
    }
    dishRatings.value = dishRatingsMap
  } catch (error) {
    console.error('Error loading restaurant dishes:', error)
    restaurantDishes.value = []
    dishRatings.value = {}
  } finally {
    dishesLoading.value = false
  }
}

// ============ 计算属性 ============
export const ratingDistribution = computed(() => {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  const total = restaurantRatings.value.length

  restaurantRatings.value.forEach(r => {
    if (r.score >= 1 && r.score <= 5) {
      dist[r.score]++
    }
  })

  return Object.entries(dist).map(([stars, count]) => ({
    stars: parseInt(stars),
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  })).reverse()
})

export const sortedRatings = computed(() => {
  return [...restaurantRatings.value].sort((a, b) => {
    // 整体评价（dish_name 为 null）置顶
    if (a.dish_name === null && b.dish_name !== null) return -1
    if (a.dish_name !== null && b.dish_name === null) return 1
    return new Date(b.created_at) - new Date(a.created_at)
  })
})

// ============ 弹窗控制 ============
export function showFoodDetail(food) {
  detailFood.value = food
  showDetailModal.value = true
  document.body.style.overflow = 'hidden'
  loadRestaurantRatings(food.id)
  fetchRestaurantAvgRating(food.id)
  if (user.value) {
    loadRestaurantDishes(food.id)
  } else {
    restaurantDishes.value = []
    dishRatings.value = {}
  }
}

export function closeDetailModal() {
  showDetailModal.value = false
  document.body.style.overflow = ''
  setTimeout(() => {
    detailFood.value = null
  }, 300)
}

// ============ 菜品管理 ============
export async function addNewDish(addRatingFn) {
  const dishName = newDishName.value.trim()
  if (!dishName) return

  if (restaurantDishes.value.includes(dishName)) {
    return { error: '该菜品已存在' }
  }

  restaurantDishes.value.push(dishName)
  dishRatings.value[dishName] = null
  newDishName.value = ''
  showAddDishInput.value = false

  try {
    if (addRatingFn) {
      await addRatingFn(detailFood.value.id, 3, '', dishName)
    }
    await loadRestaurantDishes(detailFood.value.id)
    return { success: true }
  } catch (error) {
    console.error('Error creating default rating for dish:', error)
    return { error: error.message }
  }
}

export function cancelAddDish() {
  newDishName.value = ''
  showAddDishInput.value = false
}

// ============ 导入需要的函数 ============
import { fetchRestaurantRatings, fetchRestaurantDishes, getDishAvgRating, fetchRestaurantAvgRating } from './useRatings'
