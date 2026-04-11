<template>
  <div class="food-selector">
    <div class="container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <div class="header-left">
            <h1 class="title">今天吃什么？</h1>
            <div class="toggle-switch">
              <button
                class="toggle-item"
                :class="{ active: viewMode === 'card' }"
                @click="switchMode('card')"
              >
                卡片模式
              </button>
              <button
                class="toggle-item"
                :class="{ active: viewMode === 'wheel' }"
                @click="switchMode('wheel')"
              >
                转盘模式
              </button>
            </div>
          </div>

          <div class="user-info" v-if="isAuthenticated">
            <div class="user-status-badge status-logged-in">
              <span class="status-dot"></span>
              已登录
            </div>
            <div class="user-avatar">
              <span class="avatar-icon">👤</span>
            </div>
            <div class="user-details">
              <span class="user-email">{{ profile?.username || userEmail }}</span>
              <div class="user-actions">
                <button v-if="isAdmin" class="settings-btn" @click="$router.push('/admin')" title="管理后台">
                  🛠️
                </button>
                <button v-if="isAdmin" class="settings-btn" @click="loadApplications(); showAppsModal = true" title="近期申请">
                  📋
                </button>
                <button v-else class="settings-btn" @click="showFeedbackModal = true" title="反馈建议">
                  💬
                </button>
                <button class="settings-btn" @click="openSettingsModal" title="设置">
                  ⚙️
                </button>
                <button class="logout-btn" @click="handleLogout">
                  退出
                </button>
              </div>
            </div>
          </div>
          <div class="user-info" v-else>
            <div class="user-status-badge status-logged-out">
              <span class="status-dot"></span>
              未登录
            </div>
            <a href="/auth" class="login-link">
              <span class="login-icon">🔑</span>
              登录/注册
            </a>
          </div>
        </div>
      </header>

      <!-- 分类筛选 -->
      <div class="filter-section">
        <!-- 卡片大小调节 -->
        <div class="filter-group" v-if="viewMode === 'card'">
          <span class="filter-label">📐 卡片</span>
          <div class="size-buttons">
            <button
              class="size-btn"
              :class="{ active: cardSize === 220 }"
              @click="cardSize = 220"
            >小</button>
            <button
              class="size-btn"
              :class="{ active: cardSize === 280 }"
              @click="cardSize = 280"
            >中</button>
            <button
              class="size-btn"
              :class="{ active: cardSize === 340 }"
              @click="cardSize = 340"
            >大</button>
          </div>
        </div>
        <!-- 地理位置分类 -->
        <div class="filter-group">
          <span class="filter-label">📍 位置</span>
          <div class="filter-tags">
            <button
              class="filter-tag"
              :class="{ active: selectedLocations.length === 0 }"
              @click="selectedLocations = []"
            >
              全部
            </button>
            <button
              v-for="location in locations"
              :key="location"
              class="filter-tag"
              :class="{ active: selectedLocations.includes(location) }"
              @click="toggleLocation(location)"
            >
              {{ location }}
            </button>
          </div>
        </div>
        <!-- 食物类型分类 -->
        <div class="filter-group">
          <span class="filter-label">🍜 类型</span>
          <div class="filter-tags">
            <button
              class="filter-tag"
              :class="{ active: selectedCategories.length === 0 }"
              @click="selectedCategories = []"
            >
              全部
            </button>
            <button
              v-for="category in categories"
              :key="category"
              class="filter-tag"
              :class="{ active: selectedCategories.includes(category) }"
              @click="toggleCategory(category)"
            >
              {{ category }}
            </button>
          </div>
        </div>
      </div>

      <!-- Card Grid Mode -->
      <div class="food-grid" v-if="viewMode === 'card'" :style="gridStyle">
        <div
          v-for="(food, index) in filteredFoods"
          :key="food.id"
          class="food-card"
          :class="{
            active: selectedFood === food.id,
            'card-highlight': highlightCard === food.id,
            'card-dimmed': isSpinning && highlightCard !== food.id && highlightCard !== null,
            'dragging': isAuthenticated && dragIndex === index,
            'drag-over': isAuthenticated && dragOverIndex === index,
            'draggable': isAuthenticated
          }"
          :style="{ width: cardSize + 'px', animationDelay: getCardDelay(food.id) }"
          @click="showFoodDetail(food)"
          :draggable="isAuthenticated"
          @dragstart="isAuthenticated && onDragStart($event, index)"
          @dragend="isAuthenticated && onDragEnd"
          @dragover.prevent="isAuthenticated && onDragOver($event, index)"
          @dragleave="isAuthenticated && onDragLeave"
          @drop="isAuthenticated && onDrop($event, index)"
        >
          <div class="card-header">
            <h3 class="food-title">{{ food.name }}</h3>
            <div class="card-actions">
              <!-- 评分显示：未登录显示锁，登录显示标签 -->
              <template v-if="isAuthenticated">
                <div class="rating-badge" :class="getRatingClass(getAvgRating(food.id))">
                  {{ getRatingLabel(getAvgRating(food.id)) }}
                </div>
              </template>
              <template v-else>
                <div class="lock-badge">
                  🔒
                </div>
              </template>
              <!-- 评价按钮（仅已登录用户可见） -->
              <button
                v-if="isAuthenticated"
                class="rate-btn"
                @click.stop="openRatingModal(food)"
                :title="checkHasRated(food.id) ? '修改评价' : '评价'"
              >
                <span class="rate-icon">{{ checkHasRated(food.id) ? '⭐' : '☆' }}</span>
              </button>
              <button
                v-if="isAuthenticated"
                class="favorite-btn"
                :class="{ active: checkIsFavorite(food.id) }"
                @click.stop="toggleFavorite(food.id, $event)"
                :title="checkIsFavorite(food.id) ? '取消收藏' : '收藏'"
              >
                <span class="favorite-icon">{{ checkIsFavorite(food.id) ? '❤️' : '🤍' }}</span>
              </button>
            </div>
          </div>
          <div class="food-badges">
            <div v-for="tag in inDisplayTags(food.tags)" :key="tag" class="food-badge">
              📍 {{ tag }}
            </div>
          </div>
          <p class="food-description">{{ food.description }}</p>
          <div class="card-meta">
            <span class="meta-item">
              💰 {{ food.price }}
            </span>
            <span class="meta-item">
              ⏱️ {{ food.distance }}
            </span>
            <span class="meta-item location-tag">
              📌 {{ food.location }}
            </span>
          </div>
        </div>
      </div>

      <!-- Wheel Mode -->
      <div class="wheel-mode" v-if="viewMode === 'wheel'">
        <div class="wheel-container" :class="{ spinning: isSpinning }">
          <div class="wheel" :class="{ spinning: isSpinning }" :style="{ transform: `rotate(${wheelRotation}deg)` }">
            <div
              v-for="(food, index) in filteredFoods"
              :key="food.id"
              class="wheel-segment"
              :style="{ transform: `rotate(${index * segmentAngle}deg)` }"
              :class="{
                highlight: food.id === currentHighlight && !isSpinning
              }"
            >
              <div class="segment-content">
                {{ food.name }}
              </div>
            </div>
          </div>
          <div class="wheel-pointer" :class="{ spinning: isSpinning }">▼</div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="footer">
        <button
            class="primary-button"
            :class="{ spinning: isSpinning }"
            :disabled="isSpinning"
            @click="startLottery"
          >
          <span v-if="!isSpinning" class="rocket-icon">🚀</span>
          <span v-else class="spinner">⟳</span>
          {{ isSpinning ? '正在抽奖...' : '跑马灯抽奖' }}
        </button>
        <button class="reset-button" @click="resetData">
          重置数据
        </button>
      </footer>
    </div>

    <!-- 食物详情弹窗 -->
    <RestaurantDetailModal
      :show="showDetailModal"
      :food="detailFood"
      :isAuthenticated="isAuthenticated"
      :restaurantRatings="restaurantRatings"
      :restaurantDishes="restaurantDishes"
      :dishRatings="dishRatings"
      :dishesLoading="dishesLoading"
      :ratingDistribution="ratingDistribution"
      :getRatingClass="getRatingClass"
      :getRatingLabel="getRatingLabel"
      :getAvgRating="getRestaurantAvgRating"
      :checkHasRated="(id) => checkHasRated(id)"
      :checkUserRatedDish="checkUserRatedDish"
      :onOpenRating="(food) => openRatingModal(food)"
      :onOpenDishReviews="(food, dishName) => openDishReviewsModal(food, dishName)"
      :onOpenDishRating="(food, dishName) => openDishRatingModal(food, dishName)"
      :onAddDish="(dishName) => addNewDishByName(dishName)"
      :onSelect="selectCurrentFood"
      @update:show="val => showDetailModal = val"
    />

    <!-- 中奖提示 -->
    <WinnerModal
      :show="showWinnerModal"
      :winnerFood="winnerFood"
      :getRatingClass="getRatingClass"
      :getRatingLabel="getRatingLabel"
      :getAvgRating="getRestaurantAvgRating"
      @update:show="val => showWinnerModal = val"
    />

    <!-- 评分弹窗 -->
    <RatingModal
      :show="showRatingModal"
      :restaurant="ratingRestaurant"
      :dishName="ratingDishName"
      :initialScore="ratingScore"
      :initialComment="ratingComment"
      :loading="ratingLoading"
      :hasRated="checkHasRated(ratingRestaurant?.id)"
      @update:show="val => showRatingModal = val"
      @submit="handleRatingSubmit"
      @delete="handleRatingDelete"
    />

    <!-- 菜品评价列表弹窗 -->
    <DishReviewsModal
      :show="showDishReviewsModal"
      :restaurant="dishReviewsRestaurant"
      :dishName="dishReviewsDishName"
      :reviews="dishReviewsList"
      :loading="dishReviewsLoading"
      :userHasRated="checkUserRatedDish(dishReviewsRestaurant?.id, dishReviewsDishName)"
      @update:show="val => showDishReviewsModal = val"
      @rate="goToRateDish"
    />

    <!-- 申请管理弹窗 -->
    <AppsModal
      :show="showAppsModal"
      :isAdmin="isAdmin"
      :applications="applications"
      :loading="appsLoading"
      @update:show="val => showAppsModal = val"
      @approve="(id) => handleApplication(id, 'approved')"
      @reject="(id) => handleApplication(id, 'rejected')"
    />

    <!-- 复用组件 -->
    <SettingsModal
      :show="showSettingsModal"
      :profile="profile"
      :userEmail="userEmail"
      :historyList="historyList"
      :onLoadHistory="fetchHistory"
      :onClearHistory="clearHistory"
      :onOpenRestaurant="openRestaurantDetail"
      @update:show="showSettingsModal = $event"
      @saved="handleSettingsSaved"
    />
    <FeedbackModal
      :show="showFeedbackModal"
      @update:show="showFeedbackModal = $event"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { supabase } from '../lib/supabase'
