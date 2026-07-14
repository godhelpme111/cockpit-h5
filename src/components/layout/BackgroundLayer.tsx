// 水墨山水背景层
export default function BackgroundLayer() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden ink-bg">
      {/* 远山 */}
      <svg
        className="absolute bottom-0 left-0 w-full h-2/3 opacity-30"
        viewBox="0 0 1920 600"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="mountain-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1F3A3D" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1F3A3D" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path
          d="M0,400 C200,300 400,350 600,280 C800,210 1000,330 1200,250 C1400,170 1600,290 1920,200 L1920,600 L0,600 Z"
          fill="url(#mountain-grad)"
        />
      </svg>

      {/* 飘渺云气 */}
      <div className="absolute top-1/3 left-1/4 w-64 h-32 bg-rice/40 rounded-full blur-3xl animate-float" />
      <div
        className="absolute top-1/2 right-1/3 w-96 h-40 bg-mountain/50 rounded-full blur-3xl animate-float"
        style={{ animationDelay: '1s' }}
      />

      {/* 装饰性印章 */}
      <div className="absolute bottom-12 right-12 w-16 h-16 border-2 border-cinnabar/60
                      flex items-center justify-center text-cinnabar text-body font-cn
                      rotate-3 opacity-70">
        示例
      </div>
    </div>
  );
}
