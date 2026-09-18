'use client';

import React from 'react';

interface SmoothScrollLinkProps {
  targetId: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}

export function SmoothScrollLink({
  targetId,
  className = '',
  children,
  ariaLabel,
}: SmoothScrollLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Respect user modifier keys (ctrl, cmd, shift, alt) for new tabs
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

    e.preventDefault();

    // Smooth animated scroll with offset handling
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    // Update browser history/URL hash without abrupt jump
    if (typeof window !== 'undefined' && window.history?.pushState) {
      window.history.pushState(null, '', `#${targetId}`);
    }

    // Apply temporary subtle highlight animation
    targetElement.classList.add('section-highlight-pulse');
    setTimeout(() => {
      targetElement.classList.remove('section-highlight-pulse');
    }, 2000);
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}
