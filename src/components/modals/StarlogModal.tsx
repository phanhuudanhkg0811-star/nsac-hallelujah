import { useState } from 'react';
import { useGameStore } from '../../store/gameStore.ts';
import { getHailEventScene, HAIL_SVG } from '../cabin/hailAssets.ts';

export function StarlogModal({
  onResolved,
}: {
  onResolved: (text: string) => void;
}) {
  const {
    gameState,
    config,
    chooseEventOption,
    advancePhase,
  } = useGameStore();
  const [history, setHistory] = useState(false);
  const event = config.events.find(e => e.id === gameState.activeEvent);
  const pending = Boolean(event && gameState.phase === 'briefing');
  const entries = [...gameState.log].reverse();

  const choose = (id: string) => {
    chooseEventOption(id);
    const next = useGameStore.getState();
    if (!next.gameState.activeEvent) {
      onResolved(next.gameState.log.at(-1) ?? 'Đã ghi nhận quyết định.');
    }
  };

  const promptText =
    event?.prompt ??
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
          Báo cáo Sol {gameState.sol}
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
          <div className="hail-event-banner">
            <img
              src={getHailEventScene(event?.id)}
              alt={event?.title ?? 'Nhật ký vận hành trạm'}
              className="hail-event-banner-img"
              draggable={false}
            />
            <div className="hail-event-banner-badge">
              <img
                src={pending ? HAIL_SVG.stateWarn : HAIL_SVG.stateOk}
                alt=""
                className="w-4 h-4"
              />
              <span>{pending ? 'SỰ CỐ CẦN XỬ LÝ' : 'TRẠNG THÁI BÌNH THƯỜNG'}</span>
            </div>
          </div>

          <div className="crt-terminal-screen">
            <div className="crt-terminal-header">
              <span className="crt-status-dot" />
              <span className="crt-terminal-title">
                {pending
                  ? 'CẢNH BÁO: CHỈ THỊ KHẨN CẤP TỪ TRUNG TÂM'
                  : 'STATUS: HOẠT ĐỘNG THƯỜNG NHẬT'}
              </span>
              <span className="crt-sol-badge">
                SOL {String(gameState.sol).padStart(2, '0')}
              </span>
            </div>

            <h3 className="crt-event-title">
              {event?.title ?? 'Hệ thống Trạm ổn định'}
            </h3>

            <p className="crt-prompt-text">{promptText}</p>
          </div>

          {pending ? (
            <div className="events-cards-section">
              <h4 className="events-cards-heading">
                <span>LỰA CHỌN PHƯƠNG ÁN XỬ LÝ</span>
                <small>Nhấp vào thẻ để đưa ra chỉ thị</small>
              </h4>

              <div className="events-cards-grid">
                {event?.choices.map((choice, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const disabled =
                    gameState.resources.partsKg < (choice.partsKg ?? 0);
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      className="events-choice-card hail-choice-card group"
                      disabled={disabled}
                      onClick={() => choose(choice.id)}
                    >
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
              <button
                type="button"
                className="mission-button-terminal group"
                onClick={() => {
                  if (gameState.phase === 'briefing') {
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
