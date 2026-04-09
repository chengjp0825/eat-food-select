<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import {
  fetchAllRestaurantsAdmin,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  fetchAllRatingsAdmin,
  deleteRating,
  fetchApplications,
  approveApplication,
  rejectApplication,
  fetchAllProfiles,
  setUserAdmin,
  fetchAllDishes,
  isLoading
} from '../composables/useAdmin'

const router = useRouter()
const { user, isAdmin } = useAuth()

// 当前激活的标签页
const activeTab = ref('restaurants')

// 数据状态
const restaurants = ref([])
const ratings = ref([])
const applications = ref([])
const profiles = ref([])
const dishes = ref([])

// 搜索和筛选
const searchKeyword = ref('')
const filterStatus = ref('')
const filterRestaurant = ref('')

// 弹窗状态
const showModal = ref(false)
const modalMode = ref('add')
const currentItem = ref(null)

// 表单数据
const formData = ref({
  name: '',
  tags: '',
  location: '',
  description: '',
  detail: '',
  price: '',
  distance: '',
  rating_label: '',
  rating_class: 'npc',
  features: ''
})

// 确认弹窗
const showConfirm = ref(false)
const confirmAction = ref(null)
const confirmTitle = ref('')
const confirmMessage = ref('')

// 餐馆列表（用于评价筛选）
const restaurantOptions = ref([])

// 标签页配置
const tabs = [
  { id: 'restaurants', label: '餐馆管理', icon: 'bi-shop' },
  { id: 'ratings', label: '评价管理', icon: 'bi-star' },
  { id: 'dishes', label: '菜品管理', icon: 'bi-cup-hot' },
  { id: 'applications', label: '申请审核', icon: 'bi-file-earmark-check' },
  { id: 'users', label: '用户管理', icon: 'bi-people' }
]

// 过滤后的数据
const filteredRestaurants = computed(() => {
  if (!searchKeyword.value) return restaurants.value
  const kw = searchKeyword.value.toLowerCase()
  return restaurants.value.filter(r =>
    r.name?.toLowerCase().includes(kw) ||
    r.location?.toLowerCase().includes(kw) ||
    r.tags?.some(t => t.toLowerCase().includes(kw))
  )
})

const filteredRatings = computed(() => {
  let result = ratings.value
  if (filterRestaurant.value) {
    result = result.filter(r => r.restaurants?.id === parseInt(filterRestaurant.value))
  }
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter(r =>
      r.restaurants?.name?.toLowerCase().includes(kw) ||
      r.profiles?.username?.toLowerCase().includes(kw) ||
      r.dish_name?.toLowerCase().includes(kw) ||
      r.comment?.toLowerCase().includes(kw)
    )
  }
  return result
})

const filteredApplications = computed(() => {
  // 管理员只显示餐馆申请，过滤掉反馈建议
  let result = applications.value.filter(a => a.type === 'restaurant')

  if (filterStatus.value) {
    result = result.filter(a => a.status === filterStatus.value)
  }
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter(a =>
      a.name?.toLowerCase().includes(kw) ||
      a.profiles?.username?.toLowerCase().includes(kw)
    )
  }
  return result
})

const filteredProfiles = computed(() => {
  if (!searchKeyword.value) return profiles.value
  const kw = searchKeyword.value.toLowerCase()
  return profiles.value.filter(p =>
    p.username?.toLowerCase().includes(kw) ||
    p.email?.toLowerCase().includes(kw)
  )
})

// 加载数据
async function loadData() {
  if (activeTab.value === 'restaurants') {
    restaurants.value = await fetchAllRestaurantsAdmin()
    restaurantOptions.value = restaurants.value
  } else if (activeTab.value === 'ratings') {
    ratings.value = await fetchAllRatingsAdmin()
  } else if (activeTab.value === 'dishes') {
    dishes.value = await fetchAllDishes()
  } else if (activeTab.value === 'applications') {
    applications.value = await fetchApplications()
  } else if (activeTab.value === 'users') {
    profiles.value = await fetchAllProfiles()
  }
}

// 切换标签页
async function switchTab(tabId) {
  activeTab.value = tabId
  searchKeyword.value = ''
  filterStatus.value = ''
  filterRestaurant.value = ''
  await loadData()
}

// 重置表单
function resetForm() {
  formData.value = {
    name: '',
    tags: '',
    location: '',
    description: '',
    detail: '',
    price: '',
    distance: '',
    rating_label: '',
    rating_class: 'npc',
    features: ''
  }
}

// 打开弹窗
function openAddModal() {
  modalMode.value = 'add'
  resetForm()
  showModal.value = true
}

function openEditModal(item) {
  modalMode.value = 'edit'
  currentItem.value = item
  formData.value = {
    name: item.name || '',
    tags: item.tags?.join(', ') || '',
    location: item.location || '',
    description: item.description || '',
    detail: item.detail || '',
    price: item.price || '',
    distance: item.distance || '',
    rating_label: item.rating_label || '',
    rating_class: item.rating_class || 'npc',
    features: item.features?.join(', ') || ''
  }
  showModal.value = true
}

// 保存餐馆
async function saveRestaurant() {
  try {
    const data = {
      name: formData.value.name,
      tags: formData.value.tags ? formData.value.tags.split(',').map(t => t.trim()).filter(t => t) : [],
      location: formData.value.location,
      description: formData.value.description,
      detail: formData.value.detail,
      price: formData.value.price,
      distance: formData.value.distance,
      rating_label: formData.value.rating_label,
      rating_class: formData.value.rating_class,
      features: formData.value.features ? formData.value.features.split(',').map(t => t.trim()).filter(t => t) : []
    }

    if (modalMode.value === 'add') {
      await createRestaurant(data)
    } else {
      await updateRestaurant(currentItem.value.id, data)
    }

    showModal.value = false
    await loadData()
  } catch (error) {
    alert('操作失败: ' + error.message)
  }
}

