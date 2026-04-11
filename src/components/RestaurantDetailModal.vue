<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="detail-modal-overlay" @click="handleClose">
        <div class="detail-modal" @click.stop>
          <button class="modal-close" @click="handleClose">
            ✕
          </button>

          <!-- 顶部品牌区 -->
          <div class="detail-hero" :class="isAuthenticated ? getRatingClass(getAvgRating(food?.id)) : 'npc'">
            <div class="hero-icon">🍽️</div>
            <h2 class="detail-name">{{ food?.name }}</h2>
            <div class="detail-header-row">
              <div v-if="isAuthenticated" class="rating-badge" :class="getRatingClass(getAvgRating(food?.id))">
                {{ getRatingLabel(getAvgRating(food?.id)) }}
              </div>
              <div v-else class="lock-badge large">
                🔒 登录查看评级
              </div>
              <div class="detail-tags-inline">
                <span class="tag-inline" v-for="tag in food?.tags" :key="tag">{{ tag }}</span>
              </div>
              <button
                v-if="isAuthenticated"
                class="rate-btn detail-rate-btn"
                @click="handleOpenRating"
                :title="checkHasRated(food?.id) ? '修改评价' : '评价'"
              >
                <span class="rate-icon">{{ checkHasRated(food?.id) ? '⭐' : '☆' }}</span>
              </button>
            </div>
          </div>

          <!-- 核心信息 -->
          <div class="detail-stats">
            <div class="stat-item">
              <span class="stat-icon">📍</span>
              <span class="stat-label">位置</span>
              <span class="stat-value">{{ food?.location }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">💰</span>
              <span class="stat-label">人均</span>
              <span class="stat-value">{{ food?.price }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🚶</span>
              <span class="stat-label">距离</span>
              <span class="stat-value">{{ food?.distance }}</span>
            </div>
          </div>

          <!-- 详细介绍 -->
          <div class="detail-section">
            <h3 class="section-title">简介</h3>
            <p class="detail-text">{{ food?.description }}</p>
          </div>

          <div class="detail-section">
            <h3 class="section-title">详情</h3>
            <p class="detail-text">{{ food?.detail }}</p>
          </div>

          <!-- 特色标签 -->
          <div class="detail-features">
            <span class="feature-tag" v-for="tag in food?.features" :key="tag">#{{ tag }}</span>
          </div>

          <!-- 菜品评价区域 -->
          <div class="detail-dishes-section" v-if="isAuthenticated">
            <div class="section-header">
              <h3 class="section-title">
                <span class="dish-icon">🍲</span>
                菜品评价
              </h3>
              <span v-if="!dishesLoading && restaurantDishes.length > 0" class="dish-count">{{ restaurantDishes.length }} 个菜品</span>
            </div>

            <div v-if="dishesLoading" class="dishes-loading">
              <div class="loading-spinner"></div>
              <p class="loading-text">正在加载菜品...</p>
            </div>

            <div v-else-if="restaurantDishes.length > 0" class="dishes-grid">
              <div
                v-for="dishName in restaurantDishes"
                :key="dishName"
                class="dish-card"
                :class="{ 'user-rated': checkUserRatedDish(food?.id, dishName) }"
                @click="handleOpenDishReviews(dishName)"
              >
                <div class="dish-card-top">
                  <span class="dish-name">{{ dishName }}</span>
                  <span v-if="checkUserRatedDish(food?.id, dishName)" class="rated-badge">已评</span>
                </div>
                <div class="dish-card-middle">
                  <div class="dish-rating">
                    <span class="dish-score">{{ formatDishRating(dishRatings[dishName]) }}</span>
                    <span class="score-unit">分</span>
                  </div>
                </div>
                <div class="dish-card-bottom" @click.stop="handleOpenDishRating(dishName)">
                  <span class="rate-btn-text">
                    {{ checkUserRatedDish(food?.id, dishName) ? '修改评价' : '立即评价' }}
                  </span>
                </div>
              </div>

              <div v-if="showAddDishInput" class="dish-card add-dish-input-card">
                <div class="add-dish-input-area">
                  <input
                    v-model="localNewDishName"
                    class="add-dish-input"
                    placeholder="输入菜品名称，如：红烧肉"
                    @keyup.enter="handleAddDish"
                  />
                  <div class="add-dish-buttons">
                    <button class="add-dish-confirm" @click="handleAddDish">添加</button>
                    <button class="add-dish-cancel" @click="handleCancelAddDish">取消</button>
                  </div>
                </div>
              </div>
              <div v-else class="dish-card add-dish-card" @click="showAddDishInput = true">
                <div class="add-dish-content">
                  <span class="add-dish-icon">➕</span>
                  <span class="add-dish-text">添加菜品</span>
                </div>
              </div>
            </div>

            <div v-else class="dishes-empty">
              <span class="empty-icon">🍽️</span>
              <p class="empty-text">暂无菜品评价</p>
              <p class="empty-hint">快来评价第一个菜品吧！</p>
              <div v-if="showAddDishInput" class="add-dish-input-area">
                <input
                  v-model="localNewDishName"
                  class="add-dish-input"
                  placeholder="输入菜品名称，如：红烧肉"
                  @keyup.enter="handleAddDish"
                />
                <div class="add-dish-buttons">
                  <button class="add-dish-confirm" @click="handleAddDish">添加</button>
                  <button class="add-dish-cancel" @click="handleCancelAddDish">取消</button>
                </div>
              </div>
              <div v-else class="empty-actions">
                <button class="empty-action-btn" @click="showAddDishInput = true">
                  <span class="action-icon">➕</span>
                  添加菜品并评价
                </button>
                <button class="empty-action-btn secondary" @click="handleOpenRating">
                  <span class="action-icon">⭐</span>
                  评价餐厅
                </button>
              </div>
            </div>
          </div>

          <!-- 评价区域 -->
          <div v-if="isAuthenticated" class="detail-rating-section-new">
            <div class="rating-header">
              <h3 class="rating-title">
                <span class="rating-icon">⭐</span>
                用户评价
              </h3>
              <span class="rating-count">{{ restaurantRatings.length }} 条评价</span>
            </div>

            <div class="rating-overview">
              <div class="avg-score">
                <span class="score-number">{{ getAvgRating(food?.id) || '-' }}</span>
                <span class="score-label">分</span>
              </div>
              <div class="rating-bars">
                <div
                  v-for="dist in ratingDistribution"
                  :key="dist.stars"
                  class="rating-bar-row"
                >
                  <span class="bar-stars">{{ dist.stars }}星</span>
                  <div class="bar-container">
                    <div class="bar-fill" :style="{ width: dist.percentage + '%' }"></div>
                  </div>
                  <span class="bar-percent">{{ dist.percentage }}%</span>
                </div>
              </div>
            </div>

            <div class="rating-action">
              <button class="write-review-btn" @click="handleOpenRating">
                <span class="btn-icon">✍️</span>
                {{ checkHasRated(food?.id) ? '修改评价' : '写评价' }}
              </button>
            </div>

            <div v-if="sortedRatings.length > 0" class="reviews-preview">
              <div
                v-for="rating in sortedRatings.slice(0, 3)"
                :key="rating.id"
                class="review-item"
                :class="{ 'dish-rating-item': rating.dish_name }"
              >
                <div class="review-type-badge" v-if="rating.dish_name">
                  <span class="dish-tag">🍲 {{ rating.dish_name }}</span>
                </div>
                <div class="review-header">
                  <div class="review-user">
                    <span class="user-avatar">{{ (rating.profiles?.username || '匿名用户').charAt(0) }}</span>
                    <span class="user-name">{{ rating.profiles?.username || '匿名用户' }}</span>
                  </div>
                  <div class="review-stars">
                    <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= rating.score }">★</span>
                  </div>
                </div>
                <p class="review-comment" v-if="rating.comment">{{ rating.comment }}</p>
                <p class="review-empty" v-else>该用户没有留下评论</p>
                <span class="review-date">{{ formatDate(rating.created_at) }}</span>
              </div>
              <div v-if="sortedRatings.length > 3" class="more-reviews">
                还有 {{ sortedRatings.length - 3 }} 条评价...
              </div>
            </div>
            <div v-else class="no-reviews">
              <span class="empty-icon">💬</span>
              <p>暂无评价，快来抢先评价吧！</p>
            </div>
          </div>

          <button class="select-button" @click="handleSelect">
            ✅ 就选这个
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  food: {
    type: Object,
    default: null
  },
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  restaurantRatings: {
    type: Array,
    default: () => []
  },
  restaurantDishes: {
    type: Array,
    default: () => []
  },
  dishRatings: {
    type: Object,
    default: () => ({})
  },
  dishesLoading: {
    type: Boolean,
    default: false
  },
  ratingDistribution: {
    type: Array,
    default: () => []
  },
  getRatingClass: {
    type: Function,
    default: () => () => 'npc'
  },
  getRatingLabel: {
    type: Function,
    default: () => () => ''
  },
  getAvgRating: {
    type: Function,
    default: () => () => null
  },
  checkHasRated: {
    type: Function,
    default: () => () => false
  },
  checkUserRatedDish: {
    type: Function,
    default: () => () => false
  },
  onOpenRating: {
    type: Function,
    default: null
  },
  onOpenDishReviews: {
    type: Function,
    default: null
  },
  onOpenDishRating: {
    type: Function,
    default: null
  },
  onAddDish: {
    type: Function,
    default: null
  },
  onSelect: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['update:show'])

