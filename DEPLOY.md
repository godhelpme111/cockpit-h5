# 部署指南 (Deployment Guide)

线上地址：<https://godhelpme111.github.io/cockpit-h5/>

部署采用 **GitHub Actions 自动发布** 模式：本地只推源码到 main，Actions 在云端构建并发布到 GitHub Pages。

---

## 🌟 工作流程（推荐）

```
[本地] 编辑代码
   ↓
[本地] npm run deploy:api   ← 推送源码到 main
   ↓
[GitHub] Actions 检测到 push
   ↓
[GitHub] 安装依赖 → npm run build (GITHUB_PAGES=true) → 上传 dist/
   ↓
[GitHub Pages] 自动部署完成（约 1-2 分钟）
```

> 用户不需要在本机构建，也不需要手动切换 gh-pages 分支。

---

## 1️⃣ 一次性配置（已完成 80%）

### 1.1 创建仓库
- 仓库已存在：<https://github.com/godhelpme111/cockpit-h5>

### 1.2 切换 Pages 源（⚠️ 唯一需要手动操作的一步）

打开 <https://github.com/godhelpme111/cockpit-h5/settings/pages>，把：

```
Source: Deploy from a branch
Branch: gh-pages / (root)
```

改为：

```
Source: GitHub Actions
```

点 **Save**。

### 1.3 Workflow 权限
打开 <https://github.com/godhelpme111/cockpit-h5/settings/actions> → **General** → **Workflow permissions** → 选 **"Read and write permissions"** → 勾选 **"Allow GitHub Actions to create and approve pull requests"** → **Save**。

> 我们的 workflow 文件 [.github/workflows/deploy.yml](./.github/workflows/deploy.yml) 已包含 `pages: write` 权限声明，但仓库级权限需要打开。

---

## 2️⃣ 申请并使用 PAT

### 申请 PAT
1. 打开 <https://github.com/settings/tokens/new>
2. Note 填 `cockpit-h5-deploy`
3. Expiration 选 30 / 60 / 90 天
4. Scopes 只勾 ☑️ **`repo`**
5. 点 **Generate token** → 复制 `ghp_xxx`（**只显示一次**）

### 部署命令

```powershell
cd "c:\Users\chenwei1\Documents\trae_projects\test\cockpit-h5"

$env:GITHUB_USERNAME = 'godhelpme111'
$env:GITHUB_TOKEN    = 'ghp_你的PAT'

npm run deploy:api
```

脚本会：
1. 确保仓库存在（不存在则创建）
2. 收集所有源码文件（过滤 node_modules / dist / android/build 等）
3. 通过 REST API 把源码推送到 main
4. 退出后 ~30 秒，Actions 自动接管构建和发布

> 整个推送过程 1-3 分钟。token 不会出现在任何日志中。

### 撤销 PAT
用完后建议到 <https://github.com/settings/tokens> 找到对应 token → Delete。

---

## 3️⃣ 常见操作

| 想要做的事 | 命令 |
|---|---|
| 修改代码并发布 | 编辑 → `$env:GITHUB_USERNAME='godhelpme111'; $env:GITHUB_TOKEN='ghp_xxx'; npm run deploy:api` |
| 查看部署进度 | <https://github.com/godhelpme111/cockpit-h5/actions> |
| 强制重新部署 | Actions 页面 → 选 workflow run → **Re-run jobs** |
| 手动触发（无需 push） | Actions 页面 → **Run workflow** |

---

## 4️⃣ 验证清单

部署完成后，浏览器打开 <https://godhelpme111.github.io/cockpit-h5/> 应能看到完整首页。

- [ ] 首页 200 OK
- [ ] DevTools Network：所有 `assets/*.js` `icons/*.png` 返回 200
- [ ] 访问 `/cockpit-h5/chat` → 渲染 ChatPage
- [ ] DevTools Application → Service Workers：scope = `/cockpit-h5/`
- [ ] 关闭网络后刷新 → 仍能加载（PWA 缓存生效）

---

## 5️⃣ 故障排查

| 现象 | 原因 | 解决 |
|---|---|---|
| Actions 一直排队 | 仓库级 Workflow 权限未打开 | 设置 → Actions → General → 选 "Read and write permissions" |
| 部署后访问 404 | Pages 源还指向 gh-pages 分支 | 设置 → Pages → Source 改 "GitHub Actions" |
| 资源全部 404 | workflow 没设 GITHUB_PAGES=true | 检查 [.github/workflows/deploy.yml](./.github/workflows/deploy.yml) |
| 子路径白屏 | 缺 404.html | postbuild 没跑；检查 `npm run postbuild` |
| Service Worker 缓存不更新 | cache 版本号没变 | 改 [public/sw.js](./public/sw.js) 里的 `VERSION` |
| 数字人/图标显示不了 | manifest 用了绝对路径 | 已修复，使用相对路径 `./icons/...` |

---

## 6️⃣ 本地验证（不影响线上）

```powershell
# 常规开发
npm run dev          # http://localhost:5173

# 模拟 GitHub Pages 构建（base = '/cockpit-h5/'）
$env:GITHUB_PAGES = 'true'
npm run build
npm run preview      # http://localhost:4173/cockpit-h5/
```

---

## 7️⃣ 旧版本说明

之前的 `deploy:api` 会同时推源码和 dist 到 gh-pages 分支。现在已简化为只推源码，**dist 完全由 Actions 在云端构建**。

如果你想保留旧的"本地 build + 推 dist 到 gh-pages"流程作为离线备份，可以临时改回：

```js
// scripts/deploy-github-api.mjs 末尾，把 pushTree 的两个调用都打开
```
