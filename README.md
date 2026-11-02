# 🌿 绿源智能 · 全屋智能官网

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Type: Static Site](https://img.shields.io/badge/Type-Static%20Site-blue.svg)](site/)
[![3D](https://img.shields.io/badge/3D-three.js-000000.svg)](site/product-viewer/)
[![Responsive](https://img.shields.io/badge/Responsive-Yes-success.svg)](site/)
[![Deploy](https://img.shields.io/badge/Deploy-ywswyz.xyz-blue.svg)](https://ywswyz.xyz/lvyuan-smart-clean-v1/)
[![English](https://img.shields.io/badge/Docs-English-blue.svg)](README.en.md)

> 绿源智能（智能家居硬件）品牌官网交付包：可直接部署的静态站点 + 实时 3D 产品展示 + 预约留资表单。

## ✨ 项目简介

绿源智能是一家智能家居硬件公司，主营 **智能门锁、智能照明、智能安防** 三类产品，目标用户为 25–45 岁、注重生活品质的城市家庭用户。本仓库为其实时品牌官网的交付源码，强调「科技感、安全可靠、简约现代」的品牌调性，目标是让访客快速了解产品线、建立品牌信任并引导留资咨询。

🌐 线上演示：<https://ywswyz.xyz/lvyuan-smart-clean-v1/>

## 🧩 核心特性

- 🔐 **三条产品线**：智能门锁 / 智能照明 / 智能安防，统一陈列于全屋套装展示平台。
- 🧊 **实时 3D 产品查看器**：基于 three.js，可在页面内拖拽旋转、滚轮缩放、右键平移、双击复位。
- 📋 **预约留资表单**：姓名、手机号、城市、产品意向、隐私同意，含前端校验与成功状态。
- 🛡️ **品牌信任模块**：自研安全芯片、本地 + 云端双链路、全屋场景联动、7×24 在线守护。
- 🗺️ **服务流程**：需求沟通 → 上门勘测 → 方案设计 → 安装调试 → 长期守护。
- 🔒 **独立隐私政策页**：`site/privacy.html`。

## 🚀 快速开始

本地运行只需 **Node.js 18+**（无需安装依赖）：

```bash
# Windows
双击 start.bat

# macOS / Linux
chmod +x start.sh && ./start.sh
# 或
node server.mjs
```

随后访问 <http://127.0.0.1:8090/>。若未安装 Node，启动脚本会尝试用 Python 3 启动静态服务器。

## 📂 目录结构

```text
lvyuan-smart-clean-v1/
├─ site/                  # 可直接部署的静态站点（核心交付物）
│  ├─ index.html
│  ├─ app.js
│  ├─ styles.css
│  ├─ privacy.html
│  ├─ media/              # 产品渲染与首屏图片
│  ├─ product-viewer/     # 门锁 / 照明 Live 3D
│  └─ security-kit/       # 安防 Live 3D
├─ server.mjs             # 零依赖本地静态服务器
├─ start.sh / start.bat   # 一键启动脚本
├─ CHANGELOG.md           # 版本记录
├─ THIRD_PARTY_NOTICES.md # 第三方许可声明
├─ VERSION.txt
├─ LICENSE
├─ README.md              # 本文件（中文）
└─ README.en.md           # English
```

> 说明：本仓库仅包含可直接部署的静态产物与运行脚本。`source/`（React + Vite 未构建源码）是同一站点的另一份拷贝，发布时已排除，避免重复交付。如需二次开发源码请另行获取。

## 🛠️ 技术栈

- 纯静态前端（HTML / CSS / 原生 JavaScript）
- three.js（MIT）实时 3D
- Node.js 内置模块实现的零依赖静态服务器

## 📡 部署

将 `site/` 部署到任意静态服务器根路径下的 `lvyuan-smart-clean-v1/` 子目录即可。线上示例托管于 `ywswyz.xyz`。

> ⚠️ **演示声明**：页面中的价格、认证、服务时效、电话与邮箱均为**演示占位**（邮箱/域名使用 `example` 占位域），正式上线前需替换为真实信息，并接入真实留资 API / CRM 与服务端落库。表单当前预留 `POST /api/leads` 接口。

## 📄 许可

[MIT](LICENSE) © 2026 skywalkerqqq
