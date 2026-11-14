<template>
  <div
    class="vbc-picker-container"
    :class="[theme === 'light' ? 'theme-light' : 'theme-dark']"
    @click.stop
  >
    <!-- Picker Header -->
    <div class="picker-header">
      <div class="search-bar-wrapper">
        <svg class="search-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          placeholder="Search GIFs, stickers, emojis..."
          class="picker-search-input"
          autocomplete="off"
          spellcheck="false"
          @input="onSearchInput"
        />
        <button
          v-if="searchQuery"
          class="search-clear-btn"
          title="Clear search"
          aria-label="Clear search query"
          @click="clearSearch"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
        <div class="telemetry-inline">
          <span class="live-dot"></span>
          <span>{{ searchLatencyMs }}ms</span>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="tabs-nav" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        role="tab"
        :aria-selected="activeTab === tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="selectTab(tab.id)"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
        <span v-if="tab.id === 'recents' && recentsCount > 0" class="badge-count">{{ recentsCount }}</span>
      </button>
    </div>

    <!-- Category Pills -->
    <div v-if="activeTab !== 'recents' && activeTab !== 'emoji'" class="category-pills-bar">
      <button
        v-for="cat in availableCategories"
        :key="cat"
        class="cat-pill"
        :class="{ active: activeCategory === cat }"
        @click="selectCategory(cat)"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Media Grid Content -->
    <div class="picker-body" :class="gridClass">
      <!-- Loading Skeleton -->
      <template v-if="isLoading">
        <div v-for="n in 9" :key="'skel-'+n" class="skeleton-card">
          <div class="skeleton-shimmer"></div>
        </div>
      </template>

      <!-- Empty State -->
      <div v-else-if="displayItems.length === 0" class="state-message">
        <div class="empty-visual">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8 11h6" stroke-linecap="round"/></svg>
        </div>
        <p class="empty-title">
          {{ activeTab === 'recents' ? 'No recent selections' : 'No results found' }}
        </p>
        <p class="empty-sub">
          {{ activeTab === 'recents'
            ? 'Tap any GIF, sticker, or emoji to start building your recents.'
            : `Try "rocket", "fire", "thumbs", or "heart"` }}
        </p>
      </div>

      <!-- Asset Items -->
      <template v-else>
        <div
          v-for="asset in displayItems"
          :key="asset.id"
          class="asset-card"
          :class="{
            'emoji-card': asset.type === 'emoji'
          }"
          :title="`${asset.title} • ${formatKB(asset.byteSize)} • ${asset.license}`"
          @click="handleAssetClick(asset)"
        >
          <!-- Emoji Render -->
          <span v-if="asset.type === 'emoji'" class="emoji-glyph">
            {{ asset.thumbUrl }}
          </span>

          <!-- GIF / Sticker Image -->
          <div v-else class="media-thumb-wrapper">
            <div v-if="!loadedImages.has(asset.id)" class="img-placeholder">
              <div class="placeholder-shimmer"></div>
            </div>
            <img
              :src="asset.thumbUrl"
              :alt="asset.title"
              loading="lazy"
              decoding="async"
              width="512"
              height="512"
              class="media-thumb-img"
              :class="{ 'img-loaded': loadedImages.has(asset.id) }"
              @load="onImageLoaded(asset.id)"
            />
            <div class="asset-hover-overlay">
              <span class="hover-title">{{ asset.title }}</span>
              <span class="hover-meta">{{ formatKB(asset.byteSize) }} · MMS Safe</span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Picker Footer -->
    <div class="picker-footer">
      <div class="footer-left">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>1st-Party CDN · CC-BY-4.0 · Zero Leakage</span>
      </div>
      <button
        v-if="hasCloseBtn"
        class="footer-close-btn"
        @click="$emit('close')"
      >
        ✕ Close
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import type { MediaAsset, SearchStats } from './types';
import { VbcMediaCore } from './vbc-media-core';

interface Props {
  baseUrl?: string;
  maxMmsBytes?: number;
  theme?: 'dark' | 'light';
  hasCloseBtn?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  baseUrl: '/cdn/v1',
  maxMmsBytes: 460800,
  theme: 'dark',
  hasCloseBtn: false
});

const emit = defineEmits<{
  (e: 'select', asset: MediaAsset): void;
  (e: 'search-telemetry', stats: SearchStats): void;
  (e: 'close'): void;
}>();

let core = new VbcMediaCore(props.baseUrl);

