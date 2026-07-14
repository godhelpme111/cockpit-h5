/**
 * Capacitor 配置（用于将 H5 打包为 Android/iOS 原生应用）
 *
 * 用法：
 *   npm run build            # 1) 编译前端到 dist/
 *   npx cap sync android     # 2) 同步 dist/ 到 android/ 工程
 *   npx cap open android     # 3) 用 Android Studio 打开后构建 APK
 *
 * 前提：本地已安装 JDK 17+ 与 Android Studio（自带 Android SDK）
 *  - JDK 17：https://adoptium.net/
 *  - Android Studio：https://developer.android.com/studio
 *  - 安装后在 Android Studio 的 SDK Manager 中安装 Android 14 (API 34) Platform
 *
 * 详细步骤见 docs/20260629_打包AndroidApp指南.md
 */
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zdauto.tourism.cockpit',
  appName: '智游观光车',
  webDir: 'dist',
  bundledWebRuntime: false,
  // Android 平台特定配置
  android: {
    // 允许明文 HTTP 流量（开发期方便 http://10.0.2.2:5173 调试 HMR）
    allowMixedContent: true,
    // 启动后是否全屏沉浸（去掉顶部状态栏）
    // backgroundColor 由 capacitor.config 顶层 backgroundColor 控制
    captureInput: true,
    // WebView 调试（dev 期可用 chrome://inspect）
    webContentsDebuggingEnabled: true,
  },
  // 启动屏背景色
  backgroundColor: '#1F3A3D',
  // 服务器配置：让 App 直接加载本地 dist/ 而非远端 URL
  server: {
    androidScheme: 'https',
  },
};

export default config;
