"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminService from '@/services/adminService';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await AdminService.isAuthenticated();
        setIsAuthenticated(authStatus);
        
        if (!authStatus) {
          router.push('/');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        router.push('/');
      }
    };

    checkAuth();
  }, [router]);

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

