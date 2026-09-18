'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function trackSearchQuery(query: string) {
  const cleanQ = query.trim();
  if (cleanQ.length < 2) return;

  try {
    const payload = JSON.stringify({
      eventType: 'search',
      path: window.location.pathname,
      query: cleanQ,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/track', new Blob([payload], { type: 'application/json' }));
    } else {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Fail silently without disturbing user experience
  }
}

export function NativeAnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/api')) {
      return;
    }

    // Deduplicate same-page rapid triggers
    if (lastTrackedPath.current === pathname) {
      return;
    }
    lastTrackedPath.current = pathname;

    const payload = JSON.stringify({
      eventType: 'page_view',
      path: pathname,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    });

    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/track', new Blob([payload], { type: 'application/json' }));
      } else {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Fail silently
    }
  }, [pathname]);

  return null;
}