import { fetchRestaurants, addFavorite, removeFavorite, isFavorite, addHistory, favoritesList, historyList, fetchHistory, clearHistory } from '../composables/useData'
import {
  fetchUserRatings,
  fetchRestaurantAvgRating,
  addOrUpdateRating,
  removeRating,
  hasUserRated,
  hasUserRatedDish,
  getUserRating,
  getRestaurantAvgRating,
  fetchRestaurantRatings,
  fetchRestaurantDishes,
  getDishAvgRating,
  fetchDishRatings,
  fetchUserRatingForRestaurant,
  isLoading as ratingsLoading,
  userRatings
} from '../composables/useRatings'
import SettingsModal from '../components/SettingsModal.vue'
import FeedbackModal from '../components/FeedbackModal.vue'
import WinnerModal from '../components/WinnerModal.vue'
import RatingModal from '../components/RatingModal.vue'
import DishReviewsModal from '../components/DishReviewsModal.vue'
import AppsModal from '../components/AppsModal.vue'
import RestaurantDetailModal from '../components/RestaurantDetailModal.vue'

const { user, isAuthenticated, userEmail, signOut, profile, updateProfile, isAdmin } = useAuth()

const viewMode = ref('card')
const selectedFood = ref(null)
const selectedLocations = ref([])
const selectedCategories = ref([])
const showDetailModal = ref(false)
const detailFood = ref(null)
const highlightCard = ref(null)
const cardSize = ref(280) // 小220 中280 大340

// 拖拽排序相关
const dragIndex = ref(null)
const dragOverIndex = ref(null)
const foodOrder = ref([]) // 存储用户自定义排序

// 跑马灯相关
const isSpinning = ref(false)
const wheelRotation = ref(0)
const currentHighlight = ref(null)
const segmentAngle = ref(0)
const showWinnerModal = ref(false)
const winnerFood = ref(null)
let spinInterval = null

// 用于动画的计数器
const animationKey = ref(0)

// 分类数据
const locations = ['南门', '北门', '东门', '校内']
const categories = ['食堂', '快餐', '中餐', '日料', '火锅', '小吃', '饮品', '轻食', '夜宵']

// 食物数据
const foods = ref([])
const loading = ref(false)

// 评分相关状态
const showRatingModal = ref(false)
const ratingRestaurant = ref(null)
const ratingDishName = ref(null)  // null表示整体评价，否则为菜品名称
const ratingScore = ref(0)
const ratingComment = ref('')
const ratingLoading = ref(false)

// 菜品评价列表弹窗状态
const showDishReviewsModal = ref(false)
const dishReviewsRestaurant = ref(null)
const dishReviewsDishName = ref('')
const dishReviewsList = ref([])
const dishReviewsLoading = ref(false)

// 评价列表相关状态
const restaurantRatings = ref([])
const reviewsLoading = ref(false)

// 菜品评价相关状态
const restaurantDishes = ref([])  // 餐厅菜品列表
const dishRatings = ref({})       // 菜品评分数据，键为dish_name
const dishesLoading = ref(false)  // 菜品加载状态
const showAddDishInput = ref(false)  // 是否显示添加菜品输入框
const newDishName = ref('')  // 新增菜品名称

// 反馈弹窗状态
const showFeedbackModal = ref(false)

// 用户设置弹窗状态
const showSettingsModal = ref(false)

// 收藏数
const favoritesCount = computed(() => favoritesList.value?.length || 0)

// 申请列表管理
const showAppsModal = ref(false)
const applications = ref([])
const appsLoading = ref(false)
const applicationsSubscription = ref(null)

