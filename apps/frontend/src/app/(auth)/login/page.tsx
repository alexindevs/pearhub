'use client';

import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const { login, isBusinessOwner } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(form); // Make sure `login` returns the user
      console.log('Logged in as:', user.role);

      if (user.role === 'BUSINESS') {
        router.push('/dashboard');
      } else {
        router.push('/subscriptions');
      }
    } catch (err) {
      // Error already handled by toast
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-accent md:py-10 md:min-h-screen">
      <div className="w-full md:w-[70%] mx-auto bg-white rounded-lg shadow-md p-8 mt-12">
        {/* Icon */}
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

        <h2 className="text-2xl font-semibold text-center mb-2">Welcome back</h2>
        <p className="text-gray-600 text-center mb-6">Login to your PearHub account</p>

        {/* Demo Account Box */}
        <div className="bg-accent text-sm text-left text-secondary-foreground border-yellow-300 p-4 rounded mb-6">
          <strong>Demo Accounts:</strong>
          <ul className="mt-2 list-disc list-inside">
            <li>
              <strong>Business:</strong> ceo@pearhub.io
            </li>
            <li>
              <strong>Member:</strong> jonathan@example.com
            </li>
          </ul>
          <p className="mt-1">
            Password for both: <code>supersecure123</code>
          </p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email" className="mb-3">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <Label htmlFor="password" className="mb-3">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
