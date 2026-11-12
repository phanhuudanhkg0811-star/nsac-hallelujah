import React from 'react';
import { useGameStore } from '../store/gameStore.ts';
import { Sliders, RefreshCw, Wind, Moon, ArrowRight, ShieldCheck } from 'lucide-react';

export const RationingPanel: React.FC = () => {
  const { gameState, updatePlan, endSol, advancePhase } = useGameStore();
  const { plan, phase, planet } = gameState;

  const isRationing = phase === 'rationing';
  const isEngineering = phase === 'engineering';
  const isComms = phase === 'comms';
  const isMoon = planet === 'moon';

  return (
    <div className="hud-panel rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
        <h2 className="text-sm font-bold tracking-wider text-slate-200 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          ĐIỀU HÀNH VÀ PHÂN BỔ KHẨU PHẦN ĐÊM
        </h2>
        <span className="text-[10px] font-mono text-cyan-400 uppercase">
          PHA HIỆN TẠI: {phase.toUpperCase()}
        </span>
      </div>

      {/* Navigation flow buttons if not in Rationing yet */}
      {isEngineering && (
        <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-300">Đã kiểm tra xong các hệ thống trạm?</span>
          <button
            onClick={advancePhase}
            className="hud-button bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold flex items-center gap-1.5 text-xs"
          >
            SANG PHA LIÊN LẠC & TIẾP TẾ <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {isComms && (
        <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-300">Đã hoàn tất báo cáo vô tuyến với Trái Đất?</span>
          <button
            onClick={advancePhase}
            className="hud-button bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold flex items-center gap-1.5 text-xs"
          >
            SANG PHA PHÂN BỔ KHẨU PHẦN <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Allocation Sliders (Active in Rationing Phase) */}
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${!isRationing ? 'opacity-60 pointer-events-none' : ''}`}>
        {/* Oxygen Ration */}
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1.5">
          <div className="flex justify-between text-[11px] font-mono text-cyan-300">
            <span>KHẨU PHẦN O₂</span>
            <span className="font-bold">{Math.round(plan.oxygenFraction * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="1"
            step="0.1"
            value={plan.oxygenFraction}
            onChange={(e) => updatePlan({ oxygenFraction: parseFloat(e.target.value) })}
            className="accent-cyan-400 cursor-pointer w-full"
          />
          <span className="text-[9px] text-slate-500">Giảm sẽ gây căng thẳng và ngạt thở</span>
        </div>

        {/* Water Ration */}
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1.5">
          <div className="flex justify-between text-[11px] font-mono text-blue-300">
            <span>KHẨU PHẦN NƯỚC</span>
            <span className="font-bold">{Math.round(plan.waterFraction * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="1"
            step="0.1"
            value={plan.waterFraction}
            onChange={(e) => updatePlan({ waterFraction: parseFloat(e.target.value) })}
            className="accent-blue-400 cursor-pointer w-full"
          />
          <span className="text-[9px] text-slate-500">Thiếu nước làm tăng chỉ số khát nhanh</span>
        </div>

        {/* Food Ration */}
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1.5">
          <div className="flex justify-between text-[11px] font-mono text-emerald-300">
            <span>KHẨU PHẦN ĂN</span>
            <span className="font-bold">{Math.round(plan.foodFraction * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="1"
            step="0.1"
            value={plan.foodFraction}
            onChange={(e) => updatePlan({ foodFraction: parseFloat(e.target.value) })}
            className="accent-emerald-400 cursor-pointer w-full"
          />
          <span className="text-[9px] text-slate-500">Đói kéo dài gây sụt giảm thể lực</span>
        </div>

        {/* Rest Fraction */}
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1.5">
          <div className="flex justify-between text-[11px] font-mono text-purple-300">
            <span>NGHỈ NGƠI</span>
            <span className="font-bold">{Math.round(plan.restFraction * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.4"
            max="1"
            step="0.1"
            value={plan.restFraction}
            onChange={(e) => updatePlan({ restFraction: parseFloat(e.target.value) })}
            className="accent-purple-400 cursor-pointer w-full"
          />
          <span className="text-[9px] text-slate-500">Hồi phục mệt mỏi và giảm stress</span>
        </div>
      </div>

      {/* System Run Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-4 text-xs font-mono">
          <label className="flex items-center gap-2 cursor-pointer text-slate-200">
            <input
              type="checkbox"
              checked={plan.recycle}
              onChange={(e) => updatePlan({ recycle: e.target.checked })}
              className="accent-cyan-400 w-4 h-4 rounded"
            />
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" /> CHẠY LỌC NƯỚC WRS
            </span>
          </label>

          {!isMoon && (
            <label className="flex items-center gap-2 cursor-pointer text-slate-200">
              <input
                type="checkbox"
                checked={plan.moxie}
                onChange={(e) => updatePlan({ moxie: e.target.checked })}
                className="accent-cyan-400 w-4 h-4 rounded"
              />
              <span className="flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-cyan-400" /> CHẠY MOXIE (CO₂ ➔ O₂)
              </span>
            </label>
          )}
        </div>

        {/* END SOL BUTTON */}
        <button
          onClick={endSol}
          disabled={!isRationing}
          className="hud-button bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-bold px-6 py-2.5 flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] text-sm tracking-wider uppercase"
        >
          <Moon className="w-4 h-4" />
          KẾT THÚC SOL {gameState.sol}
        </button>
      </div>
    </div>
  );
};
