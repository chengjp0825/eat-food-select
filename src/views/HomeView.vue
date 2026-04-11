<template>
  <div class="home">
    <!-- 导航栏 -->
    <nav class="navbar navbar-expand-lg fixed-top">
      <div class="container d-flex align-items-center justify-content-between">
        <router-link to="/" class="navbar-brand">
          <span class="brand-icon">🍽️</span>
          <span class="brand-text">部落生存手册</span>
        </router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="toggler-line"></span>
          <span class="toggler-line"></span>
          <span class="toggler-line"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav d-flex gap-3 align-items-center">
            <li class="nav-item">
              <router-link to="/" class="nav-link router-link-active">首页</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/food-selector" class="nav-link">今天吃什么</router-link>
            </li>
            <li class="nav-item" v-if="isAdmin">
              <router-link to="/admin" class="nav-link">管理后台</router-link>
            </li>
          </ul>
        </div>

        <!-- 右侧用户信息 -->
        <div class="nav-user-info">
          <template v-if="isAuthenticated">
            <div class="user-status-badge status-logged-in">
              <span class="status-dot"></span>
            </div>
            <div class="user-avatar">
              <span class="avatar-icon">👤</span>
            </div>
            <div class="user-details">
              <span class="user-email">{{ profile?.username || userEmail }}</span>
            </div>
            <div class="user-actions">
              <button v-if="isAdmin" class="settings-btn" @click="$router.push('/admin')" title="管理后台">
                🛠️
              </button>
              <button v-if="isAdmin" class="settings-btn" title="近期申请">
                📋
              </button>
              <button v-if="!isAdmin" class="settings-btn" @click="showFeedbackModal = true" title="反馈建议">
                💬
              </button>
              <button class="settings-btn" @click="showSettingsModal = true" title="设置">
                ⚙️
              </button>
              <button class="logout-btn" @click="handleSignOut">
                退出
              </button>
            </div>
          </template>
          <template v-else>
            <router-link to="/auth" class="login-link">
              <span class="login-icon">🔑</span>
              登录/注册
            </router-link>
          </template>
        </div>
      </div>
    </nav>

    <!-- 主内容 -->
    <div class="main-content">
      <!-- 欢迎区域 -->
      <section class="hero-section">
        <div class="container">
          <div class="hero-content">
            <div class="hero-badge animate-fade-in-up">
              <span class="badge-icon">🧪</span>
              <span>仅限部落内部使用</span>
            </div>
            <h1 class="hero-title animate-fade-in-up" style="animation-delay: 0.1s;">
              告别选择困难<br><span class="text-accent">让代码决定午餐</span>
            </h1>
            <p class="hero-description animate-fade-in-up" style="animation-delay: 0.2s;">
              这是一个<span class="highlight">不知道中午吃什么</span>时的产物。<br>
              用转盘赌命，靠骰子定胜负，让玄学指导我们的胃。<br>
              <span class="vibe-tag">Built with vibe coding, 2026</span>
            </p>
            <div class="hero-actions animate-fade-in-up" style="animation-delay: 0.3s;">
              <router-link to="/food-selector" class="btn btn-primary btn-lg">
                🎰 开始今天的豪赌
              </router-link>
              <router-link to="/auth" class="btn btn-outline btn-lg" v-if="!isAuthenticated">
                加入组织
              </router-link>
            </div>
          </div>

          <div class="hero-stats animate-fade-in-up" style="animation-delay: 0.4s;">
            <div class="stat-item">
              <span class="stat-number">{{ restaurants.length }}</span>
              <span class="stat-label">收录餐厅</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">{{ totalRatings }}</span>
              <span class="stat-label">次"踩雷"</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">{{ totalFavorites }}</span>
              <span class="stat-label">次收藏</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 关于平台 -->
      <section class="about-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">这玩意儿能干啥</h2>
            <p class="section-subtitle">不是什么正经系统，但能跑</p>
          </div>
          <div class="about-grid">
            <div class="about-card" v-for="(feature, index) in features" :key="index" :style="{ animationDelay: `${index * 0.1}s` }">
              <div class="about-icon">{{ feature.icon }}</div>
              <h3 class="about-title">{{ feature.title }}</h3>
              <p class="about-text">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 分类筛选 -->
      <section class="category-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">浏览餐厅</h2>
            <p class="section-subtitle">按分类筛选你感兴趣的美食</p>
          </div>
          <div class="category-filters">
            <button
              v-for="(category, index) in categories"
              :key="category"
              class="category-filter"
              :class="{ active: selectedCategory === category }"
              @click="selectedCategory = category"
              :style="{ animationDelay: `${index * 0.05}s` }"
            >
              {{ category }}
            </button>
          </div>
        </div>
      </section>

      <!-- 餐厅列表 -->
      <section class="restaurants-section">
        <div class="container">
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>
          <div v-else-if="filteredRestaurants.length === 0" class="empty-state">
            <div class="empty-icon">🍜</div>
            <p>暂无餐厅，<router-link to="/restaurant/new">成为第一个分享者</router-link></p>
          </div>
          <div v-else class="restaurant-list">
            <article
              v-for="(restaurant, index) in filteredRestaurants"
              :key="restaurant.id"
              class="restaurant-card"
              :style="{ animationDelay: `${index * 0.08}s` }"
            >
              <div class="restaurant-main">
                <div class="restaurant-header">
                  <h3 class="restaurant-name">{{ restaurant.name }}</h3>
                  <div class="restaurant-rating" v-if="restaurant.avg_rating">
                    <span class="rating-stars">★</span>
                    <span class="rating-value">{{ restaurant.avg_rating.toFixed(1) }}</span>
                    <span class="rating-count">({{ restaurant.rating_count }}条)</span>
                  </div>
                </div>
                <p class="restaurant-description">{{ restaurant.description || '暂无描述' }}</p>
                <div class="restaurant-tags" v-if="restaurant.tags && restaurant.tags.length">
                  <span class="tag" v-for="tag in restaurant.tags" :key="tag">{{ tag }}</span>
                </div>
              </div>
              <div class="restaurant-meta">
                <div class="meta-item" v-if="restaurant.location">
                  <span class="meta-icon">📍</span>
                  <span class="meta-text">{{ restaurant.location }}</span>
                </div>
                <div class="meta-item" v-if="restaurant.price">
                  <span class="meta-icon">💰</span>
                  <span class="meta-text">{{ restaurant.price }}</span>
                </div>
                <div class="meta-item" v-if="restaurant.distance">
                  <span class="meta-icon">🚶</span>
                  <span class="meta-text">{{ restaurant.distance }}</span>
                </div>
              </div>
              <div class="restaurant-actions">
                <router-link
                  :to="{ name: 'restaurant-detail', params: { id: restaurant.id } }"
                  class="btn btn-outline btn-sm"
                >
                  查看详情
                </router-link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- 平台说明 -->
      <section class="info-section">
        <div class="container">
          <div class="info-grid">
            <div class="info-content">
              <h2 class="info-title">等等，你说这是用 AI 写的？</h2>
              <p class="info-text">
                是的，这个站的大部分代码是 AI 生成的。prompt 丢进去，代码吐出来。
                所以如果有什么 bug，那一定是 AI 的问题。
                <br><br>
                <span class="tech-stack">
                  <span class="tech-tag">Vue 3</span>
                  <span class="tech-tag">Supabase</span>
                  <span class="tech-tag">Vite</span>
                  <span class="tech-tag">Bootstrap</span>
                </span>
              </p>
              <div class="info-actions">
                <router-link to="/food-selector" class="btn btn-primary">
                  🎰 我要去赌命了
                </router-link>
                <router-link to="/restaurant/new" class="btn btn-outline">
                  我有餐厅要分享
                </router-link>
              </div>
            </div>
            <div class="info-decoration">
              <div class="code-block">
                <div class="code-line"><span class="code-comment">// AI: 写一个美食分享网站</span></div>
                <div class="code-line"><span class="code-keyword">const</span> site = {</div>
                <div class="code-line">  name: <span class="code-string">'今天吃什么'</span>,</div>
                <div class="code-line">  status: <span class="code-string">'能跑就行'</span>,</div>
                <div class="code-line">  bugs: <span class="code-number">Infinity</span></div>
                <div class="code-line">}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 更新弹窗 -->
    <UpdateModal
      ref="updateModalRef"
      v-model:show="showUpdateModal"
    />

    <!-- 反馈弹窗 -->
    <FeedbackModal
      v-model:show="showFeedbackModal"
    />

    <!-- 设置弹窗 -->
    <SettingsModal
      v-model:show="showSettingsModal"
      :profile="profile"
      :user-email="userEmail"
    />

    <!-- 页脚 -->
    <footer>
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h5>🍽️ 今天吃什么</h5>
            <p class="footer-description">一个用 AI 糊出来的选餐工具<br>如有雷同，那不是巧合</p>
          </div>
          <div class="footer-section">
            <h5>快速链接</h5>
            <ul class="footer-links">
              <li><router-link to="/">首页</router-link></li>
              <li><router-link to="/food-selector">今天吃什么</router-link></li>
              <li><router-link to="/restaurant/new">分享美食</router-link></li>
              <li><a href="#" @click.prevent="openUpdateModal">查看更新内容</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h5>关于</h5>
            <p class="footer-description">2026 年某次不知道吃什么的中午<br>用 vibe coding 的方式诞生了</p>
          </div>
        </div>
        <hr class="footer-divider">
        <p class="footer-copyright">© 2026 Built with vibe · 仅供娱乐 · 欢迎来踩</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { fetchRestaurants } from '../composables/useData'
