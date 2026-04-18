// Shared client-side validators used across create/edit forms.
// Each validator returns a string error message or an empty string if valid.

export type FieldErrors<T extends string = string> = Partial<Record<T, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COURSE_CODE_REGEX = /^[A-Z0-9\-]{2,20}$/;
// At least 8 chars, one uppercase, one lowercase, one number.
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function validateRequired(value: string | undefined | null, label: string): string {
  if (!value || !String(value).trim()) return `${label} is required.`;
  return '';
}

export function validateLength(
  value: string,
  label: string,
  min: number,
  max: number
): string {
  const v = (value ?? '').trim();
  if (v.length < min) return `${label} must be at least ${min} characters.`;
  if (v.length > max) return `${label} must be at most ${max} characters.`;
  return '';
}

export function validateEmail(value: string): string {
  const v = (value ?? '').trim();
  if (!v) return 'Email is required.';
  if (!EMAIL_REGEX.test(v)) return 'Please enter a valid email address.';
  if (v.length > 254) return 'Email is too long.';
  return '';
}

export function validatePassword(value: string): string {
  if (!value) return 'Password is required.';
  if (value.length < 8) return 'Password must be at least 8 characters.';
  if (!STRONG_PASSWORD_REGEX.test(value)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, and one number.';
  }
  return '';
}

export function validateCourseCode(value: string): string {
  const v = (value ?? '').trim().toUpperCase();
  if (!v) return 'Course code is required.';
  if (!COURSE_CODE_REGEX.test(v)) {
    return 'Course code must be 2–20 characters, uppercase letters, digits, or dashes (e.g., CS-601).';
  }
  return '';
}

export function validateName(value: string): string {
  const v = (value ?? '').trim();
  if (!v) return 'Full name is required.';
  if (v.length < 2) return 'Full name must be at least 2 characters.';
  if (v.length > 100) return 'Full name must be at most 100 characters.';
  if (!/^[A-Za-z][A-Za-z\s.'-]*$/.test(v)) {
    return 'Full name may only contain letters, spaces, dots, apostrophes, and hyphens.';
  }
  return '';
}

// Returns the start of today in local time.
export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Given a YYYY-MM-DD date-picker value, returns a Date at 23:59:59.999 local time.
// Use this when submitting a "due date" so the assignment stays open until midnight.
export function endOfDayFromDateInput(value: string): Date | null {
  if (!value) return null;
  const [yy, mm, dd] = value.split('-').map(Number);
  if (!yy || !mm || !dd) return null;
  return new Date(yy, mm - 1, dd, 23, 59, 59, 999);
}

// Returns an ISO string for end-of-day of the given YYYY-MM-DD value, or '' if invalid.
export function endOfDayIso(value: string): string {
  const d = endOfDayFromDateInput(value);
  return d ? d.toISOString() : '';
}

// True if the due date (any Date-like value) has fully elapsed — i.e. we are past
// 23:59:59.999 of its calendar day in local time.
export function isPastDueDate(dueDate: string | Date | null | undefined): boolean {
  if (!dueDate) return false;
  const d = new Date(dueDate);
  if (isNaN(d.getTime())) return false;
  d.setHours(23, 59, 59, 999);
  return Date.now() > d.getTime();
}

// Returns today's date as YYYY-MM-DD (for use with <input type="date" min=...>).
export function todayISODate(): string {
  const d = startOfToday();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Validates a date-string (YYYY-MM-DD from <input type="date">) is today or in the future.
export function validateFutureOrTodayDate(value: string, label = 'Date'): string {
  if (!value) return `${label} is required.`;
  const picked = new Date(value);
  if (isNaN(picked.getTime())) return `Please enter a valid ${label.toLowerCase()}.`;
  picked.setHours(0, 0, 0, 0);
  if (picked.getTime() < startOfToday().getTime()) {
    return `${label} cannot be in the past. Please choose today or a future date.`;
  }
  return '';
}

export interface FileValidationOptions {
  maxSizeMB?: number;
  allowedExtensions?: string[]; // e.g. ['.pdf', '.doc']
}

export function validateFile(file: File | null, options: FileValidationOptions = {}): string {
  if (!file) return 'Please select a file to upload.';
  const { maxSizeMB = 10, allowedExtensions } = options;
  if (file.size === 0) return 'Selected file is empty.';
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `File is too large. Maximum allowed size is ${maxSizeMB} MB.`;
  }
  if (allowedExtensions && allowedExtensions.length > 0) {
    const name = file.name.toLowerCase();
    const ok = allowedExtensions.some(ext => name.endsWith(ext.toLowerCase()));
    if (!ok) {
      return `Unsupported file type. Allowed: ${allowedExtensions.join(', ')}.`;
    }
  }
  return '';
}

// Pulls a useful error message out of an axios error for display.
export function extractApiError(err: any, fallback = 'Something went wrong. Please try again.'): string {
  const data = err?.response?.data;
  if (typeof data?.message === 'string' && data.message.trim()) return data.message;
  if (typeof data?.error === 'string' && data.error.trim()) return data.error;
  if (typeof err?.message === 'string' && err.message.trim()) return err.message;
  return fallback;
}

// Helper to check if an error object has any non-empty values.
export function hasErrors(errors: Record<string, string>): boolean {
  return Object.values(errors).some(v => !!v);
}
