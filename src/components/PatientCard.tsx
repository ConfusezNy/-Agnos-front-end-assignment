'use client';

import { memo, useState, useEffect } from 'react';
import type { PatientSession, PatientFormData } from '@/lib/types';
import StatusIndicator from './StatusIndicator';

interface PatientCardProps {
  patient: PatientSession;
  changedFields?: Set<string>;
}

const fieldLabels: { key: keyof PatientFormData; label: string }[] = [
  { key: 'firstName', label: 'First name' },
  { key: 'middleName', label: 'Middle name' },
  { key: 'lastName', label: 'Last name' },
  { key: 'dateOfBirth', label: 'Date of birth' },
  { key: 'gender', label: 'Gender' },
  { key: 'phoneNumber', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: 'Address' },
  { key: 'preferredLanguage', label: 'Language' },
  { key: 'nationality', label: 'Nationality' },
  { key: 'religion', label: 'Religion' },
  { key: 'emergencyContactName', label: 'Emergency contact' },
  { key: 'emergencyContactRelationship', label: 'Relationship' },
];

const displayLabels: Record<string, Record<string, string>> = {
  gender: { male: 'Male', female: 'Female', other: 'Other' },
  preferredLanguage: { en: 'English', th: 'Thai', zh: 'Chinese', ja: 'Japanese', ko: 'Korean', es: 'Spanish', fr: 'French', de: 'German', ar: 'Arabic', hi: 'Hindi', other: 'Other' },
  emergencyContactRelationship: { spouse: 'Spouse', parent: 'Parent', sibling: 'Sibling', child: 'Child', friend: 'Friend', other: 'Other' },
  religion: { None: 'None / No religion' },
};

function formatValue(key: keyof PatientFormData, value: string): string {
  if (!value) return '';
  if (displayLabels[key]) return displayLabels[key][value] || value;
  if (key === 'dateOfBirth') {
    try {
      return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return value; }
  }
  return value;
}

export default memo(function PatientCard({ patient, changedFields }: PatientCardProps) {
  // Local state to control flash animation (auto-clear handled by parent via timeout)
  const [flashFields, setFlashFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (changedFields && changedFields.size > 0) {
      setFlashFields(changedFields);
      const timer = setTimeout(() => setFlashFields(new Set()), 500);
      return () => clearTimeout(timer);
    }
    setFlashFields(new Set());
  }, [changedFields]);

  const name = [patient.data.firstName, patient.data.lastName].filter(Boolean).join(' ') || 'New patient';
  const connectedTime = new Date(patient.connectedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="animate-fade-in overflow-hidden rounded-[14px] border border-gray-200 bg-white shadow-[0_2px_8px_rgba(35,35,35,0.04)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[13px] font-semibold text-[#001a33]">
            {patient.data.firstName ? patient.data.firstName[0].toUpperCase() : '?'}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#001a33]">{name}</p>
            <p className="text-[11px] text-[#b0b8c1]">{connectedTime}</p>
          </div>
        </div>
        <StatusIndicator status={patient.status} size="sm" />
      </div>

      {/* Fields */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {fieldLabels.map((field) => {
            const value = patient.data[field.key];
            const isChanged = flashFields.has(field.key);

            return (
              <div
                key={field.key}
                className={`
                  rounded px-1.5 py-1 transition-all duration-300
                  ${isChanged ? 'animate-flash-update' : ''}
                  ${field.key === 'address' || field.key === 'email' ? 'col-span-2' : ''}
                `}
              >
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#b0b8c1]">
                  {field.label}
                </p>
                <p className={`truncate text-[13px] ${value ? 'text-[#001a33]' : 'text-[#d1d5db]'}`}>
                  {value ? formatValue(field.key, value) : '—'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
