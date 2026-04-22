import { useState } from "react";
import { motion } from "framer-motion";
import { Landmark } from "lucide-react";
import { PropertyBackingSection } from "@/components/reserves/PropertyBackingSection";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { realAssets, reservesReferenceAggregate } from "@/data/realAssets";

function formatRefEur(n: number): string {
  if (n >= 1_000_000) {
    return `€${(n / 1_000_000).toFixed(1)}M`;
  }
  if (n >= 1_000) {
    return `€${Math.round(n / 1_000)}k`;
  }
  return `€${n}`;
}

export const ReservesPage = () => {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const acq = formatRefEur(reservesReferenceAggregate.referenceAcquisitionTotalEur);
  const rent = formatRefEur(reservesReferenceAggregate.referenceAnnualRentTotalEur);

  return (
    <div className="space-y-10 max-w-5xl">
      <Dialog open={lightbox != null} onOpenChange={open => !open && setLightbox(null)}>
        <DialogContent className="max-w-[min(96vw,56rem)] border-0 bg-background/95 p-2 sm:p-4 shadow-2xl gap-0">
          <DialogTitle className="sr-only">Property photo</DialogTitle>
          {lightbox && (
            <img
              src={lightbox.src}
              alt={lightbox.alt}
              className="w-full max-h-[85vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl glass border-primary/20"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-gold/10 pointer-events-none" />
        <div className="relative px-6 py-8 lg:px-10 lg:py-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 text-primary text-xs font-medium">
            <Landmark className="w-3.5 h-3.5" /> Proof of reserve
          </div>
          <div className="space-y-3 max-w-3xl">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Real estate on chain</h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              What backs the Savings Club: curated properties and reference programmes tied to our real-world narrative.
              DAO reserves transparency starts with clear photography and fact sheets — not hype.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border/60 bg-secondary/30 px-4 py-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Reference acquisition (2 properties)</div>
              <div className="font-mono-num text-xl font-semibold text-foreground mt-1">{acq}</div>
              <p className="text-xs text-muted-foreground mt-1">Jagdschloss + Keutschach fact sheets. Berggasse disclosure excluded from sum.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-secondary/30 px-4 py-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Reference gross rent p.a. (combined)</div>
              <div className="font-mono-num text-xl font-semibold text-foreground mt-1">{rent}</div>
              <p className="text-xs text-muted-foreground mt-1">Issuer figures for the same two programmes; not a forecast for members.</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-3 max-w-3xl">
            {reservesReferenceAggregate.disclaimer} Figures are not guaranteed returns.
          </p>
        </div>
      </motion.header>

      <div className="space-y-10">
        {realAssets.map((asset, i) => (
          <PropertyBackingSection
            key={asset.id}
            asset={asset}
            sectionIndex={i}
            onOpenImage={setLightbox}
          />
        ))}
      </div>
    </div>
  );
};
