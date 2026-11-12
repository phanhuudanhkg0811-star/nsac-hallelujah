import { CabinHotspot } from './CabinHotspot.tsx';
import { getCraftingStationSprite } from '../../utils/parsecsAssetResolver.ts';

export function CraftingStation3D({
  level,
  onClick,
  referenceMode,
}: {
  level: number;
  onClick: () => void;
  referenceMode: boolean;
}) {
  const sprite = getCraftingStationSprite(
    Math.min(3, Math.max(1, level)) as 1 | 2 | 3,
  );
  return (
    <CabinHotspot
      label={referenceMode ? `Máy chế tạo · Cấp ${level}` : 'Bảo trì hệ thống'}
      sprite={sprite}
      style={{
        left: '29.310%',
        top: '17.326%',
        width: '9.662%',
        height: '25.625%',
        zIndex: 26,
      }}
      onClick={onClick}
    />
  );
}
