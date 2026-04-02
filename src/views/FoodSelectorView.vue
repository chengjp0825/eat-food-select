<template>
  <div class="food-selector">
    <div class="container">
      <!-- Header -->
      <header class="header">
        <h1 class="title">今天吃什么？</h1>
        <div class="toggle-switch">
          <button
            class="toggle-item"
            :class="{ active: viewMode === 'card' }"
            @click="switchMode('card')"
          >
            卡片模式
          </button>
          <button
            class="toggle-item"
            :class="{ active: viewMode === 'wheel' }"
            @click="switchMode('wheel')"
          >
            转盘模式
          </button>
        </div>
      </header>

      <!-- 分类筛选 -->
      <div class="filter-section">
        <!-- 地理位置分类 -->
        <div class="filter-group">
          <span class="filter-label">📍 位置</span>
          <div class="filter-tags">
            <button
              class="filter-tag"
              :class="{ active: selectedLocation === 'all' }"
              @click="selectedLocation = 'all'"
            >
              全部
            </button>
            <button
              v-for="location in locations"
              :key="location"
              class="filter-tag"
              :class="{ active: selectedLocation === location }"
              @click="selectedLocation = location"
            >
              {{ location }}
            </button>
          </div>
        </div>
        <!-- 食物类型分类 -->
        <div class="filter-group">
          <span class="filter-label">🍜 类型</span>
          <div class="filter-tags">
            <button
              class="filter-tag"
              :class="{ active: selectedCategory === 'all' }"
              @click="selectedCategory = 'all'"
            >
              全部
            </button>
            <button
              v-for="category in categories"
              :key="category"
              class="filter-tag"
              :class="{ active: selectedCategory === category }"
              @click="selectedCategory = category"
            >
              {{ category }}
            </button>
          </div>
        </div>
      </div>

      <!-- Card Grid Mode -->
      <div class="food-grid" v-if="viewMode === 'card'">
        <div
          v-for="food in filteredFoods"
          :key="food.id"
          class="food-card"
          :class="{ active: selectedFood === food.id, 'card-highlight': highlightCard === food.id }"
          :style="{ animationDelay: getCardDelay(food.id) }"
          @click="showFoodDetail(food)"
        >
          <div class="card-header">
            <h3 class="food-title">{{ food.name }}</h3>
            <div class="rating-badge" :class="food.ratingClass">
              {{ food.ratingLabel }}
            </div>
          </div>
          <div class="food-badges">
            <div v-for="tag in inDisplayTags(food.tags)" :key="tag" class="food-badge">
              <svg class="pin-icon" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a2.5 2.5 0 0 0-2.5 2.5c0 2 2.5 6.5 2.5 6.5s2.5-4.5 2.5-6.5A2.5 2.5 0 0 8 0zm0 3a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </svg>
              {{ tag }}
            </div>
          </div>
          <p class="food-description">{{ food.description }}</p>
          <div class="card-meta">
            <span class="meta-item">
              <svg class="meta-icon" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 3a1 1 0 0 1 1 1v1.5h4a1 1 0 0 1 0 2H9v1.5h4a1 1 0 0 1 0 2H9v1.5h4a1 1 0 0 1 0 2H9v1.5h4a1 1 0 0 1 0 2H9V14a1 1 0 0 1-2 0v-1H3a1 1 0 0 1 0-2h4V9H3a1 1 0 0 1 0-2h4V6.5H3a1 1 0 0 1 0-2h4V4a1 1 0 0 1 1-1z"/>
              </svg>
              {{ food.price }}
            </span>
            <span class="meta-item">
              <svg class="meta-icon" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zm0 1a5 5 0 1 1 0 10A5 5 0 0 1 8 3zm1 3.5a.5.5 0 0 0-.5.5v1H7a.5.5 0 0 0 1h1.5v1a.5.5 0 0 1 0v-1H11a.5.5 0 0 0-1H9.5v-1a.5.5 0 0 0 1 0v-1H9V14a1 1 0 0 1-2 0v-1H3a.5.5 0 0 0 1 0 2H3V14a1 1 0 0 1-2 0v-1H3a.5.5 0 0 0 1 0-2h4V6.5H3a.5.5 0 0 0 1 0 2H3V4a1 1 0 0 0 1 1z"/>
              </svg>
              {{ food.distance }}
            </span>
            <span class="meta-item location-tag">
              <svg class="meta-icon" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a2.5 2.5 0 0 0-2.5 2.5c0 2 2.5 6.5 2.5 6.5s2.5-4.5 2.5-6.5A2.5 2.5 0 0 8 0zm0 3a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </svg>
              {{ food.location }}
            </span>
          </div>
        </div>
      </div>

      <!-- Wheel Mode -->
      <div class="wheel-mode" v-if="viewMode === 'wheel'">
        <div class="wheel-container">
          <div class="wheel" :class="{ spinning: isSpinning }" :style="{ transform: `rotate(${wheelRotation}deg)` }">
            <div
              v-for="(food, index) in filteredFoods"
              :key="food.id"
              class="wheel-segment"
              :style="{
                transform: `rotate(${index * segmentAngle}deg)`,
                opacity: food.id === currentHighlight ? 1 : 0.6
              }"
              :class="{ highlight: food.id === currentHighlight }"
            >
              <div class="segment-content" :style="{ transform: `translateX(-50%) rotate(${-index * segmentAngle}deg)` }">
                {{ food.name }}
              </div>
            </div>
          </div>
          <div class="wheel-pointer">▼</div>
        </div>
        <div class="wheel-result-container" v-if="isSpinning">
          <div class="current-spinning">{{ spinningFood?.name }}</div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="footer">
        <button
            class="primary-button"
            :class="{ spinning: isSpinning }"
            :disabled="isSpinning"
            @click="startLottery"
          >
          <svg v-if="!isSpinning" class="rocket-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.5c0 0-6.5 7.5-6.5 13.5 0 2.8 1.6 5.2 4 6.4l-1.5 1.5 1.5 1.5 2.5-2.5 2.5 1.5-1.5-1.5-1.5c2.4-1.2 4-3.6 4-6.4 0-6.6.5-13.5-6.5-13.5z"/>
          </svg>
          <span v-else class="spinner">⟳</span>
          {{ isSpinning ? '正在抽奖...' : '跑马灯抽奖' }}
        </button>
        <button class="reset-button" @click="resetData">
          重置数据
        </button>
      </footer>
    </div>

    <!-- 食物详情弹窗 -->
    <div class="modal-overlay" v-if="showDetailModal" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <button class="modal-close" @click="closeDetailModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          <h2 class="detail-name">{{ detailFood?.name }}</h2>
          <div class="rating-badge large" :class="detailFood?.ratingClass">
            {{ detailFood?.ratingLabel }}
          </div>
        </div>
        <div class="modal-body">
          <div class="detail-info">
            <div class="info-row">
              <span class="info-label">📍 位置</span>
              <span class="info-value">{{ detailFood?.location }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">🍜 类型</span>
              <span class="info-value">{{ detailFood?.tags?.join('、') }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">💰 价格</span>
              <span class="info-value">{{ detailFood?.price }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">🚶 距离</span>
              <span class="info-value">{{ detailFood?.distance }}</span>
            </div>
          </div>
          <div class="detail-description">
            <h3>📝 详细介绍</h3>
            <p>{{ detailFood?.description }}</p>
            <p>{{ detailFood?.detail }}</p>
          </div>
          <div class="detail-tags">
            <span class="tag" v-for="tag in detailFood?.features" :key="tag">#{{ tag }}</span>
                   </div>
          <button class="select-button" @click="selectCurrentFood">
            ✅ 就选这个
          </button>
        </div>
      </div>
    </div>

    <!-- 中奖提示 -->
    <div class="winner-modal" v-if="showWinnerModal" @click="closeWinnerModal">
      <div class="winner-content" @click.stop>
        <div class="winner-icon">🎉</div>
        <h2 class="winner-title">恭喜你！</h2>
        <p class="winner-text">今天吃</p>
        <h3 class="winner-name">{{ winnerFood?.name }}</h3>
        <div class="winner-badges">
          <div class="winner-badge" :class="winnerFood?.ratingClass">
            {{ winnerFood?.ratingLabel }}
          </div>
          <div class="winner-badge location">{{ winnerFood?.location }}</div>
        </div>
        <button class="winner-button" @click="closeWinnerModal">
          太棒了！
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const viewMode = ref('card')
const selectedFood = ref(null)
const selectedLocation = ref('all')
const selectedCategory = ref('all')
const showDetailModal = ref(false)
const detailFood = (null)
const highlightCard = ref(null)

// 跑马灯相关
const isSpinning = ref(false)
const wheelRotation = ref(0)
const currentHighlight = ref(null)
const spinningFood = ref(null)
const segmentAngle = ref(0)
const showWinnerModal = ref(false)
const winnerFood = ref(null)
let spinInterval = null

// 用于动画的计数器
const animationKey = ref(0)

// 分类数据
const locations = ['南门', '北门', '东门', '校内']
const categories = ['食堂', '快餐', '中餐', '日料', '火锅', '小吃', '饮品', '轻食', '夜宵']

// 食物数据
const foods = ref([
  { id: 1, name: '学苑食堂', tags: ['食堂'], location: '校内', description: '包子豆浆，皮蛋瘦肉粥，开启元气满满的一天', detail: '校内最老牌的食堂，干净卫生，阿姨手不抖。早餐种类丰富，中式西式都有。', price: '¥8-12', distance: '2分钟', ratingLabel: '人上人', ratingClass: 'top-tier', features: ['早餐', '实惠', '家常'] },
  { id: 2, name: '老王牛肉面', tags: ['中餐'], location: '南门', description: '手拉牛肉面，汤浓面劲，肉量十足', detail: '开了十年的老店，每天现做面条，牛肉大块，汤底用牛骨熬制，非常入味。', price: '¥15', distance: '5分钟', ratingLabel: '人上人', ratingClass: 'top-tier', features: ['手拉面', '汤浓', '量大'] },
  { id: 3, name: '麻辣烫', tags: ['小吃'], location: '北门', description: '荤素任选，麻辣鲜香，冬天暖心首选', detail: '自选食材，几十种菜品可选，锅底有番茄、麻辣、清汤三种口味。', price: '¥18-25', distance: '8分钟', ratingLabel: '夯', ratingClass: 'hot', features: ['自选', '麻辣', '暖胃'] },
  { id: 4, name: '汉堡套餐', tags: ['快餐'], location: '校内', description: '双层芝士，炸鸡配薯条，能量补给站', detail: '西式快餐，汉堡现做，薯条金黄，还有各种小食和饮料可选。', price: '¥22', distance: '3分钟', ratingLabel: '夯', ratingClass: 'hot', features: ['快捷', '高热量', '现做'] },
  { id: 5, name: '回转寿司', tags: ['日料'], location: '东门', description: '三文鱼金枪鱼，现切现做，新鲜满分', detail: '正宗日式回转寿司，食材新鲜，师傅现切，还有各种日式小菜。', price: '¥35', distance: '10分钟', ratingLabel: '人上人', ratingClass: 'top-tier', features: ['新鲜', '现切', '日式'] },
  { id: 6, name: '一人一锅', tags: ['火锅'], location: '南门', description: '一人一锅，番茄麻辣，热气腾腾', detail: '不用拼桌，一个人也能吃火锅，锅底多样，食材新鲜，小料自助。', price: '¥28', distance: '6分钟', ratingLabel: '夯', ratingClass: 'hot', features: ['一人食', '自助小料', '热气腾腾'] },
  { id: 7, name: '路边烧烤', tags: ['夜宵'], location: '北门', description: '羊肉串烤翅，配冰啤酒，夜生活标配', detail: '夜宵好去处，烟火气十足，必点羊肉串和烤翅，老板人很好。', price: '¥30', distance: '5分钟', ratingLabel: '夯', ratingClass: 'hot', features: ['烟火气', '夜宵', '配酒'] },
  { id: 8, name: '轻食沙拉', tags: ['轻食'], location: '校内', description: '鸡胸肉牛油果，低卡饱腹，减肥不痛苦', detail: '健康轻食，各种蔬菜水果可选，低卡路里，适合减脂期。', price: '¥25', distance: '4分钟', ratingLabel: '人上人', ratingClass: 'top-tier', features: ['低卡', '健康', '饱腹'] },
  { id: 9, name: '果茶奶茶', tags: ['饮品'], location: '校内', description: '鲜果现榨，多肉葡萄，解腻提神', detail: '新鲜水果现榨，奶茶茶底香浓，小料丰富，性价比高。', price: '¥18', distance: '2分钟', ratingLabel: '夯', ratingClass: 'hot', features: ['鲜果', '解腻', '提神'] },
  { id: 10, name: '韩式炸鸡', tags: ['快餐'], location: '东门', description: '韩式炸鸡，甜辣蒜香，追剧必点', detail: '韩式风味炸鸡，外酥里嫩，有甜辣、蒜香等多种口味。', price: '¥28', distance: '外卖', ratingLabel: 'npc', ratingClass: 'npc', features: ['韩式', '外酥里嫩', '追剧'] },
  { id: 11, name: '东北饺子', tags: ['中餐'], location: '南门', description: '三鲜韭菜虾仁，皮薄馅大，家的味道', detail: '正宗东北水饺，手工现包，皮薄馅大，蘸上醋简直绝了。', price: '¥16', distance: '7分钟', ratingLabel: 'npc', ratingClass: 'npc', features: ['手工', '皮薄馅大', '东北味'] },
  { id: 12, name: '螺蛳粉', tags: ['中餐'], location: '北门', description: '酸辣爽滑，臭香俱全，嗦粉快乐', detail: '正宗柳州螺蛳粉，酸笋够味，酸辣爽滑，爱吃螺蛳粉的千万别错过。', price: '¥14', distance: '9分钟', ratingLabel: '夯', ratingClass: 'hot', features: ['酸辣', '臭香', '嗦粉'] },
  { id: 13, name: '广式点心', tags: ['中餐', '早餐'], location: '东门', description: '虾饺烧麦，精致美味，早茶不二选', detail: '正宗广式早茶，手工制作，品种丰富，适合周末聚餐。', price: '¥25-35', distance: '12分钟', ratingLabel: '人上人', ratingClass: 'top-tier', features: ['手工', '精致', '早茶'] },
  { id: 14, name: '石锅拌饭', tags: ['中餐', '快餐'], location: '校内', description: '韩式拌饭，滋滋作响，酱香浓郁', detail: '石锅现做，配上韩式辣酱，半生半熟的米饭口感超棒。', price: '¥18', distance: '2分钟', ratingLabel: '夯', ratingClass: 'hot', features: ['韩式', '滋滋作响', '实惠'] }
])

// 筛选后的食物
const filteredFoods = computed(() => {
  return foods.value.filter(food => {
    const locationMatch = selectedLocation.value === 'all' || food.location === selectedLocation.value
    const categoryMatch = selectedCategory.value === 'all' || food.tags.includes(selectedCategory.value)
    return locationMatch && categoryMatch
  })
})


// 更新转盘角度
watch(filteredFoods, (newFoods) => {
  if (newFoods.length > 0) {
    segmentAngle.value = 360 / newFoods.length
  }
})

// 监听筛选变化，触发动画
watch([selectedLocation, selectedCategory], () => {
  animationKey.value++
})

// 获取卡片显示的标签
function inDisplayTags(tags) {
  return tags.slice(0, 2)
}

// 获取卡片动画延迟
function getCardDelay(id) {
  const index = filteredFoods.value.findIndex(f => f.id === id)
  return `${index * 0.05}s`
}

// 切换模式
function switchMode(mode) {
  viewMode.value = mode
  selectedFood.value = null
  wheelRotation.value = 0
}

// 显示详情
function showFoodDetail(food) {
  detailFood.value = food
  showDetailModal.value = true
}

// 关闭详情
function closeDetailModal() {
  showDetailModal.value = false
  setTimeout(() => {
    detailFood.value = null
  }, 300)
}

// 选择当前食物
function selectCurrentFood() {
  selectedFood.value = detailFood.value?.id
  closeDetailModal()
}

// 开始跑马灯抽奖
function startLottery() {
  if (isSpinning.value) return

  const targetFoods = filteredFoods.value
  if (targetFoods.length === 0) {
    alert('当前筛选条件下没有可选食物！')
    return
  }

  if (viewMode.value === 'card') {
    // 卡片模式快速抽奖动画
    isSpinning.value = true
    let index = 0
    const spinCount = 15
    const indices = Array.from({ length: spinCount }, () => Math.floor(Math.random() * targetFoods.length))

    const animate = () => {
      highlightCard.value = targetFoods[indices[index]].id
      index++

      if (index < indices.length) {
        setTimeout(animate, 80)
      } else {
        setTimeout(() => {
          const finalIndex = indices[indices.length - 1]
          const finalFood = targetFoods[finalIndex]
          selectedFood.value = finalFood.id
          highlightCard.value = null
          isSpinning.value = false
          showWinnerModal.value = true
          winnerFood.value = finalFood
        }, 150)
      }
    }

    animate()
  } else {
    // 转盘模式跑马灯
    isSpinning.value = true
    let currentIndex = 0
    let speed = 70
    let totalSpins = 0
    const minSpins = 4
    const targetIndex = Math.floor(Math.random() * targetFoods.length)

    const spin = () => {
      currentIndex = (currentIndex + 1) % targetFoods.length
      totalSpins++

      currentHighlight.value = targetFoods[currentIndex].id
      spinningFood.value = targetFoods[currentIndex]
      wheelRotation.value = -currentIndex * segmentAngle.value

      // 检查是否停止
      if (totalSpins >= minSpins * targetFoods.length + targetIndex) {
        isSpinning.value = false
        selectedFood.value = targetFoods[currentIndex].id
        currentHighlight.value = null
        setTimeout(() => {
          showWinnerModal.value = true
          winnerFood.value = targetFoods[currentIndex]
        }, 250)
        return
      }

      // 逐渐减速
      if (totalSpins > minSpins * targetFoods.length) {
        speed += 40
      } else if (speed < 110) {
        speed += 10
      }

      spinInterval = setTimeout(spin, speed)
    }

    spin()
  }
}

// 关闭中奖弹窗
function closeWinnerModal() {
  showWinnerModal.value = false
  setTimeout(() => {
    winnerFood.value = null
  }, 300)
}

// 重置数据
function resetData() {
  selectedFood.value = null
  selectedLocation.value = 'all'
  selectedCategory.value = 'all'
  showDetailModal.value = false
  detailFood.value = null
  isSpinning.value = false
  currentHighlight.value = null
  spinningFood.value = null
  highlightCard.value = null
  showWinnerModal.value = false
  winnerFood.value = null
  wheelRotation.value = 0
  if (spinInterval) {
    clearTimeout(spinInterval)
    spinInterval = null
  }
  animationKey.value++
}
</script>

<style scoped>
/* 基础样式 */
.food-selector {
  background-color: #FDF9F1;
  min-height: 100vh;
  padding: 60px 0;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Header */
.header {
  text-align: center;
}

.title {
  color: #FF7354;
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 24px 0;
  animation: fadeInDown 0.6s ease;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toggle-switch {
  display: inline-flex;
  background-color: #F2EFE8;
  padding: 4px;
  border-radius: 50px;
  gap: 4px;
}

.toggle-item {
  padding: 10px 24px;
  border: none;
  background: transparent;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.toggle-item.active {
  background-color: #FFF;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: scale(1.02);
}

.toggle-item.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: #FF7354;
  border-radius: 2px;
  animation: widthPulse 1s ease-in-out infinite;
}

@keyframes widthPulse {
  0%, 100% { width: 20px; }
  50% { width: 30px; }
}

.toggle-item:hover:not(.active) {
  color: #333;
  background: rgba(255, 255, 255, 0.5);
}

/* Filter Section */
.filter-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: filterSlideIn 0.3s ease;
}

@keyframes filterSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  min-width: 60px;
}

.filter-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tag {
  padding: 6px 16px;
  border: 1px solid #E0E0E0;
  background: #FFF;
  color: #666;
  font-size: 13px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.filter-tag::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 115, 84, 0.1);
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

.filter-tag:hover::before {
  width: 200%;
  height: 200%;
}

.filter-tag:hover {
  border-color: #FF7354;
  color: #FF7354;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 115, 84, 0.15);
}

.filter-tag.active {
  background: #FF7354;
  border-color: #FF7354;
  color: #FFF;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 115, 84, 0.3);
}

/* Grid System */
.food-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* Card Component */
.food-card {
  background-color: #FFFFFF;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  overflow: hidden;
  animation: cardEnter 0.4s cubic-bezier(0.4, 0, 0.2, 1) backwards;
  animation-fill-mode: backwards;
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.food-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s ease;
}

.food-card:hover::before {
  left: 100%;
}

.food-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
}

.food-card.active {
  background-color: #6BD09D;
  box-shadow: 0 16px 40px rgba(107, 208, 157, 0.5);
  transform: scale(1.02);
}

.food-card.card-highlight {
  animation: cardPulse 0.15s ease;
}

@keyframes cardPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); background-color: #FFD93D; }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.food-title {
  color: #333333;
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  flex: 1;
}

