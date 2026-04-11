<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1 class="auth-title">🍽️ 部落生存手册</h1>
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

          <div v-if="!isLogin" class="form-group agreement-group">
            <label class="agreement-label">
              <input type="checkbox" v-model="agreedToTerms" class="agreement-checkbox" required />
              <span>我已阅读并同意<a href="#" @click.prevent="showAgreement = true" class="agreement-link">《用户协议》</a></span>
            </label>
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

        <!-- 用户协议弹窗 -->
        <Teleport to="body">
          <Transition name="modal-fade">
            <div v-if="showAgreement" class="modal-overlay" @click.self="showAgreement = false">
              <div class="agreement-modal">
                <button class="modal-close" @click="showAgreement = false">✕</button>
                <h2 class="agreement-title">用户协议</h2>
                <div class="agreement-content">
                  <p><strong>一、服务条款</strong></p>
                  <p>欢迎使用美食分享平台。使用本服务即表示您同意以下条款。</p>
                  <p><strong>二、用户内容</strong></p>
                  <p>您在本平台发布的所有内容（包括评论、图片、评分等）版权归您所有，但您授予本平台全球范围内免费、非独占的使用权。</p>
                  <p><strong>三、隐私保护</strong></p>
                  <p>我们尊重您的隐私，不会未经同意分享您的个人信息给第三方。</p>
                  <p><strong>四、账户安全</strong></p>
                  <p>您有责任保管好您的账户密码，因个人保管不当造成的损失由您自行承担。</p>
                  <p><strong>五、免责声明</strong></p>
                  <p>本平台对用户发布的内容真实性不承担责任，请谨慎判断。</p>
                </div>
                <button class="btn-primary" @click="showAgreement = false">我已知晓</button>
              </div>
            </div>
          </Transition>
        </Teleport>
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
const agreedToTerms = ref(false)
const showAgreement = ref(false)

const toggleMode = () => {
  isLogin.value = !isLogin.value
  error.value = ''
  agreedToTerms.value = false
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

  if (!isLogin.value && !agreedToTerms.value) {
    error.value = '请先阅读并同意用户协议'
    return
  }

  loading.value = true

  try {
    if (isLogin.value) {
      await signIn(email.value, password.value)
    } else {
      // 注册流程：直接调用 signUp，让 Supabase 判断用户是否已存在
      await signUp(email.value, password.value)
      // 注册成功后切换到登录界面，让用户去邮箱确认
      isLogin.value = true
      error.value = '注册成功，请前往邮箱点击链接验证后登录'
      loading.value = false
      return
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
    } else if (err.message && (err.message.includes('already') || err.message.includes('exists'))) {
      error.value = '该邮箱已注册，请直接登录'
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
  background: linear-gradient(135deg, var(--color-bg-accent) 0%, var(--color-bg-primary) 50%, var(--color-bg-accent) 100%);
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
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: 40px 32px;
  box-shadow: var(--shadow-lg);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-accent-primary);
  margin: 0 0 12px 0;
}

.auth-subtitle {
  color: var(--color-text-muted);
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
  background: var(--color-bg-secondary);
  box-shadow: 0 0 0 4px rgba(232, 93, 75, 0.1);
}

.form-input::placeholder {
  color: var(--color-text-muted);
}

.error-message {
  color: var(--color-accent-primary);
  font-size: 13px;
  padding: 12px;
  background: var(--color-bg-accent);
  border-radius: var(--radius-sm);
  text-align: center;
}

.auth-button {
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

.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-accent);
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
  color: var(--color-text-muted);
  font-size: 14px;
}

.auth-link {
  color: var(--color-accent-primary);
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
  color: var(--color-text-muted);
  font-size: 13px;
  text-decoration: none;
}

.skip-link a:hover {
  color: var(--color-text-secondary);
}

/* 用户协议 */
.agreement-group {
  flex-direction: row;
  align-items: center;
}

.agreement-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.agreement-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--color-accent-primary);
  cursor: pointer;
}

.agreement-link {
  color: var(--color-accent-primary);
  text-decoration: none;
}

.agreement-link:hover {
  text-decoration: underline;
}

/* 协议弹窗 */
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

.agreement-modal {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: 32px;
  max-width: 420px;
  width: 100%;
  max-height: 70vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: var(--shadow-xl);
}

.agreement-modal .modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border: none;
  background: var(--border-color);
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.agreement-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 16px;
  text-align: center;
}

.agreement-content {
  flex: 1;
  overflow-y: auto;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 20px;
}

.agreement-content p {
  margin: 0 0 12px;
}

.agreement-content strong {
  color: var(--color-text-primary);
}

.agreement-modal .btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary));
  color: var(--color-text-light);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>