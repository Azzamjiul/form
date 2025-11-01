import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1280,
};

export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < breakpoints.tablet) {
        setBreakpoint('mobile');
      } else if (width < breakpoints.desktop) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);

    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isMobileOrTablet: breakpoint === 'mobile' || breakpoint === 'tablet',
  };
}