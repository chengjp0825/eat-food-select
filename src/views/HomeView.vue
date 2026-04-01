<template>
  <div class="home">
    <!-- 导航栏 -->
    <nav class="navbar navbar-expand-lg navbar-dark fixed-top bg-primary">
      <div class="container">
        <a class="navbar-brand" href="#">
          <i class="bi bi-cup-hot me-2"></i>
          实验室美食分享
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link to="/" class="nav-link active"><i class="bi bi-house-door"></i> 首页</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/food-selector" class="nav-link"><i class="bi bi-stars"></i> 今天吃什么</router-link>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#"><i class="bi bi-plus-circle"></i> 分享美食</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#"><i class="bi bi-people"></i> 成员</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- 主内容 -->
    <div class="container mt-5 pt-5">
      <!-- 搜索栏 -->
      <div class="row mb-4">
        <div class="col-md-8 mx-auto">
          <div class="input-group">
            <span class="input-group-text bg-primary text-light">
              <i class="bi bi-search"></i>
            </span>
            <input type="text" class="form-control" placeholder="搜索餐馆、菜品或成员推荐...">
            <button class="btn btn-primary">搜索</button>
          </div>
        </div>
      </div>

      <!-- 分类标签 -->
      <div class="row mb-4">
        <div class="col">
          <div class="d-flex flex-wrap gap-2">
            <span class="badge rounded-pill bg-primary">全部</span>
            <span class="badge rounded-pill bg-secondary">中餐</span>
            <span class="badge rounded-pill bg-secondary">西餐</span>
            <span class="badge rounded-pill bg-secondary">快餐</span>
            <span class="badge rounded-pill bg-secondary">小吃</span>
            <span class="badge rounded-pill bg-secondary">饮品</span>
          </div>
        </div>
      </div>

      <!-- 餐馆列表 -->
      <h3 class="mb-3">成员推荐餐馆</h3>
      <div class="row row-cols-1 row-cols-md-3 g-4">
        <div class="col" v-for="restaurant in restaurants" :key="restaurant.id">
          <div class="card h-100 shadow-sm border-0">
            <img :src="restaurant.image" class="card-img-top" :alt="restaurant.name" style="height: 180px; object-fit: cover;">
            <div class="card-body">
              <h5 class="card-title">{{ restaurant.name }}</h5>
              <p class="card-text text-muted">{{ restaurant.description }}</p>
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <i class="bi bi-star-fill text-warning"></i>
                  <span class="ms-1">{{ restaurant.rating }}</span>
                  <span class="text-muted ms-2">({{ restaurant.reviewCount }}条评价)</span>
                </div>
                <span class="badge" :style="{ backgroundColor: getCategoryColor(restaurant.category) }">
                  {{ restaurant.category }}
                </span>
              </div>
            </div>
            <div class="card-footer bg-transparent border-top-0">
              <router-link :to="{ name: 'restaurant-detail', params: { id: restaurant.id } }" class="btn btn-primary w-100">
                查看详情
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- 特色菜品 -->
      <h3 class="mt-5 mb-3">成员推荐菜品</h3>
      <div class="row row-cols-1 row-cols-md-4 g-4">
        <div class="col" v-for="dish in featuredDishes" :key="dish.id">
          <div class="card h-100 shadow-sm border-0">
            <img :src="dish.image" class="card-img-top" :alt="dish.name" style="height: 120px; object-fit: cover;">
            <div class="card-body">
              <h6 class="card-title">{{ dish.name }}</h6>
              <p class="card-text text-muted small">{{ dish.restaurant }}</p>
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-warning">
                  <i class="bi bi-star-fill"></i> {{ dish.rating }}
                </span>
                <span class="text-muted small">{{ dish.price }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="mt-5 py-4 bg-dark text-light">
      <div class="container">
        <div class="row">
          <div class="col-md-6">
            <h5><i class="bi bi-cup-hot"></i> 实验室美食分享</h5>
            <p>实验室成员美食发现与分享平台</p>
          </div>
          <div class="col-md-3">
            <h5>实验室相关</h5>
            <ul class="list-unstyled">
              <li><a href="#" class="text-light">实验室主页</a></li>
              <li><a href="#" class="text-light">项目文档</a></li>
              <li><a href="#" class="text-light">成员通讯录</a></li>
            </ul>
          </div>
          <div class="col-md-3">
            <h5>联系方式</h5>
            <div class="d-flex gap-3">
              <a href="#" class="text-light"><i class="bi bi-envelope fs-4"></i></a>
              <a href="#" class="text-light"><i class="bi bi-github fs-4"></i></a>
              <a href="#" class="text-light"><i class="bi bi-link-45deg fs-4"></i></a>
            </div>
          </div>
        </div>
        <hr class="bg-light">
        <p class="text-center mb-0">&copy; 2026 实验室内部使用</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

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
.home {
  background-color: var(--light-bg);
  min-height: 100vh;
}
.card {
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-5px);
}
.badge {
  color: white;
}
</style>