// 删除餐馆
async function handleDeleteRestaurant(item) {
  confirmTitle.value = '确认删除'
  confirmMessage.value = `确定要删除餐馆「${item.name}」吗？此操作不可恢复。`
  confirmAction.value = async () => {
    try {
      await deleteRestaurant(item.id)
      showConfirm.value = false
      // 刷新当前数据并更新统计
      await loadData()
      // 通知 food-selector 页面刷新（使用自定义事件）
      window.dispatchEvent(new CustomEvent('restaurantDataUpdated'))
      sessionStorage.setItem('restaurant_data_updated', Date.now().toString())
      // 更新统计
      statsData.value.restaurants = restaurants.value.length
    } catch (error) {
      alert('删除失败: ' + error.message)
    }
  }
  showConfirm.value = true
}

// 删除评价
async function handleDeleteRating(item) {
  confirmTitle.value = '确认删除'
  confirmMessage.value = '确定要删除这条评价吗？'
  confirmAction.value = async () => {
    try {
      await deleteRating(item.id)
      showConfirm.value = false
      await loadData()
    } catch (error) {
      alert('删除失败: ' + error.message)
    }
  }
  showConfirm.value = true
}

// 批准申请
async function handleApproveApplication(item) {
  confirmTitle.value = '确认批准'
  confirmMessage.value = item.type === 'restaurant'
    ? `确定要批准餐馆「${item.name}」的申请吗？`
    : '确定要批准这条反馈吗？'
  confirmAction.value = async () => {
    try {
      await approveApplication(item.id)
      showConfirm.value = false
      await loadData()
    } catch (error) {
      alert('操作失败: ' + error.message)
    }
  }
  showConfirm.value = true
}

// 拒绝申请
async function handleRejectApplication(item) {
  confirmTitle.value = '确认拒绝'
  confirmMessage.value = item.type === 'restaurant'
    ? `确定要拒绝餐馆「${item.name}」的申请吗？`
    : '确定要拒绝这条反馈吗？'
  confirmAction.value = async () => {
    try {
      await rejectApplication(item.id)
      showConfirm.value = false
      await loadData()
    } catch (error) {
      alert('操作失败: ' + error.message)
    }
  }
  showConfirm.value = true
}

// 设置管理员
async function handleSetAdmin(item, isAdminVal) {
  confirmTitle.value = isAdminVal ? '设为管理员' : '取消管理员'
  confirmMessage.value = isAdminVal
    ? `确定要将用户「${item.username}」设为管理员吗？`
    : `确定要取消用户「${item.username}」的管理员权限吗？`
  confirmAction.value = async () => {
    try {
      await setUserAdmin(item.id, isAdminVal)
      showConfirm.value = false
      await loadData()
    } catch (error) {
      alert('操作失败: ' + error.message)
    }
  }
  showConfirm.value = true
}

// 获取状态标签类
function getStatusClass(status) {
  const classes = {
    pending: 'status-pending',
    approved: 'status-approved',
    rejected: 'status-rejected'
  }
  return classes[status] || 'status-default'
}

// 获取状态文本
function getStatusText(status) {
  const texts = {
    pending: '待审核',
    approved: '已批准',
    rejected: '已拒绝'
  }
  return texts[status] || status
}

