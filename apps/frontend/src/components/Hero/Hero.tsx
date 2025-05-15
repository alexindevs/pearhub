import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export const Hero = ({ isLoggedIn, isBusinessOwner }: { isLoggedIn: boolean, isBusinessOwner: boolean }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-12 md:p-24 text-center relative text-white">
      <div className="absolute inset-0 -z-4">
        <Image
          fill
          src="/pearhub_hero_page.png"
          alt="Hero background"
          className="h-full w-full object-cover brightness-[0.4]"
        />
      </div>
      <h1 className="text-2xl md:text-4xl font-semibold">Welcome to PearHub</h1>
      <p className="mt-7 text-md md:text-lg">
        The platform where businesses and members connect through exclusive content and meaningful
        engagement.
      </p>
      <div className="mt-7 flex gap-4">
        {/* <Link href="/login">
          <Button variant="ghost">Login</Button>
        </Link>
        <Link href="/signup">
          <Button>Sign Up</Button>
        </Link> */}
        { !isLoggedIn && (
          <>
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </>
        )}

        { isLoggedIn && (
          <Link href={isBusinessOwner ? "/dashboard" : "/subscriptions"}>
            <Button>Go to {isBusinessOwner ? "Dashboard" : "Subscriptions"}</Button>
          </Link>
        )}
      </div>
    </div>
  );
};
