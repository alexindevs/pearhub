'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import FeedCard from '@/components/Feed/FeedCard';
import { FeedItem, submitInteraction } from '@/lib/api/feed.client';
import { getBusinessMeta } from '@/lib/api/business.client';
import { useParams } from 'next/navigation';
import { useFeed } from '@/hooks/use-feed';
import { withAuthGuard } from '@/app/guards/withAuthGuard';

function FeedPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<FeedItem[]>([]);
  const [businessMeta, setBusinessMeta] = useState<any>(null);
  const [viewed, setViewed] = useState<Set<string>>(new Set());
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const { contents, pagination, loading } = useFeed(
    typeof slug === 'string' ? slug : null,
    page,
    9
  );

  useEffect(() => {
    if (typeof slug === 'string') {
      getBusinessMeta(slug)
        .then((meta) => {
          setBusinessMeta(meta);
        })
        .catch((err) => {
          console.error('Failed to fetch business meta:', err);
        });
    }
  }, [slug]);
  // Calculate hasMore more accurately
  const hasMore = pagination ? page < pagination.totalPages : false;

  // Merge paginated content
  useEffect(() => {
    if (contents && contents.length > 0) {
      setAllPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newPosts = contents.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newPosts];
      });
    }
  }, [contents]);

  // Infinite scroll loader
  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore]);

  // Track views when cards enter viewport
  const trackViews = useCallback(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          const el = entry.target as HTMLElement;
          const id = el.dataset.contentId;

          // Check if already viewed in both local state and in the DOM data attribute
          const alreadyViewed = viewed.has(id || '') || el.dataset.viewed === 'true';

          if (entry.isIntersecting && id && !alreadyViewed) {
            try {
              await submitInteraction('VIEW', id);
              setViewed((prev) => new Set(prev).add(id));

              // Update the viewed state in the DOM as well for redundancy
              el.dataset.viewed = 'true';

              // Update the post in allPosts to reflect the view
              setAllPosts((prev) =>
                prev.map((post) =>
                  post.id === id
                    ? {
                        ...post,
                        views: post.views + 1,
                        user_interactions: {
                          ...post.user_interactions,
                          VIEW: true,
                        },
                      }
                    : post
                )
              );
            } catch (err) {
              console.error('Failed to submit view interaction:', err);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('[data-content-id]').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [viewed]);

  useEffect(() => {
    trackViews();
  }, [allPosts, trackViews]);

  // Determine what to render based on loading state and content availability
  const renderContent = () => {
    if (loading && allPosts.length === 0) {
      return (
        <div className="col-span-3 h-64 flex justify-center items-center text-muted-foreground">
          Loading posts...
        </div>
      );
    }

    if (!loading && allPosts.length === 0) {
      return (
        <div className="col-span-3 h-64 flex justify-center items-center text-muted-foreground">
          No posts found.
        </div>
      );
    }

    return allPosts.map((post) => (
      <div
        key={post.id}
        data-content-id={post.id}
        data-viewed={post.user_interactions?.VIEW ? 'true' : 'false'}
      >
        <FeedCard post={post} />
      </div>
    ));
  };

  return (
    <section className="px-4 md:px-12 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {businessMeta && (
          <div className="flex flex-col mb-6 space-y-2">
            {/* add logo somewhere here later */}
            <h1 className="text-2xl font-semibold">{businessMeta.name}</h1>
            <p className="text-muted-foreground">@{businessMeta.slug}</p>
          </div>
        )}
        {renderContent()}
      </div>

      {hasMore && (
        <div
          ref={loaderRef}
          className="h-16 mt-10 flex justify-center items-center text-muted-foreground"
        >
          Loading more...
        </div>
      )}
    </section>
  );
}

export default withAuthGuard(FeedPage);
