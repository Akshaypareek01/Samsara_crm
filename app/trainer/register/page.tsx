"use client";
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useState, useRef } from 'react';
import TrainerService, { CreateTrainerRequest, SPECIALIST_OPTIONS, TYPE_OF_TRAINING_OPTIONS, TrainerImage } from '@/services/trainerService';
import axios from 'axios';
import { Base_url } from '@/Config/BaseUrl';
import Swal from 'sweetalert2';
import MultiSelect from '@/shared/components/MultiSelect';

const TrainerRegister = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const profilePhotoInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    
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
            const uploadUrl = `${Base_url}/upload`;
            
            const response = await axios.post(uploadUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });

            if (response.data.success && response.data.url) {
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
            if (!file.type.startsWith('image/')) {
                Swal.fire('Error!', 'Please select an image file', 'error');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire('Error!', 'File size should be less than 5MB', 'error');
                return;
            }
            handleFileUpload(file, true);
        }
        if (profilePhotoInputRef.current) {
            profilePhotoInputRef.current.value = '';
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                Swal.fire('Error!', 'Please select an image file', 'error');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire('Error!', 'File size should be less than 5MB', 'error');
                return;
            }
            handleFileUpload(file, false);
        }
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        // Validate required fields
        const specialistInArray = Array.isArray(formData.specialistIn) ? formData.specialistIn : [formData.specialistIn].filter(Boolean);
        const typeOfTrainingArray = Array.isArray(formData.typeOfTraining) ? formData.typeOfTraining : [formData.typeOfTraining].filter(Boolean);
        
        if (!formData.name || !formData.title || !formData.bio || !formData.email || !formData.mobile || specialistInArray.length === 0 || typeOfTrainingArray.length === 0) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        // Validate mobile format (basic validation - 10 digits)
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(formData.mobile.replace(/\D/g, ''))) {
            setError('Please enter a valid 10-digit mobile number');
            setLoading(false);
            return;
        }

        // Validate bio length
        if (formData.bio.length > 2000) {
            setError('Bio must be less than 2000 characters');
            setLoading(false);
            return;
        }

        try {
            const submitData: CreateTrainerRequest = {
                name: formData.name.trim(),
                title: formData.title.trim(),
                bio: formData.bio.trim(),
                email: formData.email.trim(),
                mobile: formData.mobile.replace(/\D/g, ''), // Remove non-digits
                specialistIn: Array.isArray(formData.specialistIn) ? formData.specialistIn : [formData.specialistIn].filter(Boolean),
                typeOfTraining: Array.isArray(formData.typeOfTraining) ? formData.typeOfTraining : [formData.typeOfTraining].filter(Boolean),
                status: formData.status,
            };

            // Only include images if they exist
            if (formData.images && formData.images.length > 0) {
                submitData.images = formData.images;
            }

            // Only include profilePhoto if it exists
            if (formData.profilePhoto) {
                submitData.profilePhoto = formData.profilePhoto;
            }

            await TrainerService.createTrainer(submitData);
            
            setSuccess(true);
        } catch (err: any) {
            if (err.message?.includes('401') || err.message?.includes('403') || err.message?.includes('Unauthorized')) {
                setError('Registration requires admin approval. Your request has been noted. Please contact support or wait for admin approval.');
                setSuccess(true);
            } else {
                setError(err.message || 'Failed to register trainer. Please try again or contact support.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success && !error) {
        return (
            <Fragment>
                <Seo title={"Trainer Registration"} />
                <div className="container px-4 sm:px-6">
                    <div className="flex justify-center authentication authentication-basic items-center h-full text-defaultsize text-defaulttextcolor py-4 sm:py-8">
                        <div className="grid grid-cols-12 w-full">
                            <div className="xxl:col-span-4 xl:col-span-4 lg:col-span-4 md:col-span-3 sm:col-span-2 col-span-0"></div>
                            <div className="xxl:col-span-4 xl:col-span-4 lg:col-span-4 md:col-span-6 sm:col-span-8 col-span-12">
                                <div className="my-4 sm:my-[2.5rem] flex justify-center mb-4 sm:mb-6">
                                    <img src="/assets/images/logosm.png" alt="logo" className="h-24 sm:h-32 w-auto" />
                                </div>
                                <div className="box">
                                    <div className="box-body !p-4 sm:!p-6 md:!p-[3rem]">
                                        <div className="text-center">
                                            <div className="mb-4">
                                                <i className="ri-checkbox-circle-line text-success text-4xl sm:text-6xl"></i>
                                            </div>
                                            <h3 className="h5 font-semibold mb-2 text-lg sm:text-xl">Registration Successful!</h3>
                                            <p className="mb-4 text-[#8c9097] dark:text-white/50 opacity-[0.7] font-normal text-sm sm:text-base">
                                                You are successfully registered. Thanks for registering.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="xxl:col-span-4 xl:col-span-4 lg:col-span-4 md:col-span-3 sm:col-span-2 col-span-0"></div>
                        </div>
                    </div>
                </div>
            </Fragment>
        );
    }

    return (
        <Fragment>
            <Seo title={"Trainer Registration"} />
            <div className="container px-4 sm:px-6">
                <div className="flex justify-center authentication authentication-basic items-center h-full text-defaultsize text-defaulttextcolor py-4 sm:py-8">
                    <div className="grid grid-cols-12 w-full">
                        <div className="xxl:col-span-2 xl:col-span-2 lg:col-span-2 md:col-span-1 sm:col-span-1 col-span-0"></div>
                        <div className="xxl:col-span-8 xl:col-span-8 lg:col-span-8 md:col-span-10 sm:col-span-10 col-span-12">
                            <div className="my-4 sm:my-[2.5rem] flex justify-center mb-4 sm:mb-6">
                                <img src="/assets/images/logosm.png" alt="logo" className="h-24 sm:h-32 w-auto" />
                            </div>
                            <div className="box">
                                <div className="box-body !p-4 sm:!p-6 md:!p-[3rem]">
                                    <p className="h5 font-semibold mb-2 text-center text-lg sm:text-xl">Trainer Registration</p>
                                    <p className="mb-4 text-[#8c9097] dark:text-white/50 opacity-[0.7] font-normal text-center text-sm sm:text-base">
                                        Fill in your trainer details to create a profile
                                    </p>

                                    {error && (
                                        <div className={`alert mb-4 text-center text-sm p-3 rounded ${
                                            success 
                                                ? 'alert-warning bg-warning/10 text-warning border-warning/20' 
                                                : 'alert-danger bg-danger/10 text-danger border-danger/20'
                                        }`}>
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit}>
                                        <div className="space-y-4">
                                            {/* Basic Information */}
                                            <div className="border-b pb-4 mb-4">
                                                <h4 className="font-semibold mb-4 text-base sm:text-lg">Basic Information</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                                    <div>
                                                        <label className="form-label">Full Name *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control border-2 focus:border-primary"
                                                            value={formData.name}
                                                            onChange={(e) =>
                                                                setFormData((prev) => ({ ...prev, name: e.target.value }))
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="form-label">Professional Title *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control border-2 focus:border-primary"
                                                            value={formData.title}
                                                            onChange={(e) =>
                                                                setFormData((prev) => ({ ...prev, title: e.target.value }))
                                                            }
                                                            placeholder="e.g., Certified Yoga Instructor"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="form-label">Email *</label>
                                                        <input
                                                            type="email"
                                                            className="form-control border-2 focus:border-primary"
                                                            value={formData.email}
                                                            onChange={(e) =>
                                                                setFormData((prev) => ({ ...prev, email: e.target.value }))
                                                            }
                                                            placeholder="your.email@example.com"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="form-label">Mobile Number *</label>
                                                        <input
                                                            type="tel"
                                                            className="form-control border-2 focus:border-primary"
                                                            value={formData.mobile}
                                                            onChange={(e) => {
                                                                // Allow only digits
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
                                                    <div className="md:col-span-2">
                                                        <label className="form-label">Bio * (Max 2000 characters)</label>
                                                        <textarea
                                                            className="form-control border-2 focus:border-primary"
                                                            rows={4}
                                                            value={formData.bio}
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
                                                </div>
                                            </div>

                                            {/* Training Information */}
                                            <div className="border-b pb-4 mb-4">
                                                <h4 className="font-semibold mb-4 text-base sm:text-lg">Training Information</h4>
                                                <div className="space-y-3 sm:space-y-4">
                                                    <div>
                                                        <MultiSelect
                                                            label="Specialist In"
                                                            options={SPECIALIST_OPTIONS}
                                                            value={Array.isArray(formData.specialistIn) ? formData.specialistIn : []}
                                                            onChange={(selected) => setFormData((prev) => ({ ...prev, specialistIn: selected }))}
                                                            placeholder="Select specialties..."
                                                            required
                                                            maxHeight="200px"
                                                            showTags={true}
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
                                                            showTags={false}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Profile Photo */}
                                            <div className="border-b pb-4 mb-4">
                                                <h4 className="font-semibold mb-4 text-base sm:text-lg">Profile Photo</h4>
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
                                                                <button
                                                                    type="button"
                                                                    onClick={clearProfilePhoto}
                                                                    className="ti-btn ti-btn-sm !bg-danger !text-white !font-medium !px-2 !py-2 w-fit hover:!bg-danger/90 rounded"
                                                                    title="Remove photo"
                                                                >
                                                                    <i className="ri-delete-bin-line"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => profilePhotoInputRef.current?.click()}
                                                            disabled={uploadingProfilePhoto}
                                                            className="ti-btn ti-btn-primary !bg-primary !text-white !font-medium !px-4 !py-2 w-fit"
                                                        >
                                                            {uploadingProfilePhoto ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                                    Uploading...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="ri-upload-line me-2"></i>
                                                                    {formData.profilePhoto ? 'Change Photo' : 'Upload Profile Photo'}
                                                                </>
                                                            )}
                                                        </button>
                                                        <small className="text-muted text-sm">
                                                            Supported formats: JPG, PNG, GIF (Max 5MB)
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Additional Images */}
                                            <div className="pb-4 mb-4">
                                                <h4 className="font-semibold mb-4 text-base sm:text-lg">Additional Images</h4>
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
                                                            className="ti-btn ti-btn-primary !bg-primary !text-white !font-medium !px-4 !py-2 w-fit"
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
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
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
                                                                            className="absolute top-2 right-2 ti-btn ti-btn-sm ti-btn-danger opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            title="Remove image"
                                                                        >
                                                                            <i className="ri-close-line"></i>
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

                                        <div className="grid grid-cols-12 gap-y-4 mt-4 sm:mt-6">
                                            <div className="xl:col-span-12 col-span-12">
                                                <button
                                                    type="submit"
                                                    className="ti-btn ti-btn-primary w-full !bg-primary !text-white !font-medium text-sm sm:text-base py-2.5 sm:py-3"
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Registering...' : 'Register as Trainer'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="xxl:col-span-2 xl:col-span-2 lg:col-span-2 md:col-span-1 sm:col-span-1 col-span-0"></div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default TrainerRegister;

