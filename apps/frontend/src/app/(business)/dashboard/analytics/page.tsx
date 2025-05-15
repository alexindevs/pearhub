'use client';

import { withAuthGuard } from '@/app/guards/withAuthGuard';
import ContentTypePieChart from '@/components/Analytics/ContentTypePieChart';
import InteractionBarChart from '@/components/Analytics/InteractionBarChart';
import TopPostListWithHoverStats from '@/components/Analytics/TopPostListWithHoverStats';
import { useAnalyticsExtra } from '@/hooks/use-analytics-extra';
import { useAnalyticsSummary } from '@/hooks/use-analytics-summary';

function AnalyticsPage() {
  const { summary, loading } = useAnalyticsSummary();
  const { postsThisWeek, interactionData } = useAnalyticsExtra();

  return (
    <section className="py-8 px-4 md:px-12 bg-white">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold">Analytics</h1>
        <p className="text-gray-600">
          Get insights into your content performance and audience engagement.
        </p>
      </div>

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="p-4 border rounded-lg space-y-2">
            <p className="text-sm text-gray-600">Total Members</p>
            <p className="text-xl md:text-3xl font-semibold text-primary">{summary.totalMembers}</p>
            <p className="text-xs text-gray-500">+{summary.memberGrowth}% from last month</p>
          </div>

          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-600">New Members</p>
            <p className="text-xl md:text-3xl font-semibold text-primary">{summary.newMembers}</p>
            <p className="text-xs text-gray-500">in the last 30 days</p>
          </div>

          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-600">Total Interactions</p>
            <p className="text-xl md:text-3xl font-semibold text-primary">
              {summary.totalInteractions}
            </p>
            <p className="text-xs text-gray-500">across all your content</p>
          </div>

          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-600">Top Post</p>
            <p className="text-xl md:text-3xl font-semibold text-primary">
              {summary.topPost.count} interactions
            </p>
            <p className="text-xs text-blue-600 underline">{summary.topPost.title}</p>
          </div>
        </div>
      )}

      <div className="mt-10 flex items-center justify-evenly">
        <ContentTypePieChart />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {/* Posts This Week */}
        <div className="p-4 border rounded-lg bg-card text-card-foreground">
          <p className="text-sm text-gray-600">Posts This Month</p>
          <p className="text-xl md:text-3xl font-semibold text-primary">{postsThisWeek}</p>
          <p className="text-xs text-muted-foreground mt-1">New posts this month</p>
        </div>

        {/* Interaction Breakdown Bar Chart */}
        <InteractionBarChart data={interactionData} />
        <TopPostListWithHoverStats />
      </div>
    </section>
  );
}

export default withAuthGuard(AnalyticsPage);

