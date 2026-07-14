import { useEffect, useState } from 'react';
import { wechatService } from '@/services/wechat';

interface Props {
  content: string;
  size?: number;
}

export default function QRCodeView({ content, size = 200 }: Props) {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    wechatService.generateQRCode(content, size).then(setDataUrl);
  }, [content, size]);

  if (!dataUrl) {
    return (
      <div
        className="bg-mountain animate-pulse rounded"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div className="p-3 bg-rice rounded-card shadow-card">
      <img src={dataUrl} alt="QR Code" className="block" style={{ width: size, height: size }} />
    </div>
  );
}
