import { CreateClassRequest } from '@/services/classService';
import { CLASS_DAY_OPTIONS } from './constants';

/**
 * Converts an ISO/date string to a value suitable for datetime-local inputs.
 * @param value - Date string from API or form state
 */
export function toDateTimeLocalValue(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Converts an ISO/date string to a value suitable for date inputs.
 * @param value - Date string from API or form state
 */
export function toDateInputValue(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Normalizes API time strings (12h or 24h) to HTML time input `HH:mm`.
 * @param value - Time string such as "10:00 AM" or "14:30"
 */
export function toTimeInputValue(value?: string): string {
  if (!value) return '';
  const trimmed = value.trim();
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    return `${String(Number(match24[1])).padStart(2, '0')}:${match24[2]}`;
  }
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match12) return trimmed;
  let hour = Number(match12[1]);
  const minute = match12[2];
  const period = match12[3].toUpperCase();
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${minute}`;
}

/**
 * Builds the create/update payload expected by the classes API.
 * @param formData - Form state from ClassFormModal
 */
export function buildClassPayload(formData: CreateClassRequest): CreateClassRequest {
  const scheduleDate = formData.schedule
    ? new Date(formData.schedule)
    : formData.schedules?.[0]?.date
      ? new Date(formData.schedules[0].date)
      : new Date();

  const startTime = formData.startTime || formData.schedules?.[0]?.startTime || '';
  const endTime = formData.endTime || formData.schedules?.[0]?.endTime || '';
  const dayIndex = scheduleDate.getDay() === 0 ? 6 : scheduleDate.getDay() - 1;
  const days = formData.schedules?.[0]?.days?.length
    ? formData.schedules[0].days
    : [CLASS_DAY_OPTIONS[dayIndex]];

  const payload: CreateClassRequest = {
    ...formData,
    title: formData.title.trim(),
    description: (formData.description || '').trim(),
    teacher: formData.teacher,
    status: formData.status ?? true,
    classType: formData.classType || 'online',
    classCategory: formData.classCategory || 'yoga class',
    duration: Number(formData.duration) || 60,
    maxCapacity: Number(formData.maxCapacity) || 20,
    level: formData.level || [],
    schedule: scheduleDate.toISOString(),
    startTime,
    endTime,
    schedules: [
      {
        date: scheduleDate.toISOString(),
        days,
        startTime,
        endTime,
      },
    ],
    perfectFor: (formData.perfectFor || []).filter(Boolean),
    skipIf: (formData.skipIf || []).filter(Boolean),
    whatYoullGain: (formData.whatYoullGain || []).filter(Boolean),
  };

  if (formData.classType === 'offline') {
    payload.latitude = Number(formData.latitude);
    payload.longitude = Number(formData.longitude);
  } else {
    delete payload.latitude;
    delete payload.longitude;
  }

  return payload;
}