.food-card.active .food-title {
  color: #FFFFFF;
}

/* Rating Badge */
.rating-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: bold;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.rating-badge.large {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 8px;
}

.rating-badge.top-tier {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #FFF;
  box-shadow: 0 2px 6px rgba(255, 165, 0, 0.3);
}

.rating-badge.top-tier:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 165, 0, 0.5);
}

.rating-badge.hot {
  background: linear-gradient(135deg, #FF6B6B, #FF4757);
  color: #FFF;
  box-shadow: 0 2px 6px rgba(255, 71, 87, 0.3);
}

.rating-badge.hot:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.5);
}

.rating-badge.npc {
  background: linear-gradient(135deg, #B0B0B0, #808080);
  color: #FFF;
  box-shadow: 0 2px 6px rgba(128, 128, 128, 0.2);
}

.food-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.food-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding: 0 8px;
  background-color: #FFF0EE;
  color: #E67373;
  font-size: 11px;
  border-radius: 4px;
  align-self: flex-start;
  transition: all 0.3s ease;
}

.food-card:hover .food-badge {
  transform: scale(1.05);
}

.food-card.active .food-badge {
  background-color: rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
}

.pin-icon {
  width: 10px;
  height: 10px;
}

.food-description {
  color: #999999;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.food-card.active .food-description {
  color: #FFFFFF;
}

