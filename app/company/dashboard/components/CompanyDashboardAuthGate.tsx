"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ApiService from "@/services/ApiService";

const LOGIN_PATH = "/company/login";

/**
 * Ensures only authenticated company users can access dashboard routes.
 * Shows a minimal loading state while verifying local session.
 *
 * @param props - React children to render when authenticated
 */
const CompanyDashboardAuthGate: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const verify = async () => {
            try {
                const ok = await ApiService.isAuthenticated();
                if (cancelled) return;
                if (!ok) {
                    const next = encodeURIComponent(pathname || "/company/dashboard");
                    router.replace(`${LOGIN_PATH}?next=${next}`);
                    return;
                }
            } catch {
                if (!cancelled) {
                    router.replace(LOGIN_PATH);
                }
                return;
            }
            if (!cancelled) {
                setReady(true);
            }
        };

        void verify();

        return () => {
            cancelled = true;
        };
    }, [pathname, router]);

    if (!ready) {
        return (
            <div
                className="flex min-h-[50vh] w-full items-center justify-center p-8"
                role="status"
                aria-live="polite"
                aria-label="Checking session"
            >
                <div className="text-sm text-gray-500 dark:text-white/60">
                    Loading…
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default CompanyDashboardAuthGate;
