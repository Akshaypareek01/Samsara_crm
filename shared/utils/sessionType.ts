export type SessionKind = "admin" | "company" | "trainer" | "none";

export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_HOME_PATH = "/dashboards/analytics";
export const COMPANY_LOGIN_PATH = "/company/login";
export const COMPANY_HOME_PATH = "/company/dashboard";
export const TRAINER_LOGIN_PATH = "/trainer/login";
export const TRAINER_HOME_PATH = "/trainer/dashboard";

/**
 * Classifies the current browser session from localStorage.
 * Admin, company, and trainer share the same token keys — type disambiguation is required.
 */
export function getStoredSessionKind(): SessionKind {
  if (typeof window === "undefined") {
    return "none";
  }

  const auth = localStorage.getItem("Auth");
  const token = localStorage.getItem("token");
  if (auth !== "true" || !token) {
    return "none";
  }

  const userType = localStorage.getItem("userType");
  if (userType === "trainer") return "trainer";
  if (userType === "company") return "company";
  if (userType === "admin") return "admin";

  try {
    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    if (!user || typeof user !== "object") return "none";

    if (user.companyName || user.companyLogo || user.companyId) {
      return "company";
    }

    if (user.role || user.username || user.name === "Admin") {
      return "admin";
    }
  } catch {
    return "none";
  }

  return "none";
}

/**
 * Default post-login or portal entry path for the active session kind.
 */
export function getHomePathForSession(kind: SessionKind): string {
  switch (kind) {
    case "admin":
      return ADMIN_HOME_PATH;
    case "company":
      return COMPANY_HOME_PATH;
    case "trainer":
      return TRAINER_HOME_PATH;
    default:
      return COMPANY_LOGIN_PATH;
  }
}
