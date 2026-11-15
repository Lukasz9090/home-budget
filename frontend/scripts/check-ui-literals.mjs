// Literal scan for src/app (npm run lint:ui): design values must come from the tokens in
// src/styles.css and the helm components in libs/ui, never from literals in the views.
// Fails on colour literals, Tailwind palette classes, arbitrary-value utilities and `dark:`
// variants (dark mode lives in the token layer only). A line containing `ui-literals-ignore`
// is skipped. Node built-ins only, so it runs the same under cmd.exe and POSIX shells.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const scanDir = join(root, 'src', 'app');
const extensions = new Set(['.html', '.ts', '.css']);
const ignoreMarker = 'ui-literals-ignore';

const palette =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black';
const rules = [
  // The /10x-ui hardcoded-value scan.
  String.raw`#[0-9a-fA-F]{3,8}\b`,
  String.raw`rgba?\(`,
  String.raw`hsla?\(`,
  String.raw`oklch\(`,
  String.raw`-\[[0-9.]+(px|rem)\]`,
  String.raw`\b(bg|text|border|ring|outline|from|via|to|fill|stroke|shadow|divide)-(${palette})\b`,
  // Any arbitrary-value utility: w-[50%], bg-[var(--x)], h-[calc(...)].
  String.raw`\b[a-z][a-z0-9-]*-\[[^\]]+\]`,
  // Dark variants belong to the token layer (:root.dark), not to views.
  String.raw`\bdark:`,
];
const pattern = new RegExp(rules.join('|'), 'g');

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(path);
    } else if (extensions.has(extname(entry.name)) && !entry.name.endsWith('.spec.ts')) {
      yield path;
    }
  }
}

let hits = 0;
let files = 0;
for (const file of walk(scanDir)) {
  files++;
  const name = relative(root, file).split(sep).join('/');
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    if (line.includes(ignoreMarker)) {
      return;
    }
    for (const match of line.matchAll(pattern)) {
      console.log(`${name}:${index + 1}: ${match[0]}`);
      hits++;
    }
  });
}

if (hits > 0) {
  console.error(
    `\nlint:ui: ${hits} literal(s) found. Use semantic token classes (bg-primary, ` +
      `text-muted-foreground, border-border...) and helm components; see CLAUDE.md "## UI".`,
  );
  process.exit(1);
}
console.log(`lint:ui: OK (${files} files in src/app, no literals)`);
