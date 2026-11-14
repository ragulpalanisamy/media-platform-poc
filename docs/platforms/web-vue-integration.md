# Web Integration Guide — `@vonage/vbc-media-picker` (Vue 2.7 & Vue 3)

## 1. Overview
The Web SDK package is architected with a decoupled headless TypeScript engine (`@vonage/vbc-media-core`) and a drop-in Single File Component (`@vonage/vbc-media-picker`) that supports both Vue 2.7 and Vue 3 environments.

## 2. Installation
```bash
npm install @vonage/vbc-media-picker
```

## 3. Usage in Vue 3 (Composition API)

```vue
<template>
  <div class="chat-composer">
    <button @click="showPicker = !showPicker">😊</button>
    
    <VbcMediaPicker
      v-if="showPicker"
      baseUrl="/cdn/v1"
      :maxMmsBytes="460800"
      theme="dark"
      @select="handleSelectMedia"
      @close="showPicker = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VbcMediaPicker } from '@vonage/vbc-media-picker';
import type { MediaAsset } from '@vonage/vbc-media-picker';

const showPicker = ref(false);

function handleSelectMedia(asset: MediaAsset) {
  showPicker.value = false;
  // Send attachment through VBC Web Messaging pipeline
  sendVbcMessage({
    type: asset.type,
    url: asset.fullUrl,
    size: asset.byteSize,
    mimeType: asset.mimeType
  });
}
</script>
```

## 4. Usage in Vue 2.7 (Options API)

```vue
<template>
  <div>
    <button @click="togglePicker">Media</button>
    <VbcMediaPicker
      v-if="isOpen"
      :baseUrl="mediaBaseUrl"
      @select="onMediaSelected"
    />
  </div>
</template>

<script>
import { VbcMediaPicker } from '@vonage/vbc-media-picker';

export default {
  components: { VbcMediaPicker },
  data() {
    return {
      isOpen: false,
      mediaBaseUrl: '/cdn/v1'
    };
  },
  methods: {
    togglePicker() {
      this.isOpen = !this.isOpen;
    },
    onMediaSelected(asset) {
      this.isOpen = false;
      this.$emit('attachment-ready', asset);
    }
  }
};
</script>
```