// 加载所有申请（管理员）或我的申请（普通用户）
async function loadApplications() {
  appsLoading.value = true
  try {
    const { data, error } = await supabase
      .from('restaurant_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    applications.value = data || []
  } catch (error) {
    console.error('Error loading applications:', error)
    applications.value = []
  } finally {
    appsLoading.value = false
  }
}

// 设置申请表的实时订阅
function setupApplicationsSubscription() {
  // 如果已有订阅，先取消
  if (applicationsSubscription.value) {
    supabase.removeChannel(applicationsSubscription.value)
  }

  // 创建新订阅
  applicationsSubscription.value = supabase
    .channel('restaurant_applications_changes')
    .on(
      'postgres_changes',
      {
        event: '*',  // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'restaurant_applications'
      },
      async (payload) => {
        console.log('Application change detected:', payload)
        // 重新加载申请数据
        await loadApplications()
      }
    )
    .subscribe()
}

// 取消申请订阅
function cleanupApplicationsSubscription() {
  if (applicationsSubscription.value) {
    supabase.removeChannel(applicationsSubscription.value)
    applicationsSubscription.value = null
  }
}

// 处理申请（批准或拒绝）
async function handleApplication(appId, status) {
  const app = applications.value.find(a => a.id === appId)
  if (!app) return
  if (app.status !== 'pending') {
    alert('该申请已处理')
    return
  }

  try {
    // 如果批准，先检查重复和插入餐馆
    if (status === 'approved') {
      // 检查是否已存在相同名称的餐馆（针对restaurant类型）
      if (app.type === 'restaurant' && app.name) {
        const { data: existingRestaurants } = await supabase
          .from('restaurants')
          .select('id')
          .eq('name', app.name)
          .limit(1)

        if (existingRestaurants && existingRestaurants.length > 0) {
          alert(`餐馆 "${app.name}" 已存在，请检查重复`)
          return
        }
      }

      // 如果是餐馆申请，添加到餐馆列表
      if (app.type === 'restaurant') {
        const { error: insertError } = await supabase.from('restaurants').insert({
          name: app.name,
          tags: app.tags,
          location: app.location,
          description: app.description,
          detail: app.detail || '',
          price: app.price,
          distance: app.distance,
          rating_label: 'npc',
          rating_class: 'npc',
          features: []  // 默认空数组
        })

        if (insertError) throw insertError
      }
    }

    // 更新申请状态（仅在以上操作成功后）
    const { data: updatedData, error } = await supabase
      .from('restaurant_applications')
      .update({ status })
      .eq('id', appId)
      .eq('status', 'pending')  // 确保只更新待处理状态
      .select()

    if (error) throw error
    if (!updatedData || updatedData.length === 0) {
      // 没有行被更新，可能是状态已改变或其他原因
      alert('更新失败，请刷新后重试')
      return
    }

    // 立即更新本地状态以提供即时反馈
    const index = applications.value.findIndex(a => a.id === appId)
    if (index >= 0) {
      applications.value[index].status = status
    }

    // 刷新列表和数据（确保与服务器同步）
    await loadApplications()
    // 所有人都刷新餐厅列表
    await loadRestaurants()
    alert(status === 'approved' ? '已批准' : '已驳回')
  } catch (error) {
    console.error('Error handling application:', error)
    alert('操作失败')
  }
}

// 加载餐厅评价列表
async function loadRestaurantRatings(restaurantId) {
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

// 加载餐厅菜品列表
async function loadRestaurantDishes(restaurantId) {
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

// 计算评分分布
const ratingDistribution = computed(() => {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  const total = restaurantRatings.value.length

  restaurantRatings.value.forEach(r => {
    if (r.score >= 1 && r.score <= 5) {
      dist[r.score]++
    }
  })

  // 转换为百分比
  return Object.entries(dist).map(([stars, count]) => ({
    stars: parseInt(stars),
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  })).reverse() // 5星在前
})

// 排序评价：餐馆评价置顶，菜品评价在后面
const sortedRatings = computed(() => {
  return [...restaurantRatings.value].sort((a, b) => {
    // 都没有 dish_name 或都有 dish_name，按时间排序
    const aIsDish = !!a.dish_name
    const bIsDish = !!b.dish_name
    if (aIsDish === bIsDish) {
      return new Date(b.created_at) - new Date(a.created_at)
    }
    // 餐馆评价（无 dish_name）置顶
    return aIsDish ? 1 : -1
  })
})

// 检查当前评价是否已存在（考虑菜品）
const hasCurrentRating = computed(() => {
  if (!ratingRestaurant.value || !user.value) return false

  // 在评价列表中查找当前用户的评价
  const userRating = restaurantRatings.value.find(r =>
    r.restaurant_id === ratingRestaurant.value.id &&
    r.user_id === user.value.id &&
    r.dish_name === ratingDishName.value  // null匹配null，字符串匹配字符串
  )

  return !!userRating
})

// 从Supabase加载餐厅数据
async function loadRestaurants() {
  loading.value = true
  try {
    const data = await fetchRestaurants()
    if (data && data.length > 0) {
      foods.value = data.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        tags: restaurant.tags || [],
        location: restaurant.location || '',
        description: restaurant.description || '',
        detail: restaurant.detail || '',
        price: restaurant.price || '',
        distance: restaurant.distance || '',
        ratingLabel: restaurant.rating_label || 'npc',
        ratingClass: restaurant.rating_class || 'npc',
        features: restaurant.features || []
      }))

      // 加载所有餐厅的平均评分
      await loadAllRestaurantRatings()
    } else {
      // 数据库没有数据时显示空状态
      foods.value = []
    }
  } catch (error) {
    console.error('Error loading restaurants:', error)
    foods.value = []
  } finally {
    loading.value = false
  }
}

// 批量加载所有餐厅的平均评分
async function loadAllRestaurantRatings() {
  try {
    for (const food of foods.value) {
      await fetchRestaurantAvgRating(food.id)
    }
  } catch (error) {
    console.error('Error loading all restaurant ratings:', error)
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadRestaurants()
  loadFoodOrder() // 加载用户的卡片排序

  // 如果用户已登录，加载其评分数据并设置申请订阅
  if (isAuthenticated.value) {
    fetchUserRatings()
    setupApplicationsSubscription()
  }

  // 监听 admin 页面数据更新通知
  window.addEventListener('storage', handleStorageChange)
  // 监听同页面 sessionStorage 变化
  window.addEventListener('restaurantDataUpdated', () => loadRestaurants())
})

// localStorage 键名
const FOOD_ORDER_KEY = 'food_order_' // 后面拼接用户ID

// 保存排序到 localStorage
function saveFoodOrder(order) {
  const key = FOOD_ORDER_KEY + (profile.value?.id || 'guest')
  localStorage.setItem(key, JSON.stringify(order))
}

// 从 localStorage 加载排序
function loadFoodOrder() {
  const key = FOOD_ORDER_KEY + (profile.value?.id || 'guest')
  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      foodOrder.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse food order:', e)
      foodOrder.value = []
    }
  }
}

// 处理 sessionStorage 变化
function handleStorageChange(e) {
  if (e.key === 'restaurant_data_updated') {
    loadRestaurants()
  }
}

onUnmounted(() => {
  // 清理申请订阅
  cleanupApplicationsSubscription()
  // 移除 storage 监听
  window.removeEventListener('storage', handleStorageChange)
})

// 监听登录状态变化，加载评分数据
watch(isAuthenticated, (newVal) => {
  if (newVal) {
    fetchUserRatings()
    // 用户登录，设置申请订阅
    setupApplicationsSubscription()
  } else {
    // 用户登出，清理申请订阅
    cleanupApplicationsSubscription()
  }
})

