<template>
  <div
    class="flex flex-col w-full max-w-110 h-135 rounded-2xl overflow-hidden font-sans select-none shadow-2xl backdrop-blur-xl"
    :class="theme === 'light' ? 'bg-white/95 text-slate-900 border border-slate-200' : 'bg-slate-950/95 text-slate-100 border border-slate-800'"
    @click.stop
  >
    <!-- Picker Header -->
    <div class="p-3 px-3.5 pb-1.5 flex flex-col gap-2 shrink-0">
      <div
        class="flex items-center rounded-xl px-3 h-10 gap-2 border transition-all duration-150"
        :class="theme === 'light' ? 'bg-slate-100 border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20' : 'bg-white/5 border-white/10 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20'"
      >
        <svg class="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          placeholder="Search GIFs, stickers, emojis..."
          class="flex-1 bg-transparent border-0 outline-none text-sm font-normal tracking-tight placeholder-slate-400 text-inherit"
          autocomplete="off"
          spellcheck="false"
          @input="onSearchInput"
        />
        <button
          v-if="searchQuery"
          class="bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white p-1 rounded-md cursor-pointer transition-colors flex items-center justify-center border-0"
          title="Clear search"
          aria-label="Clear search query"
          @click="clearSearch"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
        <div class="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-medium whitespace-nowrap">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse"></span>
          <span>{{ searchLatencyMs }}ms</span>
        </div>
      </div>

      <!-- Trending Quick-Pills (One-Click Demo Power) -->
      <div class="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
        <button
          v-for="chip in TRENDING_CHIPS"
          :key="chip.query"
          class="shrink-0 text-xs font-medium py-1 px-2.5 rounded-full cursor-pointer transition-all duration-150 whitespace-nowrap border"
          :class="searchQuery.trim().toLowerCase() === chip.query
            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30'
            : (theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-indigo-500/15 hover:border-indigo-500/30 hover:text-indigo-200')"
          @click="toggleChip(chip.query)"
        >
          {{ chip.label }}
        </button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex px-3.5 gap-0.5 border-b border-white/10 shrink-0" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        role="tab"
        :aria-selected="activeTab === tab.id"
        class="flex-1 flex items-center justify-center gap-1.5 bg-transparent border-0 text-sm font-semibold py-2 px-1 pb-2.5 cursor-pointer border-b-2 transition-all tracking-tight"
        :class="activeTab === tab.id
          ? 'text-indigo-400 border-indigo-400'
          : (theme === 'light' ? 'text-slate-500 border-transparent hover:text-slate-800' : 'text-slate-400 border-transparent hover:text-slate-200')"
        @click="selectTab(tab.id)"
      >
        <span class="text-sm">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
        <span v-if="tab.id === 'recents' && recentsCount > 0" class="bg-indigo-400/20 text-indigo-400 rounded-full px-1.5 py-0.5 text-xs font-bold">{{ recentsCount }}</span>
      </button>
    </div>

    <!-- Category Pills -->
    <div v-if="activeTab !== 'recents' && activeTab !== 'emoji'" class="flex gap-1.5 px-3.5 py-1.5 overflow-x-auto scrollbar-none shrink-0">
      <button
        v-for="cat in availableCategories"
        :key="cat"
        class="shrink-0 rounded-full text-xs font-medium px-2.5 py-0.5 cursor-pointer transition-all duration-150 border"
        :class="activeCategory === cat
          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/30'
          : (theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200')"
        @click="selectCategory(cat)"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Media Grid Content -->
    <div
      class="flex-1 overflow-y-auto overflow-x-hidden p-2 px-3.5 pb-3"
      :class="activeTab === 'emoji' ? 'grid grid-cols-8 gap-1' : 'grid grid-cols-3 gap-2'"
    >
      <!-- Loading Skeleton (Initial Load) -->
      <template v-if="!isReady">
        <div v-for="n in 9" :key="'skel-'+n" class="aspect-square rounded-xl overflow-hidden bg-white/5 relative">
          <div class="w-full h-full animate-shimmer bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
        </div>
      </template>

      <!-- Empty State -->
      <div v-else-if="displayedItems.length === 0" class="col-span-full flex flex-col items-center justify-center h-full text-center py-6 px-5 gap-2">
        <div class="opacity-30 mb-1">
          <svg class="w-12 h-12 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8 11h6" stroke-linecap="round"/></svg>
        </div>
        <p class="font-semibold text-slate-400 text-sm m-0">
          {{ activeTab === 'recents' ? 'No recent selections' : 'No results found' }}
        </p>
        <p class="text-xs text-slate-500 max-w-70 m-0 leading-relaxed">
          {{ activeTab === 'recents'
            ? 'Tap any GIF, sticker, or emoji to start building your recents.'
            : `Try "lgtm", "congrats", "rocket", "coffee", or "thanks"` }}
        </p>
      </div>

      <!-- Asset Items (Batched Infinite Scroll) -->
      <template v-else>
        <div
          v-for="(asset, idx) in renderedItems"
          :key="asset.id"
          class="group relative aspect-square rounded-xl overflow-hidden cursor-pointer flex items-center justify-center select-none"
          :class="[
            asset.type === 'emoji' && 'text-2xl bg-white/5 rounded-lg hover:bg-indigo-500/20 hover:scale-110 active:scale-90 transition-all',
            asset.type === 'gif' && 'transition-all duration-150 hover:-translate-y-0.5 hover:scale-105 hover:shadow-xl hover:shadow-black/50 hover:z-10 active:scale-95',
            asset.type === 'sticker' && 'bg-checkerboard border border-white/5 transition-all duration-150 hover:scale-110 hover:shadow-xl hover:shadow-black/60 hover:z-20 active:scale-95'
          ]"
          :style="asset.type === 'gif' ? { background: getTileBackground(asset, idx) } : {}"
          :title="`${asset.title} • ${formatKB(asset.byteSize)} • ${asset.license}`"
          @click="handleAssetClick(asset)"
        >
          <!-- Emoji Render -->
          <span v-if="asset.type === 'emoji'" class="emoji-glyph">
            {{ asset.thumbUrl }}
          </span>

          <!-- GIF / Sticker Tile -->
          <div v-else class="w-full h-full aspect-square flex items-center justify-center relative">
            <!-- Shimmer placeholder while loading image -->
            <div v-if="!loadedMap[asset.id]" class="absolute inset-0 z-10 rounded-xl overflow-hidden">
              <div class="w-full h-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>

            <!-- GIF indicator pill -->
            <span v-if="asset.type === 'gif'" class="absolute top-1.5 left-1.5 bg-black/70 text-white text-xs font-extrabold tracking-wider px-1.5 py-0.5 rounded border border-white/15 z-10 backdrop-blur-sm">GIF</span>

            <!-- Progressive WebP Image -->
            <img
              :src="asset.thumbUrl"
              :alt="asset.title"
              loading="lazy"
              decoding="async"
              width="512"
              height="512"
              class="w-full h-full object-contain p-1.5 rounded-xl transition-all duration-200"
              :class="loadedMap[asset.id] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'"
              @load="loadedMap[asset.id] = true"
            />

            <!-- Bottom MMS Safe Hover Pill -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-xl z-20 pointer-events-none">
              <span class="text-white text-xs font-semibold leading-tight truncate drop-shadow">{{ asset.title }}</span>
              <span class="text-sky-400 text-xs font-mono mt-0.5 font-medium">{{ (asset.byteSize / 1024).toFixed(0) }} KB • MMS OK</span>
            </div>
          </div>
        </div>

        <!-- IntersectionObserver Sentinel for Infinite Scroll -->
        <div ref="sentinelRef" class="w-full h-5 col-span-full"></div>
      </template>
    </div>

    <!-- Picker Footer -->
    <div class="py-2 px-3.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 shrink-0">
      <div class="flex items-center gap-1.5">
        <svg class="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>1st-Party CDN · CC-BY-4.0 · Zero Leakage</span>
      </div>
      <button
        v-if="hasCloseBtn"
        class="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-medium py-0.5 px-2.5 rounded-md cursor-pointer transition-all"
        @click="$emit('close')"
      >
        ✕ Close
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
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

type TabType = 'gif' | 'sticker' | 'emoji' | 'recents';

const tabs = [
  { id: 'gif' as TabType, label: 'GIFs', icon: '🎬' },
  { id: 'sticker' as TabType, label: 'Stickers', icon: '✨' },
  { id: 'emoji' as TabType, label: 'Emoji', icon: '😀' },
  { id: 'recents' as TabType, label: 'Recent', icon: '🕒' }
];

const TRENDING_CHIPS = [
  { label: '🔥 lgtm', query: 'lgtm' },
  { label: '🚀 launch', query: 'launch' },
  { label: '🎉 congrats', query: 'congrats' },
  { label: '👏 bravo', query: 'bravo' },
  { label: '☕ coffee', query: 'coffee' },
  { label: '❤️ thanks', query: 'thanks' },
  { label: '👀 looking', query: 'looking' },
  { label: '😂 lol', query: 'lol' }
];

const GIF_GRADIENTS = [
  'linear-gradient(135deg, #1e1b4b, #3b0764)',
  'linear-gradient(135deg, #0f172a, #1e3a8a)',
  'linear-gradient(135deg, #064e3b, #0f172a)',
  'linear-gradient(135deg, #3f1d38, #1f2937)',
  'linear-gradient(135deg, #1e293b, #334155)',
  'linear-gradient(135deg, #31102f, #0f172a)'
];

const searchQuery = ref<string>('');
const activeTab = ref<TabType>('gif');
const activeCategory = ref<string>('All');
const isReady = ref<boolean>(false);
const visibleCount = ref<number>(24);
const searchLatencyMs = ref<number>(0.05);
const recentsList = ref<MediaAsset[]>([]);
const displayedItems = ref<MediaAsset[]>([]);
const searchInputRef = ref<HTMLInputElement | null>(null);
const sentinelRef = ref<HTMLDivElement | null>(null);
const loadedMap = reactive<Record<string, boolean>>({});

let observer: IntersectionObserver | null = null;

const recentsCount = computed(() => recentsList.value.length);

const availableCategories = ['All', 'Approval', 'Celebration', 'Launch & Hype', 'Reactions', 'Gratitude', 'Work & Coffee'];

const renderedItems = computed(() => {
  return displayedItems.value.slice(0, visibleCount.value);
});

function getTileBackground(item: MediaAsset, idx: number): string {
  if (item.type === 'gif') {
    return GIF_GRADIENTS[idx % GIF_GRADIENTS.length];
  }
  return '';
}

function formatKB(bytes: number): string {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function refreshRecents() {
  recentsList.value = core.getRecents();
}

function selectTab(tabId: TabType) {
  activeTab.value = tabId;
  if (tabId === 'recents') refreshRecents();
}

function selectCategory(cat: string) {
  activeCategory.value = cat;
}

function clearSearch() {
  searchQuery.value = '';
  searchInputRef.value?.focus();
}

function toggleChip(query: string) {
  if (searchQuery.value.trim().toLowerCase() === query.toLowerCase()) {
    searchQuery.value = '';
  } else {
    searchQuery.value = query;
  }
}

function onSearchInput() {
  runSearch();
}

function runSearch() {
  if (!isReady.value) return;

  const { items, stats } = core.search({
    query: searchQuery.value,
    type: activeTab.value,
    category: activeCategory.value
  });

  displayedItems.value = items.filter(i => i.byteSize <= props.maxMmsBytes);
  searchLatencyMs.value = stats.latencyMs;
  emit('search-telemetry', stats);
}

function handleAssetClick(asset: MediaAsset) {
  core.recordRecent(asset);
  refreshRecents();
  emit('select', asset);
}

// Reactivity Watcher: Immediately resets visible batch and runs search on input/tab/cat changes
watch([searchQuery, activeTab, activeCategory], () => {
  visibleCount.value = 24;
  runSearch();
});

function setupObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  if (typeof IntersectionObserver !== 'undefined' && sentinelRef.value) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && visibleCount.value < displayedItems.value.length) {
          visibleCount.value += 24;
        }
      },
      { rootMargin: '120px' }
    );
    observer.observe(sentinelRef.value);
  }
}

onMounted(async () => {
  await core.init();
  isReady.value = true;
  refreshRecents();
  runSearch();

  await nextTick();
  setupObserver();
});

watch(renderedItems, async () => {
  await nextTick();
  setupObserver();
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});

watch(() => props.baseUrl, async (newUrl) => {
  isReady.value = false;
  core = new VbcMediaCore(newUrl);
  await core.init();
  isReady.value = true;
  runSearch();
});

// Expose methods for automated benchmark demo
defineExpose({
  setQuery: (q: string) => {
    searchQuery.value = q;
  },
  setTab: (t: TabType) => {
    activeTab.value = t;
  },
  getDisplayedItems: () => displayedItems.value,
  triggerFirstSelect: () => {
    if (displayedItems.value.length > 0) {
      handleAssetClick(displayedItems.value[0]);
    }
  }
});
</script>
