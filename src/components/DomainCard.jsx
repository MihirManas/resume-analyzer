import React from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollReveal from './ScrollReveal';
import IconResolver from './IconResolver';

const DomainCard = ({ course, delay = 0 }) => (
  <ScrollReveal delay={delay}>
    <Link
      to={`/domains/${course.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`}
      className="group bg-white dark:bg-white/[0.02] rounded-[3rem] border border-gray-200 dark:border-white/[0.05] overflow-hidden hover:shadow-2xl dark:hover:bg-white/[0.04] dark:hover:border-[#3B82F6]/30 transition-all duration-700 ease-out backdrop-blur-xl flex flex-col h-full shadow-lg dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] cursor-pointer block"
    >
      <div className="h-64 relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-50 dark:from-white/[0.01] to-transparent border-b border-gray-100 dark:border-white/[0.02]">
        <div className="text-gray-200 dark:text-white/10 transform group-hover:scale-125 group-hover:text-[#3B82F6]/30 transition-all duration-1000 ease-out">
          <IconResolver iconId={course.iconId} />
        </div>
        <div className="absolute top-8 left-8 z-20 bg-white/80 dark:bg-black/50 backdrop-blur-md border border-gray-200 dark:border-white/10 px-5 py-2 rounded-full flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white">{course.length}</span>
        </div>
      </div>

      <div className="p-8 sm:p-12 relative z-20 flex-grow flex flex-col justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#3B82F6] mb-5">{course.tag}</div>
          <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-gray-900 dark:text-white mb-5 group-hover:text-black dark:group-hover:text-white transition-colors duration-500">{course.title}</h3>
          <p className="text-gray-600 dark:text-white/50 font-light text-lg mb-6 leading-relaxed">Focus: {course.focus}</p>

          <div className="flex flex-wrap gap-3 mb-8">
            {course.techs.map(tech => (
              <div key={tech} className="px-4 py-1.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-white/70 shadow-inner group-hover:border-[#3B82F6]/50 group-hover:text-[#1D4ED8] dark:group-hover:text-white transition-colors duration-500">
                {tech}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/10 pt-8 mt-4">
          <div className="flex items-center text-gray-700 dark:text-white/70 text-base font-semibold">
            <BookOpen size={20} strokeWidth={2} className="mr-3 text-[#3B82F6]" />
            {course.modules} Modules
          </div>
          <div className="text-gray-900 dark:text-white group-hover:text-[#3B82F6] dark:group-hover:text-[#3B82F6] font-bold text-sm uppercase tracking-widest flex items-center transition-colors duration-300">
            View Domain Details <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  </ScrollReveal>
);

export default DomainCard;