import UpdateModal from '../components/UpdateModal.vue'
import FeedbackModal from '../components/FeedbackModal.vue'
import SettingsModal from '../components/SettingsModal.vue'

const { initialize, isAuthenticated, isAdmin, signOut, subscribeToAuth, userEmail, profile } = useAuth()

let unsubscribe = null

// 更新弹窗
const showUpdateModal = ref(false)
const updateModalRef = ref(null)

// 反馈弹窗
const showFeedbackModal = ref(false)

// 设置弹窗
const showSettingsModal = ref(false)

const handleSignOut = async () => {
  try {
    await signOut()
  } catch (error) {
    console.error('Sign out error:', error)
  }
}

// 分类数据
const categories = ['全部', '食堂', '中餐', '西餐', '快餐', '小吃', '饮品', '甜品', '烧烤', '其他']
const selectedCategory = ref('全部')

// 餐厅数据
const restaurants = ref([])
const loading = ref(true)

// 统计数据
const totalRatings = computed(() => {
  return restaurants.value.reduce((sum, r) => sum + (r.rating_count || 0), 0)
})
const totalFavorites = ref(0)

// 平台功能介绍
const features = [
  {
    icon: '🎰',
    title: '骰子决定一切',
    description: '选择困难时，让命运来选。转盘、抽卡、扔骰子——玄学选餐，拒绝理性'
  },
  {
    icon: '⭐',
    title: '真实的血泪史',
    description: '每一颗星都是踩过坑后的呐喊，每一条评价都是胃的抗议'
  },
  {
    icon: '📍',
    title: '距离不再是借口',
    description: '再也别说"太远了不想去"，本站帮你编好步行时间'
  },
  {
    icon: '💾',
    title: '你的私藏基地',
    description: '把私藏餐厅存起来，下次让它们来拯救你'
  }
]

