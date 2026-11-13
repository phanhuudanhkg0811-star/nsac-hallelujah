import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore.ts';
import { Radio, PackagePlus, Truck, Send, Clock } from 'lucide-react';

export const CommsLogisticsPanel: React.FC = () => {
  const { gameState, config, requestResupply, transmitRadio, tickRadio } = useGameStore();
  const { phase, planet, missions, radio, radioClockMs } = gameState;

  const isComms = phase === 'comms';
  const transitSols = config.transitSols[planet];

  const [cargo, setCargo] = useState({
    oxygenKg: 15,
    waterL: 25,
    foodKg: 15,
    partsKg: 10,
  });
  const [radioMsg, setRadioMsg] = useState('Báo cáo telemetry định kỳ & dữ liệu địa chất về Houston');

  const totalMass = cargo.oxygenKg + cargo.waterL + cargo.foodKg + cargo.partsKg;
  const validMass = totalMass > 0 && totalMass <= config.maxCargoKg;
  const inTransitMissions = missions.filter((m) => m.status === 'in-transit');

  useEffect(() => {
    const hasPendingRadio = radio.some((r) => r.status !== 'reply-received');
    if (!hasPendingRadio) return;
    const timer = setInterval(() => {
      tickRadio(500);
    }, 500);
    return () => clearInterval(timer);
  }, [radio, tickRadio]);

  return (
    <div className="hud-panel rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
        <h2 className="text-sm font-bold tracking-wider text-slate-200 flex items-center gap-2">
          <Truck className="w-4 h-4 text-cyan-400" />
          HẬU CẦN TIẾP TẾ & LIÊN LẠC MẶT ĐẤT (CAPCOM)
        </h2>
        <span className="text-[10px] font-mono text-slate-400">
          {isComms ? 'ĐANG MỞ KÊNH LIÊN LẠC TRÁI ĐẤT' : 'MỞ Ở PHA LIÊN LẠC (COMMS)'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Resupply Cargo Pod Ordering */}
        <div className={`bg-slate-950/80 border border-slate-800 rounded-lg p-3 flex flex-col justify-between gap-2.5 ${!isComms ? 'opacity-60 pointer-events-none' : ''}`}>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <PackagePlus className="w-3.5 h-3.5" /> ĐẶT TÀU TIẾP TẾ QUỸ ĐẠO
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${validMass ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-red-950 text-red-300 border-red-700'}`}>
                Tải trọng: {totalMass}/{config.maxCargoKg} kg
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Thời gian bay tới {planet === 'moon' ? 'Mặt Trăng' : 'Sao Hỏa'}: <strong className="text-yellow-400">{transitSols} Sol</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <label className="flex flex-col gap-0.5">
              <span className="text-slate-400">O₂ (kg): {cargo.oxygenKg}</span>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={cargo.oxygenKg}
                onChange={(e) => setCargo({ ...cargo, oxygenKg: Number(e.target.value) })}
                className="accent-cyan-400"
              />
            </label>
            <label className="flex flex-col gap-0.5">
              <span className="text-slate-400">Nước (L): {cargo.waterL}</span>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={cargo.waterL}
                onChange={(e) => setCargo({ ...cargo, waterL: Number(e.target.value) })}
                className="accent-blue-400"
              />
            </label>
            <label className="flex flex-col gap-0.5">
              <span className="text-slate-400">Thức ăn (kg): {cargo.foodKg}</span>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={cargo.foodKg}
                onChange={(e) => setCargo({ ...cargo, foodKg: Number(e.target.value) })}
                className="accent-emerald-400"
              />
            </label>
            <label className="flex flex-col gap-0.5">
              <span className="text-slate-400">Phụ tùng (kg): {cargo.partsKg}</span>
              <input
                type="range"
                min="0"
                max="30"
                step="2"
                value={cargo.partsKg}
                onChange={(e) => setCargo({ ...cargo, partsKg: Number(e.target.value) })}
                className="accent-amber-400"
              />
            </label>
          </div>

          <button
            onClick={() => requestResupply(cargo)}
            disabled={!isComms || !validMass}
            className="hud-button bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/50 text-xs flex items-center justify-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5" />
            PHÓNG TÀU HÀNG TIẾP TẾ (ĐẾN Ở SOL {gameState.sol + transitSols})
          </button>
        </div>

        {/* Ground Control Radio & In-Transit Queue */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 flex flex-col justify-between gap-2.5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" /> LIÊN LẠC SÓNG VÔ TUYẾN DSN
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Trễ 1 chiều: {(config.radioLatencyMs[planet] / 1000).toFixed(1)}s
              </span>
            </div>

            <div className={`flex gap-1.5 ${!isComms ? 'opacity-60 pointer-events-none' : ''}`}>
              <input
                type="text"
                value={radioMsg}
                onChange={(e) => setRadioMsg(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-200"
                placeholder="Nội dung báo cáo về Trái Đất..."
              />
              <button
                onClick={() => transmitRadio(radioMsg)}
                disabled={!isComms || !radioMsg.trim()}
                className="hud-button bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/50 px-3 py-1 text-xs flex items-center gap-1"
              >
                <Send className="w-3 h-3" /> Gửi
              </button>
            </div>
          </div>

          {/* Active Cargo & Radio Status */}
          <div className="text-[10px] font-mono text-slate-300 border-t border-slate-800/80 pt-2 flex flex-col gap-1 max-h-28 overflow-y-auto">
            {inTransitMissions.length === 0 && radio.length === 0 ? (
              <span className="text-slate-500 italic">Chưa có tàu tiếp tế đang bay hoặc tín hiệu chờ...</span>
            ) : (
              <>
                {inTransitMissions.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-cyan-300 bg-cyan-950/30 px-2 py-0.5 rounded">
                    <span>🚀 {m.id}: +{m.payload.oxygenKg}O₂ +{m.payload.waterL}H₂O +{m.payload.foodKg}Food +{m.payload.partsKg}Parts</span>
                    <span className="font-bold text-yellow-400">Hạ cánh Sol {m.arrivalSol}</span>
                  </div>
                ))}
                {radio.slice(-3).map((r) => {
                  const remainingMs = Math.max(0, r.replyAtMs - radioClockMs);
                  return (
                    <div key={r.id} className="flex items-center justify-between text-purple-300 bg-purple-950/30 px-2 py-0.5 rounded">
                      <span className="truncate max-w-[180px]">📡 {r.message}</span>
                      <span className="flex items-center gap-1 text-[9px]">
                        <Clock className="w-2.5 h-2.5" />
                        {r.status === 'reply-received'
                          ? 'Houston đã phản hồi ✓'
                          : `Đang truyền (${(remainingMs / 1000).toFixed(1)}s)`}
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