// 获取评分星星
function getStars(score) {
  return '★'.repeat(score) + '☆'.repeat(5 - score)
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 统计数字 - 初始加载所有数据
const statsData = ref({
  restaurants: 0,
  ratings: 0,
  applications: 0,
  users: 0
})

// 加载所有统计数据
async function loadAllStats() {
  const [restaurantsData, ratingsData, applicationsData, profilesData] = await Promise.all([
    fetchAllRestaurantsAdmin(),
    fetchAllRatingsAdmin(),
    fetchApplications(),
    fetchAllProfiles()
  ])
  restaurants.value = restaurantsData
  ratings.value = ratingsData
  applications.value = applicationsData
  profiles.value = profilesData

  // 更新统计数字
  statsData.value = {
    restaurants: restaurantsData.length,
    ratings: ratingsData.length,
    applications: applicationsData.filter(a => a.status === 'pending').length,
    users: profilesData.length
  }

  // 存储到 sessionStorage 通知其他页面刷新
  sessionStorage.setItem('admin_data_updated', Date.now().toString())
}

// 导出数据（占位函数）
function exportData() {
  alert('导出功能开发中...')
}

// 初始化
onMounted(async () => {
  await loadAllStats()
})
</script>

<template>
  <div class="admin-container">
    <!-- 页面头部 -->
    <header class="admin-header">
      <div class="header-content">
        <div class="header-title-wrapper">
          <div class="header-title">
            <div class="title-icon">
              <i class="bi bi-speedometer2"></i>
            </div>
            <div class="title-text">
              <h1>管理后台</h1>
              <p class="title-subtitle">系统数据管理中心</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn-refresh" @click="loadAllStats" title="刷新数据">
              <i class="bi bi-arrow-clockwise"></i>
              <span>刷新</span>
            </button>
          </div>
        </div>

        <div class="header-stats">
          <div class="stat-card" @click="switchTab('restaurants')" :class="{ 'stat-active': activeTab === 'restaurants' }">
            <div class="stat-icon-wrapper">
              <i class="bi bi-shop stat-icon"></i>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ statsData.restaurants }}</span>
              <span class="stat-label">餐馆</span>
            </div>
            <div class="stat-trend">
              <i class="bi bi-graph-up-arrow"></i>
            </div>
          </div>
          <div class="stat-card" @click="switchTab('ratings')" :class="{ 'stat-active': activeTab === 'ratings' }">
            <div class="stat-icon-wrapper">
              <i class="bi bi-star stat-icon"></i>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ statsData.ratings }}</span>
              <span class="stat-label">评价</span>
            </div>
            <div class="stat-trend">
              <i class="bi bi-graph-up-arrow"></i>
            </div>
          </div>
          <div class="stat-card stat-highlight" @click="switchTab('applications')" :class="{ 'stat-active': activeTab === 'applications' }">
            <div class="stat-icon-wrapper">
              <i class="bi bi-file-earmark-check stat-icon"></i>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ statsData.applications }}</span>
              <span class="stat-label">待审核</span>
            </div>
            <div class="stat-trend">
              <i class="bi bi-clock"></i>
            </div>
          </div>
          <div class="stat-card" @click="switchTab('users')" :class="{ 'stat-active': activeTab === 'users' }">
            <div class="stat-icon-wrapper">
              <i class="bi bi-people stat-icon"></i>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ statsData.users }}</span>
              <span class="stat-label">用户</span>
            </div>
            <div class="stat-trend">
              <i class="bi bi-person-plus"></i>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="admin-main">
      <!-- 标签页导航 -->
      <nav class="tab-navigation">
        <div class="tab-scroll-container">
          <div class="tab-list">
            <button
              v-for="(tab, index) in tabs"
              :key="tab.id"
              class="tab-item"
              :class="{ active: activeTab === tab.id }"
              @click="switchTab(tab.id)"
              :style="{ '--delay': index * 0.05 + 's' }"
            >
              <div class="tab-icon-wrapper">
                <i :class="tab.icon"></i>
              </div>
              <span class="tab-label">{{ tab.label }}</span>
              <span v-if="tab.id === 'applications' && statsData.applications > 0" class="tab-badge">
                {{ statsData.applications }}
              </span>
              <div class="tab-indicator"></div>
            </button>
          </div>
        </div>
        <div class="tab-decoration">
          <div class="decoration-line"></div>
          <div class="decoration-dots"></div>
        </div>
      </nav>

      <!-- 工具栏 -->
      <div class="toolbar-section">
        <div class="toolbar-left">
          <div class="search-box">
            <i class="bi bi-search search-icon"></i>
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索数据..."
              class="search-input"
            />
            <div class="search-underline"></div>
          </div>
          <div class="filter-group">
            <select v-if="activeTab === 'applications'" v-model="filterStatus" class="filter-select">
              <option value="">全部状态</option>
              <option value="pending">待审核</option>
              <option value="approved">已批准</option>
              <option value="rejected">已拒绝</option>
            </select>
            <select v-if="activeTab === 'ratings'" v-model="filterRestaurant" class="filter-select">
              <option value="">全部餐馆</option>
              <option v-for="r in restaurantOptions" :key="r.id" :value="r.id">
                {{ r.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="toolbar-right">
          <div class="action-buttons">
            <button v-if="activeTab === 'restaurants'" class="btn-add" @click="openAddModal">
              <i class="bi bi-plus-lg btn-add-icon"></i>
              <span>新增餐馆</span>
              <div class="btn-add-ripple"></div>
            </button>
            <button class="btn-export" @click="exportData">
              <i class="bi bi-download"></i>
              <span>导出</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 餐馆管理 -->
      <div v-else-if="activeTab === 'restaurants'" class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>名称</th>
              <th>标签</th>
              <th>位置</th>
              <th>价格</th>
              <th>距离</th>
              <th>评级</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredRestaurants" :key="item.id" class="table-row">
              <td class="cell-id">{{ item.id }}</td>
              <td class="cell-name">{{ item.name }}</td>
              <td class="cell-tags">
                <span v-for="tag in item.tags" :key="tag" class="tag-pill">{{ tag }}</span>
              </td>
              <td>{{ item.location }}</td>
              <td>{{ item.price }}</td>
              <td>{{ item.distance }}</td>
              <td>
                <span :class="['rating-badge', item.rating_class]">
                  {{ item.rating_label }}
                </span>
              </td>
              <td class="cell-actions">
                <button class="btn-action btn-edit" @click="openEditModal(item)" title="编辑">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn-action btn-delete" @click="handleDeleteRestaurant(item)" title="删除">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredRestaurants.length === 0" class="empty-state">
          <i class="bi bi-inbox"></i>
          <p>暂无数据</p>
        </div>
      </div>

      <!-- 评价管理 -->
      <div v-else-if="activeTab === 'ratings'" class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>评价人</th>
              <th>餐馆</th>
              <th>菜品</th>
              <th>评分</th>
              <th>评价内容</th>
              <th>时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredRatings" :key="item.id" class="table-row">
              <td class="cell-id">{{ item.id }}</td>
              <td>{{ item.profiles?.username || '未知' }}</td>
              <td>{{ item.restaurants?.name || '未知' }}</td>
              <td>{{ item.dish_name || '-' }}</td>
              <td class="cell-stars">{{ getStars(item.score) }}</td>
              <td class="cell-comment" :title="item.comment">
                {{ item.comment || '-' }}
              </td>
              <td class="cell-time">{{ formatDate(item.created_at) }}</td>
              <td class="cell-actions">
                <button class="btn-action btn-delete" @click="handleDeleteRating(item)" title="删除">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredRatings.length === 0" class="empty-state">
          <i class="bi bi-inbox"></i>
          <p>暂无数据</p>
        </div>
      </div>

      <!-- 菜品管理 -->
      <div v-else-if="activeTab === 'dishes'" class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>菜品名称</th>
              <th>所属餐馆</th>
              <th>平均评分</th>
              <th>评价次数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in dishes" :key="idx" class="table-row">
              <td class="cell-name">{{ item.dish_name }}</td>
              <td>{{ item.restaurant_name }}</td>
              <td class="cell-stars">
                <span class="stars">{{ getStars(Math.round(item.avg_score)) }}</span>
                <span class="avg-score">({{ item.avg_score }})</span>
              </td>
              <td><span class="count-badge">{{ item.count }}</span></td>
            </tr>
          </tbody>
        </table>
        <div v-if="dishes.length === 0" class="empty-state">
          <i class="bi bi-inbox"></i>
          <p>暂无数据</p>
        </div>
      </div>

      <!-- 申请审核 -->
      <div v-else-if="activeTab === 'applications'" class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>类型</th>
              <th>内容</th>
              <th>申请人</th>
              <th>状态</th>
              <th>时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredApplications" :key="item.id" class="table-row">
              <td class="cell-id">{{ item.id }}</td>
              <td>
                <span class="type-badge restaurant">餐馆申请</span>
              </td>
              <td class="cell-content" :title="item.name">
                {{ item.name }}
              </td>
              <td>{{ item.profiles?.username || '未知' }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(item.status)]">
                  {{ getStatusText(item.status) }}
                </span>
              </td>
              <td class="cell-time">{{ formatDate(item.created_at) }}</td>
              <td class="cell-actions">
                <template v-if="item.status === 'pending'">
                  <button class="btn-action btn-approve" @click="handleApproveApplication(item)" title="批准">
                    <i class="bi bi-check-lg"></i>
                  </button>
                  <button class="btn-action btn-reject" @click="handleRejectApplication(item)" title="拒绝">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </template>
                <span v-else class="text-muted">-</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredApplications.length === 0" class="empty-state">
          <i class="bi bi-inbox"></i>
          <p>暂无数据</p>
        </div>
      </div>

      <!-- 用户管理 -->
      <div v-else-if="activeTab === 'users'" class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>注册时间</th>
              <th>收藏</th>
              <th>评价</th>
              <th>角色</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredProfiles" :key="item.id" class="table-row">
              <td class="cell-id">{{ item.id.slice(0, 8) }}...</td>
              <td>{{ item.username || '未设置' }}</td>
              <td class="cell-time">{{ formatDate(item.created_at) }}</td>
              <td><span class="count-badge">{{ item.favorites_count }}</span></td>
              <td><span class="count-badge">{{ item.ratings_count }}</span></td>
              <td>
                <span :class="['role-badge', item.is_admin ? 'admin' : 'user']">
                  {{ item.is_admin ? '管理员' : '用户' }}
                </span>
              </td>
              <td class="cell-actions">
                <button
                  v-if="!item.is_admin"
                  class="btn-action btn-set-admin"
                  @click="handleSetAdmin(item, true)"
                >
                  设为管理
                </button>
                <button
                  v-else
                  class="btn-action btn-remove-admin"
                  @click="handleSetAdmin(item, false)"
                >
                  取消管理
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredProfiles.length === 0" class="empty-state">
          <i class="bi bi-inbox"></i>
          <p>暂无数据</p>
        </div>
      </div>
    </main>

    <!-- 餐馆编辑弹窗 -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-panel">
          <div class="modal-header">
            <div class="modal-header-background">
              <div class="modal-header-pattern"></div>
            </div>
            <div class="modal-header-content">
              <h2 class="modal-title">
                <i class="bi bi-shop modal-title-icon"></i>
                <span>{{ modalMode === 'add' ? '新增餐馆' : '编辑餐馆' }}</span>
              </h2>
              <p class="modal-subtitle">{{ modalMode === 'add' ? '添加新的餐馆信息到系统' : '修改现有餐馆的信息' }}</p>
            </div>
            <button class="btn-close-modal" @click="showModal = false">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-section">
              <div class="form-section-header">
                <h3 class="form-section-title">基本信息</h3>
                <div class="form-section-divider"></div>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">
                    <span>名称</span>
                    <span class="required">*</span>
                  </label>
                  <div class="input-wrapper">
                    <i class="bi bi-shop input-icon"></i>
                    <input v-model="formData.name" type="text" placeholder="输入餐馆名称" class="form-input" />
                    <div class="input-underline"></div>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">位置</label>
                  <div class="input-wrapper">
                    <i class="bi bi-geo-alt input-icon"></i>
                    <input v-model="formData.location" type="text" placeholder="如: 校内、南门" class="form-input" />
                    <div class="input-underline"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-section">
              <div class="form-section-header">
                <h3 class="form-section-title">分类与标签</h3>
                <div class="form-section-divider"></div>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">标签</label>
                  <div class="input-wrapper">
                    <i class="bi bi-tags input-icon"></i>
                    <input v-model="formData.tags" type="text" placeholder="逗号分隔，如: 中餐, 快餐" class="form-input" />
                    <div class="input-underline"></div>
                  </div>
                  <p class="form-hint">多个标签用逗号分隔</p>
                </div>
                <div class="form-group">
                  <label class="form-label">特色标签</label>
                  <div class="input-wrapper">
                    <i class="bi bi-star input-icon"></i>
                    <input v-model="formData.features" type="text" placeholder="逗号分隔，如: 实惠, 好吃" class="form-input" />
                    <div class="input-underline"></div>
                  </div>
                  <p class="form-hint">描述餐馆的特色</p>
                </div>
              </div>
            </div>

            <div class="form-section">
              <div class="form-section-header">
                <h3 class="form-section-title">详细信息</h3>
                <div class="form-section-divider"></div>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">价格范围</label>
                  <div class="input-wrapper">
                    <i class="bi bi-currency-dollar input-icon"></i>
                    <input v-model="formData.price" type="text" placeholder="如: ¥15-25" class="form-input" />
                    <div class="input-underline"></div>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">距离</label>
                  <div class="input-wrapper">
                    <i class="bi bi-clock-history input-icon"></i>
                    <input v-model="formData.distance" type="text" placeholder="如: 5分钟" class="form-input" />
                    <div class="input-underline"></div>
                  </div>
                </div>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">评级标签</label>
                  <div class="input-wrapper">
                    <i class="bi bi-award input-icon"></i>
                    <input v-model="formData.rating_label" type="text" placeholder="如: 夯, 人上人" class="form-input" />
                    <div class="input-underline"></div>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">评级样式</label>
                  <div class="select-wrapper">
                    <i class="bi bi-palette input-icon"></i>
                    <select v-model="formData.rating_class" class="form-select">
                      <option value="npc">NPC</option>
                      <option value="hot">夯</option>
                      <option value="top-tier">人上人</option>
                    </select>
                    <div class="select-arrow">
                      <i class="bi bi-chevron-down"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-section">
              <div class="form-section-header">
                <h3 class="form-section-title">描述信息</h3>
                <div class="form-section-divider"></div>
              </div>
              <div class="form-grid">
                <div class="form-group form-group-full">
                  <label class="form-label">简介</label>
                  <div class="textarea-wrapper">
                    <textarea v-model="formData.description" rows="3" placeholder="简短描述餐馆特色..." class="form-textarea"></textarea>
                    <div class="textarea-underline"></div>
                  </div>
                  <p class="form-hint">简洁明了的介绍，显示在列表页</p>
                </div>
                <div class="form-group form-group-full">
                  <label class="form-label">详情</label>
                  <div class="textarea-wrapper">
                    <textarea v-model="formData.detail" rows="4" placeholder="详细介绍餐馆环境、菜品等..." class="form-textarea"></textarea>
                    <div class="textarea-underline"></div>
                  </div>
                  <p class="form-hint">详细的介绍，显示在详情页</p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <div class="modal-footer-content">
              <button class="btn-cancel" @click="showModal = false">
                <i class="bi bi-x-lg"></i>
                <span>取消</span>
              </button>
              <button class="btn-save" @click="saveRestaurant">
                <i class="bi bi-check-lg"></i>
                <span>保存更改</span>
                <div class="btn-ripple"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 确认弹窗 -->
    <Teleport to="body">
      <div v-if="showConfirm" class="modal-overlay" @click.self="showConfirm = false">
        <div class="modal-panel modal-confirm">
          <div class="modal-header">
            <div class="modal-header-background"></div>
            <div class="modal-icon-wrapper">
              <i class="bi bi-exclamation-triangle modal-icon"></i>
            </div>
            <h2 class="modal-title">{{ confirmTitle }}</h2>
            <button class="btn-close-modal" @click="showConfirm = false">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body">
            <p class="confirm-message">{{ confirmMessage }}</p>
            <div class="confirm-warning">
              <i class="bi bi-info-circle"></i>
              <span>此操作不可撤销，请谨慎操作。</span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showConfirm = false">
              <i class="bi bi-x-lg"></i>
              <span>取消</span>
            </button>
            <button class="btn-danger" @click="confirmAction">
              <i class="bi bi-check-lg"></i>
              <span>确认</span>
              <div class="btn-ripple"></div>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* === 设计变量 === */
.admin-container {
  /* 核心色彩 - 保持原有暖色调 */
  --color-bg: #FAF8F5;
  --color-surface: #FFFFFF;
  --color-surface-elevated: #FFF5F0;
  --color-surface-hover: #FEF0EC;
  --color-border: #E8E4DF;
  --color-border-light: #F0EBE6;
  --color-text: #2C2C2C;
  --color-text-secondary: #5A5A5A;
  --color-text-muted: #9A9A9A;
  --color-accent: #E85D4B;
  --color-accent-light: rgba(232, 93, 75, 0.08);
  --color-accent-hover: #FF8B75;
  --color-success: #5B9E6B;
  --color-success-light: rgba(91, 158, 107, 0.12);
  --color-danger: #DC3545;
  --color-danger-light: rgba(220, 53, 69, 0.1);
  --color-warning: #E8A85D;
  --color-warning-light: rgba(232, 168, 93, 0.12);
  --color-info: #6B9EC8;
  --color-info-light: rgba(107, 158, 200, 0.12);

  /* 圆角系统 */
  --radius-xs: 6px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;

  /* 阴影层次 */
  --shadow-xs: 0 1px 3px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
  --shadow-glow: 0 4px 20px rgba(232, 93, 75, 0.2);

  /* 过渡 */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.25s ease;
  --transition-smooth: 0.35s cubic-bezier(0.4, 0, 0.2, 1);

  /* 字体 */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Lora', -apple-system, serif;
}

/* === 主容器 === */
.admin-container {
  min-height: 100vh;
  background: var(--color-bg);
  background-image:
    radial-gradient(ellipse at 20% 0%, rgba(232, 93, 75, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 100%, rgba(107, 158, 200, 0.03) 0%, transparent 50%);
  padding-top: 60px;
}

/* === 头部 === */
.admin-header {
  background: var(--color-surface);
  padding: 1.75rem 2rem;
  border-bottom: 1px solid var(--color-border-light);
  position: relative;
}

.admin-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
  opacity: 0.3;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1.125rem;
}

.title-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-accent) 0%, #D64A35 100%);
  border-radius: var(--radius-lg);
  font-size: 1.375rem;
  color: #fff;
  box-shadow: var(--shadow-glow);
  position: relative;
  overflow: hidden;
}

