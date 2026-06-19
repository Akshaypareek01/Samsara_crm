"use client";
import Seo from '@/shared/layout-components/seo/seo';
import Link from 'next/link';
import React, { Fragment, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import TrainerLeadService, {
  CreateTrainerLeadRequest,
  TRAINER_CATEGORY_OPTIONS,
  TRAINER_CITY_OPTIONS,
  TRAINER_LEAD_EXPERIENCE_OPTIONS,
} from '@/services/trainerLeadService';
import TrainerFormFieldError from '@/shared/components/trainer/TrainerFormFieldError';
import '@/shared/styles/portal-brand.css';
import '@/shared/styles/trainer-form.css';

const HERO_FEATURES = [
  { icon: 'ri-flashlight-line', title: 'Takes under a minute', desc: 'Just the basics — no documents or photos needed right now.' },
  { icon: 'ri-team-line', title: 'Get on our radar', desc: "We'll reach out when a matching opportunity comes up." },
  { icon: 'ri-shield-check-line', title: 'No commitment', desc: 'This is just an interest form, not a full registration.' },
];

type LeadField = keyof CreateTrainerLeadRequest;

const FIELD_IDS: Record<LeadField, string> = {
  name: 'lead-name',
  mobile: 'lead-mobile',
  email: 'lead-email',
  specialization: 'lead-specialization',
  city: 'lead-city',
  pinCode: 'lead-pincode',
  experience: 'lead-experience',
  linkedin: 'lead-linkedin',
  instagram: 'lead-instagram',
};

const EMPTY_FORM: CreateTrainerLeadRequest = {
  name: '',
  mobile: '',
  email: '',
  specialization: '',
  city: '',
  pinCode: '',
  experience: '',
  linkedin: '',
  instagram: '',
};

const TrainerQuickRegister = () => {
  /** Prevent document-level scroll; form panel scrolls internally. */
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const [formData, setFormData] = useState<CreateTrainerLeadRequest>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<LeadField, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const clearFieldError = (field: LeadField) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const fieldClass = (field: LeadField, extra = '') => {
    const hasError = Boolean(fieldErrors[field]);
    return `form-control trainer-form-control${extra}${hasError ? ' trainer-form-control-error' : ''}`;
  };

  const setField = (field: LeadField, value: string) => {
    clearFieldError(field);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const scrollToField = (field?: LeadField) => {
    if (!field) return;
    const el = document.getElementById(FIELD_IDS[field]);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) {
      el.focus();
    }
  };

  const validate = (): LeadField | null => {
    const errors: Partial<Record<LeadField, string>> = {};
    const nameRegex = /^[A-Za-z\s.'-]+$/;
    const mobileRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pinRegex = /^[0-9]{6}$/;
    const urlRegex = /^https?:\/\/.+/i;

    if (!formData.name.trim()) errors.name = 'Name is required';
    else if (!nameRegex.test(formData.name.trim())) errors.name = "Name must contain only letters, spaces, and . ' -";

    if (!formData.mobile.trim()) errors.mobile = 'Mobile number is required';
    else if (!mobileRegex.test(formData.mobile.trim())) errors.mobile = 'Mobile number must be exactly 10 digits';

    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!emailRegex.test(formData.email.trim())) errors.email = 'Please enter a valid email address';

    if (!formData.specialization) errors.specialization = 'Please select a specialization';
    if (!formData.city) errors.city = 'Please select a city';

    if (!formData.pinCode.trim()) errors.pinCode = 'PIN code is required';
    else if (!pinRegex.test(formData.pinCode.trim())) errors.pinCode = 'PIN code must be exactly 6 digits';

    if (!formData.experience) errors.experience = 'Please select your years of experience';

    if (formData.linkedin && !urlRegex.test(formData.linkedin.trim())) {
      errors.linkedin = 'LinkedIn link must be a valid URL (https://...)';
    }
    if (formData.instagram && !urlRegex.test(formData.instagram.trim())) {
      errors.instagram = 'Instagram link must be a valid URL (https://...)';
    }

    setFieldErrors(errors);
    const order: LeadField[] = ['name', 'mobile', 'email', 'specialization', 'city', 'pinCode', 'experience', 'linkedin', 'instagram'];
    return order.find((f) => errors[f]) || null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const firstInvalid = validate();
    if (firstInvalid) {
      scrollToField(firstInvalid);
      return;
    }

    try {
      setLoading(true);
      await TrainerLeadService.createTrainerLead({
        name: formData.name.trim(),
        mobile: formData.mobile.replace(/\D/g, ''),
        email: formData.email.trim(),
        specialization: formData.specialization,
        city: formData.city,
        pinCode: formData.pinCode.trim(),
        experience: formData.experience,
        linkedin: formData.linkedin?.trim() || '',
        instagram: formData.instagram?.trim() || '',
      });
      setSuccess(true);
    } catch (err: any) {
      const message = err.message || 'Something went wrong. Please try again.';
      setError(message);
      Swal.fire({
        icon: 'error',
        title: 'Submission failed',
        text: message,
        confirmButtonColor: '#ed662e',
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Fragment>
        <Seo title={'Trainer Interest Form'} />
        <div className="h-dvh min-h-0 overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-bodybg dark:via-bodybg dark:to-bodybg">
          <div className="w-full max-w-md text-center bg-white dark:bg-bodybg rounded-2xl shadow-2xl border border-defaultborder/50 p-8 sm:p-10">
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
              <i className="ri-checkbox-circle-fill text-success text-5xl"></i>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-defaulttextcolor mb-2">Thanks for your interest!</h3>
            <p className="text-[#8c9097] dark:text-white/50 text-sm sm:text-base mb-6">
              We&apos;ve received your details. Our team will reach out to you soon about trainer opportunities at Samsara.
            </p>
            <Link
              href="/"
              className="ti-btn ti-btn-primary !bg-primary !text-white !font-medium w-full !py-2.5 inline-flex items-center justify-center gap-2"
            >
              <i className="ri-home-4-line" aria-hidden="true"></i> Back to Home
            </Link>
          </div>
        </div>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Seo title={'Trainer Interest Form'} />
      <div className="trainer-auth-shell h-dvh min-h-0 overflow-hidden p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-bodybg dark:via-bodybg dark:to-bodybg text-defaultsize text-defaulttextcolor">
        <div className="trainer-auth-card w-full max-w-6xl h-full mx-auto min-h-0 grid grid-cols-1 lg:grid-cols-12 grid-rows-[minmax(0,1fr)] bg-white dark:bg-bodybg rounded-2xl shadow-2xl overflow-hidden border border-defaultborder/50">
          <aside
            className="trainer-auth-aside hidden lg:flex lg:col-span-5 min-h-0 relative p-6 xl:p-8 2xl:p-10 text-white bg-gradient-to-br from-primary to-primary/70"
            aria-label="Trainer interest form information"
          >
            <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-white/10 pointer-events-none" aria-hidden="true"></div>
            <div className="absolute -bottom-24 -left-12 w-72 h-72 rounded-full bg-white/5 pointer-events-none" aria-hidden="true"></div>

            <div className="trainer-auth-aside-inner relative z-10 w-full">
              <div>
                <h1 className="trainer-auth-aside-title text-2xl xl:text-3xl font-bold leading-tight mb-4">
                  Tell us a bit about yourself
                </h1>
                <p className="trainer-auth-aside-subtitle text-white/80 text-sm leading-relaxed mb-6 xl:mb-9">
                  Share a few quick details and we&apos;ll get in touch about trainer
                  opportunities at Samsara Wellness.
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
                <p className="text-white/70 text-sm mb-0">Want to complete your full profile instead?</p>
                <Link
                  href="/trainer/register"
                  className="inline-flex items-center justify-center w-full min-h-[48px] px-6 py-3 rounded-xl bg-white text-primary font-bold text-base hover:bg-white/90 transition-colors shadow-lg"
                >
                  Full Registration
                </Link>
                <p className="text-white/50 text-[0.65rem] leading-relaxed">
                  Copyright&copy; 2025 Samsaraa WellTek Pvt Ltd. All rights reserved.
                </p>
              </div>
            </div>
          </aside>

          <div className="trainer-auth-panel trainer-register-scroll lg:col-span-7 min-h-0 p-6 sm:p-8 lg:p-10 pb-8">
            <div className="trainer-auth-panel-inner trainer-auth-panel-inner--centered">
              <div className="mb-6">
                <img src="/assets/images/logo.png" alt="Samsara" className="auth-logo" />
                <h2 className="text-xl sm:text-2xl font-bold text-defaulttextcolor">Trainer Interest Form</h2>
                <p className="text-[#8c9097] dark:text-white/50 text-sm mt-1">
                  Just a few quick details — takes under a minute.
                </p>
              </div>

              {error && (
                <div role="alert" className="trainer-form-error-summary mb-5">
                  <div className="flex items-start gap-2">
                    <i className="ri-close-circle-line text-base mt-0.5" aria-hidden="true"></i>
                    <div>
                      <strong>Please fix the following</strong>
                      <p className="mb-0 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor={FIELD_IDS.name} className="form-label">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      id={FIELD_IDS.name}
                      type="text"
                      className={fieldClass('name')}
                      placeholder="e.g. Priya Sharma"
                      value={formData.name}
                      onChange={(e) => setField('name', e.target.value)}
                      aria-invalid={Boolean(fieldErrors.name)}
                    />
                    <TrainerFormFieldError message={fieldErrors.name} fieldId={FIELD_IDS.name} />
                  </div>

                  <div>
                    <label htmlFor={FIELD_IDS.mobile} className="form-label">
                      Mobile Number <span className="text-danger">*</span>
                    </label>
                    <input
                      id={FIELD_IDS.mobile}
                      type="tel"
                      className={fieldClass('mobile')}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={formData.mobile}
                      onChange={(e) => setField('mobile', e.target.value.replace(/\D/g, ''))}
                      aria-invalid={Boolean(fieldErrors.mobile)}
                    />
                    <TrainerFormFieldError message={fieldErrors.mobile} fieldId={FIELD_IDS.mobile} />
                  </div>

                  <div>
                    <label htmlFor={FIELD_IDS.email} className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      id={FIELD_IDS.email}
                      type="email"
                      className={fieldClass('email')}
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setField('email', e.target.value)}
                      aria-invalid={Boolean(fieldErrors.email)}
                    />
                    <TrainerFormFieldError message={fieldErrors.email} fieldId={FIELD_IDS.email} />
                  </div>

                  <div>
                    <label htmlFor={FIELD_IDS.specialization} className="form-label">
                      Specialization <span className="text-danger">*</span>
                    </label>
                    <select
                      id={FIELD_IDS.specialization}
                      className={fieldClass('specialization')}
                      value={formData.specialization}
                      onChange={(e) => setField('specialization', e.target.value)}
                      aria-invalid={Boolean(fieldErrors.specialization)}
                    >
                      <option value="">Select specialization</option>
                      {TRAINER_CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <TrainerFormFieldError message={fieldErrors.specialization} fieldId={FIELD_IDS.specialization} />
                  </div>

                  <div>
                    <label htmlFor={FIELD_IDS.city} className="form-label">
                      City <span className="text-danger">*</span>
                    </label>
                    <select
                      id={FIELD_IDS.city}
                      className={fieldClass('city')}
                      value={formData.city}
                      onChange={(e) => setField('city', e.target.value)}
                      aria-invalid={Boolean(fieldErrors.city)}
                    >
                      <option value="">Select city</option>
                      {TRAINER_CITY_OPTIONS.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <TrainerFormFieldError message={fieldErrors.city} fieldId={FIELD_IDS.city} />
                  </div>

                  <div>
                    <label htmlFor={FIELD_IDS.pinCode} className="form-label">
                      Pincode <span className="text-danger">*</span>
                    </label>
                    <input
                      id={FIELD_IDS.pinCode}
                      type="text"
                      className={fieldClass('pinCode')}
                      placeholder="6-digit PIN code"
                      maxLength={6}
                      value={formData.pinCode}
                      onChange={(e) => setField('pinCode', e.target.value.replace(/\D/g, ''))}
                      aria-invalid={Boolean(fieldErrors.pinCode)}
                    />
                    <TrainerFormFieldError message={fieldErrors.pinCode} fieldId={FIELD_IDS.pinCode} />
                  </div>

                  <div>
                    <label htmlFor={FIELD_IDS.experience} className="form-label">
                      Years of Experience <span className="text-danger">*</span>
                    </label>
                    <select
                      id={FIELD_IDS.experience}
                      className={fieldClass('experience')}
                      value={formData.experience}
                      onChange={(e) => setField('experience', e.target.value)}
                      aria-invalid={Boolean(fieldErrors.experience)}
                    >
                      <option value="">Select experience</option>
                      {TRAINER_LEAD_EXPERIENCE_OPTIONS.map((exp) => (
                        <option key={exp} value={exp}>
                          {exp}
                        </option>
                      ))}
                    </select>
                    <TrainerFormFieldError message={fieldErrors.experience} fieldId={FIELD_IDS.experience} />
                  </div>

                  <div>
                    <label htmlFor={FIELD_IDS.linkedin} className="form-label">
                      LinkedIn Link <span className="text-muted">(optional)</span>
                    </label>
                    <input
                      id={FIELD_IDS.linkedin}
                      type="url"
                      className={fieldClass('linkedin')}
                      placeholder="https://linkedin.com/in/..."
                      value={formData.linkedin}
                      onChange={(e) => setField('linkedin', e.target.value)}
                      aria-invalid={Boolean(fieldErrors.linkedin)}
                    />
                    <TrainerFormFieldError message={fieldErrors.linkedin} fieldId={FIELD_IDS.linkedin} />
                  </div>

                  <div>
                    <label htmlFor={FIELD_IDS.instagram} className="form-label">
                      Instagram Link <span className="text-muted">(optional)</span>
                    </label>
                    <input
                      id={FIELD_IDS.instagram}
                      type="url"
                      className={fieldClass('instagram')}
                      placeholder="https://instagram.com/..."
                      value={formData.instagram}
                      onChange={(e) => setField('instagram', e.target.value)}
                      aria-invalid={Boolean(fieldErrors.instagram)}
                    />
                    <TrainerFormFieldError message={fieldErrors.instagram} fieldId={FIELD_IDS.instagram} />
                  </div>
                </div>

                <div className="pt-6 mt-2">
                  <button
                    type="submit"
                    className="ti-btn ti-btn-primary w-full min-h-[52px] !bg-primary !text-white !font-bold text-base sm:text-lg !py-3.5 inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-70"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="ri-send-plane-line" aria-hidden="true"></i>
                        Submit
                      </>
                    )}
                  </button>
                  <p className="text-center text-[0.7rem] text-[#8c9097] dark:text-white/50 leading-relaxed mt-4">
                    Copyright&copy; 2025 Samsaraa WellTek Pvt Ltd. All rights reserved.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default TrainerQuickRegister;
