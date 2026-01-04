import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  themeColors?: any;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  themeColors,
  className = '',
  ...props 
}) => {
  let baseClass = "px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ";
  
  if (variant === 'primary') {
    baseClass += `${themeColors.accent} text-white shadow-lg shadow-black/20 hover:opacity-90`;
  } else if (variant === 'secondary') {
    baseClass += `bg-white/10 ${themeColors.text} hover:bg-white/20`;
  } else {
    baseClass += `${themeColors.textMuted} hover:${themeColors.text} hover:bg-white/5`;
  }

  return (
    <button className={`${baseClass} ${className}`} {...props}>
      {children}
    </button>
  );
};
