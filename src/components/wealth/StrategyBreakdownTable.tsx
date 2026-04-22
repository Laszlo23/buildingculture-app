import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WealthStrategyRowDto } from "@/lib/api";
import { labelForStrategyId } from "@/lib/strategyLabels";

function fmt(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function StrategyBreakdownTable({ rows }: { rows: WealthStrategyRowDto[] }) {
  if (!rows.length) {
    return <p className="text-sm text-muted-foreground">No strategy allocations on-chain for this wallet.</p>;
  }
  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/20 hover:bg-secondary/20">
            <TableHead>Strategy</TableHead>
            <TableHead className="text-right">Deposited</TableHead>
            <TableHead className="text-right">Yield earned</TableHead>
            <TableHead className="text-right">ROI</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.strategyId}>
              <TableCell className="font-medium">{labelForStrategyId(r.strategyId)}</TableCell>
              <TableCell className="text-right font-mono-num">{fmt(r.depositedUsd)}</TableCell>
              <TableCell className="text-right font-mono-num text-success">
                +{fmt(r.yieldUsd)}
              </TableCell>
              <TableCell className="text-right font-mono-num text-primary">{r.roiPct.toFixed(1)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
