'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to manage origin-anchored opening and closing transitions for modals.
 * Allows exit animations to play before the component unmounts from the DOM.
 */
export function useModalAnimation(isOpen: boolean, duration = 260) {
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
    }
  }

  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isClosing, duration]);

  return {
    shouldRender,
    isClosing,
    backdropClass: isClosing ? 'backdrop-exit' : 'backdrop-enter',
    modalClass: isClosing ? 'modal-origin-card modal-exit' : 'modal-origin-card modal-enter',
  };
}
