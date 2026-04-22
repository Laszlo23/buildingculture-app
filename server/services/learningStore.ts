import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, "../.data");
const file = join(dir, "learning-completions.json");

export type RouteId = "rwa" | "authenticity" | "truth";

type CompletionRecord = {
  completedAt: string;
};

type AddressBook = Record<
  string,
  {
    /** lowercase address key in file is normalized */
    completions: Partial<Record<RouteId, CompletionRecord>>;
  }
>;

function readAll(): AddressBook {
  if (!existsSync(file)) return {};
  try {
    const raw = readFileSync(file, "utf8");
    const parsed = JSON.parse(raw) as AddressBook;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(data: AddressBook) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function norm(addr: string) {
  return addr.toLowerCase();
}

export function getCompletions(address: `0x${string}`) {
  const book = readAll();
  return book[norm(address)]?.completions ?? {};
}

export function markRouteComplete(address: `0x${string}`, routeId: RouteId) {
  const book = readAll();
  const k = norm(address);
  if (!book[k]) book[k] = { completions: {} };
  book[k].completions[routeId] = { completedAt: new Date().toISOString() };
  writeAll(book);
}

export function hasCompletedRoute(address: `0x${string}`, routeId: RouteId): boolean {
  return Boolean(getCompletions(address)[routeId]);
}