// 监听用户资料变化，重新加载对应用户的排序
watch(profile, () => {
  loadFoodOrder()
})

// 监听申请模态框状态，加载数据
watch(showAppsModal, (newVal) => {
  if (newVal) {
    // 模态框打开，加载申请数据
    loadApplications()
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// 筛选后的食物（多选：空数组=全部选中）
const filteredFoods = computed(() => {
  const filtered = foods.value.filter(food => {
    const locationMatch = selectedLocations.value.length === 0 || selectedLocations.value.includes(food.location)
    const categoryMatch = selectedCategories.value.length === 0 || food.tags.some(tag => selectedCategories.value.includes(tag))
    return locationMatch && categoryMatch
  })

  // 应用自定义排序
  if (foodOrder.value.length > 0) {
    const orderMap = new Map(foodOrder.value.map((id, idx) => [id, idx]))
    return [...filtered].sort((a, b) => {
      const orderA = orderMap.get(a.id) ?? Infinity
      const orderB = orderMap.get(b.id) ?? Infinity
      return orderA - orderB
    })
  }

  return filtered
})

// 网格布局样式
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(auto-fill, minmax(${cardSize.value}px, 1fr))`
}))


// 更新转盘角度
watch(filteredFoods, (newFoods) => {
  if (newFoods.length > 0) {
    segmentAngle.value = 360 / newFoods.length
  }
})

// 监听筛选变化，触发动画并重置转盘
watch([selectedLocations, selectedCategories], () => {
  animationKey.value++
  // 转盘模式下重置转盘状态
  if (viewMode.value === 'wheel') {
    currentHighlight.value = null
    wheelRotation.value = -90
  }
})

// 获取卡片显示的标签
function inDisplayTags(tags) {
  return tags.slice(0, 2)
}

// 获取卡片动画延迟
function getCardDelay(id) {
  const index = filteredFoods.value.findIndex(f => f.id === id)
  return `${index * 0.05}s`
}

// 拖拽排序处理
function onDragStart(event, index) {
  dragIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', index)
}

function onDragEnd() {
  dragIndex.value = null
  dragOverIndex.value = null
}

function onDragOver(event, index) {
  if (dragIndex.value !== null && dragIndex.value !== index) {
    dragOverIndex.value = index
  }
}

function onDragLeave() {
  dragOverIndex.value = null
}

function onDrop(event, targetIndex) {
  const sourceIndex = dragIndex.value
  if (sourceIndex === null || sourceIndex === targetIndex) {
    dragIndex.value = null
    dragOverIndex.value = null
    return
  }

  // 获取当前排序的ID列表（基于filteredFoods的顺序）
  const currentOrder = [...foodOrder.value]
  if (currentOrder.length === 0) {
    // 如果没有自定义排序，使用当前filteredFoods的顺序初始化
    filteredFoods.value.forEach(food => {
      if (!currentOrder.includes(food.id)) {
        currentOrder.push(food.id)
      }
    })
  }

  // sourceIndex 和 targetIndex 是基于 filteredFoods 的索引
  // 找到对应的ID进行交换
  const sourceId = filteredFoods.value[sourceIndex]?.id
  const targetId = filteredFoods.value[targetIndex]?.id

  if (!sourceId || !targetId) {
    dragIndex.value = null
    dragOverIndex.value = null
    return
  }

  // 在currentOrder中找到这两个ID的位置并交换
  const sourceOrderIdx = currentOrder.indexOf(sourceId)
  const targetOrderIdx = currentOrder.indexOf(targetId)

  if (sourceOrderIdx !== -1 && targetOrderIdx !== -1) {
    // 交换位置
    const temp = currentOrder[sourceOrderIdx]
    currentOrder[sourceOrderIdx] = currentOrder[targetOrderIdx]
    currentOrder[targetOrderIdx] = temp

    foodOrder.value = currentOrder
    saveFoodOrder(currentOrder) // 保存到 localStorage
  }

  dragIndex.value = null
  dragOverIndex.value = null
}

// 切换位置多选
function toggleLocation(location) {
  const index = selectedLocations.value.indexOf(location)
  if (index === -1) {
    selectedLocations.value.push(location)
  } else {
    selectedLocations.value.splice(index, 1)
  }
}

// 切换类型多选
function toggleCategory(category) {
  const index = selectedCategories.value.indexOf(category)
  if (index === -1) {
    selectedCategories.value.push(category)
  } else {
    selectedCategories.value.splice(index, 1)
  }
}

// 切换模式
function switchMode(mode) {
  viewMode.value = mode
  selectedFood.value = null
  // 指针在顶部，segment从3点钟方向开始，需要偏移90度对齐
  wheelRotation.value = -90
  // 确保 segmentAngle 正确计算
  if (filteredFoods.value.length > 0) {
    segmentAngle.value = 360 / filteredFoods.value.length
  }
}

// 显示详情
function showFoodDetail(food) {
  detailFood.value = food
  showDetailModal.value = true
  document.body.style.overflow = 'hidden'
  // 加载该餐厅的评价列表和平均分
  loadRestaurantRatings(food.id)
  fetchRestaurantAvgRating(food.id)
  // 加载餐厅菜品列表（仅已登录用户）
  if (isAuthenticated.value) {
    loadRestaurantDishes(food.id)
  } else {
    // 未登录时清空菜品数据
    restaurantDishes.value = []
    dishRatings.value = {}
  }
}

// 关闭详情
function closeDetailModal() {
  showDetailModal.value = false
  document.body.style.overflow = ''
  setTimeout(() => {
    detailFood.value = null
  }, 300)
}

// 选择当前食物
function selectCurrentFood() {
  const restaurantId = detailFood.value?.id
  selectedFood.value = restaurantId
  if (restaurantId) {
    recordHistory(restaurantId)
  }
  closeDetailModal()
}

// 开始跑马灯抽奖
function startLottery() {
  if (isSpinning.value) return

  const targetFoods = filteredFoods.value
  if (targetFoods.length === 0) {
    alert('当前筛选条件下没有可选食物！')
    return
  }

  // 只有一个选项时显示彩蛋
  if (targetFoods.length === 1) {
    selectedFood.value = targetFoods[0].id
    if (viewMode.value === 'wheel') {
      currentHighlight.value = targetFoods[0].id
      wheelRotation.value = -90
    }
    showWinnerModal.value = true
    winnerFood.value = targetFoods[0]
    return
  }

  if (viewMode.value === 'card') {
    isSpinning.value = true
    // 卡片模式跑马灯动画
    const totalSegments = targetFoods.length
    // 随机目标位置
    let targetIndex = Math.floor(Math.random() * totalSegments)
    // 计算需要遍历的次数：多转几圈 + 目标位置
    const spins = 5
    const totalSteps = spins * totalSegments + targetIndex

    let step = 0
    // 起始速度快，逐渐减速
    let speed = 15

    const animate = () => {
      const currentIndex = step % totalSegments
      highlightCard.value = targetFoods[currentIndex].id

      step++

      if (step < totalSteps) {
        // 逐渐减速：快 → 慢
        const remaining = totalSteps - step
        if (remaining <= totalSegments) {
          // 最后阶段：减速明显
          speed = Math.min(speed + 30, 300)
        } else if (step > spins * totalSegments) {
          // 中后段：中等减速
          speed = Math.min(speed + 12, 120)
        } else {
          // 前段：快速加速到峰值后保持
          speed = Math.min(speed + 3, 80)
        }
        setTimeout(animate, speed)
      } else {
        setTimeout(() => {
          const finalFood = targetFoods[targetIndex]
          selectedFood.value = finalFood.id
          highlightCard.value = null
          isSpinning.value = false
          showWinnerModal.value = true
          winnerFood.value = finalFood
        }, 200)
      }
    }

    animate()
  } else {
    // 转盘模式跑马灯
    isSpinning.value = true
    const totalSegments = targetFoods.length
    // 随机目标位置（索引）
    let targetIndex = Math.floor(Math.random() * totalSegments)
    // 每个扇区的角度（本地计算，避免 segmentAngle 未更新的问题）
    const segAngle = 360 / totalSegments
    // 计算需要旋转的角度：多转几圈 + 目标位置对应的角度
    // 逆时针旋转，让 targetIndex 对应的选项转到指针下方
    const spins = 5
    const totalRotation = spins * 360 + targetIndex * segAngle

    let startTime = null
    const duration = 4000 // 4秒，干脆利落

    const animateWheel = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)

      // 减速曲线：前75%快速 → 后25%急刹停
      let easeProgress
      if (progress < 0.75) {
        // 前75%：cubic ease-out
        easeProgress = 1 - Math.pow(1 - progress / 0.75, 3) * 0.75
      } else {
        // 后25%：急刹到零速度
        const tailProgress = (progress - 0.75) / 0.25
        easeProgress = 0.75 + (1 - Math.pow(1 - tailProgress, 2)) * 0.25
      }
      easeProgress = Math.min(easeProgress, 1)

      const currentRotation = totalRotation * easeProgress
      wheelRotation.value = -currentRotation - 90

      if (progress < 1) {
        spinInterval = requestAnimationFrame(animateWheel)
      } else {
        // 动画结束，显示结果
        isSpinning.value = false
        selectedFood.value = targetFoods[targetIndex].id
        currentHighlight.value = targetFoods[targetIndex].id
        setTimeout(() => {
          showWinnerModal.value = true
          winnerFood.value = targetFoods[targetIndex]
        }, 300)
      }
    }

    spinInterval = requestAnimationFrame(animateWheel)
  }
}

// 关闭中奖弹窗
function closeWinnerModal() {
  showWinnerModal.value = false
  document.body.style.overflow = ''
  setTimeout(() => {
    winnerFood.value = null
  }, 300)
}

// 重置数据
function resetData() {
  selectedFood.value = null
  selectedLocations.value = []
  selectedCategories.value = []
  showDetailModal.value = false
  detailFood.value = null
  document.body.style.overflow = ''
  isSpinning.value = false
  currentHighlight.value = null
  highlightCard.value = null
  showWinnerModal.value = false
  winnerFood.value = null
  wheelRotation.value = -90
  if (spinInterval) {
    // 可能是 setTimeout 或 requestAnimationFrame
    clearTimeout(spinInterval)
    cancelAnimationFrame(spinInterval)
    spinInterval = null
  }
  animationKey.value++
}

// 检查是否为收藏
function checkIsFavorite(restaurantId) {
  return isFavorite(restaurantId).value
}

// 切换收藏状态
async function toggleFavorite(restaurantId, event) {
  event.stopPropagation() // 阻止事件冒泡，避免触发卡片点击
  if (!isAuthenticated.value) {
    alert('请先登录以使用收藏功能')
    return
  }

  try {
    if (checkIsFavorite(restaurantId)) {
      await removeFavorite(restaurantId)
    } else {
      await addFavorite(restaurantId)
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    alert(error.message || '操作失败')
  }
}

// 记录历史（当用户选中食物时）
async function recordHistory(restaurantId) {
  if (!isAuthenticated.value) return

  try {
    await addHistory(restaurantId)
  } catch (error) {
    console.error('Error recording history:', error)
    // 静默失败，不打扰用户
  }
}

// 登出
async function handleLogout() {
  try {
    await signOut()
  } catch (error) {
    console.error('Error logging out:', error)
    alert('登出失败')
  }
}

// 打开设置弹窗
function openSettingsModal() {
  showSettingsModal.value = true
}

// 设置保存成功后的回调
async function handleSettingsSaved() {
  // 刷新用户数据
  await fetchUserRatings()
}

// 打开餐馆详情
function openRestaurantDetail(restaurantId) {
  const restaurant = restaurants.value.find(r => r.id === restaurantId)
  if (restaurant) {
    detailFood.value = restaurant
    showDetailModal.value = true
    // 记录浏览历史
    recordHistory(restaurantId)
  } else {
    alert('未找到该餐馆信息')
  }
}

// 打开评分弹窗（整体评价）
function openRatingModal(restaurant) {
  if (!isAuthenticated.value) {
    alert('请先登录以进行评价')
    return
  }

  ratingRestaurant.value = restaurant
  ratingDishName.value = null  // 整体评价

  // 获取用户已有的整体评价（dish_name 为 null）
  const userRating = userRatings.value.find(r =>
    r.restaurant_id === restaurant.id &&
    r.dish_name === null
  )

  if (userRating) {
    ratingScore.value = userRating.score
    ratingComment.value = userRating.comment || ''
  } else {
    ratingScore.value = 0
    ratingComment.value = ''
  }
  showRatingModal.value = true
  document.body.style.overflow = 'hidden'
}

// 格式化菜品评分显示
function formatDishRating(score) {
  if (score === null || score === undefined || score === '-') {
    return '-'
  }
  // 保留一位小数
  const rounded = Math.round(score * 10) / 10
  // 如果小数部分为0，显示整数
  if (rounded % 1 === 0) {
    return rounded.toString()
  }
  return rounded.toFixed(1)
}

// 打开菜品评价列表弹窗
async function openDishReviewsModal(restaurant, dishName) {
  if (!restaurant || !dishName) return

  dishReviewsRestaurant.value = restaurant
  dishReviewsDishName.value = dishName
  showDishReviewsModal.value = true
  document.body.style.overflow = 'hidden'
  dishReviewsLoading.value = true

  try {
    const reviews = await fetchDishRatings(restaurant.id, dishName)
    dishReviewsList.value = reviews || []
  } catch (error) {
    console.error('Error loading dish reviews:', error)
    dishReviewsList.value = []
  } finally {
    dishReviewsLoading.value = false
  }
}

// 关闭菜品评价列表弹窗
function closeDishReviewsModal() {
  showDishReviewsModal.value = false
  document.body.style.overflow = ''
  dishReviewsRestaurant.value = null
  dishReviewsDishName.value = ''
  dishReviewsList.value = []
  dishReviewsLoading.value = false
}

// 去评价菜品（从菜品评价列表弹窗）
function goToRateDish() {
  if (!dishReviewsRestaurant.value || !dishReviewsDishName.value) return
  closeDishReviewsModal()
  openDishRatingModal(dishReviewsRestaurant.value, dishReviewsDishName.value)
}

// 添加新菜品
async function addNewDish() {
  const dishName = newDishName.value.trim()
  if (!dishName) {
    alert('请输入菜品名称')
    return
  }
  // 检查是否已存在
  if (restaurantDishes.value.includes(dishName)) {
    alert('该菜品已存在')
    return
  }

  // 先添加到本地列表
  restaurantDishes.value.push(dishName)
  dishRatings.value[dishName] = null
  newDishName.value = ''
  showAddDishInput.value = false

  try {
    // 创建默认评分（3分），确保菜品保存到数据库
    await addOrUpdateRating(detailFood.value.id, 3, '', dishName)

    // 重新加载菜品列表以获取最新数据
    await loadRestaurantDishes(detailFood.value.id)

    // 打开该菜品的评分弹窗让用户可以修改
    openDishRatingModal(detailFood.value, dishName)
  } catch (error) {
    console.error('Error creating default rating for dish:', error)
    // 如果出错，仍然打开评分弹窗
    openDishRatingModal(detailFood.value, dishName)
  }
}

// 添加新菜品（由组件调用，接受菜品名称参数）
async function addNewDishByName(dishName) {
  if (!dishName) {
    alert('请输入菜品名称')
    return
  }
  if (restaurantDishes.value.includes(dishName)) {
    alert('该菜品已存在')
    return
  }

  restaurantDishes.value.push(dishName)
  dishRatings.value[dishName] = null

  try {
    await addOrUpdateRating(detailFood.value.id, 3, '', dishName)
    await loadRestaurantDishes(detailFood.value.id)
    openDishRatingModal(detailFood.value, dishName)
  } catch (error) {
    console.error('Error creating default rating for dish:', error)
    openDishRatingModal(detailFood.value, dishName)
  }
}

// 取消添加菜品
function cancelAddDish() {
  newDishName.value = ''
  showAddDishInput.value = false
}

// 打开菜品评分弹窗
async function openDishRatingModal(restaurant, dishName) {
  if (!isAuthenticated.value) {
    alert('请先登录以进行评价')
    return
  }

  ratingRestaurant.value = restaurant
  ratingDishName.value = dishName
  // 获取用户已有的评分（菜品）
  try {
    const userRating = await fetchUserRatingForRestaurant(restaurant.id, dishName)
    if (userRating) {
      ratingScore.value = userRating.score
      ratingComment.value = userRating.comment || ''
    } else {
      ratingScore.value = 0
      ratingComment.value = ''
    }
  } catch (error) {
    console.error('Error fetching user dish rating:', error)
    ratingScore.value = 0
    ratingComment.value = ''
  }
  showRatingModal.value = true
  document.body.style.overflow = 'hidden'
}

// 处理 RatingModal 组件提交的评分
async function handleRatingSubmit({ score, comment }) {
  if (!ratingRestaurant.value || score < 1) {
    alert('请选择评分（1-5星）')
    return
  }

  ratingLoading.value = true
  try {
    await addOrUpdateRating(ratingRestaurant.value.id, score, comment, ratingDishName.value)
    showRatingModal.value = false
    alert('评价提交成功！')
    if (detailFood.value && detailFood.value.id === ratingRestaurant.value.id) {
      loadRestaurantRatings(detailFood.value.id)
      if (isAuthenticated.value) {
        loadRestaurantDishes(detailFood.value.id)
      }
    }
  } catch (error) {
    console.error('Error submitting rating:', error)
    alert(error.message || '评价提交失败')
  } finally {
    ratingLoading.value = false
  }
}

// 处理 RatingModal 组件删除评分的请求
async function handleRatingDelete() {
  if (!ratingRestaurant.value) return

  if (!confirm('确定要删除您的评价吗？')) return

  ratingLoading.value = true
  try {
    await removeRating(ratingRestaurant.value.id, ratingDishName.value)
    showRatingModal.value = false
    alert('评价已删除')
    if (detailFood.value && detailFood.value.id === ratingRestaurant.value.id) {
      loadRestaurantRatings(detailFood.value.id)
      if (isAuthenticated.value) {
        loadRestaurantDishes(detailFood.value.id)
      }
    }
  } catch (error) {
    console.error('Error deleting rating:', error)
    alert(error.message || '删除失败')
  } finally {
    ratingLoading.value = false
  }
}

// 提交评分
async function submitRating() {
  if (!ratingRestaurant.value || ratingScore.value < 1) {
    alert('请选择评分（1-5星）')
    return
  }

  ratingLoading.value = true
  try {
    await addOrUpdateRating(ratingRestaurant.value.id, ratingScore.value, ratingComment.value, ratingDishName.value)
    showRatingModal.value = false
    // 可以显示成功消息
    alert('评价提交成功！')
    // 重新加载评价数据
    if (detailFood.value && detailFood.value.id === ratingRestaurant.value.id) {
      loadRestaurantRatings(detailFood.value.id)
      if (isAuthenticated.value) {
        loadRestaurantDishes(detailFood.value.id)
      }
    }
  } catch (error) {
    console.error('Error submitting rating:', error)
    alert(error.message || '评价提交失败')
  } finally {
    ratingLoading.value = false
  }
}

// 删除评分
async function deleteRating() {
  if (!ratingRestaurant.value) return

  if (!confirm('确定要删除您的评价吗？')) return

  ratingLoading.value = true
  try {
    await removeRating(ratingRestaurant.value.id, ratingDishName.value)
    showRatingModal.value = false
    alert('评价已删除')
    // 重新加载评价数据
    if (detailFood.value && detailFood.value.id === ratingRestaurant.value.id) {
      loadRestaurantRatings(detailFood.value.id)
      if (isAuthenticated.value) {
        loadRestaurantDishes(detailFood.value.id)
      }
    }
  } catch (error) {
    console.error('Error deleting rating:', error)
    alert(error.message || '删除失败')
  } finally {
    ratingLoading.value = false
  }
}

// 关闭评分弹窗
function closeRatingModal() {
  showRatingModal.value = false
  document.body.style.overflow = ''
  ratingRestaurant.value = null
  ratingDishName.value = null
  ratingScore.value = 0
  ratingComment.value = ''
  ratingLoading.value = false
}

// 检查用户是否已评价（支持整体评价和菜品评价）
function checkHasRated(restaurantId, dishName = null) {
  if (!user.value || !restaurantId) return false
  return userRatings.value.some(r =>
    r.restaurant_id === restaurantId &&
    r.user_id === user.value.id &&
    r.dish_name === dishName
  )
}

// 检查用户是否已对特定菜品评分
function checkUserRatedDish(restaurantId, dishName) {
  if (!user.value || !restaurantId || !dishName) return false
  return userRatings.value.some(r =>
    r.restaurant_id === restaurantId &&
    r.user_id === user.value.id &&
    r.dish_name === dishName
  )
}

// 获取餐厅平均评分
function getAvgRating(restaurantId) {
  return getRestaurantAvgRating(restaurantId).value
}

// 根据评分获取对应的标签（使用区间）
function getRatingLabel(rating) {
  if (!rating && rating !== 0) return '暂无评级'
  if (rating >= 4.5) return '夯'
  if (rating >= 3.5) return '顶级'
  if (rating >= 2.5) return '人上人'
  if (rating >= 1.5) return 'NPC'
  return '拉完了'
}

// 根据评分获取对应的样式类
function getRatingClass(rating) {
  if (!rating) return 'npc'
  if (rating >= 4.5) return 'hot'
  if (rating >= 3.5) return 'top-tier'
  if (rating >= 2.5) return 'top-tier'
  if (rating >= 1.5) return 'npc'
  return 'npc'
}

// 获取评分文本描述
function getScoreText(score) {
  const texts = {
    1: '很差',
    2: '一般',
    3: '还行',
    4: '很好',
    5: '非常好'
  }
  return texts[score] || ''
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 跳转到登录页
function goToAuth() {
  window.location.href = '/auth'
}
</script>

<style scoped>
/* 基础样式 */
.food-selector {
  background-color: var(--color-bg-accent);
  min-height: 100vh;
  padding: 60px 0;
  margin: 0 auto;
  max-width: 100%;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Header */


.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.header-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.title {
  color: var(--color-accent-primary);
  font-size: 32px;
  font-weight: bold;
  margin: 0;
  animation: fadeInDown 0.6s ease;
}


@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toggle-switch {
  display: inline-flex;
  background-color: var(--color-bg-primary);
  padding: 4px;
  border-radius: 50px;
  gap: 4px;
}

.toggle-item {
  padding: 10px 24px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.toggle-item.active {
  background-color: var(--color-text-light);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-sm);
  transform: scale(1.02);
}

.toggle-item.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: var(--color-accent-primary);
  border-radius: 2px;
  animation: widthPulse 1s ease-in-out infinite;
}

@keyframes widthPulse {
  0%, 100% { width: 20px; }
  50% { width: 30px; }
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.user-info:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 登录状态标签 */
.user-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: all 0.3s ease;
}

.status-logged-in {
  background: rgba(107, 208, 157, 0.1);
  color: var(--color-success);
  border: 1px solid rgba(107, 208, 157, 0.2);
}

.status-logged-out {
  background: rgba(255, 115, 84, 0.1);
  color: var(--color-accent-primary);
  border: 1px solid rgba(255, 115, 84, 0.2);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.status-logged-in .status-dot {
  background: var(--color-success);
  box-shadow: 0 0 8px rgba(107, 208, 157, 0.5);
}

.status-logged-out .status-dot {
  background: var(--color-accent-primary);
  box-shadow: 0 0 8px rgba(255, 115, 84, 0.5);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 18px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.settings-btn {
  padding: 4px 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  border-radius: 6px;
}

.settings-btn:hover {
  background: rgba(255, 115, 84, 0.1);
  transform: scale(1.1);
}

.user-email {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.logout-btn {
  padding: 4px 12px;
  background: var(--color-bg-primary);
  border: none;
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: var(--color-accent-primary);
  color: var(--color-text-light);
  transform: scale(1.05);
}

.login-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary));
  color: var(--color-text-light);
  text-decoration: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.login-link:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-accent);
}

.login-icon {
  font-size: 14px;
}

.toggle-item:hover:not(.active) {
  color: var(--color-text-primary);
  background: rgba(255, 255, 255, 0.5);
}

/* Filter Section */
.filter-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: filterSlideIn 0.3s ease;
}

@keyframes filterSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  min-width: 60px;
}

.filter-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.size-buttons {
  display: flex;
  gap: 4px;
}

.size-btn {
  padding: 6px 16px;
  border: 1px solid var(--border-color);
  background: var(--color-text-light);
  color: var(--color-text-secondary);
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.size-btn:hover {
  border-color: var(--color-accent-primary);
  color: var(--color-accent-primary);
}

.size-btn.active {
  background: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
  color: var(--color-text-light);
}

.filter-tag {
  padding: 6px 16px;
  border: 1px solid var(--border-color);
  background: var(--color-text-light);
  color: var(--color-text-secondary);
  font-size: 13px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.filter-tag::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 115, 84, 0.1);
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

.filter-tag:hover::before {
  width: 200%;
  height: 200%;
}

.filter-tag:hover {
  border-color: var(--color-accent-primary);
  color: var(--color-accent-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.filter-tag.active {
  background: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
  color: var(--color-text-light);
  transform: scale(1.05);
  box-shadow: var(--shadow-accent);
}

/* Grid System */
.food-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  justify-content: center;
}

/* Card Component */
.food-card {
  background-color: var(--color-bg-secondary);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;
  animation: cardEnter 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
  animation-fill-mode: backwards;
  border: 1px solid var(--border-color-light);
}

/* 卡片顶部彩色装饰条 */
.food-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-secondary));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.food-card:hover::before {
  opacity: 1;
}

.food-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-accent);
  border-color: rgba(255, 115, 84, 0.2);
}

/* 拖拽状态 */
.food-card.draggable {
  cursor: grab;
}

.food-card.draggable:active {
  cursor: grabbing;
}

.food-card.dragging {
  opacity: 0.5;
  transform: scale(0.95);
  cursor: grabbing;
  z-index: var(--z-modal);
  box-shadow: var(--shadow-lg);
}

.food-card.drag-over {
  border: 2px dashed var(--color-accent-primary);
  background-color: rgba(255, 115, 84, 0.05);
  transform: scale(1.02);
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.food-card.active {
  background-color: var(--color-success);
  box-shadow: var(--shadow-accent);
  transform: scale(1.02);
}

.food-card.active::before {
  opacity: 1;
  background: linear-gradient(90deg, var(--color-success), #8FE4B5);
}

.food-card.card-highlight {
  background-color: #FFF8E7 !important;
  transform: scale(1.12) translateY(-8px) !important;
  box-shadow: 0 0 0 3px #FFD93D, 0 16px 40px rgba(255, 217, 61, 0.5) !important;
  border-color: #FFD93D !important;
  z-index: 10;
  animation: cardMarqueeGlow 0.2s ease-in-out;
}

@keyframes cardMarqueeGlow {
  0% { box-shadow: 0 0 0 0px #FFD93D, 0 0 20px rgba(255, 217, 61, 0.2); }
  50% { box-shadow: 0 0 0 5px #FFD93D, 0 0 30px rgba(255, 217, 61, 0.6); }
  100% { box-shadow: 0 0 0 3px #FFD93D, 0 16px 40px rgba(255, 217, 61, 0.5); }
}

.food-card.card-highlight::before {
  opacity: 1;
  background: linear-gradient(90deg, #FFD93D, #FFE566);
}

.food-card.card-highlight .food-title {
  color: var(--color-text-primary);
}

.food-card.card-highlight .food-description,
.food-card.card-highlight .meta-item {
  color: var(--color-text-secondary);
}

.food-card.card-dimmed {
  opacity: 0.15 !important;
  transform: scale(0.85) !important;
  filter: grayscale(100%) !important;
  transition: opacity 0.08s ease, transform 0.08s ease, filter 0.08s ease !important;
}

/* 跑马灯期间所有卡片的快速过渡 */
.food-grid:has(.card-highlight) .food-card,
.food-grid:has(.card-dimmed) .food-card {
  transition: opacity 0.1s ease, transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.1s ease, box-shadow 0.1s ease, border-color 0.1s ease !important;
}

@keyframes cardPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); background-color: #FFD93D; }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.favorite-btn {
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.favorite-btn:hover {
  background: rgba(255, 115, 84, 0.1);
  transform: scale(1.1);
}

.favorite-btn.active {
  animation: favoritePulse 0.5s ease;
}

.favorite-btn.active .favorite-icon {
  filter: drop-shadow(0 2px 4px rgba(255, 71, 87, 0.4));
}

.favorite-icon {
  font-size: 16px;
  transition: all 0.3s ease;
}

@keyframes favoritePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

.food-title {
  color: var(--color-text-primary);
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  flex: 1;
}

.food-card.active .food-title {
  color: var(--color-text-light);
}

/* Rating Badge */
.rating-badge {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.3s ease;
  letter-spacing: 0.02em;
}

.rating-badge.large {
  padding: 8px 16px;
  font-size: 13px;
  border-radius: 10px;
}

.rating-badge.top-tier {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: var(--color-text-light);
  box-shadow: 0 2px 8px rgba(255, 165, 0, 0.3);
}

.rating-badge.top-tier:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 165, 0, 0.5);
}

.rating-badge.hot {
  background: linear-gradient(135deg, #FF6B6B, #FF4757);
  color: var(--color-text-light);
  box-shadow: 0 2px 6px rgba(255, 71, 87, 0.3);
}

.rating-badge.hot:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.5);
}

.rating-badge.npc {
  background: linear-gradient(135deg, #B0B0B0, #808080);
  color: var(--color-text-light);
  box-shadow: 0 2px 6px rgba(128, 128, 128, 0.2);
}

/* 锁图标样式 */
.lock-badge {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.3s ease;
  letter-spacing: 0.02em;
  background: linear-gradient(135deg, #D0D0D0, #A0A0A0);
  color: var(--color-text-light);
  box-shadow: 0 2px 6px rgba(128, 128, 128, 0.2);
}

.lock-badge:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(128, 128, 128, 0.3);
}

/* 评价按钮样式 */
.rate-btn {
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.rate-btn:hover {
  background: rgba(255, 193, 7, 0.1);
  transform: scale(1.1);
}

.rate-btn .rate-icon {
  font-size: 16px;
  transition: all 0.3s ease;
}

.rate-btn:hover .rate-icon {
  transform: rotate(15deg);
}

.food-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.food-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding: 0 10px;
  background: linear-gradient(135deg, #FFF0EE, #FFE8E8);
  color: #E67373;
  font-size: 11px;
  font-weight: 500;
  border-radius: 12px;
  align-self: flex-start;
  transition: all 0.3s ease;
}

.food-card:hover .food-badge {
  transform: scale(1.05);
}

.food-card.active .food-badge {
  background-color: rgba(255, 255, 255, 0.2);
  color: var(--color-text-light);
}

.pin-icon {
  width: 10px;
  height: 10px;
}

.food-description {
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.food-card.active .food-description {
  color: var(--color-text-light);
}

/* Card Meta */
.card-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-secondary);
  font-size: 12px;
  transition: all 0.3s ease;
}

.food-card.active .meta-item {
  color: rgba(255, 255, 255, 0.9);
}

.meta-item.location-tag {
  color: var(--color-text-muted);
  font-size: 11px;
}

.meta-icon {
  width: 12px;
  height: 12px;
  opacity: 0.6;
}

/* Wheel Mode */
.wheel-mode {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.wheel-container {
  position: relative;
  width: 380px;
  height: 380px;
}

.wheel-container.spinning .wheel {
  filter: drop-shadow(0 0 16px rgba(255, 115, 84, 0.25));
}

.wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #FFF8F5 0deg, #F5EDE8 30deg, #FFF8F5 60deg, #F5EDE8 90deg, #FFF8F5 120deg, #F5EDE8 150deg, #FFF8F5 180deg, #F5EDE8 210deg, #FFF8F5 240deg, #F5EDE8 270deg, #FFF8F5 300deg, #F5EDE8 330deg, #FFF8F5 360deg);
  position: relative;
  box-shadow: 0 8px 32px rgba(255, 115, 84, 0.15), inset 0 0 80px rgba(255, 255, 255, 0.5);
  border: 6px solid #FFF;
}

/* 转盘中心装饰 */
.wheel::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary));
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(255, 115, 84, 0.4);
}

.wheel-pointer {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 40px;
  color: var(--color-accent-primary);
  z-index: 10;
  filter: drop-shadow(0 4px 8px rgba(255, 115, 84, 0.6));
  transition: filter 0.2s ease, transform 0.2s ease;
}

.wheel-pointer.spinning {
  animation: pointerBounce 0.6s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(255, 115, 84, 0.6)) drop-shadow(0 0 12px rgba(255, 115, 84, 0.4));
}

@keyframes pointerBounce {
  0%, 100% { transform: translateX(-50%) translateY(0) scale(1); }
  50% { transform: translateX(-50%) translateY(-8px) scale(1.1); }
}

/* 转盘旋转中容器发光 */
.wheel-container.spinning {
  filter: drop-shadow(0 0 20px rgba(255, 115, 84, 0.3));
}

.wheel-segment {
  position: absolute;
  width: 50%;
  height: 2px;
  top: 50%;
  left: 50%;
  transform-origin: left center;
  transition: opacity 0.15s ease;
  background: linear-gradient(90deg, rgba(255, 115, 84, 0.05), rgba(255, 115, 84, 0.15));
}

.wheel-segment.highlight {
  height: 3px;
  background: linear-gradient(90deg, rgba(255, 115, 84, 0.4), var(--color-accent-primary));
  filter: drop-shadow(0 0 6px rgba(255, 115, 84, 0.6));
  transition: opacity 0.1s ease, height 0.15s ease, filter 0.15s ease, background 0.15s ease;
}

.segment-content {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
  font-size: 12px;
  color: var(--color-text-secondary);
  padding: 6px 14px;
  border-radius: 16px;
  background: var(--color-bg-secondary);
  font-weight: 500;
  transition: all 0.15s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.wheel-segment.highlight .segment-content {
  background: linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary));
  color: var(--color-text-light);
  transform: translateY(-50%) scale(1.15);
  box-shadow: 0 4px 20px rgba(255, 115, 84, 0.5), 0 0 0 2px rgba(255, 115, 84, 0.2);
  animation: segmentPulse 0.4s ease-in-out infinite;
}

@keyframes segmentPulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(255, 115, 84, 0.5), 0 0 0 2px rgba(255, 115, 84, 0.2); }
  50% { box-shadow: 0 4px 28px rgba(255, 115, 84, 0.7), 0 0 0 4px rgba(255, 115, 84, 0.3); }
}

.wheel-result-container {
  text-align: center;
  padding: 20px 40px;
  background: var(--color-bg-secondary);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(255, 115, 84, 0.1);
  min-width: 180px;
}

.current-spinning {
  font-size: 28px;
  font-weight: bold;
  color: var(--color-accent-primary);
  text-shadow: 0 2px 8px rgba(255, 115, 84, 0.3);
  animation: spinTextPop 0.3s ease-out;
}

@keyframes spinTextPop {
  0% { transform: scale(0.8); opacity: 0.5; }
  60% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}

/* Footer */
.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding-top: 20px;
}

.primary-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 48px;
  border: none;
  border-radius: 50px;
  background: linear-gradient(90deg, var(--color-accent-secondary), var(--color-accent-primary));
  color: var(--color-text-light);
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(255, 115, 84, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.primary-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.primary-button:hover::before {
  left: 100%;
}

.primary-button:hover:not(.spinning) {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 16px 32px rgba(255, 115, 84, 0.4);
}

.primary-button:active:not(.spinning) {
  transform: translateY(-2px) scale(1);
}

.primary-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.rocket-icon {
  font-size: 20px;
  transition: transform 0.3s ease;
}

.primary-button:hover .rocket-icon {
  transform: rotate(-15deg);
}

.spinner {
  font-size: 20px;
  animation: spin 1s linear infinite;
}

.reset-button {
  padding: 8px 24px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-button:hover {
  border-color: var(--color-text-muted);
  color: var(--color-text-primary);
  background-color: rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

</style>