type TabId = 'all' | 'gif' | 'sticker' | 'emoji' | 'recents';

const tabs = [
  { id: 'all' as TabId, label: 'Trending', icon: '🔥' },
  { id: 'gif' as TabId, label: 'GIFs', icon: '🎬' },
  { id: 'sticker' as TabId, label: 'Stickers', icon: '✨' },
  { id: 'emoji' as TabId, label: 'Emoji', icon: '😀' },
  { id: 'recents' as TabId, label: 'Recent', icon: '🕒' }
];

const activeTab = ref<TabId>('all');
const activeCategory = ref<string>('All');
const searchQuery = ref<string>('');
const searchLatencyMs = ref<number>(0.05);
const isLoading = ref<boolean>(true);
const isInitialized = ref<boolean>(false);
const recentsList = ref<MediaAsset[]>([]);
const searchInputRef = ref<HTMLInputElement | null>(null);
const loadedImages = reactive(new Set<string>());

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const recentsCount = computed(() => recentsList.value.length);

const availableCategories = ['All', 'Approval', 'Celebration', 'Launch & Hype', 'Reactions', 'Gratitude', 'Work & Coffee'];

const gridClass = computed(() => {
  return activeTab.value === 'emoji' ? 'grid-emojis' : 'grid-media';
});

const displayItems = computed<MediaAsset[]>(() => {
  if (!isInitialized.value) return [];

  const { items } = core.search({
    query: searchQuery.value,
    type: activeTab.value,
    category: activeCategory.value
  });
  return items.filter(i => i.byteSize <= props.maxMmsBytes);
});

function formatKB(bytes: number): string {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function onImageLoaded(id: string) {
  loadedImages.add(id);
}

function refreshRecents() {
  recentsList.value = core.getRecents();
}

function selectTab(tabId: TabId) {
  activeTab.value = tabId;
  if (tabId === 'recents') refreshRecents();
  triggerSearch();
}

function selectCategory(cat: string) {
  activeCategory.value = cat;
  triggerSearch();
}

function clearSearch() {
  searchQuery.value = '';
  triggerSearch();
  searchInputRef.value?.focus();
}

function onSearchInput() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => triggerSearch(), 40);
}

function triggerSearch() {
  const { stats } = core.search({
    query: searchQuery.value,
    type: activeTab.value,
    category: activeCategory.value
  });
  searchLatencyMs.value = stats.latencyMs;
  emit('search-telemetry', stats);
}

function handleAssetClick(asset: MediaAsset) {
  core.recordRecent(asset);
  refreshRecents();
  emit('select', asset);
}

onMounted(async () => {
  await core.init();
  isInitialized.value = true;
  refreshRecents();
  isLoading.value = false;
  triggerSearch();
});

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
});

watch(() => props.baseUrl, async (newUrl) => {
  isLoading.value = true;
  isInitialized.value = false;
  core = new VbcMediaCore(newUrl);
  await core.init();
  isInitialized.value = true;
  isLoading.value = false;
  triggerSearch();
});
</script>

<style scoped>
.vbc-picker-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 440px;
  height: 540px;
  border-radius: 16px;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  user-select: none;
  contain: layout style;
}

.theme-dark {
  background: rgba(15, 18, 28, 0.98);
  color: #f1f5f9;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 24px 64px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05);
  backdrop-filter: blur(24px);
}

.theme-light {
  background: rgba(255,255,255,0.98);
  color: #0f172a;
  border: 1px solid #e2e8f0;
  box-shadow: 0 24px 64px -12px rgba(0,0,0,0.15);
}

/* ─── Header ─── */
.picker-header {
  padding: 14px 16px 10px;
}

.search-bar-wrapper {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 0 12px;
  height: 42px;
  gap: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.theme-light .search-bar-wrapper {
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.search-bar-wrapper:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
}

.search-icon-svg { opacity: 0.45; flex-shrink: 0; }

.picker-search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: inherit;
  font-size: 14px;
  font-weight: 450;
  letter-spacing: -0.01em;
}

.picker-search-input::placeholder {
  color: #64748b;
}

.search-clear-btn {
  background: rgba(255,255,255,0.08);
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  transition: background 0.15s;
}

.search-clear-btn:hover {
  background: rgba(255,255,255,0.15);
  color: #f1f5f9;
}

.telemetry-inline {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  color: #10b981;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-weight: 500;
  white-space: nowrap;
}

