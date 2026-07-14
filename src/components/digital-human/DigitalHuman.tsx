import { motion, AnimatePresence } from 'framer-motion';
import { useDigitalHumanStore } from '@/stores/digitalHumanStore';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWave?: boolean;
  amplitude?: number;
}

/**
 * 数字人形象
 * 演示版：使用CSS+SVG绘制古风IP数字人"小雅"
 * 生产环境应替换为百度数字人SDK的视频流
 */
export default function DigitalHuman({ size = 'lg', showWave = false, amplitude = 0 }: Props) {
  const { state } = useDigitalHumanStore();

  const sizes = {
    sm: 'w-24 h-32',
    md: 'w-40 h-52',
    lg: 'w-56 h-72',
    xl: 'w-72 h-96',
  };

  return (
    <div className={`relative ${sizes[size]} flex items-end justify-center`}>
      {/* 声波动画 */}
      <AnimatePresence>
        {showWave && state === 'listening' && (
          <div className="absolute inset-0 pointer-events-none">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 border-2 border-jade rounded-full"
                initial={{ scale: 0.9, opacity: 0.6 }}
                animate={{
                  scale: [0.9, 1.4, 0.9],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
                style={{ transformOrigin: 'center bottom' }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* 数字人主体 */}
      <motion.div
        className="relative"
        animate={{
          scale: state === 'speaking' ? 1 + amplitude * 0.05 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <DigitalHumanAvatar state={state} />
      </motion.div>

      {/* 状态标签 */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-small text-ink/60 font-cn">
        {state === 'listening' && '正在倾听…'}
        {state === 'thinking' && '思考中…'}
        {state === 'speaking' && '正在回复'}
        {state === 'idle' && ''}
      </div>
    </div>
  );
}

/** 古风IP数字人"小雅" - SVG绘制 */
function DigitalHumanAvatar({ state }: { state: string }) {
  return (
    <svg
      viewBox="0 0 240 320"
      className="w-full h-full"
      style={{
        filter: 'drop-shadow(0 12px 24px rgba(31, 58, 61, 0.15))',
      }}
    >
      <defs>
        <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A1A1A" />
          <stop offset="100%" stopColor="#2C2C2C" />
        </linearGradient>
        <linearGradient id="clothGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2C7A7B" />
          <stop offset="100%" stopColor="#1F3A3D" />
        </linearGradient>
        <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FCEDD4" />
          <stop offset="100%" stopColor="#F5D9B8" />
        </linearGradient>
        <radialGradient id="faceGlow" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="#FFE9C9" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFE9C9" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 服饰 - 汉服 */}
      <g className={state === 'speaking' ? 'animate-breathe' : ''}>
        {/* 衣袖 */}
        <path
          d="M40,260 Q40,200 60,180 L100,170 L140,170 L180,180 Q200,200 200,260 L200,320 L40,320 Z"
          fill="url(#clothGrad)"
          opacity="0.95"
        />
        {/* 衣领装饰 */}
        <path
          d="M85,180 L120,200 L155,180 L155,210 L120,225 L85,210 Z"
          fill="#C53030"
          opacity="0.85"
        />
        {/* 腰带 */}
        <rect x="80" y="240" width="80" height="6" fill="#D4A574" rx="2" />
        <circle cx="120" cy="243" r="6" fill="#D4A574" />
      </g>

      {/* 颈部 */}
      <rect x="108" y="155" width="24" height="30" fill="url(#skinGrad)" />

      {/* 头部 */}
      <g
        style={{
          transformOrigin: '120px 100px',
          transform: state === 'listening' ? 'rotate(2deg)' :
                     state === 'thinking' ? 'rotate(-3deg)' :
                     state === 'speaking' ? 'translateY(-2px)' : 'none',
          transition: 'transform 0.4s ease',
        }}
      >
        {/* 脸型 */}
        <ellipse cx="120" cy="100" rx="38" ry="44" fill="url(#skinGrad)" />
        <ellipse cx="120" cy="100" rx="38" ry="44" fill="url(#faceGlow)" />

        {/* 头发 - 后发髻 */}
        <ellipse cx="120" cy="65" rx="42" ry="32" fill="url(#hairGrad)" />
        {/* 刘海 */}
        <path
          d="M82,68 Q90,50 120,50 Q150,50 158,68 Q150,80 120,80 Q90,80 82,68 Z"
          fill="url(#hairGrad)"
        />
        {/* 侧发 */}
        <path d="M80,80 Q75,120 85,160 L92,155 Q88,120 92,85 Z" fill="url(#hairGrad)" />
        <path d="M160,80 Q165,120 155,160 L148,155 Q152,120 148,85 Z" fill="url(#hairGrad)" />

        {/* 发饰 - 朱钗 */}
        <circle cx="148" cy="60" r="4" fill="#C53030" />
        <rect x="146" y="55" width="4" height="20" fill="#D4A574" />
        <circle cx="92" cy="60" r="3" fill="#D4A574" />

        {/* 眉毛 */}
        <path
          d="M100,90 Q107,87 115,90"
          stroke="#1A1A1A"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M125,90 Q133,87 140,90"
          stroke="#1A1A1A"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* 眼睛 */}
        {state === 'listening' ? (
          <>
            <ellipse cx="107" cy="103" rx="5" ry="6" fill="#1A1A1A" />
            <ellipse cx="133" cy="103" rx="5" ry="6" fill="#1A1A1A" />
            <circle cx="108" cy="101" r="1.5" fill="#FFFFFF" />
            <circle cx="134" cy="101" r="1.5" fill="#FFFFFF" />
          </>
        ) : state === 'speaking' ? (
          <>
            <path d="M102,103 Q107,100 112,103" stroke="#1A1A1A" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M128,103 Q133,100 138,103" stroke="#1A1A1A" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="107" cy="103" rx="4" ry="3" fill="#1A1A1A" />
            <ellipse cx="133" cy="103" rx="4" ry="3" fill="#1A1A1A" />
          </>
        )}

        {/* 鼻子 */}
        <path d="M120,108 L118,118 L122,118 Z" fill="#E0BC9C" opacity="0.6" />

        {/* 嘴巴 */}
        {state === 'speaking' ? (
          <ellipse cx="120" cy="128" rx="6" ry="4" fill="#C53030" />
        ) : state === 'listening' ? (
          <ellipse cx="120" cy="128" rx="3" ry="2" fill="#A05050" />
        ) : (
          <path d="M114,127 Q120,131 126,127" stroke="#A05050" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}

        {/* 腮红 */}
        <ellipse cx="98" cy="118" rx="5" ry="3" fill="#F5A0A0" opacity="0.4" />
        <ellipse cx="142" cy="118" rx="5" ry="3" fill="#F5A0A0" opacity="0.4" />
      </g>

      {/* 折扇（手持装饰） */}
      <g transform="translate(170, 230) rotate(20)">
        <path d="M0,0 L40,-30 L42,-28 L2,2 Z" fill="#C53030" opacity="0.85" />
        <path d="M0,0 L30,-20 M0,0 L25,-15 M0,0 L20,-10" stroke="#D4A574" strokeWidth="1" opacity="0.7" />
      </g>
    </svg>
  );
}
