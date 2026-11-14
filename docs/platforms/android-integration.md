# Android Integration Guide — `vbc-media-picker-android`

## 1. Overview
The Android SDK package provides a lightweight, enterprise-ready `BottomSheetDialogFragment` consuming the unified `/cdn/v1/catalog.json` schema.

## 2. Dependencies
Add the following to your application's `build.gradle.kts`:

```kotlin
dependencies {
    // Coil 3 for hardware-accelerated animated WebP and GIF decoding
    implementation("io.coil-kt.coil3:coil:3.0.4")
    implementation("io.coil-kt.coil3:coil-gif:3.0.4")
    
    // Kotlinx Serialization for fast in-memory catalog deserialization
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
    
    // Internal Vonage Media Picker AAR
    implementation("com.vonage:vbc-media-picker:1.0.0")
}
```

## 3. Drop-In Usage in Messaging Fragment / Activity

```kotlin
class VbcChatFragment : Fragment() {

    private fun showMediaPicker() {
        val picker = VbcMediaPickerBottomSheet.newInstance(
            catalogUrl = "https://media.vbc.vonage.com/v1/catalog.json",
            maxMmsBytes = 460800L
        )

        picker.setOnMediaSelectedListener { asset ->
            // Drop-in attachment handler for VBC outbound message
            sendMessageWithAttachment(
                url = asset.fullUrl,
                mimeType = asset.mimeType,
                byteSize = asset.byteSize,
                caption = asset.title
            )
        }

        picker.show(childFragmentManager, VbcMediaPickerBottomSheet.TAG)
    }

    private fun sendMessageWithAttachment(url: String, mimeType: String, byteSize: Long, caption: String) {
        // Enforce MAM & MMS safety checks
        check(byteSize <= 460800L) { "Asset exceeds carrier MMS ceiling" }
        // Submit to VBC messaging pipeline...
    }
}
```

## 4. Intune MAM & Offline Asset Resolution
When operating within Intune MAM containers with strict network isolation, configure the catalog provider to read from the bundled APK asset path:
```kotlin
val picker = VbcMediaPickerBottomSheet.newInstance(
    catalogUrl = "file:///android_asset/cdn/v1/catalog.json"
)
```
Zero outbound network calls are made.
