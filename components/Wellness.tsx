import React, { useEffect } from 'react';
import { Theme, ReminderSettings, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Droplets, Activity, Bell, BellOff, Volume2, Eye } from 'lucide-react';

interface WellnessProps {
  theme: Theme;
  settings: ReminderSettings;
  setSettings: React.Dispatch<React.SetStateAction<ReminderSettings>>;
  lang: Language;
}

export const Wellness: React.FC<WellnessProps> = ({ theme, settings, setSettings, lang }) => {
  const t = TRANSLATIONS[lang];
  
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const toggleEnabled = () => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const updateWater = (val: number) => {
    setSettings(prev => ({ ...prev, waterIntervalMinutes: Math.max(15, val) }));
  };

  const updateStretch = (val: number) => {
    setSettings(prev => ({ ...prev, stretchIntervalMinutes: Math.max(15, val) }));
  };

  return (
    <div className="flex flex-col h-full space-y-5 overflow-y-auto pr-1">
      
      {/* Master Switch */}
      <div className="bg-white/5 p-4 rounded-xl flex items-center justify-between">
        <div>
          <h3 className={`font-semibold ${theme.colors.text}`}>{t.wellness_title}</h3>
          <p className={`text-xs ${theme.colors.textMuted}`}>{t.wellness_desc}</p>
        </div>
        <button 
          onClick={toggleEnabled}
          className={`w-12 h-6 rounded-full transition-colors relative ${settings.enabled ? theme.colors.accent : 'bg-gray-600'}`}
        >
          <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
      </div>

      <div className={`space-y-4 transition-opacity duration-300 ${settings.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        
        {/* Intervals */}
        <div className="p-4 rounded-xl border border-white/5 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <Droplets size={16} className="text-blue-400"/>
               <span className={`text-sm ${theme.colors.text}`}>{t.water_interval}</span>
            </div>
            <div className="flex items-center gap-3">
               <input 
                  type="range" min="15" max="120" step="15"
                  value={settings.waterIntervalMinutes}
                  onChange={(e) => updateWater(parseInt(e.target.value))}
                  className="accent-blue-500 flex-1 h-1.5 bg-white/20 rounded-full appearance-none"
               />
               <span className={`text-xs font-mono w-12 text-right ${theme.colors.text}`}>{settings.waterIntervalMinutes}m</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
               <Activity size={16} className="text-emerald-400"/>
               <span className={`text-sm ${theme.colors.text}`}>{t.stretch_interval}</span>
            </div>
            <div className="flex items-center gap-3">
               <input 
                  type="range" min="15" max="180" step="15"
                  value={settings.stretchIntervalMinutes}
                  onChange={(e) => updateStretch(parseInt(e.target.value))}
                  className="accent-emerald-500 flex-1 h-1.5 bg-white/20 rounded-full appearance-none"
               />
               <span className={`text-xs font-mono w-12 text-right ${theme.colors.text}`}>{settings.stretchIntervalMinutes}m</span>
            </div>
          </div>
        </div>

        {/* Customization */}
        <div className="p-4 rounded-xl border border-white/5 space-y-4">
           <h4 className={`text-xs font-bold uppercase ${theme.colors.textMuted} mb-2`}>{t.notification_style}</h4>
           
           <div className="flex items-center justify-between">
             <span className={`text-sm ${theme.colors.text} flex items-center gap-2`}><Volume2 size={16}/> {t.sound}</span>
             <select 
                value={settings.soundType}
                onChange={(e) => setSettings(prev => ({ ...prev, soundType: e.target.value as any }))}
                className={`bg-white/10 text-xs rounded px-2 py-1 outline-none ${theme.colors.text}`}
             >
                <option value="beep">{t.sound_beep}</option>
                <option value="chime">{t.sound_chime}</option>
                <option value="pulse">{t.sound_pulse}</option>
             </select>
           </div>

           <div className="flex items-center justify-between">
             <span className={`text-sm ${theme.colors.text} flex items-center gap-2`}><Eye size={16}/> {t.mode}</span>
             <select 
                value={settings.notificationMode}
                onChange={(e) => setSettings(prev => ({ ...prev, notificationMode: e.target.value as any }))}
                className={`bg-white/10 text-xs rounded px-2 py-1 outline-none ${theme.colors.text}`}
             >
                <option value="both">{t.mode_both}</option>
                <option value="sound">{t.mode_sound}</option>
                <option value="visual">{t.mode_visual}</option>
             </select>
           </div>
        </div>

      </div>
    </div>
  );
};
