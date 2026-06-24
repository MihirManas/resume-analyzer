import React from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ theme, toggleTheme, size = 20 }) => (
  <button onClick={toggleTheme} className="relative w-10 h-10 flex items-center justify-center overflow-hidden rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
    <div className={`absolute transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${theme === 'dark' ? 'translate-y-10 -translate-x-10 opacity-0 -rotate-90' : 'translate-y-0 translate-x-0 opacity-100 rotate-0'}`}>
      <Sun size={size} className="text-[#3B82F6]" />
    </div>
    <div className={`absolute transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${theme === 'dark' ? 'translate-y-0 translate-x-0 opacity-100 rotate-0' : 'translate-y-10 translate-x-10 opacity-0 rotate-90'}`}>
      <Moon size={size} className="text-gray-500 dark:text-white/80" />
    </div>
  </button>
);

export default ThemeToggle;
