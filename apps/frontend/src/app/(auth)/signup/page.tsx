'use client';

import { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { SignupInput, useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SignupPage() {
  const [accountType, setAccountType] = useState<'member' | 'business'>('business');
  const { signup } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { isBusinessOwner } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: accountType === 'member' ? 'MEMBER' : 'BUSINESS',
    businessName: '',
    avatarUrl: '',
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      role: accountType === 'member' ? 'MEMBER' : 'BUSINESS',
    }));
  }, [accountType]);

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadToCloudinary = async (fileData: string): Promise<string> => {
    setUploading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: fileData }),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let avatarUrl = form.avatarUrl;

      // Upload image if there's a preview
      if (preview) {
        avatarUrl = await uploadToCloudinary(preview);
      }

      const formData =
        accountType === 'business'
          ? { ...form, avatarUrl }
          : { ...form, businessName: undefined, avatarUrl };

      await signup(formData as SignupInput);
      if (isBusinessOwner()) {
        router.push('/dashboard');
      } else {
        router.push('/subscriptions');
      }
    } catch (err) {
      // Error already handled by toast
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-accent md:py-10 md:min-h-screen">
      <div className="w-full md:w-[70%] mx-auto bg-white rounded-lg shadow-md p-8 mt-12">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 16a4 4 0 0 0 0 8" />
            <path d="M21.29 9.17a9 9 0 1 0 0 5.66" />
            <path d="M10 8l1 9.6" />
          </svg>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-2">Sign Up</h2>
        <p className="text-gray-600 text-center mb-6">Join PearHub today</p>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="name" className="mb-3">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="email" className="mb-3">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="member@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="password" className="mb-3">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="avatar" className="mb-3">
              Profile Photo
            </Label>
            <div className="flex items-center gap-4">
              {preview ? (
                <div className="relative h-16 w-16 rounded-full overflow-hidden border border-gray-200">
                  <Image src={preview} alt="Avatar preview" fill className="object-cover" />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              )}
              <div className="space-y-2">
                <Input
                  id="avatar"
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  // className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {preview ? 'Change Photo' : 'Upload Photo'}
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-1 block">Account Type</Label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="accountType"
                  value="member"
                  checked={accountType === 'member'}
                  onChange={() => setAccountType('member')}
                  className="accent-muted-foreground"
                />
                <span>Member - Subscribe to businesses</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="accountType"
                  value="business"
                  checked={accountType === 'business'}
                  onChange={() => setAccountType('business')}
                  className="accent-muted-foreground"
                />
                <span>Business - Create content and build an audience</span>
              </label>
            </div>
          </div>

          {accountType === 'business' && (
            <div>
              <Label htmlFor="businessName" className="mb-3">
                Business Name
              </Label>
              <Input
                id="businessName"
                type="text"
                placeholder="Your Business Name"
                value={form.businessName}
                onChange={handleChange}
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading || uploading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>
          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
