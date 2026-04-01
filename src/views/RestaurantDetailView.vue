<template>
  <div class="restaurant-detail">
    <!-- 导航栏 -->
    <nav class="navbar navbar-expand-lg navbar-dark fixed-top bg-primary">
      <div class="container">
        <router-link to="/" class="navbar-brand">
          <i class="bi bi-arrow-left me-2"></i>
          返回
        </router-link>
        <span class="navbar-brand ms-auto">{{ restaurant.name }}</span>
      </div>
    </nav>

    <!-- 餐馆头部 -->
    <div class="container mt-5 pt-5">
      <div class="row">
        <div class="col-md-8">
          <div class="card border-0 shadow-sm">
            <img :src="restaurant.image" class="card-img-top" :alt="restaurant.name" style="height: 300px; object-fit: cover;">
            <div class="card-body">
              <h2 class="card-title">{{ restaurant.name }}</h2>
              <div class="d-flex align-items-center mb-3">
                <div class="rating-display">
                  <i class="bi bi-star-fill text-warning fs-4"></i>
                  <span class="fs-4 ms-2">{{ restaurant.rating }}</span>
                  <span class="text-muted ms-2">({{ restaurant.reviewCount }}条评价)</span>
                </div>
                <span class="badge ms-3 fs-6" :style="{ backgroundColor: categoryColor }">
                  {{ restaurant.category }}
                </span>
              </div>
              <p class="card-text">{{ restaurant.description }}</p>
              <div class="row mt-4">
                <div class="col-md-6">
                  <p><i class="bi bi-geo-alt"></i> {{ restaurant.address }}</p>
                  <p><i class="bi bi-clock"></i> {{ restaurant.hours }}</p>
                </div>
                <div class="col-md-6">
                  <p><i class="bi bi-telephone"></i> {{ restaurant.phone }}</p>
                  <p><i class="bi bi-cash"></i> 人均 {{ restaurant.avgPrice }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 菜品评价 -->
          <div class="mt-5">
            <h3 class="mb-4">菜品点评</h3>
            <div class="row row-cols-1 row-cols-md-2 g-4">
              <div class="col" v-for="dish in restaurant.dishes" :key="dish.id">
                <div class="card h-100 border-0 shadow-sm">
                  <img :src="dish.image" class="card-img-top" :alt="dish.name" style="height: 150px; object-fit: cover;">
                  <div class="card-body">
                    <h5 class="card-title">{{ dish.name }}</h5>
                    <p class="card-text text-muted">{{ dish.description }}</p>
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <span class="text-warning">
                          <i class="bi bi-star-fill"></i> {{ dish.rating }}
                        </span>
                        <span class="text-muted ms-2">({{ dish.reviewCount }}条评价)</span>
                      </div>
                      <span class="fs-5 text-primary">{{ dish.price }}</span>
                    </div>
                  </div>
                  <div class="card-footer bg-transparent border-top-0">
                    <button class="btn btn-primary w-100" @click="showReviewModal(dish)">
                      <i class="bi bi-chat-text"></i> 写评价
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 用户评价 -->
          <div class="mt-5">
            <h3 class="mb-4">成员评价</h3>
            <div class="card border-0 shadow-sm mb-3" v-for="review in restaurant.reviews" :key="review.id">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 class="card-title">{{ review.user }}</h6>
                    <div class="text-warning mb-2">
                      <i class="bi bi-star-fill" v-for="n in review.rating" :key="n"></i>
                    </div>
                  </div>
                  <span class="text-muted small">{{ review.date }}</span>
                </div>
                <p class="card-text">{{ review.comment }}</p>
                <div v-if="review.dish" class="mt-2">
                  <span class="badge bg-light text-dark">评价菜品: {{ review.dish }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 侧边栏 -->
        <div class="col-md-4">
          <!-- 地图 -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body">
              <h5 class="card-title"><i class="bi bi-map"></i> 位置</h5>
              <div class="map-placeholder bg-light d-flex align-items-center justify-content-center" style="height: 200px;">
                <i class="bi bi-geo-alt fs-1 text-muted"></i>
              </div>
              <p class="mt-3">{{ restaurant.address }}</p>
              <button class="btn btn-primary w-100">
                <i class="bi bi-navigation"></i> 导航前往
              </button>
            </div>
          </div>

          <!-- 营业时间 -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body">
              <h5 class="card-title"><i class="bi bi-clock"></i> 营业时间</h5>
              <ul class="list-unstyled">
                <li v-for="(time, day) in restaurant.hoursDetail" :key="day" class="d-flex justify-content-between py-2 border-bottom">
                  <span>{{ day }}</span>
                  <span>{{ time }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- 评分分布 -->
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title"><i class="bi bi-bar-chart"></i> 评分分布</h5>
              <div v-for="dist in restaurant.ratingDistribution" :key="dist.stars" class="mb-2">
                <div class="d-flex align-items-center">
                  <span class="me-2">{{ dist.stars }}星</span>
                  <div class="progress flex-grow-1" style="height: 10px;">
                    <div class="progress-bar" :style="{ width: dist.percentage + '%', backgroundColor: 'var(--primary)' }"></div>
                  </div>
                  <span class="ms-2">{{ dist.percentage }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 评价模态框 -->
    <div class="modal fade" id="reviewModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-primary text-light">
            <h5 class="modal-title">评价菜品: {{ selectedDish?.name }}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">评分</label>
              <div class="rating-input">
                <i class="bi bi-star fs-3" v-for="n in 5" :key="n"
                   :class="{ 'text-warning': n <= tempRating }"
                   @click="tempRating = n"
                   style="cursor: pointer;"></i>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">评价内容</label>
              <textarea class="form-control" v-model="tempComment" rows="3" placeholder="分享你的用餐体验..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-primary" @click="submitReview">提交评价</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="mt-5 py-4 bg-dark text-light">
      <div class="container">
        <p class="text-center mb-0">&copy; 2026 实验室内部使用</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Modal } from 'bootstrap'

const route = useRoute()

// 餐馆数据
const restaurant = ref({
  id: parseInt(route.params.id),
  name: '学苑食堂',
  description: '校内最受欢迎的食堂，菜品丰富价格实惠',
  rating: 4.5,
  reviewCount: 128,
  category: '食堂',
  image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
  address: '学校东区学生生活区1号楼',
  hours: '06:30 - 21:00',
  phone: '13800138000',
  avgPrice: '¥15-25',
  hoursDetail: {
    '周一至周五': '06:30 - 21:00',
    '周六': '07:00 - 20:30',
    '周日': '07:00 - 20:30'
  },
  ratingDistribution: [
    { stars: 5, percentage: 60 },
    { stars: 4, percentage: 25 },
    { stars: 3, percentage: 10 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 2 }
  ],
  dishes: [
    {
      id: 1,
      name: '红烧肉',
      description: '经典红烧肉，肥而不腻，入口即化',
      rating: 4.8,
      reviewCount: 45,
      price: '¥12',
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 2,
      name: '鱼香肉丝',
      description: '酸甜适口，肉丝嫩滑',
      rating: 4.6,
      reviewCount: 38,
      price: '¥10',
      image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 3,
      name: '宫保鸡丁',
      description: '麻辣鲜香，鸡肉鲜嫩',
      rating: 4.7,
      reviewCount: 42,
      price: '¥11',
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 4,
      name: '西红柿鸡蛋面',
      description: '家常味道，营养丰富',
      rating: 4.4,
      reviewCount: 28,
      price: '¥8',
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    }
  ],
  reviews: [
    {
      id: 1,
      user: '小明同学',
      rating: 5,
      comment: '红烧肉真的太好吃了，每次来必点！',
      dish: '红烧肉',
      date: '2026-03-28'
    },
    {
      id: 2,
      user: '美食家小李',
      rating: 4,
      comment: '性价比很高，适合学生党，就是饭点人有点多。',
      dish: '鱼香肉丝',
      date: '2026-03-25'
    },
    {
      id: 3,
      user: '吃货小张',
      rating: 5,
      comment: '宫保鸡丁麻辣味十足，非常下饭！',
      dish: '宫保鸡丁',
      date: '2026-03-20'
    }
  ]
})

// 计算分类颜色
const categoryColor = computed(() => {
  const colors = {
    '食堂': 'var(--primary)',
    '咖啡厅': '#6f4e37',
    '中餐': 'var(--secondary)',
    '西餐': '#2c3e50',
    '甜品': '#e84393',
    '烧烤': '#e67e22'
  }
  return colors[restaurant.value.category] || '#95a5a6'
})

// 评价相关
const selectedDish = ref(null)
const tempRating = ref(0)
const tempComment = ref('')
let reviewModal = null

onMounted(() => {
  reviewModal = new Modal(document.getElementById('reviewModal'))
})

function showReviewModal(dish) {
  selectedDish.value = dish
  tempRating.value = 0
  tempComment.value = ''
  reviewModal.show()
}

function submitReview() {
  if (tempRating.value === 0) {
    alert('请选择评分')
    return
  }

  restaurant.value.reviews.unshift({
    id: restaurant.value.reviews.length + 1,
    user: '当前用户',
    rating: tempRating.value,
    comment: tempComment.value,
    dish: selectedDish.value?.name,
    date: new Date().toISOString().split('T')[0]
  })

  reviewModal.hide()
  alert('评价提交成功！')
}
</script>

<style scoped>
.restaurant-detail {
  background-color: var(--light-bg);
  min-height: 100vh;
}
.map-placeholder {
  border-radius: 8px;
}
.rating-input .bi-star {
  margin-right: 5px;
}
.card {
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-3px);
}
</style>