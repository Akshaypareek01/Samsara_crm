"use client";

import React from "react";
import type { Company } from "@/services/companyService";
import CrmRightDrawer from "../components/CrmRightDrawer";
import { formatCompanyAddress, getCompanyLogoUrl } from "@/shared/utils/companyDisplayUtils";
import { displayOrDash } from "@/app/company/dashboard/components/companyTrainerProfileUtils";

export type AdminCompanyProfileDrawerProps = {
    open: boolean;
    company: Company | null;
    loading?: boolean;
    onClose: () => void;
    stacked?: boolean;
};

/**
 * Read-only company profile drawer for CRM admin.
 */
const AdminCompanyProfileDrawer: React.FC<AdminCompanyProfileDrawerProps> = ({
    open,
    company,
    loading = false,
    onClose,
    stacked = false,
}) => {
    const logoUrl = getCompanyLogoUrl(company);
    const addressLine = formatCompanyAddress(company);
    const name = company?.companyName?.trim() || "Company";

    return (
        <CrmRightDrawer
            open={open}
            title="Company profile"
            onClose={onClose}
            maxWidthClass="max-w-xl"
            ariaLabelledBy="admin-company-profile-title"
            zIndexClass={stacked ? "z-[1060]" : "z-[1050]"}
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading company…</span>
                    </div>
                    <p className="text-sm text-muted mb-0">Loading company…</p>
                </div>
            ) : !company ? (
                <p className="text-sm text-muted mb-0">No company selected.</p>
            ) : (
                <div className="space-y-5">
                    <div className="text-center pb-4 border-b border-defaultborder/60">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt=""
                                className="w-24 h-24 rounded-xl mx-auto mb-3 object-contain border border-defaultborder bg-white p-2"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                }}
                            />
                        ) : (
                            <div
                                className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 border border-primary/20"
                                aria-hidden="true"
                            >
                                <span className="text-primary font-bold text-3xl">
                                    {name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <h3 className="text-xl font-bold text-defaulttextcolor mb-0">{name}</h3>
                        {company.companyId && (
                            <p className="text-xs text-muted mt-1 mb-0">ID: {company.companyId}</p>
                        )}
                        <span
                            className={`badge text-xs mt-2 ${company.status !== false ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
                        >
                            {company.status !== false ? "Active" : "Inactive"}
                        </span>
                    </div>

                    <section>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">Contact</h4>
                        <dl className="grid grid-cols-1 gap-2 text-sm mb-0">
                            <div>
                                <dt className="text-muted text-xs">Email</dt>
                                <dd className="font-medium mb-0 break-all">{displayOrDash(company.email)}</dd>
                            </div>
                            <div>
                                <dt className="text-muted text-xs">Domain</dt>
                                <dd className="font-medium mb-0">{displayOrDash(company.domain)}</dd>
                            </div>
                            <div>
                                <dt className="text-muted text-xs">Address</dt>
                                <dd className="font-medium mb-0">{addressLine}</dd>
                            </div>
                        </dl>
                    </section>

                    <section>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">Business</h4>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-0">
                            <div>
                                <dt className="text-muted text-xs mb-0.5">Employees</dt>
                                <dd className="font-medium mb-0">
                                    {displayOrDash(company.numberOfEmployees)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted text-xs mb-0.5">GST</dt>
                                <dd className="font-medium mb-0">{displayOrDash(company.gstNumber)}</dd>
                            </div>
                        </dl>
                    </section>

                    {(company.contactPerson1?.name || company.contactPerson2?.name) && (
                        <section className="rounded-lg border border-defaultborder p-4 bg-light/30 dark:bg-black/20">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">
                                Contact persons
                            </h4>
                            {[company.contactPerson1, company.contactPerson2]
                                .filter((cp) => cp?.name)
                                .map((cp, idx) => (
                                    <dl key={idx} className="text-sm mb-3 last:mb-0">
                                        <dt className="font-semibold text-defaulttextcolor">{cp?.name}</dt>
                                        <dd className="text-muted text-xs mb-0">
                                            {displayOrDash(cp?.designation)} · {displayOrDash(cp?.email)} ·{" "}
                                            {displayOrDash(cp?.mobileNumber)}
                                        </dd>
                                    </dl>
                                ))}
                        </section>
                    )}
                </div>
            )}
        </CrmRightDrawer>
    );
};

export default AdminCompanyProfileDrawer;
