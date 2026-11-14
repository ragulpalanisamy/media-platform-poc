<template>
  <div class="vbc-chat-card">
    <!-- Channel Header -->
    <div class="chat-header">
      <div class="channel-info">
        <div class="channel-title-row">
          <span class="channel-hash">#</span>
          <span class="channel-name">release-vbc-platform</span>
          <span class="presence-dot"></span>
        </div>
        <div class="channel-meta">
          <span>14 members</span>
          <span>•</span>
          <span class="compliance-tag">Intune MAM Protected</span>
          <span>•</span>
          <span class="network-tag">0 External API Calls</span>
        </div>
      </div>

      <div class="header-actions">
        <button class="reset-btn" title="Reset sample messages" @click="resetMessages">
          ↺ Reset
        </button>
      </div>
    </div>

    <!-- Messages Container -->
    <div ref="messagesScrollRef" class="messages-container">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message-row"
        :class="{ 'is-me': msg.isMe }"
      >
        <div class="avatar" :style="{ background: msg.avatarBg }">
          {{ msg.avatarText }}
        </div>

        <div class="message-content">
          <div class="message-meta-line">
            <span class="sender-name">{{ msg.sender }}</span>
            <span class="sender-role">{{ msg.role }}</span>
            <span class="msg-time">{{ msg.time }}</span>
          </div>

          <!-- Text body if present -->
          <div v-if="msg.text" class="msg-text">
            {{ msg.text }}
          </div>

          <!-- Media Attachment Card if present -->
          <div
            v-if="msg.media"
            class="media-attachment-box"
            :class="{ active: selectedMediaId === msg.media.id }"
            @click="onSelectAttachment(msg.media)"
          >
            <div class="media-preview-container">
              <span v-if="msg.media.type === 'emoji'" class="chat-emoji-glyph">
                {{ msg.media.thumbUrl }}
              </span>
              <img
                v-else
                :src="msg.media.fullUrl"
                :alt="msg.media.title"
                class="chat-media-img"
              />
            </div>

            <div class="media-audit-pill">
              <span class="audit-status">✅ MMS Compliant</span>
              <span class="audit-size">{{ (msg.media.byteSize / 1024).toFixed(1) }} KB / 450 KB</span>
              <span class="audit-license">{{ msg.media.license }}</span>
              <span class="audit-hash">SHA: {{ msg.media.sha256.substring(0, 8) }}...</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Composer Bar -->
    <div class="composer-container">
      <!-- Media Picker Flyout Popover -->
      <div v-if="isPickerOpen" class="picker-popover-anchor">
        <VbcMediaPicker
          baseUrl="/cdn/v1"
          :max-mms-bytes="460800"
          theme="dark"
          :has-close-btn="true"
          @select="handlePickerSelect"
          @search-telemetry="onSearchTelemetry"
          @close="isPickerOpen = false"
        />
      </div>

      <div class="composer-input-row">
        <button
          class="picker-toggle-btn"
          :class="{ active: isPickerOpen }"
          title="Attach In-House Media (GIF / Sticker / Emoji)"
          @click="isPickerOpen = !isPickerOpen"
        >
          <span class="picker-btn-icon">😊</span>
          <span class="picker-btn-label">Media</span>
        </button>

        <input
          v-model="composerText"
          type="text"
          placeholder="Message #release-vbc-platform..."
          class="chat-text-input"
          @keydown.enter="sendTextMessage"
        />

        <button
          class="send-btn"
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
const composerText = ref<string>('');
const selectedMediaId = ref<string>('');
const messagesScrollRef = ref<HTMLDivElement | null>(null);

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'Divyank Pandey',
    role: 'Senior Director of Engineering',
    avatarText: 'DP',
    avatarBg: '#6366f1',
    time: '11:15 AM',
    isMe: false,
    text: 'Team, with INC-909 and VMMT-949 behind us, let\'s verify our in-house media platform behavior before the ARB pitch tomorrow morning.'
  },
  {
    id: 'm2',
    sender: 'Gnanesh Puttaswamy',
    role: 'Lead Mobile Architect',
    avatarText: 'GP',
    avatarBg: '#0ea5e9',
    time: '11:18 AM',
    isMe: false,
    text: 'Both Android and iOS builds are pointed to the first-party /cdn/v1/catalog.json. Zero external API calls detected in Charles Proxy. Intune MAM test is green.'
  },
  {
    id: 'm3',
    sender: 'You',
    role: 'Senior Architect',
    avatarText: 'SA',
    avatarBg: '#10b981',
    time: '11:20 AM',
    isMe: true,
    text: 'Sending a test reaction from our curated catalog right now. Notice sub-millisecond search latency and guaranteed MMS payload caps:'
  },
  {
    id: 'm4',
    sender: 'You',
    role: 'Senior Architect',
    avatarText: 'SA',
    avatarBg: '#10b981',
    time: '11:21 AM',
    isMe: true,
    media: {
      id: 'noto_1f680',
      title: 'Rocket Launch',
      type: 'gif',
      tags: ['rocket', 'launch', 'deploy', 'ship', 'fast'],
      categories: ['Workplace', 'Celebration'],
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
  isPickerOpen.value = false;
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
</script>

<style scoped>
.vbc-chat-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0f131d;
  border-radius: 14px;
  border: 1px solid #1e2638;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  position: relative;
}

/* Header */
.chat-header {
  padding: 14px 18px;
  background: #141a27;
  border-bottom: 1px solid #1e2638;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.channel-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.channel-hash {
  color: #64748b;
  font-weight: 700;
  font-size: 17px;
}

.channel-name {
  font-weight: 700;
  font-size: 15px;
  color: #f1f5f9;
}

.presence-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  margin-left: 2px;
}

