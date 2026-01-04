import React from 'react';
import { Theme, UserStats, Language } from '../types';
import { ACHIEVEMENTS, TRANSLATIONS } from '../constants';
import { Trophy, Clock, CheckCircle2 } from 'lucide-react';

interface StatsProps {
  stats: UserStats;
  theme: Theme;
  lang: Language;
}

export const Stats: React.FC<StatsProps> = ({ stats, theme, lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-2 rounded-lg bg-white/10 ${theme.colors.primary}`}>
           <Trophy size={20} />
        </div>
        <h2 className={`text-lg font-bold ${theme.colors.text}`}>{t.stats_title}</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
          <div className={`${theme.colors.textMuted} mb-1`}><CheckCircle2 size={24} /></div>
          <div className={`text-2xl font-bold ${theme.colors.text}`}>{stats.totalTasksCompleted}</div>
          <div className={`text-xs ${theme.colors.textMuted}`}>{t.tasks_done}</div>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
          <div className={`${theme.colors.textMuted} mb-1`}><Clock size={24} /></div>
          <div className={`text-2xl font-bold ${theme.colors.text}`}>{stats.totalFocusMinutes}</div>
          <div className={`text-xs ${theme.colors.textMuted}`}>{t.focus_mins}</div>
        </div>
      </div>

      {/* Achievements List */}
      <div className="flex-1 overflow-y-auto">
        <h3 className={`text-xs font-bold uppercase ${theme.colors.textMuted} mb-3 tracking-wider`}>{t.achievements}</h3>
        <div className="space-y-2 pr-2">
          {ACHIEVEMENTS.map(achievement => {
            const isUnlocked = stats.unlockedAchievements.includes(achievement.id);
            return (
              <div 
                key={achievement.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isUnlocked 
                    ? `bg-gradient-to-r from-white/10 to-transparent border border-white/10` 
                    : 'bg-black/20 opacity-50 grayscale'
                }`}
              >
                <div className="text-2xl filter drop-shadow-md">
                  {achievement.icon}
                </div>
                <div>
                  <div className={`text-sm font-semibold ${isUnlocked ? theme.colors.text : theme.colors.textMuted}`}>
                    {achievement.title[lang]}
                  </div>
                  <div className="text-[10px] text-white/50">
                    {achievement.description[lang]}
                  </div>
                </div>
                {isUnlocked && (
                  <div className={`ml-auto ${theme.colors.primary}`}>
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
