import React from 'react';
import { useGameStore } from '../store/gameStore.ts';
import type { SystemId } from '../types/index.ts';
import { Cpu, RefreshCw, Sun, DoorOpen, Wrench, ArrowUpCircle } from 'lucide-react';

const systemMeta: Record<SystemId, { name: string; desc: string; icon: any }> = {
  scrubber: {
    name: 'BỘ LỌC KHÍ CO₂ (SCRUBBER)',
    desc: 'Hút khí carbon và tái tạo dưỡng khí thở cho trạm.',
    icon: Cpu,
  },
  recycler: {
    name: 'MÁY TUẦN HOÀN NƯỚC (WRS)',
    desc: 'Tái chế 85–93% nước thải thành nước sạch tinh khiết.',
    icon: RefreshCw,
  },
  solar: {
    name: 'MẠNG LƯỚI ĐIỆN QUANG ĐIỆN (SOLAR)',
    desc: 'Hấp thụ ánh sáng mặt trời nạp vào pin lưu trữ trung tâm.',
    icon: Sun,
  },
  airlock: {
    name: 'KHÓA KHÍ ÁP SUẤT (AIRLOCK)',
    desc: 'Ngăn chặn thất thoát áp suất và dưỡng khí ra ngoài không gian.',
    icon: DoorOpen,
  },
};

export const SystemControls: React.FC = () => {
  const { gameState, repairSystem, upgradeSystem, config } = useGameStore();
  const { systems, resources, phase } = gameState;

  const canModify = phase === 'engineering';

  return (
    <div className="hud-panel rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
        <h2 className="text-sm font-bold tracking-wider text-slate-200 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          HỆ THỐNG TRẠM SINH TỒN (ECLSS & POWER)
        </h2>
        <span className="text-[10px] font-mono text-slate-400">
          {canModify ? 'GIAI ĐOẠN: ĐƯỢC PHÉP SỬA CHỮA / NÂNG CẤP' : 'CHỈ ĐỌC (HÃY CHUYỂN QUA PHA KỸ THUẬT)'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(Object.keys(systems) as SystemId[]).map((id) => {
          const sys = systems[id];
          const meta = systemMeta[id];
          const Icon = meta.icon;
          const integrityPct = Math.round(sys.integrity * 100);
          const isDamaged = sys.integrity < 0.95;
          const canRepair = canModify && isDamaged && resources.partsKg >= config.repairKg;
          const canUpgrade = canModify && sys.level < 3 && resources.partsKg >= (config.upgradeKg[sys.level as 1 | 2] || 999);

          return (
            <div
              key={id}
              className={`bg-slate-950/80 border rounded-lg p-3 flex flex-col justify-between gap-3 ${
                isDamaged ? 'border-amber-600/70' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-xs text-slate-100">{meta.name}</h3>
                  </div>
                  <span className="text-[10px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-300 px-2 py-0.5 rounded font-bold">
                    CẤP {sys.level}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">{meta.desc}</p>
              </div>

              {/* Integrity Bar */}
              <div>
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-slate-400">ĐỘ BỀN HOẠT ĐỘNG:</span>
                  <span className={integrityPct < 60 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {integrityPct}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      integrityPct > 70 ? 'bg-cyan-400' : integrityPct > 40 ? 'bg-amber-400' : 'bg-red-500'
                    }`}
                    style={{ width: `${integrityPct}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                <button
                  onClick={() => repairSystem(id)}
                  disabled={!canRepair}
                  className="hud-button flex-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-600/50 flex items-center justify-center gap-1.5 text-xs"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Sửa (-{config.repairKg}kg)
                </button>

                {sys.level < 3 && (
                  <button
                    onClick={() => upgradeSystem(id)}
                    disabled={!canUpgrade}
                    className="hud-button flex-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-600/50 flex items-center justify-center gap-1.5 text-xs"
                  >
                    <ArrowUpCircle className="w-3.5 h-3.5" />
                    Lên Cấp {sys.level + 1}
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
