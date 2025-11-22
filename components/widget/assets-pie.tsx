'use client';

import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface PieData {
  name: string;
  value: number;
}

interface AssetsPieProps {
  data: PieData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AssetsPie({ data }: AssetsPieProps) {
  if (!data || data.length === 0) {
    return <div className="text-center p-4">No asset data to display.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={150}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={(entry) => entry.name}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
