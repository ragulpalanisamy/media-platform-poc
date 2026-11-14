<template>
  <div class="app-root">
    <!-- Top Executive Header Banner -->
    <header class="app-header">
      <div class="header-main-row">
        <div class="brand-group">
          <div class="brand-badge">
            <span class="brand-icon">⚡</span>
            <span class="brand-company">VONAGE</span>
          </div>
          <div class="brand-titles">
            <h1 class="main-title">VBC In-House Media Platform & Cross-Platform SDK</h1>
            <p class="sub-title">
              Senior Architect Architecture Proposal • Zero 3rd-Party Feeds • Zero Query Leakage • Vercel / AWS CloudFront Ready
            </p>
          </div>
        </div>

        <div class="header-cta-group">
          <a
            href="/cdn/v1/catalog.json"
            target="_blank"
            class="header-action-btn"
            title="Inspect first-party catalog JSON"
          >
            <span>🌐</span>
            <span>Edge Catalog JSON</span>
          </a>
          <a
            href="/cdn/v1/licenses-sbom.json"
            target="_blank"
            class="header-action-btn"
            title="Inspect cryptographic SBOM"
          >
            <span>📜</span>
            <span>Audit SBOM</span>
          </a>
        </div>
      </div>

      <!-- Executive Metric Bar -->
      <div class="metric-ribbon">
        <div class="ribbon-item">
          <span class="ribbon-dot green"></span>
          <span class="ribbon-lbl">Vendor Outage Risk:</span>
          <strong class="ribbon-val green">0% (Resolves INC-909)</strong>
        </div>
        <div class="ribbon-separator">|</div>
        <div class="ribbon-item">
          <span class="ribbon-dot green"></span>
          <span class="ribbon-lbl">Carrier MMS Cap:</span>
          <strong class="ribbon-val green">&lt;450 KB Gate (Resolves VMMT-949)</strong>
        </div>
        <div class="ribbon-separator">|</div>
        <div class="ribbon-item">
          <span class="ribbon-dot cyan"></span>
          <span class="ribbon-lbl">Monthly TCO:</span>
          <strong class="ribbon-val cyan">~$35–$50/mo (vs $5k+ GIPHY)</strong>
        </div>
        <div class="ribbon-separator">|</div>
        <div class="ribbon-item">
          <span class="ribbon-dot purple"></span>
          <span class="ribbon-lbl">US Corporate Legal Audit:</span>
          <strong class="ribbon-val purple">100% CC-BY & Apache-2.0 Provenance</strong>
        </div>
      </div>
    </header>

    <!-- Main Split-Screen Workspace -->
    <main class="app-workspace">
      <!-- Left Column: VBC Chat Simulator -->
      <section class="workspace-column left-column">
        <div class="column-header-bar">
          <span class="col-pill">COLUMN 1: VBC CHAT CLIENT (LIVE SDK)</span>
          <span class="col-status">● Interactive Vue Component</span>
        </div>
        <div class="column-body">
          <VbcChatSimulator
            @asset-inspected="onAssetInspected"
            @telemetry-updated="onTelemetryUpdated"
          />
        </div>
      </section>

      <!-- Right Column: Architect Inspector & Compliance Hub -->
      <section class="workspace-column right-column">
        <div class="column-header-bar">
          <span class="col-pill cyan-pill">COLUMN 2: ARCHITECT INSPECTOR (PROOF)</span>
          <span class="col-status">● Real-time Telemetry & Code Gen</span>
        </div>
        <div class="column-body">
          <ArchitectInspector
            :inspected-asset="inspectedAsset"
            :telemetry="latestTelemetry"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { MediaAsset, SearchStats } from './sdk/types';
import VbcChatSimulator from './demo/VbcChatSimulator.vue';
import ArchitectInspector from './demo/ArchitectInspector.vue';

const inspectedAsset = ref<MediaAsset | null>({
  id: 'gif_1f680',
  title: 'Rocket Launch',
  type: 'gif',
  tags: ['rocket', 'launch', 'deploy', 'ship', 'fast'],
  categories: ['Workplace', 'Celebration', 'Launch & Hype'],
  searchText: 'rocket launch deploy ship fast workplace celebration launch & hype gif',
  thumbUrl: '/cdn/v1/assets/noto_1f680.webp',
  fullUrl: '/cdn/v1/assets/noto_1f680.gif',
  byteSize: 68420,
  width: 512,
  height: 512,
  mimeType: 'image/gif',
  mmsCompliant: true,
  license: 'CC-BY-4.0',
  sha256: '928e1c6b840fa5e8c1b3f9d45e07a12384f509e13b8f10ca24e65b7931f82c01'
});

const latestTelemetry = ref<SearchStats | null>({
  query: 'rocket',
  latencyMs: 0.14,
  resultCount: 60,
  totalScanned: 60,
  externalNetworkCalls: 0
});

function onAssetInspected(asset: MediaAsset) {
  inspectedAsset.value = asset;
}

function onTelemetryUpdated(stats: SearchStats) {
  latestTelemetry.value = stats;
}
</script>

<style scoped>
.app-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: #090c13;
  color: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  overflow: hidden;
}

/* Header */
.app-header {
  background: #0f1422;
  border-bottom: 1px solid #1e2638;
  padding: 12px 20px 8px;
  flex-shrink: 0;
}

.header-main-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-badge {
  background: #182238;
  border: 1px solid #283758;
  border-radius: 8px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.brand-icon {
  font-size: 16px;
}

.brand-company {
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 1.5px;
  color: #38bdf8;
}

.brand-titles {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.main-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #f8fafc;
}

.sub-title {
  margin: 0;
  font-size: 11.5px;
  color: #94a3b8;
}

.header-cta-group {
  display: flex;
  gap: 8px;
}

.header-action-btn {
  background: #182238;
  border: 1px solid #283758;
  color: #cbd5e1;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11.5px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;
}

.header-action-btn:hover {
  background: #233150;
  color: #ffffff;
}

/* Metric Ribbon */
.metric-ribbon {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 11px;
}

.ribbon-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ribbon-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.ribbon-dot.green {
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
}

.ribbon-dot.cyan {
  background: #38bdf8;
  box-shadow: 0 0 6px #38bdf8;
}

.ribbon-dot.purple {
  background: #a855f7;
  box-shadow: 0 0 6px #a855f7;
}

.ribbon-lbl {
  color: #94a3b8;
}

.ribbon-val.green {
  color: #34d399;
}

.ribbon-val.cyan {
  color: #38bdf8;
}

.ribbon-val.purple {
  color: #c084fc;
}

.ribbon-separator {
  color: #334155;
  font-size: 10px;
}

/* Workspace */
.app-workspace {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 14px 20px 18px;
  overflow: hidden;
}

.workspace-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.left-column {
  max-width: 46%;
}

.right-column {
  flex: 1;
}

.column-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 11px;
}

.col-pill {
  color: #38bdf8;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.cyan-pill {
  color: #34d399;
}

.col-status {
  color: #64748b;
}

.column-body {
  flex: 1;
  overflow: hidden;
}
</style>
