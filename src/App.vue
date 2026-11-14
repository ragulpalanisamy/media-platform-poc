<template>
  <div class="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
    <!-- Top Executive Header Banner -->
    <header class="bg-slate-900 border-b border-slate-800 px-5 pt-3 pb-2 shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3.5">
          <div class="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
            <span class="text-base">⚡</span>
            <span class="font-extrabold text-xs tracking-wider text-sky-400">VONAGE</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <h1 class="m-0 text-base font-bold text-slate-50">VBC In-House Media Platform & Cross-Platform SDK</h1>
            <p class="m-0 text-xs text-slate-400">
              Senior Architect Architecture Proposal • Zero 3rd-Party Feeds • Zero Query Leakage • Vercel / AWS CloudFront Ready
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- One-Click Auto-Demo Benchmark Button -->
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-gradient-to-br from-indigo-600 to-sky-500 border border-white/20 shadow-md transition-all duration-150 hover:from-indigo-700 hover:to-sky-600 hover:-translate-y-0.5 hover:shadow-indigo-500/30 disabled:opacity-85 disabled:cursor-wait"
            :class="{ 'animate-pulse ring-2 ring-sky-400/50': isDemoRunning }"
            :disabled="isDemoRunning"
            title="Automatically run benchmark multi-token search and stream reactions into chat"
            @click="triggerAutoDemo"
          >
            <span class="text-sm">⚡</span>
            <span>{{ isDemoRunning ? 'Running Live Benchmark...' : 'Run Live Search & Audit Demo' }}</span>
          </button>
          <a
            href="/cdn/v1/catalog.json"
            target="_blank"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-slate-300 bg-slate-800 border border-slate-700 no-underline transition-all duration-150 hover:bg-slate-700 hover:text-white"
            title="Inspect first-party catalog JSON"
          >
            <span>🌐</span>
            <span>Edge Catalog JSON</span>
          </a>
          <a
            href="/cdn/v1/licenses-sbom.json"
            target="_blank"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-slate-300 bg-slate-800 border border-slate-700 no-underline transition-all duration-150 hover:bg-slate-700 hover:text-white"
            title="Inspect cryptographic SBOM"
          >
            <span>📜</span>
            <span>Audit SBOM</span>
          </a>
        </div>
      </div>

      <!-- Executive Metric Bar -->
      <div class="flex items-center gap-3 mt-2 pt-2 border-t border-white/5 text-xs">
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500"></span>
          <span class="text-slate-400">Vendor Outage Risk:</span>
          <strong class="text-emerald-400 font-semibold">0% (Resolves INC-909)</strong>
        </div>
        <div class="text-slate-700 text-xs">|</div>
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500"></span>
          <span class="text-slate-400">Carrier MMS Cap:</span>
          <strong class="text-emerald-400 font-semibold">&lt;450 KB Gate (Resolves VMMT-949)</strong>
        </div>
        <div class="text-slate-700 text-xs">|</div>
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400"></span>
          <span class="text-slate-400">Monthly TCO:</span>
          <strong class="text-sky-400 font-semibold">~$35–$50/mo (vs $5k+ GIPHY)</strong>
        </div>
        <div class="text-slate-700 text-xs">|</div>
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500"></span>
          <span class="text-slate-400">US Corporate Legal Audit:</span>
          <strong class="text-purple-400 font-semibold">100% CC-BY & Apache-2.0 Provenance</strong>
        </div>
      </div>
    </header>

    <!-- Main Split-Screen Workspace -->
    <main class="flex-1 flex gap-4 px-5 pt-3.5 pb-4 overflow-hidden">
      <!-- Left Column: VBC Chat Client -->
      <section class="basis-5/12 flex flex-col overflow-hidden">
        <div class="flex justify-between items-center mb-2 text-xs">
          <span class="text-sky-400 font-bold tracking-wide">COLUMN 1: VBC CHAT CLIENT (LIVE SDK)</span>
          <span class="text-slate-500">● Interactive Vue Component</span>
        </div>
        <div class="flex-1 overflow-hidden">
          <VbcChatSimulator
            ref="chatSimRef"
            @asset-inspected="onAssetInspected"
            @telemetry-updated="onTelemetryUpdated"
          />
        </div>
      </section>

      <!-- Right Column: Architect Inspector & Compliance Hub -->
      <section class="flex-1 flex flex-col overflow-hidden">
        <div class="flex justify-between items-center mb-2 text-xs">
          <span class="text-emerald-400 font-bold tracking-wide">COLUMN 2: ARCHITECT INSPECTOR (PROOF)</span>
          <span class="text-slate-500">● Real-time Telemetry & Code Gen</span>
        </div>
        <div class="flex-1 overflow-hidden">
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

const chatSimRef = ref<InstanceType<typeof VbcChatSimulator> | null>(null);
const isDemoRunning = ref<boolean>(false);

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

async function triggerAutoDemo() {
  if (isDemoRunning.value) return;
  isDemoRunning.value = true;
  try {
    if (chatSimRef.value?.runAutoDemo) {
      await chatSimRef.value.runAutoDemo(['lgtm', 'congrats', 'launch', 'coffee', 'thanks'], 650);
    }
  } catch (err) {
    console.warn('Auto demo error:', err);
  } finally {
    isDemoRunning.value = false;
  }
}
</script>
