"use client"
import { useEffect, useState } from 'react';
import AdminService from '@/services/adminService';
import { usePathname, useRouter } from 'next/navigation';
import { hasPermission, getPermissionForPath, findFirstAuthorizedPath } from '@/shared/utils/permissionUtils';
import { MenuItems } from '@/shared/layout-components/sidebar/nav';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await AdminService.isAuthenticated();
        setIsAuthenticated(authStatus);

        if (!authStatus) {
          router.push('/');
          return;
        }

        // Check permissions for the current route
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        if (user) {
          const requiredPermission = getPermissionForPath(pathname, MenuItems);

          if (requiredPermission && !hasPermission(user, requiredPermission, 'read')) {
            console.warn(`Unauthorized access to ${pathname}. Redirecting...`);
            const firstPath = findFirstAuthorizedPath(user, MenuItems);
            router.push(firstPath);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        router.push('/');
      }
    };

    checkAuth();
  }, [router, pathname]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-defaulttextcolor">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Only render children if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;

