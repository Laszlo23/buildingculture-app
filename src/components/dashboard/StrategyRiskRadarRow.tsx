import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { riskRadarFromScore, riskScoreToOutOf10 } from "@/lib/riskDisplay";

const COLOR = "hsl(152 76% 50%)";

type S = { id: string; name: string; riskScore: number };

const fmtRadar = (modelScore: number) => {
  const axes = riskRadarFromScore(modelScore);
  return Object.entries(axes).map(([k, v]) => ({ name: k, v: Math.round(v) }));
};

export function StrategyRiskRadarRow({ strategies }: { strategies: S[] }) {
  if (!strategies.length) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {strategies.map((s) => {
        const data = fmtRadar(s.riskScore);
        const score = riskScoreToOutOf10(s.riskScore);
        return (
          <div
            key={s.id}
            className="glass-card p-4 border border-border/50"
          >
            <div className="text-xs font-medium leading-snug mb-1 pr-1">{s.name}</div>
            <div className="text-[10px] text-muted-foreground mb-2">Risk {score.toFixed(1)} / 10 (model)</div>
            <div className="h-44 w-full min-w-0 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <PolarGrid className="stroke-border/50" />
                  <PolarAngleAxis
                    dataKey="name"
                    tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <PolarRadiusAxis tick={false} domain={[0, 100]} />
                  <Radar
                    name="Exposure"
                    dataKey="v"
                    stroke={COLOR}
                    fill={COLOR}
                    fillOpacity={0.2}
                    strokeWidth={1.2}
                    dot={false}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1.5">Contract · market · liquidity · strategy complexity (relative).</p>
          </div>
        );
      })}
    </div>
  );
}
