"use client"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminService from "@/services/adminService";
import { findFirstAuthorizedPath } from "@/shared/utils/permissionUtils";
import { MenuItems } from "@/shared/layout-components/sidebar/nav";

export default function Home() {
  useEffect(() => {
    // Check if already authenticated
    checkAuth();
  }, []);

  const [loading, setLoading] = useState(false);
  const [err, setError] = useState("");
  const [data, setData] = useState({
    "email": "admin@samsarawellness.in",
    "password": "",
  });
  const { email, password } = data;

  const changeHandler = (e: any) => {
    setData({ ...data, [e.target.name]: e.target.value });
    setError("");
  };

  const checkAuth = async () => {
    try {
      const isAuth = await AdminService.isAuthenticated();
      if (isAuth) {
        RouteChange();
      }
    } catch (error) {
      // Not authenticated, stay on login page
    }
  };

  const Login1 = async (e: any) => {
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
      RouteChange();
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  const router = useRouter();
  const RouteChange = () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const path = findFirstAuthorizedPath(user, MenuItems);
    router.push(path);
  };
  return (
    <>
      <html>
        <body>
          <div className="container">
            <div className="flex justify-center authentication authentication-basic items-center h-full text-defaultsize text-defaulttextcolor">
              <div className="grid grid-cols-12">
                <div className="xxl:col-span-4 xl:col-span-4 lg:col-span-4 md:col-span-3 sm:col-span-2"></div>
                <div className="xxl:col-span-4 xl:col-span-4 lg:col-span-4 md:col-span-6 sm:col-span-8 col-span-12">
                  <div className="my-[2.5rem] flex justify-center mb-6">
                    <img src="/assets/images/logosm.png" alt="logo" className="h-32 w-auto" />
                  </div>
                  <div className="box !p-[3rem]">
                    <div className="box-body">
                      <p className="h5 font-semibold mb-4 text-center">Sign In</p>
                      {err && <div className="p-4 mb-4 bg-danger/40 text-sm border-t-4 border-danger text-danger/60 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                        {err}
                      </div>}

                      <form onSubmit={Login1}>
                        <div className="grid grid-cols-12 gap-y-4">
                          <div className="xl:col-span-12 col-span-12">
                            <label htmlFor="signin-email" className="form-label text-default">Email</label>
                            <input
                              type="email"
                              name="email"
                              className="form-control form-control-lg w-full !rounded-md"
                              id="email"
                              onChange={changeHandler}
                              value={email}
                              required
                            />
                          </div>
                          <div className="xl:col-span-12 col-span-12">
                            <label htmlFor="signin-password" className="form-label text-default">Password</label>
                            <input
                              name="password"
                              type="password"
                              value={password}
                              onChange={changeHandler}
                              className="form-control form-control-lg w-full !rounded-md"
                              id="signin-password"
                              placeholder="Password"
                              required
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
                <div className="xxl:col-span-4 xl:col-span-4 lg:col-span-4 md:col-span-3 sm:col-span-2"></div>
              </div>
            </div>
          </div>
        </body>
      </html>
    </>
  );
}
