'use client';

import { useEffect } from 'react';

/**
 * Tracks the exact screen coordinate (X, Y) of the user's latest click, tap, or enter keypress.
 * Sets CSS variables --modal-origin-x and --modal-origin-y so modals can open and collapse
 * directly from the trigger element into the center of the screen.
 */
export function ModalOriginTracker() {
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent | MouseEvent) => {
      if (e.clientX !== undefined && e.clientY !== undefined) {
        document.documentElement.style.setProperty('--modal-origin-x', `${Math.round(e.clientX)}px`);
        document.documentElement.style.setProperty('--modal-origin-y', `${Math.round(e.clientY)}px`);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const active = document.activeElement;
        if (active && active !== document.body) {
          const rect = active.getBoundingClientRect();
          document.documentElement.style.setProperty('--modal-origin-x', `${Math.round(rect.left + rect.width / 2)}px`);
          document.documentElement.style.setProperty('--modal-origin-y', `${Math.round(rect.top + rect.height / 2)}px`);
        }
      }
    };

    window.addEventListener('pointerdown', handlePointerDown, { capture: true, passive: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true, passive: true });

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, []);

  return null;
}
