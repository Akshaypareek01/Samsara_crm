"use client";

import React, { Fragment, useEffect, useState } from 'react';
import Seo from '@/shared/layout-components/seo/seo';
import UserService, { User, CreateUserRequest } from '@/services/userService';
import membershipService, { UserMembership } from '@/services/membershipService';
import { useRouter } from 'next/navigation';
import { hasPermission } from '@/shared/utils/permissionUtils';
import Swal from 'sweetalert2';

const Users = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userMemberships, setUserMemberships] = useState<Map<string, UserMembership | null>>(new Map());
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
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setAdminUser(JSON.parse(userStr));
    }
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

      setUsers(response.data || []);
      setTotalPages(response.totalPages || 1);
      setError('');

      // Fetch memberships for these users
      await fetchMembershipsForUsers(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembershipsForUsers = async (users: User[]) => {
    const membershipsMap = new Map<string, UserMembership | null>();

    // Fetch memberships for all users on current page
    await Promise.all(
      users.map(async (user) => {
        const userId = user._id || user.id;
        if (userId) {
          try {
            const membership = await membershipService.getUserActiveMembership(userId);
            membershipsMap.set(userId, membership);
          } catch (error) {
            membershipsMap.set(userId, null);
          }
        }
      })
    );

    setUserMemberships(membershipsMap);
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
    router.push(`/apps/crm/user-profile/${user._id || user.id}`);
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
        await UserService.deleteUser(userId);
        Swal.fire('Deleted!', 'User has been deleted.', 'success');
        fetchUsers();
      } catch (err: any) {
        Swal.fire('Error!', err.message || 'Failed to delete user', 'error');
      }
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
          <p className="font-semibold text-sm text-defaulttextcolor dark:text-defaulttextcolor/70 !mb-0">
            Users Management
          </p>
          <p className="font-normal text-[#8c9097] dark:text-white/50 text-xs">
            Manage all users in the system
          </p>
        </div>
        <div className="btn-list md:mt-0 mt-2">
          {hasPermission(adminUser, 'userManagement.users', 'create') && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="ti-btn  bg-primary text-white btn-wave shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 !text-sm !py-2 !px-3 !rounded-md font-medium"
            >
              <i className="ri-add-line text-sm"></i>
              <span>Add User</span>
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
              placeholder="Search users..."
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
                    <th>Membership</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-sm">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const userId = user._id || user.id;
                      const membership = userId ? userMemberships.get(userId) : null;

                      return (
                        <tr key={userId}>
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
                            {membership ? (
                              <div>
                                <span className={`badge ${membership.status === 'active' ? 'bg-success/10 text-success' :
                                  membership.status === 'expired' ? 'bg-danger/10 text-danger' :
                                    'bg-warning/10 text-warning'
                                  }`}>
                                  {membership.planName}
                                </span>
                                <div className="text-[0.65rem] text-muted mt-1">
                                  Expires: {membershipService.formatDate(membership.endDate)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted text-sm">No Membership</span>
                            )}
                          </td>
                          <td>
                            <span
                              className={`badge ${(user.active !== false && user.status !== false) || user.isActive !== false
                                ? 'bg-success/10 text-success'
                                : 'bg-danger/10 text-danger'
                                }`}
                            >
                              {(user.active !== false && user.status !== false) || user.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleView(user)}
                                className="ti-btn ti-btn-sm ti-btn-info !text-xs !py-1 !px-1.5"
                                title="View Details"
                              >
                                <i className="ri-eye-line text-xs"></i>
                              </button>
                              {hasPermission(adminUser, 'userManagement.users', 'update') && (
                                <button
                                  onClick={() => handleEdit(user)}
                                  className="ti-btn ti-btn-sm ti-btn-primary !text-xs !py-1 !px-1.5"
                                  title="Edit"
                                >
                                  <i className="ri-edit-line text-xs"></i>
                                </button>
                              )}
                              {hasPermission(adminUser, 'userManagement.users', 'delete') && (
                                <button
                                  onClick={() => handleDelete(userId!)}
                                  className="ti-btn ti-btn-sm ti-btn-danger !text-xs !py-1 !px-1.5"
                                  title="Delete"
                                >
                                  <i className="ri-delete-bin-line text-xs"></i>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
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

      {/* Edit/Add user side drawer */}
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
                {editingUser ? 'Edit User' : 'Add New User'}
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
                {!editingUser && (
                  <div>
                    <label className="form-label text-xs">Password *</label>
                    <input
                      type="password"
                      className="form-control text-sm py-1.5"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required={!editingUser}
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
                  <label className="form-label text-xs">Height</label>
                  <input
                    type="text"
                    className="form-control text-sm py-1.5"
                    placeholder="e.g., 175cm"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Weight</label>
                  <input
                    type="text"
                    className="form-control text-sm py-1.5"
                    placeholder="e.g., 70kg"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Target Weight</label>
                  <input
                    type="text"
                    className="form-control text-sm py-1.5"
                    placeholder="e.g., 65kg"
                    value={formData.targetWeight}
                    onChange={(e) =>
                      setFormData({ ...formData, targetWeight: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Body Shape</label>
                  <input
                    type="text"
                    className="form-control text-sm py-1.5"
                    placeholder="e.g., Mesomorph"
                    value={formData.bodyshape}
                    onChange={(e) =>
                      setFormData({ ...formData, bodyshape: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label text-xs">User Category</label>
                  <select
                    className="form-control text-sm py-1.5"
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
                  <label className="form-label text-xs">Practice Time</label>
                  <input
                    type="text"
                    className="form-control text-sm py-1.5"
                    placeholder="e.g., 2 days per week"
                    value={formData.practicetime}
                    onChange={(e) =>
                      setFormData({ ...formData, practicetime: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Prior Experience</label>
                  <input
                    type="text"
                    className="form-control text-sm py-1.5"
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
                  <label className="form-label text-xs">Address</label>
                  <input
                    type="text"
                    className="form-control text-sm py-1.5"
                    value={formData.Address}
                    onChange={(e) =>
                      setFormData({ ...formData, Address: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label text-xs">City</label>
                  <input
                    type="text"
                    className="form-control text-sm py-1.5"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Pincode</label>
                  <input
                    type="text"
                    className="form-control text-sm py-1.5"
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData({ ...formData, pincode: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Country</label>
                  <input
                    type="text"
                    className="form-control text-sm py-1.5"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <label className="form-label text-xs">Focus Area</label>
                  <div className="flex flex-wrap gap-2 text-xs">
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
                  <label className="form-label text-xs">Goals</label>
                  <div className="flex flex-wrap gap-2 text-xs">
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
                  className="ti-btn ti-btn-sm ti-btn-secondary !text-xs !py-1.5 !px-2.5"
                >
                  Cancel
                </button>
                <button type="submit" className="ti-btn ti-btn-sm ti-btn-primary !text-xs !py-1.5 !px-2.5">
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </>
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
                    className={`badge mt-2 ${(viewingUser.active !== false && viewingUser.status !== false) || viewingUser.isActive !== false
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

