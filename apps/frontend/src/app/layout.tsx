import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar/Navbar';
import { Poppins } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PearHub',
  description: 'Connect, create, and grow your audience on PearHub.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} antialiased`}>
      <body className="min-h-screen bg-background text-foreground">
        <AuthProvider>
          <Navbar />
          {children}
          <footer className="bg-background py-6 text-center">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center space-x-2">
            <div className="bg-primary text-white rounded-full p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M18 16a4 4 0 0 0 0 8" />
                <path d="M21.29 9.17a9 9 0 1 0 0 5.66" />
                <path d="M10 8l1 9.6" />
              </svg>
            </div>
            <span className="text-lg font-semibold">PearHub</span>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PearHub. All rights reserved.
          </p>
        </div>
      </footer>
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
