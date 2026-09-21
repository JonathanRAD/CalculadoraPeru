'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function GoogleAnalyticsPageViews() {
  const pathname = usePathname();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const cleanLocation = typeof window !== 'undefined'
      ? `${window.location.origin}${pathname}`
      : pathname;

    window.gtag?.('event', 'page_view', {
      page_path: pathname,
      page_location: cleanLocation,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}
