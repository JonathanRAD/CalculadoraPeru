'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface ResponsiveDetailsProps {
  children: ReactNode;
  className?: string;
  defaultMobileOpen?: boolean;
  id?: string;
}

export function ResponsiveDetails({ children, className, defaultMobileOpen = false, id }: ResponsiveDetailsProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const updateOpenState = () => {
      if (detailsRef.current) detailsRef.current.open = media.matches || defaultMobileOpen;
    };

    updateOpenState();
    media.addEventListener('change', updateOpenState);
    return () => media.removeEventListener('change', updateOpenState);
  }, [defaultMobileOpen]);

  return <details ref={detailsRef} id={id} open className={className}>{children}</details>;
}
