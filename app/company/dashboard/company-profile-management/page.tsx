"use client";

import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useEffect, useRef, useState } from 'react';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface ContactPerson {
    name:        string;
    email:       string;
    mobileNumber:string;
    designation: string;
}

interface CompanyProfile {
    companyId:       string;
    companyName:     string;
    email:           string;
    domain:          string;
    logoUrl:         string;
    numberOfEmployees: string;
    gstNumber:       string;
    address:         string;
    city:            string;
    pinCode:         string;
    country:         string;
    status:          'Active' | 'Inactive';
    contactPersons:  ContactPerson[];
}

// ─────────────────────────────────────────────────────────────
// STATIC DATA
// When the API is ready, replace getCompanyProfile() body with:
//   return await fetch('/api/company/profile').then(r => r.json())
// Replace saveCompanyProfile() body with:
//   return await fetch('/api/company/profile', { method: 'PUT', body: JSON.stringify(data) })
// ─────────────────────────────────────────────────────────────

async function getCompanyProfile(): Promise<CompanyProfile> {
    // TODO: return await fetch('/api/company/profile').then(r => r.json())
    return {
        companyId:        'WTS-2024-001',
        companyName:      'WellnessTech Solutions',
        email:            '@wellnesstech.com',
        domain:           'www.samsarawellness.in',
        logoUrl:          'https://samsarawellness.in/wp-content/uploads/2024/09/samsaralogomain.png',
        numberOfEmployees:'1250',
        gstNumber:        '22AAAAA0000A1Z5',
        address:          'Tech Park, Block A, 4th Floor\nElectronic City Phase 1\nBangalore, Karnataka',
        city:             'Bangalore',
        pinCode:          '560100',
        country:          'India',
        status:           'Active',
        contactPersons: [
            {
                name:         'Rajesh Kumar',
                email:        'rajesh.kumar@wellnesstech.com',
                mobileNumber: '+91 98765 43210',
                designation:  'Chief Executive Officer',
            },
            {
                name:         'Priya Sharma',
                email:        'priya.sharma@wellnesstech.com',
                mobileNumber: '+91 87654 32109',
                designation:  'Human Resources Director',
            },
        ],
    };
}

async function saveCompanyProfile(_data: CompanyProfile): Promise<void> {
    // TODO: await fetch('/api/company/profile', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(_data),
    // })
    await new Promise((r) => setTimeout(r, 600)); // simulate network delay
}

// ─────────────────────────────────────────────────────────────
// COUNTRIES (static list — no API needed)
// ─────────────────────────────────────────────────────────────
const COUNTRIES = [
    'India', 'United States', 'United Kingdom', 'Canada',
    'Australia', 'Germany', 'France', 'Singapore', 'UAE',
];

// ─────────────────────────────────────────────────────────────
// SMALL ATOMS
// ─────────────────────────────────────────────────────────────

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
        <label className="form-label text-xs font-medium text-muted mb-1">{label}</label>
        {children}
    </div>
);

// ─────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────

