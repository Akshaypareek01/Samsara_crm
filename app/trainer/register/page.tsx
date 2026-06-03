"use client";
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useState, useRef } from 'react';
import TrainerService, {
  CreateTrainerRequest,
  SPECIALIST_OPTIONS,
  TRAINER_CATEGORY_OPTIONS,
  TYPE_OF_TRAINING_OPTIONS,
  EXPERIENCE_OPTIONS,
  TrainerImage,
} from '@/services/trainerService';
import axios from 'axios';
import { Base_url } from '@/Config/BaseUrl';
import Swal from 'sweetalert2';
import TrainerChipSelect from '@/shared/components/trainer/TrainerChipSelect';
import TrainerQualificationFields from '@/shared/components/trainer/TrainerQualificationFields';
import TrainerPhotosFields from '@/shared/components/trainer/TrainerPhotosFields';
import TrainerFormSectionTitle from '@/shared/components/trainer/TrainerFormSectionTitle';
import '@/shared/styles/trainer-form.css';
import {
  filterFilledCertificationEntries,
  filterFilledEducationEntries,
} from '@/shared/utils/trainerQualificationUtils';
import TrainerFormFieldError from '@/shared/components/trainer/TrainerFormFieldError';
import {
  mapBackendErrorToField,
  TRAINER_REGISTRATION_FIELD_IDS,
  TrainerRegistrationField,
  validateTrainerRegistration,
} from '@/shared/utils/trainerRegistrationValidation';
import { getTrainerDobMaxDate, validateTrainerDateOfBirth } from '@/shared/utils/trainerDateUtils';

