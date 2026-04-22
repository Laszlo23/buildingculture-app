import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type StrategyRow = {
  id: string;
  name: string;
  apy: number;
  risk: string;
  riskScore: number;
  riskOutOf10: number;
  allocation: number;
  tvl: number;
};

type Props = {
  strategies: StrategyRow[];
};

export function StrategyPerformanceTable({ strategies }: Props) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border/60 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display font-semibold">Strategies</h3>
          <p className="text-xs text-muted-foreground">Allocation and performance — open a row for details</p>
        </div>
        <Link
          to="/strategies"
          className="text-xs font-medium text-primary inline-flex items-center gap-1 hover:underline"
        >
          All strategies <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Strategy</TableHead>
              <TableHead className="text-right">APY</TableHead>
              <TableHead>Label</TableHead>
              <TableHead className="min-w-[7rem]">Risk score</TableHead>
              <TableHead className="text-right">Allocation</TableHead>
              <TableHead className="text-right">TVL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {strategies.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">
                  <Link to={`/strategies/${s.id}`} className="hover:text-primary transition-colors">
                    {s.name}
                  </Link>
                </TableCell>
                <TableCell className="text-right font-mono-num">{s.apy.toFixed(1)}%</TableCell>
                <TableCell className="text-muted-foreground text-sm max-w-[8rem]">{s.risk}</TableCell>
                <TableCell>
                  <div className="min-w-[7rem] space-y-0.5">
                    <div className="text-xs font-mono-num text-foreground/90">
                      {s.riskOutOf10.toFixed(1)} <span className="text-muted-foreground">/ 10</span>
                    </div>
                    <Progress
                      className="h-1.5"
                      value={Math.min(100, (s.riskOutOf10 / 10) * 100)}
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-[9px] text-muted-foreground cursor-default truncate max-w-[9rem]">
                            Contract · market · liquidity · complexity
                          </p>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs max-w-xs">
                          Composite model: smart contract risk, market volatility, liquidity, strategy complexity. Not
                          personal investment advice; see each strategy.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono-num">{s.allocation}%</TableCell>
                <TableCell className="text-right font-mono-num">${(s.tvl / 1_000_000).toFixed(2)}M</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
