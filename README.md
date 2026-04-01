# 实验室美食分享

实验室成员美食发现与分享平台，帮助大家发现校内及周边的优质餐厅，分享美食体验。

## 项目简介

这是一个基于 Vue 3 + Vite 构建的单页面应用，为实验室成员提供：

- 餐馆发现与推荐
- 菜品评价与分享
- 成员美食动态
- 用户评价系统

## 技术栈

- **前端框架**: Vue 3 (Composition API + `<script setup>`)
- **构建工具**: Vite
- **路由**: Vue Router 4
- **UI框架**: Bootstrap 5 + Bootstrap Icons
- **交互库**: Popper.js

## 项目结构

```
ewew/
├── src/
│   ├── assets/          # 静态资源
│   ├── components/      # 可复用组件
│   ├── views/           # 页面视图
│   │   ├── HomeView.vue           # 首页
│   │   └── RestaurantDetailView.vue  # 餐馆详情页
│   ├── router/          # 路由配置
│   ├── App.vue          # 根组件
│   ├── main.js          # 应用入口
│   └── style.css        # 全局样式
├── public/              # 公共资源
└── index.html           # HTML入口
```

## 功能特性

### 首页
- 餐馆搜索功能
- 分类筛选（中餐、西餐、快餐等）
- 成员推荐餐馆列表
- 特色菜品展示

### 餐馆详情页
- 餐馆基本信息展示
- 营业时间与联系方式
- 菜品列表与评价
- 成员评价展示
- 评分分布统计
- 菜品评价提交功能

## 快速开始

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

### 预览构建结果

```bash
npm run preview
```

## 开发指南

### 添加新页面

1. 在 `src/views/` 创建新组件
2. 在 `src/router/index.js` 添加路由配置

### 样式定制

项目使用 Bootstrap 5，全局样式在 `src/style.css` 中定义。

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

Copyright © 2026 实验室内部使用
