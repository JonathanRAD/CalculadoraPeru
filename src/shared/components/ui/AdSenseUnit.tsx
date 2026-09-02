'use client';

import React, { useEffect } from 'react';

interface AdSenseUnitProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
}

export function AdSenseUnit({
  slot = '1234567890',
  format = 'auto',
  responsive = true,
  className = 'my-6 flex justify-center overflow-hidden',
}: AdSenseUnitProps) {
  useEffect(() => {
    try {
      // Push ad request safely in browser environment
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || [];
        adsbygoogle.push({});
      }
    } catch {
      // Silently catch adblocker or initialization errors
    }
  }, []);

  return (
    <div className={className} aria-hidden="true">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '250px' }}
        data-ad-client="ca-pub-1171972985538083"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
