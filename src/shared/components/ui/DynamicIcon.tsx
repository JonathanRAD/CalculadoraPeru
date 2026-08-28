'use client';

import React from 'react';
import {
  ShoppingCart,
  LineChart,
  Scale,
  PiggyBank,
  Zap,
  Receipt,
  Tag,
  PackageCheck,
  Target,
  Percent,
  Calculator,
  Store,
  TrendingUp,
  LayoutGrid,
  CheckCircle2,
  HelpCircle,
  Share2,
  Copy,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info,
  Building2,
  Briefcase,
  Gift,
  CreditCard,
  Landmark,
  FileText,
  ShoppingBag,
  Clock,
  Utensils,
  Fuel,
  Palmtree,
  LucideProps,
} from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  ShoppingCart,
  LineChart,
  Scale,
  PiggyBank,
  Zap,
  Receipt,
  Tag,
  PackageCheck,
  Target,
  Percent,
  Calculator,
  Store,
  TrendingUp,
  LayoutGrid,
  CheckCircle2,
  HelpCircle,
  Share2,
  Copy,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info,
  Building2,
  Briefcase,
  Gift,
  CreditCard,
  Landmark,
  FileText,
  ShoppingBag,
  Clock,
  Utensils,
  Fuel,
  Palmtree,
};

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent = ICON_MAP[name] || Calculator;
  return <IconComponent {...props} />;
}
