import { useGameStore } from '../../store/gameStore.ts';
import { getHailCrewVisual, HAIL_SVG } from '../cabin/hailAssets.ts';

export function EndOfDayModal({
  onStarlog,
  onComms,
}: {
  onStarlog: () => void;
  onComms: () => void;
}) {
  const {
    gameState,
    dailyDecision,
    endSol,
    advancePhase,
    updatePlan,
  } = useGameStore();

  const pending = Boolean(gameState.activeEvent);
  const ended = gameState.phase === 'ended';
  const sol = gameState.sol;

  const prepareRations = () => {
    for (let i = 0; i < 3; i++) {
      const state = useGameStore.getState().gameState;
      if (
        state.activeEvent ||
        state.phase === 'rationing' ||
        state.phase === 'ended'
      ) {
        break;
      }
      advancePhase();
    }
  };

  return (
    <div className="end-day-clipboard-sheet">
      {/* Pinned Note Banner */}
      <div className="clipboard-paper-note">
        <span className="stamp-confidential">PHIẾU ĐIỀU ĐỘ KHẨU PHẦN</span>
        <p className="note-text">
          Chỉ huy vui lòng duyệt phân bổ khẩu phần ECLSS cho phi hành đoàn trước khi gạt
          cần kết thúc Sol.
        </p>
      </div>

      {pending && (
        <div className="mission-warning-callout">
          <p>⚠️ Còn chỉ thị trong ngày chưa giải quyết tại Starlog.</p>
          <button
            type="button"
            className="mission-button"
            onClick={onStarlog}
          >
            Mở Starlog để quyết định ngay
          </button>
        </div>
      )}

      {ended && (
        <div className="mission-danger-callout">
          Nhiệm vụ kết thúc. Toàn bộ phi hành đoàn đã sơ tán an toàn.
        </div>
      )}

      {/* Section 1: Crew Rationing Rows */}
      <section className="clipboard-section">
        <div className="section-title-wrap">
          <span className="section-number">01</span>
          <h3 className="section-heading">CẤP PHÁT KHẨU PHẦN ĐÊM</h3>
        </div>

        {gameState.phase !== 'rationing' && !ended && (
          <div className="mission-warning-callout">
            <p>
              Khẩu phần ECLSS sẽ được chốt sau khi hoàn tất kỹ thuật và liên
              lạc.
            </p>
            <div className="mission-actions">
              <button
                type="button"
                className="mission-button"
                onClick={onComms}
                disabled={pending}
              >
                Mở liên lạc
              </button>
              <button
                type="button"
                className="mission-button"
                onClick={prepareRations}
                disabled={pending}
              >
                Hoàn tất chuẩn bị, chia khẩu phần
              </button>
            </div>
          </div>
        )}

        <div className="hail-crew-ration-strip">
          {gameState.crew.map(member => {
            const vis = getHailCrewVisual(member.id);
            return (
              <div key={member.id} className="hail-ration-crew-pill">
                <img src={vis.portrait} alt={member.name} className="w-10 h-10 object-contain rounded bg-[#303B43]" draggable={false} />
                <div>
                  <strong>{member.name.split(' ')[0]}</strong>
                  <span>HP {Math.round(member.health)}%</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rationing-sliders-grid">
          {(
            [
              ['oxygenFraction', 'Dưỡng khí O₂', '#75A9A5'],
              ['waterFraction', 'Nước sạch', '#6E91B1'],
              ['foodFraction', 'Lương thực', '#91A978'],
              ['restFraction', 'Nghỉ ngơi', '#D7B66C'],
            ] as const
          ).map(([key, label, col]) => (
            <div key={key} className="slider-item">
              <div className="slider-header">
                <span>{label}</span>
                <output style={{ color: col }}>
                  {Math.round(gameState.plan[key] * 100)}%
                </output>
              </div>
              <input
                type="range"
                min={0.3}
                max={1}
                step={0.1}
                value={gameState.plan[key]}
                aria-label={label}
                disabled={gameState.phase !== 'rationing'}
                onChange={e =>
                  updatePlan({ [key]: Number(e.target.value) })
                }
              />
            </div>
          ))}
        </div>

        <div className="eclss-toggles">
          <label className="mission-check">
            <input
              type="checkbox"
              checked={gameState.plan.recycle}
              disabled={gameState.phase !== 'rationing'}
              onChange={e => updatePlan({ recycle: e.target.checked })}
            />
            <span>Chạy hệ thống tái chế nước WRS (Tiết kiệm 85% nước)</span>
          </label>

          {gameState.planet === 'mars' && (
            <label className="mission-check">
              <input
                type="checkbox"
                checked={gameState.plan.moxie}
                disabled={gameState.phase !== 'rationing'}
                onChange={e => updatePlan({ moxie: e.target.checked })}
              />
              <span>Chạy máy MOXIE chiết xuất O₂ từ khí quyển Sao Hỏa</span>
            </label>
          )}
        </div>
      </section>

      {/* Section 2: Daily Briefing Summary */}
      <section className="clipboard-section">
        <div className="section-title-wrap">
          <span className="section-number">02</span>
          <h3 className="section-heading">TỔNG KẾT QUYẾT ĐỊNH TRONG NGÀY</h3>
        </div>
        <div className="clipboard-summary-box">
          <p>
            {dailyDecision?.sol === sol
              ? dailyDecision?.summary
              : 'Hôm nay trạm vận hành theo quy trình kiểm tra định kỳ.'}
          </p>
        </div>
      </section>

      {/* Big Stamp Confirmation Button */}
      <div className="end-day-confirm-bar">
        <div className="sol-badge-footer">
          <span>CHỐT KẾ HOẠCH SOL</span>
          <strong>{String(sol).padStart(3, '0')}</strong>
        </div>

        <button
          type="button"
          className="approved-rubber-stamp-btn group"
          disabled={ended || pending || gameState.phase !== 'rationing'}
          onClick={endSol}
        >
          <div className="stamp-inner">
            <img
              src={HAIL_SVG.stateOk}
              alt=""
              className="w-5 h-5 object-contain inline-block mr-2"
            />
            <span>PHÊ DUYỆT & KẾT THÚC NGÀY</span>
          </div>
        </button>
      </div>
    </div>
  );
}
