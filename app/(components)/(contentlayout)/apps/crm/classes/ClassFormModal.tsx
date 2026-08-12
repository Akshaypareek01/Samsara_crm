'use client';

import React from 'react';
import { CreateClassRequest, Teacher } from '@/services/classService';
import {
  CLASS_CATEGORY_OPTIONS,
  CLASS_DAY_OPTIONS,
  CLASS_LEVEL_OPTIONS,
} from './constants';
import { toDateInputValue } from './classFormUtils';
import TagListField from './TagListField';

interface ClassFormModalProps {
  editingClass: boolean;
  formData: CreateClassRequest;
  teachers: Teacher[];
  onChange: (data: CreateClassRequest) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

/**
 * Create / edit class modal aligned with backend enums and teacher app fields.
 */
const ClassFormModal: React.FC<ClassFormModalProps> = ({
  editingClass,
  formData,
  teachers,
  onChange,
  onSubmit,
  onClose,
}) => {
  const selectedDays = formData.schedules?.[0]?.days || [];
  const scheduleDateValue = toDateInputValue(formData.schedule || formData.schedules?.[0]?.date);

  /**
   * Updates the primary schedule entry used by the API.
   */
  const updateScheduleFields = (patch: {
    date?: string;
    startTime?: string;
    endTime?: string;
    days?: string[];
  }) => {
    const nextDate = patch.date ?? scheduleDateValue;
    const nextStart = patch.startTime ?? formData.startTime ?? '';
    const nextEnd = patch.endTime ?? formData.endTime ?? '';
    const nextDays = patch.days ?? selectedDays;

    onChange({
      ...formData,
      schedule: nextDate ? `${nextDate}T${nextStart || '00:00'}` : formData.schedule,
      startTime: nextStart,
      endTime: nextEnd,
      schedules: [
        {
          date: nextDate || undefined,
          days: nextDays,
          startTime: nextStart,
          endTime: nextEnd,
        },
      ],
    });
  };

  /**
   * Toggles a difficulty level in the multi-select.
   */
  const toggleLevel = (level: string) => {
    const current = formData.level || [];
    const next = current.includes(level)
      ? current.filter((item) => item !== level)
      : [...current, level];
    onChange({ ...formData, level: next });
  };

  /**
   * Toggles a weekday in the schedule days multi-select.
   */
  const toggleDay = (day: string) => {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((item) => item !== day)
      : [...selectedDays, day];
    updateScheduleFields({ days: next });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="class-form-title"
    >
      <div className="bg-white dark:bg-bodybg rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 id="class-form-title" className="text-lg font-semibold">
            {editingClass ? 'Edit Class' : 'Create New Class'}
          </h3>
          <button type="button" onClick={onClose} className="ti-btn ti-btn-sm ti-btn-ghost" aria-label="Close class form">
            <i className="ri-close-line" aria-hidden="true"></i>
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label" htmlFor="class-title">Title *</label>
              <input
                id="class-title"
                type="text"
                className="form-control"
                value={formData.title}
                onChange={(e) => onChange({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label" htmlFor="class-teacher">Teacher *</label>
              <select
                id="class-teacher"
                className="form-control"
                value={formData.teacher || ''}
                onChange={(e) => onChange({ ...formData, teacher: e.target.value })}
                required
                aria-required="true"
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" htmlFor="class-type">Class Type *</label>
              <select
                id="class-type"
                className="form-control"
                value={formData.classType || 'online'}
                onChange={(e) =>
                  onChange({ ...formData, classType: e.target.value as 'online' | 'offline' })
                }
                required
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div>
              <label className="form-label" htmlFor="class-category">Category *</label>
              <select
                id="class-category"
                className="form-control"
                value={formData.classCategory || ''}
                onChange={(e) => onChange({ ...formData, classCategory: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                {CLASS_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" htmlFor="class-duration">Duration (minutes) *</label>
              <input
                id="class-duration"
                type="number"
                min={1}
                className="form-control"
                value={formData.duration ?? 60}
                onChange={(e) => onChange({ ...formData, duration: parseInt(e.target.value, 10) || 0 })}
                required
              />
            </div>

            <div>
              <label className="form-label" htmlFor="class-capacity">Max Capacity *</label>
              <input
                id="class-capacity"
                type="number"
                min={1}
                className="form-control"
                value={formData.maxCapacity ?? 20}
                onChange={(e) => onChange({ ...formData, maxCapacity: parseInt(e.target.value, 10) || 0 })}
                required
              />
            </div>

            <div>
              <label className="form-label" htmlFor="class-date">Schedule Date *</label>
              <input
                id="class-date"
                type="date"
                className="form-control"
                value={scheduleDateValue}
                onChange={(e) => updateScheduleFields({ date: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label" htmlFor="class-status">Status</label>
              <select
                id="class-status"
                className="form-control"
                value={formData.status ? 'true' : 'false'}
                onChange={(e) => onChange({ ...formData, status: e.target.value === 'true' })}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div>
              <label className="form-label" htmlFor="class-start">Start Time *</label>
              <input
                id="class-start"
                type="time"
                className="form-control"
                value={formData.startTime || ''}
                onChange={(e) => updateScheduleFields({ startTime: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label" htmlFor="class-end">End Time *</label>
              <input
                id="class-end"
                type="time"
                className="form-control"
                value={formData.endTime || ''}
                onChange={(e) => updateScheduleFields({ endTime: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label" htmlFor="class-password">Password</label>
              <input
                id="class-password"
                type="text"
                className="form-control"
                value={formData.password || ''}
                onChange={(e) => onChange({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="class-image">Image URL</label>
              <input
                id="class-image"
                type="url"
                className="form-control"
                value={formData.image || ''}
                onChange={(e) => onChange({ ...formData, image: e.target.value })}
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <fieldset>
                <legend className="form-label mb-2">Level *</legend>
                <div className="flex flex-wrap gap-3" role="group" aria-label="Class difficulty levels">
                  {CLASS_LEVEL_OPTIONS.map((level) => {
                    const checked = (formData.level || []).includes(level);
                    return (
                      <label key={level} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleLevel(level)}
                          aria-label={level}
                        />
                        <span>{level}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            <div className="col-span-1 md:col-span-2">
              <fieldset>
                <legend className="form-label mb-2">Recurring Days</legend>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Schedule days">
                  {CLASS_DAY_OPTIONS.map((day) => {
                    const active = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`ti-btn ti-btn-sm !m-0 ${active ? 'ti-btn-primary' : 'ti-btn-light'}`}
                        aria-pressed={active}
                        aria-label={day}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            {formData.classType === 'offline' && (
              <>
                <div>
                  <label className="form-label" htmlFor="class-lat">Latitude *</label>
                  <input
                    id="class-lat"
                    type="number"
                    step="any"
                    className="form-control"
                    value={formData.latitude ?? ''}
                    onChange={(e) =>
                      onChange({
                        ...formData,
                        latitude: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                    required
                    min={-90}
                    max={90}
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="class-lng">Longitude *</label>
                  <input
                    id="class-lng"
                    type="number"
                    step="any"
                    className="form-control"
                    value={formData.longitude ?? ''}
                    onChange={(e) =>
                      onChange({
                        ...formData,
                        longitude: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                    required
                    min={-180}
                    max={180}
                  />
                </div>
              </>
            )}

            <div className="col-span-1 md:col-span-2">
              <label className="form-label" htmlFor="class-description">Description *</label>
              <textarea
                id="class-description"
                className="form-control"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => onChange({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <TagListField
              label="Perfect For"
              values={formData.perfectFor || []}
              onChange={(perfectFor) => onChange({ ...formData, perfectFor })}
              placeholder="e.g. Beginners looking to build flexibility"
            />
            <TagListField
              label="Skip If"
              values={formData.skipIf || []}
              onChange={(skipIf) => onChange({ ...formData, skipIf })}
              placeholder="e.g. Recent injury / doctor advised rest"
            />
            <TagListField
              label="What You'll Gain"
              values={formData.whatYoullGain || []}
              onChange={(whatYoullGain) => onChange({ ...formData, whatYoullGain })}
              placeholder="e.g. Better posture and core strength"
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="ti-btn ti-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="ti-btn ti-btn-primary">
              {editingClass ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassFormModal;
