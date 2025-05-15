import { Hero } from '@/components/Hero/Hero';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <Hero></Hero>
      <div className="py-12 bg-background text-black">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold text-center mb-4">About PearHub</h2>
          <p className="text-center">
            PearHub is a platform that connects businesses and members through exclusive content and
            meaningful engagement. Our mission is to create a vibrant community where members can
            access valuable resources and businesses can showcase their offerings.
          </p>
        </div>
      </div>
      <div className="py-6 px-4 md:px-12 md:pb-8 text-center bg-accent text-black">
        <h2 className="text-2xl font-semibold text-center mb-8">How it works</h2>
        <div className="flex flex-col gap-8 md:flex-row md:gap-12">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
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
                className="text-muted-foreground"
              >
                <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6c0 4 3 10 6 12 3-2 6-8 6-12z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Choose Your Role</h3>
            <p className="text-center">
              Join as a Member to subscribe to businesses you love, or as a Business to share your
              content and grow your audience.
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
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
                className="text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect & Subscribe</h3>
            <p className="text-gray-600">
              Discover and subscribe to businesses that interest you. Access exclusive content and
              become part of their community.
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
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
                className="text-muted-foreground"
              >
                <path d="M21 15V6"></path>
                <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"></path>
                <path d="M12 12H3"></path>
                <path d="M16 6H3"></path>
                <path d="M12 18H3"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Engage & Grow</h3>
            <p className="">
              Interact with content through likes, comments, and shares. Businesses can track
              metrics and grow their audience.
            </p>
          </div>
        </div>
      </div>
      {/* Call to Action Section with Parallax Image */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        {/* Background Image */}
        <div className="fixed inset-0 -z-10">
          <Image
            src="/pearhub_hero_page.png"
            alt="PearHub background"
            fill
            priority
            className="object-cover brightness-[0.4] fixed will-change-transform"
          />
        </div>

        {/* CTA Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-white text-lg max-w-xl">
            Join PearHub today and start connecting with businesses or building your audience.
          </p>
          <Link href="/signup">
            <Button className="mt-6">Sign Up Now</Button>
          </Link>
        </div>
      </section>

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
    </main>
  );
}
