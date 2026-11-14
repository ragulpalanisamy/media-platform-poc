# ADR-001: In-House VBC Media SDK & First-Party Edge Catalog Architecture

* **Status:** Proposed & Validated via Working PoC
* **Date:** 2026-11-16
* **Author:** Senior Architect, VBC Messaging Platform
* **Deciders:** Architecture Review Board (ARB), VP of Engineering, Lead Security Architect, Legal Counsel
* **Scope:** VBC Web (`vbc-messaging-app`), VBC Mobile Android (`Android_VBS_App`, `vbc-intune-android`), VBC Mobile iOS (`iOS_VBS`, `vbc-intune-ios`)

---

## 1. Context & Problem Statement
The VBC messaging platform historically integrated external third-party GIF providers (GIPHY) to support expressive workplace messaging. Over recent quarters, this reliance introduced four critical business and engineering risks:

1. **Vendor Outages & SPOF (INC-909):** API key expirations, upstream deprecations, or vendor service disruptions caused total feature blackout in production messaging clients.
2. **Client Credential Exposure:** Distributing vendor API keys inside mobile binary packages (`.apk` / `.ipa`) violates modern zero-trust enterprise security standards and was flagged during external penetration tests.
3. **Data Privacy & Intune MAM Non-Compliance:** User search queries (often containing proprietary project codenames, client names, or workplace context) were transmitted directly to third-party ad-tech infrastructure. Furthermore, Microsoft Intune App Protection Policies frequently blocked outbound third-party traffic.
4. **Carrier MMS Attachment Failures (VMMT-949):** Unconstrained GIF dimensions and unbounded byte payloads from external sources repeatedly violated cellular carrier MMS ceilings (450 KB), resulting in silent delivery failures for outbound SMS/MMS.

---

## 2. Decision & Architectural Direction
We will **replace all third-party media vendors with a 100% In-House VBC Media Platform**:
1. **First-Party Static Edge Catalog (`catalog.json`):** Curated workplace GIFs, animated stickers, and emojis distributed via first-party CDN (Vercel Edge for initial rollout; AWS S3 + CloudFront with Origin Access Control for enterprise scale).
2. **Three Native Client Packages Consuming One Contract:**
   - **Web / Desktop:** `@vonage/vbc-media-picker` (Vue 2.7 & Vue 3 compatible with headless TypeScript core).
   - **Android:** `vbc-media-picker-android` (`BottomSheetDialogFragment` powered by Coil 3 hardware-accelerated image decoders).
   - **iOS:** `VBCMediaPicker` (Swift Package Manager component with `UICollectionViewDiffableDataSource` and progressive background decoding).
3. **Zero-Proxy, Zero-Compute Search Architecture:** Client SDKs cache `catalog.json` on initialization and execute sub-millisecond prefix and tag scoring locally in-memory. Zero search queries leave the user's device.

---

## 3. Legal, IP & US Corporate Compliance
As a US-based public enterprise (Vonage / Ericsson), media content provenance must be strictly auditable:
- **Clean Provenance:** 100% of assets originate from vetted permissive open-source licenses (`CC-BY-4.0` Google Noto Animated Emoji, `Apache-2.0` Google Noto Static, `CC0-1.0`, or internal Vonage design assets).
- **No Copyright Risk:** Pop-culture copyrighted video loops from third-party studios are completely excluded.
- **Cryptographic SBOM (`licenses-sbom.json`):** Every distributed file includes a verified SHA-256 checksum, copyright holder attribution, and SPDX identifier.
- **Automated License Gate:** CI/CD automatically fails if any unapproved license (`GPL`, `CC-BY-SA`) is detected.

---

## 4. Security & Operational Guarantees
- **MMS Compliance by Design:** Build-time ingestion enforces a strict `<= 450 KB` (460,800 bytes) ceiling. Any asset exceeding this threshold is rejected before deployment.
- **Anti-Polyglot Pixel Sanitization:** All assets undergo pixel decoding and clean re-encoding to strip EXIF, comments, and payload steganography.
- **Immutable Edge Headers:** All assets are served with `Cache-Control: public, max-age=31536000, immutable`, `X-Content-Type-Options: nosniff`, and strict `Content-Security-Policy: default-src 'none'`.
- **Infrastructure Cost Reduction:** Total operating cost drops from vendor enterprise licensing fees (thousands of dollars/month) to static edge hosting (~$30–$50/month).
