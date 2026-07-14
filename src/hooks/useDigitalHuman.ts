import { useEffect } from 'react';
import { digitalHumanService } from '@/services/digitalHuman';
import { useDigitalHumanStore } from '@/stores/digitalHumanStore';
import { useChatStore } from '@/stores/chatStore';

/**
 * 数字人管理Hook
 * 封装 init / speak / listen / 状态同步
 */
export function useDigitalHuman() {
  const { state, setState, currentText, setCurrentText } = useDigitalHumanStore();
  const { isThinking } = useChatStore();

  // 初始化
  useEffect(() => {
    digitalHumanService.init({
      avatarId: 'xiaoya',
      voiceId: 'female-zh',
      language: 'zh-CN',
      lipSync: true,
    });
  }, []);

  // 同步思考状态
  useEffect(() => {
    if (isThinking && state !== 'thinking') {
      setState('thinking');
    } else if (!isThinking && state === 'thinking') {
      setState('idle');
    }
  }, [isThinking, state, setState]);

  const speak = async (text: string) => {
    if (!text) return;
    setState('speaking');
    setCurrentText(text);
    await digitalHumanService.speak(text);
    setState('idle');
    setCurrentText('');
  };

  return {
    state,
    setState,
    currentText,
    speak,
  };
}
