# US Corporate Legal & IP Compliance Guide

## 1. Compliance Mandate
As a US-based enterprise operating within telecommunications and enterprise messaging, Vonage must ensure that all media assets distributed through its SDK and client applications adhere to strict IP, copyright (DMCA), and open-source license obligations.

---

## 2. Permitted vs. Prohibited Content

### Permitted Licenses (Approved Allowlist)
1. **CC-BY-4.0 (Creative Commons Attribution 4.0 International):**
   - Permitted for commercial use, modification, and distribution.
   - Requires attribution via `THIRD_PARTY_NOTICES.txt` and embedded app documentation.
   - Example: Google Noto Animated Emoji catalog.
2. **Apache-2.0 (Apache Software License 2.0):**
   - Permitted for commercial use with copyright notice retention.
   - Example: Google Noto Static Emoji vector shapes.
3. **CC0-1.0 (Creative Commons Zero / Public Domain):**
   - Unrestricted public domain dedication.
4. **Proprietary / Vonage-Owned Design Assets:**
   - Custom in-house animations, brand iconography, and stickers created by internal design teams.

### Prohibited Licenses & Content Types
1. **Unlicensed Pop-Culture Clips:** Movie scenes, TV snippets, sports highlights, celebrity reaction clips without explicit studio licensing agreements are **STRICTLY PROHIBITED**.
2. **Copyleft Licenses (GPL-2.0, GPL-3.0, AGPL):** Banned to prevent any viral source disclosure obligations.
3. **ShareAlike Licenses (CC-BY-SA-4.0):** Banned to prevent reciprocal licensing requirements on adjacent software bundles.

---

## 3. Cryptographic Software Bill of Materials (SBOM)
Every production build generates `licenses-sbom.json`. For each asset, the SBOM records:
- `assetId`: Canonical identifier (e.g., `noto_1f680`).
- `sourceUrl`: Upstream origin repository link.
- `spdxLicense`: Standard SPDX identifier (e.g., `CC-BY-4.0`).
- `copyrightHolder`: Legal owner (e.g., `Google LLC`).
- `sha256`: Cryptographic checksum of the exact distributed binary.
- `byteSize`: Verified payload size in bytes.
- `verifiedAt`: ISO 8601 audit timestamp.
