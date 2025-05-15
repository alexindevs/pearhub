'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMembership } from '@/hooks/use-membership';
import { useRouter } from 'next/navigation';
import { withAuthGuard } from '@/app/guards/withAuthGuard';
import { Button } from '@/components/ui/button';

function SubscriptionPage() {
  const { memberships, potential, loading, join, leave } = useMembership();
  const router = useRouter();

  const hasSubs = memberships && memberships.length > 0;

  return (
    <section className="py-6 md:py-10 md:min-h-screen bg-accent px-4 md:px-12">
      <div className="w-full rounded bg-white p-6 mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold">Subscriptions</h2>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading your subscriptions...</p>
        ) : (
          <>
            {!hasSubs && (
              <p className="text-muted-foreground mb-6">
                No subscriptions yet. Subscribe to get started!
              </p>
            )}

            {hasSubs && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                {memberships.map((membership) => {
                  const business = membership.business;
                  if (!business) return null;

                  return (
                    <div
                      key={membership.id}
                      className="border p-4 rounded-lg hover:shadow-md transition bg-card text-card-foreground relative flex flex-col justify-between"
                    >
                      <Link href={`/${business.slug}`} className="flex items-center gap-4">
                        <div className="w-15 h-15 relative rounded-full overflow-hidden bg-muted">
                          {business.logo && (
                            <Image
                              src={business.logo}
                              alt={business.name}
                              fill
                              sizes="(max-width: 60px) 10vw, 60px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{business.name}</p>
                          <p className="text-sm text-muted-foreground">@{business.slug}</p>
                        </div>
                      </Link>

                      <div className="flex items-center justify-between mt-4">
                        {business.newPost && (
                          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                            New post
                          </span>
                        )}
                        <Button
                          variant="link"
                          onClick={() => leave(membership.id)}
                          className="text-xs text-red-600 hover:underline ml-auto"
                        >
                          Unsubscribe
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {potential && potential.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Suggested for you</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {potential.map((biz) => (
                    <div
                      key={biz.id}
                      className="border p-4 rounded-lg bg-card text-card-foreground flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-15 h-15 relative rounded-full overflow-hidden bg-muted">
                          {biz.logo && (
                            <Image
                              src={biz.logo}
                              alt={biz.name}
                              fill
                              sizes="(max-width: 60px) 10vw, 60px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{biz.name}</p>
                          <p className="text-sm text-muted-foreground">@{biz.slug}</p>
                          <p className="text-xs text-muted-foreground">
                            {biz._count?.memberships.toLocaleString()} subscribers
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="link"
                        onClick={() => join(biz.id).then(() => router.push(`/${biz.slug}`))}
                        className="mt-auto text-sm font-medium text-primary hover:underline"
                      >
                        Subscribe
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default withAuthGuard(SubscriptionPage);
