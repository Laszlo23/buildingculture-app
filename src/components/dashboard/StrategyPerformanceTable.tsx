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

export type StrategyRow = {
  id: string;
  name: string;
  apy: number;
  risk: string;
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
          <h3 className="font-display font-semibold">Strategy performance</h3>
          <p className="text-xs text-muted-foreground">APY, risk, and target allocation · illustrative where static</p>
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
              <TableHead className="text-right">Risk</TableHead>
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
                <TableCell className="text-right text-muted-foreground">{s.risk}</TableCell>
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
