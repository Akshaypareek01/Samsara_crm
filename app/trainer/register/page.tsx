"use client";
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useState, useRef } from 'react';
import TrainerService, {
  CreateTrainerRequest,
  SPECIALIST_OPTIONS,
  TRAINER_CATEGORY_OPTIONS,
  TYPE_OF_TRAINING_OPTIONS,
  TrainerImage,
} from '@/services/trainerService';
import axios from 'axios';
import { Base_url } from '@/Config/BaseUrl';
import Swal from 'sweetalert2';
import MultiSelect from '@/shared/components/MultiSelect';
import TrainerPersonalDetailsFields from '@/shared/components/trainer/TrainerPersonalDetailsFields';
import TrainerQualificationFields from '@/shared/components/trainer/TrainerQualificationFields';
import {
  filterFilledCertificationEntries,
  filterFilledEducationEntries,
} from '@/shared/utils/trainerQualificationUtils';

/** Maximum number of gallery (additional) images a trainer may upload. */
const MAX_GALLERY_IMAGES = 3;

const TrainerRegister = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const profilePhotoInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    
    const [formData, setFormData] = useState<CreateTrainerRequest>({
        name: '',
        title: '',
        bio: '',
        category: '',
        email: '',
        mobile: '',
        specialistIn: [],
        typeOfTraining: [],
        dateOfBirth: null,
        city: '',
        pinCode: '',
        experience: '',
        education: [],
        certification: [],
        images: [],
        profilePhoto: null,
        status: true,
    });

    /** Merge a partial patch (incl. nested education/certification) into form state. */
    const patchDetails = (patch: Partial<CreateTrainerRequest>) =>
        setFormData((prev) => ({ ...prev, ...patch }));

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
            if ((formData.images?.length || 0) >= MAX_GALLERY_IMAGES) {
                Swal.fire('Limit reached', `You can upload a maximum of ${MAX_GALLERY_IMAGES} gallery images`, 'info');
                if (imageInputRef.current) {
                    imageInputRef.current.value = '';
                }
                return;
            }
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
        
        if (
            !formData.name ||
            !formData.title ||
            !formData.bio ||
            !formData.category ||
            !formData.email ||
            !formData.mobile ||
            !formData.dateOfBirth ||
            !formData.city ||
            !formData.pinCode ||
            !formData.experience ||
            specialistInArray.length === 0 ||
            typeOfTrainingArray.length === 0
        ) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        if (!agreedToTerms) {
            setError('Please accept the Terms & Conditions to continue');
            setLoading(false);
            return;
        }

        if (!/^[0-9]{6}$/.test(formData.pinCode || '')) {
            setError('Please enter a valid 6-digit PIN code');
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
                category: formData.category,
                email: formData.email.trim(),
                mobile: formData.mobile.replace(/\D/g, ''), // Remove non-digits
                specialistIn: Array.isArray(formData.specialistIn) ? formData.specialistIn : [formData.specialistIn].filter(Boolean),
                typeOfTraining: Array.isArray(formData.typeOfTraining) ? formData.typeOfTraining : [formData.typeOfTraining].filter(Boolean),
                dateOfBirth: formData.dateOfBirth,
                city: (formData.city || '').trim(),
                pinCode: formData.pinCode,
                experience: formData.experience,
                status: formData.status,
            };

            const filledEducation = filterFilledEducationEntries(formData.education);
            const filledCertification = filterFilledCertificationEntries(formData.certification);

            if (filledEducation.length > 0) {
                submitData.education = filledEducation;
            }
            if (filledCertification.length > 0) {
                submitData.certification = filledCertification;
            }

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
                <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-bodybg dark:via-bodybg dark:to-bodybg">
                    <div className="w-full max-w-md text-center bg-white dark:bg-bodybg rounded-2xl shadow-2xl border border-defaultborder/50 p-8 sm:p-10">
                        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                            <i className="ri-checkbox-circle-fill text-success text-5xl"></i>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-defaulttextcolor mb-2">
                            Registration Successful!
                        </h3>
                        <p className="text-[#8c9097] dark:text-white/50 text-sm sm:text-base mb-6">
                            Your trainer profile has been created. Thanks for joining Samsara — you can now sign in to manage your profile and bookings.
                        </p>
                        <a
                            href="/trainer/login"
                            className="ti-btn ti-btn-primary !bg-primary !text-white !font-medium w-full !py-2.5 inline-flex items-center justify-center gap-2"
                        >
                            <i className="ri-login-circle-line"></i> Go to Login
                        </a>
                    </div>
                </div>
            </Fragment>
        );
    }

    return (
        <Fragment>
            <Seo title={"Trainer Registration"} />
            <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-bodybg dark:via-bodybg dark:to-bodybg text-defaultsize text-defaulttextcolor">
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-bodybg rounded-2xl shadow-2xl overflow-hidden border border-defaultborder/50">
                    {/* ── Brand / Hero panel ── */}
                    <aside className="hidden lg:flex lg:col-span-5 flex-col justify-between relative overflow-hidden p-10 text-white bg-gradient-to-br from-primary to-primary/70">
                        <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-white/10" aria-hidden="true"></div>
                        <div className="absolute -bottom-24 -left-12 w-72 h-72 rounded-full bg-white/5" aria-hidden="true"></div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center bg-white rounded-xl p-1.5 mb-10 shadow-lg leading-none">
                                <img
                                    src="/assets/images/logosm.png"
                                    alt="Samsara"
                                    className="h-24 xl:h-28 w-auto max-w-[220px] object-contain block"
                                />
                            </div>
                            <h1 className="text-2xl xl:text-3xl font-bold leading-tight mb-4">
                                Share your wellness expertise with the world
                            </h1>
                            <p className="text-white/80 text-sm leading-relaxed mb-9">
                                Join Samsara as a certified trainer and connect with individuals and
                                organizations seeking guidance in yoga, sound healing, and mental wellbeing.
                            </p>

                            <ul className="space-y-5">
                                {[
                                    { icon: 'ri-team-line', title: 'Reach a wider audience', desc: 'Get discovered by users and corporate clients.' },
                                    { icon: 'ri-calendar-check-line', title: 'Effortless scheduling', desc: 'Manage all your bookings from one dashboard.' },
                                    { icon: 'ri-line-chart-line', title: 'Grow your practice', desc: 'Build your profile and track your impact.' },
                                ].map((feature) => (
                                    <li key={feature.title} className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                                            <i className={`${feature.icon} text-xl`} aria-hidden="true"></i>
                                        </span>
                                        <div>
                                            <p className="font-semibold text-sm">{feature.title}</p>
                                            <p className="text-white/70 text-xs">{feature.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <p className="relative z-10 text-white/60 text-xs mt-10">
                            Already have an account?{' '}
                            <a href="/trainer/login" className="text-white font-semibold underline underline-offset-2">
                                Sign in
                            </a>
                        </p>
                    </aside>

                    {/* ── Form panel ── */}
                    <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 max-h-screen overflow-y-auto">
                        <div className="mb-6">
                            <img
                                src="/assets/images/logosm.png"
                                alt="Samsara"
                                className="h-20 sm:h-24 w-auto mb-4 lg:hidden"
                            />
                            <h2 className="text-xl sm:text-2xl font-bold text-defaulttextcolor">Trainer Registration</h2>
                            <p className="text-[#8c9097] dark:text-white/50 text-sm mt-1">
                                Fill in your details to create your trainer profile.
                            </p>
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className={`flex items-start gap-2 mb-5 text-sm p-3 rounded-lg border ${
                                    success
                                        ? 'bg-warning/10 text-warning border-warning/20'
                                        : 'bg-danger/10 text-danger border-danger/20'
                                }`}
                            >
                                <i className={`${success ? 'ri-error-warning-line' : 'ri-close-circle-line'} text-base mt-0.5`} aria-hidden="true"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-7">
                            {/* Section 1 — Basic Information */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">1</span>
                                    <h3 className="font-semibold text-base text-defaulttextcolor">Basic Information</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label" htmlFor="reg-name">Full Name <span className="text-danger">*</span></label>
                                        <div className="relative">
                                            <i className="ri-user-line absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true"></i>
                                            <input
                                                id="reg-name"
                                                type="text"
                                                className="form-control border-2 focus:border-primary !ps-10"
                                                value={formData.name}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                                placeholder="Jane Doe"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label" htmlFor="reg-title">Professional Title <span className="text-danger">*</span></label>
                                        <div className="relative">
                                            <i className="ri-award-line absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true"></i>
                                            <input
                                                id="reg-title"
                                                type="text"
                                                className="form-control border-2 focus:border-primary !ps-10"
                                                value={formData.title}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                                placeholder="e.g., Certified Yoga Instructor"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label" htmlFor="trainer-category">Category <span className="text-danger">*</span></label>
                                        <div className="relative">
                                            <i className="ri-price-tag-3-line absolute left-3 top-1/2 -translate-y-1/2 text-muted z-10" aria-hidden="true"></i>
                                            <select
                                                id="trainer-category"
                                                className="form-control border-2 focus:border-primary !ps-10"
                                                value={formData.category}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                                                required
                                                aria-required="true"
                                            >
                                                <option value="">Select your category</option>
                                                {TRAINER_CATEGORY_OPTIONS.map((cat) => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label" htmlFor="reg-email">Email <span className="text-danger">*</span></label>
                                        <div className="relative">
                                            <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true"></i>
                                            <input
                                                id="reg-email"
                                                type="email"
                                                className="form-control border-2 focus:border-primary !ps-10"
                                                value={formData.email}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                                placeholder="your.email@example.com"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="form-label" htmlFor="reg-mobile">Mobile Number <span className="text-danger">*</span></label>
                                        <div className="relative">
                                            <i className="ri-phone-line absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true"></i>
                                            <input
                                                id="reg-mobile"
                                                type="tel"
                                                className="form-control border-2 focus:border-primary !ps-10"
                                                value={formData.mobile}
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
                                        </div>
                                        <small className="text-muted">10 digits only</small>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <TrainerPersonalDetailsFields
                                            values={{
                                                dateOfBirth: formData.dateOfBirth,
                                                city: formData.city,
                                                pinCode: formData.pinCode,
                                                experience: formData.experience,
                                            }}
                                            onChange={patchDetails}
                                            requiredFields
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="form-label" htmlFor="reg-bio">Bio <span className="text-danger">*</span></label>
                                        <textarea
                                            id="reg-bio"
                                            className="form-control border-2 focus:border-primary"
                                            rows={4}
                                            value={formData.bio}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                                            maxLength={2000}
                                            placeholder="Tell clients about your experience, approach, and what makes your sessions special..."
                                            required
                                        />
                                        <div className="flex justify-end">
                                            <small className={`text-xs ${(formData.bio || '').length > 1900 ? 'text-warning' : 'text-muted'}`}>
                                                {(formData.bio || '').length}/2000 characters
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2 — Training Information */}
                            <section className="pt-6 border-t border-defaultborder/60">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">2</span>
                                    <h3 className="font-semibold text-base text-defaulttextcolor">Training Information</h3>
                                </div>
                                <div className="space-y-4">
                                    <MultiSelect
                                        label="Training For"
                                        options={SPECIALIST_OPTIONS}
                                        value={Array.isArray(formData.specialistIn) ? formData.specialistIn : []}
                                        onChange={(selected) => setFormData((prev) => ({ ...prev, specialistIn: selected }))}
                                        placeholder="Select audience..."
                                        required
                                        maxHeight="200px"
                                        showTags={true}
                                    />
                                    <MultiSelect
                                        label="Specializations"
                                        options={TYPE_OF_TRAINING_OPTIONS}
                                        value={Array.isArray(formData.typeOfTraining) ? formData.typeOfTraining : []}
                                        onChange={(selected) => setFormData((prev) => ({ ...prev, typeOfTraining: selected }))}
                                        placeholder="Select specializations..."
                                        required
                                        maxHeight="300px"
                                        showTags={true}
                                    />
                                </div>
                            </section>

                            {/* Section 2b — Education & Certifications */}
                            <section className="pt-6 border-t border-defaultborder/60">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">3</span>
                                    <h3 className="font-semibold text-base text-defaulttextcolor">
                                        Education &amp; Certifications <span className="text-muted text-xs font-normal">(optional)</span>
                                    </h3>
                                </div>
                                <TrainerQualificationFields
                                    education={formData.education}
                                    certification={formData.certification}
                                    onChange={patchDetails}
                                />
                            </section>

                            {/* Section 3 — Photos */}
                            <section className="pt-6 border-t border-defaultborder/60">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">4</span>
                                    <h3 className="font-semibold text-base text-defaulttextcolor">
                                        Photos <span className="text-muted text-xs font-normal">(optional)</span>
                                    </h3>
                                </div>

                                <input type="file" ref={profilePhotoInputRef} accept="image/*" onChange={handleProfilePhotoChange} className="hidden" />
                                <input type="file" ref={imageInputRef} accept="image/*" onChange={handleImageChange} className="hidden" />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Profile photo */}
                                    <div>
                                        <label className="form-label">Profile Photo</label>
                                        {formData.profilePhoto?.path ? (
                                            <div className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-defaultborder group">
                                                <img
                                                    src={formData.profilePhoto.path}
                                                    alt="Profile preview"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => profilePhotoInputRef.current?.click()}
                                                        className="ti-btn ti-btn-sm !bg-white !text-defaulttextcolor !font-medium"
                                                        title="Change photo"
                                                    >
                                                        <i className="ri-refresh-line"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={clearProfilePhoto}
                                                        className="ti-btn ti-btn-sm !bg-danger !text-white !font-medium"
                                                        title="Remove photo"
                                                    >
                                                        <i className="ri-delete-bin-line"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => profilePhotoInputRef.current?.click()}
                                                disabled={uploadingProfilePhoto}
                                                className="w-full h-40 rounded-xl border-2 border-dashed border-defaultborder hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center gap-1.5 text-muted hover:text-primary transition-colors disabled:opacity-60"
                                            >
                                                {uploadingProfilePhoto ? (
                                                    <><span className="spinner-border spinner-border-sm"></span><span className="text-sm">Uploading...</span></>
                                                ) : (
                                                    <>
                                                        <i className="ri-image-add-line text-3xl"></i>
                                                        <span className="text-sm font-medium">Upload Profile Photo</span>
                                                        <span className="text-xs">JPG, PNG, GIF · Max 5MB</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Additional images uploader */}
                                    <div>
                                        <label className="form-label">
                                            Additional Images{' '}
                                            <span className="text-muted text-xs font-normal">
                                                ({formData.images?.length || 0}/{MAX_GALLERY_IMAGES})
                                            </span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => imageInputRef.current?.click()}
                                            disabled={uploadingImage || (formData.images?.length || 0) >= MAX_GALLERY_IMAGES}
                                            className="w-full h-40 rounded-xl border-2 border-dashed border-defaultborder hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center gap-1.5 text-muted hover:text-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {uploadingImage ? (
                                                <><span className="spinner-border spinner-border-sm"></span><span className="text-sm">Uploading...</span></>
                                            ) : (formData.images?.length || 0) >= MAX_GALLERY_IMAGES ? (
                                                <>
                                                    <i className="ri-checkbox-circle-line text-3xl"></i>
                                                    <span className="text-sm font-medium">Maximum {MAX_GALLERY_IMAGES} images added</span>
                                                    <span className="text-xs">Remove one to add another</span>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="ri-add-circle-line text-3xl"></i>
                                                    <span className="text-sm font-medium">Add Gallery Image</span>
                                                    <span className="text-xs">Up to {MAX_GALLERY_IMAGES} · JPG, PNG, GIF · Max 5MB each</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Gallery thumbnails */}
                                {formData.images && formData.images.length > 0 && (
                                    <div className="mt-4">
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                            {formData.images.map((img, idx) => (
                                                <div key={idx} className="relative group aspect-square">
                                                    <img
                                                        src={img.path}
                                                        alt={`Gallery ${idx + 1}`}
                                                        className="w-full h-full object-cover rounded-lg border border-defaultborder"
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(idx)}
                                                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-danger text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                                        title="Remove image"
                                                    >
                                                        <i className="ri-close-line text-sm"></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <small className="text-muted text-xs mt-2 block">
                                            {formData.images.length} of {MAX_GALLERY_IMAGES} image(s) added
                                        </small>
                                    </div>
                                )}
                            </section>

                            {/* Terms */}
                            <div className="flex items-start gap-3 p-4 rounded-xl border border-defaultborder bg-primary/5">
                                <input
                                    id="reg-terms"
                                    type="checkbox"
                                    className="form-check-input mt-0.5"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    aria-label="Agree to terms and conditions"
                                />
                                <label htmlFor="reg-terms" className="text-sm text-defaulttextcolor/80 leading-relaxed">
                                    I agree to the{' '}
                                    <a href="#" className="text-primary font-semibold">Terms &amp; Conditions</a> and{' '}
                                    <a href="#" className="text-primary font-semibold">Privacy Policy</a>, and confirm that
                                    all information provided is accurate.
                                </label>
                            </div>

                            {/* Submit */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="ti-btn ti-btn-primary w-full !bg-primary !text-white !font-semibold text-sm sm:text-base !py-3 inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-70"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <><span className="spinner-border spinner-border-sm"></span> Registering...</>
                                    ) : (
                                        <><i className="ri-user-add-line"></i> Register as Trainer</>
                                    )}
                                </button>
                                <p className="text-center text-xs text-muted mt-3 lg:hidden">
                                    Already have an account?{' '}
                                    <a href="/trainer/login" className="text-primary font-semibold">Sign in</a>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default TrainerRegister;

