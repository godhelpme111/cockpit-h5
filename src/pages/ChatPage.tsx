import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/stores/chatStore';
import { useDigitalHumanStore } from '@/stores/digitalHumanStore';
import { useRealtimeASR } from '@/hooks/useRealtimeASR';
import { useDigitalHuman } from '@/hooks/useDigitalHuman';
import DigitalHuman from '@/components/digital-human/DigitalHuman';
import ChatBubble from '@/components/chat/ChatBubble';
import RecordButton from '@/components/chat/RecordButton';
import QuickQuestions from '@/components/chat/QuickQuestions';
import RelatedCardPanel from '@/components/chat/RelatedCard';
import VoiceWave from '@/components/digital-human/VoiceWave';
import PageContainer from '@/components/layout/PageContainer';
import StatusBar from '@/components/layout/StatusBar';
import BackgroundLayer from '@/components/layout/BackgroundLayer';
import { ArrowLeft } from 'lucide-react';

export default function ChatPage() {
  const navigate = useNavigate();
  const { messages, isThinking, addUserMessage, addAssistantMessage, setThinking, processQuestion } = useChatStore();
  const { state: dhState, setState, setAmplitude, amplitude } = useDigitalHumanStore();
  const { speak } = useDigitalHuman();
  const asr = useRealtimeASR();
  const scrollRef = useRef<HTMLDivElement>(null);

  // 同步录音振幅
  useEffect(() => {
    setAmplitude(asr.amplitude);
  }, [asr.amplitude, setAmplitude]);

  // 滚动到底部
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking]);

  // 按下麦克风：开始录音 + ASR
  const handleStart = async () => {
    await asr.start();
    if (asr.error) return;
    setState('listening');
  };

  // 松开麦克风：拿到最终识别文本 → 调 LLM → 数字人播报
  const handleStop = async () => {
    const question = (await asr.stop())?.trim() || '';
    if (!question) {
      // 兜底：没识别到，弹个空泡
      setState('idle');
      return;
    }
    setState('thinking');
    setThinking(true);

    addUserMessage(question);

    // 模拟思考延迟（实际由 LLM 决定）
    await new Promise((r) => setTimeout(r, 300));
    setThinking(false);

    const answer = await processQuestion(question);
    if (answer) {
      setState('speaking');
      await speak(answer);
      setState('idle');
    }
  };

  const handleQuickQuestion = async (q: string) => {
    setState('thinking');
    const answer = await processQuestion(q);
    if (answer) {
      setState('speaking');
      await speak(answer);
      setState('idle');
    }
  };

  return (
    <PageContainer className="ink-bg">
      <BackgroundLayer />
      <StatusBar showBack title="与小雅对话" />

      <div className="flex-1 flex flex-col lg:flex-row
                      pt-14 px-4 pb-4 gap-3
                      sm:pt-16 sm:px-6
                      lg:pt-20 lg:px-8 lg:pb-8 lg:gap-6 min-h-0
                      overflow-y-auto lg:overflow-visible">
        {/* 左侧：数字人 + 录音按钮 */}
        <div className="flex flex-row lg:flex-col items-center justify-center gap-3 lg:gap-4
                        lg:w-1/3 lg:justify-center">
          <div className="block lg:hidden">
            <DigitalHuman size="sm" showWave amplitude={amplitude} />
          </div>
          <div className="hidden lg:block">
            <DigitalHuman size="lg" showWave amplitude={amplitude} />
          </div>

          <AnimatePresence mode="wait">
            {dhState === 'listening' ? (
              <motion.div
                key="wave"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-rice/95 rounded-card px-3 py-2 sm:px-6 sm:py-3 shadow-card hidden lg:block max-w-[280px]"
              >
                <VoiceWave amplitude={amplitude} active={true} />
                <div className="text-small text-ink/60 text-center mt-2 min-h-[1.25em] truncate">
                  {asr.partialText || '正在识别…'}
                </div>
              </motion.div>
            ) : dhState === 'thinking' ? (
              <motion.div
                key="thinking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hidden lg:flex items-center gap-2 text-ink/70"
              >
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-ink/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-ink/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-ink/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-small">思考中…</span>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <RecordButton
            recording={asr.recording}
            onStart={handleStart}
            onStop={handleStop}
            amplitude={amplitude}
            disabled={isThinking || dhState === 'speaking'}
          />

          {asr.error && (
            <div className="text-small text-cinnabar hidden lg:block">⚠ {asr.error}</div>
          )}
        </div>

        {/* 中间：对话历史 */}
        <div className="flex-1 flex flex-col min-h-0">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto pr-2 lg:pr-4 space-y-2"
          >
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col">
                <ChatBubble message={msg} onSpeak={speak} />
                {msg.relatedCard && (
                  <div className={`mb-4 ${msg.role === 'user' ? 'self-end' : 'self-start'} max-w-[70%]`}>
                    <RelatedCardPanel card={msg.relatedCard} />
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start mb-4">
                <div className="bg-mountain text-ink rounded-2xl rounded-tl-sm px-4 py-3 lg:px-6 lg:py-4 flex items-center gap-2">
                  <span className="text-body">小雅在思考</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 快捷问题 */}
          <div className="mt-3 pt-3 lg:mt-4 lg:pt-4 border-t border-ink/10">
            <QuickQuestions onSelect={handleQuickQuestion} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
