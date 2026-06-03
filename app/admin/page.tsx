"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { findFirstAuthorizedPath } from "@/shared/utils/permissionUtils";
import { MenuItems } from "@/shared/layout-components/sidebar/nav";
import {
  ADMIN_HOME_PATH,
  ADMIN_LOGIN_PATH,
  getStoredSessionKind,
} from "@/shared/utils/sessionType";

/**
 * `/admin` entry — CRM home when signed in as admin, otherwise admin login.
 */
export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const kind = getStoredSessionKind();
    if (kind !== "admin") {
      router.replace(ADMIN_LOGIN_PATH);
      return;
    }

    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const path = findFirstAuthorizedPath(user, MenuItems);
    router.replace(path || ADMIN_HOME_PATH);
  }, [router]);

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Loading admin portal"
    >
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
    </div>
  );
}
