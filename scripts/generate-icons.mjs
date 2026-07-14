/* eslint-disable no-console */
/**
 * 生成 PWA / Android 图标。
 * 用法：node scripts/generate-icons.mjs
 *
 * 依赖：sharp（已在 devDependencies 中）
 *
 * 实现策略：librsvg 对中文文本支持有限，因此将整张图按图层分别渲染后合成。
 *   1) 用 sharp 把底图（背景 + 山水 + 月）光栅化为 PNG Buffer
 *   2) 用 sharp.text() 在底图上叠加书法"雅"字（用内嵌 base64 字体）
 *   3) 输出三种用途：192/512 普通圆形 + 512 maskable（全背景矩形）
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public', 'icons');
await fs.mkdir(PUBLIC_DIR, { recursive: true });

const THEME = {
  ink: '#1F3A3D',
  inkLight: '#2D4F52',
  rice: '#F5F1E8',
  palace: '#C9A961',
  jade: '#7BA098',
  mountain: '#5A7A7C',
};

/**
 * 渲染底图（背景渐变 + 远山 + 月）
 */
function makeBaseSvg(size) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <radialGradient id="bg" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stop-color="${THEME.inkLight}"/>
          <stop offset="60%" stop-color="${THEME.ink}"/>
          <stop offset="100%" stop-color="#0E2225"/>
        </radialGradient>
        <linearGradient id="mountain1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${THEME.mountain}" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="${THEME.ink}" stop-opacity="0.95"/>
        </linearGradient>
        <linearGradient id="mountain2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${THEME.jade}" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="${THEME.mountain}" stop-opacity="0.9"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#bg)"/>
      <circle cx="${size * 0.35}" cy="${size * 0.28}" r="${size * 0.18}"
              fill="white" opacity="0.08"/>
      <path d="M 0 ${size * 0.7}
               Q ${size * 0.15} ${size * 0.55} ${size * 0.3} ${size * 0.62}
               T ${size * 0.6} ${size * 0.58}
               T ${size} ${size * 0.65}
               L ${size} ${size} L 0 ${size} Z"
            fill="url(#mountain1)" opacity="0.9"/>
      <path d="M 0 ${size * 0.8}
               Q ${size * 0.2} ${size * 0.68} ${size * 0.4} ${size * 0.75}
               T ${size * 0.7} ${size * 0.72}
               T ${size} ${size * 0.78}
               L ${size} ${size} L 0 ${size} Z"
            fill="url(#mountain2)" opacity="0.95"/>
      <circle cx="${size * 0.72}" cy="${size * 0.25}" r="${size * 0.07}"
              fill="${THEME.palace}" opacity="0.85"/>
      <circle cx="${size * 0.72}" cy="${size * 0.25}" r="${size * 0.055}"
              fill="${THEME.rice}" opacity="0.6"/>
    </svg>
  `;
}

/**
 * 应用图标 - 圆形徽标 + 中心图案（不使用文本，保持矢量简洁）
 * 中央"雅"字以纯几何 path 形式手绘（楷书"雅"的几何化）
 */
function makeCenterSvg(size) {
  // 几何化"雅"字：上"牙"下"隹"结构
  // 牙：横+竖钩+撇+捺  ; 隹：单人旁+点+横+竖+点
  // 为保证可读性，使用粗描边的几何线条近似。
  const cx = size / 2;
  const cy = size * 0.58;        // 整体中心略偏下
  const s = size * 0.0055;       // 线条粗细系数
  const w = size * 0.18;         // 字宽
  const h = size * 0.26;         // 字高

  const stroke = THEME.rice;
  const fill = 'url(#centerGrad)';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="centerGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${THEME.rice}"/>
          <stop offset="100%" stop-color="${THEME.palace}"/>
        </linearGradient>
      </defs>

      <!-- 装饰光环 -->
      <circle cx="${cx}" cy="${cy}" r="${w * 0.95}"
              fill="none" stroke="${THEME.palace}" stroke-width="${size * 0.004}" opacity="0.55"/>
      <circle cx="${cx}" cy="${cy}" r="${w * 1.12}"
              fill="none" stroke="${THEME.rice}" stroke-width="${size * 0.002}" opacity="0.25"/>

      <!-- 简化"雅"字（篆刻风格的几何组合）-->
      <g transform="translate(${cx - w / 2}, ${cy - h / 2})" fill="${fill}" stroke="${stroke}" stroke-width="${s}" stroke-linejoin="round" stroke-linecap="round">
        <!-- 上半部"牙" -->
        <path d="M 0 0
                 L ${w} 0
                 M ${w * 0.5} 0
                 L ${w * 0.5} ${h * 0.35}
                 Q ${w * 0.62} ${h * 0.35} ${w * 0.7} ${h * 0.18}
                 M ${w * 0.3} ${h * 0.18}
                 Q ${w * 0.5} ${h * 0.5} ${w * 0.7} ${h * 0.55}
                 L ${w * 0.5} ${h * 0.55}"/>
        <!-- 下半部"隹" -->
        <path d="M 0 ${h * 0.65}
                 L ${w * 0.85} ${h * 0.65}
                 M ${w * 0.1} ${h * 0.65}
                 L ${w * 0.1} ${h}
                 M 0 ${h * 0.85}
                 L ${w * 0.4} ${h * 0.85}
                 M ${w * 0.7} ${h}
                 L ${w * 0.55} ${h * 0.78}
                 L ${w * 0.85} ${h * 0.78}"/>
      </g>

      <!-- 底部装饰线 -->
      <rect x="${cx - w * 0.5}" y="${cy + h * 0.65}" width="${w}" height="${size * 0.006}"
            rx="${size * 0.003}" fill="${THEME.palace}" opacity="0.7"/>
    </svg>
  `;
}

async function writeIcon(name, size, { maskable = false, rounded = true } = {}) {
  const base = sharp(Buffer.from(makeBaseSvg(size)), { density: 384 }).resize(size, size);
  const center = sharp(Buffer.from(makeCenterSvg(size)), { density: 384 }).resize(size, size);

  // maskable 图标不加圆形遮罩，使用方角底图
  const final = await base
    .composite([{ input: await center.toBuffer(), blend: 'over' }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  if (rounded) {
    // 用圆形 alpha 通道裁剪，得到圆形图标
    const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
    </svg>`;
    const roundedOut = await sharp(final)
      .composite([{ input: Buffer.from(maskSvg), blend: 'dest-in' }])
      .png({ compressionLevel: 9 })
      .toBuffer();
    await fs.writeFile(path.join(PUBLIC_DIR, name), roundedOut);
  } else {
    await fs.writeFile(path.join(PUBLIC_DIR, name), final);
  }
  const stat = await fs.stat(path.join(PUBLIC_DIR, name));
  console.log(`✓ ${name}  (${size}x${size}, ${(stat.size / 1024).toFixed(1)} KB)`);
}

console.log('🎨 正在生成 PWA / Android 图标…');
await writeIcon('icon-192.png', 192, { rounded: true });
await writeIcon('icon-512.png', 512, { rounded: true });
await writeIcon('icon-maskable-512.png', 512, { rounded: false, maskable: true });
await writeIcon('icon-48.png', 48, { rounded: true });
await writeIcon('icon-72.png', 72, { rounded: true });
await writeIcon('icon-96.png', 96, { rounded: true });
await writeIcon('icon-144.png', 144, { rounded: true });
await writeIcon('icon-256.png', 256, { rounded: true });
console.log('✅ 图标生成完成 → public/icons/');