.title-icon::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 40%,
    rgba(255,255,255,0.15) 50%,
    transparent 60%
  );
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) rotate(45deg); }
  100% { transform: translateX(100%) rotate(45deg); }
}

.title-text h1 {
  font-family: var(--font-display);
  font-size: 1.625rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  letter-spacing: -0.02em;
}

.title-text p {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin: 0.25rem 0 0;
  font-weight: 400;
}

.header-stats {
  display: flex;
  gap: 0.5rem;
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: 0.875rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
  transition: all var(--transition-smooth);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-accent);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card.stat-highlight {
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%);
  border-color: var(--color-warning-light);
}

.stat-card.stat-highlight::before {
  background: var(--color-warning);
  opacity: 1;
}

.stat-value {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--color-text);
  font-family: var(--font-display);
}

.stat-label {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 0.125rem;
}

/* === 主内容区 === */
.admin-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 2rem 2rem;
}

/* === 标签导航 === */
.tab-navigation {
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border-light);
  position: relative;
}

.tab-list {
  display: flex;
  gap: 0.25rem;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.375rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  margin-bottom: -1px;
  position: relative;
}

.tab-item i {
  font-size: 1.0625rem;
  opacity: 0.8;
  transition: opacity var(--transition-fast);
}

.tab-item:hover {
  color: var(--color-accent);
}

