import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WealthSeriesPoint } from "@/lib/api";
import { cn } from "@/lib/utils";

function fmtUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

type Props = {
  data: WealthSeriesPoint[];
  className?: string;
};

export function WealthLineChart({ data, className }: Props) {
  const rows = useMemo(
    () =>
      data.map((p) => ({
        ...p,
        label: fmtDate(p.t),
      })),
    [data],
  );

  return (
    <div className={cn("h-[320px] w-full min-h-[280px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} />
          <YAxis
            tickFormatter={(v) => fmtUsd(v)}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            width={56}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 12,
              fontSize: 12,
            }}
            formatter={(value: number, name: string) => [fmtUsd(value), name === "vaultUsd" ? "Vault balance" : "Cumulative yield"]}
            labelFormatter={(_, payload) => {
              const row = payload?.[0]?.payload as { t?: string } | undefined;
              return row?.t ? new Date(row.t).toLocaleString() : "";
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(v) => (v === "vaultUsd" ? "Vault balance" : "Cumulative yield")}
          />
          <Line
            type="monotone"
            dataKey="vaultUsd"
            name="vaultUsd"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
          />
          <Line
            type="monotone"
            dataKey="cumulativeYieldUsd"
            name="cumulativeYieldUsd"
            stroke="hsl(142 76% 45%)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
