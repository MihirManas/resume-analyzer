import React from 'react';
import { Quote } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const ReviewCard = ({ review, delay = 0 }) => (
  <ScrollReveal delay={delay}>
    <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.05] p-8 sm:p-12 rounded-[2rem] sm:rounded-[3rem] shadow-xl dark:shadow-none hover:shadow-2xl dark:hover:bg-white/[0.03] transition-all backdrop-blur-xl h-full flex flex-col justify-between">
      <div>
        <Quote className="text-[#3B82F6]/50 dark:text-[#3B82F6]/30 w-12 h-12 mb-8" />
        <p className="text-gray-700 dark:text-white/80 text-xl font-light leading-relaxed mb-12">
          "{review.quote}"
        </p>
      </div>
      <div className="flex items-center space-x-6 border-t border-gray-200 dark:border-white/10 pt-8 mt-auto">
        <div className={`w-16 h-16 bg-gradient-to-br ${review.bg} rounded-full border border-black/10 dark:border-white/20 flex items-center justify-center overflow-hidden shadow-lg dark:shadow-[0_0_20px_rgba(230,200,117,0.2)]`}>
          <span className="text-white dark:text-black font-bold text-xl tracking-widest">{review.initials}</span>
        </div>
        <div>
          <h4 className="text-gray-900 dark:text-white font-medium text-xl">{review.name}</h4>
          <p className="text-[#1D4ED8] dark:text-[#3B82F6]/70 text-sm mt-1 uppercase tracking-widest font-semibold">{review.role}</p>
        </div>
      </div>
    </div>
  </ScrollReveal>
);

export default ReviewCard;