// 过滤后的餐厅列表
const filteredRestaurants = computed(() => {
  if (selectedCategory.value === '全部') {
    return restaurants.value
  }
  return restaurants.value.filter(r => {
    if (!r.tags || !r.tags.length) return false
    return r.tags.some(tag => tag.includes(selectedCategory.value))
  })
})

// 加载餐厅数据
async function loadData() {
  loading.value = true
  try {
    const data = await fetchRestaurants()
    restaurants.value = data || []
  } catch (error) {
    console.error('Error loading restaurants:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await initialize()
  loadData()
  // 订阅 auth 状态变化，保持导航栏登录状态同步
  unsubscribe = subscribeToAuth(() => {
    // 状态变化时触发组件重新渲染
    initialize()
  })

  // 检查是否显示更新弹窗
  if (updateModalRef.value?.shouldShowModal()) {
    setTimeout(() => {
      showUpdateModal.value = true
    }, 800) // 延迟 800ms 显示，让用户先看到页面
  }
})

// 手动打开更新弹窗（用户点击"查看更新内容"）
function openUpdateModal() {
  updateModalRef.value?.showModalManually()
}

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<style scoped>
/* === 主容器 === */
.home {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

/* === 导航栏用户信息 === */
.nav-user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-user-info .user-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.nav-user-info .status-logged-in {
  background: rgba(107, 208, 157, 0.1);
  color: var(--color-success);
  border: 1px solid rgba(107, 208, 157, 0.2);
}

.nav-user-info .status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 6px rgba(107, 208, 157, 0.5);
}

.nav-user-info .user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-user-info .avatar-icon {
  font-size: 16px;
}

.nav-user-info .user-details {
  display: flex;
  flex-direction: column;
}

.nav-user-info .user-email {
  font-size: 12px;
  color: var(--color-text-secondary);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-user-info .user-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.nav-user-info .settings-btn {
  padding: 4px 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  border-radius: 4px;
}

.nav-user-info .settings-btn:hover {
  background: rgba(var(--color-accent-primary), 0.1);
  transform: scale(1.1);
}

.nav-user-info .logout-btn {
  padding: 4px 10px;
  background: var(--border-color);
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-user-info .logout-btn:hover {
  background: rgba(var(--color-accent-primary), 0.1);
  color: var(--color-accent-primary);
}

.nav-user-info .login-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary));
  color: var(--color-text-light);
  text-decoration: none;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-user-info .login-link:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-accent);
  color: var(--color-text-light);
}

