<template>
  <div class="food-selector">
    <div class="container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <div class="header-left">
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
          </div>

          <div class="user-info" v-if="isAuthenticated">
            <div class="user-status-badge status-logged-in">
              <span class="status-dot"></span>
              已登录
            </div>
            <div class="user-avatar">
              <span class="avatar-icon">👤</span>
            </div>
            <div class="user-details">
              <span class="user-email">{{ profile?.username || userEmail }}</span>
              <div class="user-actions">
                <button v-if="isAdmin" class="settings-btn" @click="$router.push('/admin')" title="管理后台">
                  🛠️
                </button>
                <button v-if="isAdmin" class="settings-btn" @click="loadApplications(); showAppsModal = true" title="近期申请">
                  📋
                </button>
                <button v-else class="settings-btn" @click="showAppModal = true" title="反馈建议">
                  💬
                </button>
                <button class="settings-btn" @click="openSettingsModal" title="设置">
                  ⚙️
                </button>
                <button class="logout-btn" @click="handleLogout">
                  退出
                </button>
              </div>
            </div>
          </div>
          <div class="user-info" v-else>
            <div class="user-status-badge status-logged-out">
              <span class="status-dot"></span>
              未登录
            </div>
            <a href="/auth" class="login-link">
              <span class="login-icon">🔑</span>
              登录/注册
            </a>
          </div>
        </div>
      </header>

      <!-- 分类筛选 -->
      <div class="filter-section">
        <!-- 卡片大小调节 -->
        <div class="filter-group" v-if="viewMode === 'card'">
          <span class="filter-label">📐 卡片</span>
          <div class="size-buttons">
            <button
              class="size-btn"
              :class="{ active: cardSize === 220 }"
              @click="cardSize = 220"
            >小</button>
            <button
              class="size-btn"
              :class="{ active: cardSize === 280 }"
              @click="cardSize = 280"
            >中</button>
            <button
              class="size-btn"
              :class="{ active: cardSize === 340 }"
              @click="cardSize = 340"
            >大</button>
          </div>
        </div>
        <!-- 地理位置分类 -->
        <div class="filter-group">
          <span class="filter-label">📍 位置</span>
          <div class="filter-tags">
            <button
              class="filter-tag"
              :class="{ active: selectedLocations.length === 0 }"
              @click="selectedLocations = []"
            >
              全部
            </button>
            <button
              v-for="location in locations"
              :key="location"
              class="filter-tag"
              :class="{ active: selectedLocations.includes(location) }"
              @click="toggleLocation(location)"
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
              :class="{ active: selectedCategories.length === 0 }"
              @click="selectedCategories = []"
            >
              全部
            </button>
            <button
              v-for="category in categories"
              :key="category"
              class="filter-tag"
              :class="{ active: selectedCategories.includes(category) }"
              @click="toggleCategory(category)"
            >
              {{ category }}
            </button>
          </div>
        </div>
      </div>

      <!-- Card Grid Mode -->
      <div class="food-grid" v-if="viewMode === 'card'" :style="gridStyle">
        <div
          v-for="(food, index) in filteredFoods"
          :key="food.id"
          class="food-card"
          :class="{
            active: selectedFood === food.id,
            'card-highlight': highlightCard === food.id,
            'card-dimmed': isSpinning && highlightCard !== food.id && highlightCard !== null,
            'dragging': isAuthenticated && dragIndex === index,
            'drag-over': isAuthenticated && dragOverIndex === index,
            'draggable': isAuthenticated
          }"
          :style="{ width: cardSize + 'px', animationDelay: getCardDelay(food.id) }"
          @click="showFoodDetail(food)"
          :draggable="isAuthenticated"
          @dragstart="isAuthenticated && onDragStart($event, index)"
          @dragend="isAuthenticated && onDragEnd"
          @dragover.prevent="isAuthenticated && onDragOver($event, index)"
          @dragleave="isAuthenticated && onDragLeave"
          @drop="isAuthenticated && onDrop($event, index)"
        >
          <div class="card-header">
            <h3 class="food-title">{{ food.name }}</h3>
            <div class="card-actions">
              <!-- 评分显示：未登录显示锁，登录显示标签 -->
              <template v-if="isAuthenticated">
                <div class="rating-badge" :class="getRatingClass(getAvgRating(food.id))">
                  {{ getRatingLabel(getAvgRating(food.id)) }}
                </div>
              </template>
              <template v-else>
                <div class="lock-badge">
                  🔒
                </div>
              </template>
              <!-- 评价按钮（仅已登录用户可见） -->
              <button
                v-if="isAuthenticated"
                class="rate-btn"
                @click.stop="openRatingModal(food)"
                :title="checkHasRated(food.id) ? '修改评价' : '评价'"
              >
                <span class="rate-icon">{{ checkHasRated(food.id) ? '⭐' : '☆' }}</span>
              </button>
              <button
                v-if="isAuthenticated"
                class="favorite-btn"
                :class="{ active: checkIsFavorite(food.id) }"
                @click.stop="toggleFavorite(food.id, $event)"
                :title="checkIsFavorite(food.id) ? '取消收藏' : '收藏'"
              >
                <span class="favorite-icon">{{ checkIsFavorite(food.id) ? '❤️' : '🤍' }}</span>
              </button>
            </div>
          </div>
          <div class="food-badges">
            <div v-for="tag in inDisplayTags(food.tags)" :key="tag" class="food-badge">
              📍 {{ tag }}
            </div>
          </div>
          <p class="food-description">{{ food.description }}</p>
          <div class="card-meta">
            <span class="meta-item">
              💰 {{ food.price }}
            </span>
            <span class="meta-item">
              ⏱️ {{ food.distance }}
            </span>
            <span class="meta-item location-tag">
              📌 {{ food.location }}
            </span>
          </div>
        </div>
      </div>

      <!-- Wheel Mode -->
      <div class="wheel-mode" v-if="viewMode === 'wheel'">
        <div class="wheel-container" :class="{ spinning: isSpinning }">
          <div class="wheel" :class="{ spinning: isSpinning }" :style="{ transform: `rotate(${wheelRotation}deg)` }">
            <div
              v-for="(food, index) in filteredFoods"
              :key="food.id"
              class="wheel-segment"
              :style="{ transform: `rotate(${index * segmentAngle}deg)` }"
              :class="{
                highlight: food.id === currentHighlight && !isSpinning
              }"
            >
              <div class="segment-content">
                {{ food.name }}
              </div>
            </div>
          </div>
          <div class="wheel-pointer" :class="{ spinning: isSpinning }">▼</div>
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
          <span v-if="!isSpinning" class="rocket-icon">🚀</span>
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
      <div class="detail-modal" @click.stop>
        <button class="modal-close" @click="closeDetailModal">
          ✕
        </button>

        <!-- 顶部品牌区 -->
        <div class="detail-hero" :class="isAuthenticated ? getRatingClass(getAvgRating(detailFood?.id)) : 'npc'">
          <div class="hero-icon">🍽️</div>
          <h2 class="detail-name">{{ detailFood?.name }}</h2>
          <!-- 评级和标签在同一行 -->
          <div class="detail-header-row">
            <!-- 未登录显示锁，登录显示评级 -->
            <div v-if="isAuthenticated" class="rating-badge" :class="getRatingClass(getAvgRating(detailFood?.id))">
              {{ getRatingLabel(getAvgRating(detailFood?.id)) }}
            </div>
            <div v-else class="lock-badge large">
              🔒 登录查看评级
            </div>
            <!-- 分类标签 -->
            <div class="detail-tags-inline">
              <span class="tag-inline" v-for="tag in detailFood?.tags" :key="tag">{{ tag }}</span>
            </div>
            <!-- 评价按钮（仅已登录用户可见） -->
            <button
              v-if="isAuthenticated"
              class="rate-btn detail-rate-btn"
              @click="openRatingModal(detailFood)"
              :title="detailFood && checkHasRated(detailFood.id) ? '修改评价' : '评价'"
            >
              <span class="rate-icon">{{ detailFood && checkHasRated(detailFood.id) ? '⭐' : '☆' }}</span>
            </button>
          </div>
        </div>

        <!-- 核心信息 -->
        <div class="detail-stats">
          <div class="stat-item">
            <span class="stat-icon">📍</span>
            <span class="stat-label">位置</span>
            <span class="stat-value">{{ detailFood?.location }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">💰</span>
            <span class="stat-label">人均</span>
            <span class="stat-value">{{ detailFood?.price }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">🚶</span>
            <span class="stat-label">距离</span>
            <span class="stat-value">{{ detailFood?.distance }}</span>
          </div>
        </div>

        <!-- 详细介绍 -->
        <div class="detail-section">
          <h3 class="section-title">简介</h3>
          <p class="detail-text">{{ detailFood?.description }}</p>
        </div>

        <div class="detail-section">
          <h3 class="section-title">详情</h3>
          <p class="detail-text">{{ detailFood?.detail }}</p>
        </div>

        <!-- 特色标签 -->
        <div class="detail-features">
          <span class="feature-tag" v-for="tag in detailFood?.features" :key="tag">#{{ tag }}</span>
        </div>

        <!-- 菜品评价区域 -->
        <div class="detail-dishes-section" v-if="isAuthenticated">
          <div class="section-header">
            <h3 class="section-title">
              <span class="dish-icon">🍲</span>
              菜品评价
            </h3>
            <span v-if="!dishesLoading && restaurantDishes.length > 0" class="dish-count">{{ restaurantDishes.length }} 个菜品</span>
          </div>

          <!-- 加载状态 -->
          <div v-if="dishesLoading" class="dishes-loading">
            <div class="loading-spinner"></div>
            <p class="loading-text">正在加载菜品...</p>
          </div>

          <!-- 菜品列表 -->
          <div v-else-if="restaurantDishes.length > 0" class="dishes-grid">
            <div
              v-for="dishName in restaurantDishes"
              :key="dishName"
              class="dish-card"
              :class="{ 'user-rated': checkUserRatedDish(detailFood?.id, dishName) }"
              @click="openDishReviewsModal(detailFood, dishName)"
            >
              <div class="dish-card-top">
                <span class="dish-name">{{ dishName }}</span>
                <span v-if="checkUserRatedDish(detailFood?.id, dishName)" class="rated-badge">已评</span>
              </div>
              <div class="dish-card-middle">
                <div class="dish-rating">
                  <span class="dish-score">{{ formatDishRating(dishRatings[dishName]) }}</span>
                  <span class="score-unit">分</span>
                </div>
              </div>
              <div class="dish-card-bottom" @click.stop="openDishRatingModal(detailFood, dishName)">
                <span class="rate-btn-text">
                  {{ checkUserRatedDish(detailFood?.id, dishName) ? '修改评价' : '立即评价' }}
                </span>
              </div>
            </div>
            <!-- 添加新菜品按钮/输入框 -->
            <div v-if="showAddDishInput" class="dish-card add-dish-input-card">
              <div class="add-dish-input-area">
                <input
                  v-model="newDishName"
                  class="add-dish-input"
                  placeholder="输入菜品名称，如：红烧肉"
                  @keyup.enter="addNewDish"
                  ref="dishInputRef"
                />
                <div class="add-dish-buttons">
                  <button class="add-dish-confirm" @click="addNewDish">添加</button>
                  <button class="add-dish-cancel" @click="cancelAddDish">取消</button>
                </div>
              </div>
            </div>
            <div v-else class="dish-card add-dish-card" @click="showAddDishInput = true">
              <div class="add-dish-content">
                <span class="add-dish-icon">➕</span>
                <span class="add-dish-text">添加菜品</span>
              </div>
            </div>
          </div>

          <!-- 空状态 / 添加菜品 -->
          <div v-else class="dishes-empty">
            <span class="empty-icon">🍽️</span>
            <p class="empty-text">暂无菜品评价</p>
            <p class="empty-hint">快来评价第一个菜品吧！</p>
            <!-- 添加菜品输入框 -->
            <div v-if="showAddDishInput" class="add-dish-input-area">
              <input
                v-model="newDishName"
                class="add-dish-input"
                placeholder="输入菜品名称，如：红烧肉"
                @keyup.enter="addNewDish"
                ref="dishInputRef"
              />
              <div class="add-dish-buttons">
                <button class="add-dish-confirm" @click="addNewDish">添加</button>
                <button class="add-dish-cancel" @click="cancelAddDish">取消</button>
              </div>
            </div>
            <div v-else class="empty-actions">
              <button class="empty-action-btn" @click="showAddDishInput = true">
                <span class="action-icon">➕</span>
                添加菜品并评价
              </button>
              <button class="empty-action-btn secondary" @click="openRatingModal(detailFood)">
                <span class="action-icon">⭐</span>
                评价餐厅
              </button>
            </div>
          </div>
        </div>

        <!-- 评价区域（仅登录用户可见） -->
        <div v-if="isAuthenticated" class="detail-rating-section-new">
          <div class="rating-header">
            <h3 class="rating-title">
              <span class="rating-icon">⭐</span>
              用户评价
            </h3>
            <span class="rating-count">{{ restaurantRatings.length }} 条评价</span>
          </div>

          <!-- 评分概览 -->
          <div class="rating-overview">
            <div class="avg-score">
              <span class="score-number">{{ getAvgRating(detailFood?.id) || '-' }}</span>
              <span class="score-label">分</span>
            </div>
            <div class="rating-bars">
              <div
                v-for="dist in ratingDistribution"
                :key="dist.stars"
                class="rating-bar-row"
              >
                <span class="bar-stars">{{ dist.stars }}星</span>
                <div class="bar-container">
                  <div class="bar-fill" :style="{ width: dist.percentage + '%' }"></div>
                </div>
                <span class="bar-percent">{{ dist.percentage }}%</span>
              </div>
            </div>
          </div>

          <!-- 评价按钮 -->
          <div class="rating-action">
            <button
              class="write-review-btn"
              @click="openRatingModal(detailFood)"
            >
              <span class="btn-icon">✍️</span>
              {{ checkHasRated(detailFood?.id) ? '修改评价' : '写评价' }}
            </button>
          </div>

          <!-- 评价列表预览 -->
          <div v-if="sortedRatings.length > 0" class="reviews-preview">
            <div
              v-for="rating in sortedRatings.slice(0, 3)"
              :key="rating.id"
              class="review-item"
              :class="{ 'dish-rating-item': rating.dish_name }"
            >
              <div class="review-type-badge" v-if="rating.dish_name">
                <span class="dish-tag">🍲 {{ rating.dish_name }}</span>
              </div>
              <div class="review-header">
                <div class="review-user">
                  <span class="user-avatar">{{ (rating.profiles?.username || '匿名用户').charAt(0) }}</span>
                  <span class="user-name">{{ rating.profiles?.username || '匿名用户' }}</span>
                </div>
                <div class="review-stars">
                  <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= rating.score }">★</span>
                </div>
              </div>
              <p class="review-comment" v-if="rating.comment">{{ rating.comment }}</p>
              <p class="review-empty" v-else>该用户没有留下评论</p>
              <span class="review-date">{{ formatDate(rating.created_at) }}</span>
            </div>
            <div v-if="sortedRatings.length > 3" class="more-reviews">
              还有 {{ sortedRatings.length - 3 }} 条评价...
            </div>
          </div>
          <div v-else class="no-reviews">
            <span class="empty-icon">💬</span>
            <p>暂无评价，快来抢先评价吧！</p>
          </div>
        </div>

        <button class="select-button" @click="selectCurrentFood">
          ✅ 就选这个
        </button>
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
          <div class="winner-badge" :class="getRatingClass(getAvgRating(winnerFood?.id))">
            {{ getRatingLabel(getAvgRating(winnerFood?.id)) }}
          </div>
          <div class="winner-badge location">{{ winnerFood?.location }}</div>
        </div>
        <button class="winner-button" @click="closeWinnerModal">
          太棒了！
        </button>
      </div>
    </div>

    <!-- 评分弹窗 -->
    <div class="rating-modal" v-if="showRatingModal" @click="closeRatingModal">
      <div class="rating-content" @click.stop>
        <button class="modal-close" @click="closeRatingModal">
          ✕
        </button>

        <div class="rating-header">
          <div class="rating-icon">⭐</div>
          <h2 class="rating-title">
            评价 {{ ratingRestaurant?.name }}
            <span v-if="ratingDishName" class="dish-indicator">· {{ ratingDishName }}</span>
          </h2>
          <p class="rating-subtitle">
            {{ ratingDishName ? '评价该菜品' : '分享您的用餐体验' }}
          </p>
        </div>

        <div class="rating-stars">
          <p class="rating-label">您的评分：</p>
          <div class="stars-container">
            <button
              v-for="star in 5"
              :key="star"
              class="star-btn"
              :class="{ active: star <= ratingScore }"
              @click="ratingScore = star"
              :title="star + '星'"
            >
              <span class="star-icon">{{ star <= ratingScore ? '★' : '☆' }}</span>
            </button>
          </div>
          <p class="stars-hint">{{ ratingScore }} 星 ({{ getScoreText(ratingScore) }})</p>
        </div>

        <div class="rating-comment">
          <label class="comment-label">评论（可选）：</label>
          <textarea
            v-model="ratingComment"
            class="comment-textarea"
            placeholder="分享一下您的用餐体验、推荐菜品或改进建议..."
            rows="4"
          ></textarea>
        </div>

        <div class="rating-actions">
          <button
            class="rating-submit-btn"
            @click="submitRating"
            :disabled="ratingScore < 1 || ratingLoading"
          >
            <span v-if="ratingLoading" class="spinner">⟳</span>
            {{ ratingLoading ? '提交中...' : '提交评价' }}
          </button>

          <button
            v-if="checkHasRated(ratingRestaurant?.id)"
            class="rating-delete-btn"
            @click="deleteRating"
            :disabled="ratingLoading"
          >
            <span class="delete-icon">🗑️</span>
            删除评价
          </button>

          <button
            class="rating-cancel-btn"
            @click="closeRatingModal"
            :disabled="ratingLoading"
          >
            取消
          </button>
        </div>
      </div>
    </div>

    <!-- 菜品评价列表弹窗 -->
    <div class="dish-reviews-modal" v-if="showDishReviewsModal" @click="closeDishReviewsModal">
      <div class="dish-reviews-content" @click.stop>
        <button class="modal-close" @click="closeDishReviewsModal">
          ✕
        </button>

        <div class="dish-reviews-header">
          <div class="dish-reviews-icon">🍲</div>
          <h2 class="dish-reviews-title">
            {{ dishReviewsDishName }}
            <span class="reviews-count">· {{ dishReviewsList.length }} 条评价</span>
          </h2>
        </div>

        <!-- 加载状态 -->
        <div v-if="dishReviewsLoading" class="dish-reviews-loading">
          <div class="loading-spinner"></div>
          <p>正在加载评价...</p>
        </div>

        <!-- 评价列表 -->
        <div v-else-if="dishReviewsList.length > 0" class="dish-reviews-list">
          <div
            v-for="review in dishReviewsList"
            :key="review.id"
            class="dish-review-item"
          >
            <div class="dish-review-header">
              <div class="review-user">
                <span class="user-avatar">{{ (review.profiles?.username || '匿名用户').charAt(0) }}</span>
                <span class="user-name">{{ review.profiles?.username || '匿名用户' }}</span>
              </div>
              <div class="review-stars">
                <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= review.score }">★</span>
              </div>
            </div>
            <p class="dish-review-comment" v-if="review.comment">{{ review.comment }}</p>
            <p class="dish-review-empty" v-else>该用户没有留下评论</p>
            <span class="dish-review-date">{{ formatDate(review.created_at) }}</span>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="dish-reviews-empty">
          <span class="empty-icon">💬</span>
          <p>暂无评价</p>
          <p class="empty-hint">成为第一个评价这道菜的人吧！</p>
        </div>

        <!-- 底部按钮 -->
        <div class="dish-reviews-actions">
          <button
            class="write-dish-review-btn"
            @click="goToRateDish"
          >
            <span class="btn-icon">✍️</span>
            {{ checkUserRatedDish(dishReviewsRestaurant?.id, dishReviewsDishName) ? '修改我的评价' : '我来评价' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 用户设置弹窗 -->
    <div class="settings-modal" v-if="showSettingsModal" @click="closeSettingsModal">
      <div class="settings-content" @click.stop>
        <button class="modal-close" @click="closeSettingsModal">
          ✕
        </button>

        <div class="settings-header">
          <div class="settings-icon">⚙️</div>
          <h2 class="settings-title">个人设置</h2>
        </div>

        <!-- 用户基本信息 -->
        <div class="settings-profile">
          <div class="profile-avatar">{{ (profile?.username || userEmail).charAt(0) }}</div>
          <div class="profile-info">
            <div class="profile-email">{{ userEmail }}</div>
            <div class="profile-joined">注册于：{{ formatDate(profile?.created_at) }}</div>
          </div>
        </div>

        <div class="settings-stats">
          <div class="stat-box">
            <span class="stat-value">{{ userRatings.length }}</span>
            <span class="stat-label">评价数</span>
          </div>
          <div class="stat-box">
            <span class="stat-value">{{ favoritesCount }}</span>
            <span class="stat-label">收藏数</span>
          </div>
          <div class="stat-box">
            <span class="stat-value">{{ historyList.length }}</span>
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
                @click="clearUserHistory"
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

        <div class="settings-form">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input
              v-model="settingsUsername"
              type="text"
              class="form-input"
              placeholder="输入你的用户名"
              :disabled="usernameChangeBlocked"
            />
            <p v-if="usernameChangeBlocked" class="form-hint error">
              ⚠️ 修改间隔不足30天，上次修改：{{ formatDate(profile?.last_username_changed) }}
            </p>
            <p v-else class="form-hint">其他用户将看到你的用户名</p>
          </div>

          <div class="form-group">
            <label class="form-checkbox">
              <input
                type="checkbox"
                v-model="settingsAnonymous"
              />
              <span class="checkbox-label">
                <span class="checkbox-icon">{{ settingsAnonymous ? '☑️' : '⬜' }}</span>
                匿名评价
              </span>
            </label>
            <p class="form-hint">开启后，你的评价将显示为"匿名用户"</p>
          </div>
        </div>

        <div class="settings-actions">
          <button
            class="settings-save-btn"
            @click="saveSettings"
            :disabled="settingsLoading || usernameChangeBlocked"
          >
            <span v-if="settingsLoading" class="spinner">⟳</span>
            {{ settingsLoading ? '保存中...' : '保存设置' }}
          </button>
          <button
            class="settings-cancel-btn"
            @click="closeSettingsModal"
            :disabled="settingsLoading"
          >
            取消
          </button>
        </div>
      </div>
    </div>

    <!-- 申请管理弹窗 -->
    <div class="apps-modal" v-if="showAppsModal" @click="showAppsModal = false">
      <div class="apps-content" @click.stop>
        <button class="modal-close" @click="showAppsModal = false">
          ✕
        </button>

        <div class="apps-header">
          <div class="apps-icon">📋</div>
          <h2 class="apps-title">{{ isAdmin ? '近期申请' : '我的申请' }}</h2>
        </div>

        <!-- 加载状态 -->
        <div v-if="appsLoading" class="apps-loading">
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
              <button class="approve-btn" @click="handleApplication(app.id, 'approved')">批准</button>
              <button class="reject-btn" @click="handleApplication(app.id, 'rejected')">驳回</button>
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

    <!-- 餐馆申请弹窗 -->
    <div class="app-modal" v-if="showAppModal" @click="closeAppModal">
      <div class="app-content" @click.stop>
        <button class="modal-close" @click="closeAppModal">
          ✕
        </button>

        <!-- 成功提示 -->
        <div v-if="appSuccess" class="app-success">
          <div class="success-icon">✅</div>
          <h2 class="success-title">{{ appForm.type === 'restaurant' ? '餐馆申请已提交' : '反馈已提交' }}</h2>
          <template v-if="appForm.type === 'restaurant'">
            <p class="success-text">餐馆：{{ appForm.name }}</p>
            <p class="success-text">位置：{{ appForm.location }}</p>
          </template>
          <template v-else>
            <p class="success-text">反馈内容：{{ appForm.feedback_content.substring(0, 50) }}{{ appForm.feedback_content.length > 50 ? '...' : '' }}</p>
          </template>
          <p class="success-hint">{{ appForm.type === 'restaurant' ? '等待管理员审核...' : '感谢您的反馈！' }}</p>
          <button class="success-btn" @click="closeAppModal">知道了</button>
        </div>

        <!-- 申请表单 -->
        <div v-else>
          <div class="app-header">
            <div class="app-icon">💬</div>
            <h2 class="app-title">我有话说</h2>
            <p class="app-subtitle">申请餐馆或提出反馈</p>
          </div>

          <div class="app-form">
            <!-- 类型选择 -->
            <div class="form-group">
              <label class="form-label">选择类型 *</label>
              <div class="type-radio-group">
                <div class="type-radio-item">
                  <input
                    type="radio"
                    id="type-restaurant"
                    v-model="appForm.type"
                    value="restaurant"
                    class="type-radio"
                  />
                  <label for="type-restaurant" class="type-radio-label">
                    <span class="type-icon">🏪</span>
                    <span class="type-text">申请餐馆</span>
                    <span class="type-desc">补充遗漏的餐馆</span>
                  </label>
                </div>
                <div class="type-radio-item">
                  <input
                    type="radio"
                    id="type-feedback"
                    v-model="appForm.type"
                    value="feedback"
                    class="type-radio"
                  />
                  <label for="type-feedback" class="type-radio-label">
                    <span class="type-icon">💡</span>
                    <span class="type-text">反馈意见</span>
                    <span class="type-desc">提出建议或问题</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- 申请餐馆表单 -->
            <div v-if="appForm.type === 'restaurant'">
              <div class="form-group">
                <label class="form-label">餐馆名称 *</label>
                <input
                  v-model="appForm.name"
                  type="text"
                  class="form-input"
                  placeholder="输入餐馆名称"
                  required
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
                    :class="{ active: appForm.location === loc }"
                    @click="appForm.location = loc"
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
                    :class="{ active: appForm.tags.includes(cat) }"
                    @click="toggleAppTag(cat)"
                  >{{ cat }}</button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">人均</label>
                <input
                  v-model="appForm.price"
                  type="text"
                  class="form-input"
                  placeholder="如：¥15"
                />
              </div>

              <div class="form-group">
                <label class="form-label">距离</label>
                <input
                  v-model="appForm.distance"
                  type="text"
                  class="form-input"
                  placeholder="如：5分钟"
                />
              </div>

              <div class="form-group">
                <label class="form-label">简介</label>
                <textarea
                  v-model="appForm.description"
                  class="form-textarea"
                  placeholder="一句话介绍"
                  rows="2"
                ></textarea>
              </div>
            </div>

            <!-- 反馈意见表单 -->
            <div v-else>
              <div class="form-group">
                <label class="form-label">反馈内容 *</label>
                <textarea
                  v-model="appForm.feedback_content"
                  class="form-textarea feedback-textarea"
                  placeholder="请输入您的反馈、建议或问题..."
                  rows="6"
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <div class="app-actions">
            <button
              class="app-submit-btn"
              @click="submitApplication"
              :disabled="appLoading"
            >
              <span v-if="appLoading" class="spinner">⟳</span>
              {{ appLoading ? '提交中...' : '提交申请' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { supabase } from '../lib/supabase'
import { fetchRestaurants, addFavorite, removeFavorite, isFavorite, addHistory, favoritesList, historyList, fetchHistory, clearHistory } from '../composables/useData'
import {
  fetchUserRatings,
  fetchRestaurantAvgRating,
  addOrUpdateRating,
  removeRating,
  hasUserRated,
  hasUserRatedDish,
  getUserRating,
  getRestaurantAvgRating,
  fetchRestaurantRatings,
  fetchRestaurantDishes,
  getDishAvgRating,
  fetchDishRatings,
  fetchUserRatingForRestaurant,
  isLoading as ratingsLoading,
  userRatings
} from '../composables/useRatings'

const { user, isAuthenticated, userEmail, signOut, profile, updateProfile, isAdmin } = useAuth()

const viewMode = ref('card')
const selectedFood = ref(null)
const selectedLocations = ref([])
const selectedCategories = ref([])
const showDetailModal = ref(false)
const detailFood = ref(null)
const highlightCard = ref(null)
const cardSize = ref(280) // 小220 中280 大340

// 拖拽排序相关
const dragIndex = ref(null)
const dragOverIndex = ref(null)
const foodOrder = ref([]) // 存储用户自定义排序

// 跑马灯相关
const isSpinning = ref(false)
const wheelRotation = ref(0)
const currentHighlight = ref(null)
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
const foods = ref([])
const loading = ref(false)

// 评分相关状态
const showRatingModal = ref(false)
const ratingRestaurant = ref(null)
const ratingDishName = ref(null)  // null表示整体评价，否则为菜品名称
const ratingScore = ref(0)
const ratingComment = ref('')
const ratingLoading = ref(false)

// 菜品评价列表弹窗状态
const showDishReviewsModal = ref(false)
const dishReviewsRestaurant = ref(null)
const dishReviewsDishName = ref('')
const dishReviewsList = ref([])
const dishReviewsLoading = ref(false)

// 评价列表相关状态
const restaurantRatings = ref([])
const reviewsLoading = ref(false)

// 菜品评价相关状态
const restaurantDishes = ref([])  // 餐厅菜品列表
const dishRatings = ref({})       // 菜品评分数据，键为dish_name
const dishesLoading = ref(false)  // 菜品加载状态
const showAddDishInput = ref(false)  // 是否显示添加菜品输入框
const newDishName = ref('')  // 新增菜品名称

// 用户设置弹窗状态
const showSettingsModal = ref(false)
const settingsUsername = ref('')
const settingsAnonymous = ref(false)
const settingsLoading = ref(false)

// 检查用户名修改是否被限制（30天内只能修改一次）
const usernameChangeBlocked = computed(() => {
  if (!profile.value?.last_username_changed) return false
  const lastChanged = new Date(profile.value.last_username_changed)
  const now = new Date()
  const daysDiff = (now - lastChanged) / (1000 * 60 * 60 * 24)
  return daysDiff < 30
})

// 收藏数
const favoritesCount = computed(() => favoritesList.value?.length || 0)

// 历史记录相关状态
const showHistorySection = ref(false)
const historyLoading = ref(false)

// 餐馆申请弹窗状态
const showAppModal = ref(false)
const appForm = ref({
  type: 'restaurant', // 'restaurant' 或 'feedback'
  name: '',
  tags: [],
  location: '',
  description: '',
  detail: '',
  price: '',
  distance: '',
  feedback_content: ''
})
const appLoading = ref(false)
const appSuccess = ref(false)

// 申请列表管理
const showAppsModal = ref(false)
const applications = ref([])
const appsLoading = ref(false)
const applicationsSubscription = ref(null)

// 加载所有申请（管理员）或我的申请（普通用户）
async function loadApplications() {
  appsLoading.value = true
  try {
    const { data, error } = await supabase
      .from('restaurant_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    applications.value = data || []
  } catch (error) {
    console.error('Error loading applications:', error)
    applications.value = []
  } finally {
    appsLoading.value = false
  }
}

// 设置申请表的实时订阅
function setupApplicationsSubscription() {
  // 如果已有订阅，先取消
  if (applicationsSubscription.value) {
    supabase.removeChannel(applicationsSubscription.value)
  }

  // 创建新订阅
  applicationsSubscription.value = supabase
    .channel('restaurant_applications_changes')
    .on(
      'postgres_changes',
      {
        event: '*',  // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'restaurant_applications'
      },
      async (payload) => {
        console.log('Application change detected:', payload)
        // 重新加载申请数据
        await loadApplications()
      }
    )
    .subscribe()
}

// 取消申请订阅
function cleanupApplicationsSubscription() {
  if (applicationsSubscription.value) {
    supabase.removeChannel(applicationsSubscription.value)
    applicationsSubscription.value = null
  }
}

// 处理申请（批准或拒绝）
async function handleApplication(appId, status) {
  const app = applications.value.find(a => a.id === appId)
  if (!app) return
  if (app.status !== 'pending') {
    alert('该申请已处理')
    return
  }

  try {
    // 如果批准，先检查重复和插入餐馆
    if (status === 'approved') {
      // 检查是否已存在相同名称的餐馆（针对restaurant类型）
      if (app.type === 'restaurant' && app.name) {
        const { data: existingRestaurants } = await supabase
          .from('restaurants')
          .select('id')
          .eq('name', app.name)
          .limit(1)

        if (existingRestaurants && existingRestaurants.length > 0) {
          alert(`餐馆 "${app.name}" 已存在，请检查重复`)
          return
        }
      }

      // 如果是餐馆申请，添加到餐馆列表
      if (app.type === 'restaurant') {
        const { error: insertError } = await supabase.from('restaurants').insert({
          name: app.name,
          tags: app.tags,
          location: app.location,
          description: app.description,
          detail: app.detail || '',
          price: app.price,
          distance: app.distance,
          rating_label: 'npc',
          rating_class: 'npc',
          features: []  // 默认空数组
        })

        if (insertError) throw insertError
      }
    }

    // 更新申请状态（仅在以上操作成功后）
    const { data: updatedData, error } = await supabase
      .from('restaurant_applications')
      .update({ status })
      .eq('id', appId)
      .eq('status', 'pending')  // 确保只更新待处理状态
      .select()

    if (error) throw error
    if (!updatedData || updatedData.length === 0) {
      // 没有行被更新，可能是状态已改变或其他原因
      alert('更新失败，请刷新后重试')
      return
    }

    // 立即更新本地状态以提供即时反馈
    const index = applications.value.findIndex(a => a.id === appId)
    if (index >= 0) {
      applications.value[index].status = status
    }

    // 刷新列表和数据（确保与服务器同步）
    await loadApplications()
    // 所有人都刷新餐厅列表
    await loadRestaurants()
    alert(status === 'approved' ? '已批准' : '已驳回')
  } catch (error) {
    console.error('Error handling application:', error)
    alert('操作失败')
  }
}

// 加载餐厅评价列表
async function loadRestaurantRatings(restaurantId) {
  if (!restaurantId) return

  reviewsLoading.value = true
  try {
    const data = await fetchRestaurantRatings(restaurantId)
    restaurantRatings.value = data || []
  } catch (error) {
    console.error('Error loading restaurant ratings:', error)
    restaurantRatings.value = []
  } finally {
    reviewsLoading.value = false
  }
}

// 加载餐厅菜品列表
async function loadRestaurantDishes(restaurantId) {
  if (!restaurantId) return

  dishesLoading.value = true
  try {
    const dishes = await fetchRestaurantDishes(restaurantId)
    restaurantDishes.value = dishes || []

    // 加载每个菜品的平均评分
    const dishRatingsMap = {}
    for (const dishName of dishes) {
      const avg = await getDishAvgRating(restaurantId, dishName)
      dishRatingsMap[dishName] = avg
    }
    dishRatings.value = dishRatingsMap
  } catch (error) {
    console.error('Error loading restaurant dishes:', error)
    restaurantDishes.value = []
    dishRatings.value = {}
  } finally {
    dishesLoading.value = false
  }
}

// 计算评分分布
const ratingDistribution = computed(() => {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  const total = restaurantRatings.value.length

  restaurantRatings.value.forEach(r => {
    if (r.score >= 1 && r.score <= 5) {
      dist[r.score]++
    }
  })

  // 转换为百分比
  return Object.entries(dist).map(([stars, count]) => ({
    stars: parseInt(stars),
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  })).reverse() // 5星在前
})

// 排序评价：餐馆评价置顶，菜品评价在后面
const sortedRatings = computed(() => {
  return [...restaurantRatings.value].sort((a, b) => {
    // 都没有 dish_name 或都有 dish_name，按时间排序
    const aIsDish = !!a.dish_name
    const bIsDish = !!b.dish_name
    if (aIsDish === bIsDish) {
      return new Date(b.created_at) - new Date(a.created_at)
    }
    // 餐馆评价（无 dish_name）置顶
    return aIsDish ? 1 : -1
  })
})

// 检查当前评价是否已存在（考虑菜品）
const hasCurrentRating = computed(() => {
  if (!ratingRestaurant.value || !user.value) return false

  // 在评价列表中查找当前用户的评价
  const userRating = restaurantRatings.value.find(r =>
    r.restaurant_id === ratingRestaurant.value.id &&
    r.user_id === user.value.id &&
    r.dish_name === ratingDishName.value  // null匹配null，字符串匹配字符串
  )

  return !!userRating
})

// 从Supabase加载餐厅数据
async function loadRestaurants() {
  loading.value = true
  try {
    const data = await fetchRestaurants()
    if (data && data.length > 0) {
      foods.value = data.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        tags: restaurant.tags || [],
        location: restaurant.location || '',
        description: restaurant.description || '',
        detail: restaurant.detail || '',
        price: restaurant.price || '',
        distance: restaurant.distance || '',
        ratingLabel: restaurant.rating_label || 'npc',
        ratingClass: restaurant.rating_class || 'npc',
        features: restaurant.features || []
      }))

      // 加载所有餐厅的平均评分
      await loadAllRestaurantRatings()
    } else {
      // 数据库没有数据时显示空状态
      foods.value = []
    }
  } catch (error) {
    console.error('Error loading restaurants:', error)
    foods.value = []
  } finally {
    loading.value = false
  }
}

// 批量加载所有餐厅的平均评分
async function loadAllRestaurantRatings() {
  try {
    for (const food of foods.value) {
      await fetchRestaurantAvgRating(food.id)
    }
  } catch (error) {
    console.error('Error loading all restaurant ratings:', error)
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadRestaurants()
  loadFoodOrder() // 加载用户的卡片排序

  // 如果用户已登录，加载其评分数据并设置申请订阅
  if (isAuthenticated.value) {
    fetchUserRatings()
    setupApplicationsSubscription()
  }

  // 监听 admin 页面数据更新通知
  window.addEventListener('storage', handleStorageChange)
  // 监听同页面 sessionStorage 变化
  window.addEventListener('restaurantDataUpdated', () => loadRestaurants())
})

// localStorage 键名
const FOOD_ORDER_KEY = 'food_order_' // 后面拼接用户ID

// 保存排序到 localStorage
function saveFoodOrder(order) {
  const key = FOOD_ORDER_KEY + (profile.value?.id || 'guest')
  localStorage.setItem(key, JSON.stringify(order))
}

// 从 localStorage 加载排序
function loadFoodOrder() {
  const key = FOOD_ORDER_KEY + (profile.value?.id || 'guest')
  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      foodOrder.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse food order:', e)
      foodOrder.value = []
    }
  }
}

