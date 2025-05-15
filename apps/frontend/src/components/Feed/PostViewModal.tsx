'use client';

import { useEffect, useState } from 'react';
import { getPostDetails, submitInteraction, removeInteraction } from '@/lib/api/feed.client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Eye, Heart, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { MarkdownDisplayer } from '../Shared/Markdown';
import { DialogTitle } from '@radix-ui/react-dialog';
import { nanoid } from 'nanoid';
import { toast } from 'sonner';

export default function PostViewModal({
  postId,
  open,
  onClose,
}: {
  postId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [post, setPost] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [shareText, setShareText] = useState('');
  const [showShareInput, setShowShareInput] = useState(false);
  const [sharedUid, setSharedUid] = useState<string | null>(null);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const data = await getPostDetails(postId);
      console.log('Post details:', data);
      setPost(data);
    } catch (err) {
      console.error('Failed to fetch post details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchPost();
  }, [open, postId]);

  const handleLike = async () => {
    if (!post) return;

    const isLiked = post.user_interactions?.LIKE;

    try {
      if (isLiked) {
        await removeInteraction('LIKE', postId);
      } else {
        await submitInteraction('LIKE', postId);
      }
      // Refresh post data to get updated interactions
      await fetchPost();
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !post) return;

    try {
      await submitInteraction('COMMENT', postId, comment);
      setComment('');
      await fetchPost();
    } catch (err) {
      console.error('Failed to submit comment:', err);
    }
  };

  const handleShare = async () => {
    if (!post) return;

    // If already shared, re-copy the link
    if (sharedUid) {
      const shareUrl = `${window.location.origin}/${window.location.pathname}?s=${sharedUid}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied! Keep it safe, you can only share once.');
      return;
    } else {
      if (post.user_interactions?.SHARE) {
        toast.error('You have already shared this post.');
        return;
      }
    }

    try {
      const uid = nanoid(8); // short unique id
      const shareUrl = `${window.location.origin}/${window.location.pathname}?s=${uid}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);

      // Update state to reflect shared link
      setSharedUid(uid);

      // Send interaction to backend
      await submitInteraction('SHARE', postId, uid);

      toast.success('Your share link was copied! Keep it safe.');
    } catch (err) {
      console.error('Failed to share post:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl overflow-y-scroll scrollbar-hide max-h-screen p-6"
        aria-describedby={
          post?.description ? 'post-description' : (undefined as string | undefined)
        }
      >
        <DialogTitle className="text-2xl font-bold mb-3">
          {loading ? 'Loading...' : post?.title || 'Post Details'}
        </DialogTitle>
        {loading || !post ? (
          <p className="text-muted-foreground">Loading post...</p>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4" id="post-description">
                {post.description}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(post.createdAt), 'PPP ‧ p')}
              </p>
            </div>

            {post.type === 'IMAGE' && post.mediaUrl && (
              <Image
                src={post.mediaUrl}
                width={400}
                height={400}
                priority
                alt={post.title}
                className="rounded-md w-full max-h-[400px] object-cover"
              />
            )}

            {post.type === 'LONGFORM' && (
              <MarkdownDisplayer
                className="prose dark:prose-invert scrollbar-hide"
                content={post.body}
              />
            )}

            {post.type === 'TEXT' && <p>{post.body}</p>}

            {post.type === 'LINK' && (
              <div className="block bg-muted p-4 rounded-md hover:bg-muted/70 transition overflow-ellipsis">
                <a
                  href={post.body}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden"
                >
                  🔗 {post.body}
                </a>
              </div>
            )}

            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-4 items-center text-muted-foreground text-sm mt-4">
              <button className="flex gap-1 items-center" disabled>
                <Eye className="w-4 h-4" /> {post.stats?.views || 0}
              </button>
              <button className="flex gap-1 items-center" onClick={handleLike}>
                <Heart
                  className={`w-4 h-4 ${post.user_interactions?.LIKE ? 'fill-primary' : ''}`}
                  style={{
                    color: post.user_interactions?.LIKE ? 'var(--primary)' : undefined,
                  }}
                />
                {post.stats?.likes || 0}
              </button>
              <button
                className="flex gap-1 items-center"
                onClick={handleShare}
                title={sharedUid ? 'Link copied again!' : 'Generate share link'}
              >
                <Share2 className="w-4 h-4" />
                {post.stats?.shares || 0}
              </button>
            </div>

            {showShareInput && (
              <div className="mt-2">
                <Input
                  value={shareText}
                  onChange={(e) => setShareText(e.target.value)}
                  placeholder="Add a message with your share..."
                  className="mb-2"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowShareInput(false)}
                    className="px-3 py-1 text-sm bg-muted rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleShare}
                    className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md"
                  >
                    Share
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6">
              <form onSubmit={handleComment}>
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                />
              </form>
            </div>

            <div className="space-y-2 mt-4">
              {post.comments?.map((c: any, idx: number) => (
                <div key={idx} className="text-sm border-b py-2">
                  <div className="font-medium">{c.user?.name || 'Unknown User'}</div>
                  <div>{c.payload}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(c.createdAt), 'PPP ‧ p')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
