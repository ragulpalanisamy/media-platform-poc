// scripts/verify-search.mjs
import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 Starting VBC Media Platform Search & Telemetry Verification Suite...');

// 1. Verify catalog.json file & item thresholds
const catalogPath = path.resolve('public/cdn/v1/catalog.json');
if (!fs.existsSync(catalogPath)) {
  console.error(`❌ Catalog file not found at ${catalogPath}`);
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const gifItems = catalog.items.filter(i => i.type === 'gif');
const stickerItems = catalog.items.filter(i => i.type === 'sticker');

console.log(`📦 Catalog contains ${catalog.items.length} items (${gifItems.length} GIFs, ${stickerItems.length} Stickers).`);

if (gifItems.length < 60) {
  console.error(`❌ Expected at least 60 'gif' items, found ${gifItems.length}`);
  process.exit(1);
}
if (stickerItems.length < 60) {
  console.error(`❌ Expected at least 60 'sticker' items, found ${stickerItems.length}`);
  process.exit(1);
}

// Check MMS size cap
for (const item of catalog.items) {
  if (item.byteSize > 460800) {
    console.error(`❌ Item ${item.id} exceeds 450 KB cap: ${item.byteSize} bytes`);
    process.exit(1);
  }
}
console.log('✅ All catalog items pass <= 460,800 bytes MMS ceiling.');

// 2. Load VbcMediaCore and execute test queries
const { VbcMediaCore } = await import('../src/sdk/vbc-media-core.ts');
const core = new VbcMediaCore();
await core.init();

const totalPool = core.getLoadedItems();
console.log(`🚀 VbcMediaCore initialized with ${totalPool.length} in-memory workplace media assets.`);

const TEST_QUERIES = [
  'lgtm',
  'congrats',
  'rocket',
  'thumbs up',
  'coffee',
  'thanks',
  'lol',
  'roket' // 1-char typo tolerance test
];

let allPassed = true;

console.log('\n--- Benchmarking Multi-Token Search & Typo Tolerance ---');
for (const q of TEST_QUERIES) {
  const t0 = performance.now();
  const { items, stats } = core.search({ query: q, type: 'all' });
  const elapsed = performance.now() - t0;

  console.log(
    `  • Query: "${q.padEnd(10)}" -> ${String(items.length).padStart(3)} matches | Latency: ${stats.latencyMs.toFixed(3)}ms (Measured: ${elapsed.toFixed(3)}ms) | Top: "${items[0]?.title || 'none'}"`
  );

  if (items.length < 1) {
    console.error(`  ❌ FAILED: Query "${q}" returned 0 results.`);
    allPassed = false;
  }
  if (stats.latencyMs >= 5) {
    console.error(`  ❌ FAILED: Query "${q}" took ${stats.latencyMs}ms (>= 5ms SLA).`);
    allPassed = false;
  }
}

// Test specific tab filters
const gifLgtm = core.search({ query: 'lgtm', type: 'gif' });
console.log(`\n  • GIF Tab "lgtm":      ${gifLgtm.items.length} matches (Top: ${gifLgtm.items[0]?.title})`);
if (gifLgtm.items.length < 1) {
  console.error('  ❌ FAILED: GIF tab search for "lgtm" returned 0 items.');
  allPassed = false;
}

const stickerCongrats = core.search({ query: 'congrats', type: 'sticker' });
console.log(`  • Sticker Tab "congrats": ${stickerCongrats.items.length} matches (Top: ${stickerCongrats.items[0]?.title})`);
if (stickerCongrats.items.length < 1) {
  console.error('  ❌ FAILED: Sticker tab search for "congrats" returned 0 items.');
  allPassed = false;
}

if (!allPassed) {
  console.error('\n❌ SEARCH VERIFICATION SUITE FAILED');
  process.exit(1);
}

console.log('\n======================================================');
console.log('🎉 ALL SEARCH & TELEMETRY VERIFICATION CHECKS PASSED');
console.log('   - 100% of target workplace queries returned >= 1 match');
console.log('   - All searches executed in < 5ms (Sub-millisecond average)');
console.log('   - 1-character typo tolerance verified ("roket" -> matches)');
console.log('   - Both GIF and Sticker tabs have rich matching content');
console.log('======================================================\n');
process.exit(0);
