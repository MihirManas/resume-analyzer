import React, { useState, useEffect } from 'react';

const BootSequence = ({ onComplete, theme }) => {
  const [phase, setPhase] = useState(0);
  const [targetTransform, setTargetTransform] = useState('translate(0px, 0px) scale(1)');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300); // Line appears
    const t2 = setTimeout(() => setPhase(2), 1000); // Text slides in
    const t3 = setTimeout(() => setPhase(3), 2400); // Hold
    const t4 = setTimeout(() => {
      // Calculate exact transform to navbar logo
      const target = document.getElementById('navbar-logo');
      const bootLogo = document.getElementById('boot-logo');
      if (target && bootLogo) {
        const targetRect = target.getBoundingClientRect();
        const bootRect = bootLogo.getBoundingClientRect();

        // Calculate scale ratio based on width for exact font scaling match
        const scale = targetRect.width / bootRect.width;

        // Calculate centers to avoid baseline alignment issues
        const targetCx = targetRect.left + targetRect.width / 2;
        const targetCy = targetRect.top + targetRect.height / 2;
        const bootCx = bootRect.left + bootRect.width / 2;
        const bootCy = bootRect.top + bootRect.height / 2;

        // Calculate translation needed to move center to center
        const dx = targetCx - bootCx;
        const dy = targetCy - bootCy;

        setTargetTransform(`translate(${dx}px, ${dy}px) scale(${scale})`);
      }
      setPhase(4);
    }, 3000); // Fly to target
    const t5 = setTimeout(() => onComplete(), 4000); // Unmount

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-colors duration-1000 ${theme === 'dark' ? 'bg-black' : 'bg-[#F8F9FA]'} ${phase === 4 ? 'bg-transparent pointer-events-none' : ''}`}
    >
      <div
        id="boot-logo"
        style={{
          transformOrigin: 'center',
          transform: phase === 4 ? targetTransform : 'translate(0px, 0px) scale(1)'
        }}
        className={`flex items-center text-5xl md:text-7xl font-medium tracking-tight transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]`}
      >
        <div
          className={`transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${phase >= 2 ? 'translate-x-0 opacity-100' : '-translate-x-[150%] opacity-0'} ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
        >
          Resume Analyzer
        </div>

        <div
          className={`mx-1 md:mx-2 text-[#3B82F6] font-light transition-all duration-700 ease-out transform ${phase >= 1 ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}`}
        >
          /
        </div>

        <div
          className={`transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${phase >= 2 ? 'translate-x-0 opacity-100' : 'translate-x-[150%] opacity-0'} ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
        >
          Upskilling
        </div>
      </div>
    </div>
  );
};

export default BootSequence;
