# Media Platform POC

> **Senior Architect Initiative**  
> 100% In-House • Zero Third-Party Feeds • Zero Query Leakage • Sub-Millisecond Search • Carrier MMS Safe (<450 KB) • Cryptographic Legal SBOM

---

## 1. Executive Summary
This repository contains the complete working prototype, cross-platform SDK packages, asset sanitization pipeline, and architecture documentation for Vonage Business Communications (VBC) to replace third-party GIF providers (GIPHY) with a first-party in-house media platform.

### Core Problems Solved
- **Vendor SPOF Outages (INC-909):** Eliminates dependencies on external APIs, vendor token renewals, and third-party downtime.
- **Carrier MMS Rejections (VMMT-949):** Hard build-time gate enforces a `< 450 KB` payload ceiling on 100% of distributed media.
- **Client Security & Intune MAM Compliance:** Zero external API keys in mobile binaries; zero user search queries leak to external ad networks.
- **US Corporate Legal Provenance:** 100% of assets originate from permissive licenses (`CC-BY-4.0` Google Noto Animated Emoji, `Apache-2.0`, `CC0-1.0`) with cryptographic SHA-256 records in `licenses-sbom.json`.
- **Infrastructure TCO:** Operating cost drops from thousands of dollars per month in vendor licensing to ~$35–$50/month on static edge CDN.

---

## 2. Senior Architect Monorepo Structure

```text
vbc-media-platform-poc/
├── .github/
│   └── workflows/
│       ├── catalog-ingestion.yml          # Automated weekly/OTA open-source catalog refresh
│       └── compliance-audit.yml           # CI gate enforcing MMS <450KB & zero external endpoints
├── docs/                                  # Governance & Architecture Documentation
│   ├── adr/
│   │   └── ADR-001-In-House-Media-SDK.md  # Formal Architecture Decision Record
│   ├── security/
│   │   └── SECURITY_AND_THREAT_MODEL.md   # Threat matrix, Intune MAM, anti-polyglot pipeline
│   ├── legal/
│   │   └── COMPLIANCE_AND_AUDIT.md        # US legal guide & license allowlist
│   └── platforms/
│       ├── android-integration.md         # Kotlin + Coil 3 integration guide
│       ├── ios-integration.md             # Swift Package Manager + SDWebImage guide
│       └── web-vue-integration.md         # Vue 2.7 & Vue 3 dual-target integration
├── packages/                              # Multi-Target SDK Packages
│   ├── core/                              # @vonage/vbc-media-core (Headless TypeScript engine)
│   ├── vue/                               # @vonage/vbc-media-picker (Vue SFC component)
│   ├── android/                           # Kotlin BottomSheetDialogFragment reference implementation
│   └── ios/                               # Swift UICollectionView reference implementation
├── public/                                # Edge CDN Root (Vercel / AWS CloudFront)
│   ├── cdn/v1/
│   │   ├── catalog.json                   # Normalized metadata & search index
│   │   ├── licenses-sbom.json             # Cryptographic SHA-256 legal audit manifest
│   │   └── assets/                        # Pre-sanitized .webp & .gif assets (<450 KB)
│   └── THIRD_PARTY_NOTICES.txt            # Legal attributions notice
├── scripts/
│   ├── build-catalog.mjs                  # Deterministic ingestion + MMS size check + SHA-256 SBOM
│   └── verify-build.mjs                   # Automated compliance audit script
├── src/                                   # Executive Command Center Showcase Application
│   ├── demo/
│   │   ├── VbcChatSimulator.vue           # Live VBC messaging client simulation
│   │   ├── ArchitectInspector.vue         # Real-time telemetry, audit inspector & code generator
│   │   └── adr-content.ts                 # Embedded ADR & mobile SDK integration snippets
│   ├── sdk/                               # Direct SDK source (TypeScript Core + Vue SFC)
│   ├── App.vue                            # Split-screen executive command center container
│   ├── main.ts
│   └── env.d.ts
├── vercel.json                            # Edge caching, immutable headers, nosniff, CORS
├── package.json
├── tsconfig.json
├── vite.config.ts
├── CLAUDE.md                              # Karpathy-style coding agent principles
├── SKILLS.md                              # Domain-specific implementation skills
├── ARCHITECTURE.md                        # Formal contracts, schemas & edge configs
└── PLAN.md                                # Autonomous goal-driven execution plan
```

---

## 3. Quickstart & Verification

```bash
# 1. Install dependencies
npm install

# 2. Ingest catalog, build production bundle, and run compliance audit
npm run build

# 3. Launch interactive executive demo locally
npm run dev

# 4. Deploy directly to Vercel Edge CDN
npx vercel --prod
```

---

## 4. Monday Presentation Script (5-Minute Walkthrough)
1. **Minute 1 (The Problem):** Present the four risks of external media APIs: INC-909 outages, exposed API keys, Intune MAM blocks, and VMMT-949 MMS drops.
2. **Minute 2 (Live UX):** Search "rocket", "thumbs", "coffee" in the live VBC Chat Simulator. Show sub-millisecond search and tab navigation (GIFs, Stickers, Emojis, Recents).
3. **Minute 3 (Network Tab Proof):** Open Chrome DevTools Network Tab: prove zero network calls leave to external ad-tech/third-party domains.
4. **Minute 4 (MMS & Legal SBOM):** Click any posted asset in the chat thread: show the live MMS gauge utilization under 450 KB and verify cryptographic SHA-256 hash in `licenses-sbom.json`.
5. **Minute 5 (Cross-Platform Parity):** Switch to the SDK tabs to demonstrate that Vue Web, Android Kotlin, and iOS Swift consume the exact same schema.
