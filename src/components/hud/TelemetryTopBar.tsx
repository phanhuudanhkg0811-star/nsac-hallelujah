import { useGameStore } from '../../store/gameStore.ts';
import { HAIL_SVG } from '../cabin/hailAssets.ts';
import type { GameState } from '../../types/index.ts';

const PHASE_LABELS: Record<GameState['phase'], string> = {
  briefing: '01 · BÁO CÁO SÁNG',
  engineering: '02 · KỸ THUẬT',
  comms: '03 · LIÊN LẠC',
  rationing: '04 · KHẨU PHẦN',
  ended: 'KẾT THÚC NHIỆM VỤ',
};

export function TelemetryTopBar() {
  const { gameState } = useGameStore();
  const r = gameState.resources;

  const metrics = [
    { key: 'o2', label: 'O₂', value: r.oxygenKg, unit: 'kg', icon: HAIL_SVG.resOxygen, warn: r.oxygenKg < 18 },
    { key: 'h2o', label: 'Nước', value: r.waterL, unit: 'L', icon: HAIL_SVG.resWater, warn: r.waterL < 22 },
    { key: 'pwr', label: 'Pin', value: r.batteryKWh, unit: 'kWh', icon: HAIL_SVG.resPower, warn: r.batteryKWh < 18 },
    { key: 'food', label: 'Thực phẩm', value: r.foodKg, unit: 'kg', icon: HAIL_SVG.resFood, warn: r.foodKg < 15 },
    { key: 'parts', label: 'Phụ tùng', value: r.partsKg, unit: 'kg', icon: HAIL_SVG.resParts, warn: r.partsKg < 6 },
  ];

  return (
    <header className="hail-telemetry" aria-label="Thông số sinh tồn trạm">
      <div className="hail-mission-id">
        <img
          src={HAIL_SVG.badgeNasaStem}
          alt="Project Hail Badge"
          className="hail-emblem-icon"
          draggable={false}
        />
        <div className="hail-mission-titles">
          <div className="hail-title-row">
            <strong>PROJECT HAIL</strong>
            <span className="hail-sol-pill">SOL {String(gameState.sol).padStart(2, '0')} / 12</span>
          </div>
          <span className="hail-sub-row">
            {`${gameState.planet === 'moon' ? 'ARTEMIS LUNAR BASE' : 'ARES MARS BASE'} · ${PHASE_LABELS[gameState.phase]}`}
          </span>
        </div>
      </div>

      <dl className="hail-resource-strip">
        {metrics.map(m => (
          <div key={m.key} className={`hail-res-pill ${m.warn ? 'is-warn' : ''}`}>
            <img src={m.icon} alt="" aria-hidden="true" className="hail-res-icon" draggable={false} />
            <div className="hail-res-data">
              <dt>{m.label}</dt>
              <dd>
                {Number(m.value.toFixed(1))}
                <small>{m.unit}</small>
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </header>
  );
}
