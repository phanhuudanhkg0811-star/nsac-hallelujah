import { CabinHotspot } from './CabinHotspot.tsx';
import { getSuitStationSprite } from '../../utils/parsecsAssetResolver.ts';

export function ExpeditionSuitHatch({
  level,
  onClick,
}: {
  level: number;
  onClick: () => void;
}) {
  const sprite = getSuitStationSprite(
    Math.min(3, Math.max(1, level)) as 1 | 2 | 3,
  );
  return (
    <CabinHotspot
      label="Cửa thám hiểm EVA"
      sprite={sprite}
      style={{
        left: '59.711%',
        top: '30.434%',
        width: '9.505%',
        height: '28.438%',
        zIndex: 26,
      }}
      onClick={onClick}
    />
  );
}
