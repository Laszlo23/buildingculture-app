/**
 * CLI entry for Stacks PoX keeper (cron-friendly).
 * Usage: `npm run stacks:keeper` or `npm run stacks:keeper -- --dry-run`
 * Requires STACKS_ENABLED=1 and other vars — see deploy/docs/stacks-stacking.md
 */
import { config } from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { initAppDatabase } from "../lib/db.js";
import { resetStacksConfigCache } from "../lib/stacksEnv.js";
import { runStacksKeeperTick } from "../services/stacksKeeper.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../../.env") });

initAppDatabase();
resetStacksConfigCache();

const argvDry = process.argv.includes("--dry-run");

void runStacksKeeperTick({ argvDryRun: argvDry })
  .then((r) => {
    process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
    process.exit(0);
  })
  .catch((e) => {
    process.stderr.write(`${e instanceof Error ? e.stack ?? e.message : String(e)}\n`);
    process.exit(1);
  });
