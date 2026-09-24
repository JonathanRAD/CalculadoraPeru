'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';

function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

function getReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getServerReducedMotion() {
  return false;
}

interface FadeInProps {
  children: React.ReactNode;
  delay?: number; // delay in milliseconds
  duration?: number; // duration in milliseconds
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
  as?: React.ElementType;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 600,
  direction = 'up',
  className = '',
  as: Component = 'div',
}: FadeInProps) {
  const prefersReducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerReducedMotion);
  const [isIntersected, setIsIntersected] = useState(false);
  const isVisible = prefersReducedMotion || isIntersected;
  const domRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersected(true);
            if (domRef.current) {
              observer.unobserve(domRef.current);
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '40px',
      }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [prefersReducedMotion]);

  const getTransform = () => {
    if (isVisible) return 'translate3d(0, 0, 0)';
    switch (direction) {
      case 'up':
        return 'translate3d(0, 24px, 0)';
      case 'down':
        return 'translate3d(0, -24px, 0)';
      case 'left':
        return 'translate3d(24px, 0, 0)';
      case 'right':
        return 'translate3d(-24px, 0, 0)';
      case 'none':
      default:
        return 'none';
    }
  };

  return (
    <Component
      ref={domRef}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionProperty: 'opacity, transform',
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'opacity, transform',
      }}
      className={className}
    >
      {children}
    </Component>
  );
}

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number; // delay between each child in ms
  className?: string;
  as?: React.ElementType;
}

export function StaggerContainer({
  children,
  staggerDelay = 90,
  className = '',
  as: Component = 'div',
}: StaggerContainerProps) {
  const childArray = React.Children.toArray(children);

  return (
    <Component className={className}>
      {childArray.map((child, index) => (
        <FadeIn key={index} delay={index * staggerDelay} direction="up">
          {child}
        </FadeIn>
      ))}
    </Component>
  );
}
