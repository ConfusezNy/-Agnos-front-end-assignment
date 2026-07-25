'use client';

import { memo, useMemo } from 'react';
import type { PatientFormData } from '@/lib/types';

interface FormFieldProps {
  name: keyof PatientFormData;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  hint?: string;
  value: string;
  error?: string;
  touched?: boolean;
  options?: { value: string; label: string }[];
  onChange: (field: keyof PatientFormData, value: string) => void;
  onBlur?: (field: keyof PatientFormData) => void;
  disabled?: boolean;
  maxLength?: number;
}

const fieldMaxLengths: Partial<Record<keyof PatientFormData, number>> = {
  firstName: 50,
  middleName: 50,
  lastName: 50,
  phoneNumber: 20,
  email: 254,
  address: 300,
  nationality: 60,
  emergencyContactName: 100,
  religion: 60,
};

export default memo(function FormField({
  name,
  label,
  type = 'text',
  required = false,
  placeholder,
  hint,
  value,
  error,
  touched = false,
  options,
  onChange,
  onBlur,
  disabled = false,
  maxLength,
}: FormFieldProps) {
  const showError = touched && error;
  const limit = maxLength || fieldMaxLengths[name];

  const baseInputClasses = useMemo(() => `
    w-full rounded-[8px] border px-3.5 py-2.5 text-[14px] text-[#001a33]
    placeholder:text-[#b0b8c1] outline-none
    transition-all duration-200
    focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500
    disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
    ${
      showError
        ? 'border-red-400 bg-red-50/40'
        : 'border-gray-200 bg-white hover:border-gray-300'
    }
  `, [showError]);

  return (
    <div className="space-y-1">
      <label
        htmlFor={name}
        className="block text-[13px] font-medium text-[#001a33]"
      >
        {label}
        {required && (
          <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>
        )}
        {!required && (
          <span className="ml-1 font-normal text-[#b0b8c1]">(Optional)</span>
        )}
      </label>

      {type === 'select' && options ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => onBlur?.(name)}
          className={baseInputClasses}
          disabled={disabled}
          aria-invalid={showError ? 'true' : undefined}
          aria-describedby={showError ? `${name}-error` : hint ? `${name}-hint` : undefined}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => onBlur?.(name)}
          placeholder={placeholder}
          maxLength={limit}
          className={`${baseInputClasses} min-h-[72px] resize-y`}
          disabled={disabled}
          aria-invalid={showError ? 'true' : undefined}
          aria-describedby={showError ? `${name}-error` : hint ? `${name}-hint` : undefined}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => onBlur?.(name)}
          placeholder={placeholder}
          maxLength={limit}
          className={baseInputClasses}
          disabled={disabled}
          aria-invalid={showError ? 'true' : undefined}
          aria-describedby={showError ? `${name}-error` : hint ? `${name}-hint` : undefined}
        />
      )}

      {/* Hint text */}
      {hint && !showError && (
        <p id={`${name}-hint`} className="text-[11px] text-[#b0b8c1]">
          {hint}
        </p>
      )}

      {/* Error */}
      {showError && (
        <p id={`${name}-error`} className="text-[12px] text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
