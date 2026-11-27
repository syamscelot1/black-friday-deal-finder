// Black Friday Vault — the hand-in program for black-friday-deal-finder-01
// (Node 22, standard library only). It copies this repository's app/ and
// screenshots/ into the output directory and writes output/dossier.json with
// the vendored make.fun library, which the scorer rebuilds and compares byte
// for byte. vendor/makefun-frontend.ts is the kit's copy, left unchanged.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(out, { recursive: true });
cpSync(join(here, "app"), join(out, "app"), { recursive: true });
mkdirSync(join(out, "screenshots"), { recursive: true });
if (existsSync(join(here, "screenshots"))) {
  cpSync(join(here, "screenshots"), join(out, "screenshots"), { recursive: true });
}

// The scorer's caps, mirrored here so a bad entry fails loudly at build time
// instead of at the gate: at most 4 screenshots of 256 KiB each, app/ at most
// 993 files and directories and 16 MiB, and the dossier text at most 160 KiB.
writeFileSync(
  join(out, "dossier.json"),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
