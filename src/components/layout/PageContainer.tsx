import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

/** 页面容器：大屏居中 + 安全边距 */
export default function PageContainer({ children, className = '' }: Props) {
  return (
    <div className={`w-screen h-screen flex flex-col overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
