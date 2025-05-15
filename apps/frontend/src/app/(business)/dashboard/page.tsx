'use client';

import { useEffect, useState } from 'react';
import { getAllContent } from '@/lib/api/content.client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { CreatePostModal } from '@/components/Dashboard/CreatePostsModal';
import { Edit2 } from 'lucide-react';
import { MarkdownDisplayer } from '@/components/Shared/Markdown';
import { EditPostModal } from '@/components/Dashboard/EditPostsModal';
import { withAuthGuard } from '@/app/guards/withAuthGuard';

type Post = {
  id: string;
  title: string;
  description: string;
  type: 'TEXT' | 'IMAGE' | 'LONGFORM' | 'LINK';
  body: string;
  mediaUrl?: string;
  tags: string[];
  createdAt: string;
};

function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshPosts = async () => {
    const data = await getAllContent();
    setPosts(data);
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllContent();
        setPosts(data);
      } catch (err: any) {
        toast.error('Failed to load posts', {
          description: err?.response?.data?.message || 'Try again later.',
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="py-6 md:py-10 md:min-h-screen md:bg-accent">
      <div className="w-full md:p-6  rounded md:w-[90%] bg-white mx-auto">
        <div className="flex p-4 md:p-0 justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold">Posts Overview</h2>
          <CreatePostModal onCreated={refreshPosts} />
        </div>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet. Create one to get started!</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onPostUpdated={refreshPosts} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const PostCard = ({ post, onPostUpdated }: { post: Post; onPostUpdated?: () => void }) => {
  const created = format(new Date(post.createdAt), 'PPP ‧ p');

  return (
    <Card className="mx-4 md:mx-0">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">{post.title}</h3>
          <p className="text-sm text-muted-foreground">{created}</p>
        </div>

        <EditPostModal
          postId={post.id}
          onUpdated={onPostUpdated}
          trigger={
            <Button size="sm" variant="outline">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          }
        />
      </CardHeader>

      <CardContent>
        {post.type === 'IMAGE' && post.mediaUrl && (
          <div className="relative h-64 w-full mb-4 rounded-md overflow-hidden">
            <Image src={post.mediaUrl} alt={post.title} fill className="object-cover" />
          </div>
        )}

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

        {post.type === 'LONGFORM' ? (
          <MarkdownDisplayer content={post.body} className="overflow-hidden !overflow-ellipsis" />
        ) : post.type === 'TEXT' ? (
          <p className="text-base">{post.body}</p>
        ) : null}

        {post.description && (
          <p className="text-sm text-muted-foreground mt-2">{post.description}</p>
        )}

        {post.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">
                #{t}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default withAuthGuard(DashboardPage);
