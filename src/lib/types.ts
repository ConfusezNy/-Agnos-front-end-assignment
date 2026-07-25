// ============================================================
// TypeScript interfaces for the Agnos Patient Form System
// ============================================================

/**
 * All 13 fields from the patient form.
 * Optional fields use empty string as default, not undefined,
 * so every field always exists in the object.
 */
export interface PatientFormData {
  firstName: string;
  middleName: string; // optional
  lastName: string;
  dateOfBirth: string;
  gender: '' | 'male' | 'female' | 'other';
  phoneNumber: string;
  email: string;
  address: string;
  preferredLanguage: string;
  nationality: string;
  emergencyContactName: string; // optional
  emergencyContactRelationship: string; // optional
  religion: string; // optional
}

/** Patient activity status visible on the staff dashboard */
export type PatientStatus = 'filling' | 'inactive' | 'submitted';

/** A patient session as tracked by the server and displayed on staff view */
export interface PatientSession {
  id: string;
  data: PatientFormData;
  status: PatientStatus;
  connectedAt: string;
  lastActivity: string;
}

/** Default empty form data */
export const EMPTY_FORM_DATA: PatientFormData = {
  firstName: '',
  middleName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  phoneNumber: '',
  email: '',
  address: '',
  preferredLanguage: '',
  nationality: '',
  emergencyContactName: '',
  emergencyContactRelationship: '',
  religion: '',
};

// ============================================================
// WebSocket Message Types (JSON protocol)
// ============================================================

/** Messages sent from client to server */
export type ClientMessage =
  | { type: 'register'; role: 'patient' | 'staff'; tabId?: string }
  | { type: 'patient:update'; data: PatientFormData }
  | { type: 'patient:status'; status: PatientStatus };

/** Messages sent from server to client */
export type ServerMessage =
  | { type: 'connection:ack'; sessionId: string }
  | { type: 'patients:sync'; patients: PatientSession[] }
  | { type: 'patient:updated'; patient: PatientSession }
  | { type: 'patient:status-changed'; sessionId: string; status: PatientStatus }
  | { type: 'patient:disconnected'; sessionId: string };

export type ValidationErrors = Partial<Record<keyof PatientFormData, string>>;