/* 响应式：移动端隐藏用户信息 */
@media (max-width: 991px) {
  .nav-user-info {
    display: none;
  }
}

/* === 欢迎区域 === */
.hero-section {
  padding: calc(var(--space-2xl) + 60px) 0 var(--space-xl);
  background: linear-gradient(180deg, var(--color-bg-accent) 0%, var(--color-bg-primary) 100%);
}

.hero-content {
  text-align: center;
  max-width: 700px;
  margin: 0 auto var(--space-xl);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background-color: var(--color-bg-accent);
  border: 1px dashed var(--color-accent-primary);
  border-radius: 50px;
  font-size: 0.8125rem;
  color: var(--color-accent-primary);
  margin-bottom: var(--space-lg);
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}

.badge-icon {
  font-size: 1rem;
}

.hero-title {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 700;
  line-height: 1.15;
  margin-bottom: var(--space-xl);
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}

.hero-description {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  line-height: 1.9;
  margin-bottom: var(--space-xl);
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}

.hero-description .highlight {
  color: var(--color-accent-primary);
  font-weight: 600;
}

.vibe-tag {
  display: inline-block;
  margin-top: var(--space-md);
  padding: var(--space-xs) var(--space-md);
  background-color: var(--color-bg-secondary);
  border-radius: 4px;
  font-size: 0.75rem;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--color-text-muted);
  letter-spacing: 0.02em;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-lg);
  flex-wrap: wrap;
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}

.hero-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-xl);
  padding: var(--space-lg);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  max-width: 500px;
  margin: 0 auto;
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-accent-primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background-color: var(--border-color);
}

/* === 关于平台 === */
.about-section {
  padding: var(--space-2xl) 0;
}

.about-section .section-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.about-section .section-title {
  font-size: 1.75rem;
  margin-bottom: var(--space-sm);
}

.about-section .section-subtitle {
  font-size: 1rem;
  color: var(--color-text-muted);
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-xl);
}

.about-card {
  padding: var(--space-lg);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color-light);
  text-align: center;
  opacity: 0;
  animation: fadeInUp 0.5s ease-out forwards;
}

.about-icon {
  font-size: 2.5rem;
  margin-bottom: var(--space-md);
}

.about-title {
  font-size: 1.125rem;
  margin-bottom: var(--space-sm);
  color: var(--color-text-primary);
}

.about-text {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  margin-bottom: 0;
  line-height: 1.6;
}

/* === 分类筛选 === */
.category-section {
  padding: var(--space-lg) 0;
}

.section-header {
  text-align: center;
  margin-bottom: var(--space-lg);
}

.section-title {
  font-size: 2rem;
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
}

.section-subtitle {
  font-size: 1rem;
  color: var(--color-text-muted);
  margin-bottom: 0;
}

.category-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-sm);
}

.category-filter {
  padding: var(--space-sm) var(--space-xl);
  font-family: 'Lora', serif;
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 50px;
  cursor: pointer;
  transition: all var(--transition-base);
  opacity: 0;
  animation: fadeInUp 0.5s ease-out forwards;
}

.category-filter:hover {
  border-color: var(--color-accent-primary);
  color: var(--color-accent-primary);
}

.category-filter.active {
  background-color: var(--color-accent-primary);
  color: var(--color-text-light);
  border-color: var(--color-accent-primary);
}

/* === 餐厅列表 === */
.restaurants-section {
  padding: var(--space-lg) 0 var(--space-xl);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: var(--space-3xl);
  color: var(--color-text-muted);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--color-accent-primary);
  border-radius: 50%;
  margin: 0 auto var(--space-md);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: var(--space-md);
}

