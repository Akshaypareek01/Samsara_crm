'use client';

import React from 'react';
import { Class, Teacher, hasActiveMeeting } from '@/services/classService';

interface ClassesTableProps {
  loading: boolean;
  classes: Class[];
  teachers: Teacher[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (classId: string) => void;
  onEdit: (classItem: Class) => void;
  onStart: (classId: string) => void;
  onJoin: (classItem: Class) => void;
  onEnd: (classId: string) => void;
  onDelete: (classId: string, classItem: Class) => void;
}

/**
 * Resolves a teacher display name from a populated or id teacher field.
 */
function getTeacherName(classItem: Class, teachers: Teacher[]): string {
  if (classItem.teacher && typeof classItem.teacher === 'object' && 'name' in classItem.teacher) {
    return classItem.teacher.name;
  }
  if (typeof classItem.teacher === 'string') {
    return teachers.find((t) => t._id === classItem.teacher)?.name || 'N/A';
  }
  return 'N/A';
}

/**
 * Renders schedule summary for a class row.
 */
function ScheduleCell({ classItem }: { classItem: Class }) {
  if (classItem.schedules?.length) {
    return (
      <div>
        {classItem.schedules.map((schedule, idx) => (
          <div key={idx} className="text-sm">
            <div>
              {schedule.startTime} - {schedule.endTime}
            </div>
            {schedule.days?.length > 0 && (
              <div className="text-xs text-muted">{schedule.days.join(', ')}</div>
            )}
          </div>
        ))}
        {classItem.schedule && (
          <div className="text-xs text-muted mt-1">
            {new Date(classItem.schedule).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        )}
      </div>
    );
  }

  if (classItem.startTime && classItem.endTime) {
    return (
      <div>
        <div>
          {classItem.startTime} - {classItem.endTime}
        </div>
        {classItem.schedule && (
          <div className="text-xs text-muted">
            {new Date(classItem.schedule).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        )}
      </div>
    );
  }

  if (classItem.schedule) {
    return (
      <div className="text-sm">
        {new Date(classItem.schedule).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    );
  }

  return <>N/A</>;
}

/**
 * Classes list table with pagination and row actions.
 */
const ClassesTable: React.FC<ClassesTableProps> = ({
  loading,
  classes,
  teachers,
  page,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onStart,
  onJoin,
  onEnd,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover table-bordered whitespace-nowrap">
          <thead>
            <tr>
              <th>Title</th>
              <th>Teacher</th>
              <th>Type</th>
              <th>Schedule</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  No classes found
                </td>
              </tr>
            ) : (
              classes.map((classItem) => (
                <tr key={classItem._id}>
                  <td>
                    <div className="flex items-center">
                      {classItem.image && (
                        <img
                          src={classItem.image}
                          alt={classItem.title}
                          className="w-10 h-10 rounded me-2"
                        />
                      )}
                      <div>
                        <div className="font-semibold">{classItem.title}</div>
                        {classItem.description && (
                          <div className="text-xs text-muted">
                            {classItem.description.substring(0, 50)}...
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{getTeacherName(classItem, teachers)}</td>
                  <td>
                    <span
                      className={`badge ${
                        classItem.classType === 'online' ? 'bg-primary' : 'bg-secondary'
                      }`}
                    >
                      {classItem.classType || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <ScheduleCell classItem={classItem} />
                  </td>
                  <td>
                    {hasActiveMeeting(classItem) ? (
                      <span className="badge bg-success" aria-label="Live meeting">
                        Live
                      </span>
                    ) : (
                      <span
                        className={`badge ${classItem.status ? 'bg-primary/80' : 'bg-danger'}`}
                        aria-label={classItem.status ? 'Active' : 'Inactive'}
                      >
                        {classItem.status ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </td>
                  <td>
                    <div
                      className="flex flex-wrap gap-2"
                      role="group"
                      aria-label={`Actions for ${classItem.title}`}
                    >
                      <button
                        type="button"
                        onClick={() => onView(classItem._id!)}
                        className="ti-btn ti-btn-sm ti-btn-info"
                        title="View"
                        aria-label={`View ${classItem.title}`}
                      >
                        <i className="ri-eye-line" aria-hidden="true"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(classItem)}
                        className="ti-btn ti-btn-sm ti-btn-warning"
                        title="Edit"
                        aria-label={`Edit ${classItem.title}`}
                      >
                        <i className="ri-pencil-line" aria-hidden="true"></i>
                      </button>
                      {!hasActiveMeeting(classItem) ? (
                        <button
                          type="button"
                          onClick={() => onStart(classItem._id!)}
                          className="ti-btn ti-btn-sm ti-btn-success"
                          title="Start Class"
                          aria-label={`Start ${classItem.title}`}
                        >
                          <i className="ri-play-line" aria-hidden="true"></i>
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => onJoin(classItem)}
                            className="ti-btn ti-btn-sm ti-btn-success"
                            title="Join Class"
                            aria-label={`Join ${classItem.title}`}
                          >
                            <i className="ri-video-chat-line" aria-hidden="true"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => onEnd(classItem._id!)}
                            className="ti-btn ti-btn-sm ti-btn-danger"
                            title="End Class"
                            aria-label={`End ${classItem.title}`}
                          >
                            <i className="ri-stop-circle-line" aria-hidden="true"></i>
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => onDelete(classItem._id!, classItem)}
                        className="ti-btn ti-btn-sm ti-btn-danger"
                        title="Delete"
                        aria-label={`Delete ${classItem.title}`}
                      >
                        <i className="ri-delete-bin-line" aria-hidden="true"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="ti-btn ti-btn-sm"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="ti-btn ti-btn-sm"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
};

export default ClassesTable;