// 处理 sessionStorage 变化
function handleStorageChange(e) {
  if (e.key === 'restaurant_data_updated') {
    loadRestaurants()
  }
}

onUnmounted(() => {
  // 清理申请订阅
  cleanupApplicationsSubscription()
  // 移除 storage 监听
  window.removeEventListener('storage', handleStorageChange)
})

// 监听登录状态变化，加载评分数据
watch(isAuthenticated, (newVal) => {
  if (newVal) {
    fetchUserRatings()
    // 用户登录，设置申请订阅
    setupApplicationsSubscription()
  } else {
    // 用户登出，清理申请订阅
    cleanupApplicationsSubscription()
  }
})

// 监听用户资料变化，重新加载对应用户的排序
watch(profile, () => {
  loadFoodOrder()
})

// 监听申请模态框状态，加载数据
watch(showAppsModal, (newVal) => {
  if (newVal) {
    // 模态框打开，加载申请数据
    loadApplications()
  }
})

// 监听设置模态框状态，加载历史记录
watch(showSettingsModal, (newVal) => {
  if (newVal && isAuthenticated.value) {
    // 模态框打开，加载历史记录
    loadHistory()
    // 重置历史记录展开状态
    showHistorySection.value = false
  }
})

// 筛选后的食物（多选：空数组=全部选中）
const filteredFoods = computed(() => {
  const filtered = foods.value.filter(food => {
    const locationMatch = selectedLocations.value.length === 0 || selectedLocations.value.includes(food.location)
    const categoryMatch = selectedCategories.value.length === 0 || food.tags.some(tag => selectedCategories.value.includes(tag))
    return locationMatch && categoryMatch
  })

  // 应用自定义排序
  if (foodOrder.value.length > 0) {
    const orderMap = new Map(foodOrder.value.map((id, idx) => [id, idx]))
    return [...filtered].sort((a, b) => {
      const orderA = orderMap.get(a.id) ?? Infinity
      const orderB = orderMap.get(b.id) ?? Infinity
      return orderA - orderB
    })
  }

  return filtered
})

