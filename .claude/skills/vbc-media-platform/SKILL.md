---
name: vbc-media-platform
description: Comprehensive engineering playbook for the Vonage VBC in-house media platform, covering deterministic catalog ingestion, cryptographic SBOM generation, headless TypeScript search engine, drop-in Vue picker component, and cross-platform Android/iOS integration.
---

# VBC Media Platform Engineering Playbook

When executing tasks or extending the platform, adhere to these four core engineering skills:

---

## Skill 1: Deterministic Catalog & Cryptographic SBOM Ingestion
**Goal:** Build `scripts/build-catalog.mjs` using native Node.js 20+ (`fetch`, `fs/promises`, `crypto`) with zero npm dependencies.
- **Source API:** Fetch `https://googlefonts.github.io/noto-emoji-animation/data/api.json` (Google Noto Animated Emoji, licensed under `CC-BY-4.0`).
- **Curated Workplace Filter:** Filter icons matching high-frequency enterprise communication tags (`thumbs`, `clap`, `party`, `fire`, `rocket`, `check`, `heart`, `smile`, `laugh`, `joy`, `think`, `eyes`, `wave`, `pray`, `trophy`, `star`, `coffee`, `100`, `sparkles`, `salute`, `mind-blown`, `ok`, `muscle`, `light-bulb`). Cap at **80–120 items** so the build finishes rapidly.
- **Dual Format Download & Fallback:**
  - Animated WebP URL: `https://fonts.gstatic.com/s/e/notoemoji/latest/${codepoint}/512.webp`
  - Animated GIF URL: `https://fonts.gstatic.com/s/e/notoemoji/latest/${codepoint}/512.gif`
  - **Resilience Rule:** If the remote fetch fails or times out on a restricted network, automatically generate a deterministic local SVG/WebP fallback fixture set of 30+ workplace items so the demo build NEVER fails offline.
- **Hard Gates:**
  - Reject any file where `byteLength > 450 * 1024` (450 KB).
  - Compute `crypto.createHash('sha256').update(buffer).digest('hex')` for every saved file.
  - Emit `/public/cdn/v1/catalog.json`, `/public/cdn/v1/licenses-sbom.json`, and `/public/THIRD_PARTY_NOTICES.txt`.

---

## Skill 2: Headless TypeScript SDK Core (`src/sdk/vbc-media-core.ts`)
**Goal:** Keep search, filtering, and recents 100% framework-agnostic so Vue 2.7, Vue 3, and webviews share one engine.
- **Zero-Network In-Memory Search:**
  - Load `/cdn/v1/catalog.json` once on initialization and cache in memory.
  - Score queries across `title`, `tags[]`, and `categories[]`:
    - Exact tag match = `100 pts`
    - Prefix match (`tag.startsWith(q)`) = `75 pts`
    - Substring match (`tag.includes(q)`) = `40 pts`
  - Measure search execution time via `performance.now()` and return `{ results, latencyMs, totalScanned }` so the UI can display live sub-millisecond search telemetry.
- **Static Unicode Emojis Built-In:** Include a structured in-memory array of 80+ essential workplace Unicode emojis (`👍`, `👏`, `🎉`, `🚀`, `🔥`, `✅`, `❤️`, `😂`, `🤔`, `👀`, `🙏`, `☕`, `💯`, `🏆`, `⚡`, `🎯`, etc.) with keyword tags so the `Emojis` tab requires zero image network requests.
- **On-Device Recents:** Persist up to 24 recently selected asset IDs in `localStorage` under key `vbc_media_recents_v1`.

---

## Skill 3: Drop-In Vue Picker Component (`src/sdk/VbcMediaPicker.vue`)
**Goal:** Production-ready UI component matching Vonage Business Communications (VBC) dark/light enterprise aesthetic.
- **Props:** `baseUrl` (default `"/cdn/v1"`), `maxMmsBytes` (default `460800`), `theme` (`"dark" | "light"`).
- **Emits:** `@select="(asset: MediaAsset) => void"`, `@search-telemetry="(stats: SearchStats) => void"`.
- **Tabs:** `GIFs` (animated `.gif` under 450 KB), `Stickers` (animated `.webp` transparent stickers), `Emojis` (native Unicode grid), `Recents` (`🕒`).
- **Category Pills:** Quick-filter chips (`All`, `Reactions`, `Celebration`, `Approval`, `Work & Coffee`).
- **Grid Performance:** Use `loading="lazy"` and clean CSS grid (`repeat(auto-fill, minmax(96px, 1fr))`) with hover metadata badges showing file size in KB (e.g., `64 KB • MMS OK`).

---

## Skill 4: Executive Demo Command Center (`src/demo/`)
**Goal:** Build a 2-column split-screen showcase designed for a 5-minute Senior Architect presentation.
- **Left Column (`VbcChatSimulator.vue`):**
  - Realistic VBC Messaging channel header (`#release-vbc-platform • 14 members • Intune MAM Protected`).
  - Pre-populated realistic engineering messages (e.g., Divyank Pandey, Gnanesh Puttaswamy discussing INC-909 & VMMT-949 resolution).
  - Interactive message bar with a `[😊 GIF / Sticker]` toggle button that opens `<VbcMediaPicker />`.
  - Selecting a GIF/Sticker/Emoji immediately posts it into the live chat stream with an audit badge: `✅ 68.4 KB (MMS Safe <450 KB) • CC-BY-4.0 • 1st-Party CDN`.
- **Right Column (`ArchitectInspector.vue`):**
  - **Tab 1: Live Security & MMS Telemetry:** Shows `External API Calls: 0`, `Search Query Leakage: 0 Bytes`, `Last Search Latency: 0.14 ms`, plus full JSON & SHA-256 SBOM inspection of the last clicked asset.
  - **Tab 2: Cross-Platform SDK Code (Vue / Android Kotlin / iOS Swift):** Interactive code viewer showing the exact drop-in integration code for:
    1. `Vue 2.7 / Vue 3` (`<VbcMediaPicker @select="attachMedia" />`)
    2. `Android Kotlin` (`BottomSheetDialogFragment` + **Coil 3** `AsyncImage` consuming `/cdn/v1/catalog.json`)
    3. `iOS Swift SPM` (`UICollectionView` + **SDWebImageWebPCoder** `SDAnimatedImageView` consuming `/cdn/v1/catalog.json`)
  - **Tab 3: ADR-001 & US Legal Audit SBOM:** Renders the formal Architecture Decision Record and live searchable `licenses-sbom.json` table directly inside the UI.
