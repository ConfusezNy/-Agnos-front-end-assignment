// ============================================================
// Patient Page — Renders the patient form
// ============================================================

import type { Metadata } from 'next';
import PatientForm from '@/components/PatientForm';

export const metadata: Metadata = {
  title: 'Patient Form — AgnosHealth',
  description: 'Fill out your patient intake form securely. Your information is synchronized in real-time with our staff.',
};

export default function PatientPage() {
  return <PatientForm />;
}
