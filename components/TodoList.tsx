import React, { useState } from 'react';
import { Task, Theme, Priority, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Button } from './Button';
import { Plus, Trash2, CheckCircle2, Circle, Flag, Tag, Filter } from 'lucide-react';

interface TodoListProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  theme: Theme;
  onTaskComplete: () => void;
  lang: Language;
}

export const TodoList: React.FC<TodoListProps> = ({ tasks, setTasks, theme, onTaskComplete, lang }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority>(Priority.Medium);
  const [showFilters, setShowFilters] = useState(false);
  const [filterTag, setFilterTag] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All');
  
  const t = TRANSLATIONS[lang];

  // Parse hashtags from text
  const extractTags = (text: string): { cleanText: string, tags: string[] } => {
    const tags: string[] = [];
    const cleanText = text.replace(/#(\w+)/g, (match, tag) => {
      tags.push(tag);
      return '';
    }).trim();
    return { cleanText: cleanText || text, tags }; // Use original if empty
  };

  const addTask = () => {
    if (!inputValue.trim()) return;
    
    const { cleanText, tags } = extractTags(inputValue);

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: cleanText || inputValue, // Fallback if user only typed tags
      completed: false,
      createdAt: Date.now(),
      priority: selectedPriority,
      tags: tags
    };
    setTasks(prev => [newTask, ...prev]);
    setInputValue('');
    setSelectedPriority(Priority.Medium);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (task && !task.completed) {
        onTaskComplete(); // Trigger stats update
      }
      return prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case Priority.High: return theme.colors.priorityHigh;
      case Priority.Medium: return theme.colors.priorityMed;
      case Priority.Low: return theme.colors.priorityLow;
    }
  };

  const getPriorityLabel = (p: Priority | 'All') => {
    if (p === 'All') return t.priority_all;
    if (p === Priority.High) return t.priority_high;
    if (p === Priority.Medium) return t.priority_medium;
    return t.priority_low;
  };

  // Filter and Sort Logic
  const filteredTasks = tasks.filter(t => {
    if (filterPriority !== 'All' && t.priority !== filterPriority) return false;
    if (filterTag && !t.tags.includes(filterTag)) return false;
    return true;
  });

  const activeTasks = filteredTasks.filter(t => !t.completed).sort((a, b) => {
    // Sort by Priority (High -> Low) then Date
    const pScore = { [Priority.High]: 3, [Priority.Medium]: 2, [Priority.Low]: 1 };
    if (pScore[a.priority] !== pScore[b.priority]) return pScore[b.priority] - pScore[a.priority];
    return b.createdAt - a.createdAt;
  });

  const completedTasks = filteredTasks.filter(t => t.completed).sort((a, b) => b.createdAt - a.createdAt);
  const allTags = Array.from(new Set(tasks.flatMap(t => t.tags)));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      
      {/* Input Area */}
      <div className="flex flex-col gap-2 mb-4 bg-white/5 p-3 rounded-xl border border-white/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder={t.add_task_placeholder}
            className={`flex-1 bg-transparent border-none outline-none ${theme.colors.text} placeholder:text-white/30 text-sm`}
          />
          <Button onClick={addTask} themeColors={theme.colors} className="!p-1 !w-8 !h-8 !min-w-0">
            <Plus size={18} />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
             {[Priority.High, Priority.Medium, Priority.Low].map(p => (
               <button 
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`w-3 h-3 rounded-full transition-all ${getPriorityColor(p)} ${selectedPriority === p ? 'ring-2 ring-white scale-125' : 'opacity-40 hover:opacity-100'}`}
                title={getPriorityLabel(p)}
               />
             ))}
          </div>
          <span className={`text-[10px] ${theme.colors.textMuted} ml-auto`}>{t.use_hash_for_tags}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex justify-between items-center mb-2 px-1">
        <h3 className={`text-xs font-bold uppercase ${theme.colors.textMuted}`}>{t.tasks_header}</h3>
        <button onClick={() => setShowFilters(!showFilters)} className={`${theme.colors.textMuted} hover:${theme.colors.primary}`}>
          <Filter size={14} />
        </button>
      </div>

      {showFilters && (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-none">
          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value as Priority | 'All')}
            className={`bg-white/10 text-xs rounded px-2 py-1 outline-none ${theme.colors.text}`}
          >
            <option value="All">{t.priority_all}</option>
            <option value={Priority.High}>{t.priority_high}</option>
            <option value={Priority.Medium}>{t.priority_medium}</option>
            <option value={Priority.Low}>{t.priority_low}</option>
          </select>
          
          <select 
            value={filterTag} 
            onChange={(e) => setFilterTag(e.target.value)}
            className={`bg-white/10 text-xs rounded px-2 py-1 outline-none ${theme.colors.text}`}
          >
            <option value="">{t.tags_all}</option>
            {allTags.map(tag => <option key={tag} value={tag}>#{tag}</option>)}
          </select>
        </div>
      )}

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {activeTasks.length === 0 && completedTasks.length === 0 && (
          <div className={`text-center py-8 ${theme.colors.textMuted} text-sm`}>
            {t.no_tasks}
          </div>
        )}

        {activeTasks.map(task => (
          <div key={task.id} className="group flex flex-col gap-1 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <button onClick={() => toggleTask(task.id)} className={`${theme.colors.textMuted} hover:${theme.colors.primary}`}>
                <Circle size={20} />
              </button>
              <span className={`flex-1 ${theme.colors.text} text-sm`}>{task.text}</span>
              <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 pl-8">
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} title={getPriorityLabel(task.priority)} />
              {task.tags.map(tag => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-white/60">#{tag}</span>
              ))}
            </div>
          </div>
        ))}

        {completedTasks.length > 0 && (
          <>
            <div className={`text-xs font-semibold uppercase tracking-wider mt-4 mb-2 ${theme.colors.textMuted}`}>{t.done_header}</div>
            {completedTasks.map(task => (
              <div key={task.id} className="group flex items-center gap-3 p-3 rounded-lg bg-black/10 opacity-60">
                <button onClick={() => toggleTask(task.id)} className={theme.colors.primary}>
                  <CheckCircle2 size={20} />
                </button>
                <span className={`flex-1 ${theme.colors.textMuted} line-through text-sm`}>{task.text}</span>
                <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
