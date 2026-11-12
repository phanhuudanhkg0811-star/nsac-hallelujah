import { useState } from 'react';
import { useGameStore } from '../../store/gameStore.ts';
import { SystemControls } from '../SystemControls.tsx';
import {
  PARSECS_SYSTEM_UPGRADE_TABLE,
  type ParsecsSystemId,
} from '../../engine/ParsecsDecompiledEngine.ts';
import {
  SYSTEM_ICON_MAP,
  getItemIconSprite,
  assetUrl,
} from '../cabin/assets.ts';

const CRAFT_OPERATIONS = [
  { id: 'craft', label: 'Chế tạo vật phẩm', icon: 'CraftingIconCraft.webp' },
  { id: 'recycle', label: 'Tái chế thành phần', icon: 'CraftingIconRecycle.webp' },
  { id: 'upgrade', label: 'Nâng cấp thiết bị', icon: 'CraftingIconUpgrade.webp' },
  { id: 'repair', label: 'Sửa chữa hỏng hóc', icon: 'CraftingIconRepair.webp' },
] as const;

type CraftOperation = (typeof CRAFT_OPERATIONS)[number]['id'];

export function CraftingModal({ referenceMode }: { referenceMode: boolean }) {
  const {
    parsecsState,
    gameState,
    advancePhase,
    parsecsCraftSoup,
    parsecsItemOp,
    parsecsUpgradeShipSystem,
  } = useGameStore();
  const [craftOperation, setCraftOperation] = useState<CraftOperation | null>(
    null,
  );

  const craftItems = parsecsState.shelf.filter(item => {
    if (craftOperation === 'craft') return !item.owned;
    if (!item.owned || item.lockedOnExpedition) return false;
    if (craftOperation === 'repair') return item.damaged;
    if (craftOperation === 'upgrade') return !item.damaged && !item.upgraded;
    return craftOperation === 'recycle';
  });

  if (!referenceMode) {
    return (
      <div className="crafting-nasa-container">
        {gameState.phase === 'briefing' && !gameState.activeEvent && (
          <button className="mission-button mb-4" onClick={advancePhase}>
            Bắt đầu bảo trì hệ thống
          </button>
        )}
        <SystemControls />
        {gameState.phase !== 'engineering' && (
          <p className="mission-note mt-3">
            Bảo trì và nâng cấp thực hiện ở pha kỹ thuật, trước khi liên lạc và chia
            khẩu phần.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="crafting-terminal-sheet">
      {/* 1. Industrial Resource Status Bar */}
      <div className="crafting-materials-bar">
        <div className="material-meter-pill">
          <img
            src={assetUrl('IconChemicals.webp')}
            alt="Hóa chất"
            className="w-5 h-5 object-contain"
          />
          <div className="meter-info">
            <span>HÓA CHẤT</span>
            <strong>{parsecsState.resources.Chemical}</strong>
          </div>
        </div>

        <div className="material-meter-pill">
          <img
            src={assetUrl('IconMinerals.webp')}
            alt="Khoáng chất"
            className="w-5 h-5 object-contain"
          />
          <div className="meter-info">
            <span>KHOÁNG CHẤT</span>
            <strong>{parsecsState.resources.Mineral}</strong>
          </div>
        </div>

        <div className="material-meter-pill">
          <img
            src={assetUrl('IconPower.webp')}
            alt="Năng lượng"
            className="w-5 h-5 object-contain"
          />
          <div className="meter-info">
            <span>NĂNG LƯỢNG</span>
            <strong>{parsecsState.resources.Power}</strong>
          </div>
        </div>
      </div>

      {/* 2. Operations Menu or Action View */}
      {!craftOperation ? (
        <div className="crafting-home-selection">
          <h3 className="crafting-section-heading">CHỌN THAO TÁC KỸ THUẬT</h3>
          <div className="crafting-ops-grid">
            {CRAFT_OPERATIONS.map(({ id, label, icon }) => (
              <button
                type="button"
                key={id}
                className="crafting-op-card group"
                onClick={() => setCraftOperation(id)}
              >
                <div className="op-icon-wrap">
                  <img
                    src={assetUrl(icon)}
                    alt={label}
                    className="w-14 h-14 object-contain transition-transform group-hover:scale-110"
                  />
                </div>
                <strong className="op-label">{label}</strong>
                <span className="op-hint">Nhấp để mở danh mục →</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="crafting-active-panel">
          <div className="panel-top-nav">
            <button
              type="button"
              className="back-to-ops-btn"
              onClick={() => setCraftOperation(null)}
            >
              ← Quay lại danh mục thao tác
            </button>
            <span className="active-op-badge">
              {CRAFT_OPERATIONS.find(o => o.id === craftOperation)?.label}
            </span>
          </div>

          {/* Crafting Soup Sub-section */}
          {craftOperation === 'craft' && (
            <div className="soup-crafting-box">
              <div className="soup-craft-header">
                <img
                  src={assetUrl('IconSoup.webp')}
                  alt="Soup"
                  className="w-6 h-6 object-contain mr-2"
                />
                <strong>Chế tạo Hộp Súp Sinh Tồn</strong>
              </div>
              <div className="soup-batches-grid">
                {([1, 2, 3] as const).map(batch => {
                  const cost = batch === 1 ? 10 : batch === 2 ? 15 : 20;
                  const canCraft =
                    parsecsState.resources.Chemical >= cost &&
                    parsecsState.resources.Mineral >= cost;
                  const soupIcon =
                    batch === 1
                      ? 'IconSoup.webp'
                      : batch === 2
                      ? 'IconSoup2.webp'
                      : 'IconSoup3.webp';

                  return (
                    <button
                      key={batch}
                      type="button"
                      disabled={!canCraft}
                      className="soup-batch-card group"
                      onClick={() => parsecsCraftSoup(batch)}
                    >
                      <img
                        src={assetUrl(soupIcon)}
                        alt={`${batch} lon súp`}
                        className="w-10 h-10 object-contain mx-auto mb-1 group-hover:scale-105"
                      />
                      <strong>+{batch} Hộp súp</strong>
                      <small>
                        {cost} Hóa chất / {cost} Khoáng chất
                      </small>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Item Operations Grid */}
          <div className="craft-items-list-box">
            <h4 className="items-list-heading">
              {craftOperation === 'craft'
                ? 'Vật phẩm có thể chế tạo:'
                : craftOperation === 'repair'
                ? 'Thiết bị đang hư hỏng cần sửa:'
                : craftOperation === 'upgrade'
                ? 'Thiết bị có thể nâng cấp cấp 2:'
                : 'Vật phẩm có thể phân rã:'}
            </h4>

            {craftItems.length === 0 ? (
              <p className="no-items-text">
                Không có vật phẩm nào phù hợp với thao tác này.
              </p>
            ) : (
              <div className="craft-items-grid">
                {craftItems.map(item => {
                  const costText =
                    craftOperation === 'craft'
                      ? '10 Hóa chất · 5 Năng lượng'
                      : craftOperation === 'repair'
                      ? '10 Khoáng chất'
                      : craftOperation === 'upgrade'
                      ? '30 Hóa chất · 5 Năng lượng'
                      : 'Nhận +10 Hóa chất, +10 Khoáng chất';

                  const opKindMap: Record<
                    CraftOperation,
                    'craft-item' | 'repair-item' | 'upgrade-item' | 'recycle-item'
                  > = {
                    craft: 'craft-item',
                    repair: 'repair-item',
                    upgrade: 'upgrade-item',
                    recycle: 'recycle-item',
                  };

                  return (
                    <div key={item.id} className="craft-item-card">
                      <img
                        src={getItemIconSprite(item.id, item.damaged)}
                        alt={item.name}
                        className="w-10 h-10 object-contain mr-3"
                      />
                      <div className="item-meta">
                        <strong>
                          {item.upgraded ? item.upgradedName : item.name}
                        </strong>
                        <span className="item-cost-text">
                          Chi phí: {costText}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="execute-op-btn"
                        onClick={() =>
                          parsecsItemOp(opKindMap[craftOperation], item.id)
                        }
                      >
                        Thực hiện
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Station Subsystem Upgrades (Suit, Crafting, Navigation, Engine) */}
      <div className="station-systems-section">
        <h4 className="systems-heading">NÂNG CẤP CƠ SỞ HẠ TẦNG TRẠM</h4>
        <div className="systems-upgrade-grid">
          {(
            ['Crafting', 'Suit', 'Expedition', 'Engine'] as ParsecsSystemId[]
          ).map(sys => {
            const currentLvl = parsecsState.shipSystems[sys];
            const maxLvl = sys === 'Engine' ? 2 : 3;
            const nextLvl = currentLvl + 1;
            const isMax = currentLvl >= maxLvl;
            const cost =
              PARSECS_SYSTEM_UPGRADE_TABLE[sys]?.[
                nextLvl as 2 | 3
              ]?.cost;

            return (
              <div key={sys} className="system-upgrade-card">
                <img
                  src={SYSTEM_ICON_MAP[sys]}
                  alt={sys}
                  className="w-8 h-8 object-contain mr-2"
                />
                <div className="system-meta">
                  <strong>{sys}</strong>
                  <span>
                    Cấp {currentLvl} / {maxLvl}
                  </span>
                </div>
                {!isMax && cost ? (
                  <button
                    type="button"
                    className="system-upgrade-btn"
                    onClick={() => parsecsUpgradeShipSystem(sys)}
                  >
                    Lên Cấp {nextLvl}
                  </button>
                ) : (
                  <span className="system-max-tag">TỐI ĐA</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
