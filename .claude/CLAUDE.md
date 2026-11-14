# CLAUDE.md — VBC In-House Media SDK & Executive Demo PoC

## Part 1: Karpathy Coding Agent Operating Principles
Derived from `multica-ai/andrej-karpathy-skills`:

### 1. Think Before Coding
- **State assumptions explicitly:** Before implementing a module, verify data shapes against `ARCHITECTURE.md`.
- **Surface tradeoffs:** If an implementation choice impacts bundle size, MMS byte limits, or legal auditability, state it immediately.
- **No silent fallbacks to third-party APIs:** Never add runtime calls to GIPHY, Tenor, KLIPY, or external CDNs.

### 2. Simplicity First
- **Minimum code that solves the problem:** Write clean, flat TypeScript and Vue SFCs. If 200 lines can be 60 lines, write 60 lines.
- **Zero speculative abstractions:** Do not build plugin registries, complex state machines, Pinia/Vuex stores, or GraphQL layers. A single headless class (`VbcMediaCore`) + 1 Vue component (`VbcMediaPicker.vue`) is sufficient.
- **Minimal dependencies:** Use only `vue`, `vite`, `@vitejs/plugin-vue`, and `typescript`. Implement prefix/tag search in native TypeScript—do not install heavy search libraries if native array scoring suffices.

### 3. Surgical Changes
- **Touch only what the phase requires:** Follow `PLAN.md` phase-by-phase.
- **Clean up your own mess:** Remove unused imports, temporary logs, or dead CSS before marking a phase complete.

### 4. Goal-Driven Execution
- **Loop until verified:** Every phase in `PLAN.md` ends with a `Verification Command`. You MUST run the verification command in the terminal, inspect the output, and fix any failures before proceeding to the next phase.

---

## Part 2: Non-Negotiable Project Guardrails (VBC Enterprise Compliance)
1. **100% First-Party Runtime:** Once `npm run build:catalog` completes, the browser app must make **ZERO** external network requests (`fonts.gstatic.com`, `giphy.com`, etc.). All assets must resolve from local `/cdn/v1/...` paths served by Vercel Edge.
2. **Hard 450 KB MMS Ceiling (Fixes VMMT-949):** Every asset included in `/public/cdn/v1/assets/` and `/public/cdn/v1/catalog.json` MUST be strictly `<= 460,800` bytes (450 KB).
3. **US Corporate Legal Auditability (SBOM):** Every asset in `catalog.json` must have a matching cryptographic SHA-256 entry in `/public/cdn/v1/licenses-sbom.json` with an approved SPDX license (`CC-BY-4.0` or `Apache-2.0`).
4. **Zero Exposed Keys (Fixes INC-909):** No API keys, tokens, or secrets in client code or environment variables.
