import { useEffect, useState, useCallback } from 'react';
import { getBusinessFeed, FeedItem, FeedPagination } from '@/lib/api/feed.client';

export function useFeed(slug: string | null, page = 1, limit = 12) {
  const [contents, setContents] = useState<FeedItem[]>([]);
  const [pagination, setPagination] = useState<FeedPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFeed = useCallback(async () => {
    if (!slug) return;

    try {
      setLoading(true);
      setError(null);

      const { data: newContents, pagination: newPagination } = await getBusinessFeed(
        slug,
        page,
        limit
      );
      // Only update state if we received valid data
      if (Array.isArray(newContents)) {
        setContents(newContents);
      }

      if (newPagination) {
        setPagination(newPagination);
      }
    } catch (err) {
      console.error('Error fetching feed:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [slug, page, limit]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return {
    contents,
    pagination,
    loading,
    error,
    refetch: fetchFeed,
  };
}
