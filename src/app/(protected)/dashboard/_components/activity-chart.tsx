"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatDateFromParts } from "@/lib/date";

const chartConfig = {
  users: {
    label: "Sign-ins",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

type Props = {
  data: { date: string; users: number }[];
};

export function ActivityChart({ data }: Props) {
  const formatted = data.map((d) => ({
    date: formatDateFromParts(d.date),
    users: d.users,
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[180px] sm:h-[220px] w-full">
      <BarChart data={formatted} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          domain={[0, 10]}
          ticks={[0, 2, 4, 6, 8, 10]}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="users" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
