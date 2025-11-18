"use client";

import React, { Fragment, useEffect, useState } from 'react';
import Seo from '@/shared/layout-components/seo/seo';
import UserService, { User, CreateUserRequest } from '@/services/userService';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserRequest & {
    mobile?: string;
    gender?: string;
    age?: string;
    height?: string;
    weight?: string;
    targetWeight?: string;
    bodyshape?: string;
    userCategory?: 'Personal' | 'Corporate';
    practicetime?: string;
    focusarea?: string[];
    goal?: string[];
    PriorExperience?: string;
    Address?: string;
    city?: string;
    pincode?: string;
    country?: string;
  }>({
    name: '',
    email: '',
    password: '',
    role: 'user',
    mobile: '',
    gender: '',
    age: '',
    height: '',
    weight: '',
    targetWeight: '',
    bodyshape: '',
    userCategory: 'Personal',
    practicetime: '',
    focusarea: [],
    goal: [],
    PriorExperience: '',
    Address: '',
    city: '',
    pincode: '',
    country: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        role: 'user',
        page,
        limit: 10,
        sortBy: 'name:asc',
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await UserService.getAllUsers(params);
      
      // Service now handles response normalization, so response.data is always an array
      setUsers(response.data || []);
      setTotalPages(response.totalPages || 1);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const userId = editingUser._id || editingUser.id;
        if (!userId) {
          setError('User ID not found');
          return;
        }
        await UserService.updateUser(userId, formData);
      } else {
        await UserService.createUser(formData);
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        mobile: '',
        gender: '',
        age: '',
        height: '',
        weight: '',
        targetWeight: '',
        bodyshape: '',
        userCategory: 'Personal',
        practicetime: '',
        focusarea: [],
        goal: [],
        PriorExperience: '',
        Address: '',
        city: '',
        pincode: '',
        country: '',
      });
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to save user');
    }
  };

  const handleView = (user: User) => {
    setViewingUser(user);
    setShowViewModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role as 'user' | 'teacher',
      mobile: user.mobile || '',
      gender: user.gender || '',
      age: user.age || '',
      height: user.height || '',
      weight: user.weight || '',
      targetWeight: user.targetWeight || '',
      bodyshape: user.bodyshape || '',
      userCategory: user.userCategory || 'Personal',
      practicetime: user.practicetime || '',
      focusarea: user.focusarea || [],
      goal: user.goal || [],
      PriorExperience: user.PriorExperience || '',
      Address: user.Address || '',
      city: user.city || '',
      pincode: user.pincode || '',
      country: user.country || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await UserService.deleteUser(userId);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      mobile: '',
      gender: '',
      age: '',
      height: '',
      weight: '',
      targetWeight: '',
      bodyshape: '',
      userCategory: 'Personal',
      practicetime: '',
      focusarea: [],
      goal: [],
      PriorExperience: '',
      Address: '',
      city: '',
      pincode: '',
      country: '',
    });
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingUser(null);
  };

  return (
    <Fragment>
      <Seo title="Users Management" />
      
      <div className="md:flex block items-center justify-between my-[1.5rem] page-header-breadcrumb">
        <div>
          <p className="font-semibold text-[1.125rem] text-defaulttextcolor dark:text-defaulttextcolor/70 !mb-0">
            Users Management
          </p>
          <p className="font-normal text-[#8c9097] dark:text-white/50 text-[0.813rem]">
            Manage all users in the system
          </p>
        </div>
        <div className="btn-list md:mt-0 mt-2">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="ti-btn bg-primary text-white btn-wave !font-medium !me-[0.45rem] !ms-0 !text-[0.85rem] !rounded-[0.35rem] !py-[0.51rem] !px-[0.86rem] shadow-none"
          >
            <i className="ri-add-line inline-block me-1"></i>Add User
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
              placeholder="Search users..."
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
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id || user.id}>
                        <td>
                          <div className="flex items-center">
                            {user.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt={user.name}
                                className="w-10 h-10 rounded-full me-2"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center me-2">
                                <span className="text-primary font-semibold">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span className="font-semibold">{user.name}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.mobile || '-'}</td>
                        <td>
                          <span className="badge bg-primary/10 text-primary">
                            {user.userCategory || 'Personal'}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              (user.active !== false && user.status !== false) || user.isActive !== false
                                ? 'bg-success/10 text-success'
                                : 'bg-danger/10 text-danger'
                            }`}
                          >
                            {(user.active !== false && user.status !== false) || user.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(user)}
                              className="ti-btn ti-btn-sm ti-btn-info"
                              title="View Details"
                            >
                              <i className="ri-eye-line"></i>
                            </button>
                            <button
                              onClick={() => handleEdit(user)}
                              className="ti-btn ti-btn-sm ti-btn-primary"
                              title="Edit"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(user._id || user.id!)}
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
                {editingUser ? 'Edit User' : 'Add New User'}
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
                {!editingUser && (
                  <div>
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required={!editingUser}
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
                  <label className="form-label">Height</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., 175cm"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Weight</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., 70kg"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Target Weight</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., 65kg"
                    value={formData.targetWeight}
                    onChange={(e) =>
                      setFormData({ ...formData, targetWeight: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Body Shape</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Mesomorph"
                    value={formData.bodyshape}
                    onChange={(e) =>
                      setFormData({ ...formData, bodyshape: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">User Category</label>
                  <select
                    className="form-control"
                    value={formData.userCategory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        userCategory: e.target.value as 'Personal' | 'Corporate',
                      })
                    }
                  >
                    <option value="Personal">Personal</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Practice Time</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., 2 days per week"
                    value={formData.practicetime}
                    onChange={(e) =>
                      setFormData({ ...formData, practicetime: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Prior Experience</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Beginner"
                    value={formData.PriorExperience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        PriorExperience: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.Address}
                    onChange={(e) =>
                      setFormData({ ...formData, Address: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData({ ...formData, pincode: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Focus Area</label>
                  <div className="flex flex-wrap gap-2">
                    {['Full Body', 'Strength', 'Flexibility', 'Weight Management', 'Stress Relief', 'Meditation'].map(
                      (area) => (
                        <label key={area} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.focusarea?.includes(area)}
                            onChange={(e) => {
                              const current = formData.focusarea || [];
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  focusarea: [...current, area],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  focusarea: current.filter((a) => a !== area),
                                });
                              }
                            }}
                            className="me-2"
                          />
                          {area}
                        </label>
                      )
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="form-label">Goals</label>
                  <div className="flex flex-wrap gap-2">
                    {['Weight Loss', 'Weight Gain', 'Strength', 'Flexibility', 'Stress Relief', 'General Fitness'].map(
                      (goalItem) => (
                        <label key={goalItem} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.goal?.includes(goalItem)}
                            onChange={(e) => {
                              const current = formData.goal || [];
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  goal: [...current, goalItem],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  goal: current.filter((g) => g !== goalItem),
                                });
                              }
                            }}
                            className="me-2"
                          />
                          {goalItem}
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
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && viewingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-bodybg rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">User Details</h3>
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
                  {viewingUser.profileImage ? (
                    <img
                      src={viewingUser.profileImage}
                      alt={viewingUser.name}
                      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-semibold text-4xl">
                        {viewingUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <h4 className="font-semibold text-lg">{viewingUser.name}</h4>
                  <p className="text-muted">{viewingUser.email}</p>
                  <span
                    className={`badge mt-2 ${
                      (viewingUser.active !== false && viewingUser.status !== false) || viewingUser.isActive !== false
                        ? 'bg-success/10 text-success'
                        : 'bg-danger/10 text-danger'
                    }`}
                  >
                    {(viewingUser.active !== false && viewingUser.status !== false) || viewingUser.isActive !== false
                      ? 'Active'
                      : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="col-span-12 md:col-span-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-muted text-sm">Mobile</label>
                    <p className="font-medium">{viewingUser.mobile || '-'}</p>
                  </div>
                  <div>
                    <label className="text-muted text-sm">Gender</label>
                    <p className="font-medium">{viewingUser.gender || '-'}</p>
                  </div>
                  <div>
                    <label className="text-muted text-sm">Age</label>
                    <p className="font-medium">{viewingUser.age || '-'}</p>
                  </div>
                  <div>
                    <label className="text-muted text-sm">User Category</label>
                    <p className="font-medium">
                      {viewingUser.userCategory || 'Personal'}
                    </p>
                  </div>
                  <div>
                    <label className="text-muted text-sm">Height</label>
                    <p className="font-medium">{viewingUser.height || '-'}</p>
                  </div>
                  <div>
                    <label className="text-muted text-sm">Weight</label>
                    <p className="font-medium">{viewingUser.weight || '-'}</p>
                  </div>
                  <div>
                    <label className="text-muted text-sm">Target Weight</label>
                    <p className="font-medium">
                      {viewingUser.targetWeight || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-muted text-sm">Body Shape</label>
                    <p className="font-medium">
                      {viewingUser.bodyshape || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-muted text-sm">Practice Time</label>
                    <p className="font-medium">
                      {viewingUser.practicetime || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-muted text-sm">Prior Experience</label>
                    <p className="font-medium">
                      {viewingUser.PriorExperience || '-'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-muted text-sm">Address</label>
                    <p className="font-medium">
                      {viewingUser.Address || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-muted text-sm">City</label>
                    <p className="font-medium">{viewingUser.city || '-'}</p>
                  </div>
                  <div>
                    <label className="text-muted text-sm">Pincode</label>
                    <p className="font-medium">
                      {viewingUser.pincode || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-muted text-sm">Country</label>
                    <p className="font-medium">
                      {viewingUser.country || '-'}
                    </p>
                  </div>
                  {viewingUser.focusarea && viewingUser.focusarea.length > 0 && (
                    <div className="col-span-2">
                      <label className="text-muted text-sm">Focus Areas</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {viewingUser.focusarea.map((area, idx) => (
                          <span
                            key={idx}
                            className="badge bg-primary/10 text-primary"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {viewingUser.goal && viewingUser.goal.length > 0 && (
                    <div className="col-span-2">
                      <label className="text-muted text-sm">Goals</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {viewingUser.goal.map((goalItem, idx) => (
                          <span
                            key={idx}
                            className="badge bg-success/10 text-success"
                          >
                            {goalItem}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {viewingUser.images && viewingUser.images.length > 0 && (
                    <div className="col-span-2">
                      <label className="text-muted text-sm">Additional Images</label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {viewingUser.images.map((img: any, idx: number) => (
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

export default Users;