.tab-item:hover i {
  opacity: 1;
}

.tab-item.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

.tab-item.active i {
  opacity: 1;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 2px;
  background: var(--color-accent);
  border-radius: 1px;
}

.tab-badge {
  background: var(--color-danger);
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  margin-left: 0.25rem;
  min-width: 18px;
  text-align: center;
}

.tab-item.active .tab-badge {
  background: var(--color-accent);
}

/* === 工具栏 === */
.toolbar-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: 0.625rem 1rem;
  flex: 1;
  max-width: 380px;
  transition: all var(--transition-normal);
}

.search-box:focus-within {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-light), var(--shadow-sm);
}

.search-box i {
  color: var(--color-text-muted);
  font-size: 0.9375rem;
}

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--color-text);
  font-size: 0.875rem;
  outline: none;
}

.search-box input::placeholder {
  color: var(--color-text-muted);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.filter-select {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  outline: none;
  transition: all var(--transition-fast);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 16 16'%3E%3Cpath fill='%238A8A8A' d='M4.5 5.5l3.5 3.5 3.5-3.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.625rem center;
}

.filter-select:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-light);
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.125rem;
  background: var(--color-accent);
  border: none;
  border-radius: var(--radius-md);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.btn-add:hover {
  background: var(--color-accent-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}

/* === 数据表格 === */
.data-table-container {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: linear-gradient(180deg, var(--color-surface-elevated) 0%, #FEF9F7 100%);
  padding: 0.9375rem 1rem;
  text-align: left;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid var(--color-border-light);
  white-space: nowrap;
}

.data-table td {
  padding: 0.9375rem 1rem;
  color: var(--color-text);
  font-size: 0.84375rem;
  border-bottom: 1px solid var(--color-border-light);
}

.table-row {
  transition: background var(--transition-fast);
  animation: rowFadeIn 0.3s ease forwards;
  opacity: 0;
}

.table-row:hover {
  background: var(--color-surface-hover);
}

.table-row:last-child td {
  border-bottom: none;
}

.table-row:nth-child(even) {
  background: rgba(250, 248, 245, 0.5);
}

.table-row:nth-child(even):hover {
  background: var(--color-surface-hover);
}

.cell-id {
  color: var(--color-text-muted);
  font-family: 'SF Mono', 'Monaco', monospace;
  font-size: 0.71875rem;
  letter-spacing: -0.02em;
}

.cell-name {
  font-weight: 600;
}

.cell-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.tag-pill {
  background: var(--color-surface-elevated);
  color: var(--color-text-secondary);
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.6875rem;
  font-weight: 500;
}

.rating-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-xs);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.rating-badge.top-tier {
  background: var(--color-success-light);
  color: var(--color-success);
}

.rating-badge.hot {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.rating-badge.npc {
  background: var(--color-surface-elevated);
  color: var(--color-text-muted);
}

.cell-stars {
  color: var(--color-accent);
  letter-spacing: 0.05em;
}

.avg-score {
  color: var(--color-text-muted);
  margin-left: 0.375rem;
  font-size: 0.75rem;
}

.cell-comment {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-secondary);
}

.cell-time {
  color: var(--color-text-muted);
  font-size: 0.75rem;
}

.cell-content {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-actions {
  display: flex;
  gap: 0.375rem;
}

.btn-action {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-edit {
  background: var(--color-surface-elevated);
  color: var(--color-info);
}

.btn-edit:hover {
  background: var(--color-info);
  color: #fff;
  transform: scale(1.05);
}

.btn-delete {
  background: var(--color-surface-elevated);
  color: var(--color-danger);
}

.btn-delete:hover {
  background: var(--color-danger);
  color: #fff;
  transform: scale(1.05);
}

.btn-approve {
  background: var(--color-success-light);
  color: var(--color-success);
}

.btn-approve:hover {
  background: var(--color-success);
  color: #fff;
  transform: scale(1.05);
}

.btn-reject {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.btn-reject:hover {
  background: var(--color-danger);
  color: #fff;
  transform: scale(1.05);
}

.btn-set-admin {
  width: auto;
  padding: 0.3125rem 0.75rem;
  background: var(--color-danger);
  color: #fff;
  font-size: 0.6875rem;
  font-weight: 500;
  border-radius: var(--radius-xs);
}

.btn-set-admin:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.btn-remove-admin {
  width: auto;
  padding: 0.3125rem 0.75rem;
  background: var(--color-surface-elevated);
  color: var(--color-text-muted);
  font-size: 0.6875rem;
  font-weight: 500;
  border-radius: var(--radius-xs);
}

.btn-remove-admin:hover {
  background: var(--color-border);
  color: var(--color-text);
}

/* === 类型和状态徽章 === */
.type-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-xs);
  font-size: 0.6875rem;
  font-weight: 600;
}

.type-badge.restaurant {
  background: var(--color-info-light);
  color: var(--color-info);
}

.type-badge.feedback {
  background: rgba(168, 85, 247, 0.1);
  color: #9333ea;
}

.status-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-xs);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.status-pending {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.status-approved {
  background: var(--color-success-light);
  color: var(--color-success);
}

.status-rejected {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.role-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-xs);
  font-size: 0.6875rem;
  font-weight: 600;
}

.role-badge.admin {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.role-badge.user {
  background: var(--color-surface-elevated);
  color: var(--color-text-muted);
}

.count-badge {
  background: var(--color-surface-elevated);
  color: var(--color-text-secondary);
  padding: 0.2rem 0.4rem;
  border-radius: var(--radius-xs);
  font-size: 0.71875rem;
  font-weight: 600;
}

/* === 空状态 === */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--color-text-muted);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.4;
  color: var(--color-text-muted);
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
}

