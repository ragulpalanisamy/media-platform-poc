<template>
  <div
    class="vbc-picker-container"
    :class="[theme === 'light' ? 'theme-light' : 'theme-dark']"
    @click.stop
  >
    <!-- Picker Header -->
    <div class="picker-header">
      <div class="search-bar-wrapper">
        <span class="search-icon">🔍</span>
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          placeholder="Search GIFs, stickers, emojis..."
          class="picker-search-input"
          @input="onSearchInput"
        />
        <button
          v-if="searchQuery"
          class="search-clear-btn"
          title="Clear search"
          @click="clearSearch"
        >
          ✕
        </button>
      </div>

      <!-- Telemetry indicator pill -->
      <div class="telemetry-pill">
        <span class="dot-indicator"></span>
        <span class="telemetry-text">{{ searchLatencyMs }}ms • Zero Leakage</span>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="tabs-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="selectTab(tab.id)"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
        <span v-if="tab.id === 'recents' && recentsCount > 0" class="badge-count">{{ recentsCount }}</span>
      </button>
    </div>

    <!-- Category Pills (Only visible when not on Recents) -->
    <div v-if="activeTab !== 'recents'" class="category-pills-bar">
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
      <!-- Loading State -->
      <div v-if="isLoading" class="state-message">
        <div class="spinner"></div>
        <p>Loading curated catalog...</p>
      </div>

      <!-- Empty / Zero Results State -->
      <div v-else-if="displayItems.length === 0" class="state-message">
        <span class="empty-icon">📂</span>
        <p class="empty-title">
          {{ activeTab === 'recents' ? 'No recent assets yet' : 'No matching workplace assets' }}
        </p>
        <p class="empty-sub">
          {{ activeTab === 'recents' ? 'Assets you send will appear here for fast 1-click access.' : 'Try searching for "rocket", "thumbs", "coffee", or "clap".' }}
        </p>
      </div>

      <!-- Asset Items -->
      <div
        v-for="asset in displayItems"
        v-else
        :key="asset.id"
        class="asset-card"
        :class="{ 'emoji-card': asset.type === 'emoji' }"
        :title="`${asset.title} • ${(asset.byteSize / 1024).toFixed(1)} KB • ${asset.license}`"
        @click="handleAssetClick(asset)"
      >
        <!-- Emoji Render -->
        <span v-if="asset.type === 'emoji'" class="emoji-glyph">
          {{ asset.thumbUrl }}
        </span>

        <!-- WebP / GIF Image Render -->
        <div v-else class="media-thumb-wrapper">
          <img
            :src="asset.thumbUrl"
            :alt="asset.title"
            loading="lazy"
            class="media-thumb-img"
          />
          <div class="asset-meta-overlay">
            <span class="mms-badge">
              {{ (asset.byteSize / 1024).toFixed(0) }}KB
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Picker Footer -->
    <div class="picker-footer">
      <div class="footer-license">
        <span class="shield-icon">🛡️</span>
        <span>100% In-House • CC-BY & Apache-2.0 • MMS Safe</span>
      </div>
      <button
        v-if="hasCloseBtn"
        class="footer-close-btn"
        @click="$emit('close')"
      >
        Close
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { MediaAsset, MediaType, SearchStats } from './types';
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

const core = new VbcMediaCore(props.baseUrl);

type TabId = 'all' | 'gif' | 'sticker' | 'emoji' | 'recents';

interface TabItem {
  id: TabId;
  label: string;
  icon: string;
}

const tabs: TabItem[] = [
  { id: 'all', label: 'All', icon: '✨' },
  { id: 'gif', label: 'GIFs', icon: '🎬' },
  { id: 'sticker', label: 'Stickers', icon: '🎨' },
  { id: 'emoji', label: 'Emoji', icon: '😀' },
  { id: 'recents', label: 'Recents', icon: '🕒' }
];

const activeTab = ref<TabId>('all');
const activeCategory = ref<string>('All');
const searchQuery = ref<string>('');
const searchLatencyMs = ref<number>(0.12);
const isLoading = ref<boolean>(true);
const recentsList = ref<MediaAsset[]>([]);
const searchInputRef = ref<HTMLInputElement | null>(null);

let debounceTimer: any = null;

const recentsCount = computed(() => recentsList.value.length);

const availableCategories = computed(() => {
  return ['All', 'Workplace', 'Reactions', 'Celebration', 'Approval', 'Communication'];
});

const gridClass = computed(() => {
  if (activeTab.value === 'emoji') return 'grid-emojis';
  return 'grid-media';
});

// Display results based on active tab, search query, and category
const displayItems = computed<MediaAsset[]>(() => {
  if (activeTab.value === 'recents') {
    if (!searchQuery.value.trim()) {
      return recentsList.value;
    }
    const q = searchQuery.value.trim().toLowerCase();
    return recentsList.value.filter(
      item => item.title.toLowerCase().includes(q) || item.tags.some(t => t.includes(q))
    );
  }

  const typeParam: MediaType | 'all' =
    activeTab.value === 'all' ? 'all' : (activeTab.value as MediaType);

  const { items, stats } = core.search(
    searchQuery.value,
    typeParam,
    activeCategory.value
  );

  // Filter out any asset exceeding max MMS bytes ceiling
  return items.filter(i => i.byteSize <= props.maxMmsBytes);
});

function refreshRecents() {
  recentsList.value = core.getRecents();
}

function selectTab(tabId: TabId) {
  activeTab.value = tabId;
  if (tabId === 'recents') {
    refreshRecents();
  }
}

function selectCategory(cat: string) {
  activeCategory.value = cat;
}