.channel-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 11.5px;
  color: #64748b;
}

.compliance-tag {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  padding: 1px 7px;
  border-radius: 9999px;
  border: 1px solid rgba(56, 189, 248, 0.2);
}

.network-tag {
  color: #34d399;
  background: rgba(52, 211, 153, 0.1);
  padding: 1px 7px;
  border-radius: 9999px;
  border: 1px solid rgba(52, 211, 153, 0.2);
}

.reset-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
}

/* Messages Scroll Area */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  color: #ffffff;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-meta-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sender-name {
  font-weight: 600;
  font-size: 13.5px;
  color: #e2e8f0;
}

.sender-role {
  font-size: 10.5px;
  color: #64748b;
  background: rgba(255, 255, 255, 0.04);
  padding: 1px 6px;
  border-radius: 4px;
}

.msg-time {
  font-size: 10.5px;
  color: #475569;
}

.msg-text {
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.5;
}

/* Media Attachment Card */
.media-attachment-box {
  margin-top: 6px;
  max-width: 260px;
  background: #141b2b;
  border: 1px solid #243048;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s ease;
}

.media-attachment-box:hover {
  border-color: #38bdf8;
  transform: translateY(-1px);
}

.media-attachment-box.active {
  border-color: #38bdf8;
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.3);
}

.media-preview-container {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.25);
  padding: 8px;
}

.chat-media-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.chat-emoji-glyph {
  font-size: 80px;
}

.media-audit-pill {
  padding: 8px 10px;
  background: #0f1624;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 10.5px;
  border-top: 1px solid #1e293b;
}

.audit-status {
  color: #34d399;
  font-weight: 600;
}

.audit-size, .audit-license, .audit-hash {
  color: #94a3b8;
  font-family: ui-monospace, monospace;
}

/* Composer Bar */
.composer-container {
  padding: 12px 16px;
  background: #141a27;
  border-top: 1px solid #1e2638;
  position: relative;
}

.picker-popover-anchor {
  position: absolute;
  bottom: 60px;
  left: 16px;
  z-index: 50;
}

.composer-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #0d121c;
  border: 1px solid #1e2638;
  border-radius: 10px;
  padding: 4px 6px 4px 10px;
  transition: border-color 0.15s;
}

.composer-input-row:focus-within {
  border-color: #38bdf8;
}

.picker-toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.2);
  color: #38bdf8;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.picker-toggle-btn:hover, .picker-toggle-btn.active {
  background: #0284c7;
  color: #ffffff;
}

.chat-text-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #f1f5f9;
  font-size: 13.5px;
  padding: 6px 4px;
}

.send-btn {
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 7px 14px;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.send-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
