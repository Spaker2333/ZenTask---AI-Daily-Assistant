import React, { useEffect, useState } from 'react';
import { Theme, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Button } from './Button';
import { Play, Pause, RotateCcw, Coffee, Zap } from 'lucide-react';
import { DEFAULT_FOCUS_TIME, SHORT_BREAK_TIME } from '../constants';

interface PomodoroProps {
  theme: Theme;
  onFocusComplete: (minutes: number) => void;
  playNotification: () => void;
  lang: Language;
}

export const Pomodoro: React.FC<PomodoroProps> = ({ theme, onFocusComplete, playNotification, lang }) => {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    let interval: number | null = null;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playNotification();
      
      if (mode === 'focus') {
         onFocusComplete(Math.floor(DEFAULT_FOCUS_TIME / 60));
         setMode('break');
         setTimeLeft(SHORT_BREAK_TIME);
      } else {
         setMode('focus');
         setTimeLeft(DEFAULT_FOCUS_TIME);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, onFocusComplete, playNotification]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? DEFAULT_FOCUS_TIME : SHORT_BREAK_TIME);
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? DEFAULT_FOCUS_TIME : SHORT_BREAK_TIME);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'focus' 
    ? ((DEFAULT_FOCUS_TIME - timeLeft) / DEFAULT_FOCUS_TIME) * 100 
    : ((SHORT_BREAK_TIME - timeLeft) / SHORT_BREAK_TIME) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      
      {/* Mode Switcher */}
      <div className="flex bg-black/20 rounded-full p-1">
        <button 
          onClick={() => switchMode('focus')}
          className={`px-4 py-1 rounded-full text-xs font-medium transition-all ${mode === 'focus' ? theme.colors.accent + ' text-white' : theme.colors.textMuted}`}
        >
          <div className="flex items-center gap-1"><Zap size={12} /> {t.focus}</div>
        </button>
        <button 
          onClick={() => switchMode('break')}
          className={`px-4 py-1 rounded-full text-xs font-medium transition-all ${mode === 'break' ? theme.colors.accent + ' text-white' : theme.colors.textMuted}`}
        >
          <div className="flex items-center gap-1"><Coffee size={12} /> {t.break}</div>
        </button>
      </div>

      {/* Timer Display */}
      <div className="relative w-48 h-48 flex items-center justify-center">
         {/* Circular Progress SVG */}
         <svg className="absolute w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-white/10"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
              className={`${theme.colors.primary} transition-all duration-1000 ease-linear`}
              strokeLinecap="round"
            />
         </svg>
         
         <div className={`text-6xl font-mono font-bold tracking-tighter ${theme.colors.text}`}>
            {formatTime(timeLeft)}
         </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <Button onClick={toggleTimer} themeColors={theme.colors} className="w-14 h-14 !rounded-full !p-0">
          {isActive ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1"/>}
        </Button>
        <Button onClick={resetTimer} variant="secondary" themeColors={theme.colors} className="w-14 h-14 !rounded-full !p-0">
          <RotateCcw size={20} />
        </Button>
      </div>
    </div>
  );
};
