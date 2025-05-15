'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useRouter } from 'next/navigation';
import { useBusiness } from '@/hooks/use-business';
import { useMembership } from '@/hooks/use-membership';
import Image from 'next/image';

export const Navbar = () => {
  const { authState, logout, isBusinessOwner, isMember } = useAuth();
  const router = useRouter();
  const { business, loading: businessLoading } = useBusiness();
  const { memberships, loading: membershipsLoading } = useMembership();
  return (
    <nav className="flex items-center justify-between py-4 px-4 bg-background md:px-12 text-white">
      <Link href="/" className="flex items-center space-x-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
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
        <span className="text-xl font-semibold text-gray-900">PearHub</span>
      </Link>

      <div>
        {authState.isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      isBusinessOwner() && !businessLoading && business?.logo
                        ? business.logo
                        : authState.user?.avatarUrl
                    }
                    alt={
                      isBusinessOwner() && !businessLoading ? business?.name : authState.user?.name
                    }
                  />
                  <AvatarFallback>
                    {isBusinessOwner() && !businessLoading ? business?.name : authState.user?.name}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 bg-white">
              <div className="flex flex-col px-2">
                {isBusinessOwner() && !businessLoading && business ? (
                  <>
                    <h4>{business.name}</h4>
                    <p className="text-sm text-muted-foreground">@{business.slug}</p>
                    <p className="text-sm text-muted-foreground pb-2">{authState.user?.role}</p>
                  </>
                ) : (
                  <>
                    <h4>{authState.user?.name}</h4>
                    <p className="text-sm text-muted-foreground">{authState.user?.email}</p>
                    <p className="text-sm text-muted-foreground pb-2">{authState.user?.role}</p>
                  </>
                )}
              </div>
              <hr />
              {isBusinessOwner() && (
                <>
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    Posts
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/analytics')}>
                    Analytics
                  </DropdownMenuItem>
                </>
              )}
              {isMember() && (
                <DropdownMenuItem onClick={() => router.push('/subscriptions')}>
                  Subscriptions
                </DropdownMenuItem>
              )}
              {isMember() && membershipsLoading && (
                <div className="px-2 text-xs text-muted-foreground py-2">
                  Loading subscriptions…
                </div>
              )}
              {isMember() && !membershipsLoading && memberships && memberships.length > 0 && (
                <>
                  <div className="px-2 pb-2">
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {memberships.map((m) => (
                        <DropdownMenuItem
                          key={m.id}
                          onClick={() => router.push(`/${m.business?.slug}`)}
                          className="flex items-center gap-2"
                        >
                          <div className="w-5 h-5 relative rounded-full overflow-hidden bg-muted">
                            {m.business?.logo && (
                              <Image
                                src={m.business.logo}
                                alt={m.business.name}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <span className="text-sm truncate">{m.business?.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </div>
                  <hr />
                </>
              )}
              <hr />
              <DropdownMenuItem onClick={() => logout()}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <ul className="flex space-x-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </ul>
        )}
      </div>
    </nav>
  );
};
