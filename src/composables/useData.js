import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const { user } = useAuth()

// 收藏相关
const favorites = ref([])
const favoritesLoading = ref(false)

// 历史记录相关
const history = ref([])
const historyLoading = ref(false)

// 获取收藏列表
export async function fetchFavorites() {
  if (!user.value) {
    favorites.value = []
    return []
  }

  favoritesLoading.value = true
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        restaurants (*)
      `)
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    favorites.value = data || []
    return data
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return []
  } finally {
    favoritesLoading.value = false
  }
}

// 添加收藏
export async function addFavorite(restaurantId) {
  if (!user.value) {
    throw new Error('请先登录')
  }

  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: user.value.id,
      restaurant_id: restaurantId
    })
    .select()
    .single()

  if (error) throw error

  // 重新获取完整数据
  await fetchFavorites()
  return data
}

// 取消收藏
export async function removeFavorite(restaurantId) {
  if (!user.value) return

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.value.id)
    .eq('restaurant_id', restaurantId)

  if (error) throw error

  // 更新本地状态
  favorites.value = favorites.value.filter(f => f.restaurants?.id !== restaurantId)
}

// 检查是否已收藏
export function isFavorite(restaurantId) {
  return computed(() => favorites.value.some(f => f.restaurants?.id === restaurantId))
}

// 导出收藏列表供外部使用
export const favoritesList = computed(() => favorites.value)

// 获取历史记录
export async function fetchHistory() {
  if (!user.value) {
    history.value = []
    return []
  }

  historyLoading.value = true
  try {
    const { data, error } = await supabase
      .from('history')
      .select(`
        *,
        restaurants (*)
      `)
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    history.value = data || []
    return data
  } catch (error) {
    console.error('Error fetching history:', error)
    return []
  } finally {
    historyLoading.value = false
  }
}

// 添加历史记录
export async function addHistory(restaurantId) {
  if (!user.value) return

  const { data, error } = await supabase
    .from('history')
    .insert({
      user_id: user.value.id,
      restaurant_id: restaurantId
    })
    .select()
    .single()

  if (error) {
    // 如果已存在（可能），忽略错误
    if (error.code !== '23505') {
      console.error('Error adding history:', error)
    }
    return null
  }

  // 重新获取完整数据
  await fetchHistory()
  return data
}

// 清空历史记录
export async function clearHistory() {
  if (!user.value) return

  const { error } = await supabase
    .from('history')
    .delete()
    .eq('user_id', user.value.id)

  if (error) throw error

  history.value = []
}

// 获取所有餐厅
export async function fetchRestaurants() {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('id')

  if (error) {
    console.error('Error fetching restaurants:', error)
    return []
  }

  return data || []
}

// 获取单个餐厅
export async function fetchRestaurant(id) {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching restaurant:', error)
    return null
  }

  return data
}