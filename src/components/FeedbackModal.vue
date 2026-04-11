<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="feedback-modal" @click.self="handleClose">
        <div class="feedback-content" @click.stop>
          <button class="modal-close" @click="handleClose">✕</button>

          <!-- 成功提示 -->
          <div v-if="success" class="feedback-success">
            <div class="success-icon">✅</div>
            <h2 class="success-title">{{ formType === 'restaurant' ? '餐馆申请已提交' : '反馈已提交' }}</h2>
            <template v-if="formType === 'restaurant'">
              <p class="success-text">餐馆：{{ form.name }}</p>
              <p class="success-text">位置：{{ form.location }}</p>
            </template>
            <template v-else>
              <p class="success-text">{{ form.feedback_content.substring(0, 50) }}{{ form.feedback_content.length > 50 ? '...' : '' }}</p>
            </template>
            <p class="success-hint">{{ formType === 'restaurant' ? '等待管理员审核...' : '感谢您的反馈！' }}</p>
            <button class="success-btn" @click="handleClose">知道了</button>
          </div>

          <!-- 表单 -->
          <div v-else>
            <div class="feedback-header">
              <div class="feedback-icon">{{ formType === 'restaurant' ? '🏪' : '💬' }}</div>
              <h2 class="feedback-title">{{ formType === 'restaurant' ? '申请餐馆' : '我有话说' }}</h2>
              <p class="feedback-subtitle">{{ formType === 'restaurant' ? '补充遗漏的餐馆' : '提出建议或问题' }}</p>
            </div>

            <!-- 类型选择 -->
            <div class="type-radio-group">
              <div class="type-radio-item">
                <input
                  type="radio"
                  id="type-feedback"
                  v-model="formType"
                  value="feedback"
                  class="type-radio"
                />
                <label for="type-feedback" class="type-radio-label">
                  <span class="type-icon">💡</span>
                  <span class="type-text">反馈意见</span>
                </label>
              </div>
              <div class="type-radio-item">
                <input
                  type="radio"
                  id="type-restaurant"
                  v-model="formType"
                  value="restaurant"
                  class="type-radio"
                />
                <label for="type-restaurant" class="type-radio-label">
                  <span class="type-icon">🏪</span>
                  <span class="type-text">申请餐馆</span>
                </label>
              </div>
            </div>

            <div class="feedback-form">
              <!-- 反馈表单 -->
              <template v-if="formType === 'feedback'">
                <div class="form-group">
                  <label class="form-label">反馈内容 *</label>
                  <textarea
                    v-model="form.feedback_content"
                    class="form-textarea"
                    placeholder="请输入您的反馈、建议或问题..."
                    rows="6"
                  ></textarea>
                </div>
              </template>

              <!-- 餐馆申请表单 -->
              <template v-else>
                <div class="form-group">
                  <label class="form-label">餐馆名称 *</label>
                  <input
                    v-model="form.name"
                    type="text"
                    class="form-input"
                    placeholder="输入餐馆名称"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">位置 *</label>
                  <div class="location-tags">
                    <button
                      v-for="loc in locations"
                      :key="loc"
                      type="button"
                      class="location-tag"
                      :class="{ active: form.location === loc }"
                      @click="form.location = loc"
                    >{{ loc }}</button>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">类型</label>
                  <div class="type-tags">
                    <button
                      v-for="cat in categories"
                      :key="cat"
                      type="button"
                      class="type-tag"
                      :class="{ active: form.tags.includes(cat) }"
                      @click="toggleTag(cat)"
                    >{{ cat }}</button>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">人均</label>
                  <input
                    v-model="form.price"
                    type="text"
                    class="form-input"
                    placeholder="如：¥15"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">距离</label>
                  <input
                    v-model="form.distance"
                    type="text"
                    class="form-input"
                    placeholder="如：5分钟"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">简介</label>
                  <textarea
                    v-model="form.description"
                    class="form-textarea"
                    placeholder="一句话介绍"
                    rows="2"
                  ></textarea>
                </div>
              </template>
            </div>

            <div class="feedback-actions">
              <button class="cancel-btn" @click="handleClose">取消</button>
              <button
                class="submit-btn"
                @click="handleSubmit"
                :disabled="loading || !canSubmit"
              >
                <span v-if="loading" class="spinner">⟳</span>
                {{ loading ? '提交中...' : '提交申请' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { supabase } from '../lib/supabase'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'submitted'])

