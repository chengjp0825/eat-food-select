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
- **语言**: JavaScript (ES6+)
- **构建工具**: Vite 8
- **路由**: Vue Router 4
- **UI框架**: Bootstrap 5.3 + Bootstrap Icons 1.13
- **后端服务**: Supabase (PostgreSQL + 实时订阅 + 认证)
- **交互库**: Popper.js 2.11

## 项目结构

```
ewew/
├── src/
│   ├── assets/          # 静态资源（图片、图标等）
│   ├── components/      # 可复用组件
│   │   ├── FoodCard.vue          # 餐馆卡片组件
│   │   ├── WinnerModal.vue       # 中奖弹窗
│   │   ├── RatingModal.vue       # 评分弹窗
│   │   ├── DishReviewsModal.vue  # 菜品评价列表弹窗
│   │   ├── AppsModal.vue         # 申请管理弹窗
│   │   ├── RestaurantDetailModal.vue  # 餐馆详情弹窗
│   │   ├── SettingsModal.vue     # 用户设置弹窗
│   │   └── FeedbackModal.vue     # 反馈弹窗
│   ├── composables/     # 组合式函数
│   │   ├── useAuth.js            # 认证相关逻辑
│   │   ├── useData.js            # 数据管理逻辑
│   │   ├── useRatings.js         # 评分系统逻辑
│   │   └── useRestaurantDetail.js # 餐馆详情状态管理
│   ├── lib/             # 工具库
│   │   └── supabase.js  # Supabase客户端配置
│   ├── views/           # 页面视图
│   │   ├── HomeView.vue           # 首页 - 餐馆推荐与搜索
│   │   ├── AuthView.vue           # 认证页面 - 用户登录/注册
│   │   ├── FoodSelectorView.vue   # 食物选择器 - 跑马灯抽奖
│   │   ├── RestaurantDetailView.vue  # 餐馆详情页
│   │   └── AdminView.vue         # 管理员页面
│   ├── router/          # 路由配置
│   │   └── index.js
│   ├── App.vue          # 根组件
│   ├── main.js          # 应用入口
│   └── style.css        # 全局样式
├── supabase/            # Supabase配置
│   └── schema.sql       # 数据库模式
├── public/              # 公共资源
│   ├── favicon.svg
│   └── icons.svg
├── index.html           # HTML入口
├── vite.config.js       # Vite配置
├── .env.example         # 环境变量模板
└── package.json         # 项目依赖
```

## 功能特性

### 用户认证
- 用户注册与登录
- 基于Supabase的认证系统
- 安全的密码管理
- 用户资料编辑

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
- 餐馆整体评分 + 菜品级别评分

### 管理员功能
- 餐馆申请审批（批准/驳回）
- 用户申请记录管理

## 快速开始

### 环境配置

1. 复制环境变量模板文件：
```bash
cp .env.example .env
```

2. 在 `.env` 文件中配置 Supabase 相关变量：
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 数据库设置

项目使用 Supabase 作为后端数据库。数据库模式定义在 `supabase/schema.sql` 中。

1. 在 Supabase 控制台创建新项目
2. 执行 `supabase/schema.sql` 中的 SQL 语句创建表结构
3. 配置认证设置（允许邮箱注册等）

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

### 部署

项目可以部署到静态站点托管服务如 Vercel、Netlify 或 GitHub Pages：

1. 构建项目：`npm run build`
2. 将 `dist/` 目录上传到托管服务
3. 配置环境变量（Supabase URL 和 Key）

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

### 组合式函数 (Composables)

项目使用 Vue 3 组合式函数来组织业务逻辑：

- `useAuth.js`: 用户认证相关逻辑（登录、注册、登出）
- `useData.js`: 数据获取和管理（餐厅数据、用户数据）
- `useRatings.js`: 评分系统逻辑（评价提交、评分计算）
- `useRestaurantDetail.js`: 餐馆详情弹窗状态管理

在组件中使用示例：
```javascript
import { useAuth } from '@/composables/useAuth'
import { useData } from '@/composables/useData'

const { user, login, logout } = useAuth()
const { restaurants, loading } = useData()
```

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
| `/auth` | auth | AuthView | 用户认证页面 |
| `/food-selector` | food-selector | FoodSelectorView | 食物选择器 |
| `/restaurant/:id` | restaurant-detail | RestaurantDetailView | 餐馆详情页 |
| `/admin` | admin | AdminView | 管理员页面 |

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 贡献指南

欢迎为项目贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -m 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 提交 Pull Request

### 代码规范

- 使用 Vue 3 Composition API + `<script setup>` 语法
- 遵循 ESLint 配置
- 组件样式使用 scoped CSS
- 提交消息使用中文，描述清晰

## 许可证

Copyright © 2026 实验室内部使用