const TrainerRegister = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
    const [uploadingGallerySlot, setUploadingGallerySlot] = useState<number | null>(null);
    const profilePhotoInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<TrainerRegistrationField, string>>>({});
    
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

    /** Remove a field error after the user edits that input. */
    const clearFieldError = (field: TrainerRegistrationField) => {
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    /** Build input/select class names with optional validation error styling. */
    const fieldClass = (field: TrainerRegistrationField, extra = '') => {
        const hasError = Boolean(fieldErrors[field]);
        return `form-control trainer-form-control${extra}${hasError ? ' trainer-form-control-error' : ''}`;
    };

    /** Scroll to the first invalid field and focus it when possible. */
    const scrollToField = (field?: TrainerRegistrationField) => {
        if (!field) return;
        const el = document.getElementById(TRAINER_REGISTRATION_FIELD_IDS[field]);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
            el.focus();
        }
    };

    const handleFileUpload = async (file: File, isProfilePhoto: boolean = false, slotIndex?: number) => {
        if (!file) {
            return;
        }

        try {
            if (isProfilePhoto) {
                setUploadingProfilePhoto(true);
            } else if (slotIndex !== undefined) {
                setUploadingGallerySlot(slotIndex);
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
                } else if (slotIndex !== undefined) {
                    setFormData((prev) => {
                        const next = [...(prev.images || [])];
                        next[slotIndex] = imageData;
                        return { ...prev, images: next };
                    });
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
                setUploadingGallerySlot(null);
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

    const handleGallerySlotChange = (slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
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
            handleFileUpload(file, false, slotIndex);
        }
        const input = galleryInputRefs.current[slotIndex];
        if (input) input.value = '';
    };

    const removeImage = (index: number) => {
        setFormData((prev) => {
            const newImages = [...(prev.images || [])];
            delete newImages[index];
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
        setFieldErrors({});

        const validation = validateTrainerRegistration(formData, agreedToTerms);
        if (!validation.isValid) {
            setFieldErrors(validation.errors);
            setError(validation.firstError || 'Please fix the errors below');
            setLoading(false);
            Swal.fire({
                icon: 'warning',
                title: 'Please check your form',
                text: validation.firstError || 'Some required fields are missing or invalid.',
                confirmButtonColor: '#845ADF',
            });
            scrollToField(validation.firstField);
            return;
        }

        try {
            const submitData: CreateTrainerRequest = {
                name: formData.name.trim(),
                title: formData.title.trim(),
                bio: formData.bio.trim(),
                category: formData.category,
                email: formData.email.trim(),
                mobile: formData.mobile.replace(/\D/g, ''),
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
                submitData.images = formData.images.filter((img): img is TrainerImage => Boolean(img));
            }

            // Only include profilePhoto if it exists
            if (formData.profilePhoto) {
                submitData.profilePhoto = formData.profilePhoto;
            }

            await TrainerService.createTrainer(submitData);
            
            setSuccess(true);
        } catch (err: any) {
            const message = err.message || 'Failed to register trainer. Please try again or contact support.';
            if (message.includes('401') || message.includes('403') || message.includes('Unauthorized')) {
                setError('Registration requires admin approval. Your request has been noted. Please contact support or wait for admin approval.');
                setSuccess(true);
            } else {
                setError(message);
                const backendField = mapBackendErrorToField(message);
                if (backendField) {
                    setFieldErrors({ [backendField]: message.split(',')[0].trim() });
                    scrollToField(backendField);
                }
                Swal.fire({
                    icon: 'error',
                    title: 'Registration failed',
                    text: message,
                    confirmButtonColor: '#845ADF',
                });
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
                                    src="/assets/images/logo.jpeg"
                                    alt="Samsara"
                                    className="h-24 xl:h-28 w-auto max-w-[220px] object-contain block"
                                />
                            </div>
                            <h1 className="text-2xl xl:text-3xl font-bold leading-tight mb-4">
                                Share your wellness expertise with the world
                            </h1>
                            <p className="text-white/80 text-sm leading-relaxed mb-9">
                                Join Samsara Wellness as a certified trainer and connect with
                                organizations seeking guidance in wellness.
                            </p>

                            <ul className="space-y-5">
                                {[
                                    { icon: 'ri-team-line', title: 'Reach a wider audience', desc: 'Get discovered by corporate clients.' },
                                    { icon: 'ri-calendar-check-line', title: 'Effortless scheduling', desc: 'Manage all your bookings from one dashboard.' },
                                    
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
                                src="/assets/images/logo.jpeg"
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
                                className={`trainer-form-error-summary ${
                                    success ? 'bg-warning/10 text-warning border-warning/20' : ''
                                }`}
                            >
                                <div className="flex items-start gap-2">
                                    <i className={`${success ? 'ri-error-warning-line' : 'ri-close-circle-line'} text-base mt-0.5`} aria-hidden="true"></i>
                                    <div>
                                        <strong>{success ? 'Notice' : 'Please fix the following'}</strong>
                                        <p className="mb-0 mt-1">{error}</p>
                                        {!success && Object.keys(fieldErrors).length > 1 && (
                                            <ul>
                                                {Object.entries(fieldErrors).map(([field, msg]) => (
                                                    <li key={field}>{msg}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-2">
                            {/* Trainer Type — first section per HTML mock */}
                            <section>
                                <TrainerFormSectionTitle title="Trainer Type" iconClass="ri-id-card-line" />
                                <div>
                                    <label className="trainer-form-label" htmlFor="trainer-category">
                                        Trainer Category <span className="trainer-form-req">*</span>
                                    </label>
                                    <select
                                        id="trainer-category"
                                        className={`${fieldClass('category')} trainer-form-select`}
                                        value={formData.category}
                                        onChange={(e) => {
                                            clearFieldError('category');
                                            setFormData((prev) => ({ ...prev, category: e.target.value }));
                                        }}
                                        required
                                        aria-required="true"
                                        aria-invalid={Boolean(fieldErrors.category)}
                                        aria-describedby={fieldErrors.category ? 'trainer-category-error' : undefined}
                                    >
                                        <option value="">— Select trainer type —</option>
                                        {TRAINER_CATEGORY_OPTIONS.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <TrainerFormFieldError message={fieldErrors.category} fieldId="trainer-category" />
                                </div>
                            </section>

                            {/* Personal Details */}
                            <section>
                                <TrainerFormSectionTitle title="Personal Details" iconClass="ri-user-line" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="trainer-form-label" htmlFor="reg-name">
                                            Full Name <span className="trainer-form-req">*</span>
                                        </label>
                                        <input
                                            id="reg-name"
                                            type="text"
                                            className={fieldClass('name')}
                                            value={formData.name}
                                            onChange={(e) => {
                                                clearFieldError('name');
                                                setFormData((prev) => ({ ...prev, name: e.target.value }));
                                            }}
                                            placeholder="Jane Doe"
                                            required
                                            aria-invalid={Boolean(fieldErrors.name)}
                                            aria-describedby={fieldErrors.name ? 'reg-name-error' : undefined}
                                        />
                                        <TrainerFormFieldError message={fieldErrors.name} fieldId="reg-name" />
                                    </div>
                                    <div>
                                        <label className="trainer-form-label" htmlFor="reg-title">
                                            Professional Title <span className="trainer-form-req">*</span>
                                        </label>
                                        <input
                                            id="reg-title"
                                            type="text"
                                            className={fieldClass('title')}
                                            value={formData.title}
                                            onChange={(e) => {
                                                clearFieldError('title');
                                                setFormData((prev) => ({ ...prev, title: e.target.value }));
                                            }}
                                            placeholder="e.g., Certified Yoga Instructor"
                                            required
                                            aria-invalid={Boolean(fieldErrors.title)}
                                            aria-describedby={fieldErrors.title ? 'reg-title-error' : undefined}
                                        />
                                        <TrainerFormFieldError message={fieldErrors.title} fieldId="reg-title" />
                                    </div>
                                    <div>
                                        <label className="trainer-form-label" htmlFor="trainer-dob">
                                            Date of Birth <span className="trainer-form-req">*</span>
                                        </label>
                                        <input
                                            id="trainer-dob"
                                            type="date"
                                            className={fieldClass('dateOfBirth')}
                                            value={formData.dateOfBirth ? String(formData.dateOfBirth).slice(0, 10) : ''}
                                            max={getTrainerDobMaxDate()}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const dobError = value ? validateTrainerDateOfBirth(value) : undefined;
                                                if (dobError && value) {
                                                    setFieldErrors((prev) => ({ ...prev, dateOfBirth: dobError }));
                                                    return;
                                                }
                                                clearFieldError('dateOfBirth');
                                                patchDetails({ dateOfBirth: value || null });
                                            }}
                                            required
                                            aria-invalid={Boolean(fieldErrors.dateOfBirth)}
                                            aria-describedby={fieldErrors.dateOfBirth ? 'trainer-dob-error' : undefined}
                                        />
                                        <TrainerFormFieldError message={fieldErrors.dateOfBirth} fieldId="trainer-dob" />
                                    </div>
                                    <div>
                                        <label className="trainer-form-label" htmlFor="reg-mobile">
                                            Mobile Number <span className="trainer-form-req">*</span>
                                        </label>
                                        <input
                                            id="reg-mobile"
                                            type="tel"
                                            className={fieldClass('mobile')}
                                            value={formData.mobile}
                                            onChange={(e) => {
                                                clearFieldError('mobile');
                                                const value = e.target.value.replace(/\D/g, '');
                                                if (value.length <= 10) {
                                                    setFormData((prev) => ({ ...prev, mobile: value }));
                                                }
                                            }}
                                            placeholder="1234567890"
                                            maxLength={10}
                                            inputMode="numeric"
                                            required
                                            aria-invalid={Boolean(fieldErrors.mobile)}
                                            aria-describedby={fieldErrors.mobile ? 'reg-mobile-error' : undefined}
                                        />
                                        <TrainerFormFieldError message={fieldErrors.mobile} fieldId="reg-mobile" />
                                        {!fieldErrors.mobile && (
                                            <small className="text-muted text-xs mt-1 block">10 digits only</small>
                                        )}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="trainer-form-label" htmlFor="reg-email">
                                            Email ID <span className="trainer-form-req">*</span>
                                        </label>
                                        <input
                                            id="reg-email"
                                            type="email"
                                            className={fieldClass('email')}
                                            value={formData.email}
                                            onChange={(e) => {
                                                clearFieldError('email');
                                                setFormData((prev) => ({ ...prev, email: e.target.value }));
                                            }}
                                            placeholder="you@email.com"
                                            required
                                            aria-invalid={Boolean(fieldErrors.email)}
                                            aria-describedby={fieldErrors.email ? 'reg-email-error' : undefined}
                                        />
                                        <TrainerFormFieldError message={fieldErrors.email} fieldId="reg-email" />
                                    </div>
                                    <div>
                                        <label className="trainer-form-label" htmlFor="trainer-city">
                                            City <span className="trainer-form-req">*</span>
                                        </label>
                                        <input
                                            id="trainer-city"
                                            type="text"
                                            className={fieldClass('city')}
                                            value={formData.city || ''}
                                            onChange={(e) => {
                                                clearFieldError('city');
                                                patchDetails({ city: e.target.value });
                                            }}
                                            placeholder="Your city"
                                            required
                                            aria-invalid={Boolean(fieldErrors.city)}
                                            aria-describedby={fieldErrors.city ? 'trainer-city-error' : undefined}
                                        />
                                        <TrainerFormFieldError message={fieldErrors.city} fieldId="trainer-city" />
                                    </div>
                                    <div>
                                        <label className="trainer-form-label" htmlFor="trainer-pincode">
                                            PIN Code <span className="trainer-form-req">*</span>
                                        </label>
                                        <input
                                            id="trainer-pincode"
                                            type="text"
                                            inputMode="numeric"
                                            className={fieldClass('pinCode')}
                                            value={formData.pinCode || ''}
                                            onChange={(e) => {
                                                clearFieldError('pinCode');
                                                const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                patchDetails({ pinCode: digits });
                                            }}
                                            placeholder="6-digit PIN"
                                            maxLength={6}
                                            required
                                            aria-invalid={Boolean(fieldErrors.pinCode)}
                                            aria-describedby={fieldErrors.pinCode ? 'trainer-pincode-error' : undefined}
                                        />
                                        <TrainerFormFieldError message={fieldErrors.pinCode} fieldId="trainer-pincode" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="trainer-form-label" htmlFor="trainer-experience">
                                            Years of Experience <span className="trainer-form-req">*</span>
                                        </label>
                                        <select
                                            id="trainer-experience"
                                            className={`${fieldClass('experience')} trainer-form-select`}
                                            value={formData.experience || ''}
                                            onChange={(e) => {
                                                clearFieldError('experience');
                                                patchDetails({ experience: e.target.value });
                                            }}
                                            required
                                            aria-invalid={Boolean(fieldErrors.experience)}
                                            aria-describedby={fieldErrors.experience ? 'trainer-experience-error' : undefined}
                                        >
                                            <option value="">— Select experience range —</option>
                                            {EXPERIENCE_OPTIONS.map((opt) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        <TrainerFormFieldError message={fieldErrors.experience} fieldId="trainer-experience" />
                                    </div>
                                </div>
                            </section>

                            {/* Education & Certifications */}
                            <section>
                                <TrainerQualificationFields
                                    education={formData.education}
                                    certification={formData.certification}
                                    onChange={patchDetails}
                                />
                            </section>

                            {/* Professional Bio */}
                            <section>
                                <TrainerFormSectionTitle title="Professional Bio" iconClass="ri-file-text-line" />
                                <div>
                                    <label className="trainer-form-label" htmlFor="reg-bio">
                                        About You <span className="trainer-form-req">*</span>
                                    </label>
                                    <textarea
                                        id="reg-bio"
                                        className={`${fieldClass('bio')} trainer-form-textarea`}
                                        rows={4}
                                        value={formData.bio}
                                        onChange={(e) => {
                                            clearFieldError('bio');
                                            setFormData((prev) => ({ ...prev, bio: e.target.value }));
                                        }}
                                        maxLength={2000}
                                        placeholder="Describe your expertise, philosophy, and experience... (max 2000 characters)"
                                        required
                                        aria-invalid={Boolean(fieldErrors.bio)}
                                        aria-describedby={fieldErrors.bio ? 'reg-bio-error' : undefined}
                                    />
                                    <TrainerFormFieldError message={fieldErrors.bio} fieldId="reg-bio" />
                                    <div className="trainer-form-char-count">
                                        {(formData.bio || '').length} / 2000
                                    </div>
                                </div>
                            </section>

                            {/* Training Focus */}
                            <section>
                                <TrainerFormSectionTitle title="Training Focus" iconClass="ri-focus-3-line" />
                                <div className="space-y-4">
                                    <TrainerChipSelect
                                        label="Training For"
                                        fieldId="reg-specialist-in"
                                        options={SPECIALIST_OPTIONS}
                                        value={Array.isArray(formData.specialistIn) ? formData.specialistIn : []}
                                        onChange={(selected) => {
                                            clearFieldError('specialistIn');
                                            setFormData((prev) => ({ ...prev, specialistIn: selected }));
                                        }}
                                        required
                                        error={fieldErrors.specialistIn}
                                    />
                                    <TrainerChipSelect
                                        label="Specializations"
                                        fieldId="reg-type-of-training"
                                        options={TYPE_OF_TRAINING_OPTIONS}
                                        value={Array.isArray(formData.typeOfTraining) ? formData.typeOfTraining : []}
                                        onChange={(selected) => {
                                            clearFieldError('typeOfTraining');
                                            setFormData((prev) => ({ ...prev, typeOfTraining: selected }));
                                        }}
                                        required
                                        error={fieldErrors.typeOfTraining}
                                    />
                                </div>
                            </section>

                            {/* Photos */}
                            <section>
                                <TrainerPhotosFields
                                    profilePhoto={formData.profilePhoto}
                                    images={formData.images}
                                    profilePhotoInputRef={profilePhotoInputRef}
                                    galleryInputRefs={galleryInputRefs}
                                    uploadingProfilePhoto={uploadingProfilePhoto}
                                    uploadingGallerySlot={uploadingGallerySlot}
                                    onProfilePhotoChange={handleProfilePhotoChange}
                                    onGallerySlotChange={handleGallerySlotChange}
                                    onClearProfilePhoto={clearProfilePhoto}
                                    onRemoveGalleryImage={removeImage}
                                />
                            </section>

                            {/* Terms */}
                            <div className="trainer-form-terms-wrap" id="reg-terms">
                                <div
                                    className={`trainer-form-terms-row${fieldErrors.agreedToTerms ? ' trainer-form-control-error' : ''}`}
                                >
                                    <input
                                        id="reg-terms-checkbox"
                                        type="checkbox"
                                        checked={agreedToTerms}
                                        onChange={(e) => {
                                            clearFieldError('agreedToTerms');
                                            setAgreedToTerms(e.target.checked);
                                        }}
                                        aria-label="Agree to terms and conditions"
                                        aria-invalid={Boolean(fieldErrors.agreedToTerms)}
                                        aria-describedby={fieldErrors.agreedToTerms ? 'reg-terms-error' : 'reg-terms-text'}
                                    />
                                    <div id="reg-terms-text" className="trainer-form-terms-text">
                                        <label htmlFor="reg-terms-checkbox" className="trainer-form-terms-label">
                                            I agree to the{' '}
                                            <a href="#" onClick={(e) => e.preventDefault()}>Terms &amp; Conditions</a>
                                            {' '}and{' '}
                                            <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
                                            {' '}I confirm that all information provided is accurate and I consent to my
                                            profile being listed on the platform for organizational outreach.
                                        </label>
                                    </div>
                                </div>
                                <TrainerFormFieldError message={fieldErrors.agreedToTerms} fieldId="reg-terms" />
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