function clearSearch() {
  searchQuery.value = '';
  triggerSearch();
  if (searchInputRef.value) {
    searchInputRef.value.focus();
  }
}

function onSearchInput() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    triggerSearch();
  }, 80);
}

function triggerSearch() {
  const typeParam: MediaType | 'all' =
    activeTab.value === 'all' || activeTab.value === 'recents'
      ? 'all'
      : (activeTab.value as MediaType);

  const { stats } = core.search(
    searchQuery.value,
    typeParam,
    activeCategory.value
  );

  searchLatencyMs.value = stats.latencyMs;
  emit('search-telemetry', stats);
}

function handleAssetClick(asset: MediaAsset) {
  core.recordRecent(asset);
  refreshRecents();
  emit('select', asset);
}

onMounted(async () => {
  await core.initialize();
  refreshRecents();
  isLoading.value = false;
  triggerSearch();
});

watch(
  () => props.baseUrl,
  async (newUrl) => {
    isLoading.value = true;
    const newCore = new VbcMediaCore(newUrl);
    await newCore.initialize();
    isLoading.value = false;
  }
);
</script>

<style scoped>
.vbc-picker-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 420px;
  height: 520px;
  border-radius: 12px;
  box-shadow: 0 18px 40px -10px rgba(0, 0, 0, 0.45), 0 0 1px 1px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  user-select: none;
  transition: all 0.2s ease;
}

/* Dark Theme */
.theme-dark {
  background: #11141c;
  color: #f1f5f9;
  border: 1px solid #1e2638;
}

/* Light Theme */
.theme-light {
  background: #ffffff;
  color: #0f172a;
  border: 1px solid #e2e8f0;
}

/* Header & Search */
.picker-header {
  padding: 12px 14px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.theme-light .picker-header {
  border-bottom-color: rgba(0, 0, 0, 0.06);
}

.search-bar-wrapper {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 0 10px;
  height: 38px;
  transition: border-color 0.15s ease;
}

.theme-light .search-bar-wrapper {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.search-bar-wrapper:focus-within {
  border-color: #38bdf8;
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
}

.search-icon {
  font-size: 14px;
  opacity: 0.6;
  margin-right: 8px;
}

.picker-search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: inherit;
  font-size: 13.5px;
}

.search-clear-btn {
  background: none;
  border: none;
  color: inherit;
  opacity: 0.5;
  cursor: pointer;
  padding: 4px;
  font-size: 12px;
}

.search-clear-btn:hover {
  opacity: 1;
}

.telemetry-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 2px 8px;
  background: rgba(16, 185, 129, 0.12);
  border-radius: 9999px;
  font-size: 10.5px;
  color: #34d399;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.theme-light .telemetry-pill {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}

.dot-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
}

/* Tabs */
.tabs-nav {
  display: flex;
  padding: 6px 12px 0;
  gap: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.theme-light .tabs-nav {
  border-bottom-color: rgba(0, 0, 0, 0.06);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 12.5px;
  font-weight: 500;
  padding: 8px 4px 10px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  color: #e2e8f0;
}

.theme-light .tab-btn:hover {
  color: #334155;
}

.tab-btn.active {
  color: #38bdf8;
  border-bottom-color: #38bdf8;
}

.badge-count {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 10px;
}

/* Category Pills */
.category-pills-bar {
  display: flex;
  gap: 6px;
  padding: 8px 12px;
  overflow-x: auto;
  scrollbar-width: none;
}

.category-pills-bar::-webkit-scrollbar {
  display: none;
}

.cat-pill {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  color: #94a3b8;
  font-size: 11.5px;
  padding: 3px 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.theme-light .cat-pill {
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #64748b;
}

.cat-pill:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
}

.cat-pill.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
}

/* Body & Grid */
.picker-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px 12px;
}

.grid-media {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.grid-emojis {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

/* Card Styling */
.asset-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.15s ease, border-color 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-light .asset-card {
  background: #f8fafc;
  border-color: #f1f5f9;
}

.asset-card:hover {
  transform: translateY(-2px);
  border-color: #38bdf8;
  box-shadow: 0 4px 12px rgba(56, 189, 248, 0.15);
}

.media-thumb-wrapper {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 4px;
}

.media-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: auto;
}

.asset-meta-overlay {
  position: absolute;
  bottom: 3px;
  right: 3px;
  opacity: 0;
  transition: opacity 0.15s;
}

.asset-card:hover .asset-meta-overlay {
  opacity: 1;
}

.mms-badge {
  background: rgba(15, 23, 42, 0.85);
  color: #38bdf8;
  font-size: 9px;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: ui-monospace, monospace;
}

/* Emoji Glyph */
.emoji-card {
  aspect-ratio: 1;
  font-size: 24px;
}

.emoji-card:hover {
  background: rgba(56, 189, 248, 0.15);
}

/* State Messages */
.state-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #64748b;
  padding: 30px 20px;
}

.empty-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.empty-title {
  font-weight: 600;
  color: #94a3b8;
  font-size: 14px;
  margin: 0 0 4px;
}

.empty-sub {
  font-size: 12px;
  max-width: 260px;
  margin: 0;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(56, 189, 248, 0.2);
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Footer */
.picker-footer {
  padding: 8px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: #64748b;
}

.theme-light .picker-footer {
  border-top-color: rgba(0, 0, 0, 0.06);
}

.footer-license {
  display: flex;
  align-items: center;
  gap: 5px;
}

.footer-close-btn {
  background: none;
  border: none;
  color: inherit;
  font-size: 11px;
  cursor: pointer;
  text-decoration: underline;
}
</style>
