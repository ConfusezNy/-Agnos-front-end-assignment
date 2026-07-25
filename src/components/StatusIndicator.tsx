'use client';

import type { PatientStatus } from '@/lib/types';

interface StatusIndicatorProps {
  status: PatientStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<
  PatientStatus,
  { label: string; dotClass: string; bgClass: string; textClass: string }
> = {
  filling: {
    label: 'Filling',
    dotClass: 'bg-emerald-500 animate-pulse',
    bgClass: 'bg-emerald-50 border-emerald-200',
    textClass: 'text-emerald-700',
  },
  inactive: {
    label: 'Inactive',
    dotClass: 'bg-amber-400',
    bgClass: 'bg-amber-50 border-amber-200',
    textClass: 'text-amber-700',
  },
  submitted: {
    label: 'Submitted',
    dotClass: 'bg-sky-500',
    bgClass: 'bg-sky-50 border-sky-200',
    textClass: 'text-sky-700',
  },
};

export default function StatusIndicator({
  status,
  size = 'md',
}: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-medium
        transition-all duration-300
        ${config.bgClass} ${config.textClass}
        ${size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'}
      `}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}
