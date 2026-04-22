import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Single visual shell: vault is the focal point; nested children read as
 * supporting systems, not equal-weight modules.
 */
export function ProtocolCoreFrame({ children, className }: Props) {
  return (
    <section aria-label="Protocol core" className={cn("relative", className)}>
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/[0.07] via-background/90 to-background p-px shadow-[inset_0_1px_0_0_hsl(var(--primary)/0.12)]">
        <div className="overflow-hidden rounded-[1.35rem] border border-border/50 bg-card/30 backdrop-blur-md">
          {children}
        </div>
      </div>
    </section>
  );
}
