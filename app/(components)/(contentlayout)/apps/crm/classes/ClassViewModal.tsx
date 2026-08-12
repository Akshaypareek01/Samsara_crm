'use client';

import React from 'react';
import { Class, Teacher, hasActiveMeeting } from '@/services/classService';

interface ClassViewModalProps {
  viewingClass: Class;
  teachers: Teacher[];
  onClose: () => void;
  onStart: (classId: string) => void;
  onJoin: (classItem: Class) => void;
  onEnd: (classId: string) => void;
  onDelete: (classId: string, classItem: Class) => void;
}

/**
 * Resolves teacher name for the view modal.
 */
function resolveTeacherName(viewingClass: Class, teachers: Teacher[]): string {
  if (
    viewingClass.teacher &&
    typeof viewingClass.teacher === 'object' &&
    'name' in viewingClass.teacher
  ) {
    return viewingClass.teacher.name;
  }
  if (typeof viewingClass.teacher === 'string') {
    return teachers.find((t) => t._id === viewingClass.teacher)?.name || 'N/A';
  }
  return 'N/A';
}

/**
 * Read-only class details modal with meeting actions.
 */
const ClassViewModal: React.FC<ClassViewModalProps> = ({
  viewingClass,
  teachers,
  onClose,
  onStart,
  onJoin,
  onEnd,
  onDelete,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="class-view-title"
    >
      <div className="bg-white dark:bg-bodybg rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 id="class-view-title" className="text-lg font-semibold">
            Class Details
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="ti-btn ti-btn-sm ti-btn-ghost"
            aria-label="Close class details"
          >
            <i className="ri-close-line" aria-hidden="true"></i>
          </button>
        </div>

        <div className="space-y-4">
          {viewingClass.image && (
            <div>
              <img
                src={viewingClass.image}
                alt={viewingClass.title}
                className="w-full h-48 object-cover rounded"
              />
            </div>
          )}
          <div>
            <h4 className="font-semibold text-lg">{viewingClass.title}</h4>
            {viewingClass.description && (
              <p className="text-muted mt-2">{viewingClass.description}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-muted">Teacher</label>
              <p>{resolveTeacherName(viewingClass, teachers)}</p>
            </div>
            <div>
              <label className="text-muted">Type</label>
              <p>{viewingClass.classType}</p>
            </div>
            <div>
              <label className="text-muted">Category</label>
              <p>{viewingClass.classCategory || 'N/A'}</p>
            </div>
            <div>
              <label className="text-muted">Duration</label>
              <p>{viewingClass.duration} minutes</p>
            </div>
            <div>
              <label className="text-muted">Max Capacity</label>
              <p>{viewingClass.maxCapacity}</p>
            </div>
            <div>
              <label className="text-muted">Status</label>
              <p>
                <span className={`badge ${viewingClass.status ? 'bg-success' : 'bg-danger'}`}>
                  {viewingClass.status ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
            {viewingClass.schedules?.length ? (
              <div className="col-span-2">
                <label className="text-muted">Schedules</label>
                <div className="mt-1">
                  {viewingClass.schedules.map((schedule, idx) => (
                    <div key={idx} className="mb-2 p-2 bg-light rounded">
                      <div className="font-semibold">
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                      {schedule.days?.length > 0 && (
                        <div className="text-xs text-muted">
                          Days: {schedule.days.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : viewingClass.startTime && viewingClass.endTime ? (
              <div>
                <label className="text-muted">Time</label>
                <p>
                  {viewingClass.startTime} - {viewingClass.endTime}
                </p>
              </div>
            ) : null}
            {viewingClass.schedule && (
              <div>
                <label className="text-muted">Schedule Date</label>
                <p>
                  {new Date(viewingClass.schedule).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}
          </div>
          {viewingClass.level && viewingClass.level.length > 0 && (
            <div>
              <label className="text-muted">Level</label>
              <div className="flex gap-2 mt-1">
                {viewingClass.level.map((level, index) => (
                  <span key={index} className="badge bg-info">
                    {level}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2 mt-4">
          {!hasActiveMeeting(viewingClass) ? (
            <button
              type="button"
              onClick={() => onStart(viewingClass._id!)}
              className="ti-btn ti-btn-success"
              aria-label={`Start ${viewingClass.title}`}
            >
              <i className="ri-play-line me-1" aria-hidden="true"></i>
              Start Class
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onJoin(viewingClass)}
                className="ti-btn ti-btn-success"
                aria-label={`Join ${viewingClass.title}`}
              >
                <i className="ri-video-chat-line me-1" aria-hidden="true"></i>
                Join Class
              </button>
              <button
                type="button"
                onClick={() => onEnd(viewingClass._id!)}
                className="ti-btn ti-btn-danger"
                aria-label={`End ${viewingClass.title}`}
              >
                <i className="ri-stop-circle-line me-1" aria-hidden="true"></i>
                End Class
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => onDelete(viewingClass._id!, viewingClass)}
            className="ti-btn ti-btn-danger"
            aria-label={`Delete ${viewingClass.title}`}
          >
            <i className="ri-delete-bin-line me-1" aria-hidden="true"></i>
            Delete
          </button>
          <button type="button" onClick={onClose} className="ti-btn ti-btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassViewModal;
