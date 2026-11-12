import { ASSET_BASE, assetUrl } from './assets.ts';
export function ViewportPorthole({ sprite }: { sprite: string }) {
  return <div className="cabin-porthole"><img src={assetUrl(`${sprite}`)} alt="Ngoại cảnh ngoài cửa sổ trạm" draggable={false} /></div>;
}
