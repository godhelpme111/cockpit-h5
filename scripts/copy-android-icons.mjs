/* eslint-disable no-console */
/**
 * 把 PWA 生成的图标复制到 Capacitor Android 工程的 mipmap 中，
 * 并替换启动屏 / 主题色等资源。
 *
 * 用法：node scripts/copy-android-icons.mjs
 *
 * 前提：已执行 npm run icons 生成 public/icons/icon-*.png
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const ICONS_DIR = path.join(ROOT, 'public', 'icons');
const ANDROID_RES = path.join(ROOT, 'android', 'app', 'src', 'main', 'res');

// 标准 mipmap 尺寸
const SIZES = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
};

async function resizeTo(src, size) {
  return sharp(src).resize(size, size, { fit: 'cover' }).png().toBuffer();
}

async function writeToMipmap(src, name) {
  for (const [density, size] of Object.entries(SIZES)) {
    const dir = path.join(ANDROID_RES, `mipmap-${density}`);
    await fs.mkdir(dir, { recursive: true });
    const buf = await resizeTo(src, size);
    await fs.writeFile(path.join(dir, name), buf);
    console.log(`  ✓ mipmap-${density}/${name} (${size}x${size})`);
  }
}

async function writeToDrawable(src, name) {
  // 注意：drawable-v24/ic_launcher_foreground.xml 是 Capacitor 自带的矢量前景图，
  // 我们的 PNG 只放在 drawable/，避免命名冲突。
  await fs.mkdir(path.join(ANDROID_RES, 'drawable'), { recursive: true });
  const buf = await sharp(src).resize(192, 192, { fit: 'cover' }).png().toBuffer();
  await fs.writeFile(path.join(ANDROID_RES, 'drawable', name), buf);
  console.log(`  ✓ drawable/${name}`);
}

async function writeSplashBackground() {
  // 启动屏背景：纯色 + 简单的山水渐变
  const splash = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1242" height="2688" viewBox="0 0 1242 2688">
      <defs>
        <radialGradient id="bg" cx="50%" cy="40%" r="80%">
          <stop offset="0%" stop-color="#2D4F52"/>
          <stop offset="60%" stop-color="#1F3A3D"/>
          <stop offset="100%" stop-color="#0E2225"/>
        </radialGradient>
        <linearGradient id="m1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#5A7A7C" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#1F3A3D" stop-opacity="0.95"/>
        </linearGradient>
        <linearGradient id="m2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7BA098" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="#5A7A7C" stop-opacity="0.9"/>
        </linearGradient>
      </defs>
      <rect width="1242" height="2688" fill="url(#bg)"/>
      <circle cx="894" cy="672" r="87" fill="#C9A961" opacity="0.85"/>
      <circle cx="894" cy="672" r="68" fill="#F5F1E8" opacity="0.6"/>
      <path d="M 0 1880 Q 186 1480 372 1666 T 744 1560 T 1116 1752 T 1242 1752 L 1242 2688 L 0 2688 Z" fill="url(#m1)" opacity="0.9"/>
      <path d="M 0 2150 Q 248 1830 496 2016 T 992 1936 T 1242 2099 L 1242 2688 L 0 2688 Z" fill="url(#m2)" opacity="0.95"/>
      <text x="621" y="1350" text-anchor="middle" font-family="serif" font-size="120" font-weight="700" fill="#F5F1E8" opacity="0.95">智游观光车</text>
    </svg>
  `;
  const buf = await sharp(Buffer.from(splash)).png().toBuffer();
  // 替换 drawable/splash.png
  await fs.writeFile(path.join(ANDROID_RES, 'drawable', 'splash.png'), buf);
  // 同时写一份到 drawable-port-xxhdpi 等
  for (const d of ['drawable-port-mdpi', 'drawable-port-hdpi', 'drawable-port-xhdpi', 'drawable-port-xxhdpi', 'drawable-port-xxxhdpi']) {
    await fs.mkdir(path.join(ANDROID_RES, d), { recursive: true });
    await fs.writeFile(path.join(ANDROID_RES, d, 'splash.png'), buf);
  }
  console.log('  ✓ splash.png (1242x2688)');
}

async function updateColorsXml() {
  // 写 colors.xml 统一管理颜色（与 tailwind 对齐）
  // 注意：ic_launcher_background 颜色由 values/ic_launcher_background.xml 单独维护，
  // 避免重复定义导致构建失败。
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#1F3A3D</color>
    <color name="colorPrimaryDark">#0E2225</color>
    <color name="colorAccent">#C9A961</color>
    <color name="splashBackground">#1F3A3D</color>
</resources>
`;
  await fs.writeFile(path.join(ANDROID_RES, 'values', 'colors.xml'), xml);
  console.log('  ✓ values/colors.xml');
}

async function updateStylesXml() {
  // 写 styles.xml 让启动屏使用我们的背景
  const styles = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
        <item name="android:background">@drawable/splash</item>
    </style>
</resources>
`;
  await fs.writeFile(path.join(ANDROID_RES, 'values', 'styles.xml'), styles);
  console.log('  ✓ values/styles.xml');
}

console.log('📦 同步资源到 Android 工程…');
const icon192 = path.join(ICONS_DIR, 'icon-192.png');
const icon512 = path.join(ICONS_DIR, 'icon-512.png');
const maskable512 = path.join(ICONS_DIR, 'icon-maskable-512.png');

await writeToMipmap(icon192, 'ic_launcher.png');
await writeToMipmap(icon192, 'ic_launcher_round.png');
await writeToDrawable(maskable512, 'ic_launcher_foreground.png');
await writeSplashBackground();
await updateColorsXml();
await updateStylesXml();
console.log('✅ Android 资源同步完成');
