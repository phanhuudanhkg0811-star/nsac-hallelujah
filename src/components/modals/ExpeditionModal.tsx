import { useState } from 'react';
import { AlertTriangle, Compass } from 'lucide-react';
import { useGameStore } from '../../store/gameStore.ts';
import { PARSECS_CATALOG } from '../../engine/ParsecsDecompiledEngine.ts';
import {
  DESTINATION_SPRITE_MAP,
  getItemIconSprite,
  assetUrl,
} from '../cabin/assets.ts';

export function ExpeditionModal({
  referenceMode,
}: {
  referenceMode: boolean;
}) {
  const { parsecsState, parsecsSendExpedition } = useGameStore();
  const availableExplorers = parsecsState.crew.filter(
    c => c.isAlive && !c.isAwayOnExpedition,
  );
  const [selectedDestId, setSelectedDestId] = useState(
    PARSECS_CATALOG.expeditionDestinations[0]?.id ?? '',
  );
  const [selectedExplorerId, setSelectedExplorerId] = useState(
    availableExplorers.find(c => !c.isCaptain)?.id ??
      availableExplorers[0]?.id ??
      '',
  );
  const [selectedExpItems, setSelectedExpItems] = useState<string[]>([]);

  const selectedDest = PARSECS_CATALOG.expeditionDestinations.find(
    d => d.id === selectedDestId,
  );

  const toggleExpItem = (id: string) => {
    setSelectedExpItems(items =>
      items.includes(id)
        ? items.filter(x => x !== id)
        : items.length < 3
        ? [...items, id]
        : items,
    );
  };

  if (!referenceMode) {
    return (
      <div className="mission-empty">
        <img
          src={assetUrl('SpaceshipItemSuit.png')}
          alt="Bộ giáp EVA"
          className="w-24 h-auto mx-auto mb-3"
        />
        <h3>Chưa có nhiệm vụ EVA</h3>
        <p>
          Chế độ Hail hiện vận hành theo quy trình trạm. Các chuyến thám hiểm bề
          mặt khả dụng trong chế độ Parsecs 1.3.2.
        </p>
      </div>
    );
  }

  const destSprite = selectedDest
    ? DESTINATION_SPRITE_MAP[selectedDest.id] ??
      'Planet01ExpeditionDestinationMap.webp'
    : 'Planet01ExpeditionDestinationMap.webp';

  return (
    <div className="expedition-terminal-sheet">
      {/* 1. Radar Map Banner */}
      <div className="expedition-map-banner">
        <div className="map-radar-frame">
          <img
            src={assetUrl('ExpeditionDestinationMap.webp')}
            alt="Bản đồ thám hiểm"
            draggable={false}
            className="w-full h-36 object-cover rounded-lg border border-emerald-500/40 opacity-80"
          />
          <div className="radar-sweep-line" aria-hidden="true" />
          <div className="radar-coords-tag">
            <span>QUỸ ĐẠO: {parsecsState.currentPlanet}</span>
            <span>RADAR: QUÉT MỤC TIÊU HOÀN TẤT</span>
          </div>
        </div>
      </div>

      {/* 2. Active Ongoing Expedition Status */}
      {parsecsState.activeExpedition ? (
        <div className="active-expedition-banner">
          <div className="active-exp-title">
            🚀 <strong>ĐANG THÁM HIỂM NGOÀI TRẠM:</strong>{' '}
            {parsecsState.activeExpedition.destinationTitle}
          </div>
          <p className="active-exp-detail">
            Phi hành gia: <strong>{parsecsState.activeExpedition.crewName}</strong> ·
            Thời gian dự kiến trở về: còn{' '}
            <strong>
              {parsecsState.activeExpedition.totalDays -
                parsecsState.activeExpedition.elapsedDays}
            </strong>{' '}
            Sol.
          </p>
          <div className="active-exp-threats">
            Mối nguy giáp bảo hộ đã chặn:{' '}
            {parsecsState.activeExpedition.blockedThreats.join(', ') || 'Không có'}
          </div>
        </div>
      ) : availableExplorers.length === 0 ? (
        <div className="parsecs-expedition-unavailable">
          <AlertTriangle aria-hidden="true" />
          <strong>Hệ thống chưa khả dụng</strong>
          <p>Không còn thành viên nào trong trạm có đủ thể lực xuất phát.</p>
        </div>
      ) : (
        /* 3. Planning Configuration Form */
        <div className="expedition-planning-grid">
          {/* Destination Selector & Preview Card */}
          <div className="dest-config-col">
            <label className="config-label">1. CHỌN ĐỊA ĐIỂM THÁM HIỂM:</label>
            <select
              aria-label="Điểm đến"
              value={selectedDestId}
              onChange={e => setSelectedDestId(e.target.value)}
              className="dest-select-input"
            >
              {PARSECS_CATALOG.expeditionDestinations.map(d => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.planet})
                </option>
              ))}
            </select>

            {selectedDest && (
              <div className="dest-preview-card">
                <img
                  src={assetUrl(destSprite)}
                  alt={selectedDest.title}
                  draggable={false}
                  className="dest-artwork"
                />
                <div className="dest-info">
                  <strong>{selectedDest.title}</strong>
                  <p>{selectedDest.description}</p>
                  <span className="dest-time-tag">
                    ⏱️ Khu vực: {selectedDest.planet} · Dự kiến 3-5 Sol
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Crew & Equipment Selection */}
          <div className="loadout-config-col">
            {/* Explorer Choice */}
            <div className="config-subgroup">
              <label className="config-label">
                2. CHỌN PHI HÀNH GIA XUẤT PHÁT:
              </label>
              <div className="crew-radio-list">
                {availableExplorers.map(c => (
                  <label
                    key={c.id}
                    className={`crew-radio-pill ${
                      selectedExplorerId === c.id ? 'selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="explorer"
                      value={c.id}
                      checked={selectedExplorerId === c.id}
                      onChange={() => setSelectedExplorerId(c.id)}
                    />
                    <span>
                      {c.firstName} {c.surname}{' '}
                      {c.isCaptain && '(Chỉ huy)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Equipment Loadout (Up to 3 items) */}
            <div className="config-subgroup">
              <label className="config-label">
                3. TRANG BỊ MANG THEO (Tối đa 3 món):
              </label>
              <div className="loadout-items-grid">
                {parsecsState.shelf
                  .filter(i => i.owned && !i.lockedOnExpedition)
                  .map(item => {
                    const isSelected = selectedExpItems.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`item-slot-btn ${
                          isSelected ? 'selected' : ''
                        }`}
                        onClick={() => toggleExpItem(item.id)}
                      >
                        <img
                          src={getItemIconSprite(item.id, item.damaged)}
                          alt={item.name}
                          className="w-8 h-8 object-contain mb-1"
                        />
                        <span className="item-name">{item.name}</span>
                        {item.damaged && (
                          <small className="dmg-badge">Hỏng</small>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Launch Action Button */}
            <button
              type="button"
              className="launch-expedition-btn group"
              onClick={() => {
                if (selectedDest && selectedExplorerId) {
                  parsecsSendExpedition(
                    selectedDest.id,
                    selectedExplorerId,
                    selectedExpItems,
                  );
                }
              }}
            >
              <div className="launch-btn-inner">
                <Compass className="w-5 h-5 mr-2 inline-block animate-spin-slow" />
                <span>PHÊ DUYỆT XUẤT PHÁT THÁM HIỂM</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
