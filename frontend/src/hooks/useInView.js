import { useEffect, useRef, useState } from 'react';

// Lightweight scroll-reveal hook using IntersectionObserver — 
// no external animation library needed
export const useInView = (options = { threshold: 0.15 }) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(element);
      }
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isInView];
};