const CompanyManagementPage = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [saving, setSaving]         = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [dragOver, setDragOver]     = useState(false);

    // Form state — mirrors CompanyProfile exactly so the swap is trivial
    const [form, setForm] = useState<CompanyProfile>({
        companyId: '', companyName: '', email: '', domain: '',
        logoUrl: '', numberOfEmployees: '', gstNumber: '',
        address: '', city: '', pinCode: '', country: '',
        status: 'Active',
        contactPersons: [
            { name: '', email: '', mobileNumber: '', designation: '' },
            { name: '', email: '', mobileNumber: '', designation: '' },
        ],
    });

    // Load profile on mount
    // When API is ready: getCompanyProfile() will fetch from server instead
    useEffect(() => {
        getCompanyProfile().then(setForm);
    }, []);

    // ── Handlers ──────────────────────────────────────────────

    const set = (key: keyof CompanyProfile, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const setContact = (idx: number, key: keyof ContactPerson, value: string) =>
        setForm((prev) => {
            const contactPersons = prev.contactPersons.map((cp, i) =>
                i === idx ? { ...cp, [key]: value } : cp
            );
            return { ...prev, contactPersons };
        });

    const handleSave = async () => {
        setSaving(true);
        setSaveSuccess(false);
        try {
            await saveCompanyProfile(form);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } finally {
            setSaving(false);
        }
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        // TODO: upload file via /api/company/upload-logo and set the returned URL
        const file = e.dataTransfer.files?.[0];
        if (file) console.log('dropped file:', file.name);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        // TODO: upload file via /api/company/upload-logo and set the returned URL
        const file = e.target.files?.[0];
        if (file) console.log('selected file:', file.name);
    };

    return (
        <Fragment>
            <Seo title="Company Profile" />
            <Pageheader currentpage="Company Profile" activepage="Dashboard" mainpage="Company Profile" />

            {/* Top Action Bar */}
            <div className="flex justify-end gap-2 mb-4">
                {/* TODO: wire to export API */}
                <button className="ti-btn ti-btn-sm bg-warning text-white border-0 gap-1 text-xs font-semibold">
                    <i className="ri-download-2-line"></i> Export Data
                </button>
                <button className="ti-btn ti-btn-sm ti-btn-primary gap-1 text-xs font-semibold">
                    <i className="ri-download-line"></i> Download
                </button>
            </div>

            {/* Page heading */}
            <div className="mb-5">
                <h5 className="font-bold text-xl text-defaulttextcolor">Company Profile Management</h5>
                <p className="text-sm text-muted mt-1">Manage company information, contact details, and organizational settings</p>
            </div>

            <div className="grid grid-cols-12 gap-6">

                {/* ── LEFT: Form ── */}
                <div className="xl:col-span-8 col-span-12 flex flex-col gap-6">

                    {/* Basic Company Details */}
                    <div className="box mb-0">
                        <div className="box-header">
                            <h6 className="box-title font-bold !mb-0">Basic Company Details</h6>
                        </div>
                        <div className="box-body flex flex-col gap-4">

                            <Field label="Company ID">
                                <input
                                    type="text"
                                    className="form-control bg-light/60 text-muted"
                                    value={form.companyId}
                                    readOnly
                                />
                            </Field>

                            <Field label="Company Name">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={form.companyName}
                                    onChange={(e) => set('companyName', e.target.value)}
                                />
                            </Field>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Email">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.email}
                                        onChange={(e) => set('email', e.target.value)}
                                    />
                                </Field>
                                <Field label="Domain">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.domain}
                                        onChange={(e) => set('domain', e.target.value)}
                                    />
                                </Field>
                            </div>

                            <Field label="Company Logo URL">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={form.logoUrl}
                                    onChange={(e) => set('logoUrl', e.target.value)}
                                />
                            </Field>

                            {/* Upload Image */}
                            <div>
                                <label className="form-label text-xs font-medium text-muted mb-1">Upload Image</label>
                                <div
                                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                                        dragOver ? 'border-primary bg-primary/5' : 'border-defaultborder hover:border-primary/50'
                                    }`}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleFileDrop}
                                >
                                    <i className="bx bx-upload text-2xl text-muted mb-2"></i>
                                    <p className="text-sm font-semibold text-primary">Click to upload or drag and drop</p>
                                    <p className="text-xs text-muted mt-1">PNG, JPG, GIF up to 2MB</p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".png,.jpg,.jpeg,.gif"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Number of Employees">
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.numberOfEmployees}
                                        onChange={(e) => set('numberOfEmployees', e.target.value)}
                                    />
                                </Field>
                                <Field label="GST Number">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.gstNumber}
                                        onChange={(e) => set('gstNumber', e.target.value)}
                                    />
                                </Field>
                            </div>

                            <Field label="Address">
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    value={form.address}
                                    onChange={(e) => set('address', e.target.value)}
                                />
                            </Field>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Field label="City">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.city}
                                        onChange={(e) => set('city', e.target.value)}
                                    />
                                </Field>
                                <Field label="Pin Code">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.pinCode}
                                        onChange={(e) => set('pinCode', e.target.value)}
                                    />
                                </Field>
                                <Field label="Country">
                                    <select
                                        className="form-select"
                                        value={form.country}
                                        onChange={(e) => set('country', e.target.value)}
                                    >
                                        {COUNTRIES.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </Field>
                            </div>
                        </div>
                    </div>

                    {/* Contact Persons */}
                    {form.contactPersons.map((cp, idx) => (
                        <div key={idx} className="box mb-0">
                            <div className="box-header">
                                <h6 className="box-title font-bold !mb-0">Contact Person {idx + 1}</h6>
                            </div>
                            <div className="box-body flex flex-col gap-4">
                                <Field label="Name">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={cp.name}
                                        onChange={(e) => setContact(idx, 'name', e.target.value)}
                                    />
                                </Field>
                                <Field label="Email">
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={cp.email}
                                        onChange={(e) => setContact(idx, 'email', e.target.value)}
                                    />
                                </Field>
                                <Field label="Mobile Number">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={cp.mobileNumber}
                                        onChange={(e) => setContact(idx, 'mobileNumber', e.target.value)}
                                    />
                                </Field>
                                <Field label="Designation">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={cp.designation}
                                        onChange={(e) => setContact(idx, 'designation', e.target.value)}
                                    />
                                </Field>
                            </div>
                        </div>
                    ))}

                    {/* Save Button */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="ti-btn ti-btn-primary px-10 font-semibold disabled:opacity-60"
                        >
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Saving...
                                </>
                            ) : (
                                'Save changes'
                            )}
                        </button>
                        {saveSuccess && (
                            <span className="text-success text-sm font-semibold flex items-center gap-1">
                                <i className="bx bx-check-circle"></i> Saved successfully
                            </span>
                        )}
                    </div>
                </div>

                {/* ── RIGHT: Company Information Card ── */}
                <div className="xl:col-span-4 col-span-12">
                    <div className="box mb-0 sticky top-4">
                        <div className="box-header">
                            <h6 className="box-title font-bold !mb-0">Company Information</h6>
                        </div>
                        <div className="box-body">
                            {/* Logo preview */}
                            <div className="rounded-xl bg-light/60 border border-defaultborder flex items-center justify-center mb-4" style={{ height: '140px' }}>
                                {form.logoUrl ? (
                                    <img
                                        src={form.logoUrl}
                                        alt="Company Logo"
                                        className="max-h-24 max-w-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <span className="text-muted text-sm">logo</span>
                                )}
                            </div>

                            {/* Company name + ID */}
                            <p className="font-bold text-base text-defaulttextcolor">{form.companyName || '—'}</p>
                            <p className="text-xs text-muted mt-0.5">{form.companyId}</p>

                            {/* Status badge */}
                            <div className="mt-3">
                                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                                    form.status === 'Active'
                                        ? 'bg-success/15 text-success'
                                        : 'bg-danger/15 text-danger'
                                }`}>
                                    ● {form.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default CompanyManagementPage;