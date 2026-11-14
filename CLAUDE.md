# CLAUDE.md — In-House Media SDK & Executive Demo PoC

> **Canonical Config:** The official agent rules, settings, and skills are maintained under [`.claude/`](./.claude/).
> - Agent Constitution: [`.claude/CLAUDE.md`](./.claude/CLAUDE.md)
> - Platform Settings: [`.claude/settings.json`](./.claude/settings.json)
> - Engineering Skills: [`.claude/skills/media-platform/SKILL.md`](./.claude/skills/media-platform/SKILL.md)

---

## Operating Principles (Karpathy Guidelines)
1. **Think Before Coding:** Verify contracts against `ARCHITECTURE.md` before making edits.
2. **Simplicity First:** Flat TypeScript and Vue SFCs. Zero speculative abstractions or external proxy dependencies.
3. **Surgical Changes:** Modify only required modules; clean up after each phase.
4. **Goal-Driven Execution:** Loop until `npm run verify` exits with code 0.

## VBC Non-Negotiable Compliance Gates
- **100% First-Party Delivery:** Zero calls to GIPHY, Tenor, or external ad-tech APIs.
- **Hard 450 KB MMS Cap:** Enforced at build time for cellular MMS compliance (`VMMT-949`).
- **Cryptographic Provenance:** Every asset registered in `licenses-sbom.json` with SHA-256 and approved SPDX license (`CC-BY-4.0`, `Apache-2.0`, `CC0-1.0`).
