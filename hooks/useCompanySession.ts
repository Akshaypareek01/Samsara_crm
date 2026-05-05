"use client";

import { useCallback, useEffect, useState } from "react";
import CompanyService, { Company } from "@/services/companyService";

type UseCompanySessionResult = {
    company: Company | null;
    loading: boolean;
    error: string | null;
    /** Reload profile from `GET /companies/profile`. */
    refetch: () => Promise<void>;
};

/**
 * Cached company profile for authenticated company dashboard routes.
 *
 * @returns Current company document, loading state, and refetch helper.
 */
export function useCompanySession(): UseCompanySessionResult {
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const profile = await CompanyService.getCompanyProfile();
            setCompany(profile);
        } catch (e: unknown) {
            const message =
                e instanceof Error ? e.message : "Failed to load company profile";
            setError(message);
            setCompany(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refetch();
    }, [refetch]);

    return { company, loading, error, refetch };
}
