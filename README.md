# 实验室美食分享

实验室成员美食发现与分享平台，帮助大家发现校内及周边的优质餐厅，分享美食体验。

## 项目简介

这是一个基于 Vue 3 + Vite 构建的单页面应用，为实验室成员提供：

- 餐馆发现与推荐
- 食物选择器（智能抽奖功能）
- 菜品评价与分享
- 成员美食动态
- 用户评价系统

## 技术栈

- **前端框架**: Vue 3 (Composition API + `<script setup>`)
- **构建工具**: Vite 8
- **路由**: Vue Router 4
- **UI框架**: Bootstrap 5.3 + Bootstrap Icons 1.13
- **交互库**: Popper.js 2.11

## 项目结构

```
ewew/
├── src/
│   ├── assets/          # 静态资源（图片、图标等）
│   ├── components/      # 可复用组件
│   │   └── HelloWorld.vue
│   ├── views/           # 页面视图
│   │   ├── HomeView.vue           # 首页 - 餐馆推荐与搜索
│   │   ├── FoodSelectorView.vue   # 食物选择器 - 跑马灯抽奖
│   │   └── RestaurantDetailView.vue  # 餐馆详情页
│   ├── router/          # 路由配置
│   │   └── index.js
│   ├── App.vue          # 根组件
│   ├── main.js          # 应用入口
│   └── style.css        # 全局样式
├── public/              # 公共资源
│   ├── favicon.svg
│   └── icons.svg
├── index.html           # HTML入口
├── vite.config.js       # Vite配置
└── package.json         # 项目依赖
```

## 功能特性

### 首页
- 餐馆搜索功能
- 分类筛选（食堂、中餐、西餐、快餐、小吃、饮品等）
- 成员推荐餐馆列表（卡片展示）
- 特色菜品展示
- 响应式导航栏

### 食物选择器
- **双模式切换**：卡片模式和转盘模式
- **智能筛选**：
  - 按地理位置筛选（南门、北门、东门、校内）
  - 按食物类型筛选（食堂、快餐、中餐、日料、火锅、小吃、饮品、轻食、夜宵）
- **跑马灯抽奖**：
  - 卡片模式：快速高亮动画
  - 转盘模式：模拟真实转盘效果，带加速减速动画
- **食物详情弹窗**：查看详细介绍、价格、距离等信息
- **评分标签**：人上人/夯/npc 三种等级
- **响应式设计**：适配桌面端和移动端

### 餐馆详情页
- 餐馆基本信息展示
- 营业时间与联系方式
- 菜品列表与评价
- 成员评价展示
- 评分分布统计（可视化进度条）
- 菜品评价提交功能（模态框）

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 生产构建

```bash
npm run build
```

构建产物将输出到 `dist/` 目录

### 预览构建结果

```bash
npm run preview
```

## 开发指南

### 添加新页面

1. 在 `src/views/` 创建新组件（使用 Composition API + `<script setup>` 语法）
2. 在 `src/router/index.js` 添加路由配置

示例：
```javascript
{
  path: '/new-page',
  name: 'new-page',
  component: () => import('../views/NewPageView.vue')
}
```

### 样式定制

- 项目使用 Bootstrap 5.3，全局样式在 `src/style.css` 中定义
- 组件样式使用 scoped CSS，避免样式污染
- 主题色使用 CSS 变量方便统一管理

### 路由使用

项目使用 Vue Router 4，在组件中可以通过以下方式使用路由：

```javascript
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 导航
router.push({ name: 'home' })

// 获取参数
const id = route.params.id
```

## 页面路由

| 路由路径 | 路由名称 | 组件 | 说明 |
|---------|---------|------|------|
| `/` | home | HomeView | 首页 |
| `/food-selector` | food-selector | FoodSelectorView | 食物选择器 |
| `/restaurant/:id` | restaurant-detail | RestaurantDetailView | 餐馆详情页 |

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

Copyright © 2026 实验室内部使用
