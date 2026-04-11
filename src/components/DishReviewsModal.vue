<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="dish-reviews-modal" @click.self="handleClose">
        <div class="dish-reviews-content" @click.stop>
          <button class="modal-close" @click="handleClose">
            ✕
          </button>

          <div class="dish-reviews-header">
            <div class="dish-reviews-icon">🍲</div>
            <h2 class="dish-reviews-title">
              {{ dishName }}
              <span class="reviews-count">· {{ reviews.length }} 条评价</span>
            </h2>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="dish-reviews-loading">
            <div class="loading-spinner"></div>
            <p>正在加载评价...</p>
          </div>

          <!-- 评价列表 -->
          <div v-else-if="reviews.length > 0" class="dish-reviews-list">
            <div
              v-for="review in reviews"
              :key="review.id"
              class="dish-review-item"
            >
              <div class="dish-review-header">
                <div class="review-user">
                  <span class="user-avatar">{{ (review.profiles?.username || '匿名用户').charAt(0) }}</span>
                  <span class="user-name">{{ review.profiles?.username || '匿名用户' }}</span>
                </div>
                <div class="review-stars">
                  <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= review.score }">★</span>
                </div>
              </div>
              <p class="dish-review-comment" v-if="review.comment">{{ review.comment }}</p>
              <p class="dish-review-empty" v-else>该用户没有留下评论</p>
              <span class="dish-review-date">{{ formatDate(review.created_at) }}</span>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="dish-reviews-empty">
            <span class="empty-icon">💬</span>
            <p>暂无评价</p>
            <p class="empty-hint">成为第一个评价这道菜的人吧！</p>
          </div>

          <!-- 底部按钮 -->
          <div class="dish-reviews-actions">
            <button
              class="write-dish-review-btn"
              @click="handleRate"
            >
              <span class="btn-icon">✍️</span>
              {{ userHasRated ? '修改我的评价' : '我来评价' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  restaurant: {
    type: Object,
    default: null
  },
  dishName: {
    type: String,
    default: ''
  },
  reviews: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  userHasRated: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'rate'])

watch(() => props.show, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
}

function handleRate() {
  emit('rate')
}

function handleClose() {
  emit('update:show', false)
}
</script>

<style scoped>
@import '../assets/modal-shared.css';

.dish-reviews-modal {
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
}

.dish-reviews-content {
  background: var(--color-bg-secondary);
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  max-width: 480px;
  margin: 20px;
  position: relative;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-height: 80vh;
  overflow-y: auto;
}

.dish-reviews-header {
  text-align: center;
  margin-bottom: 24px;
}

.dish-reviews-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.dish-reviews-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.reviews-count {
  font-size: 14px;
  color: var(--color-text-muted);
  font-weight: 400;
  margin-left: 8px;
}

.dish-reviews-loading {
  text-align: center;
  padding: 40px 20px;
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

.dish-reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.dish-review-item {
  padding: 16px;
  background: var(--color-bg-accent);
  border-radius: 14px;
  transition: all 0.3s ease;
}

.dish-review-item:hover {
  background: var(--color-bg-primary);
}

.dish-review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary));
  color: var(--color-text-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.review-stars {
  display: flex;
  gap: 2px;
}

.review-stars .star {
  font-size: 14px;
  color: #DDD;
}

.review-stars .star.filled {
  color: #FFD700;
}

.dish-review-comment {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 10px 0;
}

.dish-review-empty {
  font-size: 13px;
  color: var(--color-text-muted);
  font-style: italic;
  margin: 0 0 10px 0;
}

.dish-review-date {
  font-size: 12px;
  color: var(--color-text-muted);
}

.dish-reviews-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-muted);
}

.dish-reviews-empty .empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.dish-reviews-empty p {
  margin: 0 0 4px 0;
}

.dish-reviews-empty .empty-hint {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-top: 8px;
}

.dish-reviews-actions {
  margin-top: 8px;
}

.write-dish-review-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary));
  color: var(--color-text-light);
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.write-dish-review-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 115, 84, 0.35);
}
</style>