const showAddDishInput = ref(false)
const localNewDishName = ref('')

watch(() => props.show, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
    showAddDishInput.value = false
    localNewDishName.value = ''
  } else {
    document.body.style.overflow = ''
  }
})

const sortedRatings = computed(() => {
  return [...props.restaurantRatings].sort((a, b) => {
    if (a.dish_name === null && b.dish_name !== null) return -1
    if (a.dish_name !== null && b.dish_name === null) return 1
    return new Date(b.created_at) - new Date(a.created_at)
  })
})

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
}

function formatDishRating(score) {
  if (score === null || score === undefined || score === '-') return '-'
  const rounded = Math.round(score * 10) / 10
  return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1)
}

function handleClose() {
  emit('update:show', false)
}

function handleOpenRating() {
  props.onOpenRating?.()
}

function handleOpenDishReviews(dishName) {
  props.onOpenDishReviews?.(dishName)
}

function handleOpenDishRating(dishName) {
  props.onOpenDishRating?.(dishName)
}

async function handleAddDish() {
  if (!localNewDishName.value.trim()) return
  if (props.onAddDish) {
    await props.onAddDish(localNewDishName.value.trim())
  }
  showAddDishInput.value = false
  localNewDishName.value = ''
}

function handleCancelAddDish() {
  showAddDishInput.value = false
  localNewDishName.value = ''
}

