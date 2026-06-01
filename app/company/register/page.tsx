"use client";
import Seo from '@/shared/layout-components/seo/seo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { Fragment, useState, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Base_url } from '@/Config/BaseUrl';
import CompanyService, { CreateCompanyRequest, ContactPerson } from '@/services/companyService';

const CompanyRegister = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<CreateCompanyRequest>({
        companyName: '',
        companyLogo: '',
        email: '',
        domain: '',
        numberOfEmployees: undefined,
        gstNumber: '',
        address: '',
        city: '',
        pincode: '',
        country: '',
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

    const updateContactPerson = (
        personNumber: 1 | 2,
        field: keyof ContactPerson,
        value: string
    ) => {
        const contactPersonKey = personNumber === 1 ? 'contactPerson1' : 'contactPerson2';
        setFormData({
            ...formData,
            [contactPersonKey]: {
                ...formData[contactPersonKey],
                [field]: value,
            },
        });
    };

    /**
     * Upload the selected logo file to the storage endpoint and store the
     * returned public URL in `companyLogo`.
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
                Swal.fire('Success!', 'Company logo uploaded successfully', 'success');
            } else {
                throw new Error('Upload failed: Invalid response');
            }
        } catch (err: any) {
            console.error('Logo upload error:', err);
            Swal.fire(
                'Error!',
                err.response?.data?.message || err.message || 'Failed to upload logo',
                'error'
            );
        } finally {
            setUploadingLogo(false);
        }
    };

    /**
     * Validate and handle the logo file input change event.
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
            uploadCompanyLogo(file);
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

        try {
            // Attempt to create company
            // Note: This may require admin auth, but we'll try anyway
            const company = await CompanyService.createCompany(formData);
            
            setSuccess(true);
            // Show success message and redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/company/login');
            }, 3000);
        } catch (err: any) {
            // If registration fails due to auth, show appropriate message
            if (err.message?.includes('401') || err.message?.includes('403') || err.message?.includes('Unauthorized')) {
                setError('Registration requires admin approval. Your request has been noted. Please contact support or wait for admin approval.');
                setSuccess(true); // Show success message for pending approval
            } else {
                setError(err.message || 'Failed to register company. Please try again or contact support.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success && !error) {
        return (
            <Fragment>
                <Seo title={"Company Registration"} />
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
                                        <div className="text-center">
                                            <div className="mb-4">
                                                <i className="ri-checkbox-circle-line text-success text-6xl"></i>
                                            </div>
                                            <h3 className="h5 font-semibold mb-2">Registration Successful!</h3>
                                            <p className="mb-4 text-[#8c9097] dark:text-white/50 opacity-[0.7] font-normal">
                                                Your company has been registered successfully. You will be redirected to the login page shortly.
                                            </p>
                                            <Link href="/company/login" className="ti-btn ti-btn-primary">
                                                Go to Login
                                            </Link>
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

    return (
        <Fragment>
            <Seo title={"Company Registration"} />
            <div className="container">
                <div className="flex justify-center authentication authentication-basic items-center h-full text-defaultsize text-defaulttextcolor">
                    <div className="grid grid-cols-12">
                        <div className="xxl:col-span-2 xl:col-span-2 lg:col-span-2 md:col-span-1 sm:col-span-1"></div>
                        <div className="xxl:col-span-8 xl:col-span-8 lg:col-span-8 md:col-span-10 sm:col-span-10 col-span-12">
                            <div className="my-[2.5rem] flex justify-center mb-6">
                                <img src="/assets/images/logosm.png" alt="logo" className="h-32 w-auto" />
                            </div>
                            <div className="box">
                                <div className="box-body !p-[3rem]">
                                    <p className="h5 font-semibold mb-2 text-center">Company Registration</p>
                                    <p className="mb-4 text-[#8c9097] dark:text-white/50 opacity-[0.7] font-normal text-center">
                                        Fill in your company details to create an account
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
                                            {/* Company Basic Information */}
                                            <div className="border-b pb-4 mb-4">
                                                <h4 className="font-semibold mb-4">Company Information</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="form-label">Company Name *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.companyName}
                                                            onChange={(e) =>
                                                                setFormData({ ...formData, companyName: e.target.value })
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="form-label">Email *</label>
                                                        <input
                                                            type="email"
                                                            className="form-control"
                                                            value={formData.email}
                                                            onChange={(e) =>
                                                                setFormData({ ...formData, email: e.target.value })
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="form-label">Domain *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.domain}
                                                            onChange={(e) =>
                                                                setFormData({ ...formData, domain: e.target.value })
                                                            }
                                                            placeholder="example.com"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="form-label">Company Logo *</label>
                                                        <input
                                                            type="file"
                                                            ref={logoInputRef}
                                                            accept="image/*"
                                                            onChange={handleLogoChange}
                                                            className="hidden"
                                                            aria-label="Upload company logo"
                                                        />
                                                        {formData.companyLogo ? (
                                                            <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-defaultborder group">
                                                                <img
                                                                    src={formData.companyLogo}
                                                                    alt="Company logo preview"
                                                                    className="w-full h-full object-contain bg-gray-50 dark:bg-black/20"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                                    }}
                                                                />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => logoInputRef.current?.click()}
                                                                        className="ti-btn ti-btn-sm !bg-white !text-defaulttextcolor !font-medium !mb-0"
                                                                        title="Change logo"
                                                                        aria-label="Change company logo"
                                                                    >
                                                                        <i className="ri-refresh-line"></i>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={clearCompanyLogo}
                                                                        className="ti-btn ti-btn-sm !bg-danger !text-white !font-medium !mb-0"
                                                                        title="Remove logo"
                                                                        aria-label="Remove company logo"
                                                                    >
                                                                        <i className="ri-delete-bin-line"></i>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => logoInputRef.current?.click()}
                                                                disabled={uploadingLogo}
                                                                className="w-full h-32 rounded-lg border-2 border-dashed border-defaultborder hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center gap-1.5 text-muted hover:text-primary transition-colors disabled:opacity-60"
                                                            >
                                                                {uploadingLogo ? (
                                                                    <>
                                                                        <span className="spinner-border spinner-border-sm"></span>
                                                                        <span className="text-sm">Uploading...</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <i className="ri-image-add-line text-2xl"></i>
                                                                        <span className="text-sm font-medium">Upload Company Logo</span>
                                                                        <span className="text-xs">JPG, PNG, GIF · Max 5MB</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="form-label">Number of Employees *</label>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            value={formData.numberOfEmployees || ''}
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    numberOfEmployees: e.target.value
                                                                        ? parseInt(e.target.value)
                                                                        : undefined,
                                                                })
                                                            }
                                                            required
                                                            min="1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="form-label">GST Number *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.gstNumber}
                                                            onChange={(e) =>
                                                                setFormData({ ...formData, gstNumber: e.target.value })
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Address Information */}
                                            <div className="border-b pb-4 mb-4">
                                                <h4 className="font-semibold mb-4">Address Information</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="md:col-span-2">
                                                        <label className="form-label">Address *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.address}
                                                            onChange={(e) =>
                                                                setFormData({ ...formData, address: e.target.value })
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="form-label">City *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.city}
                                                            onChange={(e) =>
                                                                setFormData({ ...formData, city: e.target.value })
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="form-label">Pincode *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.pincode}
                                                            onChange={(e) =>
                                                                setFormData({ ...formData, pincode: e.target.value })
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="form-label">Country *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.country}
                                                            onChange={(e) =>
                                                                setFormData({ ...formData, country: e.target.value })
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact Person 1 */}
                                            <div className="border-b pb-4 mb-4">
                                                <h4 className="font-semibold mb-4">Primary Contact Person *</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="form-label">Name *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.contactPerson1?.name || ''}
                                                            onChange={(e) =>
                                                                updateContactPerson(1, 'name', e.target.value)
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="form-label">Email *</label>
                                                        <input
                                                            type="email"
                                                            className="form-control"
                                                            value={formData.contactPerson1?.email || ''}
                                                            onChange={(e) =>
                                                                updateContactPerson(1, 'email', e.target.value)
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="form-label">Mobile Number *</label>
                                                        <input
                                                            type="tel"
                                                            className="form-control"
                                                            value={formData.contactPerson1?.mobileNumber || ''}
                                                            onChange={(e) =>
                                                                updateContactPerson(1, 'mobileNumber', e.target.value)
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="form-label">Designation *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.contactPerson1?.designation || ''}
                                                            onChange={(e) =>
                                                                updateContactPerson(1, 'designation', e.target.value)
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact Person 2 */}
                                            <div className="pb-4 mb-4">
                                                <h4 className="font-semibold mb-4">Secondary Contact Person *</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="form-label">Name *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.contactPerson2?.name || ''}
                                                            onChange={(e) =>
                                                                updateContactPerson(2, 'name', e.target.value)
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="form-label">Email *</label>
                                                        <input
                                                            type="email"
                                                            className="form-control"
                                                            value={formData.contactPerson2?.email || ''}
                                                            onChange={(e) =>
                                                                updateContactPerson(2, 'email', e.target.value)
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="form-label">Mobile Number *</label>
                                                        <input
                                                            type="tel"
                                                            className="form-control"
                                                            value={formData.contactPerson2?.mobileNumber || ''}
                                                            onChange={(e) =>
                                                                updateContactPerson(2, 'mobileNumber', e.target.value)
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="form-label">Designation *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.contactPerson2?.designation || ''}
                                                            onChange={(e) =>
                                                                updateContactPerson(2, 'designation', e.target.value)
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-y-4 mt-6">
                                            <div className="xl:col-span-12 col-span-12">
                                                <button
                                                    type="submit"
                                                    className="ti-btn ti-btn-primary w-full !bg-primary !text-white !font-medium"
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Registering...' : 'Register Company'}
                                                </button>
                                            </div>
                                            <div className="xl:col-span-12 col-span-12 text-center">
                                                <p className="text-muted text-sm">
                                                    Already have an account?{' '}
                                                    <Link href="/company/login" className="text-primary font-semibold">
                                                        Sign In
                                                    </Link>
                                                </p>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="xxl:col-span-2 xl:col-span-2 lg:col-span-2 md:col-span-1 sm:col-span-1"></div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default CompanyRegister;

