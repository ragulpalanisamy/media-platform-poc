export type MediaType = 'gif' | 'sticker' | 'emoji';

export interface MediaAsset {
  id: string;
  title: string;
  type: MediaType;
  tags: string[];
  categories: string[];
  searchText: string;    // Pre-computed lowercase search index
  thumbUrl: string;      // e.g., "/cdn/v1/assets/noto_1f680.webp" or native emoji char
  fullUrl: string;       // e.g., "/cdn/v1/assets/noto_1f680.gif"
  byteSize: number;      // Strictly <= 460800 (450 KB)
  width: number;
  height: number;
  mimeType: 'image/gif' | 'image/webp' | 'text/emoji';
  mmsCompliant: boolean; // Always true in curated catalog
  license: 'CC-BY-4.0' | 'Apache-2.0' | 'Unicode-DFS';
  sha256: string;
}

export interface CatalogManifest {
  version: string;
  generatedAt: string;
  maxMmsBytes: number;
  count: number;
  items: MediaAsset[];
}

export interface SbomRecord {
  assetId: string;
  fileName: string;
  sourceUrl: string;
  spdxLicense: 'CC-BY-4.0' | 'Apache-2.0';
  copyrightHolder: string;
  sha256: string;
  byteSize: number;
  mmsCompliant: boolean;
  verifiedAt: string;
}

export interface SearchStats {
  query: string;
  latencyMs: number;
  resultCount: number;
  totalScanned: number;
  externalNetworkCalls: 0;
}
