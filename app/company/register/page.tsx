"use client";
import Seo from '@/shared/layout-components/seo/seo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { Fragment, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Base_url } from '@/Config/BaseUrl';
import CompanyService, { CreateCompanyRequest, ContactPerson } from '@/services/companyService';
import CompanyRegisterFormFields from '@/shared/components/company/CompanyRegisterFormFields';
import TrainerFormFieldError from '@/shared/components/trainer/TrainerFormFieldError';
import {
    COMPANY_REGISTRATION_FIELD_IDS,
    CompanyRegistrationField,
    mapBackendErrorToCompanyField,
    normalizeCompanyDomain,
    validateCompanyRegistration,
} from '@/shared/utils/companyRegistrationValidation';
import '@/shared/styles/portal-brand.css';
import '@/shared/styles/trainer-form.css';

const HERO_FEATURES = [
    { icon: 'ri-team-line', title: 'Book wellness trainers', desc: 'Access certified wellbeing experts.' },
    { icon: 'ri-calendar-check-line', title: 'Manage sessions easily', desc: 'Schedule and track corporate wellness programs in one place.' },
    { icon: 'ri-line-chart-line', title: 'Measure impact', desc: 'Build a healthier workforce with structured wellness initiatives.' },
];

const CompanyRegister = () => {
    const router = useRouter();

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
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<CompanyRegistrationField, string>>>({});
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<CreateCompanyRequest>({
        companyName: '',
        companyLogo: '',
        email: '',
        domain: '',
        numberOfEmployees: undefined,
        gstNumber: '',
        panNumber: '',
        address: '',
        city: '',
        pincode: '',
        country: 'India',
        contactPerson1: {
            name: '',
            email: '',
            mobileNumber: '',
            designation: '',
        },
        contactPerson2: {
            name: '',
            email: '',
            mobileNumber: '',
            designation: '',
        },
        status: true,
    });

    /** Remove a field error after the user edits that input. */
    const clearFieldError = (field: CompanyRegistrationField) => {
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    /** Build input class names with optional validation error styling. */
    const fieldClass = (field: CompanyRegistrationField, extra = '') => {
        const hasError = Boolean(fieldErrors[field]);
        return `form-control trainer-form-control${extra}${hasError ? ' trainer-form-control-error' : ''}`;
    };

    /** Scroll to the first invalid field and focus it when possible. */
    const scrollToField = (field?: CompanyRegistrationField) => {
        if (!field) return;
        const el = document.getElementById(COMPANY_REGISTRATION_FIELD_IDS[field]);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
            el.focus();
        }
    };

    /**
     * Update a contact person field in form state.
     *
     * @param personNumber - Primary (1) or secondary (2) contact.
     * @param field - Contact field key to update.
     * @param value - New field value.
     */
    const updateContactPerson = (
        personNumber: 1 | 2,
        field: keyof ContactPerson,
        value: string
    ) => {
        const contactPersonKey = personNumber === 1 ? 'contactPerson1' : 'contactPerson2';
        setFormData((prev) => ({
            ...prev,
            [contactPersonKey]: {
                ...prev[contactPersonKey],
                [field]: value,
            },
        }));
    };

    /**
     * Upload the selected logo file to the storage endpoint.
     *
     * @param file - The image file chosen by the user.
     */
    const uploadCompanyLogo = async (file: File) => {
        try {
            setUploadingLogo(true);

            const body = new FormData();
            body.append('file', file);

            const token = localStorage.getItem('token');
            const response = await axios.post(`${Base_url}/upload`, body, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });

            if (response.data?.success && response.data?.url) {
                setFormData((prev) => ({ ...prev, companyLogo: response.data.url }));
                clearFieldError('companyLogo');
                Swal.fire('Success!', 'Company logo uploaded successfully', 'success');
            } else {
                throw new Error('Upload failed: Invalid response');
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
            console.error('Logo upload error:', err);
            Swal.fire(
                'Error!',
                axiosErr.response?.data?.message || axiosErr.message || 'Failed to upload logo',
                'error'
            );
        } finally {
            setUploadingLogo(false);
        }
    };

    /**
     * Validate and handle the logo file input change event.
     *
     * @param e - Change event from the hidden file input.
     */
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            void uploadCompanyLogo(file);
        }
        if (logoInputRef.current) {
            logoInputRef.current.value = '';
        }
    };

    /** Clear the currently selected company logo. */
    const clearCompanyLogo = () => {
        setFormData((prev) => ({ ...prev, companyLogo: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);
        setFieldErrors({});

        const validation = validateCompanyRegistration(formData, agreedToTerms);
        if (!validation.isValid) {
            setFieldErrors(validation.errors);
            setError(validation.firstError || 'Please fix the errors below');
            setLoading(false);
            Swal.fire({
                icon: 'warning',
                title: 'Please check your form',
                text: validation.firstError || 'Some required fields are missing or invalid.',
                confirmButtonColor: '#ed662e',
            });
            scrollToField(validation.firstField);
            return;
        }

        try {
            const submitData: CreateCompanyRequest = {
                companyName: (formData.companyName || '').trim(),
                companyLogo: formData.companyLogo,
                email: (formData.email || '').trim(),
                domain: normalizeCompanyDomain(formData.domain || ''),
                numberOfEmployees: formData.numberOfEmployees,
                gstNumber: (formData.gstNumber || '').trim().toUpperCase(),
                panNumber: (formData.panNumber || '').trim().toUpperCase(),
                address: (formData.address || '').trim(),
                city: (formData.city || '').trim(),
                pincode: (formData.pincode || '').trim(),
                country: (formData.country || '').trim(),
                contactPerson1: {
                    name: (formData.contactPerson1?.name || '').trim(),
                    email: (formData.contactPerson1?.email || '').trim(),
                    mobileNumber: (formData.contactPerson1?.mobileNumber || '').replace(/\D/g, ''),
                    designation: (formData.contactPerson1?.designation || '').trim(),
                },
                contactPerson2: {
                    name: (formData.contactPerson2?.name || '').trim(),
                    email: (formData.contactPerson2?.email || '').trim(),
                    mobileNumber: (formData.contactPerson2?.mobileNumber || '').replace(/\D/g, ''),
                    designation: (formData.contactPerson2?.designation || '').trim(),
                },
                status: formData.status,
            };

            await CompanyService.createCompany(submitData);
            setSuccess(true);
            setTimeout(() => {
                router.push('/company/login');
            }, 3000);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to register company. Please try again or contact support.';
            if (message.includes('401') || message.includes('403') || message.includes('Unauthorized')) {
                setError('Registration requires admin approval. Your request has been noted. Please contact support or wait for admin approval.');
                setSuccess(true);
            } else {
                setError(message);
                const backendField = mapBackendErrorToCompanyField(message);
                if (backendField) {
                    setFieldErrors({ [backendField]: message.split(',')[0].trim() });
                    scrollToField(backendField);
                }
                Swal.fire({
                    icon: 'error',
                    title: 'Registration failed',
                    text: message,
                    confirmButtonColor: '#ed662e',
                });
            }
        } finally {
            setLoading(false);
        }
    };

    if (success && !error) {
        return (
            <Fragment>
                <Seo title={"Company Registration"} />
                <div className="h-dvh min-h-0 overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-bodybg dark:via-bodybg dark:to-bodybg">
                    <div className="w-full max-w-md text-center bg-white dark:bg-bodybg rounded-2xl shadow-2xl border border-defaultborder/50 p-8 sm:p-10">
                        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                            <i className="ri-checkbox-circle-fill text-success text-5xl" aria-hidden="true"></i>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-defaulttextcolor mb-2">
                            Registration Successful!
                        </h3>
                        <p className="text-[#8c9097] dark:text-white/50 text-sm sm:text-base mb-6">
                            Your company has been registered. You will be redirected to the login page shortly.
                        </p>
                        <Link
                            href="/company/login"
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
            <Seo title={"Company Registration"} />
            <div className="trainer-auth-shell h-dvh min-h-0 overflow-hidden p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-bodybg dark:via-bodybg dark:to-bodybg text-defaultsize text-defaulttextcolor">
                <div className="trainer-auth-card w-full max-w-6xl h-full mx-auto min-h-0 grid grid-cols-1 lg:grid-cols-12 grid-rows-[minmax(0,1fr)] bg-white dark:bg-bodybg rounded-2xl shadow-2xl overflow-hidden border border-defaultborder/50">
                    <aside
                        className="trainer-auth-aside hidden lg:flex lg:col-span-5 min-h-0 relative p-6 xl:p-8 2xl:p-10 text-white bg-gradient-to-br from-primary to-primary/70"
                        aria-label="Company registration information"
                    >
                        <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-white/10 pointer-events-none" aria-hidden="true"></div>
                        <div className="absolute -bottom-24 -left-12 w-72 h-72 rounded-full bg-white/5 pointer-events-none" aria-hidden="true"></div>

                        <div className="trainer-auth-aside-inner relative z-10 w-full">
                            <div>
                                <div className="trainer-auth-aside-logo-wrap inline-flex items-center justify-center bg-white rounded-xl p-1.5 mb-8 xl:mb-10 shadow-lg leading-none">
                                    <img
                                        src="/assets/images/logo.jpeg"
                                        alt="Samsara"
                                        className="trainer-auth-aside-logo h-20 xl:h-24 2xl:h-28 w-auto max-w-[220px] object-contain block"
                                    />
                                </div>
                                <h1 className="trainer-auth-aside-title text-2xl xl:text-3xl font-bold leading-tight mb-4">
                                    Bring wellness to your organization
                                </h1>
                                <p className="trainer-auth-aside-subtitle text-white/80 text-sm leading-relaxed mb-6 xl:mb-9">
                                    Register your company on Samsara Wellness to book certified trainers and run
                                    corporate wellness programs for your teams.
                                </p>

                                <ul className="trainer-auth-aside-features space-y-4 xl:space-y-5">
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

                            <div className="trainer-auth-aside-footer space-y-3 pt-2">
                                <p className="text-white/70 text-sm mb-0">Already have an account?</p>
                                <Link
                                    href="/company/login"
                                    className="inline-flex items-center justify-center w-full min-h-[48px] px-6 py-3 rounded-xl bg-white text-primary font-bold text-base hover:bg-white/90 transition-colors shadow-lg"
                                >
                                    Sign in
                                </Link>
                                <p className="text-white/50 text-[0.65rem] leading-relaxed">
                                    Copyright&copy; 2025 Samsaraa WellTek Pvt Ltd. All rights reserved.
                                </p>
                            </div>
                        </div>
                    </aside>

                    <div className="trainer-auth-panel trainer-register-scroll lg:col-span-7 min-h-0 p-6 sm:p-8 lg:p-10 pb-8">
                        <div className="mb-6">
                            <img
                                src="/assets/images/logo.jpeg"
                                alt="Samsara"
                                className="h-20 sm:h-24 w-auto mb-4 lg:hidden"
                            />
                            <h2 className="text-xl sm:text-2xl font-bold text-defaulttextcolor">Company Registration</h2>
                            <p className="text-[#8c9097] dark:text-white/50 text-sm mt-1">
                                Fill in your company details to create an account.
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
                            <CompanyRegisterFormFields
                                formData={formData}
                                setFormData={setFormData}
                                updateContactPerson={updateContactPerson}
                                logoInputRef={logoInputRef}
                                uploadingLogo={uploadingLogo}
                                onLogoChange={handleLogoChange}
                                onClearLogo={clearCompanyLogo}
                                fieldErrors={fieldErrors}
                                fieldClass={fieldClass}
                                clearFieldError={clearFieldError}
                            />

                            <div className="trainer-form-terms-wrap mt-4" id="company-reg-terms">
                                <div
                                    className={`trainer-form-terms-row${fieldErrors.agreedToTerms ? ' trainer-form-control-error' : ''}`}
                                >
                                    <input
                                        id="company-reg-terms-checkbox"
                                        type="checkbox"
                                        checked={agreedToTerms}
                                        onChange={(e) => {
                                            clearFieldError('agreedToTerms');
                                            setAgreedToTerms(e.target.checked);
                                        }}
                                        aria-label="Agree to terms and conditions"
                                        aria-invalid={Boolean(fieldErrors.agreedToTerms)}
                                        aria-describedby={fieldErrors.agreedToTerms ? 'company-reg-terms-error' : 'company-reg-terms-text'}
                                    />
                                    <div id="company-reg-terms-text" className="trainer-form-terms-text">
                                        <label htmlFor="company-reg-terms-checkbox" className="trainer-form-terms-label">
                                            I agree to the{' '}
                                            <Link
                                                href="/company/legal#terms"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Terms &amp; Conditions
                                            </Link>
                                            {' '}and{' '}
                                            <Link
                                                href="/company/legal#privacy"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Privacy Policy
                                            </Link>
                                            . I confirm that all information provided is accurate and I consent to my
                                            company profile being listed on the platform for wellness program outreach.
                                        </label>
                                    </div>
                                </div>
                                <TrainerFormFieldError message={fieldErrors.agreedToTerms} fieldId="company-reg-terms" />
                            </div>

                            <div className="pt-4 mt-2">
                                <button
                                    type="submit"
                                    className="ti-btn ti-btn-primary w-full min-h-[52px] !bg-primary !text-white !font-bold text-base sm:text-lg !py-3.5 inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-70"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                            Registering...
                                        </>
                                    ) : (
                                        <>
                                            <i className="ri-building-line" aria-hidden="true"></i>
                                            Register Company
                                        </>
                                    )}
                                </button>
                                <div className="text-center mt-4 space-y-3 lg:hidden">
                                    <p className="text-sm text-muted mb-0">Already have an account?</p>
                                    <Link
                                        href="/company/login"
                                        className="ti-btn ti-btn-primary w-full min-h-[52px] !bg-primary !text-white !font-bold text-base sm:text-lg !py-3.5 inline-flex items-center justify-center shadow-lg shadow-primary/20"
                                    >
                                        Sign in
                                    </Link>
                                    <p className="text-[0.65rem] text-[#8c9097] dark:text-white/50 leading-relaxed">
                                        Copyright&copy; 2025 Samsaraa WellTek Pvt Ltd. All rights reserved.
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

export default CompanyRegister;