/* === 加载状态 === */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--color-text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border-light);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rowFadeIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* === 弹窗样式 === */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(30, 28, 26, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-panel {
  background: #FFFFFF;
  border-radius: var(--radius-2xl);
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(0, 0, 0, 0.03);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-panel.modal-confirm {
  max-width: 380px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border-light);
  background: linear-gradient(180deg, var(--color-surface) 0%, rgba(250, 248, 245, 0.5) 100%);
}

.modal-header h2 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  letter-spacing: -0.01em;
}

.btn-close-modal {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.btn-close-modal:hover {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  max-height: 65vh;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--color-border-light);
  background: rgba(250, 248, 245, 0.5);
}

.confirm-message {
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0;
}

/* === 表单样式 === */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group-full {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.71875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-group .required {
  color: var(--color-danger);
}

.form-group input,
.form-group select,
.form-group textarea {
  background: #FAFAFA;
  border: 1px solid #E0DDD8;
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  color: var(--color-text);
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
  transition: all var(--transition-fast);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
}

.form-group input:hover,
.form-group select:hover,
.form-group textarea:hover {
  border-color: #C8C4BE;
  background: #FFFFFF;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-light), var(--shadow-sm);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--color-text-muted);
}

.form-group select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 16 16'%3E%3Cpath fill='%238A8A8A' d='M4.5 5.5l3.5 3.5 3.5-3.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.25rem;
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
  line-height: 1.5;
}

