export const ADR_TEXT = `# ADR-001: In-House VBC Media SDK & First-Party Edge Catalog Architecture

**Status:** Proposed & Validated via Working PoC  
**Date:** 2026-11-16  
**Scope:** VBC Web (Vue.js), VBC Android (AAR / Kotlin), VBC iOS (Swift Package)  
**Target Delivery:** 100% In-House, Zero Third-Party APIs, Zero Search Query Leakage  

---

### 1. Context & Business Drivers
The VBC messaging platform historically integrated external third-party GIF providers (GIPHY) to support expressive workplace messaging. Over recent quarters, this reliance introduced four critical business and engineering risks:

1. **Vendor Outages & SPOF (INC-909):** API key expirations, upstream deprecations, or vendor service disruptions caused total feature blackout in production messaging clients.
2. **Client Credential Exposure:** Distributing vendor API keys inside mobile binary packages (.apk / .ipa) violates modern zero-trust enterprise security standards and was flagged during external penetration tests.
3. **Data Privacy & Intune MAM Non-Compliance:** User search queries (often containing proprietary project codenames, client names, or workplace context) were transmitted directly to third-party ad-tech infrastructure. Furthermore, Microsoft Intune App Protection Policies frequently blocked outbound third-party traffic.
4. **Carrier MMS Attachment Failures (VMMT-949):** Unconstrained GIF dimensions and unbounded byte payloads from external sources repeatedly violated cellular carrier MMS ceilings (450 KB), resulting in silent delivery failures for outbound SMS/MMS.

---

### 2. Decision: 100% In-House Media SDK + Edge CDN
We replace all third-party media vendors with an in-house media stack:
- **Zero-Proxy Edge Delivery:** Versioned \`catalog.json\` and pre-sanitized assets hosted on first-party CDN (Vercel Edge for PoC / AWS S3 + CloudFront with Origin Access Control for Enterprise Production).
- **Client-Side In-Memory Scoring:** Search queries never leave the device. Each SDK downloads and caches the 150 KB catalog manifest once and performs sub-millisecond keyword/prefix scoring locally.
- **Unified Schema Across 3 Native SDKs:**
  - Web: \`@vonage/vbc-media-picker\` (Vue 2.7 / Vue 3 headless core)
  - Android: \`vbc-media-picker-android\` (Kotlin BottomSheet + Coil 3)
  - iOS: \`VBCMediaPicker\` (Swift Package + SDWebImageWebPCoder)

---

### 3. Legal & US Corporate Compliance
- **Permissive License Allowlist:** All assets originate exclusively from \`CC-BY-4.0\` (Google Noto Animated Emoji), \`Apache-2.0\` (Google Noto Static), and \`CC0-1.0\`.
- **Zero DMCA / Pop-Culture Risk:** Scraping copyrighted movie/TV GIFs without studio agreements is explicitly rejected.
- **Cryptographic SBOM:** Automated build pipeline computes SHA-256 checksums and emits \`licenses-sbom.json\` and \`THIRD_PARTY_NOTICES.txt\`.

---

### 4. Financial & Operational ROI
- **Vendor Licensing Cost:** Reduced from ~$3,000–$6,000/month vendor fees to ~$30–$50/month static edge CDN bandwidth.
- **Reliability:** 99.99%+ SLA backed by edge CDN, immune to vendor contract disputes or API sunsetting.
- **Defects Resolved:** Permanently resolves INC-909 (outage) and VMMT-949 (MMS drop).
`;

export const ANDROID_SNIPPET = `// Android: VbcMediaPickerBottomSheet.kt (Kotlin + Coil 3)
import com.vonage.vbc.media.VbcMediaPickerBottomSheet

class VbcChatFragment : Fragment() {

    private fun openMediaPicker() {
        val picker = VbcMediaPickerBottomSheet.newInstance(
            // Production: https://media.vbc.vonage.com/v1/catalog.json
            // Offline/Intune: file:///android_asset/cdn/v1/catalog.json
            catalogUrl = "/cdn/v1/catalog.json",
            maxMmsBytes = 460800L // 450 KB MMS ceiling
        )

        picker.setOnMediaSelectedListener { asset ->
            // Drop-in attachment handler matching VBC attachment pipeline
            vbcMessagingService.sendAttachment(
                conversationId = currentThreadId,
                mediaUrl = asset.fullUrl,
                mimeType = asset.mimeType,
                byteSize = asset.byteSize,
                sha256 = asset.sha256
            )
        }

        picker.show(childFragmentManager, VbcMediaPickerBottomSheet.TAG)
    }
}`;

export const IOS_SNIPPET = `// iOS: VBCMediaPickerViewController.swift (Swift Package + SDWebImage)
import UIKit
import VBCMediaPicker

class VBCChatViewController: UIViewController, VBCMediaPickerDelegate {

    @IBAction func didTapMediaPicker(_ sender: UIButton) {
        let picker = VBCMediaPickerViewController(
            catalogURL: URL(string: "https://media.vbc.vonage.com/v1/catalog.json")!,
            maxMmsBytes: 460800 // 450 KB MMS ceiling
        )
        picker.delegate = self
        
        if let sheet = picker.sheetPresentationController {
            sheet.detents = [.medium(), .large()]
            sheet.prefersGrabberVisible = true
        }
        
        present(picker, animated: true)
    }

    func mediaPicker(_ picker: VBCMediaPickerViewController, didSelect asset: VBCMediaAsset) {
        picker.dismiss(animated: true) { [weak self] in
            self?.messagingClient.sendMediaMessage(
                remoteURL: asset.fullURL,
                byteSize: asset.byteSize,
                mimeType: asset.mimeType
            )
        }
    }
}`;

export const VUE_SNIPPET = `<!-- Web: Vue 2.7 & Vue 3 Component Integration -->
<template>
  <div class="vbc-composer-bar">
    <button class="btn-picker" @click="isPickerOpen = !isPickerOpen">
      😊 Media
    </button>

    <!-- Drop-in VBC In-House Picker -->
    <VbcMediaPicker
      v-if="isPickerOpen"
      baseUrl="/cdn/v1"
      :maxMmsBytes="460800"
      theme="dark"
      @select="handleMediaSelected"
      @close="isPickerOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VbcMediaPicker, type MediaAsset } from '@vonage/vbc-media-picker';

const isPickerOpen = ref(false);

function handleMediaSelected(asset: MediaAsset) {
  isPickerOpen.value = false;
  // Send directly into VBC messaging channel
  vbcStore.dispatch('sendMessageWithAttachment', {
    type: asset.type,
    url: asset.fullUrl,
    size: asset.byteSize,
    mimeType: asset.mimeType
  });
}
</script>`;
