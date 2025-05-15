'use client';

import { useEffect, useState } from 'react';
import { getMyBusiness } from '@/lib/api/business.client';

export type BusinessMeta = {
  id: string;
  name: string;
  slug: string;
  logo?: string;
};

export function useBusiness() {
  const [business, setBusiness] = useState<BusinessMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyBusiness();
        setBusiness(data);
      } catch {
        setBusiness(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { business, loading };
}