function handleSelect() {
  props.onSelect?.()
}
</script>

<style scoped>
@import '../assets/modal-shared.css';

.detail-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
}

.detail-modal {
  background: var(--color-bg-secondary);
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  max-width: 560px;
  margin: 20px auto;
  position: relative;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

/* 顶部品牌区 */
.detail-hero {
  text-align: center;
  padding: 24px 20px;
  background: linear-gradient(135deg, var(--color-bg-accent) 0%, var(--color-bg-primary) 100%);
  border-radius: 16px;
  margin-bottom: 24px;
}

.detail-hero.npc {
  opacity: 0.9;
}

.hero-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.detail-name {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 12px 0;
}

.detail-header-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.detail-tags-inline {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag-inline {
  padding: 4px 10px;
  background: var(--color-bg-primary);
  border-radius: 12px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.lock-badge.large {
  padding: 6px 14px;
  background: var(--color-bg-primary);
  border-radius: 16px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.rating-badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
}

.rating-badge.top-tier {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #333;
}

.rating-badge.hot {
  background: linear-gradient(135deg, #FF6B6B, #FF4757);
  color: white;
}

.rating-badge.npc {
  background: linear-gradient(135deg, #B0B0B0, #808080);
  color: white;
}

.rate-btn {
  padding: 6px 12px;
  background: var(--color-bg-primary);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.rate-btn:hover {
  background: var(--color-bg-accent);
  transform: scale(1.1);
}

.rate-btn.detail-rate-btn {
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 14px;
}

/* 核心信息 */
.detail-stats {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--color-bg-accent);
  border-radius: 14px;
  margin-bottom: 20px;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-icon {
  font-size: 20px;
  display: block;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-muted);
  display: block;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* 详细介绍 */
.detail-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0;
}

.detail-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.feature-tag {
  padding: 6px 12px;
  background: var(--color-bg-accent);
  border-radius: 16px;
  font-size: 13px;
  color: var(--color-accent-primary);
}

/* 菜品评价区域 */
.detail-dishes-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-header .section-title {
  margin: 0;
}

.dish-icon {
  font-size: 18px;
}

.dish-count {
  font-size: 13px;
  color: var(--color-text-muted);
}

.dishes-loading {
  text-align: center;
  padding: 24px;
  color: var(--color-text-muted);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--border-color);
  border-top-color: var(--color-accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

.dishes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.dish-card {
  padding: 14px;
  background: var(--color-bg-accent);
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.dish-card:hover {
  background: var(--color-bg-primary);
  transform: translateY(-2px);
}

.dish-card.user-rated {
  border-color: var(--color-accent-primary);
}

.dish-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.dish-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.rated-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: var(--color-accent-primary);
  color: white;
  border-radius: 8px;
}

.dish-card-middle {
  margin-bottom: 8px;
}

.dish-rating {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
}

.dish-score {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-accent-primary);
}

.score-unit {
  font-size: 12px;
  color: var(--color-text-muted);
}

.dish-card-bottom {
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
}

.rate-btn-text {
  font-size: 12px;
  color: var(--color-accent-primary);
}

/* 添加新菜品 */
.add-dish-card {
  border: 2px dashed var(--border-color);
  background: transparent;
}

.add-dish-card:hover {
  border-color: var(--color-accent-primary);
  background: var(--color-bg-accent);
}

.add-dish-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.add-dish-icon {
  font-size: 24px;
  color: var(--color-text-muted);
}

.add-dish-text {
  font-size: 13px;
  color: var(--color-text-muted);
}

.add-dish-input-card {
  border: 2px solid var(--color-accent-primary);
}

.add-dish-input-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-dish-input {
  padding: 10px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  background: var(--color-bg-secondary);
}

.add-dish-input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
}

.add-dish-buttons {
  display: flex;
  gap: 8px;
}

.add-dish-confirm,
.add-dish-cancel {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-dish-confirm {
  background: var(--color-accent-primary);
  color: white;
}

.add-dish-cancel {
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
}

/* 空状态 */
.dishes-empty {
  text-align: center;
  padding: 24px;
  color: var(--color-text-muted);
}

.dishes-empty .empty-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.dishes-empty .empty-text {
  font-size: 14px;
  margin: 0 0 4px 0;
}

.dishes-empty .empty-hint {
  font-size: 12px;
  margin: 0 0 16px 0;
}

.empty-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 200px;
  margin: 0 auto;
}

.empty-action-btn {
  padding: 12px;
  background: var(--color-bg-accent);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.empty-action-btn:hover {
  background: var(--color-bg-primary);
}

.empty-action-btn.secondary {
  background: transparent;
  border: 2px solid var(--border-color);
}

/* 评价区域 */
.detail-rating-section-new {
  margin-bottom: 20px;
}

.rating-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.rating-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.rating-icon {
  font-size: 18px;
}

.rating-count {
  font-size: 13px;
  color: var(--color-text-muted);
}

.rating-overview {
  display: flex;
  gap: 20px;
  padding: 16px;
  background: var(--color-bg-accent);
  border-radius: 14px;
  margin-bottom: 16px;
}

.avg-score {
  text-align: center;
  min-width: 60px;
}

.score-number {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-accent-primary);
  line-height: 1;
}

.score-label {
  font-size: 14px;
  color: var(--color-text-muted);
}

.rating-bars {
  flex: 1;
}

.rating-bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.bar-stars {
  font-size: 12px;
  color: var(--color-text-muted);
  width: 32px;
}

.bar-container {
  flex: 1;
  height: 8px;
  background: var(--color-bg-primary);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent-secondary), var(--color-accent-primary));
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bar-percent {
  font-size: 12px;
  color: var(--color-text-muted);
  width: 36px;
  text-align: right;
}

.rating-action {
  margin-bottom: 16px;
}

.write-review-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary));
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.write-review-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 115, 84, 0.3);
}

