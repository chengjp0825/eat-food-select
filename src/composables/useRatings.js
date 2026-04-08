import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const { user } = useAuth()

// 存储当前用户的所有评分 - 导出供外部使用
export const userRatings = ref([])
// 存储餐厅的平均评分
const restaurantAvgRatings = ref({})
// 加载状态
const ratingsLoading = ref(false)

// 获取当前用户的所有评分
export async function fetchUserRatings() {
  if (!user.value) {
    userRatings.value = []
    return []
  }

  ratingsLoading.value = true
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    userRatings.value = data || []
    return data
  } catch (error) {
    console.error('Error fetching user ratings:', error)
    return []
  } finally {
    ratingsLoading.value = false
  }
}

// 获取餐厅的平均评分
export async function fetchRestaurantAvgRating(restaurantId) {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('score')
      .eq('restaurant_id', restaurantId)

    if (error) throw error

    if (!data || data.length === 0) {
      restaurantAvgRatings.value[restaurantId] = null
      return null
    }

    const sum = data.reduce((acc, item) => acc + item.score, 0)
    const avg = sum / data.length
    const rounded = Math.round(avg * 10) / 10 // 保留一位小数

    restaurantAvgRatings.value[restaurantId] = rounded
    return rounded
  } catch (error) {
    console.error('Error fetching restaurant average rating:', error)
    restaurantAvgRatings.value[restaurantId] = null
    return null
  }
}

// 获取餐厅的所有评分（用于显示评论）
export async function fetchRestaurantRatings(restaurantId) {
  try {
    // 简化查询，先只获取评分数据
    const { data: ratingsData, error: ratingsError } = await supabase
      .from('ratings')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })

    if (ratingsError) throw ratingsError

    if (!ratingsData || ratingsData.length === 0) {
      return []
    }

    // 获取所有评价者的用户ID
    const userIds = [...new Set(ratingsData.map(r => r.user_id))]

    // 批量获取用户资料
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds)

    // 构建用户ID到资料映射
    const profilesMap = {}
    if (profilesData) {
      profilesData.forEach(p => {
        profilesMap[p.id] = p
      })
    }

    // 合并评分和用户资料
    const result = ratingsData.map(rating => ({
      ...rating,
      profiles: profilesMap[rating.user_id] || null
    }))

    return result
  } catch (error) {
    console.error('Error fetching restaurant ratings:', error)
    return []
  }
}

// 获取当前用户对某个餐厅（或菜品）的评分
export async function fetchUserRatingForRestaurant(restaurantId, dishName = null) {
  if (!user.value) return null

  try {
    let query = supabase
      .from('ratings')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('restaurant_id', restaurantId)

    // 如果dishName为undefined或null，查询dish_name为null的记录（整体评价）
    // 否则查询特定菜品的评价
    if (dishName === undefined || dishName === null) {
      query = query.is('dish_name', null)
    } else {
      query = query.eq('dish_name', dishName)
    }

    const { data, error } = await query.single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 是 "未找到行"，正常情况
      throw error
    }

    // 更新本地状态
    const existingIndex = userRatings.value.findIndex(r =>
      r.restaurant_id === restaurantId &&
      r.user_id === user.value.id &&
      r.dish_name === dishName
    )

    if (data) {
      if (existingIndex >= 0) {
        userRatings.value[existingIndex] = data
      } else {
        userRatings.value.push(data)
      }
    } else if (existingIndex >= 0) {
      userRatings.value.splice(existingIndex, 1)
    }

    return data || null
  } catch (error) {
    console.error('Error fetching user rating for restaurant:', error)
    return null
  }
}

// 添加或更新评分（支持菜品评价）
export async function addOrUpdateRating(restaurantId, score, comment = '', dishName = null) {
  if (!user.value) {
    throw new Error('请先登录')
  }

  if (score < 1 || score > 5) {
    throw new Error('评分必须在 1-5 分之间')
  }

  try {
    // 检查是否已有评分（考虑dishName）
    const existingRating = await fetchUserRatingForRestaurant(restaurantId, dishName)

    let data
    if (existingRating) {
      // 更新现有评分
      const { data: updated, error } = await supabase
        .from('ratings')
        .update({
          score,
          comment: comment || existingRating.comment,
          created_at: new Date().toISOString()
        })
        .eq('id', existingRating.id)
        .select()
        .single()

      if (error) throw error
      data = updated
    } else {
      // 插入新评分
      const ratingData = {
        user_id: user.value.id,
        restaurant_id: restaurantId,
        score,
        comment
      }

      // 如果提供了dishName，添加到数据中
      if (dishName !== null && dishName !== undefined && dishName !== '') {
        ratingData.dish_name = dishName
      }

      const { data: inserted, error } = await supabase
        .from('ratings')
        .insert(ratingData)
        .select()
        .single()

      if (error) throw error
      data = inserted
    }

    // 更新本地状态
    await fetchUserRatings()
    // 重新计算平均分（整体评价）
    if (dishName === null || dishName === undefined || dishName === '') {
      await fetchRestaurantAvgRating(restaurantId)
    }

    return data
  } catch (error) {
    console.error('Error adding/updating rating:', error)
    throw error
  }
}

