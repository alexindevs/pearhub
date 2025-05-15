'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export const withAuthGuard = (Component: React.FC) => {
  return function ProtectedComponent() {
    const { authState, isBusinessOwner, isMember } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      const businessRoutes = ['/dashboard', '/dashboard/analytics'];
      const memberRoutes = ['/subscriptions'];

      const isBusinessRoute = businessRoutes.includes(pathname);
      const isMemberRoute = memberRoutes.includes(pathname);

      if (!authState.isAuthenticated) {
        router.push('/login');
        return;
      }

      if (isBusinessRoute && !isBusinessOwner()) {
        router.replace('/forbidden');
      } else if (isMemberRoute && !isMember()) {
        router.replace('/forbidden');
      }
    }, [authState, pathname, router, isBusinessOwner, isMember]);

    if (authState.isLoading) {
      return <p className="p-4 text-muted-foreground">Checking access...</p>;
    }

    return <Component />;
  };
};
