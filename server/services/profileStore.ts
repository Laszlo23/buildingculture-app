import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, "../.data");
const file = join(dir, "member-profiles.json");

export type Socials = {
  twitter?: string;
  github?: string;
  website?: string;
  farcaster?: string;
};

export type MemberProfile = {
  bio: string;
  socials: Socials;
  updatedAt: string;
  /** When false, public investor page and leaderboards hide this wallet. Default public. */
  publicWealthProfile?: boolean;
  /** Short label for share cards (max 32 chars). */
  wealthDisplayName?: string;
  /** First time we recorded an on-chain vault snapshot for this address (ISO). */
  firstVaultInteractionAt?: string;
};

type Book = Record<string, MemberProfile>;

function readAll(): Book {
  if (!existsSync(file)) return {};
  try {
    const raw = readFileSync(file, "utf8");
    const parsed = JSON.parse(raw) as Book;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(data: Book) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function norm(addr: string) {
  return addr.toLowerCase();
}

const emptyProfile = (): MemberProfile => ({
  bio: "",
  socials: {},
  updatedAt: new Date().toISOString(),
  publicWealthProfile: true,
});

export function getProfile(address: `0x${string}`): MemberProfile {
  const book = readAll();
  const p = book[norm(address)] ?? emptyProfile();
  return {
    ...p,
    publicWealthProfile: p.publicWealthProfile !== false,
  };
}

export function putProfile(
  address: `0x${string}`,
  partial: {
    bio?: string;
    socials?: Partial<Socials>;
    publicWealthProfile?: boolean;
    wealthDisplayName?: string | null;
    firstVaultInteractionAt?: string;
  },
): MemberProfile {
  const book = readAll();
  const k = norm(address);
  const prev = book[k] ?? emptyProfile();
  const next: MemberProfile = {
    bio: partial.bio !== undefined ? partial.bio.slice(0, 2000) : prev.bio,
    socials: {
      ...prev.socials,
      ...(partial.socials ?? {}),
    },
    updatedAt: new Date().toISOString(),
    publicWealthProfile:
      partial.publicWealthProfile !== undefined
        ? partial.publicWealthProfile
        : prev.publicWealthProfile === false
          ? false
          : true,
    wealthDisplayName:
      partial.wealthDisplayName === null
        ? undefined
        : partial.wealthDisplayName !== undefined
          ? partial.wealthDisplayName.trim().slice(0, 32)
          : prev.wealthDisplayName,
    firstVaultInteractionAt:
      partial.firstVaultInteractionAt !== undefined
        ? partial.firstVaultInteractionAt
        : prev.firstVaultInteractionAt,
  };
  if (next.socials.twitter !== undefined) next.socials.twitter = next.socials.twitter?.trim().slice(0, 256);
  if (next.socials.github !== undefined) next.socials.github = next.socials.github?.trim().slice(0, 256);
  if (next.socials.website !== undefined) next.socials.website = next.socials.website?.trim().slice(0, 512);
  if (next.socials.farcaster !== undefined) next.socials.farcaster = next.socials.farcaster?.trim().slice(0, 256);
  book[k] = next;
  writeAll(book);
  return next;
}
