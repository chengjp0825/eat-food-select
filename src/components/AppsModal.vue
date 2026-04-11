<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="apps-modal" @click.self="handleClose">
        <div class="apps-content" @click.stop>
          <button class="modal-close" @click="handleClose">
            ✕
          </button>

          <div class="apps-header">
            <div class="apps-icon">📋</div>
            <h2 class="apps-title">{{ isAdmin ? '近期申请' : '我的申请' }}</h2>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="apps-loading">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>

          <!-- 申请列表 -->
          <div v-else-if="applications.length > 0" class="apps-list">
            <div
              v-for="app in applications"
              :key="app.id"
              class="app-item"
              :class="'status-' + app.status"
            >
              <div class="app-item-header">
                <span class="app-item-name">{{ app.name }}</span>
                <span class="app-item-status" :class="app.status">
                  {{ app.status === 'pending' ? '待审核' : app.status === 'approved' ? '已通过' : '已驳回' }}
                </span>
              </div>
              <div class="app-item-info">
                <span>📍 {{ app.location }}</span>
                <span>💰 {{ app.price || '未填写' }}</span>
              </div>
              <div class="app-item-desc" v-if="app.description">{{ app.description }}</div>
              <div class="app-item-date">提交于：{{ formatDate(app.created_at) }}</div>
              <!-- 管理员操作按钮 -->
              <div v-if="isAdmin && app.status === 'pending'" class="app-item-actions">
                <button class="approve-btn" @click="handleApprove(app.id)">批准</button>
                <button class="reject-btn" @click="handleReject(app.id)">驳回</button>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="apps-empty">
            <span class="empty-icon">📭</span>
            <p>暂无申请记录</p>
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
  isAdmin: {
    type: Boolean,
    default: false
  },
  applications: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'approve', 'reject'])

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

function handleApprove(id) {
  emit('approve', id)
}

function handleReject(id) {
  emit('reject', id)
}

function handleClose() {
  emit('update:show', false)
}
</script>

<style scoped>
@import '../assets/modal-shared.css';

.apps-modal {
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

.apps-content {
  background: var(--color-bg-secondary);
  border-radius: 24px;
  padding: 24px;
  width: 100%;
  max-width: 520px;
  margin: 20px;
  position: relative;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-height: 80vh;
  overflow-y: auto;
}

.apps-header {
  text-align: center;
  margin-bottom: 20px;
}

.apps-icon {
  font-size: 40px;
}

.apps-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 8px 0 0 0;
}

.apps-loading,
.apps-empty {
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

.apps-empty .empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.apps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.app-item {
  padding: 16px;
  background: var(--color-bg-accent);
  border-radius: 12px;
  border-left: 4px solid #CCC;
}

.app-item.status-pending {
  border-left-color: #E8A85D;
}

.app-item.status-approved {
  border-left-color: #5B9E6B;
}

.app-item.status-rejected {
  border-left-color: #E57373;
}

.app-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.app-item-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.app-item-status {
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.app-item-status.pending {
  background: #FFF3E0;
  color: #E65100;
}

.app-item-status.approved {
  background: #E8F5E9;
  color: #2E7D32;
}

.app-item-status.rejected {
  background: #FFEBEE;
  color: #C62828;
}

.app-item-info {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}

.app-item-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-bottom: 6px;
}

.app-item-date {
  font-size: 12px;
  color: var(--color-text-muted);
}

.app-item-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.approve-btn,
.reject-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.approve-btn {
  background: linear-gradient(135deg, #5B9E6B, #4A8A5B);
  color: var(--color-text-light);
}

.approve-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(91, 158, 107, 0.3);
}

.reject-btn {
  background: linear-gradient(135deg, #E57373, #D55A5A);
  color: var(--color-text-light);
}

.reject-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(229, 115, 115, 0.3);
}
</style>
