# 部署指南 (Deployment Guide)

本项目支持三种方式部署到 GitHub Pages，URL 形如：

    https://<USERNAME>.github.io/cockpit-h5/

---

## 方式 A：GitHub Actions 自动部署（推荐）

1. 在 GitHub 上创建空仓库 `cockpit-h5`（public，不要勾选 README；脚本方式 B 会自动建）。
2. 首次把代码推上去（用方式 B 或 C 完成）。
3. 进入仓库 **Settings → Pages → Build and deployment → Source**，选 **GitHub Actions**。
4. 之后每次 `git push origin main`，`.github/workflows/deploy.yml` 都会自动构建并发布。

无需额外配置；本仓库的 PAT 仅用于方式 B。

---

## 方式 B：一键脚本直接推送（无需 git / gh CLI）

适用于本机 git 不可用的场景。脚本走 GitHub REST API。

```powershell
# 1) 安装一次性依赖
npm install

# 2) 设置凭据（PowerShell，不会回显到日志）
$env:GITHUB_TOKEN    = 'ghp_xxx_your_pat'
$env:GITHUB_USERNAME = 'your-github-username'

# 3) 触发：建仓 + 推 main + 推 gh-pages
npm run deploy:api
```

脚本会：

- 在你的账号下创建 `cockpit-h5` 仓库（已存在则跳过）
- 把整个工程（过滤掉 `node_modules` / Android 构建产物）推到 `main`
- `GITHUB_PAGES=true npm run build` 生成 `/cockpit-h5/` 子路径的 `dist/`
- 复制 `dist/index.html → dist/404.html`（SPA 路由回退）
- 把 `dist/` 推到 `gh-pages`（清空式覆盖）

> 一次性配置：到 GitHub 仓库 **Settings → Pages → Source: 'Deploy from a branch' → Branch: gh-pages / (root)**，等约 1 分钟即可访问。

### 如何申请 PAT

1. 登录 GitHub → 头像 → **Settings** → 左侧最下方 **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token (classic)**
3. Note 填 `cockpit-h5-deploy`
4. Expiration 选 30 / 60 / 90 天（按需）
5. Scopes 仅勾选 `repo`（完整仓库访问）
6. **Generate token** → 复制 `ghp_xxx...` 字符串（**只显示一次**，请妥善保存）

> 也可以用 Fine-grained token，权限只需 Contents = Read & Write、Metadata = Read。

---

## 方式 C：手动 git push（最传统）

```bash
# 首次
git init
git checkout -b main
git add .
git commit -m "initial"
git remote add origin https://github.com/<USERNAME>/cockpit-h5.git
git push -u origin main

# 用 gh-pages 工具发布 dist/
npm i -D gh-pages
npx gh-pages -d dist
```

---

## 验证清单

部署完成后，浏览器打开 https://<USERNAME>.github.io/cockpit-h5/ 应该看到完整首页。

- [ ] `https://<USERNAME>.github.io/cockpit-h5/` 返回首页 200
- [ ] DevTools Network 面板：所有 `assets/*.js`、`icons/*.png` 都返回 200
- [ ] 访问 `/cockpit-h5/chat` —— 走 404.html → 渲染 ChatPage
- [ ] DevTools Application → Manifest：start_url = `./`
- [ ] DevTools Application → Service Workers：scope = `/cockpit-h5/`，状态 activated

---

## 本地验证

```powershell
# 1. 常规本地构建（base = './'，给 Capacitor 用）
npm run dev          # http://localhost:5173
npm run build        # 输出 dist/，路径相对于当前目录
npm run preview      # http://localhost:4173

# 2. 模拟 GitHub Pages 构建
$env:GITHUB_PAGES = 'true'
npm run build        # 输出 dist/，所有资源带 /cockpit-h5/ 前缀
npm run preview      # 访问 http://localhost:4173/cockpit-h5/
```

---

## 故障排查

| 现象 | 可能原因 | 解决 |
|---|---|---|
| 部署后访问 404 | Pages 源没有设到 gh-pages | Settings → Pages → Source: gh-pages / (root) |
| 资源全部 404 | vite 构建时没设 `GITHUB_PAGES=true` | 用 `npm run build:gh` 或 `npm run deploy:full` |
| 访问子路径白屏 | 缺 404.html（SPA 路由回退） | postbuild 没跑；检查 `npm run postbuild` |
| 数字人/图标显示不了 | manifest 用了绝对路径 | 已修复，使用相对路径 `./icons/...` |
| Service Worker scope 错 | 注册路径用了绝对 `/` | 已修复，使用 `import.meta.env.BASE_URL` |
