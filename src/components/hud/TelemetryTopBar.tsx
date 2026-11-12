import { useGameStore } from '../../store/gameStore.ts';
export function TelemetryTopBar({ referenceMode }: { referenceMode: boolean }) {
  const { gameState, parsecsState } = useGameStore();
  const r = gameState.resources;
  const values = referenceMode ? [
    ['Súp', parsecsState.soupCans, 'hộp'], ['Hóa chất', parsecsState.resources.Chemical, ''], ['Khoáng chất', parsecsState.resources.Mineral, ''], ['Năng lượng', parsecsState.resources.Power, ''],
  ] : [['O₂', r.oxygenKg, 'kg'], ['Nước', r.waterL, 'L'], ['Pin', r.batteryKWh, 'kWh'], ['Thực phẩm', r.foodKg, 'kg'], ['Phụ tùng', r.partsKg, 'kg']];
  return <header className="cabin-telemetry" aria-label="Tài nguyên trong kho">
    <div className="cabin-mission-id" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
      <img src="/logo.jpg" alt="Mission Emblem" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #d4af37', flexShrink: 0 }} />
      <div>
        <strong>{referenceMode ? 'PARSECS' : 'HAIL'}</strong>
        <span>{referenceMode ? '1.3.2 · Đối chiếu' : gameState.planet === 'moon' ? 'Trạm Mặt Trăng' : 'Trạm Sao Hỏa'}</span>
      </div>
    </div>
    <dl>{values.map(([label, value, unit]) => <div key={label}><dt>{label}</dt><dd>{typeof value === 'number' ? Number(value.toFixed(1)) : value}<small>{unit}</small></dd></div>)}</dl>
  </header>;
}
