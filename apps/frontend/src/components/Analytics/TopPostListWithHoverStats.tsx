'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAnalyticsExtra } from '@/hooks/use-analytics-extra';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { TopContent, ContentAnalytics } from '@/lib/api/analytics.client';

export default function TopPostListWithHoverStats() {
  const { fetchTopPosts, fetchPostDetails } = useAnalyticsExtra();

  const [topPosts, setTopPosts] = useState<TopContent[]>([]);
  const [hoveredPostId, setHoveredPostId] = useState<string | null>(null);
  const [hoverData, setHoverData] = useState<ContentAnalytics | null>(null);
  const [cache, setCache] = useState<Record<string, ContentAnalytics>>({});
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Separated the fetch details function from the hover handler
  const fetchDetails = useCallback(
    async (postId: string) => {
      if (cache[postId]) {
        setHoverData(cache[postId]);
      } else {
        try {
          const data = await fetchPostDetails(postId);
          setCache((prev) => ({ ...prev, [postId]: data }));
          setHoverData(data);
        } catch (error) {
          console.error('Error fetching post details:', error);
        }
      }
    },
    [cache, fetchPostDetails]
  );

  // Simple hover handler that just sets the ID
  const handleHover = useCallback(
    (postId: string) => {
      setHoveredPostId(postId);
      fetchDetails(postId);
    },
    [fetchDetails]
  );

  // Effect for initial data load only
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const posts = await fetchTopPosts();
        setTopPosts(posts);

        // Only try to fetch details for the first post if we have posts
        if (posts.length > 0) {
          setHoveredPostId(posts[0].contentId);
          await fetchDetails(posts[0].contentId);
        }

        setInitialLoadComplete(true);
        setLoading(false);
      } catch (error) {
        console.error('Error loading top posts:', error);
        setLoading(false);
      }
    }

    if (!initialLoadComplete) {
      loadInitialData();
    }
  }, [fetchTopPosts, fetchDetails, initialLoadComplete]);

  const chartData = hoverData
    ? Object.entries(hoverData.interactions)
        .filter(([key]) => key !== 'undefined') // Filter out any undefined keys
        .map(([key, value]) => ({
          name: key,
          count: typeof value === 'number' ? value : 0, // Ensure value is a number
        }))
    : [];

  if (loading) {
    return <p className="text-muted-foreground text-sm mt-4">Loading top posts...</p>;
  }

  if (topPosts.length === 0) {
    return (
      <div className="mt-10 border rounded-lg p-6 bg-card text-card-foreground text-center">
        <p className="text-lg font-medium">No content yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Once your posts start getting traction, top posts will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-10">
      {/* Left: Post list */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium mb-2">Top Performing Posts</h3>
        {topPosts.map((post) => (
          <div
            key={post.contentId}
            onMouseEnter={() => handleHover(post.contentId)}
            className={`cursor-pointer p-3 border rounded-md ${
              hoveredPostId === post.contentId ? 'bg-muted/50 border-primary' : 'bg-card'
            }`}
          >
            <p className="font-medium">{post.title || 'Untitled Post'}</p>
            <p className="text-sm text-muted-foreground">{post.interactionCount} interactions</p>
          </div>
        ))}
      </div>

      {/* Right: Hovered post breakdown */}
      <div className="p-4 border rounded-lg bg-card text-card-foreground">
        <h3 className="text-lg font-medium mb-4">Interaction Breakdown</h3>
        {hoverData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart layout="vertical" data={chartData}>
              <XAxis type="number" stroke="var(--muted-foreground)" allowDecimals={false} />
              <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--popover)',
                  border: '1px solid var(--border)',
                  color: 'var(--popover-foreground)',
                }}
              />
              <Bar dataKey="count" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading details...' : 'Hover over a post to see details'}
          </p>
        )}
      </div>
    </div>
  );
}
