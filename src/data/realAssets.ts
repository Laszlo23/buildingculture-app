/** Curated proof-of-reserve copy + media paths under /public. */

export type DaoPocMeta = {
  headline: string;
  treasuryFundingTargetEur: number;
  projectedPostCompletionEur: number;
  /** Roadmap / intent copy (fair launch, bonding curve, escrow until full acquisition). */
  tokenizationNote: string;
};

export type RealAssetEntry = {
  id: string;
  /** Full descriptive title */
  title: string;
  /** Short line for image overlays / cards */
  shortTitle: string;
  location: string;
  summary: string;
  factSheet: { label: string; value: string }[];
  greenPrint: string[];
  legalNote: string;
  imagePaths: string[];
  pdfPaths: string[];
  /** Keys into factSheet for overlay chips (label must match) */
  highlightFactLabels?: string[];
  caveat?: string;
  /** DAO single-asset acquisition proof-of-concept (not merged into reference aggregates). */
  daoPoc?: DaoPocMeta;
};

/** Encode paths for img src (handles spaces in filenames under /public). */
export function publicAssetSrc(path: string): string {
  if (path.startsWith("http")) return path;
  return encodeURI(path);
}

function formatEurCompact(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    const s = m >= 10 ? m.toFixed(0) : m.toFixed(1).replace(/\.0$/, "");
    return `€${s}M`;
  }
  if (n >= 1000) return `€${Math.round(n / 1000)}k`;
  return `€${n}`;
}

/** Format DAO POC figures for inline UI (e.g. PropertyBackingSection). */
export function formatDaoPocFigures(poc: DaoPocMeta): { funding: string; projected: string } {
  return {
    funding: formatEurCompact(poc.treasuryFundingTargetEur),
    projected: formatEurCompact(poc.projectedPostCompletionEur),
  };
}

/**
 * Reference figures from issuer fact sheets (Jagdschloss + Keutschach acquisitions/rent).
 * Berggasse disclosure totals TBD — not included in sums.
 */
export const reservesReferenceAggregate = {
  propertyCount: 3,
  /** €8.3M + €10.5M from disclosed fact sheets */
  referenceAcquisitionTotalEur: 18_800_000,
  /** €187k + €250k annual gross / reference rent */
  referenceAnnualRentTotalEur: 437_000,
  disclaimer:
    "Reference figures from internal fact sheets and partner materials. Not audited on-chain; not investment advice.",
} as const;

/** DAO treasury acquisition POC — single-asset narrative; not part of referenceAcquisitionTotalEur. */
export const daoPocRealAssets: RealAssetEntry[] = [
  {
    id: "villa-ebreichsdorf",
    shortTitle: "Villa Ebreichsdorf",
    title: "Villa Ebreichsdorf — neoclassical lakeside villa",
    location: "Seepromenade 109, 2483 Ebreichsdorf, Austria · ~20 min from Vienna",
    summary:
      "Elegant neoclassical villa in a private lakeside community: exterior complete with pool, photovoltaic system, and landscaping; interior awaits finishing. Former owner company entered bankruptcy in 2021; court-certified appraisal January 2025 €1,384,300. The DAO uses this property as a proof-of-concept for acquiring tokenized real assets via treasury discipline — illustrative POC targets below are not court figures and not investment advice.",
    highlightFactLabels: ["Court-certified appraisal (Jan 2025)", "DAO treasury funding target (POC)"],
    factSheet: [
      { label: "Address", value: "Seepromenade 109, 2483 Ebreichsdorf" },
      { label: "Plot", value: "1,215 m²" },
      { label: "Living space", value: "346 m² + ~201 m² terraces" },
      { label: "Bedrooms / bathrooms", value: "3 / 4" },
      { label: "Floor breakdown (living)", value: "Ground 140.61 m² · First 117.92 m² · Attic 88 m²" },
      { label: "Court-certified appraisal (Jan 2025)", value: "€ 1.384.300" },
      { label: "Land value (appraisal split)", value: "€ 792.600" },
      { label: "Building value (appraisal split)", value: "€ 591.700" },
      { label: "DAO treasury funding target (POC)", value: "€ 2.400.000" },
      { label: "Projected post-completion value (internal est., POC)", value: "€ 3.600.000" },
    ],
    greenPrint: [
      "Rooftop photovoltaic array and air–water heat pump already installed",
      "Outdoor pool foundation and infrastructure in place from main terrace",
      "Interior completion planned with eco-friendly, locally sourced materials",
      "Rainwater / greywater-ready infrastructure narrative from foundation materials",
    ],
    legalNote:
      "POC targets (€2.4M funding, €3.6M internal post-completion estimate) are club roadmap figures for UI and governance storytelling only. They are not the January 2025 court appraisal and not guaranteed outcomes. If a Villa bonding curve contract is configured, USDC sent there is subject to that contract only — not audited; not investment advice. On-chain treasury balances elsewhere remain separate until SPV / foundation legal closing.",
    imagePaths: [
      "/villaebreichsdorf/villa-ebreichsdorf-CwVjQlJv.jpg",
      "/villaebreichsdorf/villa-ebreichsdorf-2-YzKuS9vG.jpg",
      "/villaebreichsdorf/villa2.jpeg",
      "/villaebreichsdorf/villa33.jpeg",
      "/villaebreichsdorf/villla3.jpeg",
      "/villaebreichsdorf/villlaaa.jpeg",
      "/villaebreichsdorf/villlaaaaa.jpeg",
      "/villaebreichsdorf/villllllaaa.jpeg",
      "/villaebreichsdorf/WhatsApp Image 2026-04-22 at 22.29.45.jpeg",
    ],
    pdfPaths: [],
    caveat:
      "When VITE_VILLA_BONDING_CURVE_ADDRESS is set, an unaudited on-chain USDC bonding curve may be live — still not legal or investment advice. Otherwise tokenization remains roadmap-only. Verify all figures with counsel and issuer materials.",
    daoPoc: {
      headline: "DAO treasury acquisition (POC)",
      treasuryFundingTargetEur: 2_400_000,
      projectedPostCompletionEur: 3_600_000,
      tokenizationNote:
        "Intent: raise toward a single full acquisition with treasury discipline — funds stay governed until the DAO can complete the buyout narrative you approve. Early-supporter mechanics (fair launch, bonding curve) are design directions only until smart contracts ship.",
    },
  },
];

