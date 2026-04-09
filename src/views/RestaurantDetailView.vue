<template>
  <div class="restaurant-detail">
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
              <router-link to="/" class="nav-link">首页</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/food-selector" class="nav-link">今天吃什么</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- 主内容 - 居中显示 -->
    <div class="main-content">
      <div class="content-wrapper">
        <div class="illustration-container">
          <span class="main-emoji">🍳</span>
          <span class="secondary-emoji emoji-1">🥢</span>
          <span class="secondary-emoji emoji-2">🍜</span>
          <span class="secondary-emoji emoji-3">🥡</span>
        </div>

        <h1 class="title">等一下嘛~</h1>

        <div class="subtitle-wrapper">
          <p class="subtitle">
            这家餐厅的详细信息正在<span class="highlight">精心烹制</span>中
          </p>
          <p class="subtitle-second">
            就像刚下单的外卖，总需要那么几分钟准备
          </p>
        </div>

        <div class="progress-section">
          <div class="progress-track">
            <div class="progress-fill"></div>
            <div class="progress-particles">
              <span class="particle" v-for="n in 5" :key="n"></span>
            </div>
          </div>
          <p class="progress-text">
            <span class="cooking-icon">🔥</span>
            大厨正在颠勺，耐心等待...
          </p>
        </div>

        <div class="quotes-section">
          <div class="quote-card">
            <p class="quote-text">
              "好吃的东西值得等待，<br>
              就像实验室的咖啡，<br>
              <strong>虽然总是凉的</strong>，<br>
              但依然让人牵挂。"
            </p>
          </div>
        </div>

        <div class="action-section">
          <router-link to="/food-selector" class="btn btn-primary btn-lg">
            <span class="btn-icon">🎰</span>
            先去转盘赌一把
          </router-link>
          <router-link to="/" class="btn btn-outline btn-lg">
            溜回首页
          </router-link>
        </div>

        <div class="fun-facts">
          <p class="fun-fact">
            💡 tip: 选择困难时，就选红烧肉
          </p>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <footer>
      <div class="container">
        <p class="footer-copyright">© 2026 实验室内部使用 · 美食值得等待</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 确保页面滚动到顶部 - 多种方式确保生效
  requestAnimationFrame(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    })
  })
})
</script>

<style scoped>
.restaurant-detail {
  background-color: var(--color-bg-primary);
  background-image:
    radial-gradient(circle at 20% 80%, rgba(232, 93, 75, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 139, 117, 0.05) 0%, transparent 50%);
}

.main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 70px var(--space-lg) var(--space-lg);
}

.content-wrapper {
  text-align: center;
  max-width: 480px;
  margin: 0 auto;
}

/* 动画图标组 */
.illustration-container {
  position: relative;
  width: 140px;
  height: 100px;
  margin: 0 auto var(--space-2xl);
}

.main-emoji {
  font-size: 5rem;
  display: block;
  animation: bounce 1s ease-in-out infinite;
  filter: drop-shadow(0 8px 16px rgba(232, 93, 75, 0.3));
}

.secondary-emoji {
  position: absolute;
  font-size: 1.5rem;
  opacity: 0;
  animation: floatAround 3s ease-in-out infinite;
}

.emoji-1 {
  top: 0;
  left: -10px;
  animation-delay: 0s;
}

.emoji-2 {
  top: 20px;
  right: -15px;
  animation-delay: 1s;
}

.emoji-3 {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 2s;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(-5deg); }
  75% { transform: translateY(-5px) rotate(5deg); }
}

@keyframes floatAround {
  0% { opacity: 0; transform: translateY(20px) scale(0.5); }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-30px) scale(1.2); }
}

/* 标题 */
.title {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-lg);
  letter-spacing: -0.02em;
  animation: fadeInUp 0.8s ease-out forwards;
}

.subtitle-wrapper {
  margin-bottom: var(--space-2xl);
  animation: fadeInUp 0.8s ease-out 0.1s forwards;
  opacity: 0;
}

.subtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
  line-height: 1.8;
  max-width: none;
}

.subtitle-second {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  max-width: none;
}

.highlight {
  color: var(--color-accent-primary);
  font-weight: 600;
}

/* 进度条 */
.progress-section {
  margin-bottom: var(--space-2xl);
  animation: fadeInUp 0.8s ease-out 0.2s forwards;
  opacity: 0;
}

.progress-track {
  position: relative;
  height: 12px;
  background-color: var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: var(--space-md);
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg,
    var(--color-accent-primary) 0%,
    var(--color-accent-secondary) 50%,
    var(--color-accent-primary) 100%
  );
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer 2s linear infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.progress-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background-color: var(--color-accent-secondary);
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
  animation: particleMove 2s ease-in-out infinite;
}

.particle:nth-child(1) { left: 10%; animation-delay: 0s; }
.particle:nth-child(2) { left: 30%; animation-delay: 0.3s; }
.particle:nth-child(3) { left: 50%; animation-delay: 0.6s; }
.particle:nth-child(4) { left: 70%; animation-delay: 0.9s; }
.particle:nth-child(5) { left: 90%; animation-delay: 1.2s; }

@keyframes particleMove {
  0% { opacity: 0; transform: translateY(-50%) scale(0); }
  50% { opacity: 1; transform: translateY(-50%) scale(1); }
  100% { opacity: 0; transform: translateY(-50%) scale(0); }
}

.progress-text {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: 0;
}

.cooking-icon {
  display: inline-block;
  animation: flicker 0.5s ease-in-out infinite alternate;
}

@keyframes flicker {
  0% { transform: scale(1); }
  100% { transform: scale(1.2); }
}

/* 引用卡片 */
.quotes-section {
  margin-bottom: var(--space-2xl);
  animation: fadeInUp 0.8s ease-out 0.3s forwards;
  opacity: 0;
}

.quote-card {
  position: relative;
  padding: var(--space-xl);
  background: linear-gradient(135deg, var(--color-bg-accent) 0%, var(--color-bg-secondary) 100%);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color-light);
}

.quote-card::before {
  content: '"';
  position: absolute;
  top: -10px;
  left: 20px;
  font-family: 'Playfair Display', serif;
  font-size: 4rem;
  color: var(--color-accent-primary);
  opacity: 0.3;
  line-height: 1;
}

.quote-text {
  font-size: 1rem;
  color: var(--color-text-secondary);
  line-height: 1.8;
  margin-bottom: 0;
  font-style: italic;
  max-width: none;
}

.quote-text strong {
  color: var(--color-accent-primary);
  font-style: normal;
}

/* 按钮 */
.action-section {
  display: flex;
  gap: var(--space-lg);
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: var(--space-2xl);
  animation: fadeInUp 0.8s ease-out 0.4s forwards;
  opacity: 0;
}

.btn-lg {
  padding: var(--space-md) var(--space-xl);
  font-size: 1rem;
}

.btn-icon {
  margin-right: var(--space-sm);
}

/* 趣味提示 */
.fun-facts {
  animation: fadeInUp 0.8s ease-out 0.5s forwards;
  opacity: 0;
}

.fun-fact {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  padding: var(--space-md) var(--space-lg);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-color);
  margin-bottom: 0;
  max-width: none;
}

/* 页脚 */
footer {
  color: rgba(255, 255, 255, 0.9);
  background-color: var(--color-text-primary);
  padding: var(--space-2xl) 0;
}

.footer-copyright {
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8125rem;
  margin-bottom: 0;
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式 */
@media (max-width: 480px) {
  .title {
    font-size: 2rem;
  }

  .main-emoji {
    font-size: 4rem;
  }

  .action-section {
    flex-direction: column;
  }

  .action-section .btn {
    width: 100%;
  }

  .quote-text {
    font-size: 0.9375rem;
  }
}
</style>
