// 对话相关类型

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  audioUrl?: string;     // 数字人语音URL
  relatedCard?: RelatedCard;
  duration?: number;     // 录音时长
}

export interface RelatedCard {
  type: 'image' | 'video' | 'location' | 'action';
  title: string;
  description?: string;
  thumbnail?: string;
  action?: {
    label: string;
    handler: () => void;
  };
}

export interface KnowledgeItem {
  id: string;
  category: 'attraction' | 'history' | 'service' | 'weather' | 'activity' | 'chat';
  keywords: string[];
  patterns?: RegExp[];   // 匹配正则
  answer: string;
  relatedCard?: Omit<RelatedCard, 'action'>;
  followUp?: string[];   // 推荐后续问题
}