/* Card Meta */
.card-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 12px;
  transition: all 0.3s ease;
}

.food-card.active .meta-item {
  color: rgba(255, 255, 255, 0.9);
}

.meta-item.location-tag {
  color: #999;
  font-size: 11px;
}

.meta-icon {
  width: 12px;
  height: 12px;
  opacity: 0.6;
}

/* Wheel Mode */
.wheel-mode {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.wheel-container {
  position: relative;
  width: 380px;
  height: 380px;
}

.wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #F2EFE8 0deg, #E8E5DE 30deg, #F2EFE8 60deg, #E8E5DE 90deg, #F2EFE8 120deg, #E8E5DE 150deg, #F2EFE8 180deg, #E8E5DE 210deg, #F2EFE8 240deg, #E8E5DE 270deg, #F2EFE8 300deg, #E8E5DE 330deg, #F2EFE8 360deg);
  position: relative;
  transition: transform 0.1s ease-out;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), inset 0 0 60px rgba(255, 255, 255, 0.3);
}

.wheel.spinning {
  transition: transform 0.05s linear;
}

.wheel-pointer {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 40px;
  color: #FF7354;
  z-index: 10;
  filter: drop-shadow(0 4px 8px rgba(255, 115, 84, 0.4));
  animation: pointerBounce 1s ease-in-out infinite;
}