// 网格布局样式
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(auto-fill, minmax(${cardSize.value}px, 1fr))`
}))


// 更新转盘角度
watch(filteredFoods, (newFoods) => {
  if (newFoods.length > 0) {
    segmentAngle.value = 360 / newFoods.length
  }
})

// 监听筛选变化，触发动画并重置转盘
watch([selectedLocations, selectedCategories], () => {
  animationKey.value++
  // 转盘模式下重置转盘状态
  if (viewMode.value === 'wheel') {
    currentHighlight.value = null
    wheelRotation.value = -90
  }
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

// 拖拽排序处理
function onDragStart(event, index) {
  dragIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', index)
}

function onDragEnd() {
  dragIndex.value = null
  dragOverIndex.value = null
}

function onDragOver(event, index) {
  if (dragIndex.value !== null && dragIndex.value !== index) {
    dragOverIndex.value = index
  }
}

function onDragLeave() {
  dragOverIndex.value = null
}

function onDrop(event, targetIndex) {
  const sourceIndex = dragIndex.value
  if (sourceIndex === null || sourceIndex === targetIndex) {
    dragIndex.value = null
    dragOverIndex.value = null
    return
  }

  // 获取当前排序的ID列表（基于filteredFoods的顺序）
  const currentOrder = [...foodOrder.value]
  if (currentOrder.length === 0) {
    // 如果没有自定义排序，使用当前filteredFoods的顺序初始化
    filteredFoods.value.forEach(food => {
      if (!currentOrder.includes(food.id)) {
        currentOrder.push(food.id)
      }
    })
  }

  // sourceIndex 和 targetIndex 是基于 filteredFoods 的索引
  // 找到对应的ID进行交换
  const sourceId = filteredFoods.value[sourceIndex]?.id
  const targetId = filteredFoods.value[targetIndex]?.id

  if (!sourceId || !targetId) {
    dragIndex.value = null
    dragOverIndex.value = null
    return
  }

  // 在currentOrder中找到这两个ID的位置并交换
  const sourceOrderIdx = currentOrder.indexOf(sourceId)
  const targetOrderIdx = currentOrder.indexOf(targetId)

  if (sourceOrderIdx !== -1 && targetOrderIdx !== -1) {
    // 交换位置
    const temp = currentOrder[sourceOrderIdx]
    currentOrder[sourceOrderIdx] = currentOrder[targetOrderIdx]
    currentOrder[targetOrderIdx] = temp

    foodOrder.value = currentOrder
    saveFoodOrder(currentOrder) // 保存到 localStorage
  }

  dragIndex.value = null
  dragOverIndex.value = null
}

// 切换位置多选
function toggleLocation(location) {
  const index = selectedLocations.value.indexOf(location)
  if (index === -1) {
    selectedLocations.value.push(location)
  } else {
    selectedLocations.value.splice(index, 1)
  }
}

// 切换类型多选
function toggleCategory(category) {
  const index = selectedCategories.value.indexOf(category)
  if (index === -1) {
    selectedCategories.value.push(category)
  } else {
    selectedCategories.value.splice(index, 1)
  }
}

// 切换模式
function switchMode(mode) {
  viewMode.value = mode
  selectedFood.value = null
  // 指针在顶部，segment从3点钟方向开始，需要偏移90度对齐
  wheelRotation.value = -90
  // 确保 segmentAngle 正确计算
  if (filteredFoods.value.length > 0) {
    segmentAngle.value = 360 / filteredFoods.value.length
  }
}

// 显示详情
function showFoodDetail(food) {
  detailFood.value = food
  showDetailModal.value = true
  // 加载该餐厅的评价列表和平均分
  loadRestaurantRatings(food.id)
  fetchRestaurantAvgRating(food.id)
  // 加载餐厅菜品列表（仅已登录用户）
  if (isAuthenticated.value) {
    loadRestaurantDishes(food.id)
  } else {
    // 未登录时清空菜品数据
    restaurantDishes.value = []
    dishRatings.value = {}
  }
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
  const restaurantId = detailFood.value?.id
  selectedFood.value = restaurantId
  if (restaurantId) {
    recordHistory(restaurantId)
  }
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

  // 只有一个选项时显示彩蛋
  if (targetFoods.length === 1) {
    selectedFood.value = targetFoods[0].id
    if (viewMode.value === 'wheel') {
      currentHighlight.value = targetFoods[0].id
      wheelRotation.value = -90
    }
    showWinnerModal.value = true
    winnerFood.value = targetFoods[0]
    return
  }

  if (viewMode.value === 'card') {
    isSpinning.value = true
    // 卡片模式跑马灯动画
    const totalSegments = targetFoods.length
    // 随机目标位置
    let targetIndex = Math.floor(Math.random() * totalSegments)
    // 计算需要遍历的次数：多转几圈 + 目标位置
    const spins = 5
    const totalSteps = spins * totalSegments + targetIndex

    let step = 0
    // 起始速度快，逐渐减速
    let speed = 15

    const animate = () => {
      const currentIndex = step % totalSegments
      highlightCard.value = targetFoods[currentIndex].id

      step++

      if (step < totalSteps) {
        // 逐渐减速：快 → 慢
        const remaining = totalSteps - step
        if (remaining <= totalSegments) {
          // 最后阶段：减速明显
          speed = Math.min(speed + 30, 300)
        } else if (step > spins * totalSegments) {
          // 中后段：中等减速
          speed = Math.min(speed + 12, 120)
        } else {
          // 前段：快速加速到峰值后保持
          speed = Math.min(speed + 3, 80)
        }
        setTimeout(animate, speed)
      } else {
        setTimeout(() => {
          const finalFood = targetFoods[targetIndex]
          selectedFood.value = finalFood.id
          highlightCard.value = null
          isSpinning.value = false
          showWinnerModal.value = true
          winnerFood.value = finalFood
        }, 200)
      }
    }

    animate()
  } else {
    // 转盘模式跑马灯
    isSpinning.value = true
    const totalSegments = targetFoods.length
    // 随机目标位置（索引）
    let targetIndex = Math.floor(Math.random() * totalSegments)
    // 每个扇区的角度（本地计算，避免 segmentAngle 未更新的问题）
    const segAngle = 360 / totalSegments
    // 计算需要旋转的角度：多转几圈 + 目标位置对应的角度
    // 逆时针旋转，让 targetIndex 对应的选项转到指针下方
    const spins = 5
    const totalRotation = spins * 360 + targetIndex * segAngle

    let startTime = null
    const duration = 4000 // 4秒，干脆利落

    const animateWheel = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)

      // 减速曲线：前75%快速 → 后25%急刹停
      let easeProgress
      if (progress < 0.75) {
        // 前75%：cubic ease-out
        easeProgress = 1 - Math.pow(1 - progress / 0.75, 3) * 0.75
      } else {
        // 后25%：急刹到零速度
        const tailProgress = (progress - 0.75) / 0.25
        easeProgress = 0.75 + (1 - Math.pow(1 - tailProgress, 2)) * 0.25
      }
      easeProgress = Math.min(easeProgress, 1)

      const currentRotation = totalRotation * easeProgress
      wheelRotation.value = -currentRotation - 90

      if (progress < 1) {
        spinInterval = requestAnimationFrame(animateWheel)
      } else {
        // 动画结束，显示结果
        isSpinning.value = false
        selectedFood.value = targetFoods[targetIndex].id
        currentHighlight.value = targetFoods[targetIndex].id
        setTimeout(() => {
          showWinnerModal.value = true
          winnerFood.value = targetFoods[targetIndex]
        }, 300)
      }
    }

    spinInterval = requestAnimationFrame(animateWheel)
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
  selectedLocations.value = []
  selectedCategories.value = []
  showDetailModal.value = false
  detailFood.value = null
  isSpinning.value = false
  currentHighlight.value = null
  highlightCard.value = null
  showWinnerModal.value = false
  winnerFood.value = null
  wheelRotation.value = -90
  if (spinInterval) {
    // 可能是 setTimeout 或 requestAnimationFrame
    clearTimeout(spinInterval)
    cancelAnimationFrame(spinInterval)
    spinInterval = null
  }
  animationKey.value++
}

// 检查是否为收藏
function checkIsFavorite(restaurantId) {
  return isFavorite(restaurantId).value
}

// 切换收藏状态
async function toggleFavorite(restaurantId, event) {
  event.stopPropagation() // 阻止事件冒泡，避免触发卡片点击
  if (!isAuthenticated.value) {
    alert('请先登录以使用收藏功能')
    return
  }

  try {
    if (checkIsFavorite(restaurantId)) {
      await removeFavorite(restaurantId)
    } else {
      await addFavorite(restaurantId)
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    alert(error.message || '操作失败')
  }
}

// 记录历史（当用户选中食物时）
async function recordHistory(restaurantId) {
  if (!isAuthenticated.value) return

  try {
    await addHistory(restaurantId)
  } catch (error) {
    console.error('Error recording history:', error)
    // 静默失败，不打扰用户
  }
}

// 登出
async function handleLogout() {
  try {
    await signOut()
  } catch (error) {
    console.error('Error logging out:', error)
    alert('登出失败')
  }
}

// 打开设置弹窗
function openSettingsModal() {
  settingsUsername.value = profile.value?.username || ''
  settingsAnonymous.value = profile.value?.is_anonymous || false
  showSettingsModal.value = true
}

// 关闭设置弹窗
function closeSettingsModal() {
  showSettingsModal.value = false
  settingsUsername.value = ''
  settingsAnonymous.value = false
  settingsLoading.value = false
}

// 切换标签
function toggleAppTag(tag) {
  const index = appForm.value.tags.indexOf(tag)
  if (index === -1) {
    appForm.value.tags.push(tag)
  } else {
    appForm.value.tags.splice(index, 1)
  }
}

// 提交餐馆申请
async function submitApplication() {
  // 检查登录状态
  if (!user.value || !user.value.id) {
    alert('请先登录')
    return
  }

  // 验证
  if (appForm.value.type === 'restaurant') {
    if (!appForm.value.name.trim()) {
      alert('请输入餐馆名称')
      return
    }
    if (!appForm.value.location) {
      alert('请选择位置')
      return
    }
  } else if (appForm.value.type === 'feedback') {
    if (!appForm.value.feedback_content.trim()) {
      alert('请输入反馈内容')
      return
    }
  }

  appLoading.value = true
  try {
    const insertData = {
      user_id: user.value.id,
      type: appForm.value.type
    }

    if (appForm.value.type === 'restaurant') {
      insertData.name = appForm.value.name.trim()
      insertData.tags = appForm.value.tags
      insertData.location = appForm.value.location
      insertData.description = appForm.value.description.trim()
      insertData.detail = appForm.value.detail.trim()
      insertData.price = appForm.value.price.trim()
      insertData.distance = appForm.value.distance.trim()
    } else {
      insertData.feedback_content = appForm.value.feedback_content.trim()
    }

    const { error } = await supabase
      .from('restaurant_applications')
      .insert(insertData)

    if (error) throw error

    appSuccess.value = true
  } catch (error) {
    console.error('Error submitting application:', error)
    console.error('Error details:', error.message, error.code, error.details)
    alert('提交失败：' + (error.message || '请重试'))
  } finally {
    appLoading.value = false
  }
}

// 关闭申请弹窗
function closeAppModal() {
  showAppModal.value = false
  appForm.value = {
    type: 'restaurant',
    name: '',
    tags: [],
    location: '',
    description: '',
    detail: '',
    price: '',
    distance: '',
    feedback_content: ''
  }
  appLoading.value = false
  appSuccess.value = false
}

// 加载历史记录
async function loadHistory() {
  if (!isAuthenticated.value) return

  historyLoading.value = true
  try {
    await fetchHistory()
  } catch (error) {
    console.error('Error loading history:', error)
  } finally {
    historyLoading.value = false
  }
}

// 清空历史记录
async function clearUserHistory() {
  if (!isAuthenticated.value || !confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
    return
  }

  historyLoading.value = true
  try {
    await clearHistory()
    alert('历史记录已清空')
  } catch (error) {
    console.error('Error clearing history:', error)
    alert('清空历史记录失败')
  } finally {
    historyLoading.value = false
  }
}

// 保存设置
async function saveSettings() {
  if (!settingsUsername.value.trim()) {
    alert('请输入用户名')
    return
  }
  if (settingsUsername.value.trim().length < 2) {
    alert('用户名至少需要2个字符')
    return
  }
  if (settingsUsername.value.trim().length > 20) {
    alert('用户名不能超过20个字符')
    return
  }
  if (usernameChangeBlocked.value) {
    alert('30天内只能修改一次用户名')
    return
  }

  settingsLoading.value = true
  try {
    const updates = {
      username: settingsUsername.value.trim(),
      is_anonymous: settingsAnonymous.value
    }
    // 如果用户名改变了，更新修改时间
    if (settingsUsername.value.trim() !== profile.value?.username) {
      updates.last_username_changed = new Date().toISOString()
    }
    await updateProfile(updates)
    closeSettingsModal()
    alert('设置保存成功！')
  } catch (error) {
    console.error('Error saving settings:', error)
    alert('设置保存失败')
  } finally {
    settingsLoading.value = false
  }
}

// 打开餐馆详情
function openRestaurantDetail(restaurantId) {
  const restaurant = restaurants.value.find(r => r.id === restaurantId)
  if (restaurant) {
    detailFood.value = restaurant
    showDetailModal.value = true
    // 记录浏览历史
    recordHistory(restaurantId)
  } else {
    alert('未找到该餐馆信息')
  }
}

// 打开评分弹窗（整体评价）
function openRatingModal(restaurant) {
  if (!isAuthenticated.value) {
    alert('请先登录以进行评价')
    return
  }

  ratingRestaurant.value = restaurant
  ratingDishName.value = null  // 整体评价

  // 获取用户已有的整体评价（dish_name 为 null）
  const userRating = userRatings.value.find(r =>
    r.restaurant_id === restaurant.id &&
    r.dish_name === null
  )

  if (userRating) {
    ratingScore.value = userRating.score
    ratingComment.value = userRating.comment || ''
  } else {
    ratingScore.value = 0
    ratingComment.value = ''
  }
  showRatingModal.value = true
}

// 格式化菜品评分显示
function formatDishRating(score) {
  if (score === null || score === undefined || score === '-') {
    return '-'
  }
  // 保留一位小数
  const rounded = Math.round(score * 10) / 10
  // 如果小数部分为0，显示整数
  if (rounded % 1 === 0) {
    return rounded.toString()
  }
  return rounded.toFixed(1)
}

// 打开菜品评价列表弹窗
async function openDishReviewsModal(restaurant, dishName) {
  if (!restaurant || !dishName) return

  dishReviewsRestaurant.value = restaurant
  dishReviewsDishName.value = dishName
  showDishReviewsModal.value = true
  dishReviewsLoading.value = true

  try {
    const reviews = await fetchDishRatings(restaurant.id, dishName)
    dishReviewsList.value = reviews || []
  } catch (error) {
    console.error('Error loading dish reviews:', error)
    dishReviewsList.value = []
  } finally {
    dishReviewsLoading.value = false
  }
}

// 关闭菜品评价列表弹窗
function closeDishReviewsModal() {
  showDishReviewsModal.value = false
  dishReviewsRestaurant.value = null
  dishReviewsDishName.value = ''
  dishReviewsList.value = []
  dishReviewsLoading.value = false
}

// 去评价菜品（从菜品评价列表弹窗）
function goToRateDish() {
  if (!dishReviewsRestaurant.value || !dishReviewsDishName.value) return
  closeDishReviewsModal()
  openDishRatingModal(dishReviewsRestaurant.value, dishReviewsDishName.value)
}

// 添加新菜品
async function addNewDish() {
  const dishName = newDishName.value.trim()
  if (!dishName) {
    alert('请输入菜品名称')
    return
  }
  // 检查是否已存在
  if (restaurantDishes.value.includes(dishName)) {
    alert('该菜品已存在')
    return
  }

  // 先添加到本地列表
  restaurantDishes.value.push(dishName)
  dishRatings.value[dishName] = null
  newDishName.value = ''
  showAddDishInput.value = false

  try {
    // 创建默认评分（3分），确保菜品保存到数据库
    await addOrUpdateRating(detailFood.value.id, 3, '', dishName)

    // 重新加载菜品列表以获取最新数据
    await loadRestaurantDishes(detailFood.value.id)

    // 打开该菜品的评分弹窗让用户可以修改
    openDishRatingModal(detailFood.value, dishName)
  } catch (error) {
    console.error('Error creating default rating for dish:', error)
    // 如果出错，仍然打开评分弹窗
    openDishRatingModal(detailFood.value, dishName)
  }
}

// 取消添加菜品
function cancelAddDish() {
  newDishName.value = ''
  showAddDishInput.value = false
}

// 打开菜品评分弹窗
async function openDishRatingModal(restaurant, dishName) {
  if (!isAuthenticated.value) {
    alert('请先登录以进行评价')
    return
  }

  ratingRestaurant.value = restaurant
  ratingDishName.value = dishName
  // 获取用户已有的评分（菜品）
  try {
    const userRating = await fetchUserRatingForRestaurant(restaurant.id, dishName)
    if (userRating) {
      ratingScore.value = userRating.score
      ratingComment.value = userRating.comment || ''
    } else {
      ratingScore.value = 0
      ratingComment.value = ''
    }
  } catch (error) {
    console.error('Error fetching user dish rating:', error)
    ratingScore.value = 0
    ratingComment.value = ''
  }
  showRatingModal.value = true
}

// 提交评分
async function submitRating() {
  if (!ratingRestaurant.value || ratingScore.value < 1) {
    alert('请选择评分（1-5星）')
    return
  }

  ratingLoading.value = true
  try {
    await addOrUpdateRating(ratingRestaurant.value.id, ratingScore.value, ratingComment.value, ratingDishName.value)
    showRatingModal.value = false
    // 可以显示成功消息
    alert('评价提交成功！')
    // 重新加载评价数据
    if (detailFood.value && detailFood.value.id === ratingRestaurant.value.id) {
      loadRestaurantRatings(detailFood.value.id)
      if (isAuthenticated.value) {
        loadRestaurantDishes(detailFood.value.id)
      }
    }
  } catch (error) {
    console.error('Error submitting rating:', error)
    alert(error.message || '评价提交失败')
  } finally {
    ratingLoading.value = false
  }
}

// 删除评分
async function deleteRating() {
  if (!ratingRestaurant.value) return

  if (!confirm('确定要删除您的评价吗？')) return

  ratingLoading.value = true
  try {
    await removeRating(ratingRestaurant.value.id, ratingDishName.value)
    showRatingModal.value = false
    alert('评价已删除')
    // 重新加载评价数据
    if (detailFood.value && detailFood.value.id === ratingRestaurant.value.id) {
      loadRestaurantRatings(detailFood.value.id)
      if (isAuthenticated.value) {
        loadRestaurantDishes(detailFood.value.id)
      }
    }
  } catch (error) {
    console.error('Error deleting rating:', error)
    alert(error.message || '删除失败')
  } finally {
    ratingLoading.value = false
  }
}

// 关闭评分弹窗
function closeRatingModal() {
  showRatingModal.value = false
  ratingRestaurant.value = null
  ratingDishName.value = null
  ratingScore.value = 0
  ratingComment.value = ''
  ratingLoading.value = false
}

// 检查用户是否已评价（支持整体评价和菜品评价）
function checkHasRated(restaurantId, dishName = null) {
  if (!user.value || !restaurantId) return false
  return userRatings.value.some(r =>
    r.restaurant_id === restaurantId &&
    r.user_id === user.value.id &&
    r.dish_name === dishName
  )
}

// 检查用户是否已对特定菜品评分
function checkUserRatedDish(restaurantId, dishName) {
  if (!user.value || !restaurantId || !dishName) return false
  return userRatings.value.some(r =>
    r.restaurant_id === restaurantId &&
    r.user_id === user.value.id &&
    r.dish_name === dishName
  )
}

// 获取餐厅平均评分
function getAvgRating(restaurantId) {
  return getRestaurantAvgRating(restaurantId).value
}

// 根据评分获取对应的标签（使用区间）
function getRatingLabel(rating) {
  if (!rating && rating !== 0) return '暂无评级'
  if (rating >= 4.5) return '夯'
  if (rating >= 3.5) return '顶级'
  if (rating >= 2.5) return '人上人'
  if (rating >= 1.5) return 'NPC'
  return '拉完了'
}

// 根据评分获取对应的样式类
function getRatingClass(rating) {
  if (!rating) return 'npc'
  if (rating >= 4.5) return 'hot'
  if (rating >= 3.5) return 'top-tier'
  if (rating >= 2.5) return 'top-tier'
  if (rating >= 1.5) return 'npc'
  return 'npc'
}

// 获取评分文本描述
function getScoreText(score) {
  const texts = {
    1: '很差',
    2: '一般',
    3: '还行',
    4: '很好',
    5: '非常好'
  }
  return texts[score] || ''
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 跳转到登录页
function goToAuth() {
  window.location.href = '/auth'
}
</script>

<style scoped>
/* 基础样式 */
.food-selector {
  background-color: #FDF9F1;
  min-height: 100vh;
  padding: 60px 0;
  margin: 0 auto;
  max-width: 100%;
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
  /* 保持原有样式但移除text-align: center */
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.header-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.title {
  color: #FF7354;
  font-size: 32px;
  font-weight: bold;
  margin: 0;
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

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.user-info:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 登录状态标签 */
.user-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: all 0.3s ease;
}

.status-logged-in {
  background: rgba(107, 208, 157, 0.1);
  color: #6BD09D;
  border: 1px solid rgba(107, 208, 157, 0.2);
}

.status-logged-out {
  background: rgba(255, 115, 84, 0.1);
  color: #FF7354;
  border: 1px solid rgba(255, 115, 84, 0.2);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.status-logged-in .status-dot {
  background: #6BD09D;
  box-shadow: 0 0 8px rgba(107, 208, 157, 0.5);
}

.status-logged-out .status-dot {
  background: #FF7354;
  box-shadow: 0 0 8px rgba(255, 115, 84, 0.5);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #FF8E6D, #FF7354);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 18px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.settings-btn {
  padding: 4px 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  border-radius: 6px;
}

.settings-btn:hover {
  background: rgba(255, 115, 84, 0.1);
  transform: scale(1.1);
}

.user-email {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.logout-btn {
  padding: 4px 12px;
  background: #F2EFE8;
  border: none;
  border-radius: 8px;
  color: #666;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: #FF7354;
  color: #FFF;
  transform: scale(1.05);
}

.login-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #FF8E6D, #FF7354);
  color: #FFF;
  text-decoration: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.login-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 115, 84, 0.35);
}

.login-icon {
  font-size: 14px;
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

.size-buttons {
  display: flex;
  gap: 4px;
}

.size-btn {
  padding: 6px 16px;
  border: 1px solid #E0E0E0;
  background: #FFF;
  color: #666;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.size-btn:hover {
  border-color: #FF7354;
  color: #FF7354;
}

.size-btn.active {
  background: #FF7354;
  border-color: #FF7354;
  color: #FFF;
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
  justify-content: center;
}

/* Card Component */
.food-card {
  background-color: #FFFFFF;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;
  animation: cardEnter 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
  animation-fill-mode: backwards;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

/* 卡片顶部彩色装饰条 */
.food-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #FF7354, #FF8E6D);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.food-card:hover::before {
  opacity: 1;
}

.food-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(255, 115, 84, 0.15);
  border-color: rgba(255, 115, 84, 0.2);
}

/* 拖拽状态 */
.food-card.draggable {
  cursor: grab;
}

.food-card.draggable:active {
  cursor: grabbing;
}

.food-card.dragging {
  opacity: 0.5;
  transform: scale(0.95);
  cursor: grabbing;
  z-index: 1000;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.food-card.drag-over {
  border: 2px dashed #FF7354;
  background-color: rgba(255, 115, 84, 0.05);
  transform: scale(1.02);
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

.food-card.active {
  background-color: #6BD09D;
  box-shadow: 0 12px 32px rgba(107, 208, 157, 0.4);
  transform: scale(1.02);
}

.food-card.active::before {
  opacity: 1;
  background: linear-gradient(90deg, #6BD09D, #8FE4B5);
}

.food-card.card-highlight {
  background-color: #FFF8E7 !important;
  transform: scale(1.12) translateY(-8px) !important;
  box-shadow: 0 0 0 3px #FFD93D, 0 16px 40px rgba(255, 217, 61, 0.5) !important;
  border-color: #FFD93D !important;
  z-index: 10;
  animation: cardMarqueeGlow 0.2s ease-in-out;
}

@keyframes cardMarqueeGlow {
  0% { box-shadow: 0 0 0 0px #FFD93D, 0 0 20px rgba(255, 217, 61, 0.2); }
  50% { box-shadow: 0 0 0 5px #FFD93D, 0 0 30px rgba(255, 217, 61, 0.6); }
  100% { box-shadow: 0 0 0 3px #FFD93D, 0 16px 40px rgba(255, 217, 61, 0.5); }
}

.food-card.card-highlight::before {
  opacity: 1;
  background: linear-gradient(90deg, #FFD93D, #FFE566);
}

.food-card.card-highlight .food-title {
  color: #333;
}

.food-card.card-highlight .food-description,
.food-card.card-highlight .meta-item {
  color: #666;
}

.food-card.card-dimmed {
  opacity: 0.15 !important;
  transform: scale(0.85) !important;
  filter: grayscale(100%) !important;
  transition: opacity 0.08s ease, transform 0.08s ease, filter 0.08s ease !important;
}

/* 跑马灯期间所有卡片的快速过渡 */
.food-grid:has(.card-highlight) .food-card,
.food-grid:has(.card-dimmed) .food-card {
  transition: opacity 0.1s ease, transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.1s ease, box-shadow 0.1s ease, border-color 0.1s ease !important;
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

.card-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.favorite-btn {
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.favorite-btn:hover {
  background: rgba(255, 115, 84, 0.1);
  transform: scale(1.1);
}

.favorite-btn.active {
  animation: favoritePulse 0.5s ease;
}

.favorite-btn.active .favorite-icon {
  filter: drop-shadow(0 2px 4px rgba(255, 71, 87, 0.4));
}

.favorite-icon {
  font-size: 16px;
  transition: all 0.3s ease;
}

@keyframes favoritePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
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
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.3s ease;
  letter-spacing: 0.02em;
}

.rating-badge.large {
  padding: 8px 16px;
  font-size: 13px;
  border-radius: 10px;
}

.rating-badge.top-tier {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #FFF;
  box-shadow: 0 2px 8px rgba(255, 165, 0, 0.3);
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

/* 锁图标样式 */
.lock-badge {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.3s ease;
  letter-spacing: 0.02em;
  background: linear-gradient(135deg, #D0D0D0, #A0A0A0);
  color: #FFF;
  box-shadow: 0 2px 6px rgba(128, 128, 128, 0.2);
}

.lock-badge:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(128, 128, 128, 0.3);
}

/* 评价按钮样式 */
.rate-btn {
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.rate-btn:hover {
  background: rgba(255, 193, 7, 0.1);
  transform: scale(1.1);
}

.rate-btn .rate-icon {
  font-size: 16px;
  transition: all 0.3s ease;
}

.rate-btn:hover .rate-icon {
  transform: rotate(15deg);
}

.food-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.food-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding: 0 10px;
  background: linear-gradient(135deg, #FFF0EE, #FFE8E8);
  color: #E67373;
  font-size: 11px;
  font-weight: 500;
  border-radius: 12px;
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

.wheel-container.spinning .wheel {
  filter: drop-shadow(0 0 16px rgba(255, 115, 84, 0.25));
}

.wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #FFF8F5 0deg, #F5EDE8 30deg, #FFF8F5 60deg, #F5EDE8 90deg, #FFF8F5 120deg, #F5EDE8 150deg, #FFF8F5 180deg, #F5EDE8 210deg, #FFF8F5 240deg, #F5EDE8 270deg, #FFF8F5 300deg, #F5EDE8 330deg, #FFF8F5 360deg);
  position: relative;
  box-shadow: 0 8px 32px rgba(255, 115, 84, 0.15), inset 0 0 80px rgba(255, 255, 255, 0.5);
  border: 6px solid #FFF;
}

/* 转盘中心装饰 */
.wheel::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #FF7354, #FF8E6D);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(255, 115, 84, 0.4);
}

.wheel-pointer {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 40px;
  color: #FF7354;
  z-index: 10;
  filter: drop-shadow(0 4px 8px rgba(255, 115, 84, 0.6));
  transition: filter 0.2s ease, transform 0.2s ease;
}

.wheel-pointer.spinning {
  animation: pointerBounce 0.6s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(255, 115, 84, 0.6)) drop-shadow(0 0 12px rgba(255, 115, 84, 0.4));
}

@keyframes pointerBounce {
  0%, 100% { transform: translateX(-50%) translateY(0) scale(1); }
  50% { transform: translateX(-50%) translateY(-8px) scale(1.1); }
}

/* 转盘旋转中容器发光 */
.wheel-container.spinning {
  filter: drop-shadow(0 0 20px rgba(255, 115, 84, 0.3));
}

.wheel-segment {
  position: absolute;
  width: 50%;
  height: 2px;
  top: 50%;
  left: 50%;
  transform-origin: left center;
  transition: opacity 0.15s ease;
  background: linear-gradient(90deg, rgba(255, 115, 84, 0.05), rgba(255, 115, 84, 0.15));
}

.wheel-segment.highlight {
  height: 3px;
  background: linear-gradient(90deg, rgba(255, 115, 84, 0.4), #FF7354);
  filter: drop-shadow(0 0 6px rgba(255, 115, 84, 0.6));
  transition: opacity 0.1s ease, height 0.15s ease, filter 0.15s ease, background 0.15s ease;
}

.segment-content {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
  font-size: 12px;
  color: #555;
  padding: 6px 14px;
  border-radius: 16px;
  background: #FFF;
  font-weight: 500;
  transition: all 0.15s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.wheel-segment.highlight .segment-content {
  background: linear-gradient(135deg, #FF7354, #FF8E6D);
  color: #FFF;
  transform: translateY(-50%) scale(1.15);
  box-shadow: 0 4px 20px rgba(255, 115, 84, 0.5), 0 0 0 2px rgba(255, 115, 84, 0.2);
  animation: segmentPulse 0.4s ease-in-out infinite;
}

@keyframes segmentPulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(255, 115, 84, 0.5), 0 0 0 2px rgba(255, 115, 84, 0.2); }
  50% { box-shadow: 0 4px 28px rgba(255, 115, 84, 0.7), 0 0 0 4px rgba(255, 115, 84, 0.3); }
}

.wheel-result-container {
  text-align: center;
  padding: 20px 40px;
  background: #FFF;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(255, 115, 84, 0.1);
  min-width: 180px;
}

.current-spinning {
  font-size: 28px;
  font-weight: bold;
  color: #FF7354;
  text-shadow: 0 2px 8px rgba(255, 115, 84, 0.3);
  animation: spinTextPop 0.3s ease-out;
}

@keyframes spinTextPop {
  0% { transform: scale(0.8); opacity: 0.5; }
  60% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
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
  font-size: 20px;
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

.detail-modal {
  background: #FFFFFF;
  border-radius: 28px;
  max-width: 420px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1);
  animation: modalSlideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  padding-bottom: 28px;
  margin: auto;
  box-sizing: border-box;
}

.detail-modal *,
.detail-modal *::before,
.detail-modal *::after {
  box-sizing: border-box;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.96);
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
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  color: #666;
  padding: 0;
  font-size: 16px;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
  transform: scale(1.1);
}

.modal-body {
  padding: 0 24px 24px 24px;
}

/* 详情页新样式 */
.detail-hero {
  text-align: center;
  padding: 48px 24px 28px;
  background: linear-gradient(180deg, #FFF8F5 0%, #FFF5F0 100%);
  border-radius: 28px 28px 0 0;
  position: relative;
  box-sizing: border-box;
  width: 100%;
}

.detail-hero::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: #FF7354;
  border-radius: 2px;
}

.detail-hero.top-tier {
  background: linear-gradient(180deg, #FFF9E6 0%, #FFF3CC 100%);
}

.detail-hero.hot {
  background: linear-gradient(180deg, #FFE8E8 0%, #FFDDDD 100%);
}

.detail-hero.npc {
  background: linear-gradient(180deg, #F8F8F8 0%, #F0F0F0 100%);
}

/* 头部评级+标签同一行 */
.detail-header-row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.detail-tags-inline {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.tag-inline {
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  font-size: 12px;
  color: #666;
  backdrop-filter: blur(4px);
}

.hero-icon {
  font-size: 56px;
  margin-bottom: 16px;
  display: block;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.detail-name {
  color: #1a1a1a;
  font-size: 26px;
  margin: 0 0 16px 0;
  font-weight: 700;
  line-height: 1.2;
}

.detail-hero .rating-badge {
  display: inline-block;
  padding: 6px 14px;
  font-size: 12px;
}

.detail-rating-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.lock-badge.large {
  padding: 8px 16px;
  font-size: 13px;
  border-radius: 10px;
  background: linear-gradient(135deg, #D0D0D0, #A0A0A0);
  color: #FFF;
  box-shadow: 0 2px 6px rgba(128, 128, 128, 0.2);
}

.detail-rate-btn {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.detail-rate-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.15);
}

.detail-stats {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 16px;
  padding: 24px 20px;
  margin: 20px;
  background: #FAFAFA;
  border-radius: 16px;
  box-sizing: border-box;
  width: calc(100% - 40px);
  max-width: 100%;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
}

.stat-icon {
  font-size: 22px;
}

.stat-label {
  font-size: 12px;
  color: #888;
  font-weight: 500;
}

.stat-value {
  font-size: 15px;
  color: #1a1a1a;
  font-weight: 600;
}

.detail-modal .detail-tags {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 0 16px;
  margin-bottom: 16px;
}

.detail-modal .tag {
  background: #F2EFE8;
  color: #666;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.detail-section {
  padding: 16px 20px;
  margin: 16px 0;
  background: #FEFEFE;
  border: 1px solid #F5F5F5;
  border-radius: 10px;
}

.section-title {
  font-size: 14px;
  color: #999;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.detail-text {
  color: #333;
  font-size: 14px;
  line-height: 1.7;
  margin: 0;
}

.detail-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px 20px;
  box-sizing: border-box;
  width: 100%;
}

.feature-tag {
  background: linear-gradient(135deg, #FFF0EE, #FFE8E8);
  color: #E67373;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
}

/* 评价区域 - 新增 */
.detail-rating-section-new {
  margin: 0 24px;
  padding: 24px 0;
  border-top: 1px solid #EEE;
}

/* 菜品评价区域 */
.detail-dishes-section {
  margin: 0 24px;
  padding: 24px 0;
  border-top: 1px solid #EEE;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.dish-icon {
  font-size: 20px;
}

.dish-count {
  font-size: 13px;
  color: #888;
}

.dishes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.dish-card {
  background: #FFF;
  border: 2px solid #F0F0F0;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;
}

.dish-card:hover {
  transform: translateY(-4px);
  border-color: #FF7354;
  box-shadow: 0 8px 24px rgba(255, 115, 84, 0.15);
}

.dish-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #FF8E6D, #FF7354);
}

.dish-card.user-rated {
  border-color: #6BD09D;
  background: linear-gradient(135deg, #F8FFF8, #F0FFF8);
}

.dish-card.user-rated::before {
  background: linear-gradient(90deg, #6BD09D, #8FE4B5);
}

/* 卡片顶部：菜品名 + 已评标签 */
.dish-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.dish-card-top .dish-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  flex: 1;
}

.rated-badge {
  padding: 2px 8px;
  background: linear-gradient(135deg, #6BD09D, #5BC58C);
  color: #FFF;
  font-size: 10px;
  font-weight: 600;
  border-radius: 10px;
  white-space: nowrap;
}

/* 卡片中部：评分 */
.dish-card-middle {
  flex: 1;
  display: flex;
  align-items: center;
}

.dish-card-middle .dish-rating {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.dish-card-middle .dish-score {
  font-size: 32px;
  font-weight: 700;
  color: #FF7354;
  line-height: 1;
}

.dish-card-middle .score-unit {
  font-size: 14px;
  color: #888;
  margin-left: 2px;
}

/* 卡片底部：操作按钮 */
.dish-card-bottom {
  padding-top: 8px;
  border-top: 1px solid #F5F5F5;
}

.rate-btn-text {
  display: block;
  text-align: center;
  padding: 8px;
  background: linear-gradient(135deg, #FFF8F5, #FFE8E0);
  color: #FF7354;
  font-size: 13px;
  font-weight: 500;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.dish-card:hover .rate-btn-text {
  background: linear-gradient(135deg, #FF8E6D, #FF7354);
  color: #FFF;
}

.dish-card.user-rated .rate-btn-text {
  background: linear-gradient(135deg, #E8F9EE, #D4F5DE);
  color: #6BD09D;
}

.dish-card.user-rated:hover .rate-btn-text {
  background: linear-gradient(135deg, #6BD09D, #5BC58C);
  color: #FFF;
}


/* 添加新菜品卡片 */
.add-dish-card {
  background: linear-gradient(135deg, #F8F8F8, #F0F0F0);
  border: 2px dashed #CCC;
  cursor: pointer;
}

.add-dish-card:hover {
  border-color: #FF7354;
  background: linear-gradient(135deg, #FFF8F5, #FFE8E0);
}

.add-dish-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 0;
}

.add-dish-icon {
  font-size: 28px;
}

.add-dish-text {
  font-size: 13px;
  color: #888;
  font-weight: 500;
}

.add-dish-card:hover .add-dish-text {
  color: #FF7354;
}

/* 空状态操作按钮 */
.empty-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.empty-action-btn.secondary {
  background: linear-gradient(135deg, #F5F5F5, #E8E8E8);
  color: #666;
  box-shadow: none;
}

.empty-action-btn.secondary:hover {
  background: linear-gradient(135deg, #E8E8E8, #DDD);
  color: #333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 添加菜品输入区域 */
.add-dish-input-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  width: 100%;
  max-width: 260px;
}

.add-dish-input {
  padding: 12px 16px;
  border: 2px solid #FFE8E0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  width: 100%;
}

.add-dish-input:focus {
  outline: none;
  border-color: #FF7354;
  box-shadow: 0 0 0 4px rgba(255, 115, 84, 0.1);
}

.add-dish-buttons {
  display: flex;
  gap: 8px;
}

.add-dish-confirm {
  flex: 1;
  padding: 10px 16px;
  background: linear-gradient(135deg, #FF8E6D, #FF7354);
  color: #FFF;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-dish-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 115, 84, 0.3);
}

.add-dish-cancel {
  flex: 1;
  padding: 10px 16px;
  background: #F5F5F5;
  color: #666;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-dish-cancel:hover {
  background: #E0E0E0;
}

.rating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.rating-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.rating-icon {
  font-size: 20px;
}

.rating-count {
  font-size: 13px;
  color: #888;
}

/* 评分概览 */
.rating-overview {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #FFFBF8, #FFF5F0);
  border-radius: 16px;
}

.avg-score {
  display: flex;
  align-items: baseline;
  gap: 4px;
  min-width: 80px;
}

.score-number {
  font-size: 42px;
  font-weight: 700;
  color: #FF7354;
  line-height: 1;
}

.score-label {
  font-size: 16px;
  color: #888;
}

.rating-bars {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.bar-stars {
  width: 28px;
  color: #666;
}

.bar-container {
  flex: 1;
  height: 8px;
  background: #EEE;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF8E6D, #FF7354);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bar-percent {
  width: 36px;
  text-align: right;
  color: #888;
}

/* 评价按钮 */
.rating-action {
  margin-bottom: 20px;
}

.write-review-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #FF8E6D, #FF7354);
  color: #FFF;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.write-review-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 115, 84, 0.35);
}

.btn-icon {
  font-size: 16px;
}

.login-prompt {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: #F8F8F8;
  border-radius: 14px;
  color: #666;
  font-size: 14px;
}

.lock-icon {
  font-size: 14px;
}

.login-link {
  color: #FF7354;
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
}

.login-link:hover {
  text-decoration: underline;
}

/* 评价列表预览 */
.reviews-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  padding: 16px;
  background: #FFF;
  border: 1px solid #EEE;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.review-item:hover {
  border-color: #FFCCC5;
  box-shadow: 0 4px 12px rgba(255, 115, 84, 0.1);
}

/* 菜品评价样式 */
.review-item.dish-rating-item {
  background: linear-gradient(135deg, #FFFEFC, #FFF8F5);
  border-color: #FFE8D6;
}

.review-item.dish-rating-item:hover {
  border-color: #FFB088;
}

.review-type-badge {
  margin-bottom: 10px;
}

.dish-tag {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #FFF0E6, #FFE0C8);
  color: #E67346;
  font-size: 12px;
  font-weight: 500;
  border-radius: 12px;
  border: 1px solid rgba(230, 115, 70, 0.2);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #FF8E6D, #FF7354);
  color: #FFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.review-stars {
  display: flex;
  gap: 2px;
}

.review-stars .star {
  font-size: 14px;
  color: #DDD;
}

.review-stars .star.filled {
  color: #FFD700;
}

.review-comment {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
  margin: 0 0 10px 0;
}

.review-empty {
  font-size: 13px;
  color: #AAA;
  font-style: italic;
  margin: 0 0 10px 0;
}

.review-date {
  font-size: 12px;
  color: #999;
}

.more-reviews {
  text-align: center;
  padding: 12px;
  color: #888;
  font-size: 13px;
  background: #F8F8F8;
  border-radius: 10px;
}

.no-reviews {
  text-align: center;
  padding: 32px 20px;
  background: #FAFAFA;
  border-radius: 12px;
}

.no-reviews .empty-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 12px;
}

.no-reviews p {
  color: #888;
  font-size: 14px;
  margin: 0;
}

.detail-modal .select-button {
  margin: 24px 24px 0;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-sizing: border-box;
  width: calc(100% - 48px) !important;
  display: block;
  padding: 16px 24px;
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
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  animation: modalFadeIn 0.3s ease;
}

.winner-content {
  background: #FFFFFF;
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
  color: #1a1a1a;
  font-size: 24px;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.winner-text {
  color: #888;
  font-size: 15px;
  margin: 0 0 12px 0;
}

.winner-name {
  color: #FF7354;
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
  background: linear-gradient(135deg, #FF8E6D, #FF7354);
  color: #FFF;
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
@media (max-width: 768px) {
  .food-grid {
    grid-template-columns: repeat(2, 1fr);
    justify-content: center;
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
    justify-content: center;
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

  .detail-modal {
    border-radius: 20px;
  }

  .detail-name {
    font-size: 20px;
  }

  .detail-stats {
    padding: 16px 8px;
  }

  .winner-name {
    font-size: 28px;
  }

  /* 移动端登录状态响应式样式 */
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-left {
    align-items: center;
    text-align: center;
  }

  .user-info {
    justify-content: center;
    padding: 12px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .user-status-badge {
    font-size: 10px;
    padding: 3px 8px;
  }

  .user-avatar {
    width: 28px;
    height: 28px;
  }

  .avatar-icon {
    font-size: 14px;
  }

  .user-details {
    align-items: center;
    gap: 6px;
  }

  .user-email {
    font-size: 11px;
  }

  .logout-btn {
    padding: 3px 10px;
    font-size: 10px;
  }

  .login-link {
    padding: 6px 12px;
    font-size: 12px;
    justify-content: center;
  }

  .login-icon {
    font-size: 12px;
  }
}

/* 评分弹窗样式 */
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
  animation: fadeIn 0.3s ease;
}

.rating-content {
  background: #FFF;
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
  color: #333;
  margin: 0 0 8px 0;
}

.rating-subtitle {
  color: #888;
  font-size: 14px;
  margin: 0;
}

.rating-stars {
  margin-bottom: 32px;
  text-align: center;
}

.rating-label {
  font-size: 16px;
  font-weight: 500;
  color: #333;
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
  background: #F5F5F5;
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
  background: #FFE8E0;
}

.star-btn.active {
  background: #FF7354;
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
  color: #666;
  margin: 8px 0 0 0;
}

.rating-comment {
  margin-bottom: 32px;
}

.comment-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
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
  background: #FAFAFA;
  font-family: inherit;
}

.comment-textarea:focus {
  outline: none;
  border-color: #FF7354;
  background: #FFF;
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
  background: #FFE8E0;
  color: #FF7354;
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
  background: #F5F5F5;
  color: #666;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
}

.rating-cancel-btn:hover:not(:disabled) {
  background: #E0E0E0;
  transform: translateY(-2px);
}

.rating-cancel-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 菜品评价列表弹窗 */
.dish-reviews-modal {
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
  animation: fadeIn 0.3s ease;
}

.dish-reviews-content {
  background: #FFF;
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  max-width: 480px;
  margin: 20px;
  position: relative;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-height: 80vh;
  overflow-y: auto;
}

.dish-reviews-header {
  text-align: center;
  margin-bottom: 24px;
}

.dish-reviews-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.dish-reviews-title {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.reviews-count {
  font-size: 14px;
  color: #888;
  font-weight: 400;
  margin-left: 8px;
}

.dish-reviews-loading {
  text-align: center;
  padding: 40px 20px;
  color: #888;
}

.dish-reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.dish-review-item {
  padding: 16px;
  background: #FAFAFA;
  border-radius: 14px;
  transition: all 0.3s ease;
}

.dish-review-item:hover {
  background: #F5F5F5;
}

.dish-review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.dish-review-comment {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
  margin: 0 0 10px 0;
}

.dish-review-empty {
  font-size: 13px;
  color: #AAA;
  font-style: italic;
  margin: 0 0 10px 0;
}

.dish-review-date {
  font-size: 12px;
  color: #999;
}

.dish-reviews-empty {
  text-align: center;
  padding: 40px 20px;
  color: #888;
}

.dish-reviews-empty .empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.dish-reviews-empty .empty-hint {
  font-size: 14px;
  color: #AAA;
  margin-top: 8px;
}

.dish-reviews-actions {
  margin-top: 8px;
}

.write-dish-review-btn {
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

.write-dish-review-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 115, 84, 0.35);
}

/* 用户设置弹窗 */
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
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.settings-content {
  background: #FFF;
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  max-width: 420px;
  margin: 20px;
  position: relative;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

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
  color: #333;
  margin: 0;
}

/* 用户信息展示 */
.settings-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #FFF8F5, #FFE8E0);
  border-radius: 16px;
  margin-bottom: 20px;
}

.profile-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #FF8E6D, #FF7354);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  color: #FFF;
}

.profile-info {
  flex: 1;
}

.profile-email {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.profile-joined {
  font-size: 12px;
  color: #888;
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
  background: #FAFAFA;
  border-radius: 12px;
  text-align: center;
}

.stat-box .stat-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #FF7354;
  line-height: 1;
}

.stat-box .stat-label {
  display: block;
  font-size: 12px;
  color: #888;
  margin-top: 6px;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.settings-form .form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.settings-form .form-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.settings-form .form-input {
  padding: 14px 16px;
  border: 2px solid #EEE;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
}

.settings-form .form-input:focus {
  outline: none;
  border-color: #FF7354;
  box-shadow: 0 0 0 4px rgba(255, 115, 84, 0.1);
}

.settings-form .form-input:disabled {
  background: #F5F5F5;
  color: #999;
  cursor: not-allowed;
}

.settings-form .form-hint {
  font-size: 12px;
  color: #888;
  margin: 0;
}

.settings-form .form-hint.error {
  color: #E57373;
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
  color: #333;
}

.checkbox-icon {
  font-size: 18px;
}

.settings-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-save-btn {
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

.settings-save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 115, 84, 0.35);
}

.settings-save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.settings-cancel-btn {
  width: 100%;
  padding: 14px;
  background: #F5F5F5;
  color: #666;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.settings-cancel-btn:hover:not(:disabled) {
  background: #E8E8E8;
  color: #333;
}

.settings-cancel-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 历史记录区域 */
.history-section {
  margin: 24px 0;
  border-radius: 16px;
  overflow: hidden;
  background: #F9F9F9;
  border: 1px solid #EEE;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  background: #FFF;
  transition: background 0.3s ease;
}

.history-header:hover {
  background: #F5F5F5;
}

.history-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
}

.history-toggle {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.history-content {
  padding: 0 20px;
  background: #FFF;
  border-top: 1px solid #EEE;
}

.history-actions {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #EEE;
  margin-bottom: 16px;
}

.btn-history-action {
  flex: 1;
  padding: 10px 16px;
  background: #F0F0F0;
  border: 1px solid #DDD;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-history-action:hover:not(:disabled) {
  background: #E8E8E8;
  border-color: #CCC;
}

.btn-history-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-history-action.btn-danger {
  background: #FFF0F0;
  border-color: #FFCCCC;
  color: #E53935;
}

.btn-history-action.btn-danger:hover:not(:disabled) {
  background: #FFE6E6;
  border-color: #FF9999;
}

.history-loading {
  padding: 40px 0;
  text-align: center;
  color: #999;
}

.history-loading .loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #F0F0F0;
  border-top: 3px solid #FF7354;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 1s linear infinite;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.history-item {
  padding: 12px;
  border-radius: 8px;
  background: #FAFAFA;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #EEE;
}

.history-item:hover {
  background: #F5F5F5;
  border-color: #DDD;
  transform: translateX(4px);
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.history-item-name {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.history-item-time {
  font-size: 12px;
  color: #999;
}

.history-item-restaurant {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.history-empty {
  padding: 40px 0;
  text-align: center;
  color: #999;
}

.history-empty i {
  font-size: 40px;
  margin-bottom: 16px;
  display: block;
}

.history-empty-hint {
  font-size: 13px;
  color: #BBB;
  margin-top: 8px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 餐馆申请弹窗 */
.app-modal {
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
  animation: fadeIn 0.3s ease;
}

.app-content {
  background: #FFF;
  border-radius: 24px;
  padding: 28px;
  width: 100%;
  max-width: 480px;
  margin: 20px;
  position: relative;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-height: 85vh;
  overflow-y: auto;
}

.app-header {
  text-align: center;
  margin-bottom: 24px;
}

.app-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.app-title {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.app-subtitle {
  font-size: 14px;
  color: #888;
  margin: 8px 0 0 0;
}

.app-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 24px;
}

.app-form .form-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  display: block;
}

.app-form .form-input,
.app-form .form-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #EEE;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.app-form .form-input:focus,
.app-form .form-textarea:focus {
  outline: none;
  border-color: #FF7354;
}

.app-form .form-textarea {
  resize: vertical;
}

/* 类型选择样式 */
.type-radio-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 4px;
}

.type-radio-item {
  position: relative;
}

.type-radio {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.type-radio-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border: 2px solid #EEE;
  border-radius: 16px;
  background: #FFF;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  height: 100%;
}

.type-radio:checked + .type-radio-label {
  border-color: #FF7354;
  background: linear-gradient(135deg, rgba(255, 115, 84, 0.05), rgba(255, 115, 84, 0.1));
  box-shadow: 0 4px 12px rgba(255, 115, 84, 0.15);
}

.type-radio-label:hover {
  border-color: #FF7354;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.type-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.type-text {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.type-desc {
  font-size: 12px;
  color: #888;
  line-height: 1.4;
}

/* 反馈内容文本域 */
.feedback-textarea {
  min-height: 120px;
}

.location-tags,
.type-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.location-tag,
.type-tag {
  padding: 8px 16px;
  border: 1px solid #E0E0E0;
  background: #FFF;
  color: #666;
  font-size: 13px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.location-tag:hover,
.type-tag:hover {
  border-color: #FF7354;
  color: #FF7354;
}

.location-tag.active,
.type-tag.active {
  background: #FF7354;
  border-color: #FF7354;
  color: #FFF;
}

.app-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.app-submit-btn {
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

.app-submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 115, 84, 0.35);
}

.app-submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 成功提示 */
.app-success {
  text-align: center;
  padding: 40px 20px;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.success-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px 0;
}

.success-text {
  font-size: 15px;
  color: #555;
  margin: 8px 0;
}

.success-hint {
  font-size: 13px;
  color: #888;
  margin: 24px 0 16px 0;
}

.success-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #FF8E6D, #FF7354);
  color: #FFF;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

/* 申请管理弹窗 */
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
  animation: fadeIn 0.3s ease;
}

.apps-content {
  background: #FFF;
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
  color: #333;
  margin: 8px 0 0 0;
}

.apps-loading,
.apps-empty {
  text-align: center;
  padding: 40px 20px;
  color: #888;
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
  background: #FAFAFA;
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
  color: #333;
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
  color: #666;
  margin-bottom: 6px;
}

.app-item-desc {
  font-size: 13px;
  color: #888;
  margin-bottom: 6px;
}

.app-item-date {
  font-size: 12px;
  color: #AAA;
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
  color: #FFF;
}

.approve-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(91, 158, 107, 0.3);
}

.reject-btn {
  background: linear-gradient(135deg, #E57373, #D55A5A);
  color: #FFF;
}

.reject-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(229, 115, 115, 0.3);
}

/* 补充餐馆按钮 */
.add-restaurant-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #F5F5F5, #E8E8E8);
  color: #666;
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 12px;
}

.add-restaurant-btn:hover {
  background: linear-gradient(135deg, #E8E8E8, #DDD);
  color: #333;
}

.delete-icon {
  font-size: 14px;
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  border: none;
  background: #F5F5F5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  transition: all 0.3s ease;
  z-index: 1;
}

.modal-close:hover {
  background: #E0E0E0;
  color: #333;
  transform: scale(1.1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
