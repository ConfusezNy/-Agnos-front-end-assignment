import type { PatientFormData, ValidationErrors } from './types';

// Patterns
const NAME_PATTERN = /^[a-zA-Z\u0E00-\u0E7F\s'\-\.]+$/; // Letters (EN+TH), spaces, apostrophe, hyphen, dot
const PHONE_PATTERN = /^\+?[\d\s\-()]{7,15}$/; // Accepts: 0812345678, +66812345678, (02) 555-1234
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

/**
 * Validate a single field. Returns error message or empty string.
 */
export function validateField(
  name: keyof PatientFormData,
  value: string
): string {
  switch (name) {
    case 'firstName': {
      if (value !== value.trim()) return 'Remove leading or trailing spaces';
      const v = value.trim();
      if (!v) return 'First name is required';
      if (v.length < 2) return 'Must be at least 2 characters';
      if (v.length > 50) return 'Must be 50 characters or fewer';
      if (!NAME_PATTERN.test(v)) return 'Only letters, spaces, hyphens, and apostrophes allowed';
      return '';
    }

    case 'lastName': {
      if (value !== value.trim()) return 'Remove leading or trailing spaces';
      const v = value.trim();
      if (!v) return 'Last name is required';
      if (v.length < 2) return 'Must be at least 2 characters';
      if (v.length > 50) return 'Must be 50 characters or fewer';
      if (!NAME_PATTERN.test(v)) return 'Only letters, spaces, hyphens, and apostrophes allowed';
      return '';
    }

    case 'middleName': {
      if (value !== value.trim()) return 'Remove leading or trailing spaces';
      const v = value.trim();
      if (!v) return ''; // optional
      if (v.length > 50) return 'Must be 50 characters or fewer';
      if (!NAME_PATTERN.test(v)) return 'Only letters, spaces, hyphens, and apostrophes allowed';
      return '';
    }

    case 'dateOfBirth': {
      if (!value) return 'Date of birth is required';
      const dob = new Date(value);
      if (isNaN(dob.getTime())) return 'Invalid date';
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dob >= today) return 'Must be a date in the past';
      const age = today.getFullYear() - dob.getFullYear();
      if (age > 150) return 'Please enter a valid date';
      return '';
    }

    case 'gender':
      if (!value) return 'Gender is required';
      if (!['male', 'female', 'other'].includes(value)) return 'Invalid selection';
      return '';

    case 'phoneNumber': {
      if (value !== value.trim()) return 'Remove leading or trailing spaces';
      const v = value.trim();
      if (!v) return 'Phone number is required';
      if (!PHONE_PATTERN.test(v)) return 'Enter a valid phone number (e.g. 0812345678)';
      return '';
    }

    case 'email': {
      if (value !== value.trim()) return 'Remove leading or trailing spaces';
      const v = value.trim();
      if (!v) return 'Email is required';
      if (v.length > 254) return 'Email is too long';
      if (!EMAIL_PATTERN.test(v)) return 'Enter a valid email address';
      return '';
    }

    case 'address': {
      const v = value.trim();
      if (!v) return 'Address is required';
      if (v.length > 300) return 'Address is too long';
      return '';
    }

    case 'preferredLanguage':
      if (!value) return 'Preferred language is required';
      return '';

    case 'nationality':
      if (!value) return 'Nationality is required';
      return '';

    case 'emergencyContactName': {
      const v = value.trim();
      if (!v) return ''; // optional
      if (v.length > 100) return 'Must be 100 characters or fewer';
      if (!NAME_PATTERN.test(v)) return 'Only letters, spaces, hyphens, and apostrophes allowed';
      return '';
    }

    case 'emergencyContactRelationship':
    case 'religion':
      return ''; // optional, no strict validation

    default:
      return '';
  }
}

/**
 * Validate the entire form.
 */
export function validateForm(data: PatientFormData): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const key of Object.keys(data) as (keyof PatientFormData)[]) {
    const error = validateField(key, data[key]);
    if (error) errors[key] = error;
  }
  return errors;
}

/**
 * Check if form has zero errors.
 */
export function isFormValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}

/**
 * Form completion percentage (required fields only).
 */
export function getFormProgress(data: PatientFormData): number {
  const requiredFields: (keyof PatientFormData)[] = [
    'firstName', 'lastName', 'dateOfBirth', 'gender',
    'phoneNumber', 'email', 'address', 'preferredLanguage', 'nationality',
  ];
  const filled = requiredFields.filter((f) => data[f].trim() !== '').length;
  return Math.round((filled / requiredFields.length) * 100);
}
