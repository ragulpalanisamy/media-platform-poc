<template>
  <div class="flex flex-col h-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative">
    <!-- Channel Header -->
    <div class="px-4.5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
      <div class="flex flex-col">
        <div class="flex items-center gap-1.5">
          <span class="text-slate-500 font-bold text-lg">#</span>
          <span class="font-bold text-sm text-slate-100">release-vbc-platform</span>
          <span class="w-2 h-2 rounded-full bg-emerald-500 ml-0.5 shadow-sm shadow-emerald-500"></span>
        </div>
        <div class="flex items-center gap-2 mt-1 text-xs text-slate-500">
          <span>14 members</span>
          <span>•</span>
          <span class="text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-full border border-sky-400/20 font-medium">Intune MAM Protected</span>
          <span>•</span>
          <span class="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 font-medium">0 External API Calls</span>
        </div>
      </div>

      <div>
        <button
          class="bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-100 px-2.5 py-1 rounded-md text-xs cursor-pointer transition-all duration-150"
          title="Reset sample messages"
          @click="resetMessages"
        >
          ↺ Reset
        </button>
      </div>
    </div>

    <!-- Messages Container -->
    <div ref="messagesScrollRef" class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex gap-3 items-start"
      >
        <div
          class="w-8.5 h-8.5 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm"
          :style="{ background: msg.avatarBg }"
        >
          {{ msg.avatarText }}
        </div>

        <div class="flex-1 flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-sm text-slate-200">{{ msg.sender }}</span>
            <span class="text-xs text-slate-400 bg-white/5 px-1.5 py-0.5 rounded font-mono">{{ msg.role }}</span>
            <span class="text-xs text-slate-500">{{ msg.time }}</span>
          </div>

          <!-- Text body if present -->
          <div v-if="msg.text" class="text-sm text-slate-300 leading-relaxed">
            {{ msg.text }}
          </div>

          <!-- Media Attachment Card if present -->
          <div
            v-if="msg.media"
            class="mt-1.5 max-w-65 bg-slate-900 border rounded-xl overflow-hidden cursor-pointer transition-all duration-150 hover:border-sky-400 hover:-translate-y-0.5"
            :class="selectedMediaId === msg.media.id ? 'border-sky-400 ring-2 ring-sky-400/40' : 'border-slate-700'"
            @click="onSelectAttachment(msg.media)"
          >
            <div class="w-full aspect-square flex items-center justify-center bg-black/30 p-2">
              <span v-if="msg.media.type === 'emoji'" class="text-7xl">
                {{ msg.media.thumbUrl }}
              </span>
              <img
                v-else
                :src="msg.media.fullUrl"
                :alt="msg.media.title"
                class="max-w-full max-h-full object-contain"
              />
            </div>

            <div class="p-2.5 bg-slate-950 flex flex-col gap-0.5 text-xs border-t border-slate-800 font-mono">
              <span class="text-emerald-400 font-semibold font-sans">✅ MMS Compliant</span>
              <span class="text-slate-400 text-xs">{{ (msg.media.byteSize / 1024).toFixed(1) }} KB / 450 KB</span>
              <span class="text-slate-400 text-xs">{{ msg.media.license }}</span>
              <span class="text-slate-500 text-xs">SHA: {{ msg.media.sha256.substring(0, 8) }}...</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Composer Bar -->
    <div class="p-3 bg-slate-900 border-t border-slate-800 relative flex flex-col gap-2">
      <!-- Media Picker Flyout Popover -->
      <div v-if="isPickerOpen" class="absolute bottom-16 left-4 z-50 shadow-2xl">
        <VbcMediaPicker
          ref="pickerRef"
          baseUrl="/cdn/v1"
          :max-mms-bytes="460800"
          theme="dark"
          :has-close-btn="true"
          @select="handlePickerSelect"
          @search-telemetry="onSearchTelemetry"
          @close="isPickerOpen = false"
        />
      </div>

      <!-- Demo Toolbar (Keep Picker Pinned) -->
      <div class="flex items-center justify-between px-0.5">
        <label class="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer select-none hover:text-slate-300" title="Keep the picker open to rapidly test multiple selections">
          <input
            v-model="isPickerPinned"
            type="checkbox"
            class="cursor-pointer accent-indigo-500 rounded"
          />
          <span class="font-medium">📌 Keep Picker Pinned for Demo</span>
        </label>
        <span v-if="isPickerPinned && isPickerOpen" class="text-xs font-bold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded">PINNED ACTIVE</span>
      </div>

      <div class="flex items-center gap-2.5 bg-slate-950 border border-slate-800 rounded-xl py-1 px-1.5 pl-2.5 focus-within:border-sky-400 transition-colors">
        <button
          class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-all duration-150"
          :class="isPickerOpen ? 'bg-sky-600 text-white' : 'bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-600 hover:text-white'"
          title="Attach In-House Media (GIF / Sticker / Emoji)"
          @click="isPickerOpen = !isPickerOpen"
        >
          <span class="text-sm">😊</span>
          <span>Media</span>
        </button>

        <input
          v-model="composerText"
          type="text"
          placeholder="Message #release-vbc-platform..."
          class="flex-1 bg-transparent border-0 outline-none text-slate-100 text-sm py-1 px-1 placeholder-slate-500"
          @keydown.enter="sendTextMessage"
        />

        <button
          class="bg-blue-600 text-white border-0 py-1.5 px-3.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          :disabled="!composerText.trim()"
          @click="sendTextMessage"
        >
          Send
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import type { MediaAsset, SearchStats } from '../sdk/types';
import VbcMediaPicker from '../sdk/VbcMediaPicker.vue';

interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  avatarText: string;
  avatarBg: string;
  time: string;
  isMe: boolean;
  text?: string;
  media?: MediaAsset;
}

const emit = defineEmits<{
  (e: 'asset-inspected', asset: MediaAsset): void;
  (e: 'telemetry-updated', stats: SearchStats): void;
}>();

const isPickerOpen = ref<boolean>(false);
const isPickerPinned = ref<boolean>(true); // Enabled by default for rapid reviewer demos
const composerText = ref<string>('');
const selectedMediaId = ref<string>('');
const messagesScrollRef = ref<HTMLDivElement | null>(null);
const pickerRef = ref<InstanceType<typeof VbcMediaPicker> | null>(null);

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'PM',
    role: 'Product Manager',
    avatarText: 'PM',
    avatarBg: '#6366f1',
    time: '11:15 AM',
    isMe: false,
    text: 'Team, with INC-909 and VMMT-949 behind us, let\'s verify our in-house media platform behavior before the ARB pitch tomorrow morning.'
  },
  {
    id: 'm2',
    sender: 'Dev',
    role: 'Mobile Developer',
    avatarText: 'Dev',
    avatarBg: '#0ea5e9',
    time: '11:18 AM',
    isMe: false,
    text: 'Both Android and iOS builds are pointed to the first-party /cdn/v1/catalog.json. Zero external API calls detected in Charles Proxy. Intune MAM test is green.'
  },
  {
    id: 'm3',
    sender: 'You',
    role: 'SD2',
    avatarText: 'SA',
    avatarBg: '#10b981',
    time: '11:20 AM',
    isMe: true,
    text: 'Sending a test reaction from our curated catalog right now. Notice sub-millisecond search latency and guaranteed MMS payload caps:'
  },
  {
    id: 'm4',
    sender: 'You',
    role: 'SD2',
    avatarText: 'SA',
    avatarBg: '#10b981',
    time: '11:21 AM',
    isMe: true,
    media: {
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
    }
  }
];

const messages = ref<ChatMessage[]>([...DEFAULT_MESSAGES]);

function onSelectAttachment(asset: MediaAsset) {
  selectedMediaId.value = asset.id;
  emit('asset-inspected', asset);
}

function handlePickerSelect(asset: MediaAsset) {
  if (!isPickerPinned.value) {
    isPickerOpen.value = false;
  }
  selectedMediaId.value = asset.id;

  const newMsg: ChatMessage = {
    id: `msg_${Date.now()}`,
    sender: 'You',
    role: 'Senior Architect',
    avatarText: 'SA',
    avatarBg: '#10b981',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isMe: true,
    media: asset
  };

  messages.value.push(newMsg);
  emit('asset-inspected', asset);
  scrollToBottom();
}

async function runAutoDemoSequence(
  queries: string[] = ['lgtm', 'congrats', 'launch', 'coffee', 'thanks'],
  delayMs = 650
) {
  isPickerOpen.value = true;
  await nextTick();

  for (const q of queries) {
    if (pickerRef.value) {
      pickerRef.value.setQuery(q);
      await new Promise(r => setTimeout(r, delayMs));
      pickerRef.value.triggerFirstSelect();
      await new Promise(r => setTimeout(r, 200));
    }
  }
}

function sendTextMessage() {
  const val = composerText.value.trim();
  if (!val) return;

  const newMsg: ChatMessage = {
    id: `msg_${Date.now()}`,
    sender: 'You',
    role: 'Senior Architect',
    avatarText: 'SA',
    avatarBg: '#10b981',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isMe: true,
    text: val
  };

  messages.value.push(newMsg);
  composerText.value = '';
  scrollToBottom();
}

function onSearchTelemetry(stats: SearchStats) {
  emit('telemetry-updated', stats);
}

function resetMessages() {
  messages.value = [...DEFAULT_MESSAGES];
  scrollToBottom();
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesScrollRef.value) {
      messagesScrollRef.value.scrollTop = messagesScrollRef.value.scrollHeight;
    }
  });
}

defineExpose({
  isPickerOpen,
  isPickerPinned,
  runAutoDemo: runAutoDemoSequence,
  openPicker: () => { isPickerOpen.value = true; },
  handlePickerSelect
});
</script>
