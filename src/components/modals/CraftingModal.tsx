import { useGameStore } from '../../store/gameStore.ts';
import { SystemControls } from '../SystemControls.tsx';
import { HAIL_INVENTORY, HAIL_SVG } from '../cabin/hailAssets.ts';

export function CraftingModal() {
  const { gameState, advancePhase } = useGameStore();

  return (
    <div className="crafting-nasa-container">
      {gameState.phase === 'briefing' && !gameState.activeEvent && (
        <button type="button" className="mission-button mb-4" onClick={advancePhase}>
          Bắt đầu pha bảo trì kỹ thuật
        </button>
      )}

      <div className="hail-inventory-strip">
        <div className="hail-inv-chip">
          <img src={HAIL_INVENTORY.spareParts} alt="Phụ tùng" className="w-11 h-11 object-contain" draggable={false} />
          <div>
            <span>PHỤ TÙNG SỬA CHỮA</span>
            <strong>{Number(gameState.resources.partsKg.toFixed(1))} kg</strong>
          </div>
        </div>
        <div className="hail-inv-chip">
          <img src={HAIL_INVENTORY.filterSeal} alt="Lõi lọc & Gioăng" className="w-11 h-11 object-contain" draggable={false} />
          <div>
            <span>LÕI LỌC &amp; GIOĂNG</span>
            <strong>ECLSS Cấp {gameState.systems.scrubber.level}</strong>
          </div>
        </div>
        <div className="hail-inv-chip">
          <img src={HAIL_INVENTORY.medicalKit} alt="Bộ y tế" className="w-11 h-11 object-contain" draggable={false} />
          <div>
            <span>TRẠM Y TẾ</span>
            <strong>Sẵn sàng</strong>
          </div>
        </div>
        <div className="hail-inv-chip">
          <img src={HAIL_INVENTORY.sampleDrill} alt="Khoan mẫu" className="w-11 h-11 object-contain" draggable={false} />
          <div>
            <span>THIẾT BỊ ROVER</span>
            <strong>Khoan địa chất</strong>
          </div>
        </div>
      </div>

      <SystemControls />
      {gameState.phase !== 'engineering' && (
        <p className="mission-note mt-3 flex items-center gap-2">
          <img src={HAIL_SVG.stateWarn} alt="" className="w-4 h-4 shrink-0" />
          <span>
            Bảo trì và nâng cấp thực hiện ở pha Kỹ thuật, trước khi liên lạc CAPCOM và chia khẩu phần.
          </span>
        </p>
      )}
    </div>
  );
}
