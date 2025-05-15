import { useEffect, useState } from 'react';
import {
  getPostsPublished,
  getAnalyticsOverview,
  getTopContent,
  getContentAnalytics,
  PostsPublished,
  TopContent,
  ContentAnalytics,
} from '@/lib/api/analytics.client';

type InteractionStat = { name: string; count: number };

export function useAnalyticsExtra() {
  const [postsThisWeek, setPostsThisWeek] = useState<number>(0);
  const [interactionData, setInteractionData] = useState<InteractionStat[]>([]);

  useEffect(() => {
    fetchCoreAnalytics();
  }, []);

  const fetchCoreAnalytics = async () => {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const [monthlyPosts, overview] = await Promise.all([
      getPostsPublished({ type: 'monthly', month: currentMonth }),
      getAnalyticsOverview(),
    ]);

    const totalPosts = monthlyPosts.reduce(
      (sum: number, post: PostsPublished[number]) => sum + post.count,
      0
    );

    const interactions: InteractionStat[] = [
      { name: 'Views', count: overview.views },
      { name: 'Likes', count: overview.likes },
      { name: 'Clicks', count: overview.clicks },
      { name: 'Comments', count: overview.comments },
      { name: 'Shares', count: overview.shares },
    ];

    setPostsThisWeek(totalPosts);
    setInteractionData(interactions);
  };

  const fetchTopPosts = async (limit = 5): Promise<TopContent[]> => {
    const month = new Date().toISOString().slice(0, 7);
    return await getTopContent({ type: 'monthly', month, limit });
  };

  const fetchPostDetails = async (postId: string): Promise<ContentAnalytics> => {
    return await getContentAnalytics(postId);
  };

  return {
    postsThisWeek,
    interactionData,
    fetchTopPosts,
    fetchPostDetails,
  };
}
