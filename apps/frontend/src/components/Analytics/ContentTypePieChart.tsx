'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getContentTypeDistribution, ContentTypeDistribution } from '@/lib/api/analytics.client';

// We'll use chart-1 through chart-5 (up to 5 content types)
const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

export default function ContentTypePieChart() {
  const [data, setData] = useState<ContentTypeDistribution>([]);

  useEffect(() => {
    async function fetchData() {
      const res = await getContentTypeDistribution();
      setData(res);
    }

    fetchData();
  }, []);

  if (!data.length) return <p className="text-sm text-muted-foreground">Loading chart...</p>;

  return (
    <motion.div
      className="w-full h-80 p-4 border rounded-lg bg-card text-card-foreground"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <h2 className="text-lg font-medium mb-4">Content Type Distribution</h2>
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="type"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={50}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            isAnimationActive={true}
            animationBegin={300}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--popover)',
              border: '1px solid var(--border)',
              color: 'var(--popover-foreground)',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
