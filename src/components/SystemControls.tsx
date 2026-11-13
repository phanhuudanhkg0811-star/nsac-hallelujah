import React from 'react';
import { useGameStore } from '../store/gameStore.ts';
import type { SystemId } from '../types/index.ts';
import { getHailSystemSprite, HAIL_SVG } from './cabin/hailAssets.ts';

const systemMeta: Record<SystemId, { name: string; desc: string; svgIcon: string }> = {
  scrubber: {
    name: 'MÁY TẠO O₂ & LỌC CO₂',
    desc: 'Điện phân & hút CO₂ giữ dưỡng khí sạch cho toàn trạm.',
    svgIcon: HAIL_SVG.sysOxygen,
  },
  recycler: {
    name: 'HỆ THỐNG TÁI CHẾ NƯỚC (WRS)',
    desc: 'Thu hồi 85–93% nước thải thành nước sinh hoạt tinh khiết.',
    svgIcon: HAIL_SVG.sysWater,
  },
  solar: {
    name: 'MÔ-ĐUN NĂNG LƯỢNG & PIN',
    desc: 'Lưu trữ và phân phối điện năng từ dàn pin Mặt Trời.',
    svgIcon: HAIL_SVG.sysPower,
  },
  airlock: {
    name: 'KHÓA KHÍ & CỔNG LIÊN LẠC',
    desc: 'Giữ áp suất khoang tàu và bảo vệ cửa xuất kích Rover.',
    svgIcon: HAIL_SVG.sysComms,
  },
};

export const SystemControls: React.FC = () => {
  const { gameState, repairSystem, upgradeSystem, config } = useGameStore();
  const { systems, resources, phase } = gameState;

  const canModify = phase === 'engineering';

  return (
    <div className="hail-sys-panel">
      <div className="hail-sys-header">
        <h2 className="flex items-center gap-2 text-sm font-bold tracking-wider text-[#E7E6DF]">
          <img src={HAIL_SVG.sysPower} alt="" className="w-4 h-4" />
          HỆ THỐNG SINH TỒN TRẠM (ECLSS &amp; POWER)
        </h2>
        <span className={`hail-phase-tag ${canModify ? 'is-ready' : ''}`}>
          {canModify ? 'PHA KỸ THUẬT: ĐƯỢC PHÉP BẢO TRÌ' : 'CHẾ ĐỘ XEM · CHUYỂN PHA KỸ THUẬT ĐỂ SỬA'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(Object.keys(systems) as SystemId[]).map((id) => {
          const sys = systems[id];
          const meta = systemMeta[id];
          const vis = getHailSystemSprite(id, sys.integrity);
          const integrityPct = Math.round(sys.integrity * 100);
          const isDamaged = sys.integrity < 0.95;
          const canRepair = canModify && isDamaged && resources.partsKg >= config.repairKg;
          const canUpgrade =
            canModify &&
            sys.level < 3 &&
            resources.partsKg >= (config.upgradeKg[sys.level as 1 | 2] || 999);

          const barColor =
            integrityPct > 70 ? '#91A978' : integrityPct > 40 ? '#D7B66C' : '#C57D59';

          return (
            <div
              key={id}
              className={`hail-sys-card ${vis.state !== 'ok' ? 'is-damaged' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="hail-sys-thumb">
                  <img src={vis.sprite} alt={meta.name} className="w-full h-full object-contain" draggable={false} />
                  {vis.overlay && (
                    <img src={vis.overlay} alt="" className="hail-fx-overlay" draggable={false} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <img src={meta.svgIcon} alt="" className="w-4 h-4 shrink-0" />
                      <h3 className="font-bold text-xs text-[#E7E6DF] truncate">{meta.name}</h3>
                    </div>
                    <span className="hail-level-pill">CẤP {sys.level}</span>
                  </div>
                  <p className="text-[11px] text-[#C7CBC8] leading-snug">{meta.desc}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span className="text-[#929B9D]">ĐỘ BỀN HOẠT ĐỘNG:</span>
                  <span style={{ color: barColor }} className="font-bold">
                    {integrityPct}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#263746] rounded-full overflow-hidden border border-[#59666D]/50">
                  <div
                    className="h-full transition-all duration-300"
                    style={{ width: `${integrityPct}%`, backgroundColor: barColor }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#59666D]/40">
                <button
                  type="button"
                  onClick={() => repairSystem(id)}
                  disabled={!canRepair}
                  className="hail-btn hail-btn--warn flex-1"
                >
                  <img src={HAIL_SVG.actRepair} alt="" className="w-3.5 h-3.5" />
                  <span>Sửa (-{config.repairKg} kg)</span>
                </button>

                {sys.level < 3 && (
                  <button
                    type="button"
                    onClick={() => upgradeSystem(id)}
                    disabled={!canUpgrade}
                    className="hail-btn hail-btn--accent flex-1"
                  >
                    <img src={HAIL_SVG.actUpgrade} alt="" className="w-3.5 h-3.5" />
                    <span>Lên Cấp {sys.level + 1}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