.btn-cancel {
  padding: 0.625rem 1.25rem;
  background: linear-gradient(180deg, #FFFFFF 0%, #F5F3F0 100%);
  border: 1px solid #D8D4CF;
  border-radius: var(--radius-md);
  color: #5A5A5A;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-cancel:hover {
  background: linear-gradient(180deg, #FFFFFF 0%, #E8E5E0 100%);
  border-color: #C0BCB6;
  color: #2C2C2C;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.btn-save {
  padding: 0.625rem 1.25rem;
  background: linear-gradient(180deg, #FF7A68 0%, #E85D4B 100%);
  border: none;
  border-radius: var(--radius-md);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 2px 8px rgba(232, 93, 75, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.btn-save:hover {
  background: linear-gradient(180deg, #FF8B75 0%, #FF7A68 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(232, 93, 75, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.btn-save:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(232, 93, 75, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.btn-danger {
  padding: 0.625rem 1.25rem;
  background: linear-gradient(180deg, #E74C5A 0%, #DC3545 100%);
  border: none;
  border-radius: var(--radius-md);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.btn-danger:hover {
  background: linear-gradient(180deg, #EF5B67 0%, #E74C5A 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.btn-danger:hover {
  background: #c82333;
  transform: translateY(-1px);
}

/* === 新增头部样式 === */
.header-title-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--color-accent-light);
  color: var(--color-accent);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-refresh:hover {
  background: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);
  transform: translateY(-1px);
  box-shadow: var(--shadow-glow);
}

.btn-refresh:active {
  transform: translateY(0);
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-elevated);
  border-radius: var(--radius-md);
  font-size: 1.25rem;
  color: var(--color-accent);
  transition: all var(--transition-normal);
}

.stat-content {
  flex: 1;
}

.stat-trend {
  font-size: 0.875rem;
  color: var(--color-success);
  opacity: 0.7;
}

.stat-card.stat-highlight .stat-icon-wrapper {
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%);
  color: #fff;
}

.stat-card.stat-active {
  border-color: var(--color-accent);
  background: var(--color-accent-light);
}

.stat-card.stat-active .stat-icon-wrapper {
  background: var(--color-accent);
  color: #fff;
}

/* === 新增标签页样式 === */
.tab-scroll-container {
  position: relative;
  overflow: hidden;
}

.tab-list {
  display: flex;
  position: relative;
  z-index: 1;
}

.tab-icon-wrapper {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-elevated);
  border-radius: var(--radius-md);
  margin-right: 0.75rem;
  transition: all var(--transition-normal);
}

.tab-item.active .tab-icon-wrapper {
  background: var(--color-accent);
  color: #fff;
  transform: scale(1.1);
}

.tab-label {
  font-weight: 500;
  transition: color var(--transition-normal);
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: var(--color-accent);
  border-radius: 3px 3px 0 0;
  width: 100%;
  transform: scaleX(0);
  transition: transform var(--transition-smooth);
  transform-origin: left center;
}

.tab-item.active .tab-indicator {
  transform: scaleX(1);
}

.tab-decoration {
  position: relative;
  height: 1px;
  margin-top: 0.5rem;
}

.decoration-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-border), transparent);
}

.decoration-dots {
  position: absolute;
  top: -2px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
}

.decoration-dots::before,
.decoration-dots::after {
  content: '';
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-accent);
  opacity: 0.5;
}

