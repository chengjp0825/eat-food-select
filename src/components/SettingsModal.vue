<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="settings-modal" @click.self="handleClose">
        <div class="settings-content" @click.stop>
          <button class="modal-close" @click="handleClose">✕</button>

          <div class="settings-header">
            <div class="settings-icon">⚙️</div>
            <h2 class="settings-title">个人设置</h2>
          </div>

          <!-- 用户信息展示 -->
          <div class="settings-profile">
            <div class="profile-avatar">{{ (profile?.username || userEmail || 'U').charAt(0).toUpperCase() }}</div>
            <div class="profile-info">
              <div class="profile-email">{{ profile?.username || userEmail }}</div>
              <div class="profile-joined" v-if="profile?.created_at">注册于：{{ formatDate(profile.created_at) }}</div>
            </div>
          </div>

          <!-- 统计数据 -->
          <div class="settings-stats" v-if="stats">
            <div class="stat-box">
              <span class="stat-value">{{ stats.ratings }}</span>
              <span class="stat-label">评价数</span>
            </div>
            <div class="stat-box">
              <span class="stat-value">{{ stats.favorites }}</span>
              <span class="stat-label">收藏数</span>
            </div>
            <div class="stat-box">
              <span class="stat-value">{{ stats.history }}</span>
              <span class="stat-label">历史记录</span>
            </div>
          </div>

          <!-- 历史记录区域 -->
          <div class="history-section">
            <div class="history-header" @click="showHistorySection = !showHistorySection">
              <h3 class="history-title">
                <i class="bi bi-clock-history" style="margin-right: 8px;"></i>
                浏览历史记录
              </h3>
              <span class="history-toggle">
                {{ showHistorySection ? '收起' : '展开' }}
                <i :class="['bi', showHistorySection ? 'bi-chevron-up' : 'bi-chevron-down']"></i>
              </span>
            </div>

            <div v-if="showHistorySection" class="history-content">
              <div class="history-actions">
                <button
                  class="btn-history-action"
                  @click="loadHistory"
                  :disabled="historyLoading"
                >
                  <i class="bi bi-arrow-clockwise"></i>
                  刷新
                </button>
                <button
                  class="btn-history-action btn-danger"
                  @click="clearHistory"
                  :disabled="historyLoading || historyList.length === 0"
                >
                  <i class="bi bi-trash"></i>
                  清空
                </button>
              </div>

              <!-- 加载状态 -->
              <div v-if="historyLoading" class="history-loading">
                <div class="loading-spinner"></div>
                <p>加载中...</p>
              </div>

              <!-- 历史记录列表 -->
              <div v-else-if="historyList.length > 0" class="history-list">
                <div
                  v-for="item in historyList"
                  :key="item.id"
                  class="history-item"
                  @click="openRestaurantDetail(item.restaurant_id)"
                >
                  <div class="history-item-header">
                    <span class="history-item-name">{{ item.restaurants?.name || '未知餐馆' }}</span>
                    <span class="history-item-time">{{ formatDate(item.created_at) }}</span>
                  </div>
                  <div class="history-item-restaurant" v-if="item.restaurants?.description">
                    {{ item.restaurants.description.substring(0, 60) }}{{ item.restaurants.description.length > 60 ? '...' : '' }}
                  </div>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-else class="history-empty">
                <i class="bi bi-clock"></i>
                <p>暂无浏览历史</p>
                <p class="history-empty-hint">浏览餐馆后会在这里显示记录</p>
              </div>
            </div>
          </div>

          <!-- 设置表单 -->
          <div class="settings-form">
            <div class="form-group">
              <label class="form-label">用户名</label>
              <input
                v-model="username"
                type="text"
                class="form-input"
                placeholder="输入你的用户名"
                :disabled="usernameChangeBlocked"
              />
              <p v-if="usernameChangeBlocked" class="form-hint error">
                ⚠️ 修改间隔不足30天
              </p>
              <p v-else class="form-hint">其他用户将看到你的用户名</p>
            </div>

            <div class="form-group">
              <label class="form-checkbox">
                <input type="checkbox" v-model="anonymous" />
                <span class="checkbox-label">
                  <span class="checkbox-icon">{{ anonymous ? '☑️' : '⬜' }}</span>
                  <span>匿名评价</span>
                </span>
              </label>
              <p class="form-hint">开启后，你的评价将显示为"匿名用户"</p>
            </div>
          </div>

          <div class="settings-actions">
            <button class="save-btn" @click="handleSave" :disabled="loading || usernameChangeBlocked">
              <span v-if="loading" class="spinner">⟳</span>
              {{ loading ? '保存中...' : '保存设置' }}
            </button>
            <button class="cancel-btn" @click="handleClose" :disabled="loading">取消</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { supabase } from '../lib/supabase'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  profile: {
    type: Object,
    default: null
  },
  userEmail: {
    type: String,
    default: ''
  },
  historyList: {
    type: Array,
    default: () => []
  },
  onLoadHistory: {
    type: Function,
    default: null
  },
  onClearHistory: {
    type: Function,
    default: null
  },
  onOpenRestaurant: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['update:show', 'saved'])

const username = ref('')
const anonymous = ref(false)
const loading = ref(false)
const usernameChangeBlocked = ref(false)
const stats = ref(null)
const showHistorySection = ref(false)
const historyLoading = ref(false)

