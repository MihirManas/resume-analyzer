import { useState, useEffect, useRef } from 'react';

export const useScrollReveal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          // Global tactile effect: slight haptic feedback whenever new elements animate into view
          if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(10);
          }

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, []);

  return { ref: domRef, isVisible };
};

export default useScrollReveal;
