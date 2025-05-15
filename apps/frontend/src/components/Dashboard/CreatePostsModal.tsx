'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createContent } from '@/lib/api/content.client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { MarkdownFormatter } from '../Shared/Markdown';

type ContentType = 'TEXT' | 'IMAGE' | 'LONGFORM' | 'LINK';

interface CreatePostModalProps {
  onCreated?: () => void;
}

export function CreatePostModal({ onCreated }: CreatePostModalProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ContentType>('TEXT');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'TEXT',
    body: '',
    mediaUrl: '',
    tags: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleTypeChange = (newType: ContentType) => {
    setType(newType);
    setForm({ ...form, type: newType });
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
        mediaUrl: type === 'IMAGE' ? form.mediaUrl : undefined,
      };

      if (type === 'IMAGE' && !form.mediaUrl) {
        toast.error('mediaUrl is required for IMAGE content.');
        return;
      }

      await createContent(payload);
      toast.success('Post created!');
      onCreated?.();
      setOpen(false);
      setForm({ title: '', description: '', type, body: '', mediaUrl: '', tags: '' });
    } catch (err: any) {
      toast.error('Failed to create post', {
        description: err?.response?.data?.message || 'Try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-auto block">+ New Post</Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl max-h-screen overflow-scroll scrollbar-hide">
        <DialogHeader>
          <DialogTitle>Create a new post</DialogTitle>
        </DialogHeader>

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
            <div className="grid grid-cols-2 gap-2">
              {['TEXT', 'IMAGE', 'LONGFORM', 'LINK'].map((t) => (
                <Button
                  key={t}
                  type="button"
                  variant={type === t ? 'default' : 'outline'}
                  onClick={() => handleTypeChange(t as ContentType)}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>

          {type === 'LONGFORM' ? (
            <div>
              <Label htmlFor="body" className="mb-3">
                Article Body
              </Label>
              <MarkdownFormatter value={form.body} onChange={handleBodyChange} rows={12} />
            </div>
          ) : (
            <div>
              <Label htmlFor="body" className="mb-3">
                {type === 'LINK' ? 'URL' : 'Body'}
              </Label>
              <Textarea id="body" value={form.body} onChange={handleChange} rows={3} required />
            </div>
          )}

          {type === 'IMAGE' && (
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

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Publish'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
