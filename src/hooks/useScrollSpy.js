import { useState, useEffect, useRef } from 'react';

export const useScrollSpy = (sectionIds, offset = 200) => {
  const [activeId, setActiveId] = useState('');
  const isInitialMount = useRef(true);

  useEffect(() => {
    const handleScroll = () => {
      // Find the first section whose top is at or above the offset threshold
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i]);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= offset) {
            setActiveId(sectionIds[i]);
            return;
          }
        }
      }
      
      // If none are past the offset, default to the first section
      setActiveId(sectionIds[0]);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount to set initial state after a tiny delay to ensure DOM is ready
    setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sectionIds, offset]);

  // Tactile Haptic Feedback
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (activeId && window.navigator && window.navigator.vibrate) {
      // Very short 10ms vibration to simulate a physical "notch" or "dial click"
      window.navigator.vibrate(10);
    }
  }, [activeId]);

  return activeId;
};

export default useScrollSpy;
