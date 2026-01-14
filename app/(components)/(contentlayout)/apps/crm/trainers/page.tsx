"use client";

import React, { Fragment, useEffect, useState, useRef } from 'react';
import Seo from '@/shared/layout-components/seo/seo';
import TrainerService, { Trainer, CreateTrainerRequest, UpdateTrainerRequest, SPECIALIST_OPTIONS, TYPE_OF_TRAINING_OPTIONS, TrainerImage } from '@/services/trainerService';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Base_url } from '@/Config/BaseUrl';
import MultiSelect from '@/shared/components/MultiSelect';

const Trainers = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingTrainer, setViewingTrainer] = useState<Trainer | null>(null);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [formData, setFormData] = useState<CreateTrainerRequest>({
    name: '',
    title: '',
    bio: '',
    email: '',
    mobile: '',
    specialistIn: [],
    typeOfTraining: [],
    images: [],
    profilePhoto: null,
    status: true,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialist, setFilterSpecialist] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTrainers();
  }, [page, searchTerm, filterSpecialist, filterStatus]);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = {
        page,
        limit: 10,
        sortBy: 'createdAt:desc',
      };
      
      if (searchTerm) {
        params.name = searchTerm;
      }
      
      if (filterSpecialist) {
        params.specialistIn = filterSpecialist;
      }
      
      if (filterStatus !== '') {
        params.status = filterStatus === 'true';
      }

      const response = await TrainerService.getTrainers(params);
      setTrainers(response.results || []);
      setTotalPages(response.totalPages || 1);
      setTotalResults(response.totalResults || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trainers');
      Swal.fire('Error!', err.message || 'Failed to fetch trainers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      
      // Validate required fields
      const specialistInArray = Array.isArray(formData.specialistIn) ? formData.specialistIn : [formData.specialistIn].filter(Boolean);
      const typeOfTrainingArray = Array.isArray(formData.typeOfTraining) ? formData.typeOfTraining : [formData.typeOfTraining].filter(Boolean);
      
      if (!formData.name || !formData.title || !formData.bio || !formData.email || !formData.mobile || specialistInArray.length === 0 || typeOfTrainingArray.length === 0) {
        Swal.fire('Error!', 'Please fill in all required fields', 'error');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        Swal.fire('Error!', 'Please enter a valid email address', 'error');
        return;
      }

      // Validate mobile format (10 digits)
      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(formData.mobile.replace(/\D/g, ''))) {
        Swal.fire('Error!', 'Please enter a valid 10-digit mobile number', 'error');
        return;
      }

      if (editingTrainer) {
        const trainerId = editingTrainer._id || editingTrainer.id;
        if (!trainerId) {
          setError('Trainer ID not found');
          return;
        }
        
        // Prepare update data
        const updateData: UpdateTrainerRequest = {
          name: formData.name.trim(),
          title: formData.title.trim(),
          bio: formData.bio.trim(),
          email: formData.email.trim(),
          mobile: formData.mobile.replace(/\D/g, ''),
          specialistIn: Array.isArray(formData.specialistIn) ? formData.specialistIn : [formData.specialistIn].filter(Boolean),
          typeOfTraining: Array.isArray(formData.typeOfTraining) ? formData.typeOfTraining : [formData.typeOfTraining].filter(Boolean),
          status: formData.status,
        };

        // Only include images if they exist
        if (formData.images && formData.images.length > 0) {
          updateData.images = formData.images;
        }

        // Only include profilePhoto if it exists
        if (formData.profilePhoto) {
          updateData.profilePhoto = formData.profilePhoto;
        }

        console.log('Submitting update data:', updateData);
        await TrainerService.updateTrainer(trainerId, updateData);
        Swal.fire('Success!', 'Trainer updated successfully', 'success');
      } else {
        // Prepare create data - all required fields are guaranteed to be present
        const createData: CreateTrainerRequest = {
          name: formData.name.trim(),
          title: formData.title.trim(),
          bio: formData.bio.trim(),
          email: formData.email.trim(),
          mobile: formData.mobile.replace(/\D/g, ''),
          specialistIn: Array.isArray(formData.specialistIn) ? formData.specialistIn : [formData.specialistIn].filter(Boolean),
          typeOfTraining: Array.isArray(formData.typeOfTraining) ? formData.typeOfTraining : [formData.typeOfTraining].filter(Boolean),
          status: formData.status,
        };

        // Only include images if they exist
        if (formData.images && formData.images.length > 0) {
          createData.images = formData.images;
        }

        // Only include profilePhoto if it exists
        if (formData.profilePhoto) {
          createData.profilePhoto = formData.profilePhoto;
        }

        console.log('Submitting create data:', createData);
        await TrainerService.createTrainer(createData);
        Swal.fire('Success!', 'Trainer created successfully', 'success');
      }
      setShowModal(false);
      setEditingTrainer(null);
      resetForm();
      fetchTrainers();
    } catch (err: any) {
      console.error('Submit error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save trainer';
      setError(errorMessage);
      Swal.fire('Error!', errorMessage, 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      bio: '',
      email: '',
      mobile: '',
      specialistIn: [],
      typeOfTraining: [],
      images: [],
      profilePhoto: null,
      status: true,
    });
  };

  const handleView = (trainer: Trainer) => {
    setViewingTrainer(trainer);
    setShowViewModal(true);
  };

  const handleEdit = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.name || '',
      title: trainer.title || '',
      bio: trainer.bio || '',
      email: (trainer as any).email || '',
      mobile: (trainer as any).mobile || '',
      specialistIn: Array.isArray(trainer.specialistIn) ? trainer.specialistIn : (trainer.specialistIn ? [trainer.specialistIn] : []),
      typeOfTraining: Array.isArray(trainer.typeOfTraining) ? trainer.typeOfTraining : (trainer.typeOfTraining ? [trainer.typeOfTraining] : []),
      images: trainer.images || [],
      profilePhoto: trainer.profilePhoto || null,
      status: trainer.status !== false,
    });
    setShowModal(true);
  };

  const handleDelete = async (trainerId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await TrainerService.deleteTrainer(trainerId);
        Swal.fire('Deleted!', 'Trainer has been deleted.', 'success');
        fetchTrainers();
      } catch (err: any) {
        Swal.fire('Error!', err.message || 'Failed to delete trainer', 'error');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTrainer(null);
    resetForm();
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingTrainer(null);
  };

  const handleFileUpload = async (file: File, isProfilePhoto: boolean = false) => {
    if (!file) {
      return;
    }

    try {
      if (isProfilePhoto) {
        setUploadingProfilePhoto(true);
      } else {
        setUploadingImage(true);
      }

      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      // Upload endpoint is at /v1/upload
      const uploadUrl = `${Base_url}/upload`;
      
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.data.success && response.data.url) {
        // Extract key from URL or use fileName
        const fileName = response.data.fileName || file.name;
        const key = `trainer-${isProfilePhoto ? 'profile' : 'images'}/${fileName}`;
        const imageData: TrainerImage = {
          key,
          path: response.data.url,
        };

        if (isProfilePhoto) {
          setFormData((prev) => ({
            ...prev,
            profilePhoto: imageData,
          }));
          Swal.fire('Success!', 'Profile photo uploaded successfully', 'success');
        } else {
          setFormData((prev) => ({
            ...prev,
            images: [...(prev.images || []), imageData],
          }));
          Swal.fire('Success!', 'Image uploaded successfully', 'success');
        }
      } else {
        throw new Error('Upload failed: Invalid response');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      Swal.fire('Error!', error.response?.data?.message || error.message || 'Failed to upload file', 'error');
    } finally {
      if (isProfilePhoto) {
        setUploadingProfilePhoto(false);
      } else {
        setUploadingImage(false);
      }
    }
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        Swal.fire('Error!', 'Please select an image file', 'error');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Error!', 'File size should be less than 5MB', 'error');
        return;
      }
      handleFileUpload(file, true);
    }
    // Reset input
    if (profilePhotoInputRef.current) {
      profilePhotoInputRef.current.value = '';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        Swal.fire('Error!', 'Please select an image file', 'error');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Error!', 'File size should be less than 5MB', 'error');
        return;
      }
      handleFileUpload(file, false);
    }
    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const newImages = [...(prev.images || [])];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  const clearProfilePhoto = () => {
    setFormData((prev) => ({ ...prev, profilePhoto: null }));
  };

  return (
    <Fragment>
      <Seo title="Trainers Management" />
      
      <div className="md:flex block items-center justify-between my-[1.5rem] page-header-breadcrumb">
        <div>
          <p className="font-semibold text-[1.125rem] text-defaulttextcolor dark:text-defaulttextcolor/70 !mb-0">
            Trainers Management
          </p>
          <p className="font-normal text-[#8c9097] dark:text-white/50 text-[0.813rem]">
            Manage all trainers in the system
          </p>
        </div>
        <div className="btn-list md:mt-0 mt-2">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="ti-btn bg-primary text-white btn-wave !font-medium !me-[0.45rem] !ms-0 !text-[0.85rem] !rounded-[0.35rem] !py-[0.51rem] !px-[0.86rem] shadow-none"
          >
            <i className="ri-add-line inline-block me-1"></i>Add Trainer
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="box mb-4">
        <div className="box-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Search by Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search trainers..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div>
              <label className="form-label">Filter by Specialist</label>
              <select
                className="form-control"
                value={filterSpecialist}
                onChange={(e) => {
                  setFilterSpecialist(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Specialists</option>
                {SPECIALIST_OPTIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Filter by Status</label>
              <select
                className="form-control"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="box">
        <div className="box-body">
          {loading ? (
            <div className="text-center py-8">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading trainers...</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-bordered table-hover whitespace-nowrap min-w-full">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Title</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Specialist In</th>
                      <th>Type of Training</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          No trainers found
                        </td>
                      </tr>
                    ) : (
                      trainers.map((trainer) => (
                        <tr key={trainer._id || trainer.id}>
                          <td>
                            <div className="flex items-center">
                              {trainer.profilePhoto?.path ? (
                                <img
                                  src={trainer.profilePhoto.path}
                                  alt={trainer.name}
                                  className="w-10 h-10 rounded-full me-2 object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center me-2">
                                  <span className="text-primary font-semibold">
                                    {trainer.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <span className="font-semibold">{trainer.name}</span>
                            </div>
                          </td>
                          <td>{trainer.title}</td>
                          <td className="max-w-xs truncate">{(trainer as any).email || '-'}</td>
                          <td>{(trainer as any).mobile || '-'}</td>
                          <td>
                            {Array.isArray(trainer.specialistIn) ? (
                              <div className="flex flex-wrap gap-1">
                                {trainer.specialistIn.map((spec, idx) => (
                                  <span key={idx} className="badge bg-info/10 text-info">
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="badge bg-info/10 text-info">
                                {trainer.specialistIn}
                              </span>
                            )}
                          </td>
                          <td className="max-w-xs">
                            {Array.isArray(trainer.typeOfTraining) ? (
                              <div className="flex flex-wrap gap-1">
                                {trainer.typeOfTraining.slice(0, 2).map((training, idx) => (
                                  <span key={idx} className="badge bg-primary/10 text-primary text-xs">
                                    {training}
                                  </span>
                                ))}
                                {trainer.typeOfTraining.length > 2 && (
                                  <span className="badge bg-secondary/10 text-secondary text-xs">
                                    +{trainer.typeOfTraining.length - 2} more
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="truncate">{trainer.typeOfTraining}</span>
                            )}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                trainer.status !== false
                                  ? 'bg-success/10 text-success'
                                  : 'bg-danger/10 text-danger'
                              }`}
                            >
                              {trainer.status !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleView(trainer)}
                                className="ti-btn ti-btn-sm ti-btn-info"
                                title="View Details"
                              >
                                <i className="ri-eye-line"></i>
                              </button>
                              <button
                                onClick={() => handleEdit(trainer)}
                                className="ti-btn ti-btn-sm ti-btn-primary"
                                title="Edit"
                              >
                                <i className="ri-edit-line"></i>
                              </button>
                              <button
                                onClick={() => handleDelete(trainer._id || trainer.id!)}
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

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-muted">
                    Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, totalResults)} of {totalResults} trainers
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="ti-btn ti-btn-sm"
                    >
                      Previous
                    </button>
                    <span className="px-2">
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
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-bodybg rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="ti-btn ti-btn-sm ti-btn-ghost"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="form-label">Bio * (Max 2000 characters)</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={formData.bio || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    maxLength={2000}
                    required
                  />
                  <small className="text-muted">
                    {(formData.bio || '').length}/2000 characters
                  </small>
                </div>
                <div>
                  <MultiSelect
                    label="Specialist In"
                    options={SPECIALIST_OPTIONS}
                    value={Array.isArray(formData.specialistIn) ? formData.specialistIn : []}
                    onChange={(selected) => setFormData((prev) => ({ ...prev, specialistIn: selected }))}
                    placeholder="Select specialties..."
                    required
                    maxHeight="200px"
                  />
                </div>
                <div>
                  <MultiSelect
                    label="Type of Training"
                    options={TYPE_OF_TRAINING_OPTIONS}
                    value={Array.isArray(formData.typeOfTraining) ? formData.typeOfTraining : []}
                    onChange={(selected) => setFormData((prev) => ({ ...prev, typeOfTraining: selected }))}
                    placeholder="Select training types..."
                    required
                    maxHeight="300px"
                  />
                </div>
                <div>
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="trainer@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.mobile || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setFormData((prev) => ({ ...prev, mobile: value }));
                      }
                    }}
                    placeholder="1234567890"
                    maxLength={10}
                    required
                  />
                  <small className="text-muted">10 digits only</small>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={formData.status ? 'true' : 'false'}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, status: e.target.value === 'true' }))
                    }
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                
                {/* Profile Photo */}
                <div className="md:col-span-2">
                  <label className="form-label">Profile Photo</label>
                  <input
                    type="file"
                    ref={profilePhotoInputRef}
                    accept="image/*"
                    onChange={handleProfilePhotoChange}
                    className="hidden"
                  />
                  <div className="flex flex-col gap-4">
                    {formData.profilePhoto?.path && (
                      <div className="flex items-start gap-4 p-3 bg-defaultborder/10 rounded-lg border border-defaultborder">
                        <img
                          src={formData.profilePhoto.path}
                          alt="Profile"
                          className="w-24 h-24 rounded-lg object-cover border border-defaultborder flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="flex flex-col gap-3 flex-1">
                          <span className="text-sm font-medium text-defaulttextcolor">Current Profile Photo</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => profilePhotoInputRef.current?.click()}
                              disabled={uploadingProfilePhoto}
                              className="ti-btn ti-btn-sm !bg-primary !text-white hover:!bg-primary/90 !font-medium !px-2 !py-2 rounded"
                              title={uploadingProfilePhoto ? "Uploading..." : "Change Photo"}
                            >
                              {uploadingProfilePhoto ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : (
                                <i className="ri-pencil-line"></i>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={clearProfilePhoto}
                              className="ti-btn ti-btn-sm !bg-danger !text-white hover:!bg-danger/90 !font-medium !px-2 !py-2 rounded"
                              title="Remove photo"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                          <small className="text-muted text-xs">
                            Key: {formData.profilePhoto.key}
                          </small>
                        </div>
                      </div>
                    )}
                    {!formData.profilePhoto && (
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => profilePhotoInputRef.current?.click()}
                          disabled={uploadingProfilePhoto}
                          className="ti-btn !bg-primary !text-white hover:!bg-primary/90 !font-medium !px-4 !py-2.5 w-fit"
                        >
                          {uploadingProfilePhoto ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <i className="ri-upload-line me-2"></i>
                              Upload Profile Photo
                            </>
                          )}
                        </button>
                        <small className="text-muted text-sm">
                          Supported formats: JPG, PNG, GIF (Max 5MB)
                        </small>
                      </div>
                    )}
                  </div>
                </div>

                {/* Images */}
                <div className="md:col-span-2">
                  <label className="form-label">Images</label>
                  <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="ti-btn !bg-primary !text-white hover:!bg-primary/90 !font-medium !px-4 !py-2.5 w-fit"
                      >
                        {uploadingImage ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <i className="ri-upload-line me-2"></i>Upload Image
                          </>
                        )}
                      </button>
                      <small className="text-muted text-sm">
                        Supported formats: JPG, PNG, GIF (Max 5MB per image)
                      </small>
                    </div>
                    {formData.images && formData.images.length > 0 && (
                      <div className="mt-2">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {formData.images.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={img.path}
                                alt={`Image ${idx + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-defaultborder"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-2 right-2 ti-btn ti-btn-sm !bg-danger !text-white hover:!bg-danger/90 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                                title="Remove image"
                              >
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                        <small className="text-muted text-sm mt-2 d-block">
                          {formData.images.length} image(s) added
                        </small>
                      </div>
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
                  {editingTrainer ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingTrainer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-bodybg rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Trainer Details</h3>
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
                  {viewingTrainer.profilePhoto?.path ? (
                    <img
                      src={viewingTrainer.profilePhoto.path}
                      alt={viewingTrainer.name}
                      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-semibold text-4xl">
                        {viewingTrainer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <h4 className="font-semibold text-lg">{viewingTrainer.name}</h4>
                  <p className="text-muted">{viewingTrainer.title}</p>
                  <span
                    className={`badge mt-2 ${
                      viewingTrainer.status !== false
                        ? 'bg-success/10 text-success'
                        : 'bg-danger/10 text-danger'
                    }`}
                  >
                    {viewingTrainer.status !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="col-span-12 md:col-span-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-muted text-sm">Specialist In</label>
                    <p className="font-medium">
                      {Array.isArray(viewingTrainer.specialistIn) ? (
                        <div className="flex flex-wrap gap-1">
                          {viewingTrainer.specialistIn.map((spec, idx) => (
                            <span key={idx} className="badge bg-info/10 text-info">
                              {spec}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="badge bg-info/10 text-info">
                          {viewingTrainer.specialistIn}
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-muted text-sm">Type of Training</label>
                    <p className="font-medium">
                      {Array.isArray(viewingTrainer.typeOfTraining) ? (
                        <div className="flex flex-col gap-1">
                          {viewingTrainer.typeOfTraining.map((training, idx) => (
                            <span key={idx} className="badge bg-primary/10 text-primary">
                              {training}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span>{viewingTrainer.typeOfTraining}</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-muted text-sm">Email</label>
                    <p className="font-medium">{(viewingTrainer as any).email || '-'}</p>
                  </div>
                  <div>
                    <label className="text-muted text-sm">Mobile</label>
                    <p className="font-medium">{(viewingTrainer as any).mobile || '-'}</p>
                  </div>
                  <div>
                    <label className="text-muted text-sm">Bio</label>
                    <p className="font-medium">{viewingTrainer.bio}</p>
                  </div>
                  {viewingTrainer.images && viewingTrainer.images.length > 0 && (
                    <div>
                      <label className="text-muted text-sm">Additional Images</label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {viewingTrainer.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img.path}
                            alt={`Image ${idx + 1}`}
                            className="w-full h-24 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {viewingTrainer.createdAt && (
                    <div>
                      <label className="text-muted text-sm">Created At</label>
                      <p className="font-medium">
                        {new Date(viewingTrainer.createdAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {viewingTrainer.updatedAt && (
                    <div>
                      <label className="text-muted text-sm">Last Updated</label>
                      <p className="font-medium">
                        {new Date(viewingTrainer.updatedAt).toLocaleString()}
                      </p>
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

export default Trainers;

