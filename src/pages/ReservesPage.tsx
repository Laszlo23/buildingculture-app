import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Landmark } from "lucide-react";
import { PropertyBackingSection } from "@/components/reserves/PropertyBackingSection";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { daoPocRealAssets, referenceRealAssets, reservesReferenceAggregate } from "@/data/realAssets";

function formatRefEur(n: number): string {
  if (n >= 1_000_000) {
    return `€${(n / 1_000_000).toFixed(1)}M`;
  }
  if (n >= 1_000) {
    return `€${Math.round(n / 1000)}k`;
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

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/5 via-secondary/20 to-transparent px-5 py-5 sm:px-6 sm:py-6 space-y-3"
        aria-labelledby="dao-poc-heading"
      >
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          DAO treasury acquisition · proof of concept
        </div>
        <h1 id="dao-poc-heading" className="font-display text-xl sm:text-2xl font-semibold tracking-tight">
          Villa Ebreichsdorf
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
          Neoclassical lakeside villa near Vienna with a January 2025 court-certified appraisal. DAO POC targets (€2.4M
          completion funding, €3.6M internal post-completion estimate) illustrate how treasury could acquire a single
          tokenized real asset — separate from the Jagdschloss + Keutschach reference totals below. Roadmap only; not
          investment advice.
        </p>
        <p className="text-xs">
          <Link to="#villa-ebreichsdorf" className="text-primary hover:underline font-medium">
            Full dossier and gallery
          </Link>
        </p>
      </motion.section>

      <div className="space-y-10">
        {daoPocRealAssets.map((asset, i) => (
          <PropertyBackingSection
            key={asset.id}
            asset={asset}
            sectionIndex={i}
            onOpenImage={setLightbox}
            sectionDomId={asset.id === "villa-ebreichsdorf" ? "villa-ebreichsdorf" : undefined}
          />
        ))}
      </div>

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
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Reference programmes</h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Issuer-backed fact sheets for two additional property narratives. DAO reserves transparency starts with
              clear photography and disclosures — not hype.
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
        {referenceRealAssets.map((asset, i) => (
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
