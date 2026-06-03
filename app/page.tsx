"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  COMPANY_HOME_PATH,
  COMPANY_LOGIN_PATH,
  getStoredSessionKind,
} from "@/shared/utils/sessionType";

/**
 * Site root — company portal entry (login or dashboard if already signed in).
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const kind = getStoredSessionKind();
    if (kind === "company") {
      router.replace(COMPANY_HOME_PATH);
      return;
    }
    router.replace(COMPANY_LOGIN_PATH);
  }, [router]);

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Redirecting to company login"
    >
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
    </div>
  );
}
