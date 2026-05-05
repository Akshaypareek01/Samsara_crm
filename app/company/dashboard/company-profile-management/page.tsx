"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy route: company details are managed under Settings.
 * Redirects to avoid maintaining duplicate forms.
 */
const CompanyProfileManagementRedirect = () => {
    const router = useRouter();

    useEffect(() => {
        router.replace("/company/dashboard/settings");
    }, [router]);

    return (
        <div
            className="flex min-h-[30vh] items-center justify-center p-6"
            role="status"
            aria-live="polite"
        >
            <p className="text-sm text-gray-500">Redirecting to company settings…</p>
        </div>
    );
};

export default CompanyProfileManagementRedirect;
