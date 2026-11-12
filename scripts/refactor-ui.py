from pathlib import Path

root = Path(__file__).resolve().parents[1]
components = root / 'src/components'
old = (components / 'ParsecsSurvivalBench.tsx').read_text(encoding='utf-8')
for folder in ['cabin', 'hud', 'modals']:
    (components / folder).mkdir(exist_ok=True)

helpers = old[old.index('const ASSET_BASE'):old.index('export const ParsecsSurvivalBench')]
helpers = helpers.replace('const ', 'export const ').replace('function ', 'export function ')
# Only declarations at module scope are exports.
helpers = helpers.replace('  export const ', '  const ').replace('  export function ', '  function ')
(components / 'cabin/assets.ts').write_text("import type { ParsecsCrewRuntime, ParsecsShelfItem, ParsecsSystemId } from '../../engine/ParsecsDecompiledEngine.ts';\n" + helpers, encoding='utf-8')

craft = old[old.index("              {referenceMode && panel === 'craft' && !craftOperation"):old.index("              {referenceMode && panel === 'expedition' && (", old.index("              {referenceMode && panel === 'craft' && !craftOperation"))]
craft = craft.replace("referenceMode && panel === 'craft' && ", '')
craft = craft.replace('Chế tạo Súp (ConsumableRemedium):', 'Chế tạo súp')
craft_header = '''import { useState } from 'react';
import { useGameStore } from '../../store/gameStore.ts';
import { SystemControls } from '../SystemControls.tsx';
import { PARSECS_SYSTEM_UPGRADE_TABLE, type ParsecsSystemId } from '../../engine/ParsecsDecompiledEngine.ts';
import { ASSET_BASE, SYSTEM_ICON_MAP, getItemIconSprite } from '../cabin/assets.ts';
const CRAFT_OPERATIONS = [
  { id: 'craft', label: 'Chế tạo', icon: 'CraftingIconCraft.webp' },
  { id: 'recycle', label: 'Tái chế', icon: 'CraftingIconRecycle.webp' },
  { id: 'upgrade', label: 'Nâng cấp', icon: 'CraftingIconUpgrade.webp' },
  { id: 'repair', label: 'Sửa chữa', icon: 'CraftingIconRepair.webp' },
] as const;
type CraftOperation = typeof CRAFT_OPERATIONS[number]['id'];
export function CraftingModal({ referenceMode }: { referenceMode: boolean }) {
  const { parsecsState, gameState, advancePhase, parsecsCraftSoup, parsecsItemOp, parsecsUpgradeShipSystem } = useGameStore();
  const [craftOperation, setCraftOperation] = useState<CraftOperation | null>(null);
  const craftItems = parsecsState.shelf.filter(item => {
    if (craftOperation === 'craft') return !item.owned;
    if (!item.owned || item.lockedOnExpedition) return false;
    if (craftOperation === 'repair') return item.damaged;
    if (craftOperation === 'upgrade') return !item.damaged && !item.upgraded;
    return craftOperation === 'recycle';
  });
  if (!referenceMode) return <>
    {gameState.phase === 'briefing' && !gameState.activeEvent && <button className="mission-button" onClick={advancePhase}>Bắt đầu bảo trì hệ thống</button>}
    <SystemControls />
    {gameState.phase !== 'engineering' && <p className="mission-note">Bảo trì và nâng cấp thực hiện ở pha kỹ thuật, trước khi liên lạc và chia khẩu phần.</p>}
  </>;
  return <>
    <p className="mission-note">Hóa chất {parsecsState.resources.Chemical} · Khoáng chất {parsecsState.resources.Mineral} · Năng lượng {parsecsState.resources.Power}</p>
    <p role="status" className="mission-note">{parsecsState.starlogHistory[0]}</p>
'''
(components / 'modals/CraftingModal.tsx').write_text(craft_header + craft + '\n  </>;\n}\n', encoding='utf-8')

expedition = old[old.index("              {referenceMode && panel === 'expedition' && (", old.index("              {referenceMode && panel === 'craft' && !craftOperation")):old.index("              {referenceMode && panel === 'trace' && (")]
expedition = expedition[expedition.index('\n')+1:expedition.rfind('              )}')]
expedition = expedition.replace('Chọn Điểm Đến (36 Địa điểm từ sharedassets0):', 'Chọn điểm đến:').replace(' (PathID #{d.pathId})', '')
expedition = expedition.replace('<select\n                          value={selectedDestId}', '<select aria-label="Điểm đến"\n                          value={selectedDestId}').replace('<select\n                          value={selectedExplorerId}', '<select aria-label="Người thám hiểm"\n                          value={selectedExplorerId}')
expedition = expedition.replace('const active = selectedExpItems.includes(it.id);', 'const active = selectedExpItems.includes(it.id);').replace('key={it.id}\n                                  onClick', 'key={it.id}\n                                  aria-pressed={active}\n                                  onClick')
expedition_header = '''import { useState } from 'react';
import { AlertTriangle, Compass } from 'lucide-react';
import { useGameStore } from '../../store/gameStore.ts';
import { PARSECS_CATALOG } from '../../engine/ParsecsDecompiledEngine.ts';
import { ASSET_BASE, DESTINATION_SPRITE_MAP, getItemIconSprite } from '../cabin/assets.ts';
export function ExpeditionModal({ referenceMode }: { referenceMode: boolean }) {
  const { parsecsState, parsecsSendExpedition } = useGameStore();
  const availableExplorers = parsecsState.crew.filter(c => c.isAlive && !c.isAwayOnExpedition);
  const [selectedDestId, setSelectedDestId] = useState(PARSECS_CATALOG.expeditionDestinations[0]?.id ?? '');
  const [selectedExplorerId, setSelectedExplorerId] = useState(availableExplorers.find(c => !c.isCaptain)?.id ?? availableExplorers[0]?.id ?? '');
  const [selectedExpItems, setSelectedExpItems] = useState<string[]>([]);
  const selectedDest = PARSECS_CATALOG.expeditionDestinations.find(d => d.id === selectedDestId);
  const toggleExpItem = (id: string) => setSelectedExpItems(items => items.includes(id) ? items.filter(x => x !== id) : items.length < 3 ? [...items, id] : items);
  if (!referenceMode) return <div className="mission-empty"><img src={ASSET_BASE + '/SpaceshipItemSuit.webp'} alt="Bộ giáp EVA" /><h3>Chưa có nhiệm vụ EVA</h3><p>Chế độ Hail hiện chưa có mô phỏng thám hiểm. Các chuyến thám hiểm khả dụng trong chế độ Parsecs 1.3.2.</p></div>;
  return (
'''
(components / 'modals/ExpeditionModal.tsx').write_text(expedition_header + expedition + '\n  );\n}\n', encoding='utf-8')
