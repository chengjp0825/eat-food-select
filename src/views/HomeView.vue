<template>
  <div class="home">
    <!-- 导航栏 -->
    <nav class="navbar navbar-expand-lg fixed-top">
      <div class="container d-flex align-items-center justify-content-between">
        <router-link to="/" class="navbar-brand">
          <span class="brand-icon">🍽️</span>
          <span class="brand-text">实验室美食分享</span>
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
            <li class="nav-item">
              <a class="nav-link" href="#">分享美食</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">成员</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- 主内容 -->
    <div class="main-content">
      <!-- 欢迎区域 -->
      <div class="hero-section">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title animate-fade-in-up">
              探索美味<span class="text-accent">·</span>分享快乐
            </h1>
            <div class="decorative-line animate-fade-in-up" style="animation-delay: 0.1s;"></div>
            <p class="hero-description animate-fade-in-up" style="animation-delay: 0.2s;">
              实验室成员的美食发现与分享平台
            </p>
          </div>

          <!-- 搜索栏 -->
          <div class="search-container animate-fade-in-up" style="animation-delay: 0.3s;">
            <div class="search-input-wrapper">
              <span class="search-icon">🔍</span>
              <input type="text" class="form-control search-input" placeholder="搜索餐馆、菜品或成员推荐...">
            </div>
            <button class="btn btn-primary search-button">搜索</button>
          </div>
        </div>
      </div>

      <!-- 分类筛选 -->
      <div class="category-section">
        <div class="container">
          <div class="category-header">
            <h3 class="section-title">浏览分类</h3>
            <div class="decorative-dots"></div>
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
      </div>

      <!-- 餐馆列表 -->
      <div class="restaurants-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">成员推荐餐馆</h2>
            <div class="decorative-line"></div>
          </div>
          <div class="restaurant-grid">
            <div
              v-for="(restaurant, index) in restaurants"
              :key="restaurant.id"
              class="restaurant-card"
              :style="{ animationDelay: `${index * 0.08}s` }"
            >
              <div class="card-image-wrapper">
                <img :src="restaurant.image" :alt="restaurant.name" class="card-image">
                <div class="card-overlay">
                  <span class="category-badge">{{ restaurant.category }}</span>
                </div>
              </div>
              <div class="card-content">
                <h3 class="restaurant-name">{{ restaurant.name }}</h3>
                <p class="restaurant-description">{{ restaurant.description }}</p>
                <div class="restaurant-meta">
                  <div class="rating">
                    <span class="rating-star">⭐</span>
                    <span class="rating-value">{{ restaurant.rating }}</span>
                  </div>
                  <span class="review-count">{{ restaurant.reviewCount }} 条评价</span>
                </div>
              </div>
              <div class="card-footer-content">
                <router-link
                  :to="{ name: 'restaurant-detail', params: { id: restaurant.id } }"
                  class="btn btn-outline card-link"
                >
                  查看详情
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 特色菜品 -->
      <div class="featured-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">成员推荐菜品</h2>
            <div class="decorative-line"></div>
          </div>
          <div class="featured-grid">
            <div
              v-for="(dish, index) in featuredDishes"
              :key="dish.id"
              class="featured-card"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="featured-image-wrapper">
                <img :src="dish.image" :alt="dish.name" class="featured-image">
              </div>
              <div class="featured-content">
                <h4 class="featured-name">{{ dish.name }}</h4>
                <p class="featured-restaurant">{{ dish.restaurant }}</p>
                <div class="featured-meta">
                  <span class="featured-rating">⭐ {{ dish.rating }}</span>
                  <span class="featured-price">{{ dish.price }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <footer>
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h5>实验室美食分享</h5>
            <p class="footer-description">实验室成员美食发现与分享平台</p>
          </div>
          <div class="footer-section">
            <h5>实验室相关</h5>
            <ul class="footer-links">
              <li><a href="#">实验室主页</a></li>
              <li><a href="#">项目文档</a></li>
              <li><a href="#">成员通讯录</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h5>联系方式</h5>
            <div class="footer-social">
              <a href="#" class="social-link">📧</a>
              <a href="#" class="social-link">💻</a>
              <a href="#" class="social-link">🔗</a>
            </div>
          </div>
        </div>
        <hr>
        <p class="footer-copyright">&copy; 2026 实验室内部使用</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 分类数据
const categories = ['全部', '食堂', '中餐', '西餐', '快餐', '小吃', '饮品', '甜品', '烧烤']
const selectedCategory = ref('全部')

// 餐馆数据
const restaurants = ref([
  {
    id: 1,
    name: '学苑食堂',
    description: '校内最受欢迎的食堂，菜品丰富价格实惠',
    rating: 4.5,
    reviewCount: 128,
    category: '食堂',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 2,
    name: '咖啡时光',
    description: '校园咖啡馆，提供精品咖啡和轻食',
    rating: 4.2,
    reviewCount: 56,
    category: '咖啡厅',
    image: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 3,
    name: '川味小厨',
    description: '正宗川菜，辣味十足',
    rating: 4.7,
    reviewCount: 89,
    category: '中餐',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 4,
    name: '披萨先生',
    description: '手工披萨，现点现做',
    rating: 4.3,
    reviewCount: 72,
    category: '西餐',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 5,
    name: '甜品工坊',
    description: '各式甜品，甜蜜你的校园生活',
    rating: 4.6,
    reviewCount: 45,
    category: '甜品',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 6,
    name: '烧烤部落',
    description: '夜宵好去处，烧烤啤酒',
    rating: 4.4,
    reviewCount: 63,
    category: '烧烤',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  }
])

// 特色菜品数据
const featuredDishes = ref([
  {
    id: 1,
    name: '红烧肉',
    restaurant: '学苑食堂',
    rating: 4.8,
    price: '¥12',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 2,
    name: '拿铁咖啡',
    restaurant: '咖啡时光',
    rating: 4.5,
    price: '¥18',
    image: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 3,
    name: '麻辣香锅',
    restaurant: '川味小厨',
    rating: 4.9,
    price: '¥25',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 4,
    name: '玛格丽特披萨',
    restaurant: '披萨先生',
    rating: 4.4,
    price: '¥38',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  }
])

// 根据分类返回颜色
function getCategoryColor(category) {
  const colors = {
    '食堂': 'var(--primary)',
    '咖啡厅': '#6f4e37',
    '中餐': 'var(--secondary)',
    '西餐': '#2c3e50',
    '甜品': '#e84393',
    '烧烤': '#e67e22'
  }
  return colors[category] || '#95a5a6'
}
</script>

<style scoped>
/* === 主容器 === */
.home {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

/* === 欢迎区域 === */
.hero-section {
  padding: calc(var(--space-3xl) + 60px) 0 var(--space-3xl);
  background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-accent) 100%);
}