.empty-state a {
  color: var(--color-accent-primary);
}

.restaurant-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.restaurant-card {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: var(--space-lg);
  align-items: center;
  padding: var(--space-lg);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color-light);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}

.restaurant-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-accent-primary);
}

.restaurant-main {
  min-width: 0;
}

.restaurant-header {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-sm);
  flex-wrap: wrap;
}

.restaurant-name {
  font-size: 1.25rem;
  color: var(--color-text-primary);
  margin: 0;
}

.restaurant-rating {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.rating-stars {
  color: var(--color-warning);
  font-size: 1rem;
}

.rating-value {
  font-weight: 600;
  color: var(--color-text-primary);
}

.rating-count {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.restaurant-description {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
  line-height: 1.6;
}

.restaurant-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.tag {
  padding: var(--space-xs) var(--space-md);
  font-size: 0.75rem;
  background-color: var(--color-bg-accent);
  color: var(--color-accent-primary);
  border-radius: 50px;
  font-weight: 500;
}

.restaurant-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: 0 var(--space-lg);
  border-left: 1px solid var(--border-color-light);
  border-right: 1px solid var(--border-color-light);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  white-space: nowrap;
}

.meta-icon {
  font-size: 0.875rem;
}

.meta-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.restaurant-actions {
  display: flex;
  align-items: center;
}

.btn-sm {
  padding: var(--space-sm) var(--space-lg);
  font-size: 0.875rem;
}

/* === 平台说明 === */
.info-section {
  padding: var(--space-2xl) 0;
  background: linear-gradient(180deg, var(--color-bg-accent) 0%, var(--color-bg-primary) 100%);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-xl);
  align-items: center;
}

.info-title {
  font-size: 1.75rem;
  margin-bottom: var(--space-lg);
}

.info-text {
  font-size: 1.0625rem;
  color: var(--color-text-secondary);
  line-height: 1.8;
  margin-bottom: var(--space-xl);
  max-width: 500px;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.tech-tag {
  padding: var(--space-xs) var(--space-md);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.75rem;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--color-text-muted);
}

.info-actions {
  display: flex;
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.info-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
}

.code-block {
  padding: var(--space-lg);
  background-color: #1e1e1e;
  border-radius: var(--radius-md);
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: #d4d4d4;
  box-shadow: var(--shadow-lg);
}

.code-line {
  white-space: pre;
}

.code-comment {
  color: #6a9955;
}

.code-keyword {
  color: #569cd6;
}

.code-string {
  color: #ce9178;
}

.code-number {
  color: #b5cea8;
}

/* === 页脚 === */
footer {
  color: rgba(255, 255, 255, 0.9);
  background-color: var(--color-text-primary);
  padding: var(--space-2xl) 0;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-xl);
  margin-bottom: var(--space-xl);
}

.footer-section h5 {
  font-family: 'Playfair Display', serif;
  font-size: 1.0625rem;
  color: var(--color-text-light);
  margin-bottom: var(--space-md);
  font-weight: 600;
}

.footer-description {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0;
  line-height: 1.6;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: var(--space-sm);
}

.footer-links a {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  transition: color var(--transition-fast);
}

.footer-links a:hover {
  color: var(--color-text-light);
}

.footer-divider {
  border: none;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: var(--space-lg) 0;
}

.footer-copyright {
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8125rem;
  margin-bottom: 0;
}

/* === 响应式 === */
@media (max-width: 1024px) {
  .restaurant-card {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }

  .restaurant-meta {
    flex-direction: row;
    flex-wrap: wrap;
    padding: var(--space-md) 0;
    border-left: none;
    border-right: none;
    border-top: 1px solid var(--border-color-light);
    border-bottom: 1px solid var(--border-color-light);
  }

  .restaurant-actions {
    justify-content: flex-start;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-decoration {
    display: none;
  }

  .code-block {
    font-size: 0.75rem;
    padding: var(--space-md);
  }

  .info-actions {
    flex-direction: column;
  }

  .info-actions .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .hero-stats {
    flex-direction: column;
    gap: var(--space-lg);
  }

  .stat-divider {
    width: 60px;
    height: 1px;
  }

  .about-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .about-grid {
    grid-template-columns: 1fr;
  }

  .category-filter {
    padding: var(--space-xs) var(--space-md);
    font-size: 0.875rem;
  }
}
</style>
