import React from 'react';
import { useGameStore } from '../store/gameStore.ts';
import { Eye, ShieldAlert, Thermometer, Radio } from 'lucide-react';

export const ViewportWindow: React.FC = () => {
  const { gameState } = useGameStore();
  const { planet, sol } = gameState;
  const isMoon = planet === 'moon';

  // Lunar night every 14 days, or Mars dust storm
  const isLunarNight = isMoon && Math.floor((sol - 1) / 14) % 2 === 1;

  return (
    <div className="relative rounded-xl overflow-hidden border-2 border-slate-700/80 shadow-2xl bg-black h-64 md:h-80 flex flex-col justify-between">
      {/* Dynamic Background Graphics */}
      <div
        className="absolute inset-0 transition-all duration-1000 bg-cover bg-center"
        style={{
          background: isMoon
            ? isLunarNight
              ? 'radial-gradient(ellipse at 50% 20%, #0a0f24 0%, #02040a 100%)'
              : 'radial-gradient(ellipse at 80% 10%, #1e293b 0%, #050811 80%)'
            : 'radial-gradient(ellipse at 50% 30%, #7c2d12 0%, #1c0a06 100%)',
        }}
      >
        {/* Distant Stars */}
        <div className="absolute inset-0 opacity-80 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* The Earth (Visible on the Moon) or Phobos (Mars) */}
        {isMoon ? (
          <div className="absolute top-6 left-12 w-14 h-14 rounded-full bg-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.6)] border border-blue-300 flex items-center justify-center overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-emerald-400 opacity-60 translate-x-1" />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/70 to-transparent" />
          </div>
        ) : (
          <div className="absolute top-10 right-16 w-8 h-8 rounded-full bg-amber-800 shadow-[0_0_15px_rgba(217,119,6,0.3)] opacity-70 border border-amber-600/40" />
        )}

        {/* Planetary Horizon Silhouette */}
        <div className="absolute bottom-0 inset-x-0 h-28 overflow-hidden">
          <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="w-full h-full">
            <path
              d={
                isMoon
                  ? 'M0,180 Q150,110 300,160 T600,120 T900,170 T1000,140 L1000,300 L0,300 Z'
                  : 'M0,190 Q200,140 450,180 T750,130 T1000,170 L1000,300 L0,300 Z'
              }
              fill={isMoon ? (isLunarNight ? '#0f172a' : '#334155') : '#991b1b'}
              opacity="0.9"
            />
            <path
              d={
                isMoon
                  ? 'M0,230 Q250,190 500,240 T850,200 T1000,230 L1000,300 L0,300 Z'
                  : 'M0,240 Q300,210 600,250 T900,220 T1000,240 L1000,300 L0,300 Z'
              }
              fill={isMoon ? (isLunarNight ? '#020617' : '#1e293b') : '#450a0a'}
            />
          </svg>
        </div>
      </div>

      {/* Cockpit HUD Overlay (Glass reflections & Telemetry) */}
      <div className="relative z-10 p-4 flex items-center justify-between text-xs font-mono text-cyan-300">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-md border border-cyan-500/30">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>CỬA SỔ QUAN SÁT #{isMoon ? 'LUNAR-VIEWPORT-01' : 'MARS-CHRYSE-02'}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-md border border-slate-700 flex items-center gap-1.5 text-slate-300">
            <Thermometer className="w-3.5 h-3.5 text-yellow-400" />
            <span>NGOÀI TRẠM: {isMoon ? (isLunarNight ? '-130°C' : '+110°C') : '-62°C'}</span>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-md border border-slate-700 flex items-center gap-1.5 text-emerald-300">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            <span>BỨC XẠ: 0.12 mSv/ngày</span>
          </div>
        </div>
      </div>

      {/* Target Crosshairs & Glass Scratches */}
      <div className="relative z-10 p-4 flex items-end justify-between font-mono text-[10px] text-slate-400">
        <div className="bg-slate-950/70 px-2 py-1 rounded border border-slate-800">
          TỌA ĐỘ: {isMoon ? '89.9°S, 0.0°E (SHACKLETON)' : '28.4°N, 319.9°E (CHRYSE)'}
        </div>
        <div className="text-cyan-400/80 font-bold tracking-widest uppercase">
          {isMoon ? (isLunarNight ? '● CHU KỲ ĐÊM TRĂNG (14 NGÀY)' : '○ CHU KỲ NGÀY TRĂNG') : '● SAO HỎA: KHÍ QUYỂN CO₂'}
        </div>
      </div>

      {/* Subtle Glass Frost / Border Glow */}
      <div className="absolute inset-0 pointer-events-none border-[6px] border-slate-800/40 rounded-xl shadow-[inset_0_0_30px_rgba(6,182,212,0.1)]" />
    </div>
  );
};
