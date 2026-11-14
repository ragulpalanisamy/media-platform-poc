# PLAN.md — Autonomous Goal-Driven Execution Plan

Follow these 5 phases sequentially. Do NOT skip verification steps. Loop on each phase until its Verification Command exits with code `0`.

---

## Phase 1: Project Scaffold & Zero-Dependency Catalog Pipeline
**Goal:** Initialize Vite + Vue 3 + TypeScript project and build `scripts/build-catalog.mjs` to populate `/public/cdn/v1/catalog.json`, `/public/cdn/v1/licenses-sbom.json`, `/public/THIRD_PARTY_NOTICES.txt`, and `/public/cdn/v1/assets/`.

**Tasks:**
1. Create `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, and `vercel.json`.
2. Implement `scripts/build-catalog.mjs` per `SKILLS.md` (Skill 1) and `ARCHITECTURE.md`.
   - Download curated Google Noto Animated Emoji `.gif` and `.webp` files (`<= 450 KB`).
   - Include an automatic fallback generator if external network access is restricted so `catalog.json` always has at least 30 valid animated/vector assets + SHA-256 hashes.
3. Run `npm install` and `node scripts/build-catalog.mjs`.

**Verification Loop (MUST PASS):**
Run:
```bash
node -e "const c=JSON.parse(require('fs').readFileSync('./public/cdn/v1/catalog.json')); const s=JSON.parse(require('fs').readFileSync('./public/cdn/v1/licenses-sbom.json')); if(c.items.length<20) throw 'Too few items'; if(c.items.some(i=>i.byteSize>460800)) throw 'MMS 450KB cap violated'; if(s.assets.length!==c.items.length) throw 'SBOM count mismatch'; console.log('PHASE 1 VERIFIED:', c.items.length, 'assets');"
```

---

## Phase 2: Headless SDK Core (`src/sdk/vbc-media-core.ts`)
**Goal:** Build the framework-agnostic TypeScript media engine supporting instant in-memory search, category filtering, static emoji index, and localStorage recents.

**Tasks:**
1. Create `src/sdk/types.ts` matching `ARCHITECTURE.md`.
2. Create `src/sdk/vbc-media-core.ts`:
   - Fetch and cache `${baseUrl}/catalog.json`.
   - Include 80+ built-in workplace Unicode emojis with rich keyword tags (`thumbs`, `clap`, `rocket`, `fire`, `coffee`, `check`, `lgtm`, `party`, `heart`, `eyes`, `pray`, `trophy`, etc.).
   - Implement `search(query, type, category)` returning `{ items: MediaAsset[], stats: SearchStats }` with `performance.now()` latency measurement.
   - Implement `recordRecent(asset)` and `getRecents()` using `localStorage`.

**Verification Loop (MUST PASS):**
Run `npx.cmd tsc --noEmit` and verify zero TypeScript errors in `src/sdk/`.

---

## Phase 3: Drop-In Vue Media Picker SDK (`src/sdk/VbcMediaPicker.vue`)
**Goal:** Build the reusable `@vonage/vbc-media-picker` Vue component with tabbed navigation (GIFs, Stickers, Emojis, Recents), instant search bar, category pills, and MMS compliance badges.

**Tasks:**
1. Implement `src/sdk/VbcMediaPicker.vue` using `<script setup lang="ts">`.
2. Add debounced search input (80ms) with clear button and live latency badge (`0.12 ms • 1st-Party`).
3. Render responsive asset grid:
   - 3-column grid for GIFs and Stickers showing animated preview + hover badge (`68 KB • MMS OK`).
   - 7-column grid for Emojis.
4. Emit `select(asset)` when clicked and `search-telemetry(stats)` on every query change.

**Verification Loop (MUST PASS):**
Run `npx.cmd tsc --noEmit` to confirm component props, emits, and template bindings compile cleanly.

---

## Phase 4: Executive Demo Command Center (`src/demo/` & `src/App.vue`)
**Goal:** Build the split-screen VBC Demo Sandbox proving UX, Security (INC-909), MMS Compliance (VMMT-949), US Legal Auditability (SBOM), and Mobile SDK Parity (Android Kotlin + iOS Swift).

**Tasks:**
1. Create `src/demo/adr-content.ts` containing:
   - Full ADR-001: In-House VBC Media SDK & First-Party Catalog Architecture text.
   - Production-ready Android Kotlin (Coil 3 + BottomSheetDialogFragment) SDK implementation code consuming `/cdn/v1/catalog.json`.
   - Production-ready iOS Swift (SPM + SDWebImageWebPCoder + UICollectionView) SDK implementation code consuming `/cdn/v1/catalog.json`.
   - Production-ready Vue 2.7 / Vue 3 integration snippet.
2. Create `src/demo/VbcChatSimulator.vue` (Left Panel):
   - VBC header with `Intune MAM Compliant` & `0 External Calls` status pills.
   - Realistic chat messages + composer bar toggling `<VbcMediaPicker />`.
   - Posting an asset appends a rich message card displaying the animated GIF/Sticker/Emoji alongside its verified byte size, SHA-256 prefix, and SPDX license badge.
3. Create `src/demo/ArchitectInspector.vue` (Right Panel):
   - **Tab 1 (Live Telemetry & Audit):** Real-time counters (External API Requests: 0, Query Leakage: 0 B, Search Latency: <1 ms), selected asset JSON inspector, and MMS 450 KB progress bar.
   - **Tab 2 (Mobile & Web SDK Code):** Sub-tabs for Vue.js, Android (Kotlin + Coil 3), and iOS (Swift + SDWebImage) with a "Copy SDK Code" button.
   - **Tab 3 (ADR-001 & Legal SBOM):** Formatted ADR viewer + interactive table of `/cdn/v1/licenses-sbom.json` with a button to download raw `licenses-sbom.json` and `THIRD_PARTY_NOTICES.txt`.
4. Assemble both panels in `src/App.vue` with a top executive banner showing key metrics (Cost: ~$40/mo, Outage Risk: 0%, MMS Limit: <450 KB Enforced, License Audit: 100% CC-BY-4.0 / Apache-2.0).

**Verification Loop (MUST PASS):**
Run `npm.cmd run build` and verify Vite produces a clean production bundle in `dist/` with zero errors.

---

## Phase 5: End-to-End Compliance Audit & Vercel Readiness (`scripts/verify-build.mjs`)
**Goal:** Programmatically audit the built `dist/` folder to prove 100% compliance before deployment.

**Tasks:**
1. Create `scripts/verify-build.mjs` that asserts:
   - `dist/index.html`, `dist/cdn/v1/catalog.json`, `dist/cdn/v1/licenses-sbom.json`, and `dist/THIRD_PARTY_NOTICES.txt` exist.
   - Every asset in `catalog.json` exists on disk in `dist/cdn/v1/assets/` and is `<= 450 KB`.
   - Zero occurrences of `api.giphy.com`, `tenor.com`, or hardcoded API keys exist in `dist/assets/*.js`.
   - `vercel.json` exists and contains `X-Content-Type-Options: nosniff` and immutable caching rules.
2. Add `"verify": "node scripts/verify-build.mjs"` and `"build": "node scripts/build-catalog.mjs && vite build && node scripts/verify-build.mjs"` to `package.json`.

**Verification Loop (MUST PASS):**
Run `npm.cmd run build` and confirm `ALL ARCHITECTURE & AUDIT CHECKS PASSED` prints to stdout.
