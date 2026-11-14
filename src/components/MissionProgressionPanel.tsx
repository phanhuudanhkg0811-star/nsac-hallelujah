import React from 'react';
import { useGameStore } from '../store/gameStore.ts';
import { evaluateMissionProgress } from '../engine/DaySimulationEngine.ts';
import { Rocket, CheckCircle2, Lock, Award, Compass } from 'lucide-react';

export const MissionProgressionPanel: React.FC = () => {
  const { gameState, config, launchToMars } = useGameStore();
  const evaluation = evaluateMissionProgress(gameState, config);
  const isMoon = gameState.planet === 'moon';
  const metCount = evaluation.checks.filter((c) => c.met).length;
  const totalCount = evaluation.checks.length;
  const progressPct = Math.round((metCount / totalCount) * 100);
  const tc = config.marsLaunch.transitConsumption;

  return (
    <div className="hud-panel-glow rounded-xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
        <h2 className="text-sm font-bold tracking-wider text-cyan-300 flex items-center gap-2">
          <Compass className="w-4 h-4 text-yellow-400" />
          {isMoon
            ? 'ĐIỀU KIỆN CHUYỂN TIẾP SỨ MỆNH: MẶT TRĂNG ➔ SAO HỎA'
            : 'MỤC TIÊU HOÀN THÀNH CHIẾN DỊCH SAO HỎA (ARES)'}
        </h2>
        <span className="text-[11px] font-mono bg-slate-950 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded font-bold">
          ĐẠT {metCount}/{totalCount} ({progressPct}%)
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
        <div
          className={`h-full transition-all duration-500 ${
            evaluation.canTransition
              ? 'bg-gradient-to-r from-emerald-400 to-cyan-400'
              : 'bg-gradient-to-r from-cyan-600 to-blue-500'
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
        {evaluation.checks.map((check) => (
          <div
            key={check.id}
            className={`p-2 rounded-lg border flex flex-col justify-between gap-1 ${
              check.met
                ? 'bg-emerald-950/25 border-emerald-600/50 text-emerald-200'
                : 'bg-slate-950/80 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-start justify-between gap-1">
              <span className="text-[10px] leading-tight font-sans font-semibold text-slate-200">
                {check.label}
              </span>
              {check.met ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/70">
              <span className={check.met ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {check.currentText}
              </span>
              <span className="text-slate-500">Yêu cầu: {check.targetText}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Action / Status Footer */}
      {isMoon ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 leading-relaxed">
            <span className="text-yellow-400 font-bold">Vật tư tiêu hao trên tàu liên hành tinh (Hohmann Transfer):</span>{' '}
            -{tc.oxygenKg}kg O₂, -{tc.waterL}L Nước, -{tc.foodKg}kg Thức ăn, -{tc.partsKg}kg Phụ tùng. Phần vật tư dư còn lại sẽ mang sang Sao Hỏa!
          </div>

          <button
            onClick={launchToMars}
            disabled={!evaluation.canTransition}
            className={`hud-button px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center gap-2 shrink-0 ${
              evaluation.canTransition
                ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white shadow-[0_0_25px_rgba(234,88,12,0.5)] animate-pulse'
                : 'bg-slate-800 text-slate-500 border border-slate-700'
            }`}
          >
            {evaluation.canTransition ? (
              <>
                <Rocket className="w-4 h-4" />
                PHÓNG TÀU ĐẾN SAO HỎA (ARES)
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                CHƯA ĐỦ ĐIỀU KIỆN KHỞI HÀNH ({metCount}/{totalCount})
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <span className="text-xs font-mono text-slate-300">
            Chiến dịch Sao Hỏa: Hãy vận hành máy MOXIE và vượt qua bão bụi toàn cầu (Sol 8 – Sol 16).
          </span>
          {evaluation.canTransition && (
            <div className="bg-emerald-950/80 border border-emerald-400 text-emerald-300 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <Award className="w-4 h-4 text-yellow-400" />
              SỨ MỆNH ARES HOÀN THÀNH XUẤT SẮC!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
