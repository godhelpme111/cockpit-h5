# 景区智能化观光车 — 乘客端H5应用

> 面向景区观光车28寸互动大屏的C端应用，集**数字人交互、智能问答、Vlog自动生成**于一体。
> 技术栈：React 18 + TypeScript + Vite 5

---

## 🌐 在线演示

> 部署到 GitHub Pages 后，这里填入真实 URL。

部署细节见 [`DEPLOY.md`](./DEPLOY.md)。

---

## 一、功能特性

### 三大核心功能

| 功能 | 模块 | 描述 |
|------|------|------|
| 🎭 数字人交互 | 百度智能云·数字人SDK | 古风IP"小雅"数字人，多状态切换（待机/倾听/思考/讲话） |
| 💬 智能问答 | 百度智能云·LLM | 按住录音+语音波形，景区知识库匹配+多轮对话 |
| 🎬 Vlog自动生成 | 腾讯云·短视频SDK | 4路车外摄像头模拟录制→多主题模板→AI自动合成 |

### 视觉特色

- **国风古韵设计**：墨青/朱砂红/宣纸白色系，水墨山水背景
- **28寸大屏适配**：1920×1080 / 2K横屏
- **响应式布局**：同时支持移动竖屏
- **流畅动效**：Framer Motion驱动

### 工程特性

- **Mock/真实SDK可切换**：环境变量一键切换演示与生产模式
- **完整类型系统**：TypeScript严格模式
- **状态管理**：Zustand轻量级状态
- **可工程化**：标准Vite项目，可build/preview/部署

---

## 二、项目结构

```
cockpit-h5/
├── public/                    # 静态资源
├── src/
│   ├── pages/                # 6个页面
│   ├── components/           # 通用组件
│   │   ├── layout/           # 布局
│   │   ├── digital-human/    # 数字人
│   │   ├── chat/             # 对话
│   │   ├── vlog/             # Vlog
│   │   ├── share/            # 分享
│   │   └── common/           # 通用
│   ├── hooks/                # 自定义Hooks
│   ├── stores/               # Zustand状态
│   ├── services/             # SDK适配层
│   │   ├── digitalHuman/     # 数字人（Mock/百度）
│   │   ├── video/            # 视频（Mock/腾讯云）
│   │   └── wechat/           # 微信（Mock/JSSDK）
│   ├── data/                 # Mock数据
│   ├── utils/                # 工具
│   ├── types/                # TS类型
│   ├── router.tsx            # 路由
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── docs/                     # 项目文档（已建立）
└── README.md
```

---

## 三、快速开始

### 1. 安装依赖

```bash
cd cockpit-h5
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

浏览器访问：`http://localhost:5173`

### 3. 构建生产版本

```bash
npm run build
# 产物输出到 dist/ 目录
```

### 4. 预览构建结果

```bash
npm run preview
# 访问 http://localhost:4173
```

### 5. 部署到本地服务器

```bash
# 方式1：使用 serve
npx serve dist -p 3000

# 方式2：使用 Python
cd dist && python -m http.server 3000

# 方式3：使用 Nginx/Apache（拷贝 dist/ 内容到网站根目录）
```

---

## 四、SDK 集成指南

### 4.1 切换为真实百度数字人SDK

```bash
# .env.production
VITE_BAIDU_SDK_MODE=real
VITE_BAIDU_APP_ID=your_app_id
VITE_BAIDU_API_KEY=your_api_key
VITE_BAIDU_SECRET_KEY=your_secret_key
```

