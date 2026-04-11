<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="rating-modal" @click.self="handleClose">
        <div class="rating-content" @click.stop>
          <button class="modal-close" @click="handleClose">
            ✕
          </button>

          <div class="rating-header">
            <div class="rating-icon">⭐</div>
            <h2 class="rating-title">
              评价 {{ restaurant?.name }}
              <span v-if="dishName" class="dish-indicator">· {{ dishName }}</span>
            </h2>
            <p class="rating-subtitle">
              {{ dishName ? '评价该菜品' : '分享您的用餐体验' }}
            </p>
          </div>

          <div class="rating-stars">
            <p class="rating-label">您的评分：</p>
            <div class="stars-container">
              <button
                v-for="star in 5"
                :key="star"
                class="star-btn"
                :class="{ active: star <= localScore }"
                @click="localScore = star"
                :title="star + '星'"
              >
                <span class="star-icon">{{ star <= localScore ? '★' : '☆' }}</span>
              </button>
            </div>
            <p class="stars-hint">{{ localScore }} 星 ({{ getScoreText(localScore) }})</p>
          </div>

          <div class="rating-comment">
            <label class="comment-label">评论（可选）：</label>
            <textarea
              v-model="localComment"
              class="comment-textarea"
              placeholder="分享一下您的用餐体验、推荐菜品或改进建议..."
              rows="4"
            ></textarea>
          </div>

          <div class="rating-actions">
            <button
              class="rating-submit-btn"
              @click="handleSubmit"
              :disabled="localScore < 1 || loading"
            >
              <span v-if="loading" class="spinner">⟳</span>
              {{ loading ? '提交中...' : '提交评价' }}
            </button>

            <button
              v-if="hasRated"
              class="rating-delete-btn"
              @click="handleDelete"
              :disabled="loading"
            >
              <span class="delete-icon">🗑️</span>
              删除评价
            </button>

            <button
              class="rating-cancel-btn"
              @click="handleClose"
              :disabled="loading"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

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
    default: null
  },
  initialScore: {
    type: Number,
    default: 0
  },
  initialComment: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  hasRated: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'submit', 'delete'])

// Local form state
const localScore = ref(0)
const localComment = ref('')

// Sync with props when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    localScore.value = props.initialScore
    localComment.value = props.initialComment
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

function getScoreText(score) {
  const texts = {
    0: '未评分',
    1: '很差',
    2: '较差',
    3: '一般',
    4: '不错',
    5: '超赞'
  }
  return texts[score] || '未评分'
}

function handleSubmit() {
  if (localScore.value < 1) return
  emit('submit', { score: localScore.value, comment: localComment.value })
}

function handleDelete() {
  emit('delete')
}

function handleClose() {
  emit('update:show', false)
}
</script>

<style scoped>
@import '../assets/modal-shared.css';

.rating-modal {
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

.rating-content {
  background: var(--color-bg-secondary);
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  max-width: 500px;
  margin: 20px;
  position: relative;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.rating-header {
  text-align: center;
  margin-bottom: 32px;
}

.rating-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.rating-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
}

.rating-subtitle {
  color: var(--color-text-muted);
  font-size: 14px;
  margin: 0;
}

.dish-indicator {
  color: var(--color-accent-primary);
}

.rating-stars {
  margin-bottom: 32px;
  text-align: center;
}

.rating-label {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0 0 16px 0;
}

.stars-container {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.star-btn {
  width: 56px;
  height: 56px;
  border: none;
  background: var(--color-bg-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.star-btn:hover {
  transform: scale(1.1);
  background: var(--color-bg-accent);
}

.star-btn.active {
  background: var(--color-accent-primary);
}

.star-icon {
  font-size: 28px;
  color: #CCC;
  transition: all 0.3s ease;
}

.star-btn.active .star-icon {
  color: #FFD700;
}

.star-btn:hover .star-icon {
  color: #FFB74D;
}

.stars-hint {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 8px 0 0 0;
}

.rating-comment {
  margin-bottom: 32px;
}

.comment-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.comment-textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid #EEE;
  border-radius: 12px;
  font-size: 15px;
  resize: vertical;
  transition: all 0.3s ease;
  background: var(--color-bg-accent);
  font-family: inherit;
  box-sizing: border-box;
}

.comment-textarea:focus {
  outline: none;
  border-color: var(--color-accent-primary);
  background: var(--color-bg-secondary);
  box-shadow: 0 0 0 4px rgba(255, 115, 84, 0.1);
}

.comment-textarea::placeholder {
  color: #CCC;
}

.rating-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.rating-submit-btn {
  flex: 1;
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
  min-width: 140px;
}

.rating-submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 115, 84, 0.35);
}

.rating-submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.rating-delete-btn {
  padding: 16px;
  background: var(--color-bg-accent);
  color: var(--color-accent-primary);
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
  min-width: 140px;
}

.rating-delete-btn:hover:not(:disabled) {
  background: #FFD0C2;
  transform: translateY(-2px);
}

.rating-delete-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.rating-cancel-btn {
  padding: 16px;
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
}

.rating-cancel-btn:hover:not(:disabled) {
  background: var(--color-bg-primary);
  transform: translateY(-2px);
}

.rating-cancel-btn:disabled {
  opacity: 0.7;
}

.spinner {
  animation: spin 1s linear infinite;
}
</style>
