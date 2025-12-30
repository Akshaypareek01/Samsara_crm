"use client";
import Seo from '@/shared/layout-components/seo/seo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { Fragment, useState } from 'react';
import CompanyService from '@/services/companyService';

const CompanyLogin = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await CompanyService.sendLoginOtp(email);
            setStep('otp');
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP. Please check your email.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await CompanyService.verifyLoginOtp(email, otp);
            router.push('/company/dashboard');
        } catch (err: any) {
            setError(err.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <Seo title={"Company Login"} />
            <div className="container">
                <div className="flex justify-center authentication authentication-basic items-center h-full text-defaultsize text-defaulttextcolor">
                    <div className="grid grid-cols-12">
                        <div className="xxl:col-span-4 xl:col-span-4 lg:col-span-4 md:col-span-3 sm:col-span-2"></div>
                        <div className="xxl:col-span-4 xl:col-span-4 lg:col-span-4 md:col-span-6 sm:col-span-8 col-span-12">
                            <div className="my-[2.5rem] flex justify-center mb-6">
                                <img src="/assets/images/logosm.png" alt="logo" className="h-32 w-auto" />
                            </div>
                            <div className="box">
                                <div className="box-body !p-[3rem]">
                                    <p className="h5 font-semibold mb-2 text-center">Company Login</p>
                                    <p className="mb-4 text-[#8c9097] dark:text-white/50 opacity-[0.7] font-normal text-center">
                                        {step === 'email' ? 'Enter your email to receive an OTP.' : 'Enter the OTP sent to your email.'}
                                    </p>

                                    {error && (
                                        <div className="alert alert-danger mb-4 text-center text-sm text-red-500 bg-red-50 p-2 rounded">
                                            {error}
                                        </div>
                                    )}

                                    {step === 'email' ? (
                                        <form onSubmit={handleSendOtp}>
                                            <div className="grid grid-cols-12 gap-y-4">
                                                <div className="xl:col-span-12 col-span-12">
                                                    <label htmlFor="signin-email" className="form-label text-default">Email</label>
                                                    <input
                                                        type="email"
                                                        required
                                                        className="form-control form-control-lg w-full !rounded-md"
                                                        id="signin-email"
                                                        placeholder="Enter your email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                    />
                                                </div>
                                                <div className="xl:col-span-12 col-span-12 grid mt-2">
                                                    <button
                                                        type="submit"
                                                        className="ti-btn ti-btn-primary !bg-primary !text-white !font-medium"
                                                        disabled={loading}
                                                    >
                                                        {loading ? 'Sending...' : 'Send OTP'}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleVerifyOtp}>
                                            <div className="grid grid-cols-12 gap-y-4">
                                                <div className="xl:col-span-12 col-span-12">
                                                    <label htmlFor="signin-otp" className="form-label text-default">OTP</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        className="form-control form-control-lg w-full !rounded-md"
                                                        id="signin-otp"
                                                        placeholder="Enter OTP"
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value)}
                                                    />
                                                </div>
                                                <div className="xl:col-span-12 col-span-12 grid mt-2">
                                                    <button
                                                        type="submit"
                                                        className="ti-btn ti-btn-primary !bg-primary !text-white !font-medium"
                                                        disabled={loading}
                                                    >
                                                        {loading ? 'Verifying...' : 'Verify & Login'}
                                                    </button>
                                                </div>
                                                <div className="xl:col-span-12 col-span-12 text-center mt-2">
                                                    <button
                                                        type="button"
                                                        className="text-primary text-sm underline"
                                                        onClick={() => setStep('email')}
                                                    >
                                                        Change Email
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    )}
                                    <div className="xl:col-span-12 col-span-12 text-center mt-4">
                                        <p className="text-muted text-sm">
                                            Don't have an account?{' '}
                                            <Link href="/company/register" className="text-primary font-semibold">
                                                Register Here
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="xxl:col-span-4 xl:col-span-4 lg:col-span-4 md:col-span-3 sm:col-span-2"></div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}

export default CompanyLogin;
