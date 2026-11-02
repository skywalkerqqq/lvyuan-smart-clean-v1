# 🌿 Lvyuan Smart · Whole-Home Smart Living Website

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Type: Static Site](https://img.shields.io/badge/Type-Static%20Site-blue.svg)](site/)
[![3D](https://img.shields.io/badge/3D-three.js-000000.svg)](site/product-viewer/)
[![Responsive](https://img.shields.io/badge/Responsive-Yes-success.svg)](site/)
[![Deploy](https://img.shields.io/badge/Deploy-ywswyz.xyz-blue.svg)](https://ywswyz.xyz/lvyuan-smart-clean-v1/)
[![中文](https://img.shields.io/badge/Docs-中文-blue.svg)](README.md)

> Brand website deliverable for Lvyuan Smart (smart-home hardware): a deploy-ready static site with live 3D product viewers and a lead-capture form.

## ✨ Overview

Lvyuan Smart is a smart-home hardware company offering three product lines — **smart locks, smart lighting, and smart security** — for urban households aged 25–45 who care about quality of life. This repository is the deliverable source of its live brand website, conveying a "tech-forward, secure, and minimal-modern" brand tone, and designed to help visitors quickly understand the product line, build trust, and submit a lead.

🌐 Live demo: <https://ywswyz.xyz/lvyuan-smart-clean-v1/>

## 🧩 Key Features

- 🔐 **Three product lines**: smart lock / smart lighting / smart security, displayed together on a whole-home stage.
- 🧊 **Live 3D viewers**: powered by three.js — drag to rotate, scroll to zoom, right-drag to pan, double-click to reset.
- 📋 **Lead form**: name, phone, city, product interest, and privacy consent, with client-side validation and a success state.
- 🛡️ **Trust module**: in-house security chip, local + cloud dual-link, whole-home scene automation, 7×24 monitoring.
- 🗺️ **Service flow**: consult → on-site survey → design → install & debug → long-term care.
- 🔒 **Standalone privacy policy page**: `site/privacy.html`.

## 🚀 Quick Start

Run locally with **Node.js 18+** (no dependencies to install):

```bash
# Windows
double-click start.bat

# macOS / Linux
chmod +x start.sh && ./start.sh
# or
node server.mjs
```

Then open <http://127.0.0.1:8090/>. If Node is not installed, the launch script falls back to Python 3's static server.

## 📂 Project Structure

```text
lvyuan-smart-clean-v1/
├─ site/                  # deploy-ready static site (core deliverable)
│  ├─ index.html
│  ├─ app.js
│  ├─ styles.css
│  ├─ privacy.html
│  ├─ media/              # product renders and hero images
│  ├─ product-viewer/     # lock / lighting Live 3D
│  └─ security-kit/       # security Live 3D
├─ server.mjs             # zero-dependency local static server
├─ start.sh / start.bat   # one-click launch scripts
├─ CHANGELOG.md           # version history
├─ THIRD_PARTY_NOTICES.md # third-party license notices
├─ VERSION.txt
├─ LICENSE
├─ README.md              # 中文 (Chinese)
└─ README.en.md           # this file (English)
```

> Note: This repository ships the deploy-ready static output and run scripts only. `source/` (the unbuilt React + Vite project) is a duplicate copy of the same site and was excluded at publish time to avoid redundant delivery. Obtain it separately if you need the editable source.

## 🛠️ Tech Stack

- Static frontend (HTML / CSS / vanilla JavaScript)
- three.js (MIT) for live 3D
- Zero-dependency static server using Node.js built-in modules

## 📡 Deployment

Deploy `site/` to a `lvyuan-smart-clean-v1/` sub-directory under any static server root. The live example is hosted on `ywswyz.xyz`.

> ⚠️ **Demo notice**: All prices, certifications, service SLAs, phone numbers, and emails on the page are **demo placeholders** (emails/domains use the `example` placeholder domain). Replace them with real information before going live, and connect a real lead API / CRM with server-side persistence. The form currently targets a reserved `POST /api/leads` endpoint.

## 📄 License

[MIT](LICENSE) © 2026 skywalkerqqq
