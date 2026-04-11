<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="modal-overlay" @click.self="handleClose">
        <div class="modal-container">
          <!-- 装饰元素 -->
          <div class="modal-decorations">
            <span class="deco-emoji deco-1">🎉</span>
            <span class="deco-emoji deco-2">✨</span>
            <span class="deco-emoji deco-3">🚀</span>
          </div>

          <!-- 关闭按钮 -->
          <button class="modal-close" @click="handleClose" title="关闭">
            ✕
          </button>

          <!-- 标题区域 -->
          <div class="modal-header">
            <div class="modal-icon">🍽️</div>
            <h2 class="modal-title">有什么新鲜事？</h2>
            <p class="modal-subtitle">来看看这次更新了什么</p>
          </div>

          <!-- 更新内容 -->
          <div class="modal-content">
            <div class="update-list">
              <div
                v-for="(update, index) in updates"
                :key="index"
                class="update-item"
                :style="{ animationDelay: `${index * 0.1}s` }"
              >
                <div class="update-icon">{{ update.icon }}</div>
                <div class="update-text">
                  <h4 class="update-title">{{ update.title }}</h4>
                  <p class="update-desc">{{ update.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部操作 -->
          <div class="modal-footer">
            <span class="version-tag">v{{ UPDATE_VERSION }}</span>
            <button class="btn-primary" @click="handleClose">
              我知道了
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
  }
})

const emit = defineEmits(['update:show'])

// 更新内容版本号 - 每次发布新版本时修改这里的版本号和内容
const UPDATE_VERSION = '1.0.0'

// 更新内容 - 每次发布新版本时修改这里的版本号和内容
const updates = [
  {
    icon: '🐳',
    title: 'Docker 部署支持',
    description: '现在可以使用 Docker 一键部署了！支持 GitHub Actions CI/CD 自动构建和更新。'
  },
  {
    icon: '🐛',
    title: 'Bug 修复',
    description: '修复了认证状态订阅的返回值错误，现在登录状态可以正确同步了。'
  },
  {
    icon: '✨',
    title: '体验优化',
    description: '优化了首页内容和 UI，让"今天吃什么"变得更加有趣。'
  }
]

// 今天不再显示的复选框（保留兼容，但不再主要使用）
const dontShowToday = ref(false)

// 重置"今天不再显示"状态（用于手动触发显示时）
function resetDontShow() {
  dontShowToday.value = false
}

// 检查是否应该显示弹窗（基于版本号）
function shouldShowModal() {
  const lastSeenVersion = localStorage.getItem('update_modal_version')
  // 如果版本号不匹配或从未看过，则显示
  return lastSeenVersion !== UPDATE_VERSION
}

// 手动触发显示弹窗（用于用户点击"查看更新内容"）
function showModalManually() {
  resetDontShow()
  emit('update:show', true)
}

// 关闭弹窗
function handleClose() {
  // 保存版本号，表示已看过此版本更新
  localStorage.setItem('update_modal_version', UPDATE_VERSION)

  // 如果勾选了"今天不再显示"（兼容旧逻辑）
  if (dontShowToday.value) {
    localStorage.setItem('update_modal_dont_show_today', new Date().toDateString())
  }

  emit('update:show', false)
}

// 监听 show 属性变化
watch(() => props.show, (newVal) => {
  if (newVal) {
    // 弹窗显示时重置复选框
    dontShowToday.value = false
    // 锁定背景滚动
    document.body.style.overflow = 'hidden'
  } else {
    // 恢复背景滚动
    document.body.style.overflow = ''
  }
})

// 暴露检查方法供外部调用
defineExpose({
  shouldShowModal,
  showModalManually
})
</script>

<style scoped>
@import '../assets/modal-shared.css';

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: 20px;
}

.modal-container {
  background: linear-gradient(145deg, var(--color-bg-secondary) 0%, var(--color-bg-primary) 100%);
  border-radius: var(--radius-xl);
  max-width: 480px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  position: relative;
  box-shadow: var(--shadow-xl);
}

/* 装饰元素 */
.modal-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  overflow: hidden;
  pointer-events: none;
}

.deco-emoji {
  position: absolute;
  font-size: 2rem;
  opacity: 0.15;
  animation: float 3s ease-in-out infinite;
}

.deco-1 {
  top: 10px;
  left: 20px;
  animation-delay: 0s;
}

.deco-2 {
  top: 20px;
  right: 40px;
  animation-delay: 0.5s;
}

.deco-3 {
  top: 5px;
  right: 80px;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 标题区域 */
.modal-header {
  text-align: center;
  padding: 40px 32px 24px;
}

.modal-icon {
  font-size: 3.5rem;
  margin-bottom: 12px;
  animation: bounce 1s ease-in-out;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.modal-subtitle {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  margin: 0;
}

/* 更新内容 */
.modal-content {
  padding: 0 32px;
  max-height: 300px;
  overflow-y: auto;
}

.update-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.update-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color-light);
  animation: slideIn 0.4s ease-out both;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.update-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
}

.update-text {
  flex: 1;
}

.update-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}

.update-desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* 底部操作 */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px 32px;
  border-top: 1px solid var(--border-color-light);
  margin-top: 24px;
}

.dont-show {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  cursor: pointer;
}

.dont-show input {
  width: 16px;
  height: 16px;
  accent-color: var(--color-accent-primary);
  cursor: pointer;
}

.btn-primary {
  padding: 12px 28px;
  background: linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary));
  color: var(--color-text-light);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-accent);
}

/* 版本标签 */
.version-tag {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  background: var(--border-color);
  padding: 4px 10px;
  border-radius: 20px;
}

/* 滚动条样式 */
.modal-content::-webkit-scrollbar {
  width: 4px;
}

.modal-content::-webkit-scrollbar-track {
  background: transparent;
}

.modal-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

/* 响应式 */
@media (max-width: 480px) {
  .modal-container {
    max-height: 90vh;
  }

  .modal-header {
    padding: 32px 20px 16px;
  }

  .modal-content {
    padding: 0 20px;
  }

  .modal-footer {
    padding: 20px;
    flex-direction: column;
    gap: 16px;
  }

  .btn-primary {
    width: 100%;
  }
}
</style>
