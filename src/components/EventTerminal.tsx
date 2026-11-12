import React from 'react';
import { useGameStore } from '../store/gameStore.ts';
import { AlertOctagon, Terminal, ArrowRight, CheckCircle2 } from 'lucide-react';

export const EventTerminal: React.FC = () => {
  const { gameState, config, chooseEventOption, advancePhase } = useGameStore();
  const { activeEvent, phase, log, resources } = gameState;

  const currentEvent = config.events.find((e) => e.id === activeEvent);
  const isBriefing = phase === 'briefing';

  return (
    <div className="hud-panel rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
        <h2 className="text-sm font-bold tracking-wider text-slate-200 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          TERMINAL SỰ CỐ & NHẬT KÝ SỨ MỆNH
        </h2>
        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
          {isBriefing ? 'BÁO CÁO BAN SÁNG' : 'NHẬT KÝ HOẠT ĐỘNG'}
        </span>
      </div>

      {/* Active Incident Event Card (If in Briefing Phase) */}
      {isBriefing && currentEvent ? (
        <div className="bg-red-950/30 border-2 border-red-500/60 rounded-xl p-4 flex flex-col gap-3 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-900/40 border border-red-500/80 rounded-lg text-red-400">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-red-900 text-red-200 px-2 py-0.5 rounded font-bold">
                  BÁO ĐỘNG SỰ CỐ
                </span>
                <span className="text-[10px] text-slate-400 font-mono">DỮ LIỆU NASA DONKI</span>
              </div>
              <h3 className="text-base font-bold text-red-200 mt-0.5">{currentEvent.title}</h3>
            </div>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-mono bg-slate-950/70 p-3 rounded-lg border border-red-900/40">
            {currentEvent.prompt}
          </p>

          <div className="flex flex-col gap-2 pt-1">
            <div className="text-xs font-bold text-slate-300">LỰA CHỌN PHƯƠNG ÁN XỬ LÝ:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentEvent.choices.map((choice) => {
                const canAfford = resources.partsKg >= choice.partsKg;

                return (
                  <button
                    key={choice.id}
                    onClick={() => chooseEventOption(choice.id)}
                    disabled={!canAfford}
                    className="hud-button text-left bg-slate-900/90 hover:bg-cyan-950/80 hover:border-cyan-400 text-slate-100 border border-slate-700 p-3 rounded-lg flex flex-col justify-between gap-2"
                  >
                    <span className="font-semibold text-xs leading-snug">{choice.label}</span>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                      <span>CHI PHÍ PHỤ TÙNG:</span>
                      <span className={choice.partsKg > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                        {choice.partsKg > 0 ? `-${choice.partsKg} KG` : 'MIỄN PHÍ'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : isBriefing ? (
        <div className="bg-emerald-950/20 border border-emerald-600/50 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h4 className="text-xs font-bold text-emerald-300">KHÔNG CÓ SỰ CỐ NGUY HIỂM</h4>
              <p className="text-[11px] text-slate-400 font-mono">
                Trạm hoạt động ổn định. Bạn có thể tiến hành bước tiếp theo.
              </p>
            </div>
          </div>
          <button
            onClick={advancePhase}
            className="hud-button bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold flex items-center gap-1.5 whitespace-nowrap"
          >
            VÀO PHA KỸ THUẬT <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : null}

      {/* Mission Log Output */}
      <div className="bg-slate-950/90 rounded-lg p-3 border border-slate-800 text-xs font-mono text-slate-300 max-h-36 overflow-y-auto flex flex-col gap-1">
        {log.length === 0 ? (
          <span className="text-slate-500 italic">Chưa có bản ghi hoạt động...</span>
        ) : (
          log.map((entry, idx) => (
            <div key={idx} className="flex items-start gap-2 border-b border-slate-900 pb-1">
              <span className="text-cyan-500 font-bold">&gt;</span>
              <span>{entry}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
