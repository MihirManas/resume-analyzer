import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const ScrollReveal = ({ children, delay = 0 }) => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