// 删除评分（支持菜品评价）
export async function removeRating(restaurantId, dishName = null) {
  if (!user.value) {
    throw new Error('请先登录')
  }

  try {
    let query = supabase
      .from('ratings')
      .delete()
      .eq('user_id', user.value.id)
      .eq('restaurant_id', restaurantId)

    // 如果dishName为undefined或null，删除dish_name为null的记录（整体评价）
    // 否则删除特定菜品的评价
    if (dishName === undefined || dishName === null) {
      query = query.is('dish_name', null)
    } else {
      query = query.eq('dish_name', dishName)
    }

    const { error } = await query

    if (error) throw error

    // 更新本地状态
    const index = userRatings.value.findIndex(r =>
      r.restaurant_id === restaurantId &&
      r.user_id === user.value.id &&
      r.dish_name === dishName
    )
    if (index >= 0) {
      userRatings.value.splice(index, 1)
    }

    // 重新计算平均分（如果是整体评价）
    if (dishName === null || dishName === undefined || dishName === '') {
      await fetchRestaurantAvgRating(restaurantId)
    }

    return true
  } catch (error) {
    console.error('Error removing rating:', error)
    throw error
  }
}

// 检查当前用户是否已评分
export function hasUserRated(restaurantId) {
  return computed(() => {
    if (!user.value) return false
    return userRatings.value.some(r => r.restaurant_id === restaurantId)
  })
}

// 检查当前用户是否已对特定菜品评分
export function hasUserRatedDish(restaurantId, dishName) {
  return computed(() => {
    if (!user.value || !dishName) return false
    return userRatings.value.some(r =>
      r.restaurant_id === restaurantId &&
      r.dish_name === dishName
    )
  })
}

// 获取当前用户的评分
export function getUserRating(restaurantId) {
  return computed(() => {
    if (!user.value) return null
    return userRatings.value.find(r => r.restaurant_id === restaurantId) || null
  })
}

// 获取餐厅的平均评分（从缓存）
export function getRestaurantAvgRating(restaurantId) {
  return computed(() => restaurantAvgRatings.value[restaurantId] || null)
}

// 获取特定菜品的所有评分（包含用户资料）
export async function fetchDishRatings(restaurantId, dishName) {
  try {
    // 获取菜品评分数据
    const { data: ratingsData, error: ratingsError } = await supabase
      .from('ratings')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('dish_name', dishName)
      .order('created_at', { ascending: false })

    if (ratingsError) throw ratingsError

    if (!ratingsData || ratingsData.length === 0) {
      return []
    }

    // 获取所有评价者的用户ID
    const userIds = [...new Set(ratingsData.map(r => r.user_id))]

    // 批量获取用户资料
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds)

    // 构建用户ID到资料映射
    const profilesMap = {}
    if (profilesData) {
      profilesData.forEach(p => {
        profilesMap[p.id] = p
      })
    }

    // 合并评分和用户资料
    const result = ratingsData.map(rating => ({
      ...rating,
      profiles: profilesMap[rating.user_id] || null
    }))

    return result
  } catch (error) {
    console.error('Error fetching dish ratings:', error)
    return []
  }
}

// 获取特定菜品的平均评分
export async function getDishAvgRating(restaurantId, dishName) {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('score')
      .eq('restaurant_id', restaurantId)
      .eq('dish_name', dishName)

    if (error) throw error

    if (!data || data.length === 0) {
      return null
    }

    const sum = data.reduce((acc, item) => acc + item.score, 0)
    const avg = sum / data.length
    const rounded = Math.round(avg * 10) / 10 // 保留一位小数
    return rounded
  } catch (error) {
    console.error('Error fetching dish average rating:', error)
    return null
  }
}

// 获取餐厅的所有菜品名称（从评价中提取）
export async function fetchRestaurantDishes(restaurantId) {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('dish_name')
      .eq('restaurant_id', restaurantId)
      .not('dish_name', 'is', null)

    if (error) throw error

    if (!data || data.length === 0) {
      return []
    }

    // 提取不重复的菜品名称
    const dishNames = [...new Set(data.map(item => item.dish_name).filter(name => name))]
    return dishNames
  } catch (error) {
    console.error('Error fetching restaurant dishes:', error)
    return []
  }
}

// 获取加载状态
export const isLoading = computed(() => ratingsLoading.value)