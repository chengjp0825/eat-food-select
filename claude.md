# Project Context for Claude Code

## 🎯 项目概述 (Project Overview)
这是一个“实验室美食分享项目”的单页面应用 (SPA)。项目已接入 Supabase 后端，提供完整的用户认证、数据存储和实时功能。核心功能包括餐馆浏览、收藏、评分、历史记录和菜品评价。

## 🛠 核心技术栈 (Tech Stack)
- **前端框架**: Vue 3.5 (严格使用 Composition API + `<script setup>`)
- **语言**: JavaScript (ES6+) - **注意：当前项目不使用 TypeScript**
- **构建工具**: Vite 8
- **路由**: Vue Router 4.6
- **UI 框架**: Bootstrap 5.3 + Bootstrap Icons 1.13
- **后端即服务**: Supabase (PostgreSQL + 实时订阅 + 认证)

## 📁 目录结构约定 (Directory Structure)
- `src/assets/`: 静态资源（图片、图标）。
- `src/components/`: 可复用 UI 组件（如 `FoodCard.vue`）。
- `src/views/`: 路由级别的页面组件（如 `HomeView.vue`, `FoodSelectorView.vue`, `AuthView.vue`）。
- `src/router/`: 路由配置 (`index.js`)。
- `src/lib/`: 第三方库初始化文件（如 `supabase.js`）。
- `src/composables/`: 组合式函数（如 `useAuth.js`, `useData.js`, `useRatings.js`）。
- `src/style.css`: 全局样式和 **核心 CSS 变量系统**。
- `supabase/`: 数据库 Schema 文件 (`schema.sql`)。

## ✍️ 编码与架构规范 (Coding Conventions)
当你为我编写或修改代码时，必须严格遵守以下原则：

### 1. Vue 3 语法糖
- **绝对要求**：必须使用 `<script setup>` 语法，禁止使用 Options API。
- **模板语法**：极其小心 HTML 属性和指令的引号闭合问题。在编写 `v-for`、`v-if` 或绑定属性 `:` 时，**务必检查是否存在多余的引号**（例如避免出现 `v-for="item in" items"` 这种低级语法错误破坏 Vite 编译）。
- **状态管理**：优先使用 `ref`、`computed` 和 `watch`。复杂状态拆分，优先使用 `computed` 替代无参数的 `methods` 进行性能优化。
- **组合式函数**：业务逻辑应封装在 `composables/` 目录下的组合式函数中，遵循单一职责原则。

### 2. 命名规范
- **组件文件**：`PascalCase` (例如 `FoodSelectorView.vue`)，且优先使用单文件组件。
- **变量与函数**：`camelCase`。
- **常量**：`UPPER_SNAKE_CASE`。
- **CSS 类名**：`kebab-case` (例如 `.food-card`)。

### 3. 样式与 UI 规范
- **作用域**：必须使用 `<style scoped>`，避免全局污染。
- **禁止硬编码颜色**：**绝对禁止**在组件的 style 中写死颜色代码。必须使用 `src/style.css` 中已定义的 CSS 变量（如 `var(--color-bg-primary)`, `var(--color-accent-primary)`, `var(--shadow-md)` 等）。
- **UI 库集成**：优先使用 Bootstrap 5 的工具类（如 `.text-center`, `.d-flex`, `.mb-3`）进行布局，尽量减少自定义 CSS。图标统一使用 Bootstrap Icons (`bi bi-*`)。
- **避免**：除非万不得已，否则不要使用 `!important`。

### 4. 数据与 API
- **Supabase 客户端**：通过 `src/lib/supabase.js` 导出的 `supabase` 实例访问数据库和认证。
- **组合式函数**：数据操作应通过现有的组合式函数进行：
  - `useAuth()`: 用户认证、资料管理
  - `useData.js`: 收藏、历史记录、餐馆数据
  - `useRatings.js`: 评分、菜品评价、平均分计算
- **错误处理**：所有异步操作必须使用 `try/catch` 进行错误处理，并给用户友好的错误提示。
- **加载状态**：异步操作应提供加载状态反馈。

### 5. 数据库 Schema 模式
- **表结构**：参考 `supabase/schema.sql`，包含以下主要表：
  - `restaurants`: 餐馆基本信息
  - `profiles`: 用户资料（扩展 auth.users）
  - `favorites`: 收藏关系
  - `history`: 浏览历史
  - `ratings`: 评分和菜品评价
  - `restaurant_applications`: 餐馆申请
- **RLS 策略**：所有表都已启用行级安全策略，确保数据访问安全。
- **唯一约束**：注意表间的唯一约束（如用户对同一餐馆只能收藏一次）。

## 🚫 绝对不要做的雷区 (Do NOT Do)
1. 绝对不要修改 `node_modules/`、`.vite/` 或 `package-lock.json`。
2. 绝对不要在没有任何沟通的情况下引入 TypeScript 语法（如类型注解 `: string` 或 `interface`），项目目前纯粹基于 JS 运行。
3. 输出代码时，请给出完整可运行的文件结构或直接精准执行文件修改，不要给出模糊的替换片段。
4. 绝对禁止在未确认文件大小前，直接读取超过 300 行的代码文件。当你需要查看文件时，必须使用工具的 offset/limit 参数，或者在终端使用 `grep -n`、`head`、`tail` 来局部提取信息。
5. 绝对不要绕过现有的组合式函数直接操作 Supabase 客户端，除非有特殊需求。
6. 绝对不要硬编码 Supabase 环境变量，必须使用 `import.meta.env` 中的变量。

## 🚀 常用命令
- 启动项目: `npm run dev`
- 打包构建: `npm run build`
- 环境变量：需要配置 `.env` 文件，包含 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`

## 📋 当前功能状态
- ✅ 用户认证（注册、登录、登出）
- ✅ 餐馆浏览与筛选
- ✅ 收藏功能
- ✅ 浏览历史
- ✅ 餐馆整体评分
- ✅ 菜品级别评价
- ✅ 餐馆申请补充功能
- ⏳ 管理员审核界面（待实现）
- ⏳ 实时通知（待实现）

## 🔗 相关文件参考
- `src/views/FoodSelectorView.vue`: 主功能页面，包含餐馆列表、筛选、详情弹窗
- `src/views/AuthView.vue`: 认证页面
- `src/views/RestaurantDetailView.vue`: 餐馆详情页面
- `src/composables/useAuth.js`: 认证逻辑
- `src/composables/useData.js`: 数据获取与收藏历史
- `src/composables/useRatings.js`: 评分与评价逻辑
- `src/lib/supabase.js`: Supabase 客户端初始化
- `supabase/schema.sql`: 完整数据库 Schema