export const referenceRealAssets: RealAssetEntry[] = [
  {
    id: "jagdschloss",
    shortTitle: "Lainz · Jagdschloss",
    title: "Lainz contemporary residential (Jagdschloss area)",
    location: "Vienna · opposite Werkbundsiedlung heritage",
    summary:
      "A contemporary residential building with nine rental apartments: cubist forms, clean lines, generous glazing and open spaces with greenery views.",
    highlightFactLabels: ["Acquisition (fact sheet)", "Rental income (p.a.)"],
    factSheet: [
      { label: "Total rental area", value: "553 m²" },
      { label: "Terrace (rental)", value: "106 m²" },
      { label: "Garden (rental)", value: "429 m²" },
      { label: "Parking spaces", value: "6" },
      { label: "Acquisition (fact sheet)", value: "€ 8.300.000" },
      { label: "Rental income (p.a.)", value: "€ 187.000" },
    ],
    greenPrint: [
      "Air heat pump and solar energy",
      "Large green yards",
      "Terrace areas for all apartments",
      "Sought-after residential area next to Lainz recreational area",
    ],
    legalNote:
      "Typical structure: SPV or GmbH holding title with professional property management. Custody of legal documents is off-chain; this page summarizes issuer materials for transparency.",
    imagePaths: [
      "/jagdschloss/Kamera01_Variante.jpg",
      "/jagdschloss/Kamera02_Variante.jpg",
      "/jagdschloss/Innenraum_Jagdschlossgasse_81.jpg",
      "/jagdschloss/Innen01.jpg",
      "/jagdschloss/Innen02.jpg",
    ],
    pdfPaths: [],
  },
  {
    id: "keutschach",
    shortTitle: "Keutschach am See",
    title: "Water Side — Keutschach am See",
    location: "Carinthia · lakeside programme (reference)",
    summary:
      "Large lakeside programme: six buildings, thirty-four homes, lake panorama — wooden façades and glass walls integrated into the landscape.",
    highlightFactLabels: ["Reference acquisition", "Gross rental income (p.a., reference)"],
    factSheet: [
      { label: "Total rental area", value: "802 m²" },
      { label: "Terrace (rental)", value: "230 m²" },
      { label: "Garden (rental)", value: "429 m²" },
      { label: "Parking spaces", value: "16" },
      { label: "Reference acquisition", value: "€ 10.500.000" },
      { label: "Gross rental income (p.a., reference)", value: "€ 250.000" },
    ],
    greenPrint: [
      "Geothermal heating and cooling",
      "Large green yards",
      "Terraces for all apartments",
      "Private lake access with jetty and bathhouse",
    ],
    legalNote:
      "Reference narrative from partner archive; confirm live on-chain listing mapping with issuer materials before relying on allocation slots.",
    imagePaths: [
      "/keutschach/Foto_steg_Keutschach.jpg",
      "/keutschach/STIX Wohnanlage Keutschacher See 2024-04-04_0212.jpg",
      "/keutschach/STIX Wohnanlage Keutschacher See 2024-04-04_0257.jpg",
      "/keutschach/STIX Wohnanlage Keutschacher See 2024-04-04_0291.jpg",
    ],
    pdfPaths: [],
    caveat:
      "Archived partner narrative for the large lakeside programme. On-chain property slots may differ — verify live listing mapping in issuer docs.",
  },
  {
    id: "berggasse",
    shortTitle: "Vienna Berggasse",
    title: "Vienna Berggasse",
    location: "Vienna",
    summary:
      "Urban residential in Vienna’s Berggasse corridor — visual documentation of the asset narrative backing club transparency efforts.",
    highlightFactLabels: [],
    factSheet: [
      { label: "Asset photos", value: "On-file (see gallery)" },
      { label: "Full SPV disclosure", value: "In preparation" },
    ],
    greenPrint: ["Add ESG or energy certificate bullets here when available."],
    legalNote:
      "Placeholder until full SPV name, land register excerpt, and custody bank letters are published. Replace with final legal summary.",
    imagePaths: [
      "/berggasse/01berggasse.jpeg",
      "/berggasse/berg03.jpg",
      "/berggasse/berg04.jpg",
      "/berggasse/berg05.jpg",
      "/berggasse/berg06.jpg",
    ],
    pdfPaths: [],
  },
];

/** All curated assets (POC first for dashboard lead imagery). */
export const realAssets: RealAssetEntry[] = [...daoPocRealAssets, ...referenceRealAssets];

/** First image path suitable for teasers (Villa POC preferred). */
export function getLeadReserveImagePath(): string | null {
  const villa = realAssets.find(a => a.id === "villa-ebreichsdorf");
  if (villa?.imagePaths[0]) return villa.imagePaths[0];
  for (const a of realAssets) {
    if (a.imagePaths[0]) return a.imagePaths[0];
  }
  return null;
}