@keyframes pointerBounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-5px); }
}

.wheel-segment {
  position: absolute;
  width: 2px;
  height: 50%;
  top: 0;
  left: 50%;
  transform-origin: bottom center;
  transition: all 0.1s ease;
}

.wheel-segment.highlight {
  width: 4px;
  height: 55%;
}

.segment-content {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%) rotate(-90deg);
  white-space: nowrap;
  font-size: 13px;
  color: #666;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.wheel-segment.highlight .segment-content {
  background: #FF7354;
  color: #FFF;
  transform: translateX(-50%) rotate(-90deg) scale(1.2);
  box-shadow: 0 4px 16px rgba(255, 115, 84, 0.4);
}

.wheel-result-container {
  text-align: center;
  padding: 16px 32px;
  background: #FFF;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.current-spinning {
  font-size: 24px;
  font-weight: bold;
  color: #FF7354;
}

/* Footer */
.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding-top: 20px;
}

.primary-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 48px;
  border: none;
  border-radius: 50px;
  background: linear-gradient(90deg, #FF8E6D, #FF7354);
  color: #FFFFFF;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(255, 115, 84, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.primary-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.primary-button:hover::before {
  left: 100%;
}

.primary-button:hover:not(.spinning) {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 16px 32px rgba(255, 115, 84, 0.4);
}

