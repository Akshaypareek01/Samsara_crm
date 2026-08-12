"use client";

import React, { Fragment, useEffect, useState } from 'react';
import Seo from '@/shared/layout-components/seo/seo';
import ClassService, { Class, CreateClassRequest, Teacher, hasActiveMeeting } from '@/services/classService';
import Swal from 'sweetalert2';
import ClassFormModal from './ClassFormModal';
import ClassesTable from './ClassesTable';
import ClassViewModal from './ClassViewModal';
import { buildClassPayload, toDateTimeLocalValue, toTimeInputValue } from './classFormUtils';

const emptyClassForm = (): CreateClassRequest => ({
  title: '',
  description: '',
  password: '',
  meeting_number: '',
  teacher: '',
  status: true,
  schedule: '',
  startTime: '',
  endTime: '',
  level: [],
  image: '',
  classType: 'online',
  classCategory: 'yoga class',
  duration: 60,
  maxCapacity: 20,
  schedules: [{ date: '', days: [], startTime: '', endTime: '' }],
  perfectFor: [],
  skipIf: [],
  whatYoullGain: [],
  latitude: undefined,
  longitude: undefined,
});

const Classes = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingClass, setViewingClass] = useState<Class | null>(null);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [formData, setFormData] = useState<CreateClassRequest>(emptyClassForm());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, [page, searchTerm]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await ClassService.getAllClasses({
        page,
        limit: 10,
        sortBy: 'createdAt:desc',
      });
      
      // Handle different response structures
      let classesArray: Class[] = [];
      if (Array.isArray(response)) {
        classesArray = response;
      } else if (response && typeof response === 'object' && !Array.isArray(response)) {
        if (Array.isArray(response.classes)) {
          classesArray = response.classes;
        } else if (Array.isArray(response.data)) {
          classesArray = response.data;
        } else if (Array.isArray(response.results)) {
          classesArray = response.results;
        }
      }
      
      setClasses(classesArray);
      
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        if (response.totalPages) {
          setTotalPages(response.totalPages);
        } else if (response.total) {
          setTotalPages(Math.ceil(response.total / 10));
        } else if (response.data && Array.isArray(response.data)) {
          // If no pagination info, assume single page
          setTotalPages(1);
        }
      }
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch classes');
      console.error('Error fetching classes:', err);
      setClasses([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await ClassService.getAllTeachers();
      
      // getAllTeachers() already handles response conversion and returns an array
      const teachersArray = Array.isArray(response) ? response : [];
      
      setTeachers(teachersArray);
    } catch (err: any) {
      console.error('Error fetching teachers:', err);
      setTeachers([]); // Ensure it's always an array
    }
  };

  /**
   * Creates or updates a class using the backend-aligned payload.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teacher) {
      Swal.fire('Error!', 'Please select a teacher', 'error');
      return;
    }
    if (!formData.level?.length) {
      Swal.fire('Error!', 'Please select at least one level', 'error');
      return;
    }
    if (!formData.classCategory) {
      Swal.fire('Error!', 'Please select a class category', 'error');
      return;
    }
    if (!formData.schedule && !formData.schedules?.[0]?.date) {
      Swal.fire('Error!', 'Please select a schedule date', 'error');
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      Swal.fire('Error!', 'Please set start and end time', 'error');
      return;
    }
    if (formData.classType === 'offline') {
      const lat = Number(formData.latitude);
      const lng = Number(formData.longitude);
      if (
        formData.latitude === undefined ||
        formData.longitude === undefined ||
        Number.isNaN(lat) ||
        Number.isNaN(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        Swal.fire('Error!', 'Offline classes require valid latitude and longitude', 'error');
        return;
      }
    }

    try {
      const payload = buildClassPayload(formData);
      if (editingClass) {
        await ClassService.updateClass(editingClass._id!, payload);
        Swal.fire('Success!', 'Class updated successfully', 'success');
      } else {
        await ClassService.createClass(payload);
        Swal.fire('Success!', 'Class created successfully', 'success');
      }
      setShowModal(false);
      setEditingClass(null);
      resetForm();
      fetchClasses();
    } catch (err: any) {
      Swal.fire('Error!', err.message || 'Failed to save class', 'error');
    }
  };

  /**
   * Deletes a class after confirming; backend ends Zoom first when live.
   * @param classId - Class document id
   * @param classItem - Optional class row for meeting-aware copy
   */
  const handleDelete = async (classId: string, classItem?: Class) => {
    const isLive = classItem ? hasActiveMeeting(classItem) : false;
    const result = await Swal.fire({
      title: 'Delete class?',
      text: isLive
        ? 'This will end the Zoom meeting first, then permanently delete the class.'
        : "This permanently deletes the class. You won't be able to revert this.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: isLive ? 'End Zoom & delete' : 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await ClassService.deleteClass(classId);
        if (viewingClass?._id === classId) {
          handleCloseViewModal();
        }
        Swal.fire(
          'Deleted!',
          isLive ? 'Zoom meeting ended and class deleted.' : 'Class has been deleted.',
          'success'
        );
        fetchClasses();
      } catch (err: any) {
        Swal.fire('Error!', err.message || 'Failed to delete class', 'error');
      }
    }
  };

  /**
   * Starts a Zoom meeting for the class.
   * @param classId - Class document id
   */
  const handleStartClass = async (classId: string) => {
    try {
      await ClassService.startClass(classId);
      Swal.fire('Success!', 'Class started successfully', 'success');
      await fetchClasses();
      if (viewingClass?._id === classId) {
        const updated = await ClassService.getClassById(classId);
        setViewingClass(updated);
      }
    } catch (err: any) {
      Swal.fire('Error!', err.message || 'Failed to start class', 'error');
    }
  };

  /**
   * Opens Meeting SDK host join in a new browser tab (CRM admin = Zoom host).
   * @param classItem - Class with an active meeting
   */
  const handleJoinClass = async (classItem: Class) => {
    if (!classItem._id || !hasActiveMeeting(classItem)) {
      Swal.fire('Error!', 'No active Zoom meeting for this class', 'error');
      return;
    }
    try {
      const joinUrl = await ClassService.getBrowserJoinUrl(classItem._id, true, 'Admin');
      const opened = window.open(joinUrl, '_blank', 'noopener,noreferrer');
      if (!opened) {
        Swal.fire(
          'Popup blocked',
          'Allow popups for this site, then click Join again to open the host meeting.',
          'warning'
        );
      }
    } catch (error: any) {
      Swal.fire('Error!', error?.message || 'Failed to open meeting', 'error');
    }
  };

  /**
   * Ends the live Zoom meeting for a class.
   * @param classId - Class document id
   */
  const handleEndClass = async (classId: string) => {
    const result = await Swal.fire({
      title: 'End Class?',
      text: 'Are you sure you want to end this Zoom meeting?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, end it!',
    });

    if (result.isConfirmed) {
      try {
        await ClassService.endClass(classId);
        Swal.fire('Success!', 'Class ended successfully', 'success');
        await fetchClasses();
        if (viewingClass?._id === classId) {
          const updated = await ClassService.getClassById(classId);
          setViewingClass(updated);
        }
      } catch (err: any) {
        Swal.fire('Error!', err.message || 'Failed to end class', 'error');
      }
    }
  };

  /**
   * Ends every class that currently has a Zoom meeting id.
   */
  const handleEndAllClasses = async () => {
    const liveClasses = classes.filter((c) => hasActiveMeeting(c));
    if (liveClasses.length === 0) {
      Swal.fire('Info', 'No live Zoom meetings to end.', 'info');
      return;
    }

    const result = await Swal.fire({
      title: 'End All Classes?',
      text: `End ${liveClasses.length} live Zoom meeting(s)?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, end all!',
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(liveClasses.map((c) => ClassService.endClass(c._id!)));
        Swal.fire('Success!', 'All live classes ended successfully', 'success');
        fetchClasses();
      } catch (err: any) {
        Swal.fire('Error!', err.message || 'Failed to end all classes', 'error');
      }
    }
  };

  /**
   * Opens the edit modal with class fields mapped into the form.
   * @param classItem - Existing class document
   */
  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem);
    const teacherId =
      typeof classItem.teacher === 'string'
        ? classItem.teacher
        : classItem.teacher?._id || '';

    const firstSchedule = classItem.schedules?.[0];
    const scheduleSource = firstSchedule?.date || classItem.schedule || '';
    const startTime = toTimeInputValue(firstSchedule?.startTime || classItem.startTime || '');
    const endTime = toTimeInputValue(firstSchedule?.endTime || classItem.endTime || '');

    setFormData({
      title: classItem.title || '',
      description: classItem.description || '',
      password: classItem.password || '',
      meeting_number: classItem.meeting_number || '',
      teacher: teacherId,
      status: classItem.status ?? true,
      schedule: toDateTimeLocalValue(scheduleSource),
      startTime,
      endTime,
      level: Array.isArray(classItem.level) ? classItem.level : [],
      image: classItem.image || '',
      classType: classItem.classType || 'online',
      classCategory: classItem.classCategory || 'yoga class',
      duration: classItem.duration || 60,
      maxCapacity: classItem.maxCapacity || 20,
      schedules: [
        {
          date: scheduleSource,
          days: firstSchedule?.days || [],
          startTime,
          endTime,
        },
      ],
      perfectFor: classItem.perfectFor || [],
      skipIf: classItem.skipIf || [],
      whatYoullGain: classItem.whatYoullGain || [],
      latitude: classItem.latitude,
      longitude: classItem.longitude,
    });
    setShowModal(true);
  };

  const handleView = async (classId: string) => {
    try {
      const classData = await ClassService.getClassById(classId);
      setViewingClass(classData);
      setShowViewModal(true);
    } catch (err: any) {
      Swal.fire('Error!', err.message || 'Failed to fetch class details', 'error');
    }
  };

  /** Resets create/edit form state. */
  const resetForm = () => {
    setFormData(emptyClassForm());
    setEditingClass(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClass(null);
    resetForm();
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingClass(null);
  };

  const filteredClasses = Array.isArray(classes) 
    ? classes.filter((classItem) =>
        classItem.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classItem.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <Fragment>
      <Seo title="Class Management" />
      
      <div className="md:flex block items-center justify-between my-[1.5rem] page-header-breadcrumb">
        <div>
          <p className="font-semibold text-[1.125rem] text-defaulttextcolor dark:text-defaulttextcolor/70 !mb-0">
            Class Management
          </p>
          <p className="font-normal text-[#8c9097] dark:text-white/50 text-[0.813rem]">
            Manage all classes in the system
          </p>
        </div>
        <div className="btn-list md:mt-0 mt-2">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="ti-btn bg-primary text-white btn-wave !font-medium !me-[0.45rem] !ms-0 !text-[0.85rem] !rounded-[0.35rem] !py-[0.51rem] !px-[0.86rem] shadow-none"
            aria-label="Create class"
          >
            <i className="ri-add-line inline-block me-1" aria-hidden="true"></i>Create Class
          </button>
          <button
            type="button"
            onClick={handleEndAllClasses}
            className="ti-btn bg-danger text-white btn-wave !font-medium !me-[0.45rem] !ms-0 !text-[0.85rem] !rounded-[0.35rem] !py-[0.51rem] !px-[0.86rem] shadow-none"
          >
            <i className="ri-stop-circle-line inline-block me-1"></i>End All Classes
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="box">
        <div className="box-body">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>

          <ClassesTable
            loading={loading}
            classes={filteredClasses}
            teachers={teachers}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onView={handleView}
            onEdit={handleEdit}
            onStart={handleStartClass}
            onJoin={handleJoinClass}
            onEnd={handleEndClass}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {showModal && (
        <ClassFormModal
          editingClass={Boolean(editingClass)}
          formData={formData}
          teachers={teachers}
          onChange={setFormData}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
        />
      )}

      {showViewModal && viewingClass && (
        <ClassViewModal
          viewingClass={viewingClass}
          teachers={teachers}
          onClose={handleCloseViewModal}
          onStart={handleStartClass}
          onJoin={handleJoinClass}
          onEnd={handleEndClass}
          onDelete={handleDelete}
        />
      )}
    </Fragment>
  );
};

export default Classes;

