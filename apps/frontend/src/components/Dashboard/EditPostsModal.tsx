'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateContent, deleteContent, getContentById } from '@/lib/api/content.client';
import { toast } from 'sonner';
import { Loader2, Edit2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { MarkdownFormatter } from '../Shared/Markdown';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type ContentType = 'TEXT' | 'IMAGE' | 'LONGFORM' | 'LINK';

interface EditPostModalProps {
  postId: string;
  onUpdated?: () => void;
  trigger?: React.ReactNode;
}

export function EditPostModal({ postId, onUpdated, trigger }: EditPostModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'TEXT' as ContentType,
    body: '',
    mediaUrl: '',
    tags: '',
  });

  useEffect(() => {
    const fetchPostData = async () => {
      setInitialLoading(true);
      try {
        const post = await getContentById(postId);
        setForm({
          title: post.title || '',
          description: post.description || '',
          type: post.type,
          body: post.body || '',
          mediaUrl: post.mediaUrl || '',
          tags: post.tags?.join(', ') || '',
        });
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error('Failed to load post data', {
          description: error?.response?.data?.message || 'Try again later',
        });
        setOpen(false);
      } finally {
        setInitialLoading(false);
      }
    };

    if (open && postId) {
      fetchPostData();
    }
  }, [open, postId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleBodyChange = (value: string) => {
    setForm({ ...form, body: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        mediaUrl: form.type === 'IMAGE' ? form.mediaUrl : undefined,
      };

      if (form.type === 'IMAGE' && !form.mediaUrl) {
        toast.error('mediaUrl is required for IMAGE content.');
        setLoading(false);
        return;
      }

      await updateContent(postId, payload);
      toast.success('Post updated!');
      onUpdated?.();
      setOpen(false);
    } catch (err: any) {
      toast.error('Failed to update post', {
        description: err?.response?.data?.message || 'Try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteContent(postId);
      toast.success('Post deleted!');
      onUpdated?.();
      setOpen(false);
    } catch (err: any) {
      toast.error('Failed to delete post', {
        description: err?.response?.data?.message || 'Try again later',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-xl max-h-screen overflow-scroll scrollbar-hide">
        <DialogHeader>
          <DialogTitle>Edit post</DialogTitle>
        </DialogHeader>

        {initialLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title" className="mb-3">
                Title
              </Label>
              <Input id="title" value={form.title} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="description" className="mb-3">
                Description
              </Label>
              <Input id="description" value={form.description} onChange={handleChange} />
            </div>

            <div>
              <Label className="mb-3">Type</Label>
              <div className="p-3 bg-muted/30 rounded-md">
                <p className="text-sm font-medium">{form.type}</p>
                <p className="text-xs text-muted-foreground mt-1">Content type cannot be changed</p>
              </div>
            </div>

            {form.type === 'LONGFORM' ? (
              <div>
                <Label htmlFor="body" className="mb-3">
                  Article Body
                </Label>
                <MarkdownFormatter value={form.body} onChange={handleBodyChange} rows={12} />
              </div>
            ) : (
              <div>
                <Label htmlFor="body" className="mb-3">
                  {form.type === 'LINK' ? 'URL' : 'Body'}
                </Label>
                <Textarea id="body" value={form.body} onChange={handleChange} rows={3} required />
              </div>
            )}

            {form.type === 'IMAGE' && (
              <div>
                <Label htmlFor="media" className="mb-3">
                  Image Upload
                </Label>
                <Input
                  type="file"
                  id="media"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onloadend = async () => {
                      const base64 = reader.result?.toString();
                      if (!base64) return;

                      try {
                        toast('Uploading image...');
                        const res = await fetch('/api/upload', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ data: base64 }),
                        });

                        const json = await res.json();
                        if (!res.ok) throw new Error(json.error);

                        setForm((prev) => ({ ...prev, mediaUrl: json.url }));
                        toast.success('Image uploaded');
                      } catch (err) {
                        toast.error('Failed to upload image');
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />

                {form.mediaUrl && (
                  <div className="mt-3">
                    <Image
                      src={form.mediaUrl}
                      alt="Uploaded"
                      width={500}
                      height={300}
                      className="rounded-md object-cover w-full h-64"
                    />
                  </div>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="tags" className="mb-3">
                Tags (comma separated)
              </Label>
              <Input id="tags" value={form.tags} onChange={handleChange} />
            </div>

            <DialogFooter className="flex justify-between gap-4 sm:justify-between">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive">
                    {deleteLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this post.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleteLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