watch(() => props.show, async (newVal) => {
  if (newVal) {
    username.value = props.profile?.username || ''
    anonymous.value = props.profile?.is_anonymous || false
    usernameChangeBlocked.value = false
    showHistorySection.value = false
    document.body.style.overflow = 'hidden'

    if (props.profile?.last_username_changed) {
      const lastChanged = new Date(props.profile.last_username_changed)
      const now = new Date()
      const daysSince = (now - lastChanged) / (1000 * 60 * 60 * 24)
      if (daysSince < 30) {
        usernameChangeBlocked.value = true
      }
    }

    await loadStats()
  } else {
    document.body.style.overflow = ''
  }
})

async function loadStats() {
  if (!props.profile?.id) return

  try {
    const [favoritesResult, ratingsResult, historyResult] = await Promise.all([
      supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', props.profile.id),
      supabase.from('ratings').select('id', { count: 'exact', head: true }).eq('user_id', props.profile.id),
      supabase.from('history').select('id', { count: 'exact', head: true }).eq('user_id', props.profile.id)
    ])

    stats.value = {
      favorites: favoritesResult.count || 0,
      ratings: ratingsResult.count || 0,
      history: historyResult.count || 0
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
}

async function loadHistory() {
  if (props.onLoadHistory) {
    historyLoading.value = true
    try {
      await props.onLoadHistory()
    } finally {
      historyLoading.value = false
    }
  }
}

async function clearHistory() {
  if (props.onClearHistory && confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
    historyLoading.value = true
    try {
      await props.onClearHistory()
    } finally {
      historyLoading.value = false
    }
  }
}

function openRestaurantDetail(restaurantId) {
  if (props.onOpenRestaurant) {
    props.onOpenRestaurant(restaurantId)
  }
}

async function handleSave() {
  loading.value = true
  try {
    const updates = {
      username: username.value.trim(),
      is_anonymous: anonymous.value
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', props.profile.id)

    if (error) throw error

    emit('saved')
    emit('update:show', false)
  } catch (error) {
    console.error('Save settings error:', error)
    alert('保存失败：' + (error.message || '请重试'))
  } finally {
    loading.value = false
  }
}

function handleClose() {
  emit('update:show', false)
}
</script>

<style scoped>
@import '../assets/modal-shared.css';

.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  animation: fadeIn 0.3s ease;
}

.settings-content {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: 32px;
  width: 100%;
  max-width: 420px;
  margin: 20px;
  position: relative;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-xl);
  max-height: 85vh;
  overflow-y: auto;
}

/* 头部 */
.settings-header {
  text-align: center;
  margin-bottom: 28px;
}

.settings-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.settings-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

/* 用户信息展示 */
.settings-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--color-bg-accent);
  border-radius: var(--radius-lg);
  margin-bottom: 20px;
}

.profile-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-light);
}

.profile-info {
  flex: 1;
}

.profile-email {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.profile-joined {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* 统计数据 */
.settings-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-box {
  flex: 1;
  padding: 16px;
  background: var(--color-bg-accent);
  border-radius: var(--radius-md);
  text-align: center;
}

.stat-box .stat-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: var(--color-accent-primary);
  line-height: 1;
}

.stat-box .stat-label {
  display: block;
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 6px;
}

/* 表单 */
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.form-input {
  padding: 14px 16px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 15px;
  transition: all 0.3s ease;
  background: var(--color-bg-accent);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 4px rgba(232, 93, 75, 0.1);
  background: var(--color-bg-secondary);
}

.form-input:disabled {
  background: var(--color-bg-primary);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.form-hint {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
}

.form-hint.error {
  color: var(--color-warning);
  font-weight: 500;
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.form-checkbox input {
  display: none;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-primary);
}

.checkbox-icon {
  font-size: 18px;
}

/* 按钮 */
.settings-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.save-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary));
  color: var(--color-text-light);
  border: none;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-accent);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cancel-btn {
  width: 100%;
  padding: 14px;
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  border: none;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover:not(:disabled) {
  background: var(--color-bg-accent);
  color: var(--color-text-primary);
}

.cancel-btn:disabled {
  opacity: 0.7;
}

.spinner {
  animation: spin 1s linear infinite;
}

/* 历史记录区域 */
.history-section {
  margin-bottom: 20px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--color-bg-accent);
  cursor: pointer;
  transition: background 0.2s ease;
}

.history-header:hover {
  background: var(--color-bg-primary);
}

.history-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.history-toggle {
  font-size: 12px;
  color: var(--color-text-muted);
}

.history-content {
  padding: 16px;
  background: var(--color-bg-secondary);
}

.history-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.btn-history-action {
  padding: 6px 12px;
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  border: none;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-history-action:hover:not(:disabled) {
  background: var(--color-bg-accent);
  color: var(--color-text-primary);
}

.btn-history-action.btn-danger {
  color: var(--color-warning);
}

.btn-history-action.btn-danger:hover:not(:disabled) {
  background: var(--color-bg-accent);
  color: var(--color-accent-primary);
}

.btn-history-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.history-loading {
  text-align: center;
  padding: 20px;
  color: var(--color-text-muted);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-top-color: var(--color-accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 8px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  padding: 10px 12px;
  background: var(--color-bg-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.history-item:hover {
  background: var(--color-bg-accent);
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.history-item-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.history-item-time {
  font-size: 11px;
  color: var(--color-text-muted);
}

.history-item-restaurant {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.history-empty {
  text-align: center;
  padding: 20px;
  color: var(--color-text-muted);
}

.history-empty i {
  font-size: 24px;
  margin-bottom: 8px;
  display: block;
}

.history-empty p {
  margin: 0 0 4px;
  font-size: 13px;
}

.history-empty-hint {
  font-size: 11px;
  color: var(--color-text-muted);
  opacity: 0.7;
}
</style>
