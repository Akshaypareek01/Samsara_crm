"use client";
import Seo from '@/shared/layout-components/seo/seo';
import Link from 'next/link';
import React, { Fragment, useEffect, useState, useRef } from 'react';
import TrainerService, { CreateTrainerRequest, TrainerImage } from '@/services/trainerService';
import axios from 'axios';
import { Base_url } from '@/Config/BaseUrl';
import Swal from 'sweetalert2';
import TrainerRegisterFormFields from '@/shared/components/trainer/TrainerRegisterFormFields';
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
const HERO_FEATURES = [
    { icon: 'ri-team-line', title: 'Reach a wider audience', desc: 'Get discovered by corporate clients seeking wellness experts.' },
    { icon: 'ri-calendar-check-line', title: 'Effortless scheduling', desc: 'Manage all your bookings from one dashboard.' },
    { icon: 'ri-line-chart-line', title: 'Grow your practice', desc: 'Build credibility and expand your wellness offerings.' },
];

const TrainerRegister = () => {
    /** Prevent document-level scroll; form panel scrolls internally. */
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

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
                <div className="h-dvh min-h-0 overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-bodybg dark:via-bodybg dark:to-bodybg">
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
                        <Link
                            href="/trainer/login"
                            className="ti-btn ti-btn-primary !bg-primary !text-white !font-medium w-full !py-2.5 inline-flex items-center justify-center gap-2"
                        >
                            <i className="ri-login-circle-line" aria-hidden="true"></i> Go to Login
                        </Link>
                    </div>
                </div>
            </Fragment>
        );
    }

    return (
        <Fragment>
            <Seo title={"Trainer Registration"} />
            <div className="h-dvh min-h-0 overflow-hidden p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-bodybg dark:via-bodybg dark:to-bodybg text-defaultsize text-defaulttextcolor">
                <div className="w-full max-w-6xl h-full mx-auto min-h-0 grid grid-cols-1 lg:grid-cols-12 grid-rows-[minmax(0,1fr)] bg-white dark:bg-bodybg rounded-2xl shadow-2xl overflow-hidden border border-defaultborder/50">
                    <aside className="hidden lg:flex lg:col-span-5 min-h-0 flex-col justify-between relative overflow-hidden p-10 text-white bg-gradient-to-br from-primary to-primary/70">
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
                                {HERO_FEATURES.map((feature) => (
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

                        <div className="relative z-10 mt-10 space-y-2">
                            <p className="text-white/60 text-xs">
                                Already have an account?{' '}
                                <Link href="/trainer/login" className="text-white font-semibold underline underline-offset-2">
                                    Sign in
                                </Link>
                            </p>
                            <p className="text-white/50 text-[0.65rem] leading-relaxed">
                                Copyright&copy; 2025 Samsaraa Wellness Pvt Ltd. All rights reserved.
                            </p>
                        </div>
                    </aside>

                    <div className="lg:col-span-7 min-h-0 overflow-y-auto overscroll-contain p-6 sm:p-8 lg:p-10 pb-8">
                        <div className="mb-6">
                            <img
                                src="/assets/images/logo.jpeg"
                                alt="Samsara"
                                className="h-20 sm:h-24 w-auto mb-4 lg:hidden"
                            />
                            <h2 className="text-xl sm:text-2xl font-bold text-defaulttextcolor">Trainer Registration</h2>
                            <p className="text-[#8c9097] dark:text-white/50 text-sm mt-1">
                                Fill in your details to create an account.
                            </p>
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className={`trainer-form-error-summary mb-5 ${
                                    success ? 'bg-warning/10 text-warning border-warning/20' : ''
                                }`}
                            >
                                <div className="flex items-start gap-2">
                                    <i
                                        className={`${success ? 'ri-error-warning-line' : 'ri-close-circle-line'} text-base mt-0.5`}
                                        aria-hidden="true"
                                    ></i>
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

                        <form onSubmit={handleSubmit}>
                            <TrainerRegisterFormFields
                                formData={formData}
                                setFormData={setFormData}
                                patchDetails={patchDetails}
                                setFieldErrors={setFieldErrors}
                                fieldErrors={fieldErrors}
                                fieldClass={fieldClass}
                                clearFieldError={clearFieldError}
                                profilePhotoInputRef={profilePhotoInputRef}
                                galleryInputRefs={galleryInputRefs}
                                uploadingProfilePhoto={uploadingProfilePhoto}
                                uploadingGallerySlot={uploadingGallerySlot}
                                onProfilePhotoChange={handleProfilePhotoChange}
                                onGallerySlotChange={handleGallerySlotChange}
                                onClearProfilePhoto={clearProfilePhoto}
                                onRemoveGalleryImage={removeImage}
                            />

                            <div className="trainer-form-terms-wrap mt-4" id="reg-terms">
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
                                            <Link
                                                href="/trainer/legal#terms"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Terms &amp; Conditions
                                            </Link>
                                            {' '}and{' '}
                                            <Link
                                                href="/trainer/legal#privacy"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Privacy Policy
                                            </Link>
                                            . I confirm that all information provided is accurate and I consent to my
                                            profile being listed on the platform for organizational outreach.
                                        </label>
                                    </div>
                                </div>
                                <TrainerFormFieldError message={fieldErrors.agreedToTerms} fieldId="reg-terms" />
                            </div>

                            <div className="pt-4 mt-2">
                                <button
                                    type="submit"
                                    className="ti-btn ti-btn-primary w-full !bg-primary !text-white !font-semibold text-sm sm:text-base !py-3 inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-70"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                            Registering...
                                        </>
                                    ) : (
                                        <>
                                            <i className="ri-user-add-line" aria-hidden="true"></i>
                                            Register as Trainer
                                        </>
                                    )}
                                </button>
                                <div className="text-center mt-3 space-y-2 lg:hidden">
                                    <p className="text-xs text-muted">
                                        Already have an account?{' '}
                                        <Link href="/trainer/login" className="text-primary font-semibold">
                                            Sign in
                                        </Link>
                                    </p>
                                    <p className="text-[0.65rem] text-[#8c9097] dark:text-white/50 leading-relaxed">
                                        Copyright&copy; 2025 Samsaraa Wellness Pvt Ltd. All rights reserved.
                                    </p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default TrainerRegister;

