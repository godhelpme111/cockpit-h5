/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BAIDU_SDK_MODE: 'mock' | 'real';
  readonly VITE_TENCENT_SDK_MODE: 'mock' | 'real';
  readonly VITE_WECHAT_MODE: 'mock' | 'real';
  readonly VITE_BAIDU_APP_ID: string;
  readonly VITE_BAIDU_API_KEY: string;
  readonly VITE_BAIDU_SECRET_KEY: string;
  readonly VITE_TENCENT_SECRET_ID: string;
  readonly VITE_TENCENT_SECRET_KEY: string;
  readonly VITE_WECHAT_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
