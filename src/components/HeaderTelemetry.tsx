import React from 'react';
import { useGameStore } from '../store/gameStore.ts';
import { Wind, Droplets, BatteryCharging, Utensils, Wrench, Radio, AlertTriangle } from 'lucide-react';

export const HeaderTelemetry: React.FC = () => {
  const { gameState } = useGameStore();
  const { resources, sol, planet, phase } = gameState;

  const phaseNames: Record<string, string> = {
    briefing: 'BÁO CÁO BAN SÁNG',
    engineering: 'QUẢN LÝ KỸ THUẬT',
    comms: 'LIÊN LẠC MẶT ĐẤT',
    rationing: 'PHÂN BỔ KHẨU PHẦN',
    ended: 'KẾT THÚC SỨ MỆNH',
  };

  const isMoon = planet === 'moon';
  const latency = isMoon ? '~1.3 Giây' : '~14 Phút';

  return (
    <header className="hud-panel border-b border-cyan-500/30 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Mission Sol */}
      <div className="flex items-center gap-3">
        <img
          src="/logo.jpg"
          alt="Mission Patch"
          className="w-12 h-12 rounded-full border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] object-cover"
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-widest text-cyan-400">NASA MISSION CONTROL</span>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700/60 px-1.5 py-0.5 rounded font-mono">
              {isMoon ? 'ARTEMIS BASE CAMP' : 'ARES OUTPOST'}
            </span>
          </div>
          <h1 className="text-lg font-bold tracking-wider text-slate-100 flex items-center gap-2">
            SOL <span className="text-yellow-400 font-mono text-xl">{sol}</span>
            <span className="text-xs text-slate-400 font-normal">| {phaseNames[phase] || phase}</span>
          </h1>
        </div>
      </div>

      {/* Real-time Telemetry Stats */}
      <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
        {/* O2 */}
        <div className="bg-slate-950/80 border border-slate-700/70 rounded-md px-3 py-1.5 flex items-center gap-2">
          <Wind className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-400">O₂ (KG)</div>
            <div className="text-cyan-300 font-bold">{resources.oxygenKg.toFixed(1)}</div>
          </div>
        </div>

        {/* Water */}
        <div className="bg-slate-950/80 border border-slate-700/70 rounded-md px-3 py-1.5 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-400" />
          <div>
            <div className="text-[10px] text-slate-400">NƯỚC (L)</div>
            <div className="text-blue-300 font-bold">{resources.waterL.toFixed(1)}</div>
          </div>
        </div>

        {/* Battery */}
        <div className="bg-slate-950/80 border border-slate-700/70 rounded-md px-3 py-1.5 flex items-center gap-2">
          <BatteryCharging className="w-4 h-4 text-yellow-400" />
          <div>
            <div className="text-[10px] text-slate-400">PIN (KWH)</div>
            <div className="text-yellow-300 font-bold">{resources.batteryKWh.toFixed(1)}</div>
          </div>
        </div>

        {/* Food */}
        <div className="bg-slate-950/80 border border-slate-700/70 rounded-md px-3 py-1.5 flex items-center gap-2">
          <Utensils className="w-4 h-4 text-emerald-400" />
          <div>
            <div className="text-[10px] text-slate-400">LƯƠNG THỰC</div>
            <div className="text-emerald-300 font-bold">{resources.foodKg.toFixed(1)} kg</div>
          </div>
        </div>

        {/* Parts */}
        <div className="bg-slate-950/80 border border-slate-700/70 rounded-md px-3 py-1.5 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-amber-400" />
          <div>
            <div className="text-[10px] text-slate-400">PHỤ TÙNG</div>
            <div className="text-amber-300 font-bold">{resources.partsKg} kg</div>
          </div>
        </div>

        {/* Radio Latency */}
        <div className="bg-slate-950/80 border border-slate-700/70 rounded-md px-3 py-1.5 flex items-center gap-2">
          <Radio className="w-4 h-4 text-purple-400" />
          <div>
            <div className="text-[10px] text-slate-400">TRỄ VÔ TUYẾN</div>
            <div className="text-purple-300 font-bold">{latency}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