/* === 新增工具栏样式 === */
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.search-input {
  border: none;
  background: transparent;
  font-size: 0.9375rem;
  color: var(--color-text);
  width: 100%;
  padding: 0.5rem 0;
}

.search-input:focus {
  outline: none;
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.search-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-border);
  transform: scaleX(0);
  transition: transform var(--transition-normal);
  transform-origin: left center;
}

.search-box:focus-within .search-underline {
  transform: scaleX(1);
  background: var(--color-accent);
}

.filter-group {
  display: flex;
  gap: 0.75rem;
}

.filter-select {
  padding: 0.5rem 1rem 0.5rem 2rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%235A5A5A' viewBox='0 0 16 16'%3E%3Cpath d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 12px;
}

.filter-select:hover {
  border-color: var(--color-accent);
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-light);
}

.btn-add {
  position: relative;
  overflow: hidden;
}

.btn-add-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  to {
    transform: translate(-50%, -50%) scale(40);
    opacity: 0;
  }
}

.btn-add-icon {
  font-size: 1.125rem;
  transition: transform var(--transition-normal);
}

.btn-add:hover .btn-add-icon {
  transform: rotate(90deg);
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-export:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-accent);
  color: var(--color-accent);
  transform: translateY(-1px);
}

/* === 新增模态框样式 === */
.modal-header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(135deg, var(--color-accent) 0%, #D64A35 100%);
  opacity: 0.1;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.modal-header-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.3;
}

.modal-header-content {
  position: relative;
  z-index: 1;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-display);
  font-size: 1.625rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.25rem;
}

.modal-title-icon {
  font-size: 1.75rem;
  color: var(--color-accent);
}

.modal-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section-header {
  margin-bottom: 1.25rem;
}

.form-section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-section-title::before {
  content: '';
  width: 4px;
  height: 1rem;
  background: var(--color-accent);
  border-radius: 2px;
}

.form-section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-border), transparent);
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.required {
  color: var(--color-danger);
  font-size: 0.75rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--color-text-muted);
  font-size: 1rem;
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.9375rem;
  transition: all var(--transition-normal);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-light);
}

.input-underline {
  position: absolute;
  bottom: -1px;
  left: 2.5rem;
  right: 0;
  height: 2px;
  background: var(--color-accent);
  transform: scaleX(0);
  transition: transform var(--transition-normal);
  transform-origin: left center;
}

.form-input:focus ~ .input-underline {
  transform: scaleX(1);
}

.form-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin: 0.25rem 0 0;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-select {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 2.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.9375rem;
  cursor: pointer;
  appearance: none;
  transition: all var(--transition-normal);
}

.form-select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-light);
}

.select-arrow {
  position: absolute;
  right: 0.75rem;
  color: var(--color-text-muted);
  pointer-events: none;
}

.textarea-wrapper {
  position: relative;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.9375rem;
  resize: vertical;
  transition: all var(--transition-normal);
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-light);
}

.textarea-underline {
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-accent);
  transform: scaleX(0);
  transition: transform var(--transition-normal);
  transform-origin: left center;
}

.form-textarea:focus ~ .textarea-underline {
  transform: scaleX(1);
}

.modal-footer-content {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  width: 100%;
}

.btn-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  animation: ripple 0.6s ease-out;
}

/* === 确认弹窗样式 === */
.modal-confirm .modal-header-background {
  background: linear-gradient(135deg, var(--color-danger) 0%, #C82333 100%);
  opacity: 0.1;
}

.modal-icon-wrapper {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-danger-light);
  border-radius: 50%;
  margin: 0 auto 1rem;
}

.modal-icon {
  font-size: 2rem;
  color: var(--color-danger);
}

.confirm-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--color-warning-light);
  border-radius: var(--radius-md);
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--color-warning);
}

.confirm-warning i {
  font-size: 1.125rem;
}

/* === 响应式 === */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-stats {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .admin-header {
    padding: 1rem 1.25rem;
  }

  .admin-main {
    padding: 1rem 1.25rem 1.5rem;
  }

  .header-stats {
    flex-wrap: wrap;
  }

  .stat-card {
    flex: 1;
    min-width: calc(33% - 0.5rem);
  }

  .tab-list {
    overflow-x: auto;
    width: 100%;
  }

  .tab-item {
    white-space: nowrap;
    padding: 0.625rem 1rem;
  }

  .toolbar-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }

  .toolbar-actions {
    flex-wrap: wrap;
  }

  .data-table-container {
    overflow-x: auto;
  }

  .data-table {
    min-width: 600px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>