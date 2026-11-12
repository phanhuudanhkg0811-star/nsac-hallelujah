import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore.ts';
import { Sparkles, ArrowRight, BookOpen, Radio, CheckCircle, Activity } from 'lucide-react';

export const NightTransitionCutscene: React.FC = () => {
  const { isNightTransition, currentBrief, lastStatsDelta, gameState, referenceTransitionSol, completeNightTransition } = useGameStore();
  const sol = referenceTransitionSol ?? gameState.sol;
  const [displayedText, setDisplayedText] = useState('');

  // Typewriter effect for the NASA Science Brief content
  useEffect(() => {
    if (!isNightTransition || !currentBrief) {
      setDisplayedText('');
      return;
    }

    let currentIndex = 0;
    const fullText = currentBrief.content;
    setDisplayedText('');

    const interval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText((prev) => prev + fullText[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [isNightTransition, currentBrief]);

  if (!isNightTransition) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 md:p-12 animate-fade-in text-slate-100 select-none">
      {/* Background Ambient Glow & Scanlines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08)_0%,rgba(0,0,0,0.95)_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

      <div className="relative z-10 max-w-2xl w-full flex flex-col gap-6">
        {/* Mission Status Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-widest uppercase">
            <Radio className="w-4 h-4 animate-pulse text-cyan-400" />
            <span>NASA DEEP SPACE NETWORK // TELEMETRY REPORT</span>
          </div>
          <span className="text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
            SOL {sol - 1} HOÀN TẤT
          </span>
        </div>

        {/* Stats Deltas */}
        {lastStatsDelta && (
          <div className="grid grid-cols-3 gap-3 font-mono text-center text-xs">
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <div className="text-[10px] text-slate-400 mb-0.5">DƯỠNG KHÍ O₂</div>
              <div className={`text-base font-bold ${lastStatsDelta.oxygenDelta >= 0 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {lastStatsDelta.oxygenDelta > 0 ? `+${lastStatsDelta.oxygenDelta}` : lastStatsDelta.oxygenDelta} kg
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <div className="text-[10px] text-slate-400 mb-0.5">NƯỚC TÁI CHẾ (WRS)</div>
              <div className={`text-base font-bold ${lastStatsDelta.waterDelta >= 0 ? 'text-emerald-400' : 'text-blue-400'}`}>
                {lastStatsDelta.waterDelta > 0 ? `+${lastStatsDelta.waterDelta}` : lastStatsDelta.waterDelta} L
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <div className="text-[10px] text-slate-400 mb-0.5">PIN NĂNG LƯỢNG</div>
              <div className={`text-base font-bold ${lastStatsDelta.batteryDelta >= 0 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {lastStatsDelta.batteryDelta > 0 ? `+${lastStatsDelta.batteryDelta}` : lastStatsDelta.batteryDelta} kWh
              </div>
            </div>
          </div>
        )}

        {/* NASA Science Brief Box (Typewriter Cutscene) */}
        {currentBrief && (
          <div className="bg-slate-950/90 border-2 border-cyan-500/50 rounded-xl p-5 shadow-[0_0_30px_rgba(6,182,212,0.2)] flex flex-col gap-3">
            <div className="flex items-center gap-2 text-yellow-400">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h3 className="font-bold text-sm tracking-wider uppercase font-mono">
                NASA SCIENCE BRIEF: {currentBrief.title}
              </h3>
            </div>

            <div className="text-slate-200 text-sm leading-relaxed font-mono min-h-[5rem]">
              {displayedText}
              <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse" />
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tài liệu tham chiếu: {currentBrief.source}</span>
            </div>
          </div>
        )}

        {/* Action Button: Awake Outpost */}
        <div className="flex justify-center pt-2">
          <button
            onClick={completeNightTransition}
            className="hud-button bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-3 rounded-xl flex items-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] text-sm tracking-wider uppercase active:scale-95 transition-all"
          >
            <span>BƯỚC VÀO BÌNH MINH SOL {sol}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
