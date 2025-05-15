import { useEffect, useState } from 'react';
import { getMemberships, getAnalyticsOverview, getTopContent } from '@/lib/api/analytics.client';

export function useAnalyticsSummary() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{
    totalMembers: number;
    newMembers: number;
    memberGrowth: number;
    totalInteractions: number;
    topPost: { title: string; count: number };
  }>({
    totalMembers: 0,
    newMembers: 0,
    memberGrowth: 0,
    totalInteractions: 0,
    topPost: { title: '', count: 0 },
  });

  useEffect(() => {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = prevDate.toISOString().slice(0, 7);

    async function fetchData() {
      setLoading(true);

      console.log('Fetching data for current month:', currentMonth);
      console.log('Fetching data for previous month:', prevMonth);

      const [currentMembers, prevMembers, overview, topContent] = await Promise.all([
        getMemberships({ type: 'monthly', month: currentMonth }),
        getMemberships({ type: 'monthly', month: prevMonth }),
        getAnalyticsOverview(),
        getTopContent({ type: 'monthly', month: currentMonth }),
      ]);

      console.log('Current Members:', currentMembers);
      console.log('Previous Members:', prevMembers);

      const growth =
        prevMembers.count === 0
          ? currentMembers.count === 0
            ? 0
            : 100
          : ((currentMembers.count - prevMembers.count) / prevMembers.count) * 100;

      setSummary({
        totalMembers: currentMembers.count, // Adjust with seed/base
        newMembers: currentMembers.count,
        memberGrowth: parseFloat(growth.toFixed(1)),
        totalInteractions:
          overview.views + overview.likes + overview.clicks + overview.comments + overview.shares,
        topPost: {
          title: topContent?.[0]?.title ?? 'No posts',
          count: topContent?.[0]?.interactionCount ?? 0,
        },
      });

      setLoading(false);
    }

    fetchData();
  }, []);

  return { loading, summary };
}
