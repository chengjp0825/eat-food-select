# Project Context for Claude Code

## 🎯 项目概述 (Project Overview)
这是一个“实验室美食分享项目”的单页面应用 (SPA)。当前处于快速开发阶段，数据暂时硬编码在组件内部，尚未接入统一的 API 和状态管理库。

## 🛠 核心技术栈 (Tech Stack)
- **前端框架**: Vue 3.5 (严格使用 Composition API + `<script setup>`)
- **语言**: JavaScript (ES6+) - **注意：当前项目不使用 TypeScript**
- **构建工具**: Vite 8
- **路由**: Vue Router 4.6
- **UI 框架**: Bootstrap 5.3 + Bootstrap Icons 1.13

## 📁 目录结构约定 (Directory Structure)
- `src/assets/`: 静态资源（图片、图标）。
- `src/components/`: 可复用 UI 组件（如 `FoodCard.vue`）。
- `src/views/`: 路由级别的页面组件（如 `HomeView.vue`, `FoodSelectorView.vue`）。
- `src/router/`: 路由配置 (`index.js`)。
- `src/style.css`: 全局样式和 **核心 CSS 变量系统**。

## ✍️ 编码与架构规范 (Coding Conventions)
当你为我编写或修改代码时，必须严格遵守以下原则：

### 1. Vue 3 语法糖
- **绝对要求**：必须使用 `<script setup>` 语法，禁止使用 Options API。
- **模板语法**：极其小心 HTML 属性和指令的引号闭合问题。在编写 `v-for`、`v-if` 或绑定属性 `:` 时，**务必检查是否存在多余的引号**（例如避免出现 `v-for="item in" items"` 这种低级语法错误破坏 Vite 编译）。
- **状态管理**：优先使用 `ref`、`computed` 和 `watch`。复杂状态拆分，优先使用 `computed` 替代无参数的 `methods` 进行性能优化。

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
- 当前没有 Axios 或 API 封装层。如果需要获取外部数据，直接使用原生的 `fetch API`，并必须配合 `try/catch` 进行错误处理。

## 🚫 绝对不要做的雷区 (Do NOT Do)
1. 绝对不要修改 `node_modules/`、`.vite/` 或 `package-lock.json`。
2. 绝对不要在没有任何沟通的情况下引入 TypeScript 语法（如类型注解 `: string` 或 `interface`），项目目前纯粹基于 JS 运行。
3. 输出代码时，请给出完整可运行的文件结构或直接精准执行文件修改，不要给出模糊的替换片段。

## 🚀 常用命令
- 启动项目: `npm run dev`
- 打包构建: `npm run build`