.hero-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto var(--space-2xl);
}

.hero-title {
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: var(--space-lg);
}

.hero-description {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xl);
}

/* === 搜索栏 === */
.search-container {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  gap: var(--space-md);
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--space-lg);
  font-size: 1.25rem;
  color: var(--color-text-muted);
}

.search-input {
  padding-left: calc(var(--space-xl) + 1.5rem);
  height: 56px;
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-color);
  font-size: 1.0625rem;
}

.search-input:focus {
  border-color: var(--color-accent-primary);
}

.search-button {
  padding: var(--space-md) var(--space-2xl);
  height: 56px;
  border-radius: var(--radius-lg);
  font-weight: 500;
}

/* === 分类筛选 === */
.category-section {
  padding: var(--space-3xl) 0;
}

.category-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.section-title {
  font-size: 2rem;
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
}

.category-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-md);
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
  transform: translateY(-2px);
}

.category-filter.active {
  background-color: var(--color-accent-primary);
  color: var(--color-text-light);
  border-color: var(--color-accent-primary);
}

/* === 餐馆列表 === */
.restaurants-section {
  padding: var(--space-3xl) 0;
  background-color: var(--color-bg-accent);
}

.section-header {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.restaurant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-xl);
}

.restaurant-card {
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
  display: flex;
  flex-direction: column;
}

.restaurant-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-8px);
}

.card-image-wrapper {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.restaurant-card:hover .card-image {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
}

.category-badge {
  padding: var(--space-xs) var(--space-md);
  background-color: rgba(255, 255, 255, 0.95);
  color: var(--color-accent-primary);
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 20px;
  backdrop-filter: blur(8px);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-content {
  padding: var(--space-xl);
  flex: 1;
}

.restaurant-name {
  font-size: 1.375rem;
  margin-bottom: var(--space-sm);
  color: var(--color-text-primary);
}

.restaurant-description {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-lg);
}

.restaurant-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.rating-star {
  font-size: 1.125rem;
}

.rating-value {
  font-weight: 600;
  color: var(--color-text-primary);
}

.review-count {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.card-footer-content {
  padding: var(--space-lg) var(--space-xl);
  border-top: 1px solid var(--border-color-light);
}

.card-link {
  width: 100%;
  justify-content: center;
  font-weight: 500;
}

/* === 特色菜品 === */
.featured-section {
  padding: var(--space-3xl) 0;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--space-xl);
}

.featured-card {
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  opacity: 0;
  animation: fadeInUp 0.5s ease-out forwards;
}

.featured-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
}

.featured-image-wrapper {
  height: 180px;
  overflow: hidden;
}

.featured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.featured-card:hover .featured-image {
  transform: scale(1.08);
}

.featured-content {
  padding: var(--space-lg);
}

.featured-name {
  font-size: 1.0625rem;
  margin-bottom: var(--space-xs);
  color: var(--color-text-primary);
}

.featured-restaurant {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
}

.featured-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.featured-rating {
  font-size: 0.9375rem;
}

.featured-price {
  font-weight: 600;
  color: var(--color-accent-primary);
}

/* === 页脚 === */
.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-2xl);
}

.footer-section h5 {
  font-size: 1.125rem;
  margin-bottom: var(--space-lg);
}

.footer-description {
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.8);
}

.footer-links {
  list-style: none;
}

.footer-links li {
  margin-bottom: var(--space-sm);
}

.footer-links a {
  font-size: 0.9375rem;
  display: block;
  padding: var(--space-xs) 0;
}

.footer-social {
  display: flex;
  gap: var(--space-md);
}

.social.footer-copyright {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

/* === 响应式 === */
@media (max-width: 1024px) {
  .restaurant-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .featured-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: calc(var(--space-2xl) + 60px) 0 var(--space-2xl);
  }

  .search-container {
    flex-direction: column;
  }

  .search-button {
    width: 100%;
  }

  .restaurant-grid {
    grid-template-columns: 1fr;
  }

  .featured-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .footer-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2.25rem;
  }

  .category-filters {
    gap: var(--space-sm);
  }

  .category-filter {
    padding: var(--space-sm) var(--space-md);
    font-size: 0.875rem;
  }

  .featured-grid {
    grid-template-columns: 1fr;
  }
}
</style>