.primary-button:active:not(.spinning) {
  transform: translateY(-2px) scale(1);
}

.primary-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.rocket-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.primary-button:hover .rocket-icon {
  transform: rotate(-15deg);
}

.spinner {
  font-size: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.reset-button {
  padding: 8px 24px;
  border: 1px solid #CCC;
  background: transparent;
  color: #666;
  font-size: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-button:hover {
  border-color: #999;
  color: #333;
  background-color: rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

/* Modal Overlay */
.modal-overlay {
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
  z-index: 1000;
  padding: 20px;
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: #FFFFFF;
  border-radius: 24px;
  max-width: 480px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
  animation: modalSlideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 24px 24px 0 24px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border: none;
  background: #F2EFE8;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  color: #666;
  padding: 0;
}

.modal-close:hover {
  background: #E0E0E0;
  color: #333;
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 115, 84, 0.4);
}

.modal-close svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 0 24px 24px 24px;
}

.detail-name {
  color: #333;
  font-size: 26px;
  margin: 0;
  font-weight: bold;
  line-height: 1.2;
}

.detail-info {
  background: #F9F9F9;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #E8E8E8;
  transition: background 0.2s ease;
}

.info-row:hover {
  background: rgba(255, 115, 84, 0.05);
  border-radius: 8px;
  padding-left: 8px;
  padding-right: 8px;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: #999;
  font-size: 14px;
}

.info-value {
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.detail-description {
  margin-bottom: 24px;
}

.detail-description h3 {
  color: #333;
  font-size: 16px;
  margin: 0 0 16px 0;
  font-weight: 600;
}

.detail-description p {
  color: #666;
  font-size: 14px;
  line-height: 1.7;
  margin: 0 0 12px 0;
}

.detail-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.detail-tags .tag {
  background: linear-gradient(135deg, #FFF0EE, #FFE8E8);
  color: #E67373;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.detail-tags .tag:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(230, 115, 115, 0.3);
}

.select-button {
  width: 100%;
  padding: 16px;
  border: none;
  background: linear-gradient(90deg, #FF8E6D, #FF7354);
  color: #FFF;
  font-size: 16px;
  font-weight: bold;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 24px rgba(255, 115, 84, 0.35);
  position: relative;
  overflow: hidden;
}

.select-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: all 0.6s ease;
}

.select-button:active::after {
  width: 300%;
  height: 300%;
}

.select-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(255, 115, 84, 0.45);
}

/* Winner Modal */
.winner-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  animation: modalFadeIn 0.3s ease;
}

.winner-content {
  background: #FFFFFF;
  border-radius: 32px;
  padding: 48px 40px;
  text-align: center;
  box-shadow: 0 30px 100px rgba(0, 0, 0, 0.3);
  animation: winnerBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
  max-width: 400px;
  width: 100%;
}

@keyframes winnerBounce {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-10deg);
  }
  50% {
    transform: scale(1.05) rotate(5deg);
  }
  70% {
    transform: scale(0.95) rotate(-3deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.winner-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: iconBounce 1s ease infinite;
}

@keyframes iconBounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(-10deg); }
  75% { transform: translateY(-5px) rotate(10deg); }
}

