'use client';

import { useEffect } from 'react';

export function PwaRegistration() {
  useEffect(() => {
    // Clean up any stale API caches from previous service worker versions
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          if (name.includes('calculaperu-v1')) {
            caches.delete(name);
          } else {
            caches.open(name).then((cache) => {
              cache.keys().then((requests) => {
                requests.forEach((req) => {
                  if (req.url.includes('/api/')) {
                    cache.delete(req);
                  }
                });
              });
            });
          }
        });
      });
    }

    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    void navigator.serviceWorker.register('/sw.js').then((reg) => {
      // Force immediate update check
      void reg.update();
    }).catch((error: unknown) => {
      console.error('No se pudo registrar el service worker', error);
    });
  }, []);

  return null;
}
