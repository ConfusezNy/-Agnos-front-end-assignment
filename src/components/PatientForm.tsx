'use client';

import { usePatientForm } from '@/hooks/usePatientForm';
import FormField from './FormField';
import Navbar from './Navbar';

export default function PatientForm() {
  const {
    formData,
    errors,
    touchedFields,
    isSubmitted,
    isConnected,
    connectionState,
    progress,
    handleFieldChange,
    handleFieldBlur,
    handleSubmit,
  } = usePatientForm();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = handleSubmit();

    // Scroll to the first field with an error
    if (!result.success && result.firstErrorField) {
      const el = document.getElementById(result.firstErrorField);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Focus the field after scroll completes
        setTimeout(() => el.focus(), 400);
      }
    }
  };

  if (isSubmitted) {
    return (
      <>
        <Navbar connectionState={connectionState} />
        <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
          <div className="w-full max-w-sm animate-fade-in text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#001a33]">Submitted</h2>
            <p className="mt-2 text-sm text-[#63707c]">
              Your information has been received. A staff member will review it shortly.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar connectionState={connectionState} />
      <main className="min-h-[calc(100vh-3.5rem)]">
        <div className="mx-auto max-w-2xl px-6 py-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-[#001a33]">
              Patient Information
            </h1>
            <p className="mt-1 text-sm text-[#63707c]">
              Please complete all required fields (<span className="text-red-500">*</span>) before submitting.
            </p>

            {/* Progress */}
            <div className="mt-4 flex items-center gap-3">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs tabular-nums text-[#63707c]">{progress}%</span>
            </div>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-8">
            {/* Personal Information */}
            <fieldset>
              <legend className="mb-4 text-[13px] font-semibold uppercase tracking-wide text-[#63707c]">
                Personal Information
              </legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField name="firstName" label="First name" required placeholder="John" value={formData.firstName} error={errors.firstName} touched={touchedFields.has('firstName')} onChange={handleFieldChange} onBlur={handleFieldBlur} />
                <FormField name="middleName" label="Middle name" placeholder="Michael" value={formData.middleName} error={errors.middleName} touched={touchedFields.has('middleName')} onChange={handleFieldChange} onBlur={handleFieldBlur} />
                <FormField name="lastName" label="Last name" required placeholder="Doe" value={formData.lastName} error={errors.lastName} touched={touchedFields.has('lastName')} onChange={handleFieldChange} onBlur={handleFieldBlur} />
                <FormField name="dateOfBirth" label="Date of birth" type="date" required value={formData.dateOfBirth} error={errors.dateOfBirth} touched={touchedFields.has('dateOfBirth')} onChange={handleFieldChange} onBlur={handleFieldBlur} />
                <FormField
                  name="gender" label="Gender" type="select" required
                  value={formData.gender} error={errors.gender} touched={touchedFields.has('gender')} onChange={handleFieldChange} onBlur={handleFieldBlur}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </div>
            </fieldset>

            <hr className="border-gray-100" />

            {/* Contact Information */}
            <fieldset>
              <legend className="mb-4 text-[13px] font-semibold uppercase tracking-wide text-[#63707c]">
                Contact Information
              </legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField name="phoneNumber" label="Phone number" type="tel" required placeholder="0812345678" hint="e.g. 0812345678 or +66812345678" value={formData.phoneNumber} error={errors.phoneNumber} touched={touchedFields.has('phoneNumber')} onChange={handleFieldChange} onBlur={handleFieldBlur} />
                <FormField name="email" label="Email" type="text" required placeholder="john@example.com" value={formData.email} error={errors.email} touched={touchedFields.has('email')} onChange={handleFieldChange} onBlur={handleFieldBlur} inputMode="email" />
                <div className="sm:col-span-2">
                  <FormField name="address" label="Address" type="textarea" required placeholder="123 Main Street, City, Country" value={formData.address} error={errors.address} touched={touchedFields.has('address')} onChange={handleFieldChange} onBlur={handleFieldBlur} />
                </div>
              </div>
            </fieldset>

            <hr className="border-gray-100" />

            {/* Preferences */}
            <fieldset>
              <legend className="mb-4 text-[13px] font-semibold uppercase tracking-wide text-[#63707c]">
                Preferences
              </legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  name="preferredLanguage" label="Preferred language" type="select" required
                  value={formData.preferredLanguage} error={errors.preferredLanguage} touched={touchedFields.has('preferredLanguage')} onChange={handleFieldChange} onBlur={handleFieldBlur}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'th', label: 'Thai' },
                    { value: 'zh', label: 'Chinese' },
                    { value: 'ja', label: 'Japanese' },
                    { value: 'ko', label: 'Korean' },
                    { value: 'es', label: 'Spanish' },
                    { value: 'fr', label: 'French' },
                    { value: 'de', label: 'German' },
                    { value: 'ar', label: 'Arabic' },
                    { value: 'hi', label: 'Hindi' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
                <FormField
                  name="nationality" label="Nationality" type="select" required
                  value={formData.nationality} error={errors.nationality} touched={touchedFields.has('nationality')} onChange={handleFieldChange} onBlur={handleFieldBlur}
                  options={[
                    { value: 'Thai', label: 'Thai' },
                    { value: 'American', label: 'American' },
                    { value: 'British', label: 'British' },
                    { value: 'Chinese', label: 'Chinese' },
                    { value: 'Japanese', label: 'Japanese' },
                    { value: 'Korean', label: 'Korean' },
                    { value: 'Indian', label: 'Indian' },
                    { value: 'Filipino', label: 'Filipino' },
                    { value: 'Vietnamese', label: 'Vietnamese' },
                    { value: 'Indonesian', label: 'Indonesian' },
                    { value: 'Malaysian', label: 'Malaysian' },
                    { value: 'Singaporean', label: 'Singaporean' },
                    { value: 'Australian', label: 'Australian' },
                    { value: 'Canadian', label: 'Canadian' },
                    { value: 'French', label: 'French' },
                    { value: 'German', label: 'German' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
                <FormField
                  name="religion" label="Religion" type="select"
                  value={formData.religion} error={errors.religion} touched={touchedFields.has('religion')} onChange={handleFieldChange} onBlur={handleFieldBlur}
                  options={[
                    { value: 'Buddhism', label: 'Buddhism' },
                    { value: 'Christianity', label: 'Christianity' },
                    { value: 'Islam', label: 'Islam' },
                    { value: 'Hinduism', label: 'Hinduism' },
                    { value: 'Judaism', label: 'Judaism' },
                    { value: 'Sikhism', label: 'Sikhism' },
                    { value: 'None', label: 'None / No religion' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
              </div>
            </fieldset>

            <hr className="border-gray-100" />

            {/* Emergency Contact */}
            <fieldset>
              <legend className="mb-4 text-[13px] font-semibold uppercase tracking-wide text-[#63707c]">
                Emergency Contact
              </legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField name="emergencyContactName" label="Contact name" placeholder="Jane Doe" value={formData.emergencyContactName} error={errors.emergencyContactName} touched={touchedFields.has('emergencyContactName')} onChange={handleFieldChange} onBlur={handleFieldBlur} />
                <FormField
                  name="emergencyContactRelationship" label="Relationship" type="select"
                  value={formData.emergencyContactRelationship} error={errors.emergencyContactRelationship} touched={touchedFields.has('emergencyContactRelationship')} onChange={handleFieldChange} onBlur={handleFieldBlur}
                  options={[
                    { value: 'spouse', label: 'Spouse' },
                    { value: 'parent', label: 'Parent' },
                    { value: 'sibling', label: 'Sibling' },
                    { value: 'child', label: 'Child' },
                    { value: 'friend', label: 'Friend' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </div>
            </fieldset>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!isConnected}
                aria-busy={!isConnected}
                className={`
                  rounded-[14px] px-7 py-3 text-[14px] font-medium text-white min-h-[44px]
                  transition-all duration-300
                  active:scale-[0.98]
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${progress === 100
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200'
                    : 'bg-[#001a33] hover:bg-[#002b54]'
                  }
                `}
              >
                {!isConnected ? 'Connecting...' : progress === 100 ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    Submit
                  </span>
                ) : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
