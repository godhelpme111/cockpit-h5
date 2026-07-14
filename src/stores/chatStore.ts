import { create } from 'zustand';
import type { Message, RelatedCard } from '@/types';
import { findAnswer, fallbackAnswer } from '@/data/knowledgeBase';
import { generateId } from '@/utils/format';

interface ChatState {
  messages: Message[];
  isRecording: boolean;
  isThinking: boolean;
  addUserMessage: (content: string, audioUrl?: string, duration?: number) => void;
  addAssistantMessage: (content: string, relatedCard?: RelatedCard) => void;
  setRecording: (v: boolean) => void;
  setThinking: (v: boolean) => void;
  clear: () => void;
  processQuestion: (question: string) => Promise<string>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [
    {
      id: generateId(),
      role: 'assistant',
      content: '欢迎乘坐示例景区环线观光车，我是您的专属导游小雅～请问您想去哪里看看呢？',
      timestamp: Date.now(),
    },
  ],
  isRecording: false,
  isThinking: false,

  addUserMessage: (content, audioUrl, duration) => {
    const msg: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
      audioUrl,
      duration,
    };
    set((s) => ({ messages: [...s.messages, msg] }));
  },

  addAssistantMessage: (content, relatedCard) => {
    const msg: Message = {
      id: generateId(),
      role: 'assistant',
      content,
      timestamp: Date.now(),
      relatedCard,
    };
    set((s) => ({ messages: [...s.messages, msg] }));
  },

  setRecording: (v) => set({ isRecording: v }),
  setThinking: (v) => set({ isThinking: v }),

  clear: () => set({ messages: [] }),

  processQuestion: async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return '';

    get().addUserMessage(trimmed);
    set({ isThinking: true });

    // 模拟思考延迟
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

    const item = findAnswer(trimmed);
    const answer = item?.answer || fallbackAnswer(trimmed);
    const relatedCard = item?.relatedCard;

    get().addAssistantMessage(answer, relatedCard);
    set({ isThinking: false });

    return answer;
  },
}));
