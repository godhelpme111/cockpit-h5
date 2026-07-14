import { motion } from 'framer-motion';
import { themes } from '@/data/themes';
import type { ThemeId } from '@/types';

interface Props {
  value: ThemeId;
  onChange: (id: ThemeId) => void;
}

export default function ThemeSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
      {themes.map((theme) => {
        const isActive = value === theme.id;
        return (
          <motion.button
            key={theme.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(theme.id)}
            className={`relative p-3 sm:p-3 lg:p-4 rounded-card text-left overflow-hidden border-2
                       transition-all
                       ${isActive ? 'border-cinnabar shadow-card-hover' : 'border-ink/15 hover:border-ink/30'}`}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
              }}
            />
            <div className="relative">
              <div className="font-cn font-medium text-sm sm:text-base lg:text-subtitle"
                   style={{ color: theme.primaryColor }}>
                {theme.name}
              </div>
              <div className="text-ink/70 mt-0.5 sm:mt-1 text-xs sm:text-small">
                {theme.description}
              </div>
            </div>
            {isActive && (
              <div className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 bg-cinnabar rounded-full
                              flex items-center justify-center text-rice text-xs">
                ✓
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
