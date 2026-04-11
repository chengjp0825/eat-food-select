<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="winner-modal" @click="handleClose">
        <div class="winner-content" @click.stop>
          <div class="winner-icon">🎉</div>
          <h2 class="winner-title">恭喜你！</h2>
          <p class="winner-text">今天吃</p>
          <h3 class="winner-name">{{ winnerFood?.name }}</h3>
          <div class="winner-badges">
            <div class="winner-badge" :class="getRatingClass(getAvgRating(winnerFood?.id))">
              {{ getRatingLabel(getAvgRating(winnerFood?.id)) }}
            </div>
            <div class="winner-badge location">{{ winnerFood?.location }}</div>
          </div>
          <button class="winner-button" @click="handleClose">
            太棒了！
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  winnerFood: {
    type: Object,
    default: null
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
  }
})

const emit = defineEmits(['update:show'])

function handleClose() {
  emit('update:show', false)
}
</script>

<style scoped>
@import '../assets/modal-shared.css';

.winner-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.winner-content {
  background: var(--color-bg-secondary);
  border-radius: 28px;
  padding: 40px 36px;
  text-align: center;
  box-shadow: 0 24px 80px rgba(255, 115, 84, 0.25), 0 12px 24px rgba(0, 0, 0, 0.15);
  animation: winnerBounce 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
  max-width: 380px;
  width: 100%;
  overflow: hidden;
}

/* 装饰性背景 */
.winner-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #FF7354, #FF8E6D, #FFD93D, #6BD09D);
}

@keyframes winnerBounce {
  0% {
    opacity: 0;
    transform: scale(0.4) rotate(-12deg);
  }
  60% {
    transform: scale(1.08) rotate(4deg);
  }
  80% {
    transform: scale(0.96) rotate(-2deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.winner-icon {
  font-size: 72px;
  margin-bottom: 20px;
  display: block;
  animation: iconBounce 1.2s ease-in-out infinite;
}

@keyframes iconBounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-12px) rotate(-8deg); }
  75% { transform: translateY(-6px) rotate(8deg); }
}

.winner-title {
  color: var(--color-text-primary);
  font-size: 24px;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.winner-text {
  color: var(--color-text-muted);
  font-size: 15px;
  margin: 0 0 12px 0;
}

.winner-name {
  color: var(--color-accent-primary);
  font-size: 32px;
  margin: 0 0 24px 0;
  font-weight: 700;
}

.winner-badges {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.winner-badge {
  display: inline-block;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.winner-badge.top-tier {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: var(--color-text-light);
  box-shadow: 0 4px 16px rgba(255, 165, 0, 0.4);
}

.winner-badge.hot {
  background: linear-gradient(135deg, #FF6B6B, #FF4757);
  color: var(--color-text-light);
  box-shadow: 0 4px 16px rgba(255, 71, 87, 0.4);
}

.winner-badge.npc {
  background: linear-gradient(135deg, #B0B0B0, #808080);
  color: var(--color-text-light);
  box-shadow: 0 4px 16px rgba(128, 128, 128, 0.3);
}

.winner-badge.location {
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.winner-button {
  width: 100%;
  padding: 16px;
  border: none;
  background: linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary));
  color: var(--color-text-light);
  font-size: 16px;
  font-weight: 600;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(255, 115, 84, 0.35);
}

.winner-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(255, 115, 84, 0.45);
}

/* Responsive */
@media (max-width: 480px) {
  .winner-name {
    font-size: 28px;
  }

  .winner-content {
    padding: 32px 24px;
  }
}
</style>