const formType = ref('feedback')
const form = ref({
  name: '',
  tags: [],
  location: '',
  description: '',
  detail: '',
  price: '',
  distance: '',
  feedback_content: ''
})
const loading = ref(false)
const success = ref(false)

const locations = ['南门', '北门', '东门', '校内']
const categories = ['食堂', '快餐', '中餐', '日料', '火锅', '小吃', '饮品', '轻食', '夜宵']

const canSubmit = computed(() => {
  if (formType.value === 'feedback') {
    return form.value.feedback_content.trim().length > 0
  } else {
    return form.value.name.trim().length > 0 && form.value.location.length > 0
  }
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    resetForm()
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

function resetForm() {
  formType.value = 'feedback'
  form.value = {
    name: '',
    tags: [],
    location: '',
    description: '',
    detail: '',
    price: '',
    distance: '',
    feedback_content: ''
  }
  success.value = false
}

function toggleTag(tag) {
  const index = form.value.tags.indexOf(tag)
  if (index === -1) {
    form.value.tags.push(tag)
  } else {
    form.value.tags.splice(index, 1)
  }
}

async function handleSubmit() {
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('请先登录')
      return
    }

    const insertData = {
      user_id: user.id,
      type: formType.value
    }

    if (formType.value === 'restaurant') {
      insertData.name = form.value.name.trim()
      insertData.tags = form.value.tags
      insertData.location = form.value.location
      insertData.description = form.value.description.trim()
      insertData.price = form.value.price.trim()
      insertData.distance = form.value.distance.trim()
    } else {
      insertData.feedback_content = form.value.feedback_content.trim()
    }

    const { error } = await supabase
      .from('restaurant_applications')
      .insert(insertData)

    if (error) throw error

    success.value = true
    emit('submitted')
  } catch (error) {
    console.error('Submit error:', error)
    alert('提交失败：' + (error.message || '请重试'))
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

.feedback-modal {
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

.feedback-content {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: 28px;
  width: 100%;
  max-width: 420px;
  margin: 20px;
  position: relative;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-xl);
  max-height: 85vh;
  overflow-y: auto;
}

/* 成功状态 */
.feedback-success {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.success-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 12px;
}

.success-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0 0 8px;
  word-break: break-all;
}

.success-hint {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0 0 24px;
}

.success-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary));
  color: var(--color-text-light);
  border: none;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.success-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-accent);
}

/* 头部 */
.feedback-header {
  text-align: center;
  margin-bottom: 20px;
}

.feedback-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.feedback-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.feedback-subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 8px 0 0 0;
}

/* 类型选择 */
.type-radio-group {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.type-radio-item {
  flex: 1;
  position: relative;
}

.type-radio {
  display: none;
}

.type-radio-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 12px;
  background: var(--color-bg-accent);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.type-radio-label:hover {
  background: var(--color-bg-primary);
}

.type-radio input:checked + .type-radio-label {
  border-color: var(--color-accent-primary);
  background: var(--color-bg-accent);
}

.type-icon {
  font-size: 24px;
}

.type-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* 表单 */
.feedback-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
  background: var(--color-bg-accent);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
  background: var(--color-bg-secondary);
}

.form-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
  resize: vertical;
  background: var(--color-bg-accent);
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--color-accent-primary);
  background: var(--color-bg-secondary);
}

.location-tags,
.type-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.location-tag,
.type-tag {
  padding: 8px 14px;
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  border: 2px solid transparent;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.location-tag:hover,
.type-tag:hover {
  background: var(--color-bg-accent);
}

.location-tag.active,
.type-tag.active {
  background: var(--color-bg-accent);
  color: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
}

/* 按钮 */
.feedback-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary));
  color: var(--color-text-light);
  border: none;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-accent);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  width: 100%;
  padding: 14px;
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: var(--color-bg-accent);
  color: var(--color-text-primary);
}

.spinner {
  animation: spin 1s linear infinite;
}
</style>