.winner-title {
  color: #333;
  font-size: 28px;
  margin: 0 0 8px 0;
  font-weight: bold;
}

.winner-text {
  color: #999;
  font-size: 16px;
  margin: 0 0 16px 0;
}

.winner-name {
  color: #FF7354;
  font-size: 36px;
  margin: 0 0 24px 0;
  font-weight: bold;
  text-shadow: 0 2px 8px rgba(255, 115, 84, 0.3);
}

.winner-badges {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.winner-badge {
  display: inline-block;
  padding: 8px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
}

.winner-badge.top-tier {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #FFF;
  box-shadow: 0 4px 16px rgba(255, 165, 0, 0.4);
}

.winner-badge.hot {
  background: linear-gradient(135deg, #FF6B6B, #FF4757);
  color: #FFF;
  box-shadow: 0 4px 16px rgba(255, 71, 87, 0.4);
}

.winner-badge.npc {
  background: linear-gradient(135deg, #B0B0B0, #808080);
  color: #FFF;
  box-shadow: 0 4px 16px rgba(128, 128, 128, 0.3);
}

.winner-badge.location {
  background: #F2EFE8;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.winner-button {
  width: 100%;
  padding: 16px;
  border: none;
  background: linear-gradient(90deg, #FF8E6D, #FF7354);
  color: #FFF;
  font-size: 18px;
  font-weight: bold;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(255, 115, 84, 0.4);
}

.winner-button:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 32px rgba(255, 115, 84, 0.5);
}

/* Responsive */
@media (max-width: 768px) {
  .food-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .container {
    padding: 0 16px;
  }

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-tags {
    width: 100%;
  }

  .wheel-container {
    width: 300px;
    height: 300px;
  }

  .segment-content {
    font-size: 11px;
    padding: 4px 8px;
  }
}

@media (max-width: 480px) {
  .food-grid {
    grid-template-columns: 1fr;
  }

  .title {
    font-size: 24px;
  }

  .card-header {
    flex-direction: column;
    gap: 4px;
  }

  .wheel-container {
    width: 260px;
    height: 260px;
  }

  .modal-content {
    border-radius: 20px;
  }

  .modal-body {
    padding: 0 20px 20px 20px;
  }

  .detail-name {
    font-size: 22px;
  }

  .winner-name {
    font-size: 28px;
  }
}
</style>
