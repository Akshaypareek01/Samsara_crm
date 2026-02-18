"use client";

import React, { Fragment, useEffect, useState } from 'react';
import Seo from '@/shared/layout-components/seo/seo';
import UserService, { User, CreateUserRequest } from '@/services/userService';
import { hasPermission } from '@/shared/utils/permissionUtils';
import Swal from 'sweetalert2';

const Teachers = () => {
  const [adminUser, setAdminUser] = useState<any>(null);
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
    const userStr = localStorage.getItem('user');
    if (userStr) setAdminUser(JSON.parse(userStr));
  }, []);

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
        await UserService.deleteUser(teacherId);
        Swal.fire('Deleted!', 'Teacher has been deleted.', 'success');
        fetchTeachers();
      } catch (err: any) {
        Swal.fire('Error!', err.message || 'Failed to delete teacher', 'error');
      }
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
          <p className="font-semibold text-sm text-defaulttextcolor dark:text-defaulttextcolor/70 !mb-0">
            Teachers Management
          </p>
          <p className="font-normal text-[#8c9097] dark:text-white/50 text-xs">
            Manage all teachers in the system
          </p>
        </div>
        <div className="btn-list md:mt-0 mt-2">
          {hasPermission(adminUser, 'userManagement.teachers', 'create') && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="ti-btn bg-primary text-white btn-wave shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 !text-sm !py-2 !px-3 !rounded-md font-medium"
            >
              <i className="ri-add-line text-sm"></i>
              <span>Add Teacher</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger text-sm py-2" role="alert">
          {error}
        </div>
      )}

      <div className="box">
        <div className="box-body">
          <div className="mb-4">
            <input
              type="text"
              className="form-control text-sm py-1.5"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {loading ? (
            <div className="text-center py-4 text-sm">Loading...</div>
          ) : (
            <div className="table-responsive text-sm">
              <table className="table table-bordered table-hover whitespace-nowrap min-w-full text-sm">
                <thead>
                  <tr className="text-xs">
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
                      <td colSpan={8} className="text-center py-4 text-sm">
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
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleView(teacher)}
                              className="ti-btn ti-btn-sm ti-btn-info !text-xs !py-1 !px-1.5"
                              title="View Details"
                            >
                              <i className="ri-eye-line text-xs"></i>
                            </button>
                            {hasPermission(adminUser, 'userManagement.teachers', 'update') && (
                              <button
                                onClick={() => handleEdit(teacher)}
                                className="ti-btn ti-btn-sm ti-btn-primary !text-xs !py-1 !px-1.5"
                                title="Edit"
                              >
                                <i className="ri-edit-line text-xs"></i>
                              </button>
                            )}
                            {hasPermission(adminUser, 'userManagement.teachers', 'delete') && (
                              <button
                                onClick={() => handleDelete(teacher._id || teacher.id!)}
                                className="ti-btn ti-btn-sm ti-btn-danger !text-xs !py-1 !px-1.5"
                                title="Delete"
                              >
                                <i className="ri-delete-bin-line text-xs"></i>
                              </button>
                            )}
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
            <div className="flex items-center justify-between mt-4 text-sm">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="ti-btn ti-btn-sm !text-xs !py-1 !px-2"
              >
                Previous
              </button>
              <span className="text-xs">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="ti-btn ti-btn-sm !text-xs !py-1 !px-2"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit/Add teacher side drawer */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={handleCloseModal}
            aria-hidden="true"
          />
          <div
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-bodybg shadow-xl z-50 flex flex-col animate-slide-in-right"
            role="dialog"
            aria-labelledby="drawer-title"
          >
            <div className="flex items-center justify-between py-2 px-4 border-b border-defaultborder dark:border-white/10 shrink-0">
              <h3 id="drawer-title" className="text-base font-semibold">
                {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="ti-btn ti-btn-sm ti-btn-ghost !text-xs !p-1"
                aria-label="Close"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 text-sm">
              <form onSubmit={handleSubmit} className="h-full">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label text-xs">Name *</label>
                    <input
                      type="text"
                      className="form-control text-sm py-1.5"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Email *</label>
                    <input
                      type="email"
                      className="form-control text-sm py-1.5"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Mobile</label>
                    <input
                      type="tel"
                      className="form-control text-sm py-1.5"
                      value={formData.mobile}
                      onChange={(e) =>
                        setFormData({ ...formData, mobile: e.target.value })
                      }
                    />
                  </div>
                  {!editingTeacher && (
                    <div>
                      <label className="form-label text-xs">Password *</label>
                      <input
                        type="password"
                        className="form-control text-sm py-1.5"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required={!editingTeacher}
                      />
                    </div>
                  )}
                  <div>
                    <label className="form-label text-xs">Gender</label>
                    <select
                      className="form-control text-sm py-1.5"
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
                    <label className="form-label text-xs">Age</label>
                    <input
                      type="text"
                      className="form-control text-sm py-1.5"
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({ ...formData, age: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Teacher Category</label>
                    <input
                      type="text"
                      className="form-control text-sm py-1.5"
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
                    <label className="form-label text-xs">Teaching Experience</label>
                    <input
                      type="text"
                      className="form-control text-sm py-1.5"
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
                    <label className="form-label text-xs">About Me</label>
                    <textarea
                      className="form-control text-sm py-1.5"
                      rows={3}
                      value={formData.AboutMe}
                      onChange={(e) =>
                        setFormData({ ...formData, AboutMe: e.target.value })
                      }
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="form-label text-xs">Expertise</label>
                    <div className="flex flex-wrap gap-2 text-xs">
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
                    className="ti-btn ti-btn-sm ti-btn-secondary !text-xs !py-1.5 !px-2.5"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="ti-btn ti-btn-sm ti-btn-primary !text-xs !py-1.5 !px-2.5">
                    {editingTeacher ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* View teacher side drawer */}
      {showViewModal && viewingTeacher && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={handleCloseViewModal}
            aria-hidden="true"
          />
          <div
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-bodybg shadow-xl z-50 flex flex-col animate-slide-in-right"
            role="dialog"
            aria-labelledby="view-drawer-title"
          >
            <div className="flex items-center justify-between py-2 px-4 border-b border-defaultborder dark:border-white/10 shrink-0">
              <h3 id="view-drawer-title" className="text-base font-semibold">Teacher Details</h3>
              <button
                type="button"
                onClick={handleCloseViewModal}
                className="ti-btn ti-btn-sm ti-btn-ghost !text-xs !p-1"
                aria-label="Close"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 text-sm">
              {/* Profile block: avatar + name, email, status — full width, then data below */}
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-defaultborder dark:border-white/10">
                {viewingTeacher.profileImage ? (
                  <img
                    src={viewingTeacher.profileImage}
                    alt={viewingTeacher.name}
                    className="w-14 h-14 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-semibold text-xl">
                      {viewingTeacher.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-base truncate">{viewingTeacher.name}</h4>
                  <p className="text-muted text-xs truncate">{viewingTeacher.email}</p>
                  <span
                    className={`badge mt-1 text-xs ${
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
              {/* User data below */}
              <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-muted text-xs">Mobile</label>
                      <p className="font-medium text-sm">{viewingTeacher.mobile || '-'}</p>
                    </div>
                    <div>
                      <label className="text-muted text-xs">Gender</label>
                      <p className="font-medium text-sm">{viewingTeacher.gender || '-'}</p>
                    </div>
                    <div>
                      <label className="text-muted text-xs">Age</label>
                      <p className="font-medium text-sm">{viewingTeacher.age || '-'}</p>
                    </div>
                    <div>
                      <label className="text-muted text-xs">Teacher Category</label>
                      <p className="font-medium text-sm">{viewingTeacher.teacherCategory || '-'}</p>
                    </div>
                    <div>
                      <label className="text-muted text-xs">Teaching Experience</label>
                      <p className="font-medium text-sm">{viewingTeacher.teachingExperience || '-'}</p>
                    </div>
                    {viewingTeacher.AboutMe && (
                      <div className="col-span-2">
                        <label className="text-muted text-xs">About Me</label>
                        <p className="font-medium text-sm">{viewingTeacher.AboutMe}</p>
                      </div>
                    )}
                    {viewingTeacher.expertise && viewingTeacher.expertise.length > 0 && (
                      <div className="col-span-2">
                        <label className="text-muted text-xs">Expertise</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {viewingTeacher.expertise.map((exp, idx) => (
                            <span
                              key={idx}
                              className="badge bg-secondary/10 text-secondary text-xs"
                            >
                              {exp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {viewingTeacher.qualification && viewingTeacher.qualification.length > 0 && (
                      <div className="col-span-2">
                        <label className="text-muted text-xs">Qualifications</label>
                        <div className="mt-1 space-y-1">
                          {viewingTeacher.qualification.map((qual, idx) => (
                            <div key={idx} className="border border-defaultborder/10 rounded p-1.5 text-sm">
                              <p className="font-medium">{qual.degree}</p>
                              <p className="text-xs text-muted">{qual.institution}</p>
                              <p className="text-xs text-muted">Year: {qual.year}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {viewingTeacher.additional_courses && viewingTeacher.additional_courses.length > 0 && (
                      <div className="col-span-2">
                        <label className="text-muted text-xs">Additional Courses</label>
                        <div className="mt-1 space-y-1">
                          {viewingTeacher.additional_courses.map((course, idx) => (
                            <div key={idx} className="border border-defaultborder/10 rounded p-1.5 text-sm">
                              <p className="font-medium">{course.course}</p>
                              <p className="text-xs text-muted">{course.institution}</p>
                              <p className="text-xs text-muted">Year: {course.year}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {viewingTeacher.images && viewingTeacher.images.length > 0 && (
                      <div className="col-span-2">
                        <label className="text-muted text-xs">Additional Images</label>
                        <div className="grid grid-cols-4 gap-1 mt-1">
                          {viewingTeacher.images.map((img: any, idx: number) => (
                            <img
                              key={idx}
                              src={typeof img === 'string' ? img : img.url || img.path}
                              alt={`Image ${idx + 1}`}
                              className="w-full h-20 object-cover rounded"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
            </div>
          </div>
        </>
      )}
    </Fragment>
  );
};

export default Teachers;

