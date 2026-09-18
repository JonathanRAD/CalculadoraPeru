export type UserRole = 'user' | 'admin';
export type ProPlan = 'monthly' | 'yearly';

export interface CompanyProfile {
  companyName?: string;
  companyRuc?: string;
  companyAddress?: string;
  companyLogoBase64?: string;
}

export interface UserAccount extends CompanyProfile {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  isPro: boolean;
  plan?: ProPlan | null;
  proExpiresAt?: string | null;
  activatedCode?: string | null;
  createdAt: string;
  lastLoginAt?: string;
}

export type SafeUser = Omit<UserAccount, 'passwordHash' | 'salt'>;

export type LicenseStatus = 'available' | 'redeemed' | 'revoked';

export interface LicenseCode {
  id: string;
  code: string;
  plan: ProPlan;
  durationDays: number;
  assignedClientName: string;
  assignedClientEmail?: string;
  status: LicenseStatus;
  redeemedByUserId?: string;
  redeemedByUserEmail?: string;
  redeemedAt?: string;
  createdAt: string;
  createdBy?: string;
}
