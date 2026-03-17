"use client";

import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ProgressChartsProps {
  dailyData: Array<{ label: string; reviewed: number; learned: number }>;
  difficultyData: Array<{ name: string; value: number; fill: string }>;
}

export function ProgressCharts({ dailyData, difficultyData }: ProgressChartsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="v2-card rounded-[1.75rem] p-5">
        <div className="mb-4 space-y-1">
          <p className="font-display text-xl font-semibold text-foreground">Daily consistency</p>
          <p className="text-sm text-muted-foreground">A quick look at how steady your review momentum has been.</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="review-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#49C6FF" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#49C6FF" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" stroke="#91A3BC" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#91A3BC" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ stroke: "rgba(73,198,255,0.24)", strokeWidth: 1 }}
                contentStyle={{
                  backgroundColor: "rgba(20,38,58,0.94)",
                  border: "1px solid rgba(148,163,184,0.18)",
                  borderRadius: "18px",
                }}
              />
              <Area type="monotone" dataKey="reviewed" stroke="#49C6FF" strokeWidth={3} fill="url(#review-gradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="v2-card rounded-[1.75rem] p-5">
        <div className="mb-4 space-y-1">
          <p className="font-display text-xl font-semibold text-foreground">Difficulty mix</p>
          <p className="text-sm text-muted-foreground">See how your library is split across easy, medium, and hard words.</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={difficultyData}
                innerRadius={70}
                outerRadius={104}
                paddingAngle={4}
                dataKey="value"
                labelLine={false}
                label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
              >
                {difficultyData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20,38,58,0.94)",
                  border: "1px solid rgba(148,163,184,0.18)",
                  borderRadius: "18px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="v2-card rounded-[1.75rem] p-5 xl:col-span-2">
        <div className="mb-4 space-y-1">
          <p className="font-display text-xl font-semibold text-foreground">Reviewed vs learned</p>
          <p className="text-sm text-muted-foreground">Compare study repetition against the pace of new vocabulary entering your library.</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <XAxis dataKey="label" stroke="#91A3BC" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#91A3BC" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20,38,58,0.94)",
                  border: "1px solid rgba(148,163,184,0.18)",
                  borderRadius: "18px",
                }}
              />
              <Bar dataKey="reviewed" radius={[12, 12, 0, 0]} fill="#49C6FF" />
              <Bar dataKey="learned" radius={[12, 12, 0, 0]} fill="#34D399" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
