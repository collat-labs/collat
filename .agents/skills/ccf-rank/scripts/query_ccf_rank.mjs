#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

function loadManifest(baseDir) {
  const manifestPath = path.resolve(baseDir, '../references/manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return { default_year: '2026', years: ['2026'] };
  }
  try {
    const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const years = Array.isArray(m.years) ? m.years.map(String) : [];
    const latest = years
      .filter((y) => /^\d{4}$/.test(y))
      .sort((a, b) => Number(b) - Number(a))[0];
    return {
      default_year: latest || String(m.default_year || '2026'),
      years: years.length ? years : ['2026'],
    };
  } catch {
    return { default_year: '2026', years: ['2026'] };
  }
}

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreRecord(record, query) {
  const q = norm(query);
  const qCompact = q.replace(/\s+/g, '');

  const abbr = norm(record.abbreviation);
  const fullName = norm(record.full_name);
  const entry = norm(record.entry);
  const aliases = (record.aliases || []).map(norm);

  let score = 0;

  if (q === abbr || qCompact === abbr.replace(/\s+/g, '')) score += 130;
  if (aliases.includes(q) || aliases.map((a) => a.replace(/\s+/g, '')).includes(qCompact)) score += 100;
  if (q && fullName.includes(q)) score += 70;
  if (q && entry.includes(q)) score += 60;

  const tokens = q.split(' ').filter(Boolean);
  if (tokens.length && tokens.every((t) => entry.includes(t))) score += 40;

  if (score > 0 && record.rank === 'A') score += 1;
  return score;
}

function parseArgs(argv) {
  const baseDir = path.dirname(new URL(import.meta.url).pathname);
  const manifest = loadManifest(baseDir);
  const year = String(manifest.default_year || '2026');
  const opts = {
    type: null,
    rank: null,
    top: 8,
    year,
    data: path.resolve(baseDir, `../references/${year}/rankings.json`),
  };

  const args = [...argv];
  let query = null;

  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === '--type') {
      opts.type = args[++i] || null;
      continue;
    }
    if (a === '--rank') {
      opts.rank = args[++i] || null;
      continue;
    }
    if (a === '--top') {
      opts.top = Number(args[++i] || '8');
      continue;
    }
    if (a === '--year') {
      opts.year = String(args[++i] || opts.year);
      opts.data = path.resolve(baseDir, `../references/${opts.year}/rankings.json`);
      continue;
    }
    if (a === '--data') {
      opts.data = path.resolve(args[++i] || opts.data);
      continue;
    }
    if (!query) query = a;
  }

  return { query, opts };
}

function main() {
  const { query, opts } = parseArgs(process.argv.slice(2));
  if (!query) {
    console.error('Usage: node scripts/query_ccf_rank.mjs "<query>" [--year YYYY] [--type conference|journal] [--rank A|B|C] [--top N] [--data path]');
    process.exit(2);
  }

  const raw = fs.readFileSync(opts.data, 'utf8');
  const data = JSON.parse(raw);

  const filtered = [];
  for (const rec of data) {
    if (opts.type && rec.type !== opts.type) continue;
    if (opts.rank && rec.rank !== opts.rank) continue;
    const s = scoreRecord(rec, query);
    if (s > 0) filtered.push([s, rec]);
  }

  filtered.sort((a, b) => {
    const s = b[0] - a[0];
    if (s !== 0) return s;
    return String(b[1].abbreviation || '').localeCompare(String(a[1].abbreviation || ''));
  });

  if (!filtered.length) {
    console.log('No match found.');
    return;
  }

  for (let i = 0; i < Math.min(opts.top, filtered.length); i += 1) {
    const [s, r] = filtered[i];
    console.log(`${i + 1}. [${r.type}/${r.rank}] ${r.abbreviation}`);
    console.log(`   full_name: ${r.full_name}`);
    console.log(`   area: ${r.area}`);
    console.log(`   publisher: ${r.publisher}`);
    console.log(`   url: ${r.url}`);
    console.log(`   score: ${s}`);
  }
}

main();
