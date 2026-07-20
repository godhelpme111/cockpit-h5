/**
 * Mogo 蘑菇车联 Logo（简化版）
 * ───────────────────────────
 * 实际项目应替换为设计部门提供的 SVG。
 * 这里用品牌色 + 文字实现一个视觉近似的占位 logo。
 */
interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: { text: 'text-sm', icon: 16, gap: 'gap-1' },
  md: { text: 'text-base sm:text-body lg:text-subtitle', icon: 22, gap: 'gap-1.5' },
  lg: { text: 'text-xl sm:text-title', icon: 28, gap: 'gap-2' },
};

export default function MogoLogo({ size = 'md', className = '' }: Props) {
  const c = SIZES[size];
  return (
    <div className={`flex items-center ${c.gap} ${className}`}>
      {/* 抽象的橙色"水滴"图标（与原 logo 形状近似） */}
      <svg
        width={c.icon}
        height={c.icon}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="mogo-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF8A3D" />
            <stop offset="100%" stopColor="#E55A1F" />
          </linearGradient>
        </defs>
        <path
          d="M12 2C7 8 4 12 4 16a8 8 0 0 0 16 0c0-4-3-8-8-14z"
          fill="url(#mogo-grad)"
        />
        <circle cx="10" cy="14" r="2" fill="#FFFFFF" opacity="0.8" />
      </svg>
      <span className={`font-en font-extrabold tracking-wide text-rice ${c.text}`}>
        MOGO
      </span>
    </div>
  );
}
