# iOS Integration Guide — `VBCMediaPicker` (Swift Package)

## 1. Overview
The iOS SDK package is distributed via Swift Package Manager (SPM). It presents a standard sheet presentation controller using `UICollectionViewDiffableDataSource` and progressive frame decoding via `SDWebImageWebPCoder`.

## 2. Package Setup (`Package.swift`)

```swift
dependencies: [
    .package(url: "https://github.com/SDWebImage/SDWebImage.git", from: "5.19.0"),
    .package(url: "https://github.com/SDWebImage/SDWebImageWebPCoder.git", from: "0.14.0"),
    .package(url: "git@github.com:vonage/vbc-media-picker-ios.git", from: "1.0.0")
]
```

## 3. Drop-In Usage in Chat View Controller

```swift
import UIKit
import VBCMediaPicker

class VBCChatViewController: UIViewController {

    @IBAction func didTapMediaButton(_ sender: UIButton) {
        let picker = VBCMediaPickerViewController(
            catalogURL: URL(string: "https://media.vbc.vonage.com/v1/catalog.json")!,
            maxMmsBytes: 460800
        )
        
        picker.delegate = self
        
        if let sheet = picker.sheetPresentationController {
            sheet.detents = [.medium(), .large()]
            sheet.prefersGrabberVisible = true
        }
        
        present(picker, animated: true)
    }
}

extension VBCChatViewController: VBCMediaPickerDelegate {
    func mediaPicker(_ picker: VBCMediaPickerViewController, didSelect asset: VBCMediaAsset) {
        picker.dismiss(animated: true) { [weak self] in
            self?.sendOutboundMessage(
                mediaURL: asset.fullURL,
                byteSize: asset.byteSize,
                mimeType: asset.mimeType
            )
        }
    }
}
```
