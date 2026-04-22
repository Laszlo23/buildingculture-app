import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function shortAddress(a: string) {
  if (!a || a.length < 10) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

type Props = {
  address: string;
  className?: string;
  /** Show shortened label; full address still in `to`. */
  shorten?: boolean;
};

export function InvestorAddressLink({ address, className, shorten = true }: Props) {
  const lower = address.startsWith("0x") ? address : `0x${address}`;
  const label = shorten ? shortAddress(lower) : lower;
  return (
    <Link
      to={`/investor/${lower}`}
      className={cn(
        "font-mono-num text-primary hover:underline underline-offset-2 transition-colors",
        className,
      )}
    >
      {label}
    </Link>
  );
}
