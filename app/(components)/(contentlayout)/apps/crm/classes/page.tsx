"use client";

import React, { Fragment, useEffect, useState } from 'react';
import Seo from '@/shared/layout-components/seo/seo';
import ClassService, { Class, CreateClassRequest } from '@/services/classService';
import Swal from 'sweetalert2';

const Classes = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingClass, setViewingClass] = useState<Class | null>(null);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [formData, setFormData] = useState<CreateClassRequest>({
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
    classCategory: '',
    duration: 60,
    maxCapacity: 20,
    schedules: [],
    perfectFor: [],
    skipIf: [],
    whatYoullGain: [],
  });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await ClassService.updateClass(editingClass._id!, formData);
        Swal.fire('Success!', 'Class updated successfully', 'success');
      } else {
        await ClassService.createClass(formData);
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

  const handleDelete = async (classId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await ClassService.deleteClass(classId);
        Swal.fire('Deleted!', 'Class has been deleted.', 'success');
        fetchClasses();
      } catch (err: any) {
        Swal.fire('Error!', err.message || 'Failed to delete class', 'error');
      }
    }
  };

  const handleStartClass = async (classId: string) => {
    try {
      await ClassService.startClass(classId);
      Swal.fire('Success!', 'Class started successfully', 'success');
      fetchClasses();
    } catch (err: any) {
      Swal.fire('Error!', err.message || 'Failed to start class', 'error');
    }
  };

  const handleEndClass = async (classId: string) => {
    const result = await Swal.fire({
      title: 'End Class?',
      text: 'Are you sure you want to end this class?',
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
        fetchClasses();
      } catch (err: any) {
        Swal.fire('Error!', err.message || 'Failed to end class', 'error');
      }
    }
  };

  const handleEndAllClasses = async () => {
    const result = await Swal.fire({
      title: 'End All Classes?',
      text: 'Are you sure you want to end all active classes?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, end all!',
    });

    if (result.isConfirmed) {
      try {
        const activeClasses = classes.filter(c => c.status);
        const promises = activeClasses.map(c => ClassService.endClass(c._id!));
        await Promise.all(promises);
        Swal.fire('Success!', 'All classes ended successfully', 'success');
        fetchClasses();
      } catch (err: any) {
        Swal.fire('Error!', err.message || 'Failed to end all classes', 'error');
      }
    }
  };

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem);
    // Handle teacher field - can be string (ID) or Teacher object
    const teacherId = typeof classItem.teacher === 'string' 
      ? classItem.teacher 
      : (classItem.teacher as any)?._id || (classItem.teacher as any)?.id || '';
    
    setFormData({
      title: classItem.title || '',
      description: classItem.description || '',
      password: classItem.password || '',
      meeting_number: classItem.meeting_number || '',
      teacher: teacherId,
      status: classItem.status ?? true,
      schedule: classItem.schedule || '',
      startTime: classItem.startTime || '',
      endTime: classItem.endTime || '',
      level: classItem.level || [],
      image: classItem.image || '',
      classType: classItem.classType || 'online',
      classCategory: classItem.classCategory || '',
      duration: classItem.duration || 60,
      maxCapacity: classItem.maxCapacity || 20,
      schedules: classItem.schedules || [],
      perfectFor: classItem.perfectFor || [],
      skipIf: classItem.skipIf || [],
      whatYoullGain: classItem.whatYoullGain || [],
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

  const resetForm = () => {
    setFormData({
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
      classCategory: '',
      duration: 60,
      maxCapacity: 20,
      schedules: [],
      perfectFor: [],
      skipIf: [],
      whatYoullGain: [],
    });
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
            onClick={() => setShowModal(true)}
            className="ti-btn bg-primary text-white btn-wave !font-medium !me-[0.45rem] !ms-0 !text-[0.85rem] !rounded-[0.35rem] !py-[0.51rem] !px-[0.86rem] shadow-none"
          >
            <i className="ri-add-line inline-block me-1"></i>Create Class
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

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
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
                  {filteredClasses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        No classes found
                      </td>
                    </tr>
                  ) : (
                    filteredClasses.map((classItem) => (
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
                        <td>
                          {classItem.teacher && typeof classItem.teacher === 'object' && 'name' in classItem.teacher
                            ? classItem.teacher.name
                            : typeof classItem.teacher === 'string'
                            ? (Array.isArray(teachers) 
                                ? (teachers.find(t => t._id === classItem.teacher)?.name || 'N/A')
                                : 'N/A')
                            : 'N/A'}
                        </td>
                        <td>
                          <span className={`badge ${classItem.classType === 'online' ? 'bg-primary' : 'bg-secondary'}`}>
                            {classItem.classType || 'N/A'}
                          </span>
                        </td>
                        <td>
                          {classItem.schedules && Array.isArray(classItem.schedules) && classItem.schedules.length > 0 ? (
                            <div>
                              {classItem.schedules.map((schedule: any, idx: number) => (
                                <div key={idx} className="text-sm">
                                  <div>{schedule.startTime} - {schedule.endTime}</div>
                                  {schedule.days && schedule.days.length > 0 && (
                                    <div className="text-xs text-muted">{schedule.days.join(', ')}</div>
                                  )}
                                </div>
                              ))}
                              {classItem.schedule && (
                                <div className="text-xs text-muted mt-1">
                                  {new Date(classItem.schedule).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>
                              )}
                            </div>
                          ) : classItem.startTime && classItem.endTime ? (
                            <div>
                              <div>{classItem.startTime} - {classItem.endTime}</div>
                              {classItem.schedule && (
                                <div className="text-xs text-muted">
                                  {new Date(classItem.schedule).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>
                              )}
                            </div>
                          ) : classItem.schedule ? (
                            <div className="text-sm">
                              {new Date(classItem.schedule).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>
                          <span className={`badge ${classItem.status ? 'bg-success' : 'bg-danger'}`}>
                            {classItem.status ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleView(classItem._id!)}
                              className="ti-btn ti-btn-sm ti-btn-info"
                              title="View"
                            >
                              <i className="ri-eye-line"></i>
                            </button>
                            <button
                              onClick={() => handleEdit(classItem)}
                              className="ti-btn ti-btn-sm ti-btn-warning"
                              title="Edit"
                            >
                              <i className="ri-pencil-line"></i>
                            </button>
                            {classItem.status ? (
                              <button
                                onClick={() => handleStartClass(classItem._id!)}
                                className="ti-btn ti-btn-sm ti-btn-success"
                                title="Start Class"
                              >
                                <i className="ri-play-line"></i>
                              </button>
                            ) : null}
                            <button
                              onClick={() => handleEndClass(classItem._id!)}
                              className="ti-btn ti-btn-sm ti-btn-danger"
                              title="End Class"
                            >
                              <i className="ri-stop-circle-line"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(classItem._id!)}
                              className="ti-btn ti-btn-sm ti-btn-danger"
                              title="Delete"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="ti-btn ti-btn-sm"
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="ti-btn ti-btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-bodybg rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingClass ? 'Edit Class' : 'Create New Class'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="ti-btn ti-btn-sm ti-btn-ghost"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Teacher</label>
                  <select
                    className="form-control"
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
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
                  <label className="form-label">Class Type</label>
                  <select
                    className="form-control"
                    value={formData.classType}
                    onChange={(e) => setFormData({ ...formData, classType: e.target.value as 'online' | 'offline' })}
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.classCategory}
                    onChange={(e) => setFormData({ ...formData, classCategory: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Duration (minutes)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="form-label">Max Capacity</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="form-label">Schedule Date</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Level</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Comma separated (e.g., Beginner, Intermediate)"
                    value={formData.level?.join(', ')}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value.split(',').map(l => l.trim()) })}
                  />
                </div>

                <div>
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={formData.status ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="ti-btn ti-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="ti-btn ti-btn-primary">
                  {editingClass ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-bodybg rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Class Details</h3>
              <button
                onClick={handleCloseViewModal}
                className="ti-btn ti-btn-sm ti-btn-ghost"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="space-y-4">
              {viewingClass.image && (
                <div>
                  <img src={viewingClass.image} alt={viewingClass.title} className="w-full h-48 object-cover rounded" />
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
                  <p>
                    {viewingClass.teacher && typeof viewingClass.teacher === 'object' && 'name' in viewingClass.teacher
                      ? viewingClass.teacher.name
                      : typeof viewingClass.teacher === 'string'
                      ? (Array.isArray(teachers) 
                          ? (teachers.find(t => t._id === viewingClass.teacher)?.name || 'N/A')
                          : 'N/A')
                      : 'N/A'}
                  </p>
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
                {viewingClass.schedules && Array.isArray(viewingClass.schedules) && viewingClass.schedules.length > 0 ? (
                  <div className="col-span-2">
                    <label className="text-muted">Schedules</label>
                    <div className="mt-1">
                      {viewingClass.schedules.map((schedule: any, idx: number) => (
                        <div key={idx} className="mb-2 p-2 bg-light rounded">
                          <div className="font-semibold">{schedule.startTime} - {schedule.endTime}</div>
                          {schedule.days && schedule.days.length > 0 && (
                            <div className="text-xs text-muted">Days: {schedule.days.join(', ')}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : viewingClass.startTime && viewingClass.endTime ? (
                  <div>
                    <label className="text-muted">Time</label>
                    <p>{viewingClass.startTime} - {viewingClass.endTime}</p>
                  </div>
                ) : null}
                {viewingClass.schedule && (
                  <div>
                    <label className="text-muted">Schedule Date</label>
                    <p>{new Date(viewingClass.schedule).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                )}
              </div>
              {viewingClass.level && viewingClass.level.length > 0 && (
                <div>
                  <label className="text-muted">Level</label>
                  <div className="flex gap-2 mt-1">
                    {viewingClass.level.map((l, i) => (
                      <span key={i} className="badge bg-info">{l}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={handleCloseViewModal}
                className="ti-btn ti-btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default Classes;

