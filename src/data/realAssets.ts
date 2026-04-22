/** Curated proof-of-reserve copy + media paths under /public. */

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
};

/** Encode paths for img src (handles spaces in filenames under /public). */
export function publicAssetSrc(path: string): string {
  if (path.startsWith("http")) return path;
  return encodeURI(path);
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

export const realAssets: RealAssetEntry[] = [
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
    greenPrint: [
      "Add ESG or energy certificate bullets here when available.",
    ],
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

/** First image path suitable for teasers (lead property with photography). */
export function getLeadReserveImagePath(): string | null {
  for (const a of realAssets) {
    if (a.imagePaths[0]) return a.imagePaths[0];
  }
  return null;
}
