import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const loading = ref(false)

// ==================== 餐馆管理 ====================

// 获取所有餐馆（管理员版）
export async function fetchAllRestaurantsAdmin() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('id', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return []
  } finally {
    loading.value = false
  }
}

// 创建餐馆
export async function createRestaurant(restaurantData) {
  const { data, error } = await supabase
    .from('restaurants')
    .insert(restaurantData)
    .select()
    .single()

  if (error) throw error
  return data
}

// 更新餐馆
export async function updateRestaurant(id, updates) {
  const { data, error } = await supabase
    .from('restaurants')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// 删除餐馆
export async function deleteRestaurant(id) {
  const { error } = await supabase
    .from('restaurants')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

// ==================== 评价管理 ====================

// 获取所有评价（管理员版，关联用户和餐馆）
export async function fetchAllRatingsAdmin() {
  loading.value = true
  try {
    // 先获取所有评价
    const { data: ratingsData, error: ratingsError } = await supabase
      .from('ratings')
      .select('*')
      .order('created_at', { ascending: false })

    if (ratingsError) throw ratingsError

    if (!ratingsData || ratingsData.length === 0) {
      return []
    }

    // 获取所有相关的用户ID和餐馆ID
    const userIds = [...new Set(ratingsData.map(r => r.user_id))]
    const restaurantIds = [...new Set(ratingsData.map(r => r.restaurant_id))]

    // 并行获取用户和餐馆信息
    const [profilesResult, restaurantsResult] = await Promise.all([
      supabase.from('profiles').select('id, username, avatar_url').in('id', userIds),
      supabase.from('restaurants').select('id, name').in('id', restaurantIds)
    ])

    // 构建映射
    const profilesMap = {}
    profilesResult.data?.forEach(p => {
      profilesMap[p.id] = p
    })

    const restaurantsMap = {}
    restaurantsResult.data?.forEach(r => {
      restaurantsMap[r.id] = r
    })

    // 关联数据
    const result = ratingsData.map(rating => ({
      ...rating,
      profiles: profilesMap[rating.user_id] || null,
      restaurants: restaurantsMap[rating.restaurant_id] || null
    }))

    return result
  } catch (error) {
    console.error('Error fetching ratings:', error)
    return []
  } finally {
    loading.value = false
  }
}

// 删除评价
export async function deleteRating(id) {
  const { error } = await supabase
    .from('ratings')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

// ==================== 申请审核 ====================

// 获取申请列表（管理员只显示餐馆申请）
export async function fetchApplications(status = null) {
  loading.value = true
  try {
    let query = supabase
      .from('restaurant_applications')
      .select('*')
      .eq('type', 'restaurant') // 管理员只显示餐馆申请
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: applications, error } = await query

    if (error) throw error

    if (!applications || applications.length === 0) {
      return []
    }

    // 获取所有用户ID并查询用户信息
    const userIds = [...new Set(applications.map(a => a.user_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds)

    const profilesMap = {}
    profiles?.forEach(p => {
      profilesMap[p.id] = p
    })

    // 关联用户信息
    const result = applications.map(app => ({
      ...app,
      profiles: profilesMap[app.user_id] || null
    }))

    return result
  } catch (error) {
    console.error('Error fetching applications:', error)
    return []
  } finally {
    loading.value = false
  }
}

// 批准申请
export async function approveApplication(id) {
  // 1. 更新申请状态
  const { data: appData, error: appError } = await supabase
    .from('restaurant_applications')
    .update({ status: 'approved' })
    .eq('id', id)
    .eq('status', 'pending')
    .select()
    .single()

  if (appError) throw appError

  // 2. 如果是餐馆申请，创建餐馆记录
  if (appData?.type === 'restaurant') {
    const restaurantData = {
      name: appData.name,
      tags: appData.tags || [],
      location: appData.location,
      description: appData.description,
      detail: appData.detail,
      price: appData.price,
      distance: appData.distance
    }

    await createRestaurant(restaurantData)
  }

  return appData
}

// 拒绝申请
export async function rejectApplication(id) {
  const { data, error } = await supabase
    .from('restaurant_applications')
    .update({ status: 'rejected' })
    .eq('id', id)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) throw error
  return data
}

// ==================== 用户管理 ====================

// 获取所有用户资料
export async function fetchAllProfiles() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // 获取每个用户的统计数据
    const profilesWithStats = await Promise.all(
      (data || []).map(async (profile) => {
        const [favoritesCount, ratingsCount, historyCount] = await Promise.all([
          supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
          supabase.from('ratings').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
          supabase.from('history').select('id', { count: 'exact', head: true }).eq('user_id', profile.id)
        ])

        return {
          ...profile,
          favorites_count: favoritesCount.count || 0,
          ratings_count: ratingsCount.count || 0,
          history_count: historyCount.count || 0
        }
      })
    )

    return profilesWithStats
  } catch (error) {
    console.error('Error fetching profiles:', error)
    return []
  } finally {
    loading.value = false
  }
}

// 设置用户为管理员
export async function setUserAdmin(userId, isAdmin) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_admin: isAdmin })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// 删除用户资料（非管理员）- 通过数据库函数级联删除
export async function deleteProfile(userId) {
  // 调用数据库函数删除用户及其所有相关数据
  const { data, error } = await supabase.rpc('delete_user_with_data', {
    target_user_id: userId
  })

  if (error) {
    console.error('Delete profile error:', error)
    throw error
  }
  return data
}

// 更新用户资料
export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ==================== 菜品管理 ====================

// 获取所有菜品（从评价中提取）
export async function fetchAllDishes() {
  loading.value = true
  try {
    // 获取所有有菜品名称的评价
    const { data, error } = await supabase
      .from('ratings')
      .select('restaurant_id, dish_name, score')
      .not('dish_name', 'is', null)

    if (error) throw error

    // 按餐馆和菜品分组统计
    const dishMap = new Map()

    data.forEach(item => {
      const key = `${item.restaurant_id}-${item.dish_name}`
      if (!dishMap.has(key)) {
        dishMap.set(key, {
          restaurant_id: item.restaurant_id,
          dish_name: item.dish_name,
          scores: [],
          count: 0
        })
      }
      const dish = dishMap.get(key)
      dish.scores.push(item.score)
      dish.count++
    })

    // 获取餐馆信息并计算平均分
    const restaurantIds = [...new Set(data.map(d => d.restaurant_id))]
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('id, name')
      .in('id', restaurantIds)

    const restaurantMap = {}
    restaurants?.forEach(r => {
      restaurantMap[r.id] = r.name
    })

    const result = Array.from(dishMap.values()).map(dish => {
      const avgScore = dish.scores.reduce((a, b) => a + b, 0) / dish.count
      return {
        restaurant_id: dish.restaurant_id,
        restaurant_name: restaurantMap[dish.restaurant_id] || '未知餐馆',
        dish_name: dish.dish_name,
        avg_score: Math.round(avgScore * 10) / 10,
        count: dish.count
      }
    })

    return result.sort((a, b) => b.count - a.count)
  } catch (error) {
    console.error('Error fetching dishes:', error)
    return []
  } finally {
    loading.value = false
  }
}

// ==================== 导出加载状态 ====================

export const isLoading = loading