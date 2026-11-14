# Security Architecture & Threat Model — VBC In-House Media Platform

## 1. Executive Security Summary
The In-House VBC Media SDK eliminates external threat surfaces associated with third-party media brokers by executing all searches client-side and distributing immutable, cryptographically verified assets exclusively through first-party CDN endpoints.

---

## 2. Threat Vector Comparison

| Threat Vector | Legacy Vendor Architecture (GIPHY / Tenor) | In-House VBC Media Platform Architecture |
| :--- | :--- | :--- |
| **Search Query Telemetry Leakage** | **CRITICAL RISK:** User search strings (e.g., project names, executive reactions) sent to external vendor ad servers. | **ZERO RISK:** 100% in-memory search on-device. Zero search network calls. |
| **Client Credential Exposure** | **HIGH RISK:** Hardcoded vendor API keys bundled inside mobile binaries (`.apk` / `.ipa`). | **ZERO RISK:** No API keys or tokens required for static edge delivery. |
| **Intune MAM Boundary Breach** | **HIGH RISK:** Mobile clients fail Microsoft Intune network isolation policies; require third-party firewall whitelisting. | **ZERO RISK:** 100% first-party domain traffic (`media.vbc.vonage.com`). |
| **Malicious Payload Injection (Polyglots)** | **MEDIUM RISK:** Vendor CDNs may serve image/HTML or script polyglots. | **MITIGATED:** Ingestion re-encodes raw pixel data; served with `X-Content-Type-Options: nosniff` and `default-src 'none'`. |
| **MMS Carrier Attachment Rejection** | **FREQUENT (VMMT-949):** Assets >500 KB cause carrier network drops. | **PREVENTED:** Hard build-time gate rejects any asset >450 KB. |
| **Availability / SPOF Outage (INC-909)** | **VENDOR-DEPENDENT:** Contract/key expiration causes production outage. | **HIGH AVAILABILITY:** Cached static CDN with 99.99%+ SLA; offline fallback. |

---

## 3. Defense-in-Depth Pipeline Controls

### A. Anti-Polyglot Ingestion Pipeline
1. Source assets are downloaded only from verified upstream endpoints.
2. Binary streams are processed to extract raw decoded bitmap frames.
3. Frames are re-encoded into clean Animated WebP and fallback GIF streams with all EXIF metadata and custom application blocks stripped.
4. SHA-256 cryptographic hashes are calculated on final outputs and registered in `licenses-sbom.json`.

### B. Microsoft Intune & Zero-Trust Compliance
- Because the SDK requires zero runtime authentication to external services, Intune Mobile Application Management (MAM) policies on iOS and Android can be configured with strict network boundaries without encountering proxy or VPN failures.
- Bundling fallback assets directly within the client application ensures complete offline operational capability.
