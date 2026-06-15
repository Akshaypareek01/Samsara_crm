"use client";
import Seo from '@/shared/layout-components/seo/seo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { Fragment, useEffect, useState } from 'react';
import TrainerService from '@/services/trainerService';
import '@/shared/styles/portal-brand.css';
import '@/shared/styles/trainer-form.css';

const HERO_FEATURES = [
    { icon: 'ri-team-line', title: 'Reach a wider audience', desc: 'Get discovered by corporate clients seeking wellness experts.' },
    { icon: 'ri-calendar-check-line', title: 'Effortless scheduling', desc: 'Manage all your bookings from one dashboard.' },
    { icon: 'ri-line-chart-line', title: 'Grow your practice', desc: 'Build credibility and expand your wellness offerings.' },
];

/**
 * Trainer OTP login — layout matches trainer registration page.
 */
const TrainerLogin = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    /** Prevent document-level scroll; panel scrolls internally when needed. */
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    /**
     * Request a one-time password for the entered email.
     *
     * @param e - Form submit event.
     */
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await TrainerService.sendLoginOtp(email.trim());
            setStep('otp');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to send OTP. Please check your email.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Verify OTP and redirect to the trainer dashboard.
     *
     * @param e - Form submit event.
     */
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await TrainerService.login(email.trim(), otp.trim());
            router.push('/trainer/dashboard');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Invalid OTP. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    /** Return to email step and clear OTP state. */
    const handleChangeEmail = () => {
        setStep('email');
        setOtp('');
        setError('');
    };

    return (
        <Fragment>
            <Seo title={"Trainer Login"} />
            <div className="trainer-auth-shell h-dvh min-h-0 overflow-hidden p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-bodybg dark:via-bodybg dark:to-bodybg text-defaultsize text-defaulttextcolor">
                <div className="trainer-auth-card w-full max-w-6xl h-full mx-auto min-h-0 grid grid-cols-1 lg:grid-cols-12 grid-rows-[minmax(0,1fr)] bg-white dark:bg-bodybg rounded-2xl shadow-2xl overflow-hidden border border-defaultborder/50">
                    <aside
                        className="trainer-auth-aside hidden lg:flex lg:col-span-5 min-h-0 relative p-6 xl:p-8 2xl:p-10 text-white bg-gradient-to-br from-primary to-primary/70"
                        aria-label="Trainer login information"
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
                                    Welcome back to your trainer dashboard
                                </h1>
                                <p className="trainer-auth-aside-subtitle text-white/80 text-sm leading-relaxed mb-6 xl:mb-9">
                                    Sign in to manage your profile, bookings, and corporate wellness sessions on
                                    Samsara Wellness.
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
                                <p className="text-white/70 text-sm mb-0">Don&apos;t have an account?</p>
                                <Link
                                    href="/trainer/register"
                                    className="inline-flex items-center justify-center w-full min-h-[48px] px-6 py-3 rounded-xl bg-white text-primary font-bold text-base hover:bg-white/90 transition-colors shadow-lg"
                                >
                                    Register
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
                            <img
                                src="/assets/images/logo.jpeg"
                                alt="Samsara"
                                className="h-20 sm:h-24 w-auto mb-4 lg:hidden"
                            />
                            <h2 className="text-xl sm:text-2xl font-bold text-defaulttextcolor">Trainer Login</h2>
                            <p className="text-[#8c9097] dark:text-white/50 text-sm mt-1">
                                {step === 'email'
                                    ? 'Enter your email to receive a one-time password.'
                                    : `Enter the OTP sent to ${email}.`}
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

                        {step === 'email' ? (
                            <form onSubmit={handleSendOtp} className="max-w-md w-full" noValidate>
                                <div>
                                    <label className="trainer-form-label" htmlFor="trainer-login-email">
                                        Email <span className="trainer-form-req">*</span>
                                    </label>
                                    <input
                                        id="trainer-login-email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        className="form-control trainer-form-control"
                                        placeholder="you@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        aria-invalid={Boolean(error)}
                                    />
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
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <i className="ri-mail-send-line" aria-hidden="true"></i>
                                                Send OTP
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="max-w-md w-full" noValidate>
                                <div>
                                    <label className="trainer-form-label" htmlFor="trainer-login-otp">
                                        One-time password <span className="trainer-form-req">*</span>
                                    </label>
                                    <input
                                        id="trainer-login-otp"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        required
                                        maxLength={4}
                                        className="form-control trainer-form-control"
                                        placeholder="4-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        aria-invalid={Boolean(error)}
                                    />
                                </div>
                                <div className="pt-4 mt-2 space-y-3">
                                    <button
                                        type="submit"
                                        className="ti-btn ti-btn-primary w-full min-h-[52px] !bg-primary !text-white !font-bold text-base sm:text-lg !py-3.5 inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-70"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                                Verifying...
                                            </>
                                        ) : (
                                            <>
                                                <i className="ri-login-circle-line" aria-hidden="true"></i>
                                                Verify &amp; Login
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="w-full text-sm text-primary font-semibold hover:underline"
                                        onClick={handleChangeEmail}
                                        disabled={loading}
                                    >
                                        Change email
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="text-center mt-6 space-y-3 lg:hidden max-w-md w-full">
                            <p className="text-sm text-muted mb-0">Don&apos;t have an account?</p>
                            <Link
                                href="/trainer/register"
                                className="ti-btn ti-btn-primary w-full min-h-[52px] !bg-primary !text-white !font-bold text-base sm:text-lg !py-3.5 inline-flex items-center justify-center shadow-lg shadow-primary/20"
                            >
                                Register
                            </Link>
                            <p className="text-[0.65rem] text-[#8c9097] dark:text-white/50 leading-relaxed">
                                Copyright&copy; 2025 Samsaraa WellTek Pvt Ltd. All rights reserved.
                            </p>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default TrainerLogin;
