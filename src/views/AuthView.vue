<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1 class="auth-title">🍽️ 美食分享</h1>
          <p class="auth-subtitle">{{ isLogin ? '登录后开始选择今天的美食' : '注册账号，记录你的美食之旅' }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div class="form-group">
            <label class="form-label">邮箱</label>
            <input
              v-model="email"
              type="email"
              class="form-input"
              placeholder="your@email.com"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">密码</label>
            <input
              v-model="password"
              type="password"
              class="form-input"
              placeholder="至少 6 位密码"
              required
              minlength="6"
            />
          </div>

          <div v-if="!isLogin" class="form-group">
            <label class="form-label">确认密码</label>
            <input
              v-model="confirmPassword"
              type="password"
              class="form-input"
              placeholder="再次输入密码"
              required
              minlength="6"
            />
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <button type="submit" class="auth-button" :disabled="loading">
            <span v-if="loading" class="spinner">⟳</span>
            {{ loading ? '处理中...' : (isLogin ? '登录' : '注册') }}
          </button>
        </form>

        <div class="auth-footer">
          <p v-if="isLogin">
            还没有账号？
            <a href="#" @click.prevent="toggleMode" class="auth-link">立即注册</a>
          </p>
          <p v-else>
            已有账号？
            <a href="#" @click.prevent="toggleMode" class="auth-link">立即登录</a>
          </p>
        </div>

        <div class="skip-link">
          <a href="/food-selector" @click.prevent="goHome">跳过，直接使用 ></a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { signUp, signIn } = useAuth()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

const toggleMode = () => {
  isLogin.value = !isLogin.value
  error.value = ''
}

const handleSubmit = async () => {
  error.value = ''

  // 验证
  if (!email.value || !password.value) {
    error.value = '请填写所有字段'
    return
  }

  if (!isLogin.value && password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }

  loading.value = true

  try {
    if (isLogin.value) {
      await signIn(email.value, password.value)
    } else {
      await signUp(email.value, password.value)
      // 注册成功后自动登录
      await signIn(email.value, password.value)
    }
    // 跳转到首页（使用 push 而不是 go(-1) 以确保状态正确更新）
    router.push('/')
  } catch (err) {
    console.error('Auth error:', err)
    // 显示更详细的错误信息
    if (err.message && err.message.includes('profiles')) {
      error.value = '注册失败：数据库表未设置，请在 Supabase SQL Editor 中执行 schema.sql'
    } else if (err.message && err.message.includes('rate limit')) {
      error.value = '注册失败：邮件发送频率限制，请等待几分钟后再尝试，或联系管理员调整 Supabase 邮件限制'
    } else {
      error.value = err.message || '操作失败，请重试'
    }
  } finally {
    loading.value = false
  }
}

const goHome = () => {
  router.push('/food-selector')
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FFF8F5 0%, #FDF9F1 50%, #FFF0EE 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-container {
  width: 100%;
  max-width: 420px;
}

.auth-card {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 40px 32px;
  box-shadow: 0 20px 60px rgba(255, 115, 84, 0.15);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-title {
  font-size: 28px;
  font-weight: 700;
  color: #FF7354;
  margin: 0 0 12px 0;
}

.auth-subtitle {
  color: #888;
  font-size: 14px;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-input {
  padding: 14px 16px;
  border: 2px solid #EEE;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: #FAFAFA;
}

.form-input:focus {
  outline: none;
  border-color: #FF7354;
  background: #FFF;
  box-shadow: 0 0 0 4px rgba(255, 115, 84, 0.1);
}

.form-input::placeholder {
  color: #CCC;
}

.error-message {
  color: #FF4757;
  font-size: 13px;
  padding: 12px;
  background: #FFF0F0;
  border-radius: 8px;
  text-align: center;
}

.auth-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #FF8E6D, #FF7354);
  color: #FFF;
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

.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 115, 84, 0.35);
}

.auth-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-button .spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  color: #888;
  font-size: 14px;
}

.auth-link {
  color: #FF7354;
  font-weight: 600;
  text-decoration: none;
}

.auth-link:hover {
  text-decoration: underline;
}

.skip-link {
  text-align: center;
  margin-top: 20px;
}

.skip-link a {
  color: #999;
  font-size: 13px;
  text-decoration: none;
}

.skip-link a:hover {
  color: #666;
}
</style>