/* 评价列表预览 */
.reviews-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-item {
  padding: 14px;
  background: var(--color-bg-accent);
  border-radius: 12px;
}

.review-type-badge {
  margin-bottom: 8px;
}

.dish-tag {
  font-size: 12px;
  padding: 3px 8px;
  background: var(--color-bg-primary);
  border-radius: 8px;
  color: var(--color-accent-primary);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.review-stars {
  display: flex;
  gap: 2px;
}

.review-stars .star {
  font-size: 13px;
  color: #DDD;
}

.review-stars .star.filled {
  color: #FFD700;
}

.review-comment {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0 0 6px 0;
}

.review-empty {
  font-size: 12px;
  color: var(--color-text-muted);
  font-style: italic;
  margin: 0 0 6px 0;
}

.review-date {
  font-size: 11px;
  color: var(--color-text-muted);
}

.more-reviews {
  text-align: center;
  font-size: 13px;
  color: var(--color-text-muted);
  padding: 8px;
}

.no-reviews {
  text-align: center;
  padding: 24px;
  color: var(--color-text-muted);
}

.no-reviews .empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
  display: block;
}

.no-reviews p {
  margin: 0;
  font-size: 13px;
}

/* 选择按钮 */
.select-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary));
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.select-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 115, 84, 0.35);
}

/* 响应式 */
@media (max-width: 480px) {
  .detail-modal {
    padding: 24px 20px;
    margin: 10px;
  }

  .detail-stats {
    flex-direction: column;
    gap: 12px;
  }

  .rating-overview {
    flex-direction: column;
    align-items: center;
  }

  .dishes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
