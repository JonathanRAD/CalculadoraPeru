'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const ProActivationModal = dynamic(() => import('@/features/premium/components/ProActivationModal'), { ssr: false });
const AuthModal = dynamic(() => import('@/features/auth/components/AuthModal').then((m) => m.AuthModal), { ssr: false });
const ProfileModal = dynamic(() => import('@/features/auth/components/ProfileModal').then((m) => m.ProfileModal), { ssr: false });
const PwaInstallBanner = dynamic(() => import('@/shared/components/ui/PwaInstallBanner').then((m) => m.PwaInstallBanner), { ssr: false });

export function ClientModalsContainer() {
  return (
    <>
      <ProActivationModal />
      <AuthModal />
      <ProfileModal />
      <PwaInstallBanner />
    </>
  );
}
