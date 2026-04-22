import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  risk: string;
  score: number;
  className?: string;
}

export const RiskBadge = ({ risk, score, className }: RiskBadgeProps) => {
  const color = score <= 2 ? "success" : score <= 3 ? "warning" : "destructive";
  const colorMap = {
    success: "bg-success/15 text-success border-success/30",
    warning: "bg-warning/15 text-warning border-warning/30",
    destructive: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium", colorMap[color], className)}>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={cn(
              "w-0.5 h-2.5 rounded-full",
              i <= score ? `bg-${color}` : "bg-current opacity-25"
            )}
          />
        ))}
      </div>
      {risk}
    </div>
  );
};
