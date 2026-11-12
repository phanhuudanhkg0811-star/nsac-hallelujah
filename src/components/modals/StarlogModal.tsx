import { useState } from 'react';
import { useGameStore } from '../../store/gameStore.ts';
import { formatStarlogText } from '../../engine/ParsecsDecompiledEngine.ts';
import { assetUrl } from '../cabin/assets.ts';

export function StarlogModal({
  referenceMode,
  onResolved,
}: {
  referenceMode: boolean;
  onResolved: (text: string) => void;
}) {
  const {
    gameState,
    parsecsState,
    config,
    chooseEventOption,
    parsecsChooseEventOption,
    advancePhase,
  } = useGameStore();
  const [history, setHistory] = useState(false);
  const event = config.events.find(e => e.id === gameState.activeEvent);
  const originalEvent = parsecsState.currentEvent;
  const pending = referenceMode
    ? Boolean(originalEvent && !parsecsState.eventResolvedToday)
    : Boolean(event && gameState.phase === 'briefing');
  const entries = referenceMode
    ? parsecsState.starlogHistory
    : [...gameState.log].reverse();

  const choose = (id: string | number) => {
    if (referenceMode) parsecsChooseEventOption(Number(id));
    else chooseEventOption(String(id));
    const next = useGameStore.getState();
    const resolved = referenceMode
      ? next.parsecsState.eventResolvedToday
      : !next.gameState.activeEvent;
    if (resolved) {
      onResolved(
        referenceMode
          ? next.parsecsState.lastEventOutcomeText ?? 'Đã ghi nhận quyết định.'
          : next.gameState.log.at(-1) ?? 'Đã ghi nhận quyết định.',
      );
    }
  };

  const promptText = referenceMode
    ? originalEvent
      ? formatStarlogText(originalEvent.prompt, parsecsState.crew)
      : 'Hôm nay không có báo cáo sự kiện khẩn cấp. Mọi hệ thống trong tầm kiểm soát.'
    : event?.prompt ??
      'Kiểm tra sức khỏe phi hành đoàn, bảo trì hệ thống và chuẩn bị khẩu phần cho đêm nay.';

  return (
    <article className="starlog-sheet">
      {/* Tab Controls with Retro Terminal Buttons */}
      <nav className="mission-tabs" aria-label="Chế độ Starlog">
        <button
          type="button"
          aria-pressed={!history}
          className="tab-crt-btn"
          onClick={() => setHistory(false)}
        >
          <span className="tab-indicator" />
          Báo cáo Sol {referenceMode ? parsecsState.sol : gameState.sol}
        </button>
        <button
          type="button"
          aria-pressed={history}
          className="tab-crt-btn"
          onClick={() => setHistory(true)}
        >
          <span className="tab-indicator" />
          Nhật ký lưu trữ ({entries.length})
        </button>
      </nav>

      {history ? (
        <div className="starlog-history-paper">
          <div className="paper-header">
            <span>NHẬT KÝ HÀNH TRÌNH TỰ ĐỘNG · BẢN IN GIẤY</span>
            <span>LƯU TRỮ TRẠM</span>
          </div>
          <ol className="starlog-history-list">
            {entries.map((entry, i) => (
              <li key={i} className="starlog-history-entry">
                <span className="history-bullet">▶</span>
                <p className="history-text">{entry}</p>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <>
          {/* CRT Terminal Screen Display Box */}
          <div className="crt-terminal-screen">
            <div className="crt-terminal-scanlines" aria-hidden="true" />
            <div className="crt-terminal-glow" aria-hidden="true" />

            <div className="crt-terminal-header">
              <span className="crt-status-dot" />
              <span className="crt-terminal-title">
                {pending
                  ? '⚡ CẢNH BÁO: CHỈ THỊ KHẨN CẤP TỪ TRUNG TÂM'
                  : 'STATUS: HOẠT ĐỘNG THƯỜNG NHẬT'}
              </span>
              <span className="crt-sol-badge">
                SOL {String(referenceMode ? parsecsState.sol : gameState.sol).padStart(3, '0')}
              </span>
            </div>

            <h3 className="crt-event-title">
              {referenceMode
                ? originalEvent
                  ? `Sự kiện ${originalEvent.category || 'Sol ' + parsecsState.sol}`
                  : `Nhật ký Sol ${parsecsState.sol}`
                : event?.title ?? 'Trạm ổn định'}
            </h3>

            <p className="crt-prompt-text">{promptText}</p>
          </div>

          {/* Decision Cards (EventsCard.webp Punchcards) */}
          {pending ? (
            <div className="events-cards-section">
              <h4 className="events-cards-heading">
                <span>LỰA CHỌN PHƯƠNG ÁN XỬ LÝ</span>
                <small>Nhấp vào thẻ để đưa ra chỉ thị</small>
              </h4>

              <div className="events-cards-grid">
                {referenceMode
                  ? originalEvent?.options.map((option, i) => {
                      const letter = String.fromCharCode(65 + i);
                      return (
                        <button
                          key={i}
                          type="button"
                          className="events-choice-card group"
                          onClick={() => choose(i)}
                        >
                          <div className="events-card-bg">
                            <img
                              src={assetUrl('EventsCard.webp')}
                              alt=""
                              draggable={false}
                              className="w-full h-full object-fill pointer-events-none"
                            />
                          </div>

                          <div className="events-card-content">
                            <div className="events-card-stamp">
                              <span className="stamp-letter">{letter}</span>
                            </div>
                            <p className="events-card-text">{option}</p>
                            <span className="events-card-hint">
                              ẤN ĐỂ CHỌN PHƯƠNG ÁN {letter}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  : event?.choices.map((choice, i) => {
                      const letter = String.fromCharCode(65 + i);
                      const disabled =
                        gameState.resources.partsKg < (choice.partsKg ?? 0);
                      return (
                        <button
                          key={choice.id}
                          type="button"
                          className="events-choice-card group"
                          disabled={disabled}
                          onClick={() => choose(choice.id)}
                        >
                          <div className="events-card-bg">
                            <img
                              src={assetUrl('EventsCard.webp')}
                              alt=""
                              draggable={false}
                              className="w-full h-full object-fill pointer-events-none"
                            />
                          </div>

                          <div className="events-card-content">
                            <div className="events-card-stamp">
                              <span className="stamp-letter">{letter}</span>
                            </div>
                            <p className="events-card-text">{choice.label}</p>
                            {choice.partsKg ? (
                              <span className="events-card-cost">
                                Tiêu tốn: {choice.partsKg} kg phụ tùng
                              </span>
                            ) : (
                              <span className="events-card-cost free">
                                Không tốn phụ tùng
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
              </div>
            </div>
          ) : (
            <div className="starlog-resolved-actions">
              {referenceMode && parsecsState.lastEventOutcomeText && (
                <div className="starlog-outcome-paper">
                  <strong>KẾT QUẢ XỬ LÝ GẦN NHẤT:</strong>
                  <p>{parsecsState.lastEventOutcomeText}</p>
                </div>
              )}

              <button
                type="button"
                className="mission-button-terminal group"
                onClick={() => {
                  if (!referenceMode && gameState.phase === 'briefing') {
                    advancePhase();
                  }
                  onResolved('Đã ghi nhận Starlog. Buồng trạm sẵn sàng.');
                }}
              >
                <span>Trở về buồng tàu</span>
                <span className="arrow">→</span>
              </button>
            </div>
          )}
        </>
      )}
    </article>
  );
}