.live-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ─── Tabs ─── */
.tabs-nav {
  display: flex;
  padding: 0 14px;
  gap: 2px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.theme-light .tabs-nav { border-bottom-color: #f1f5f9; }

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 12.5px;
  font-weight: 600;
  padding: 9px 4px 11px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
  letter-spacing: -0.01em;
}

.tab-btn:hover { color: #cbd5e1; }
.theme-light .tab-btn:hover { color: #475569; }

.tab-btn.active {
  color: #818cf8;
  border-bottom-color: #818cf8;
}

.tab-icon { font-size: 13px; }

.badge-count {
  background: rgba(129,140,248,0.2);
  color: #818cf8;
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 700;
}

/* ─── Category Pills ─── */
.category-pills-bar {
  display: flex;
  gap: 6px;
  padding: 8px 14px;
  overflow-x: auto;
  scrollbar-width: none;
}

.category-pills-bar::-webkit-scrollbar { display: none; }

.cat-pill {
  flex-shrink: 0;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 999px;
  color: #94a3b8;
  font-size: 11.5px;
  font-weight: 500;
  padding: 4px 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.theme-light .cat-pill {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #64748b;
}

.cat-pill:hover {
  background: rgba(255,255,255,0.08);
  color: #e2e8f0;
}

.cat-pill.active {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
  box-shadow: 0 2px 8px rgba(99,102,241,0.3);
}

/* ─── Body & Grids ─── */
.picker-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 14px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.08) transparent;
}

.picker-body::-webkit-scrollbar { width: 4px; }
.picker-body::-webkit-scrollbar-track { background: transparent; }
.picker-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

.grid-media {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.grid-emojis {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}

/* ─── Skeleton Loading (GIPHY-Grade Shimmer) ─── */
.skeleton-card {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  position: relative;
}

.skeleton-shimmer {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.02) 0%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.02) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.theme-light .skeleton-shimmer {
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.03) 0%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(0, 0, 0, 0.03) 100%
  );
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* ─── Asset Cards ─── */
.asset-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  contain: layout style paint;
  transform: translateZ(0);
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s ease;
}

.theme-light .asset-card {
  background: #f8fafc;
}

.asset-card:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
  z-index: 2;
}

.asset-card:active {
  transform: scale(0.96);
  transition: transform 0.08s;
}

/* ── Media Image Wrapper (Progressive Shimmer + WebP Decode) ── */
.media-thumb-wrapper {
  width: 100%;
  height: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

.img-placeholder {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: 12px;
}

.placeholder-shimmer {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.02) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.02) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.theme-light .placeholder-shimmer {
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.02) 0%,
    rgba(0, 0, 0, 0.08) 50%,
    rgba(0, 0, 0, 0.02) 100%
  );
  background-size: 200% 100%;
}

.media-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 6px;
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.22s ease-out;
  transform: translateZ(0);
}

.media-thumb-img.img-loaded {
  opacity: 1;
}

/* ── Hover Overlay ── */
.asset-hover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 45%, transparent 70%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 10px;
  opacity: 0;
  transition: opacity 0.2s ease;
  border-radius: 12px;
}

.asset-card:hover .asset-hover-overlay {
  opacity: 1;
}

.hover-title {
  color: #fff;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.2;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}

.hover-meta {
  color: rgba(255,255,255,0.7);
  font-size: 10px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  margin-top: 2px;
}

/* ── Emoji Card ── */
.emoji-card {
  aspect-ratio: 1;
  font-size: 26px;
  border-radius: 10px;
  transition: background 0.15s, transform 0.1s;
}

.emoji-card:hover {
  background: rgba(129,140,248,0.15);
  transform: scale(1.15);
}

.emoji-card:active {
  transform: scale(0.9);
}

/* ─── Empty State ─── */
.state-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 30px 24px;
  gap: 8px;
}

.empty-visual {
  opacity: 0.3;
  margin-bottom: 4px;
}

.empty-title {
  font-weight: 600;
  color: #94a3b8;
  font-size: 14px;
  margin: 0;
}

.empty-sub {
  font-size: 12.5px;
  color: #64748b;
  max-width: 260px;
  margin: 0;
  line-height: 1.4;
}

/* ─── Footer ─── */
.picker-footer {
  padding: 8px 14px;
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10.5px;
  color: #475569;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.footer-close-btn {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: #94a3b8;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  padding: 3px 10px;
  border-radius: 6px;
  transition: all 0.15s;
}

.footer-close-btn:hover {
  background: rgba(255,255,255,0.1);
  color: #e2e8f0;
}
</style>
