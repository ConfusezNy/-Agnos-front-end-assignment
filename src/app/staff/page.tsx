// ============================================================
// Staff Page — Renders the staff dashboard
// ============================================================

import type { Metadata } from 'next';
import StaffDashboard from '@/components/StaffDashboard';

export const metadata: Metadata = {
  title: 'Staff Dashboard — AgnosHealth',
  description: 'Monitor patient form submissions in real-time. View patient status and information as it is entered.',
};

export default function StaffPage() {
  return <StaffDashboard />;
}
