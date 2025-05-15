'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function InteractionBarChart({ data }: { data: { name: string; count: number }[] }) {
  return (
    <div className="w-full h-80 p-4 border rounded-lg bg-card text-card-foreground">
      <h2 className="text-lg font-medium mb-4">Monthly Interaction Breakdown</h2>
      <ResponsiveContainer width="100%" height="80%" className="overflow-scroll scrollbar-hide">
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--popover)',
              border: '1px solid var(--border)',
              color: 'var(--popover-foreground)',
            }}
          />
          <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