**集成步骤**：
1. 在[百度智能云控制台](https://console.bce.baidu.com)创建数字人形象，获取`avatarId`
2. 实现`src/services/digitalHuman/BaiduDigitalHuman.ts`：
   - 引入 `@baidu/digital-human-sdk` 或 WebSocket 直连API
   - `init()`：获取access_token，建立WebSocket
   - `speak()`：发送文本，接收TTS音频流
   - `listen()`：上传音频流，接收ASR结果

### 4.2 切换为真实腾讯云短视频SDK

```bash
# .env.production
VITE_TENCENT_SDK_MODE=real
VITE_TENCENT_SECRET_ID=your_secret_id
VITE_TENCENT_SECRET_KEY=your_secret_key
```

**集成步骤**：
1. 在[腾讯云控制台](https://console.cloud.tencent.com)开通短视频SDK + 点播VOD
2. 实现`src/services/video/TencentVideo.ts`：
   - 客户端本地导入视频（`@tencent/ugc-sdk`）
   - 服务端签名 + 上传到VOD
   - 调用云端AI剪辑API（VOD MediaProcessing）
   - 轮询任务结果获取MP4 URL

### 4.3 切换为真实微信JSSDK

```bash
# .env.production
VITE_WECHAT_MODE=real
VITE_WECHAT_APP_ID=your_wechat_app_id
```

**集成步骤**：
1. 在[微信公众平台](https://mp.weixin.qq.com)配置JS安全域名
2. 服务端生成签名（[文档](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html)）
3. 实现`src/services/wechat/WechatJSSDK.ts`：
   - 引入 `https://res.wx.qq.com/open/js/jweixin-1.6.0.js`
   - `wx.config()` + `wx.ready()` 初始化
   - 调用 `wx.updateAppMessageShareData` / `updateTimelineShareData`

---

## 五、文档导航

- 产品需求文档：[`../docs/req/20260629_景区智能化观光车_乘客端H5_需求.md`](../docs/req/20260629_景区智能化观光车_乘客端H5_需求.md)
- UI设计说明：[`../docs/req/UI设计图说明.md`](../docs/req/UI设计图说明.md)
- 技术设计文档：[`../docs/tech/20260629_景区智能化观光车_乘客端H5_技术方案.md`](../docs/tech/20260629_景区智能化观光车_乘客端H5_技术方案.md)
- 任务跟踪：[`../docs/task/20260629_乘客端H5_任务.md`](../docs/task/20260629_乘客端H5_任务.md)

---

## 六、演示流程（3分钟）

1. **首页（10s）** —— 数字人主动问候，3个功能卡片
2. **智能问答（60s）** —— 进入对话页，按住说话，小雅回答
3. **拍Vlog（60s）** —— 选主题 → 点击录制（4宫格自动切换）→ 录制3段以上
4. **编辑Vlog（30s）** —— 时间线 → 切换主题 → 点击"生成Vlog"
5. **分享（30s）** —— 选分享文案 → 模拟分享朋友圈 → 显示二维码

---

## 七、浏览器兼容性

| 浏览器 | 最低版本 | 说明 |
|--------|---------|------|
| Chrome | 90+ | ✅ 完整支持 |
| Edge | 90+ | ✅ 完整支持 |
| Safari | 14+ | ✅ 完整支持 |
| Firefox | 88+ | ⚠️ 部分API差异 |

需要的能力：
- MediaRecorder API
- Web Audio API
- Canvas API
- (可选) WebCodecs API

---

## 八、常见问题

### Q1: 启动后页面是空白？
A: 检查浏览器控制台，确保`/src/main.tsx`能正常加载。运行`npm install`确保依赖已安装。

### Q2: 数字人没有声音？
A: Mock实现使用浏览器原生SpeechSynthesis。首次播放需要用户交互（点击/触摸）。生产环境应使用百度TTS SDK。

### Q3: 录音失败？
A: 浏览器需要HTTPS或localhost环境才能调用麦克风API。生产环境必须部署到HTTPS。

### Q4: Vlog生成失败？
A: 默认使用占位视频生成（不依赖真实视频文件）。如需加载真实视频，请将视频文件放入`public/assets/vlog-clips/`。

---

## 九、License

MIT © 2026 景区智能化观光车项目组
