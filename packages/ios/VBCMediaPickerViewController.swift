import UIKit

public protocol VBCMediaPickerDelegate: AnyObject {
    func mediaPicker(_ picker: VBCMediaPickerViewController, didSelect asset: VBCMediaAsset)
}

public struct VBCMediaAsset: Codable {
    public let id: String
    public let title: String
    public let type: String
    public let tags: [String]
    public let categories: [String]
    public let thumbUrl: String
    public let fullUrl: String
    public let byteSize: Int
    public let mimeType: String
    public let mmsCompliant: BooleanLiteralType
    public let license: String
    public let sha256: String
}

public struct VBCCatalogManifest: Codable {
    public let version: String
    public let count: Int
    public let items: [VBCMediaAsset]
}

/**
 * Enterprise In-House Media Picker for iOS.
 * Swift Package Manager drop-in component with UICollectionViewDiffableDataSource
 * and SDWebImage progressive animated WebP/GIF rendering.
 */
public class VBCMediaPickerViewController: UIViewController {

    public weak var delegate: VBCMediaPickerDelegate?
    private let catalogURL: URL
    private let maxMmsBytes: Int
    private var allItems: [VBCMediaAsset] = []

    public init(catalogURL: URL, maxMmsBytes: Int = 460800) {
        self.catalogURL = catalogURL
        self.maxMmsBytes = maxMmsBytes
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    public override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        fetchCatalog()
    }

    private func fetchCatalog() {
        URLSession.shared.dataTask(with: catalogURL) { [weak self] data, response, error in
            guard let self = self, let data = data, error == nil else { return }
            do {
                let manifest = try JSONDecoder().decode(VBCCatalogManifest.self, from: data)
                DispatchQueue.main.async {
                    self.allItems = manifest.items.filter { $0.byteSize <= self.maxMmsBytes }
                }
            } catch {
                print("[VBCMediaPicker] JSON decoding failed: \(error)")
            }
        }.resume()
    }
}
