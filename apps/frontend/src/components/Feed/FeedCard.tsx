'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FeedItem, submitInteraction, removeInteraction } from '@/lib/api/feed.client';
import { Eye, Heart, MessageSquare, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import PostViewModal from './PostViewModal';

export default function FeedCard({ post }: { post: FeedItem }) {
  const created = format(new Date(post.createdAt), 'PPP ‧ p');
  const userInteractions = post.user_interactions || {};

  // Local state to track interactions
  const [interactions, setInteractions] = useState({
    LIKE: userInteractions.LIKE || false,
    COMMENT: userInteractions.COMMENT || false,
    SHARE: userInteractions.SHARE || false,
    CLICK: userInteractions.CLICK || false,
    VIEW: userInteractions.VIEW || false,
  });

  // Local state for interaction counts
  const [counts, setCounts] = useState({
    views: post.views || 0,
    likes: post.likes || 0,
    comments: post.comments || 0,
    shares: post.shares || 0,
    clicks: post.clicks || 0,
  });

  const [modalOpen, setModalOpen] = useState(false);

  const handleCardClick = async () => {
    if (interactions.CLICK) {
      setModalOpen(true);
      return;
    }

    setInteractions((prev) => ({ ...prev, CLICK: true }));
    setCounts((prev) => ({ ...prev, clicks: prev.clicks + 1 }));

    try {
      await submitInteraction('CLICK', post.id);
    } catch (err) {
      // Revert on error
      setInteractions((prev) => ({ ...prev, CLICK: false }));
      setCounts((prev) => ({ ...prev, clicks: prev.clicks - 1 }));
      console.error('Failed to submit click interaction:', err);
    }

    // Open modal
    setModalOpen(true);
  };

  // Handle like, with toggle functionality
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    try {
      if (interactions.LIKE) {
        // Optimistic update for unlike
        setInteractions((prev) => ({ ...prev, LIKE: false }));
        setCounts((prev) => ({ ...prev, likes: Math.max(0, prev.likes - 1) }));
        await removeInteraction('LIKE', post.id);
      } else {
        // Optimistic update for like
        setInteractions((prev) => ({ ...prev, LIKE: true }));
        setCounts((prev) => ({ ...prev, likes: prev.likes + 1 }));
        await submitInteraction('LIKE', post.id);
      }
    } catch (err) {
      // Revert on error
      setInteractions((prev) => ({ ...prev, LIKE: !prev.LIKE }));
      setCounts((prev) => ({
        ...prev,
        likes: interactions.LIKE ? prev.likes + 1 : Math.max(0, prev.likes - 1),
      }));
      console.error('Failed to toggle like:', err);
    }
  };

  // Handle comment click - open modal
  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setModalOpen(true);
  };

  // Handle share click - open modal
  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setModalOpen(true);
  };

  // Close modal and refresh post data
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Card
        className="w-full h-full flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleCardClick}
      >
        <CardHeader className="flex flex-col items-start">
          <h3 className="text-lg font-semibold">{post.title}</h3>
          <p className="text-sm text-muted-foreground">{created}</p>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {post.type === 'IMAGE' && post.mediaUrl && (
            <div className="relative h-56 w-full rounded-md overflow-hidden">
              <Image src={post.mediaUrl} alt={post.title} fill className="object-cover" />
            </div>
          )}

          {post.type === 'LONGFORM' ? (
            <p className="text-sm text-muted-foreground line-clamp-4">{post.body}</p>
          ) : post.type === 'TEXT' ? (
            <p className="text-base">{post.body}</p>
          ) : null}

          {post.description && <p className="text-sm text-muted-foreground">{post.description}</p>}

          {!!post.tags?.length && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center mt-2 text-muted-foreground text-xs">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {counts.views}
            </span>

            <button onClick={handleLike} className="flex items-center gap-1">
              <Heart
                className={`w-4 h-4 ${interactions.LIKE ? 'fill-primary' : ''}`}
                style={{ color: interactions.LIKE ? 'var(--primary)' : undefined }}
              />
              {counts.likes}
            </button>

            <button onClick={handleCommentClick} className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {counts.comments}
            </button>

            <button onClick={handleShareClick} className="flex items-center gap-1">
              <Share2 className="w-4 h-4" />
              {counts.shares}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Modal for post details */}
      <PostViewModal postId={post.id} open={modalOpen} onClose={handleCloseModal} />
    </>
  );
}
