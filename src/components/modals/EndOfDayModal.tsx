import { useGameStore } from '../../store/gameStore.ts';
import { getCrewJournalSprite, assetUrl } from '../cabin/assets.ts';

export function EndOfDayModal({
  referenceMode,
  onStarlog,
  onComms,
}: {
  referenceMode: boolean;
  onStarlog: () => void;
  onComms: () => void;
}) {
  const {
    gameState,
    parsecsState,
    dailyDecision,
    parsecsToggleRation,
    parsecsEndSol,
    endSol,
    advancePhase,
    updatePlan,
  } = useGameStore();

  const pending = referenceMode
    ? Boolean(parsecsState.currentEvent && !parsecsState.eventResolvedToday)
    : Boolean(gameState.activeEvent);
  const ended = referenceMode
    ? Boolean(parsecsState.gameOverReason)
    : gameState.phase === 'ended';
  const upgrade = parsecsState.activeSystemUpgrade;
  const expedition = parsecsState.activeExpedition;
  const sol = referenceMode ? parsecsState.sol : gameState.sol;

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
          Chỉ huy vui lòng duyệt cấp súp và y tế cho phi hành đoàn trước khi gạt
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
          {referenceMode
            ? parsecsState.gameOverReason
            : 'Nhiệm vụ kết thúc. Toàn bộ phi hành đoàn đã sơ tán an toàn.'}
        </div>
      )}

      {/* Section 1: Crew Rationing Rows */}
      <section className="clipboard-section">
        <div className="section-title-wrap">
          <span className="section-number">01</span>
          <h3 className="section-heading">CẤP PHÁT KHẨU PHẦN ĐÊM</h3>
        </div>

        {referenceMode ? (
          <>
            <div className="rationing-summary-bar">
              <span className="soup-stock-tag">
                <img
                  src={assetUrl('IconRationingSoups.webp')}
                  alt="Súp"
                  className="w-5 h-5 object-contain inline-block mr-1"
                />
                Kho trạm: <strong>{parsecsState.soupCans}</strong> hộp súp
              </span>
              <span className="soup-selected-tag">
                Đã duyệt:{' '}
                <strong>
                  {parsecsState.crew.filter(c => c.plannedSoup).length}
                </strong>{' '}
                suất
              </span>
            </div>

            <div className="rationing-crew-list">
              {parsecsState.crew.map(member => {
                const hungerPct = Math.round(
                  member.needs.need_hunger.value * 100,
                );
                const isHungry = member.needs.need_hunger.value < 0.4;
                const isStarving = member.needs.need_hunger.value < 0.2;

                return (
                  <div
                    key={member.id}
                    className={`rationing-crew-card ${
                      !member.isAlive ? 'is-dead' : ''
                    }`}
                  >
                    {/* Authentic Polaroid Photo */}
                    <div className="crew-polaroid">
                      <img
                        src={getCrewJournalSprite(member)}
                        alt={member.firstName}
                        draggable={false}
                        className="polaroid-photo"
                      />
                      {!member.isAlive && (
                        <span className="dead-tag">HY SINH</span>
                      )}
                    </div>

                    {/* Crew Info & Hunger Meter */}
                    <div className="crew-ration-info">
                      <strong className="crew-name">
                        {member.firstName} {member.surname}
                      </strong>
                      <span className="crew-status-desc">
                        {!member.isAlive
                          ? 'Đã tử vong'
                          : member.isAwayOnExpedition
                          ? 'Đang thám hiểm ngoài trạm'
                          : isStarving
                          ? 'Đói lả nghiêm trọng!'
                          : isHungry
                          ? 'Cần ăn súp hôm nay'
                          : 'Thể lực ổn định'}
                      </span>

                      {member.isAlive && !member.isAwayOnExpedition && (
                        <div className="hunger-gauge-wrap">
                          <span className="gauge-label">
                            Dinh dưỡng: {hungerPct}%
                          </span>
                          <div className="gauge-track">
                            <div
                              className={`gauge-fill ${
                                isStarving
                                  ? 'bg-red-500'
                                  : isHungry
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400'
                              }`}
                              style={{ width: `${Math.min(100, hungerPct)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Rationing Toggles */}
                    <div className="crew-ration-actions">
                      <label
                        className={`action-toggle soup ${
                          member.plannedSoup ? 'active' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          aria-label={`Cấp súp cho ${member.firstName}`}
                          checked={member.plannedSoup}
                          disabled={
                            ended ||
                            !member.isAlive ||
                            member.isAwayOnExpedition ||
                            (!member.plannedSoup &&
                              parsecsState.crew.filter(c => c.plannedSoup)
                                .length >= parsecsState.soupCans)
                          }
                          onChange={() =>
                            parsecsToggleRation(member.id, 'soup')
                          }
                        />
                        <img
                          src={assetUrl('IconRationingSoups.webp')}
                          alt=""
                          className="w-4 h-4 object-contain inline-block mr-1"
                        />
                        <span>Cấp súp</span>
                      </label>

                      <label
                        className={`action-toggle medkit ${
                          member.plannedMedkit ? 'active' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          aria-label={`Cấp thuốc cho ${member.firstName}`}
                          checked={member.plannedMedkit}
                          disabled={
                            ended ||
                            !member.isAlive ||
                            member.isAwayOnExpedition
                          }
                          onChange={() =>
                            parsecsToggleRation(member.id, 'medkit')
                          }
                        />
                        <img
                          src={assetUrl('IconMedkit.webp')}
                          alt=""
                          className="w-4 h-4 object-contain inline-block mr-1"
                        />
                        <span>Cấp y tế</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
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

            <div className="rationing-sliders-grid">
              {(
                [
                  ['oxygenFraction', 'Dưỡng khí O₂', '#5ce1e6'],
                  ['waterFraction', 'Nước sạch', '#4fa8e0'],
                  ['foodFraction', 'Lương thực', '#f5a623'],
                  ['restFraction', 'Nghỉ ngơi', '#b8e986'],
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
          </>
        )}
      </section>

      {/* Section 2: Daily Briefing Summary */}
      <section className="clipboard-section">
        <div className="section-title-wrap">
          <span className="section-number">02</span>
          <h3 className="section-heading">TỔNG KẾT QUYẾT ĐỊNH TRONG NGÀY</h3>
        </div>
        <div className="clipboard-summary-box">
          <p>
            {referenceMode
              ? parsecsState.lastEventOutcomeText ??
                'Chưa có quyết định biến cố nào được thực thi trong ngày.'
              : dailyDecision?.sol === sol
              ? dailyDecision?.summary
              : 'Hôm nay trạm vận hành theo quy trình kiểm tra định kỳ.'}
          </p>
        </div>
      </section>

      {/* Section 3: Crafting & Expeditions Status */}
      {referenceMode && (
        <section className="clipboard-section">
          <div className="section-title-wrap">
            <span className="section-number">03</span>
            <h3 className="section-heading">TIẾN ĐỘ CHẾ TẠO & THÁM HIỂM</h3>
          </div>
          <div className="clipboard-tasks-status">
            <p>
              🔧 <strong>Chế tạo:</strong>{' '}
              {upgrade
                ? `Đang nâng cấp ${upgrade.system} lên cấp ${upgrade.targetLevel} (Còn ${
                    upgrade.totalDays - upgrade.progressDays
                  } Sol)`
                : 'Trạm kỹ thuật đang sẵn sàng cho lệnh mới.'}
            </p>
            <p>
              🗺️ <strong>Thám hiểm:</strong>{' '}
              {expedition
                ? `${expedition.crewName} đang tại ${expedition.destinationTitle} (Còn ${
                    expedition.totalDays - expedition.elapsedDays
                  } Sol)`
                : 'Không có phi hành gia nào ngoài trạm.'}
            </p>
          </div>
        </section>
      )}

      {/* Big Stamp Confirmation Button */}
      <div className="end-day-confirm-bar">
        <div className="sol-badge-footer">
          <span>CHỐT KẾ HOẠCH SOL</span>
          <strong>{String(sol).padStart(3, '0')}</strong>
        </div>

        <button
          type="button"
          className="approved-rubber-stamp-btn group"
          disabled={
            ended ||
            pending ||
            (!referenceMode && gameState.phase !== 'rationing')
          }
          onClick={referenceMode ? parsecsEndSol : endSol}
        >
          <div className="stamp-inner">
            <img
              src={assetUrl('IconYes.webp')}
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
