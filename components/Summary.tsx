import React, { useState } from 'react';
import { Task, Theme, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { generateDailySummary } from '../services/geminiService';
import { Button } from './Button';
import { Sparkles, RefreshCw } from 'lucide-react';

interface SummaryProps {
  tasks: Task[];
  theme: Theme;
  lang: Language;
}

export const Summary: React.FC<SummaryProps> = ({ tasks, theme, lang }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const t = TRANSLATIONS[lang];

  const handleGenerate = async () => {
    setIsLoading(true);
    const completed = tasks.filter(t => t.completed).map(t => t.text);
    const result = await generateDailySummary(completed, lang);
    setSummary(result);
    setIsLoading(false);
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
        
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${theme.colors.surface} shadow-lg`}>
          <Sparkles className={theme.colors.primary} size={32} />
        </div>

        <div>
          <h2 className={`text-xl font-bold ${theme.colors.text}`}>{t.summary_title}</h2>
          <p className={`text-sm ${theme.colors.textMuted} mt-1`}>
            {t.summary_desc.replace('{count}', completedCount.toString())}
          </p>
        </div>

        {summary ? (
          <div className={`bg-white/5 p-6 rounded-xl border border-white/10 text-left w-full animate-fade-in`}>
            <p className={`leading-relaxed ${theme.colors.text} text-sm whitespace-pre-line`}>
              {summary}
            </p>
            <div className="mt-4 flex justify-end">
               <button 
                onClick={handleGenerate} 
                className={`text-xs flex items-center gap-1 ${theme.colors.primary} hover:underline`}
               >
                 <RefreshCw size={12} /> {t.refresh}
               </button>
            </div>
          </div>
        ) : (
          <div className="max-w-xs mx-auto">
            <p className={`text-sm ${theme.colors.textMuted} mb-6`}>
              {t.summary_placeholder}
            </p>
            <Button 
              onClick={handleGenerate} 
              themeColors={theme.colors} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? t.generating : t.generate_btn}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
