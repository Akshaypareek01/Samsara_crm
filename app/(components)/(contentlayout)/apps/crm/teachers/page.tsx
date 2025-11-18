"use client";

import React, { Fragment, useEffect, useState } from 'react';
import Seo from '@/shared/layout-components/seo/seo';
import UserService, { User, CreateUserRequest } from '@/services/userService';

const Teachers = () => {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingTeacher, setViewingTeacher] = useState<User | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserRequest & {
    teacherCategory?: string;
    teachingExperience?: string;
    expertise?: string[];
    mobile?: string;
    gender?: string;
    age?: string;
    AboutMe?: string;
    qualification?: Array<{
      degree: string;
      institution: string;
      year: string;
    }>;
    additional_courses?: Array<{
      course: string;
      institution: string;
      year: string;
    }>;
  }>({
    name: '',
    email: '',
    password: '',
    role: 'teacher',
    teacherCategory: '',
    teachingExperience: '',
    expertise: [],
    mobile: '',
    gender: '',
    age: '',
    AboutMe: '',
    qualification: [],
    additional_courses: [],
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, [page, searchTerm]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const params: any = {
        role: 'teacher',
        page,
        limit: 10,
        sortBy: 'name:asc',
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await UserService.getAllTeachers(params);
      
      // Service now handles response normalization, so response.data is always an array
      setTeachers(response.data || []);
      setTotalPages(response.totalPages || 1);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch teachers');
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        const teacherId = editingTeacher._id || editingTeacher.id;
        if (!teacherId) {
          setError('Teacher ID not found');
          return;
        }
        await UserService.updateUser(teacherId, formData);
      } else {
        await UserService.createUser(formData);
      }
      setShowModal(false);
      setEditingTeacher(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'teacher',
        teacherCategory: '',
        teachingExperience: '',
        expertise: [],
        mobile: '',
        gender: '',
        age: '',
        AboutMe: '',
        qualification: [],
        additional_courses: [],
      });
      fetchTeachers();
    } catch (err: any) {
      setError(err.message || 'Failed to save teacher');
    }
  };

  const handleView = (teacher: User) => {
    setViewingTeacher(teacher);
    setShowViewModal(true);
  };

  const handleEdit = (teacher: User) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      password: '',
      role: 'teacher',
      teacherCategory: teacher.teacherCategory || '',
      teachingExperience: teacher.teachingExperience || '',
      expertise: teacher.expertise || [],
      mobile: teacher.mobile || '',
      gender: teacher.gender || '',
      age: teacher.age || '',
      AboutMe: teacher.AboutMe || '',
      qualification: teacher.qualification || [],
      additional_courses: teacher.additional_courses || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (teacherId: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    
    try {
      await UserService.deleteUser(teacherId);
      fetchTeachers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete teacher');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTeacher(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'teacher',
      teacherCategory: '',
      teachingExperience: '',
      expertise: [],
      mobile: '',
      gender: '',
      age: '',
      AboutMe: '',
      qualification: [],
      additional_courses: [],
    });
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingTeacher(null);
  };

  const handleExpertiseChange = (value: string) => {
    const current = formData.expertise || [];
    if (current.includes(value)) {
      setFormData({
        ...formData,
        expertise: current.filter((e) => e !== value),
      });
    } else {
      setFormData({ ...formData, expertise: [...current, value] });
    }
  };

  return (
    <Fragment>
      <Seo title="Teachers Management" />
      
      <div className="md:flex block items-center justify-between my-[1.5rem] page-header-breadcrumb">
        <div>
          <p className="font-semibold text-[1.125rem] text-defaulttextcolor dark:text-defaulttextcolor/70 !mb-0">
            Teachers Management
          </p>
          <p className="font-normal text-[#8c9097] dark:text-white/50 text-[0.813rem]">
            Manage all teachers in the system
          </p>
        </div>
        <div className="btn-list md:mt-0 mt-2">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="ti-btn bg-primary text-white btn-wave !font-medium !me-[0.45rem] !ms-0 !text-[0.85rem] !rounded-[0.35rem] !py-[0.51rem] !px-[0.86rem] shadow-none"
          >
            <i className="ri-add-line inline-block me-1"></i>Add Teacher
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
              className="form-control"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover whitespace-nowrap min-w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Category</th>
                    <th>Experience</th>
                    <th>Expertise</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4">
                        No teachers found
                      </td>
                    </tr>
                  ) : (
                    teachers.map((teacher) => (
                      <tr key={teacher._id || teacher.id}>
                        <td>
                          <div className="flex items-center">
                            {teacher.profileImage ? (
                              <img
                                src={teacher.profileImage}
                                alt={teacher.name}
                                className="w-10 h-10 rounded-full me-2"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center me-2">
                                <span className="text-primary font-semibold">
                                  {teacher.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span className="font-semibold">{teacher.name}</span>
                          </div>
                        </td>
                        <td>{teacher.email}</td>
                        <td>{teacher.mobile || '-'}</td>
                        <td>
                          <span className="badge bg-info/10 text-info">
                            {teacher.teacherCategory || '-'}
                          </span>
                        </td>
                        <td>{teacher.teachingExperience || '-'}</td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            {teacher.expertise?.slice(0, 2).map((exp, idx) => (
                              <span
                                key={idx}
                                className="badge bg-secondary/10 text-secondary text-xs"
                              >
                                {exp}
                              </span>
                            ))}
                            {teacher.expertise && teacher.expertise.length > 2 && (
                              <span className="badge bg-secondary/10 text-secondary text-xs">
                                +{teacher.expertise.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              (teacher.active !== false && teacher.status !== false) || teacher.isActive !== false
                                ? 'bg-success/10 text-success'
                                : 'bg-danger/10 text-danger'
                            }`}
                          >
                            {(teacher.active !== false && teacher.status !== false) || teacher.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(teacher)}
                              className="ti-btn ti-btn-sm ti-btn-info"
                              title="View Details"
                            >
                              <i className="ri-eye-line"></i>
                            </button>
                            <button
                              onClick={() => handleEdit(teacher)}
                              className="ti-btn ti-btn-sm ti-btn-primary"
                              title="Edit"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(teacher._id || teacher.id!)}
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
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="ti-btn ti-btn-sm"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="ti-btn ti-btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-bodybg rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
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
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Mobile</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData({ ...formData, mobile: e.target.value })
                    }
                  />
                </div>
                {!editingTeacher && (
                  <div>
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required={!editingTeacher}
                    />
                  </div>
                )}
                <div>
                  <label className="form-label">Gender</label>
                  <select
                    className="form-control"
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Age</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Teacher Category</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.teacherCategory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        teacherCategory: e.target.value,
                      })
                    }
                    placeholder="e.g., Yoga Trainer, Fitness Coach"
                  />
                </div>
                <div>
                  <label className="form-label">Teaching Experience</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.teachingExperience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        teachingExperience: e.target.value,
                      })
                    }
                    placeholder="e.g., 5 years"
                  />
                </div>
                <div className="col-span-2">
                  <label className="form-label">About Me</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.AboutMe}
                    onChange={(e) =>
                      setFormData({ ...formData, AboutMe: e.target.value })
                    }
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Expertise</label>
                  <div className="flex flex-wrap gap-2">
                    {['Hatha Yoga', 'Vinyasa', 'Ashtanga', 'Yin Yoga', 'Power Yoga', 'Meditation', 'Restorative Yoga', 'Kids Yoga'].map(
                      (exp) => (
                        <label key={exp} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.expertise?.includes(exp)}
                            onChange={() => handleExpertiseChange(exp)}
                            className="me-2"
                          />
                          {exp}
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="ti-btn ti-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="ti-btn ti-btn-primary">
                  {editingTeacher ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && viewingTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-bodybg rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Teacher Details</h3>
              <button
                onClick={handleCloseViewModal}
                className="ti-btn ti-btn-sm ti-btn-ghost"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-4">
                <div className="text-center">
                  {viewingTeacher.profileImage ? (
                    <img
                      src={viewingTeacher.profileImage}
                      alt={viewingTeacher.name}
                      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-semibold text-4xl">
                        {viewingTeacher.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <h4 className="font-semibold text-lg">{viewingTeacher.name}</h4>
                  <p className="text-muted">{viewingTeacher.email}</p>
                  <span
                    className={`badge mt-2 ${
                      (viewingTeacher.active !== false && viewingTeacher.status !== false) || viewingTeacher.isActive !== false
                        ? 'bg-success/10 text-success'
                        : 'bg-danger/10 text-danger'
                    }`}
                  >
                    {(viewingTeacher.active !== false && viewingTeacher.status !== false) || viewingTeacher.isActive !== false
                      ? 'Active'
                      : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="col-span-12 md:col-span-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-muted text-sm">Mobile</label>
                    <p className="font-medium">{viewingTeacher.mobile || '-'}</p>
                  </div>
                  <div>
                    <label className="text-muted text-sm">Gender</label>
                    <p className="font-medium">{viewingTeacher.gender || '-'}</p>
                  </div>
                  <div>
                    <label className="text-muted text-sm">Age</label>
                    <p className="font-medium">{viewingTeacher.age || '-'}</p>
                  </div>
                  <div>
                    <label className="text-muted text-sm">Teacher Category</label>
                    <p className="font-medium">
                      {viewingTeacher.teacherCategory || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-muted text-sm">Teaching Experience</label>
                    <p className="font-medium">
                      {viewingTeacher.teachingExperience || '-'}
                    </p>
                  </div>
                  {viewingTeacher.AboutMe && (
                    <div className="col-span-2">
                      <label className="text-muted text-sm">About Me</label>
                      <p className="font-medium">{viewingTeacher.AboutMe}</p>
                    </div>
                  )}
                  {viewingTeacher.expertise && viewingTeacher.expertise.length > 0 && (
                    <div className="col-span-2">
                      <label className="text-muted text-sm">Expertise</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {viewingTeacher.expertise.map((exp, idx) => (
                          <span
                            key={idx}
                            className="badge bg-secondary/10 text-secondary"
                          >
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {viewingTeacher.qualification && viewingTeacher.qualification.length > 0 && (
                    <div className="col-span-2">
                      <label className="text-muted text-sm">Qualifications</label>
                      <div className="mt-2 space-y-2">
                        {viewingTeacher.qualification.map((qual, idx) => (
                          <div key={idx} className="border border-defaultborder/10 rounded p-2">
                            <p className="font-medium">{qual.degree}</p>
                            <p className="text-sm text-muted">{qual.institution}</p>
                            <p className="text-sm text-muted">Year: {qual.year}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {viewingTeacher.additional_courses && viewingTeacher.additional_courses.length > 0 && (
                    <div className="col-span-2">
                      <label className="text-muted text-sm">Additional Courses</label>
                      <div className="mt-2 space-y-2">
                        {viewingTeacher.additional_courses.map((course, idx) => (
                          <div key={idx} className="border border-defaultborder/10 rounded p-2">
                            <p className="font-medium">{course.course}</p>
                            <p className="text-sm text-muted">{course.institution}</p>
                            <p className="text-sm text-muted">Year: {course.year}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {viewingTeacher.images && viewingTeacher.images.length > 0 && (
                    <div className="col-span-2">
                      <label className="text-muted text-sm">Additional Images</label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {viewingTeacher.images.map((img: any, idx: number) => (
                          <img
                            key={idx}
                            src={typeof img === 'string' ? img : img.url || img.path}
                            alt={`Image ${idx + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default Teachers;

