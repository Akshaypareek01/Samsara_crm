"use client";
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Base_url } from '@/Config/BaseUrl';
import CompanyService, { Company, UpdateCompanyRequest, ContactPerson } from '@/services/companyService';
import ApiService from '@/services/ApiService';
import { clearCompanyInsightsCache } from '@/services/companyInsightsClient';
import Swal from 'sweetalert2';

const SettingsPage = () => {
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<UpdateCompanyRequest>({
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
    });

    useEffect(() => {
        fetchCompanyProfile();
    }, []);

    const fetchCompanyProfile = async () => {
        try {
            setLoading(true);
            setError('');
            const profile = await CompanyService.getCompanyProfile();
            setCompany(profile);
            setFormData({
                companyName: profile.companyName || '',
                companyLogo: profile.companyLogo || '',
                email: profile.email || '',
                domain: profile.domain || '',
                numberOfEmployees: profile.numberOfEmployees,
                gstNumber: profile.gstNumber || '',
                address: profile.address || '',
                city: profile.city || '',
                pincode: profile.pincode || '',
                country: profile.country || '',
                contactPerson1: profile.contactPerson1 || {
                    name: '',
                    email: '',
                    mobileNumber: '',
                    designation: '',
                },
                contactPerson2: profile.contactPerson2 || {
                    name: '',
                    email: '',
                    mobileNumber: '',
                    designation: '',
                },
            });
        } catch (err: any) {
            setError(err.message || 'Failed to load company profile');
            Swal.fire('Error!', err.message || 'Failed to load company profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError('');
            const updatedCompany = await CompanyService.updateCompanyProfile(formData);
            setCompany(updatedCompany);
            await ApiService.setUser(updatedCompany);
            clearCompanyInsightsCache();
            Swal.fire('Success!', 'Company profile updated successfully', 'success');
        } catch (err: any) {
            setError(err.message || 'Failed to update company profile');
            Swal.fire('Error!', err.message || 'Failed to update company profile', 'error');
        } finally {
            setSaving(false);
        }
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

    if (loading) {
        return (
            <Fragment>
                <Seo title={"Settings"} />
                <Pageheader currentpage="Settings" activepage="Company" mainpage="Settings" />
                <div className="text-center py-8">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading company profile...</p>
                </div>
            </Fragment>
        );
    }

    return (
        <Fragment>
            <Seo title={"Settings"} />
            <Pageheader currentpage="Settings" activepage="Company" mainpage="Settings" />
            
            {error && (
                <div className="alert alert-danger mb-4" role="alert">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-12 gap-6">
                {/* Company Information */}
                <div className="xl:col-span-8 col-span-12">
                    <div className="box">
                        <div className="box-header">
                            <div className="box-title">
                                Company Profile
                            </div>
                        </div>
                        <div className="box-body">
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="form-label">Company ID</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={company?.companyId || ''}
                                                disabled
                                                readOnly
                                            />
                                            <small className="text-muted">Company ID cannot be changed</small>
                                        </div>
                                        <div>
                                            <label className="form-label">Company Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.companyName}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, companyName: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={formData.email}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, email: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Domain</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.domain}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, domain: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="form-label">Company Logo</label>
                                        <input
                                            type="file"
                                            ref={logoInputRef}
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="hidden"
                                            aria-label="Upload company logo"
                                        />
                                        {formData.companyLogo ? (
                                            <div className="relative w-full max-w-xs h-32 rounded-lg overflow-hidden border-2 border-defaultborder group">
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
                                                className="w-full max-w-xs h-32 rounded-lg border-2 border-dashed border-defaultborder hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center gap-1.5 text-muted hover:text-primary transition-colors disabled:opacity-60"
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="form-label">Number of Employees</label>
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
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">GST Number</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.gstNumber}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, gstNumber: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="form-label">Address</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.address}
                                            onChange={(e) =>
                                                setFormData({ ...formData, address: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="form-label">City</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.city}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, city: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Pincode</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.pincode}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, pincode: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Country</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.country}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, country: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Person 1 */}
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-4">Contact Person 1</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="form-label">Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.contactPerson1?.name || ''}
                                                onChange={(e) =>
                                                    updateContactPerson(1, 'name', e.target.value)
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={formData.contactPerson1?.email || ''}
                                                onChange={(e) =>
                                                    updateContactPerson(1, 'email', e.target.value)
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Mobile Number</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={formData.contactPerson1?.mobileNumber || ''}
                                                onChange={(e) =>
                                                    updateContactPerson(1, 'mobileNumber', e.target.value)
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Designation</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.contactPerson1?.designation || ''}
                                                onChange={(e) =>
                                                    updateContactPerson(1, 'designation', e.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Person 2 */}
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-4">Contact Person 2</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="form-label">Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.contactPerson2?.name || ''}
                                                onChange={(e) =>
                                                    updateContactPerson(2, 'name', e.target.value)
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={formData.contactPerson2?.email || ''}
                                                onChange={(e) =>
                                                    updateContactPerson(2, 'email', e.target.value)
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Mobile Number</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={formData.contactPerson2?.mobileNumber || ''}
                                                onChange={(e) =>
                                                    updateContactPerson(2, 'mobileNumber', e.target.value)
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Designation</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.contactPerson2?.designation || ''}
                                                onChange={(e) =>
                                                    updateContactPerson(2, 'designation', e.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="box-footer mt-6">
                                    <button
                                        type="submit"
                                        className="ti-btn ti-btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Company Info Card */}
                <div className="xl:col-span-4 col-span-12">
                    <div className="box">
                        <div className="box-header">
                            <div className="box-title">
                                Company Information
                            </div>
                        </div>
                        <div className="box-body">
                            {company && (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        {company.companyLogo ? (
                                            <img
                                                src={company.companyLogo}
                                                alt={company.companyName}
                                                className="w-24 h-24 mx-auto rounded-lg object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-24 h-24 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                                                <i className="bx bx-building text-primary text-4xl"></i>
                                            </div>
                                        )}
                                        <h3 className="mt-4 font-semibold text-lg">
                                            {company.companyName || 'N/A'}
                                        </h3>
                                        <p className="text-muted text-sm">{company.companyId}</p>
                                    </div>

                                    <div className="border-t pt-4 space-y-3">
                                        <div>
                                            <label className="text-sm font-semibold text-muted">Status</label>
                                            <p>
                                                <span
                                                    className={`badge ${
                                                        company.status !== false
                                                            ? 'bg-success/10 text-success'
                                                            : 'bg-danger/10 text-danger'
                                                    }`}
                                                >
                                                    {company.status !== false ? 'Active' : 'Inactive'}
                                                </span>
                                            </p>
                                        </div>
                                        {company.createdAt && (
                                            <div>
                                                <label className="text-sm font-semibold text-muted">
                                                    Created At
                                                </label>
                                                <p className="text-defaulttextcolor">
                                                    {new Date(company.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                        {company.updatedAt && (
                                            <div>
                                                <label className="text-sm font-semibold text-muted">
                                                    Last Updated
                                                </label>
                                                <p className="text-defaulttextcolor">
                                                    {new Date(company.updatedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default SettingsPage;
