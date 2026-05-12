import { useEffect, useState } from 'react';
import { MOBILE_BREAKPOINT } from '../constants/designTokens';

export function useResponsive(): { isMobile: boolean } {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return { isMobile };
}
