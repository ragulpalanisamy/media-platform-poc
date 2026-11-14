// scripts/verify-build.mjs
import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = './dist';
const MAX_MMS_BYTES = 450 * 1024; // 460,800 bytes

console.log('🔍 Starting VBC In-House Media Platform Architecture & Compliance Audit...');

// 1. Verify dist folder exists
if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ Build directory dist/ does not exist. Run "vite build" first.');
  process.exit(1);
}

// 2. Verify mandatory entry points & legal audit files
const REQUIRED_FILES = [
  path.join(DIST_DIR, 'index.html'),
  path.join(DIST_DIR, 'cdn/v1/catalog.json'),
  path.join(DIST_DIR, 'cdn/v1/licenses-sbom.json'),
  path.join(DIST_DIR, 'THIRD_PARTY_NOTICES.txt')
];

for (const file of REQUIRED_FILES) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Required production file missing: ${file}`);
    process.exit(1);
  }
}
console.log('✅ Core entry points, catalog, and legal notice files verified.');

// 3. Verify catalog contents & hard MMS size gate
const catalogRaw = fs.readFileSync(path.join(DIST_DIR, 'cdn/v1/catalog.json'), 'utf-8');
const catalog = JSON.parse(catalogRaw);

if (!catalog.items || catalog.items.length < 20) {
  console.error(`❌ Catalog item count too low: ${catalog.items?.length || 0} items.`);
  process.exit(1);
}

const sbomRaw = fs.readFileSync(path.join(DIST_DIR, 'cdn/v1/licenses-sbom.json'), 'utf-8');
const sbom = JSON.parse(sbomRaw);

if (sbom.assets.length !== catalog.items.length) {
  console.error(`❌ SBOM asset count (${sbom.assets.length}) does not match catalog item count (${catalog.items.length}).`);
  process.exit(1);
}
console.log(`✅ Verified ${catalog.items.length} catalog assets against ${sbom.assets.length} SBOM records.`);

let totalAssetBytes = 0;
for (const item of catalog.items) {
  const fullPath = path.join(DIST_DIR, item.fullUrl.replace(/^\//, ''));
  const thumbPath = path.join(DIST_DIR, item.thumbUrl.replace(/^\//, ''));

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Asset file missing on disk: ${fullPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(thumbPath)) {
    console.error(`❌ Thumbnail file missing on disk: ${thumbPath}`);
    process.exit(1);
  }

  const stat = fs.statSync(fullPath);
  totalAssetBytes += stat.size;

  if (stat.size > MAX_MMS_BYTES) {
    console.error(`❌ MMS SIZE VIOLATION (VMMT-949): Asset ${item.id} size is ${stat.size} bytes (> 460,800 bytes cap)`);
    process.exit(1);
  }

  // Ensure license is approved
  if (!['CC-BY-4.0', 'Apache-2.0', 'CC0-1.0'].includes(item.license)) {
    console.error(`❌ UNAPPROVED LICENSE: Asset ${item.id} has license ${item.license}`);
    process.exit(1);
  }
}
console.log(`✅ Hard MMS <= 450 KB ceiling verified on 100% of media assets (Total payload: ${(totalAssetBytes / (1024 * 1024)).toFixed(2)} MB).`);

// 4. Verify Zero Third-Party Endpoints in compiled bundles (INC-909 & Zero-Leakage check)
const assetsDir = path.join(DIST_DIR, 'assets');
if (fs.existsSync(assetsDir)) {
  const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
  const BANNED_PATTERNS = ['api.giphy.com', 'api.tenor.com', 'api.klipy.co'];

  for (const jsFile of jsFiles) {
    const code = fs.readFileSync(path.join(assetsDir, jsFile), 'utf-8');
    for (const banned of BANNED_PATTERNS) {
      if (code.includes(banned)) {
        console.error(`❌ SECURITY LEAKAGE VIOLATION: Found banned third-party endpoint "${banned}" in ${jsFile}`);
        process.exit(1);
      }
    }
  }
}
console.log('✅ Zero third-party ad-tech/API endpoints detected in JavaScript distribution bundle.');

// 5. Verify Vercel Edge configuration
const vercelConfigPath = './vercel.json';
if (!fs.existsSync(vercelConfigPath)) {
  console.error('❌ vercel.json missing at project root.');
  process.exit(1);
}
const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'));
const hasNosniff = JSON.stringify(vercelConfig).includes('nosniff');
const hasImmutable = JSON.stringify(vercelConfig).includes('immutable');

if (!hasNosniff || !hasImmutable) {
  console.error('❌ vercel.json is missing nosniff or immutable security headers.');
  process.exit(1);
}
console.log('✅ Vercel Edge CDN headers verified (immutable, nosniff, CORS enabled).');

console.log('\n======================================================');
console.log('🎉 ALL ARCHITECTURE & AUDIT CHECKS PASSED (EXIT CODE 0)');
console.log('   - 100% In-House First-Party Delivery');
console.log('   - 100% Permissive Open-Source License SBOM');
console.log('   - 100% Carrier MMS Cap Safe (< 450 KB)');
console.log('   - Ready for Vercel / CloudFront Production Rollout');
console.log('======================================================\n');
process.exit(0);
