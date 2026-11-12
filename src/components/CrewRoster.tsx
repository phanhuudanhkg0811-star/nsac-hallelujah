import React from 'react';
import { useGameStore } from '../store/gameStore.ts';
import { Heart, Brain, Zap, Coffee, Droplet, UserCheck, AlertCircle } from 'lucide-react';

const roleTitles: Record<string, { title: string; color: string; badge: string }> = {
  cmd: { title: 'CHỈ HUY (COMMANDER)', color: 'border-blue-500/50 text-blue-400', badge: 'CMD' },
  eng: { title: 'KỸ SƯ TRẠM (ENGINEER)', color: 'border-amber-500/50 text-amber-400', badge: 'ENG' },
  doc: { title: 'BÁC SĨ (MEDICAL OFFICER)', color: 'border-emerald-500/50 text-emerald-400', badge: 'MED' },
  geo: { title: 'NHÀ ĐỊA CHẤT (GEOLOGIST)', color: 'border-purple-500/50 text-purple-400', badge: 'GEO' },
};

export const CrewRoster: React.FC = () => {
  const { gameState } = useGameStore();
  const { crew } = gameState;

  return (
    <div className="hud-panel rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
        <h2 className="text-sm font-bold tracking-wider text-slate-200 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-cyan-400" />
          PHI HÀNH ĐOÀN TIỀN ĐỒN ({crew.filter(c => c.status !== 'evacuated').length}/{crew.length})
        </h2>
        <span className="text-[10px] font-mono text-slate-400 uppercase">TIÊU THỤ: 0.84 KG O₂ / NGƯỜI</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {crew.map((member) => {
          const role = roleTitles[member.id] || { title: 'PHI HÀNH GIA', color: 'border-slate-500 text-slate-400', badge: 'CREW' };
          const isFit = member.status === 'fit';
          const isImpaired = member.status === 'impaired';

          return (
            <div
              key={member.id}
              className={`bg-slate-950/70 border rounded-lg p-3 flex flex-col justify-between gap-2.5 transition-all ${
                isFit
                  ? 'border-slate-700/70 hover:border-cyan-500/40'
                  : isImpaired
                  ? 'border-yellow-600/70 bg-yellow-950/20'
                  : 'border-red-600/70 opacity-50'
              }`}
            >
              {/* Header: Name and Status */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${role.color} bg-slate-900`}>
                    {role.badge}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      isFit
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                        : isImpaired
                        ? 'bg-yellow-950 text-yellow-400 border border-yellow-700'
                        : 'bg-red-950 text-red-400 border border-red-700'
                    }`}
                  >
                    {member.status === 'fit' ? 'ỔN ĐỊNH' : member.status === 'impaired' ? 'NGUY CƠ' : 'SƠ TÁN'}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-100">{member.name}</h3>
                <p className="text-[10px] text-slate-400">{role.title}</p>
              </div>

              {/* Health Progress Bar */}
              <div>
                <div className="flex justify-between text-[10px] font-mono mb-1 text-slate-400">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-red-400" /> SỨC KHỎE
                  </span>
                  <span className="font-bold text-slate-200">{member.health}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      member.health > 60 ? 'bg-emerald-400' : member.health > 30 ? 'bg-yellow-400' : 'bg-red-500'
                    }`}
                    style={{ width: `${member.health}%` }}
                  />
                </div>
              </div>

              {/* Needs / Sub-stats */}
              <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-300 pt-1 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-0.5"><Zap className="w-2.5 h-2.5 text-yellow-400" /> Mệt:</span>
                  <span className={member.fatigue > 60 ? 'text-yellow-400 font-bold' : ''}>{member.fatigue}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-0.5"><Brain className="w-2.5 h-2.5 text-purple-400" /> Stress:</span>
                  <span className={member.stress > 60 ? 'text-yellow-400 font-bold' : ''}>{member.stress}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-0.5"><Coffee className="w-2.5 h-2.5 text-amber-500" /> Đói:</span>
                  <span className={member.hunger > 60 ? 'text-red-400 font-bold' : ''}>{member.hunger}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-0.5"><Droplet className="w-2.5 h-2.5 text-blue-400" /> Khát:</span>
                  <span className={member.thirst > 60 ? 'text-red-400 font-bold' : ''}>{member.thirst}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
