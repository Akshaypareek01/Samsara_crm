"use client";

import Pageheader from "@/shared/layout-components/page-header/pageheader";
import Seo from "@/shared/layout-components/seo/seo";
import Link from "next/link";
import React, { Fragment, useState } from "react";
import { ContactPerson, Company } from "@/services/companyService";
import { useCompanySession } from "@/hooks/useCompanySession";

/**
 * Build display rows for primary and secondary contact from API shape.
 *
 * @param profile - Company profile payload.
 */
function getContactsFromProfile(profile: Company): {
    primary: ContactPerson;
    secondary: ContactPerson;
} {
    const primary = profile.contactPerson1 || {};
    const secondary = profile.contactPerson2 || {};
    return {
        primary: {
            name: primary.name || "—",
            designation: primary.designation || "—",
            mobileNumber: primary.mobileNumber || "—",
            email: primary.email || "—",
        },
        secondary: {
            name: secondary.name || "—",
            designation: secondary.designation || "—",
            mobileNumber: secondary.mobileNumber || "—",
            email: secondary.email || "—",
        },
    };
}

const CompanyProfile = () => {
    const { company, loading, error } = useCompanySession();
    const [activeTab, setActiveTab] = useState<"primary" | "secondary">("primary");

    const contacts = company ? getContactsFromProfile(company) : null;
    const current =
        activeTab === "primary" ? contacts?.primary : contacts?.secondary;

    return (
        <Fragment>
            <Seo title={"Company Profile"} />
            <Pageheader
                currentpage="Company Overview"
                activepage="Company Profile"
                mainpage="Company Overview"
            />

            {loading && (
                <div className="box box-body text-center text-muted py-10">
                    Loading profile…
                </div>
            )}

            {!loading && error && (
                <div className="alert alert-danger mb-4" role="alert">
                    {error}
                </div>
            )}

            {!loading && company && (
                <div className="grid grid-cols-12 gap-x-6">
                    <div className="col-span-12 xl:col-span-8">
                        <div className="box">
                            <div className="box-body">
                                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                                    <div className="flex flex-wrap items-start gap-6">
                                        <div className="flex-shrink-0">
                                            {company.companyLogo ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={company.companyLogo}
                                                    alt=""
                                                    className="rounded-full object-cover bg-orange-50"
                                                    style={{
                                                        width: "5rem",
                                                        height: "5rem",
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    className="avatar avatar-xxl !rounded-full bg-orange-100 flex items-center justify-center"
                                                    style={{
                                                        width: "5rem",
                                                        height: "5rem",
                                                    }}
                                                >
                                                    <i className="bx bxs-leaf text-[2rem] text-orange-500"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-[1.25rem] mb-4">
                                                {company.companyName || "Company"}
                                            </h4>
                                            <div className="grid grid-cols-12 gap-4">
                                                <div className="col-span-12 sm:col-span-6">
                                                    <p className="text-[#8c9097] dark:text-white/50 text-[0.8125rem] mb-1">
                                                        Company ID
                                                    </p>
                                                    <p className="font-semibold text-[0.9375rem]">
                                                        {company.companyId || "—"}
                                                    </p>
                                                </div>
                                                <div className="col-span-12 sm:col-span-6">
                                                    <p className="text-[#8c9097] dark:text-white/50 text-[0.8125rem] mb-1">
                                                        Email
                                                    </p>
                                                    <p className="font-semibold text-[0.9375rem]">
                                                        {company.email || "—"}
                                                    </p>
                                                </div>
                                                <div className="col-span-12">
                                                    <p className="text-[#8c9097] dark:text-white/50 text-[0.8125rem] mb-1">
                                                        Location
                                                    </p>
                                                    <p className="font-semibold text-[0.9375rem]">
                                                        {[
                                                            company.address,
                                                            company.city,
                                                            company.pincode,
                                                            company.country,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(", ") || "—"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        href="/company/dashboard/settings"
                                        className="ti-btn !py-2 !px-4 !text-[0.875rem] !font-medium ti-btn-wave !bg-primary !text-white shrink-0"
                                        aria-label="Edit company details in settings"
                                    >
                                        <i className="ri-settings-3-line me-1"></i>
                                        Edit in Settings
                                    </Link>
                                </div>

                                <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-black/20 rounded-lg w-fit">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("primary")}
                                        className={`flex items-center gap-2 !py-2 !px-4 rounded-md text-[0.875rem] font-medium transition-all ${
                                            activeTab === "primary"
                                                ? "bg-orange-500 text-white shadow-sm"
                                                : "text-[#8c9097] hover:text-defaulttextcolor"
                                        }`}
                                    >
                                        <i className="bx bx-user"></i>
                                        Primary contact
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("secondary")}
                                        className={`flex items-center gap-2 !py-2 !px-4 rounded-md text-[0.875rem] font-medium transition-all ${
                                            activeTab === "secondary"
                                                ? "bg-orange-500 text-white shadow-sm"
                                                : "text-[#8c9097] hover:text-defaulttextcolor"
                                        }`}
                                    >
                                        <i className="bx bx-user"></i>
                                        Secondary contact
                                    </button>
                                </div>

                                {current && (
                                    <div className="grid grid-cols-12 gap-6">
                                        <div className="col-span-12 sm:col-span-6">
                                            <p className="text-[#8c9097] dark:text-white/50 text-[0.8125rem] mb-1">
                                                Full name
                                            </p>
                                            <p className="font-bold text-[1rem]">
                                                {current.name}
                                            </p>
                                        </div>
                                        <div className="col-span-12 sm:col-span-6">
                                            <p className="text-[#8c9097] dark:text-white/50 text-[0.8125rem] mb-1">
                                                Designation
                                            </p>
                                            <p className="font-bold text-[1rem]">
                                                {current.designation}
                                            </p>
                                        </div>
                                        <div className="col-span-12 sm:col-span-6">
                                            <p className="text-[#8c9097] dark:text-white/50 text-[0.8125rem] mb-1">
                                                Mobile
                                            </p>
                                            <p className="font-bold text-[1rem]">
                                                {current.mobileNumber}
                                            </p>
                                        </div>
                                        <div className="col-span-12 sm:col-span-6">
                                            <p className="text-[#8c9097] dark:text-white/50 text-[0.8125rem] mb-1">
                                                Email
                                            </p>
                                            <p className="font-bold text-[1rem] break-all">
                                                {current.email}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-span-12 xl:col-span-4">
                        <div className="box mb-6">
                            <div className="box-header">
                                <div className="box-title">Organization</div>
                            </div>
                            <div className="box-body !pt-2 flex flex-col gap-3 text-[0.875rem]">
                                <div>
                                    <p className="text-muted mb-0">Domain</p>
                                    <p className="font-semibold mb-0">
                                        {company.domain || "—"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted mb-0">Employees (reported)</p>
                                    <p className="font-semibold mb-0">
                                        {company.numberOfEmployees ?? "—"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted mb-0">GST</p>
                                    <p className="font-semibold mb-0">
                                        {company.gstNumber || "—"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted mb-0">PAN</p>
                                    <p className="font-semibold mb-0">
                                        {company.panNumber || "—"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted mb-0">Status</p>
                                    <p className="font-semibold mb-0">
                                        {company.status !== false
                                            ? "Active"
                                            : "Inactive"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
};

export default CompanyProfile;
