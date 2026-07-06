"use client";

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface DailyPoint { date: string; revenue: number; sales: number; }
interface MonthlyPoint { month: string; revenue: number; sales: number; }

interface Props {
  dailyRevenue: DailyPoint[];
  monthlyRevenue: MonthlyPoint[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-zinc-400 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-white">
          {p.name === "revenue" ? `$${(p.value / 100).toFixed(2)}` : `${p.value} sales`}
        </p>
      ))}
    </div>
  );
};

export function AnalyticsCharts({ dailyRevenue, monthlyRevenue }: Props) {
  const dailyData = dailyRevenue.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    revenue: d.revenue,
    sales: d.sales,
  }));

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Daily Revenue */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-1">Revenue — Last 30 Days</h2>
        <p className="text-xs text-zinc-500 mb-4">Creator earnings after platform fee</p>
        {dailyData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#71717a" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tickFormatter={(v) => `$${(v / 100).toFixed(0)}`} tick={{ fontSize: 10, fill: "#71717a" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#7c3aed" strokeWidth={2} fill="url(#revGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Monthly */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-1">Monthly Sales</h2>
        <p className="text-xs text-zinc-500 mb-4">Number of units sold per month</p>
        {monthlyRevenue.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#71717a" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#71717a" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" name="sales" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
