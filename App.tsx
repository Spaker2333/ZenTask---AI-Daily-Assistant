import React, { useState, useEffect, useRef } from 'react';
import { Tab, Task, ThemeId, ReminderSettings, UserStats, Language } from './types';
import { THEMES, ACHIEVEMENTS, TRANSLATIONS } from './constants';
import { TodoList } from './components/TodoList';
import { Pomodoro } from './components/Pomodoro';
import { Wellness } from './components/Wellness';
import { Summary } from './components/Summary';
import { Stats } from './components/Stats';
import { 
  CheckSquare, 
  Timer, 
  HeartPulse, 
  Sparkles, 
  Palette, 
  X,
  Maximize2,
  Minimize2,
  BarChart3,
  Languages
} from 'lucide-react';

const App: React.FC = () => {
  // State initialization with LocalStorage
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Focus);
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    return (localStorage.getItem('zen-theme') as ThemeId) || ThemeId.Midnight;
  });
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('zen-lang') as Language) || 'en';
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('zen-tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(() => {
    const saved = localStorage.getItem('zen-reminders');
    return saved ? JSON.parse(saved) : { 
      waterIntervalMinutes: 60, 
      stretchIntervalMinutes: 60, 
      enabled: false,
      notificationMode: 'both',
      soundType: 'chime'
    };
  });
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('zen-stats');
    return saved ? JSON.parse(saved) : { totalTasksCompleted: 0, totalFocusMinutes: 0, unlockedAchievements: [] };
  });

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'info' | 'success'} | null>(null);
  const [flash, setFlash] = useState(false);

  const theme = THEMES[themeId];
  const t = TRANSLATIONS[language];

  // Persistence Effects
  useEffect(() => localStorage.setItem('zen-theme', themeId), [themeId]);
  useEffect(() => localStorage.setItem('zen-lang', language), [language]);
  useEffect(() => localStorage.setItem('zen-tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('zen-reminders', JSON.stringify(reminderSettings)), [reminderSettings]);
  useEffect(() => localStorage.setItem('zen-stats', JSON.stringify(userStats)), [userStats]);

  // Audio Helper
  const playAlertSound = (type: 'beep' | 'chime' | 'pulse') => {
    if (reminderSettings.notificationMode === 'visual') return;
    
    // Simple oscillator-based sound generator
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'beep') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'chime') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      osc.start();
      osc.stop(ctx.currentTime + 1);
    } else {
      // Pulse
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  };

  // Reminder Logic
  useEffect(() => {
    if (!reminderSettings.enabled) return;

    const checkReminders = () => {
      const now = Date.now();
      const lastWater = parseInt(localStorage.getItem('last-water') || '0');
      const lastStretch = parseInt(localStorage.getItem('last-stretch') || '0');

      if (now - lastWater > reminderSettings.waterIntervalMinutes * 60 * 1000) {
        triggerNotification('Time to drink some water!');
        localStorage.setItem('last-water', now.toString());
      }

      if (now - lastStretch > reminderSettings.stretchIntervalMinutes * 60 * 1000) {
        triggerNotification('Stand up and stretch!');
        localStorage.setItem('last-stretch', now.toString());
      }
    };

    const interval = setInterval(checkReminders, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [reminderSettings]);

  // Unified Notification Handler
  const triggerNotification = (message: string) => {
    // Audio
    playAlertSound(reminderSettings.soundType);

    // Visual
    if (reminderSettings.notificationMode !== 'sound') {
       setFlash(true);
       setTimeout(() => setFlash(false), 500); // Flash effect
       setNotification({ message, type: 'info' });
    }
    
    // System Notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("ZenTask", { body: message });
    }
    
    // Auto clear
    setTimeout(() => setNotification(null), 5000);
  };

  // Achievement Check Logic
  const checkAchievements = (stats: UserStats) => {
    let newUnlock = false;
    const unlocked = [...stats.unlockedAchievements];

    ACHIEVEMENTS.forEach(ach => {
      if (!unlocked.includes(ach.id) && ach.condition(stats)) {
        unlocked.push(ach.id);
        triggerNotification(`Achievement Unlocked: ${ach.title[language]}!`);
        newUnlock = true;
      }
    });

    if (newUnlock) {
      setUserStats(prev => ({ ...prev, unlockedAchievements: unlocked }));
    }
  };

  // Stats Updaters
  const handleTaskComplete = () => {
    setUserStats(prev => {
      const next = { ...prev, totalTasksCompleted: prev.totalTasksCompleted + 1 };
      checkAchievements(next);
      return next;
    });
  };

  const handleFocusComplete = (minutes: number) => {
    setUserStats(prev => {
      const next = { ...prev, totalFocusMinutes: prev.totalFocusMinutes + minutes };
      checkAchievements(next);
      return next;
    });
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  // UI Render Helpers
  const renderTabContent = () => {
    switch (activeTab) {
      case Tab.Tasks: return <TodoList tasks={tasks} setTasks={setTasks} theme={theme} onTaskComplete={handleTaskComplete} lang={language}/>;
      case Tab.Focus: return <Pomodoro theme={theme} onFocusComplete={handleFocusComplete} playNotification={() => triggerNotification(t.session_finished)} lang={language}/>;
      case Tab.Wellness: return <Wellness theme={theme} settings={reminderSettings} setSettings={setReminderSettings} lang={language}/>;
      case Tab.Summary: return <Summary tasks={tasks} theme={theme} lang={language}/>;
      case Tab.Stats: return <Stats stats={userStats} theme={theme} lang={language}/>;
      default: return null;
    }
  };

  const navItems = [
    { id: Tab.Focus, icon: Timer, label: t.focus },
    { id: Tab.Tasks, icon: CheckSquare, label: t.tasks },
    { id: Tab.Stats, icon: BarChart3, label: t.stats },
    { id: Tab.Wellness, icon: HeartPulse, label: t.wellness },
    { id: Tab.Summary, icon: Sparkles, label: t.summary },
  ];

  // Widget Positioning styles
  const widgetStyles = "fixed top-4 right-4 z-50 transition-all duration-300 shadow-2xl overflow-hidden backdrop-blur-md border border-white/10";
  const sizeStyles = isCollapsed ? "w-16 h-16 rounded-full" : "w-80 h-[550px] rounded-3xl"; 
  const flashStyle = flash ? "ring-4 ring-white shadow-white/50" : "";

  return (
    <div className="relative w-screen h-screen bg-transparent pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300 -z-10 opacity-50" />

      {/* Main Widget Container */}
      <div className={`${widgetStyles} ${sizeStyles} ${flashStyle} ${theme.colors.bg} pointer-events-auto flex flex-col`}>
        
        {/* Collapsed View */}
        {isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(false)} 
            className={`w-full h-full flex items-center justify-center ${theme.colors.text} hover:scale-110 transition-transform`}
          >
            <div className={`p-3 rounded-full ${theme.colors.accent}`}>
              <Maximize2 size={24} color="white" />
            </div>
          </button>
        )}

        {/* Expanded View */}
        {!isCollapsed && (
          <>
            {/* Header */}
            <header className={`px-5 py-4 flex items-center justify-between ${theme.colors.surface}`}>
              <h1 className={`font-bold text-lg tracking-tight ${theme.colors.text}`}>{t.app_title}</h1>
              <div className="flex gap-2">
                <button 
                  onClick={toggleLanguage} 
                  className={`p-2 rounded-lg hover:bg-white/10 ${theme.colors.textMuted} hover:${theme.colors.text} transition-colors text-xs font-bold`}
                  title="Switch Language"
                >
                  {language === 'en' ? '中' : 'EN'}
                </button>
                <button 
                  onClick={() => setShowThemeSelector(!showThemeSelector)} 
                  className={`p-2 rounded-lg hover:bg-white/10 ${theme.colors.textMuted} hover:${theme.colors.text} transition-colors`}
                >
                  <Palette size={18} />
                </button>
                <button 
                  onClick={() => setIsCollapsed(true)} 
                  className={`p-2 rounded-lg hover:bg-white/10 ${theme.colors.textMuted} hover:${theme.colors.text} transition-colors`}
                >
                  <Minimize2 size={18} />
                </button>
              </div>
            </header>

            {/* Theme Selector Overlay */}
            {showThemeSelector && (
              <div className={`absolute top-14 left-0 w-full z-20 p-4 ${theme.colors.surface} border-b border-white/10 animate-slide-down`}>
                <div className="grid grid-cols-5 gap-2">
                  {Object.values(THEMES).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setThemeId(t.id)}
                      className={`w-8 h-8 rounded-full border-2 ${t.colors.bg.replace('text', 'bg')} ${themeId === t.id ? 'border-white scale-110' : 'border-transparent opacity-70'} shadow-sm`}
                      style={{ backgroundColor: t.id === 'sunrise' ? '#f97316' : undefined }} 
                      title={t.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Content Area */}
            <main className="flex-1 p-5 overflow-hidden relative flex flex-col">
              {renderTabContent()}

              {/* In-App Notification Toast */}
              {notification && (
                <div className="absolute bottom-4 left-4 right-4 bg-white text-slate-900 p-3 rounded-xl shadow-xl animate-bounce-in flex items-center gap-3 z-30">
                  <div className={`p-2 rounded-full ${notification.type === 'info' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    <HeartPulse size={16}/>
                  </div>
                  <span className="text-sm font-medium">{notification.message}</span>
                  <button onClick={() => setNotification(null)} className="ml-auto text-slate-400">
                    <X size={14} />
                  </button>
                </div>
              )}
            </main>

            {/* Bottom Nav */}
            <nav className={`px-2 pb-2 pt-0 ${theme.colors.bg}`}>
              <div className={`flex justify-between items-center bg-white/5 rounded-2xl p-1`}>
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition-all duration-200 ${
                      activeTab === item.id 
                        ? `${theme.colors.surface} ${theme.colors.primary} shadow-sm` 
                        : `${theme.colors.textMuted} hover:bg-white/5`
                    }`}
                  >
                    <item.icon size={18} className={activeTab === item.id ? "mb-1" : ""} />
                    {activeTab === item.id && <span className="text-[9px] font-medium">{item.label}</span>}
                  </button>
                ))}
              </div>
            </nav>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
