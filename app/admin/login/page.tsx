"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminService from "@/services/adminService";
import { findFirstAuthorizedPath } from "@/shared/utils/permissionUtils";
import { MenuItems } from "@/shared/layout-components/sidebar/nav";
import {
  ADMIN_HOME_PATH,
  COMPANY_HOME_PATH,
  getStoredSessionKind,
  TRAINER_HOME_PATH,
} from "@/shared/utils/sessionType";

/**
 * Admin CRM sign-in. Company and trainer sessions are sent to their own portals.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setError] = useState("");
  const [data, setData] = useState({
    email: "admin@samsarawellness.in",
    password: "",
  });
  const { email, password } = data;

  useEffect(() => {
    void redirectIfAlreadySignedIn();
  }, []);

  /**
   * Sends authenticated users to the correct portal; admins go to the first allowed CRM route.
   */
  const redirectIfAlreadySignedIn = async () => {
    const kind = getStoredSessionKind();
    if (kind === "company") {
      router.replace(COMPANY_HOME_PATH);
      return;
    }
    if (kind === "trainer") {
      router.replace(TRAINER_HOME_PATH);
      return;
    }
    if (kind !== "admin") {
      return;
    }

    try {
      const isAuth = await AdminService.isAuthenticated();
      if (!isAuth) return;

      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const path = findFirstAuthorizedPath(user, MenuItems);
      router.replace(path || ADMIN_HOME_PATH);
    } catch {
      // Stay on login
    }
  };

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
    setError("");
  };

  const Login1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        setError("Please enter both email and password");
        setLoading(false);
        return;
      }

      await AdminService.login(email, password);
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const path = findFirstAuthorizedPath(user, MenuItems);
      router.push(path || ADMIN_HOME_PATH);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Login failed. Please check your credentials.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="flex justify-center authentication authentication-basic items-center h-full text-defaultsize text-defaulttextcolor">
        <div className="grid grid-cols-12">
          <div className="xxl:col-span-4 xl:col-span-4 lg:col-span-4 md:col-span-3 sm:col-span-2" />
          <div className="xxl:col-span-4 xl:col-span-4 lg:col-span-4 md:col-span-6 sm:col-span-8 col-span-12">
            <div className="my-[2.5rem] flex justify-center mb-6">
              <img
                src="/assets/images/logosm.png"
                alt="Samsara Wellness logo"
                className="h-32 w-auto"
              />
            </div>
            <div className="box !p-[3rem]">
              <div className="box-body">
                <p className="h5 font-semibold mb-1 text-center">Admin CRM</p>
                <p className="text-sm text-center text-muted mb-4">
                  Company portal:{" "}
                  <a href="/company/login" className="text-primary font-semibold">
                    Company login
                  </a>
                </p>
                {err && (
                  <div
                    className="p-4 mb-4 bg-danger/40 text-sm border-t-4 border-danger text-danger/60 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
                    role="alert"
                  >
                    {err}
                  </div>
                )}

                <form onSubmit={Login1}>
                  <div className="grid grid-cols-12 gap-y-4">
                    <div className="xl:col-span-12 col-span-12">
                      <label htmlFor="signin-email" className="form-label text-default">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="form-control form-control-lg w-full !rounded-md"
                        id="signin-email"
                        onChange={changeHandler}
                        value={email}
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div className="xl:col-span-12 col-span-12">
                      <label htmlFor="signin-password" className="form-label text-default">
                        Password
                      </label>
                      <input
                        name="password"
                        type="password"
                        value={password}
                        onChange={changeHandler}
                        className="form-control form-control-lg w-full !rounded-md"
                        id="signin-password"
                        placeholder="Password"
                        required
                        autoComplete="current-password"
                      />
                    </div>
                    <div className="xl:col-span-12 col-span-12 grid mt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="ti-btn ti-btn-primary !bg-primary !text-white !font-medium w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Signing In..." : "Sign In"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="xxl:col-span-4 xl:col-span-4 lg:col-span-4 md:col-span-3 sm:col-span-2" />
        </div>
      </div>
    </div>
  );
}
