import type { CSSProperties, ReactNode } from 'react';
import { ASSET_BASE, assetUrl } from './assets.ts';

export function CabinHotspot({ label, sprite, style, onClick, children, className = '' }: {
  label: string; sprite?: string; style: CSSProperties; onClick: () => void; children?: ReactNode; className?: string;
}) {
  const resolvedSprite = sprite
    ? (sprite.startsWith('/') || sprite.startsWith('http') ? sprite : assetUrl(`${sprite}`))
    : undefined;
  return <button type="button" className={`cabin-hotspot ${className}`} style={style} onClick={onClick} aria-label={label}>
    {resolvedSprite && <img src={resolvedSprite} alt="" draggable={false} />}
    {children}<span className="cabin-tooltip">{label}</span>
  </button>;
}
