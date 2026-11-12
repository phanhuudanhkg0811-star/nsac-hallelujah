import optimizedSprites from '../data/optimized-sprites.json';

export const ASSET_BASE = '/assets/parsecs';
const optimized = new Set(optimizedSprites);

/** Keep filenames case-sensitive and prefer the verified WebP conversion. */
export function assetUrl(filename: string): string {
  const webpName = filename.replace(/\.png$/i, '.webp');
  if (optimized.has(webpName)) return `${ASSET_BASE}/optimized/${webpName}`;
  return `${ASSET_BASE}/${optimized.has(filename) ? 'optimized/' : ''}${filename}`;
}
