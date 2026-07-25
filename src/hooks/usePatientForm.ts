'use client';

// ============================================================
// usePatientForm Hook — Form state + validation + WS sync
// ============================================================

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type {
  PatientFormData,
  ValidationErrors,
  ServerMessage,
} from '@/lib/types';
import { EMPTY_FORM_DATA } from '@/lib/types';
import { validateField, validateForm, isFormValid, getFormProgress } from '@/lib/validation';
import { useWebSocket } from './useWebSocket';

interface UsePatientFormReturn {
  formData: PatientFormData;
  errors: ValidationErrors;
  touchedFields: Set<keyof PatientFormData>;
  isSubmitted: boolean;
  isConnected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected';
  sessionId: string | null;
  progress: number;
  handleFieldChange: (field: keyof PatientFormData, value: string) => void;
  handleFieldBlur: (field: keyof PatientFormData) => void;
  handleSubmit: () => { success: boolean; firstErrorField?: keyof PatientFormData };
}

export function usePatientForm(): UsePatientFormReturn {
  const [formData, setFormData] = useState<PatientFormData>({
    ...EMPTY_FORM_DATA,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<
    Set<keyof PatientFormData>
  >(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Inactivity timer ref
  const inactivityRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track latest form data for debounced send
  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Handle server messages
  const handleMessage = useCallback((message: ServerMessage) => {
    if (message.type === 'connection:ack') {
      setSessionId(message.sessionId);
    }
  }, []);

  const { send, connectionState, isConnected } = useWebSocket({
    role: 'patient',
    onMessage: handleMessage,
  });

  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityRef.current) {
      clearTimeout(inactivityRef.current);
    }

    // After 30 seconds of no input, send inactive status
    inactivityRef.current = setTimeout(() => {
      sendRef.current({ type: 'patient:status', status: 'inactive' });
    }, 30000);
  }, []);

  // Handle field blur — mark as touched + re-validate (catches spaces-only input)
  const handleFieldBlur = useCallback(
    (field: keyof PatientFormData) => {
      if (isSubmitted) return;

      setTouchedFields((prev) => {
        if (prev.has(field)) return prev;
        const next = new Set(prev);
        next.add(field);
        return next;
      });

      // Re-validate with current value (important for spaces-only case)
      const currentValue = formDataRef.current[field];
      const error = validateField(field, currentValue);
      setErrors((prev) => {
        const next = { ...prev };
        if (error) {
          next[field] = error;
        } else {
          delete next[field];
        }
        return next;
      });
    },
    [isSubmitted]
  );

  // Handle field change with debounced WebSocket sync
  const handleFieldChange = useCallback(
    (field: keyof PatientFormData, value: string) => {
      if (isSubmitted) return;

      // Update form data
      setFormData((prev) => {
        const updated = { ...prev, [field]: value };
        formDataRef.current = updated;
        return updated;
      });

      // Mark field as touched (skip update if already touched to avoid re-render)
      setTouchedFields((prev) => {
        if (prev.has(field)) return prev;
        const next = new Set(prev);
        next.add(field);
        return next;
      });

      // Validate the field
      const error = validateField(field, value);
      setErrors((prev) => {
        const next = { ...prev };
        if (error) {
          next[field] = error;
        } else {
          delete next[field];
        }
        return next;
      });

      // Reset inactivity timer
      resetInactivityTimer();

      // Debounce WebSocket send (300ms)
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        sendRef.current({
          type: 'patient:update',
          data: formDataRef.current,
        });
      }, 300);
    },
    [isSubmitted, resetInactivityTimer]
  );

  // Handle form submission
  const handleSubmit = useCallback((): { success: boolean; firstErrorField?: keyof PatientFormData } => {
    // Touch all fields to show validation
    const allFields = Object.keys(formData) as (keyof PatientFormData)[];
    setTouchedFields(new Set(allFields));

    // Validate everything
    const formErrors = validateForm(formData);
    setErrors(formErrors);

    if (!isFormValid(formErrors)) {
      // Return the first field that has an error (in form order)
      const fieldOrder: (keyof PatientFormData)[] = [
        'firstName', 'middleName', 'lastName', 'dateOfBirth', 'gender',
        'phoneNumber', 'email', 'address',
        'preferredLanguage', 'nationality', 'religion',
        'emergencyContactName', 'emergencyContactRelationship',
      ];
      const firstError = fieldOrder.find((f) => formErrors[f]);
      return { success: false, firstErrorField: firstError };
    }

    // Send final update + submitted status
    send({ type: 'patient:update', data: formData });
    send({ type: 'patient:status', status: 'submitted' });
    setIsSubmitted(true);

    // Clear timers
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (inactivityRef.current) clearTimeout(inactivityRef.current);

    return { success: true };
  }, [formData, send]);

  const progress = useMemo(() => getFormProgress(formData), [formData]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (inactivityRef.current) clearTimeout(inactivityRef.current);
    };
  }, []);

  return {
    formData,
    errors,
    touchedFields,
    isSubmitted,
    isConnected,
    connectionState,
    sessionId,
    progress,
    handleFieldChange,
    handleFieldBlur,
    handleSubmit,
  };
}
