import React, { useEffect, useRef, useState } from 'react';
import { EventTerminal } from './EventTerminal.tsx';
import { SystemControls } from './SystemControls.tsx';
import { RationingPanel } from './RationingPanel.tsx';
import { CommsLogisticsPanel } from './CommsLogisticsPanel.tsx';
import { useGameStore } from '../store/gameStore.ts';
import {
  PARSECS_CATALOG,
  PARSECS_SYSTEM_UPGRADE_TABLE,
  formatStarlogText,
  type ParsecsSystemId,
  type ParsecsNeedId,
  type ParsecsCrewRuntime,
  type ParsecsShelfItem,
} from '../engine/ParsecsDecompiledEngine.ts';
import {
  BookOpen,
  Users,
  Wrench,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Terminal,
} from 'lucide-react';

const ROOM_PANELS = {
  log: 'Nhật ký',
  crew: 'Phi hành đoàn',
  craft: 'Chế tạo',
  expedition: 'Thám hiểm',
  trace: 'Nhật ký kỹ thuật',
  end: 'Chốt Sol',
} as const;

type RoomPanel = keyof typeof ROOM_PANELS;

const PANEL_ART: Partial<Record<RoomPanel, string>> = {
  log: 'StarlogComputer.webp',
  craft: 'CraftingComputer.webp',
  expedition: 'ExpeditionComputerAll.webp',
};

const CRAFT_OPERATIONS = [
  { id: 'craft', label: 'Chế tạo', icon: 'CraftingIconCraft.webp' },
  { id: 'recycle', label: 'Tái chế', icon: 'CraftingIconRecycle.webp' },
  { id: 'upgrade', label: 'Nâng cấp', icon: 'CraftingIconUpgrade.webp' },
  { id: 'repair', label: 'Sửa chữa', icon: 'CraftingIconRepair.webp' },
] as const;

type CraftOperation = typeof CRAFT_OPERATIONS[number]['id'];

const ASSET_BASE = '/assets/parsecs';

const CHAR_SPRITE_KEY: Record<string, string> = {
  char_aa: 'April',
  char_bb: 'Baby',
  char_dd: 'Deedee',
  char_ee: 'Emmet',
  char_mm: 'Maegan',
  char_tt: 'Tom',
};

function getCrewFigureSprite(c: ParsecsCrewRuntime): string {
  const key = CHAR_SPRITE_KEY[c.id] ?? 'April';
  if (!c.isAlive) return `${ASSET_BASE}/EndCrew${key}Dead.webp`;
  if (c.needs.need_morale.tier === 'Max' || c.needs.need_sanity.tier === 'Max') {
    return `${ASSET_BASE}/EndCrew${key}Personal.webp`;
  }
  return `${ASSET_BASE}/EndCrew${key}Standard.webp`;
}

function getCrewJournalSprite(c: ParsecsCrewRuntime): string {
  const key = CHAR_SPRITE_KEY[c.id] ?? 'April';
  if (!c.isAlive) return `${ASSET_BASE}/Journal${key}Dead.webp`;
  return `${ASSET_BASE}/Journal${key}.webp`;
}

function getCrewPhotoSprite(c: ParsecsCrewRuntime): string {
  const key = CHAR_SPRITE_KEY[c.id] ?? 'April';
  return `${ASSET_BASE}/StarlogPhoto${key}.webp`;
}

function getItemIconSprite(itemId: string, damaged = false): string {
  const map: Record<string, [string, string]> = {
    item_armor: ['IconArmor.webp', 'IconArmorDamaged.webp'],
    item_artifact: ['IconArtifact.webp', 'IconArtifactDamaged.webp'],
    item_battery: ['IconBattery.webp', 'IconBatteryDamaged.webp'],
    item_communicator: ['IconComm.webp', 'IconCommDamaged.webp'],
    item_gun: ['IconGun.webp', 'IconGunDamaged.webp'],
    item_handbook: ['IconBook.webp', 'IconBookDamaged.webp'],
    Item_LifeSupportSystem: ['IconConcentrate.webp', 'IconConcentrate.webp'],
    item_lighter: ['IconLighter.webp', 'IconLighterDamaged.webp'],
    item_mask: ['IconMask.webp', 'IconMaskDamaged.webp'],
    item_shovel: ['IconShovel.webp', 'IconSpadeDamaged.webp'],
    item_tape: ['IconDucttape.webp', 'IconDuckttapeDamaged.webp'],
  };
  const pair = map[itemId] ?? ['IconSock.webp', 'IconSock.webp'];
  return `${ASSET_BASE}/${damaged ? pair[1] : pair[0]}`;
}

function getItemShelfSprite(item: ParsecsShelfItem): string {
  const map: Record<string, { base: string; upg: string; dmg: string; upgDmg: string }> = {
    item_armor: {
      base: 'SpaceshipItemArmor.webp',
      upg: 'SpaceshipItemArmorUpgraded.webp',
      dmg: 'SpaceshipItemArmorDamaged.webp',
      upgDmg: 'SpaceshipItemArmorUpgradedDamaged.webp',
    },
    item_artifact: {
      base: 'SpaceshipItemArtifact.webp',
      upg: 'SpaceshipItemArtifactUpgraded.webp',
      dmg: 'SpaceshipItemArtifactDamaged.webp',
      upgDmg: 'SpaceshipItemArtifactUpgradedDamaged.webp',
    },
    item_battery: {
      base: 'SpaceshipItemBattery.webp',
      upg: 'SpaceshipItemBatteryUpgrade.webp',
      dmg: 'SpaceshipItemBatteryDamaged.webp',
      upgDmg: 'SpaceshipItemBatteryUpgradeDamaged.webp',
    },
    item_communicator: {
      base: 'SpaceshipItemCommunicator.webp',
      upg: 'SpaceshipItemCommunicatorUpgrade.webp',
      dmg: 'SpaceshipItemCommunicatorDamaged.webp',
      upgDmg: 'SpaceshipItemCommunicatorUpgradeDamaged.webp',
    },
    item_gun: {
      base: 'SpaceshipItemGun.webp',
      upg: 'SpaceshipItemGunUpgrade.webp',
      dmg: 'SpaceshipItemGunDamaged.webp',
      upgDmg: 'SpaceshipItemGunUpgradeDamaged.webp',
    },
    item_handbook: {
      base: 'SpaceshipItemBook.webp',
      upg: 'SpaceshipItemBookUpgrade.webp',
      dmg: 'SpaceshipItemBookDamaged.webp',
      upgDmg: 'SpaceshipItemBookUpgradeDamaged.webp',
    },
    Item_LifeSupportSystem: {
      base: 'SpaceshipItemConcentrate.webp',
      upg: 'SpaceshipItemConcentrate.webp',
      dmg: 'SpaceshipItemConcentrate.webp',
      upgDmg: 'SpaceshipItemConcentrate.webp',
    },
    item_lighter: {
      base: 'SpaceshipItemLighter.webp',
      upg: 'SpaceshipItemLighterUpgrade.webp',
      dmg: 'SpaceshipItemLighterDamaged.webp',
      upgDmg: 'SpaceshipItemLighterUpgradeDamaged.webp',
    },
    item_mask: {
      base: 'SpaceshipItemMask.webp',
      upg: 'SpaceshipItemMaskUpgrade.webp',
      dmg: 'SpaceshipItemMaskDamaged.webp',
      upgDmg: 'SpaceshipItemMaskUpgradeDamaged.webp',
    },
    item_shovel: {
      base: 'SpaceshipItemShovel.webp',
      upg: 'SpaceshipItemShovelUpgrade.webp',
      dmg: 'SpaceshipItemShovelDamaged.webp',
      upgDmg: 'SpaceshipItemShovelUpgradeDamaged.webp',
    },
    item_tape: {
      base: 'SpaceshipItemDuckttape.webp',
      upg: 'SpaceshipItemDuckttapeUpgrade.webp',
      dmg: 'SpaceshipItemDuckttapeDamaged.webp',
      upgDmg: 'SpaceshipItemDuckttapeUpgradeDamaged.webp',
    },
  };
  const entry = map[item.id] ?? {
    base: 'SpaceshipItemSock.webp',
    upg: 'SpaceshipItemSockUpgrade.webp',
    dmg: 'SpaceshipItemSock.webp',
    upgDmg: 'SpaceshipItemSockUpgrade.webp',
  };
  if (item.upgraded && item.damaged) return `${ASSET_BASE}/${entry.upgDmg}`;
  if (item.upgraded) return `${ASSET_BASE}/${entry.upg}`;
  if (item.damaged) return `${ASSET_BASE}/${entry.dmg}`;
  return `${ASSET_BASE}/${entry.base}`;
}

const DESTINATION_SPRITE_MAP: Record<string, string> = {
  destination_arena: 'Planet01ExpeditionDestinationArena.webp',
  destination_assemblyLine: 'Planet01ExpeditionDestinationAssemblyLine.webp',
  destination_bombCraters: 'Planet01ExpeditionDestinationCraters.webp',
  destination_cavern: 'Planet01ExpeditionDestinationCavern.webp',
  destination_chargingHub: 'Planet01ExpeditionDestinationPowerHub.webp',
  destination_graveyard: 'Planet01ExpeditionDestinationGraveyard.webp',
  destination_library: 'Planet01ExpeditionDestinationLibrary.webp',
  destination_museum: 'Planet01ExpeditionDestinationMuseum.webp',
  destination_oilfall: 'Planet01ExpeditionDestinationOilfall.webp',
  destination_robotStatue: 'Planet01ExpeditionDestinationStatue.webp',
  destination_touristInfo: 'Planet01ExpeditionDestinationTouristInfo.webp',
  destination_village: 'Planet01ExpeditionDestinationVillage.webp',
  destination_canyon: 'Planet02ExpeditionDestinationCanyon.webp',
  destination_cavePlanetTwo: 'Planet02ExpeditionDestinationCave.webp',
  destination_desert: 'Planet02ExpeditionDestinationDesert.webp',
  destination_digSite: 'Planet02ExpeditionDestinationRuins.webp',
  destination_moonTower: 'Planet02ExpeditionDestinationMoonTower.webp',
  destination_mountainCity: 'Planet02ExpeditionDestinationMntCity.webp',
  destination_pyramid: 'Planet02ExpeditionDestinationPyramid.webp',
  destination_starTower: 'Planet02ExpeditionDestinationStarTower.webp',
  destination_sunTower: 'Planet02ExpeditionDestinationSunTower.webp',
  destination_swamp: 'Planet02ExpeditionDestinationSwamp.webp',
  destination_temple: 'Planet02ExpeditionDestinationTemple.webp',
  destination_wreck: 'Planet02ExpeditionDestinationShipWreck.webp',
  destination_bombSilo: 'Planet03ExpeditionDestinationBombSilo.webp',
  destination_brokenCity: 'Planet03ExpeditionDestinationRuinedCity.webp',
  destination_deadAirport: 'Planet03ExpeditionDestinationAirport.webp',
  destination_fortress: 'Planet03ExpeditionDestinationFortress.webp',
  destination_glade: 'Planet03ExpeditionDestinationGlade.webp',
  destination_largeBunker: 'Planet03ExpeditionDestinationLargeBunker.webp',
  destination_monument: 'Planet03ExpeditionDestinationMonument.webp',
  destination_quarry: 'Planet03ExpeditionDestinationQuarry.webp',
  destination_radiozone: 'Planet03ExpeditionDestinationRadiozone.webp',
  destination_stormZone: 'Planet03ExpeditionDestinationStormzone.webp',
  destination_warFactory: 'Planet03ExpeditionDestinationWarFactory.webp',
  destination_warheadTown: 'Planet03ExpeditionDestinationWarheadTown.webp',
};

const SYSTEM_ICON_MAP: Record<ParsecsSystemId, string> = {
  Crafting: `${ASSET_BASE}/IconCrafting.webp`,
  Engine: `${ASSET_BASE}/IconEngine.webp`,
  Expedition: `${ASSET_BASE}/IconNavigation.webp`,
  Suit: `${ASSET_BASE}/IconSuit.webp`,
};

export const ParsecsSurvivalBench: React.FC = () => {
  const {
    parsecsState,
    gameState,
    isNightTransition,
    parsecsToggleRation,
    parsecsCounselCrew,
    parsecsCraftSoup,
    parsecsItemOp,
    parsecsUpgradeShipSystem,
    parsecsSendExpedition,
    parsecsChooseEventOption,
    parsecsSelectDeck,
    parsecsSelectEventById,
    parsecsSetCrewRoster,
    parsecsEndSol,
    setActiveRoomTab,
    resetGame,
  } = useGameStore();

  const [focusedCrewName, setFocusedCrewName] = useState<string | null>(null);
  const [referenceMode, setReferenceMode] = useState(false);
  const [panel, setPanel] = useState<RoomPanel | null>(null);
  const [craftOperation, setCraftOperation] = useState<CraftOperation | null>(null);
  const panelDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = panelDialog.current;
    if (panel && dialog && !dialog.open) dialog.showModal();
  }, [panel]);

  useEffect(() => {
    if (isNightTransition) panelDialog.current?.close();
  }, [isNightTransition]);

  const [selectedDestId, setSelectedDestId] = useState(
    PARSECS_CATALOG.expeditionDestinations[0]?.id ?? 'destination_arena',
  );
  const [selectedExplorerId, setSelectedExplorerId] = useState(
    parsecsState.crew.find(c => !c.isCaptain)?.id ?? parsecsState.crew[0]?.id ?? 'char_aa',
  );
  const [selectedExpItems, setSelectedExpItems] = useState<string[]>(['item_mask', 'item_gun']);
  const [rosterSelection, setRosterSelection] = useState<string[]>(
    parsecsState.crew.map(c => c.id),
  );
  const [selectedCharacterInspect, setSelectedCharacterInspect] = useState<string>(
    parsecsState.crew[0]?.id ?? 'char_aa',
  );

  const currentEv = parsecsState.currentEvent;
  const selectedDest =
    PARSECS_CATALOG.expeditionDestinations.find(d => d.id === selectedDestId) ??
    PARSECS_CATALOG.expeditionDestinations[0];


  const toggleExpItem = (itemId: string) => {
    setSelectedExpItems(prev =>
      prev.includes(itemId)
        ? prev.filter(x => x !== itemId)
        : prev.length < 3
          ? [...prev, itemId]
          : prev,
    );
  };

  const toggleRosterChar = (charId: string) => {
    setRosterSelection(prev => {
      if (prev.includes(charId)) {
        return prev.length > 1 ? prev.filter(x => x !== charId) : prev;
      }
      return prev.length < 4 ? [...prev, charId] : [...prev.slice(0, 3), charId];
    });
  };

  const needBadgeColor = (tier: string) => {
    switch (tier) {
      case 'Max':
      case 'High':
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60';
      case 'Low':
        return 'bg-amber-950/90 text-amber-300 border-amber-700/60';
      case 'Min':
        return 'bg-red-950/90 text-red-300 border-red-700/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const exterior = referenceMode
    ? {
        'Shuttle-Orbit': 'SurvSpaceshuttleBlackholeView01.webp',
        'Planet-1': 'SurvSpaceshuttlePlanet01View01.webp',
        'Planet-2': 'SurvSpaceshuttlePlanet02View01.webp',
        'Planet-3': 'SurvSpaceshuttlePlanet03View01.webp',
      }[parsecsState.currentPlanet]
    : gameState.planet === 'mars'
      ? 'SurvSpaceshuttlePlanet03View01.webp'
      : 'SurvSpaceshuttlePlanet01View01.webp';
  const windowExteriorSprite = ASSET_BASE + '/' + exterior;
  const currentSol = referenceMode ? parsecsState.sol : gameState.sol;
  const standardCrew = parsecsState.crew.filter(member => !member.isCaptain);
  const captain = parsecsState.crew.find(member => member.isCaptain);
  const seats = [standardCrew[0], standardCrew[1], captain, standardCrew[2]];

  // Determine Crafting machine sprite based on shipSystems.Crafting
  const craftingRoomSprite =
    !referenceMode ? ASSET_BASE + '/SpaceshipCrafting.webp' : parsecsState.shipSystems.Crafting === 3
      ? `${ASSET_BASE}/SpaceshipCraftingLevel3.webp`
      : parsecsState.shipSystems.Crafting === 2
        ? `${ASSET_BASE}/SpaceshipCraftingLevel2.webp`
        : `${ASSET_BASE}/SpaceshipCrafting.webp`;

  // Determine Suit sprite based on shipSystems.Suit
  const suitRoomSprite =
    !referenceMode ? ASSET_BASE + '/SpaceshipItemSuit.webp' : parsecsState.shipSystems.Suit === 3
      ? `${ASSET_BASE}/SpaceshipItemSuitLevel3.webp`
      : parsecsState.shipSystems.Suit === 2
        ? `${ASSET_BASE}/SpaceshipItemSuitLevel2.webp`
        : `${ASSET_BASE}/SpaceshipItemSuit.webp`;

  // Determine soup stack sprite (01..09)
  const soupStackIdx = Math.max(1, Math.min(9, referenceMode ? parsecsState.soupCans : Math.ceil(gameState.resources.foodKg)));
  const soupRoomSprite = `${ASSET_BASE}/SpaceshipItemSoup0${soupStackIdx}.webp`;

  const ownedShelfItems = parsecsState.shelf.filter(it => it.owned);
  const availableExplorers = parsecsState.crew.filter(member => member.isAlive && !member.isAwayOnExpedition);
  const craftItems = parsecsState.shelf.filter(item => {
    if (craftOperation === 'craft') return !item.owned;
    if (!item.owned || item.lockedOnExpedition) return false;
    if (craftOperation === 'repair') return item.damaged;
    if (craftOperation === 'upgrade') return !item.damaged && !item.upgraded;
    return craftOperation === 'recycle';
  });

  return (
    <div className="parsecs-cabin">
        <div className="parsecs-stage relative overflow-hidden select-none">
          {/* Layer 0: Outside Porthole Window View (Centered behind the circular porthole cutout of Spaceship.webp) */}
          <div
            className="absolute pointer-events-none overflow-hidden rounded-full"
            style={{
              left: '41%',
              top: '26%',
              width: '18%',
              height: '23%',
            }}
          >
            <img
              src={windowExteriorSprite}
              alt="Exterior Window"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Layer 1: Main Spaceship Cutaway Room Illustration (3840x2880 with transparent porthole) */}
          <img
            src={`${ASSET_BASE}/Spaceship.webp`}
            alt="60 Parsecs Shuttle Interior"
            className="absolute inset-0 z-10 w-full h-full object-fill pointer-events-none"
          />

          <button
            type="button"
            className="parsecs-hotspot absolute z-20"
            style={{ left: '0%', top: '30%', width: '13%', height: '49%' }}
            aria-label="Mở nhật ký"
            onClick={() => setPanel('log')}
          >
            <img src={ASSET_BASE + '/SpaceshipStarlog.webp'} alt="" className="h-full w-full object-contain" />
            
          </button>

          {/* Layer 2: Interactive Room Stations & Equipment Overlays */}
          {/* 2A. Left Wall 3D Crafting Station */}
          <button
            type="button"
            onClick={() => { setCraftOperation(null); setPanel('craft'); }}
            className="parsecs-hotspot absolute z-20 group cursor-pointer transition-transform hover:scale-105"
            style={{ left: '29%', top: '20%', width: '11.5%', height: '23%' }}
            aria-label={referenceMode ? 'Mở máy chế tạo' : 'Mở bảng kỹ thuật'}
          >
            <img
              src={craftingRoomSprite}
              alt="Crafting Machine"
              className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
            />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-950/90 border border-cyan-500/50 text-[9px] font-mono text-cyan-300 whitespace-nowrap">
              Chế Tạo Lv.{parsecsState.shipSystems.Crafting}
            </span>
          </button>

          {/* 2B. Left Wall Storage Shelves: Owned Physical Items */}
          <div
            className="absolute z-20 flex flex-wrap items-center justify-center gap-1 p-1"
            style={{ left: '11.5%', top: '19.5%', width: '13%', height: '29%' }}
          >
            <img src={ASSET_BASE + '/SpaceshipShelfLeftClosed0.webp'} alt=""
              className="absolute inset-0 h-full w-full object-fill pointer-events-none" />
            {ownedShelfItems.slice(0, 6).map(item => (
              <div
                key={item.id}
                className="relative w-[30%] h-[42%] flex items-center justify-center group"
                title={`${item.upgraded ? item.upgradedName : item.name} (${item.damaged ? 'Hỏng' : 'Nguyên vẹn'})`}
              >
                <img
                  src={getItemShelfSprite(item)}
                  alt={item.name}
                  className="max-w-full max-h-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            className="parsecs-hotspot absolute z-20"
            style={{ right: '14%', top: '33%', width: '9%', height: '14%' }}
            aria-label={referenceMode ? 'Mở kho súp' : 'Mở bảng khẩu phần'}
            onClick={() => {
              setFocusedCrewName(null);
              setCraftOperation(referenceMode ? 'craft' : null);
              setPanel(referenceMode ? 'craft' : 'crew');
            }}
          >
            {(referenceMode ? parsecsState.soupCans > 0 : gameState.resources.foodKg > 0) && (
              <img src={soupRoomSprite} alt="" className="h-full w-full object-contain" />
            )}
          </button>

          {/* 2D. Right Wall Space Suit & Expedition Hatch */}
          <button
            type="button"
            onClick={() => setPanel('expedition')}
            className="parsecs-hotspot absolute z-20 flex flex-col items-center group"
            style={{ right: '29.5%', top: '25.5%', width: '10%', height: '32%' }}
            aria-label={referenceMode ? 'Mở bảng thám hiểm' : 'Mở bảng khảo sát robot'}
          >
            <img
              src={suitRoomSprite}
              alt="EVA Suit"
              className="w-full h-full object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.85)]"
            />
            <span className="px-1.5 py-0.5 rounded bg-slate-950/90 border border-emerald-500/50 text-[9px] font-mono text-emerald-300 whitespace-nowrap">
              Suit Lv.{parsecsState.shipSystems.Suit}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPanel('end')}
            className="parsecs-hotspot absolute z-30"
            style={{ right: 0, top: '24%', width: '11%', height: '34%' }}
            aria-label="Mở bảng chốt Sol"
          >
            <img src={ASSET_BASE + '/SpaceshipEndday.webp'} alt="" className="h-full w-full object-contain" />
          </button>
          <output className="parsecs-sol-counter" aria-label={'Sol ' + currentSol}>
            {String(currentSol).padStart(3, '0')}
          </output>
          <img
            src={ASSET_BASE + '/SpaceshipConsole.webp'}
            alt=""
            className="pointer-events-none absolute z-20 object-contain"
            style={{ left: '35%', bottom: '3%', width: '30%', height: '45%' }}
          />
          <button
            type="button"
            aria-label="Mở nhật ký từ máy tính"
            onClick={() => setPanel('log')}
            className="parsecs-hotspot absolute z-40"
            style={{ left: '44%', bottom: '18%', width: '12%', height: '20%' }}
          >
            <img src={ASSET_BASE + '/SpaceshipEvent.webp'} alt="" className="h-full w-full object-contain" />
          </button>

          {/* Layer 3: Chairs & Active Astrocitizen Crew Members Inside the Cabin */}
          <div className="absolute inset-x-[12%] bottom-[4%] h-[52%] z-30 grid grid-cols-4 gap-2 items-end pointer-events-none">
            {seats.map((member, index) => {
              const nasaMember = gameState.crew[[1, 2, 0, 3][index]];
              const memberName = referenceMode ? member?.firstName : nasaMember?.name;
              const away = referenceMode && member?.isAwayOnExpedition;
              return (
                <div key={index} className="relative h-full flex items-end justify-center">
                  <img
                    src={ASSET_BASE + (index === 2 ? '/SpaceshipChairCaptain.webp' : '/SpaceshipChair.webp')}
                    alt=""
                    className="absolute bottom-[2%] w-[78%] h-[78%] object-contain pointer-events-none"
                  />
                  {member && memberName && !away && (
                    <button
                      type="button"
                      aria-label={'Khẩu phần cho ' + memberName}
                      className="parsecs-hotspot pointer-events-auto relative z-10 h-[80%] min-w-0"
                      onClick={() => {
                        setFocusedCrewName(memberName);
                        setSelectedCharacterInspect(member.id);
                        setPanel('crew');
                      }}
                    >
                      <img src={getCrewFigureSprite(member)} alt="" className="h-full w-full object-contain object-bottom" />
                    </button>
                  )}
                  {away && <span className="relative mb-8 bg-slate-950 text-xs p-1">Đang thám hiểm</span>}
                </div>
              );
            })}
          </div>
        </div>

      <details className="parsecs-game-menu">
        <summary>Menu</summary>
        <nav aria-label="Điều khiển buồng sinh hoạt">
          {(Object.keys(ROOM_PANELS) as RoomPanel[]).filter(id => referenceMode || id !== 'trace').map((id) => (
            <button key={id} type="button" onClick={() => { setFocusedCrewName(null); setCraftOperation(null); setPanel(id); }}>
              {ROOM_PANELS[id]}
            </button>
          ))}
          <button type="button" onClick={() => setReferenceMode(mode => !mode)}>
            {referenceMode ? 'Chuyển sang Project Hail' : 'Mở bản đối chiếu 1.3.2'}
          </button>
          <button type="button" onClick={() => setActiveRoomTab('bridge')}>Mở bảng điều hành NASA</button>
          <button type="button" onClick={resetGame}>Khởi động lại</button>
        </nav>
      </details>

      {referenceMode && parsecsState.gameOverReason && (
        <div className="absolute inset-x-4 bottom-4 z-40 bg-red-950/90 border-2 border-red-500 rounded-xl p-4 text-red-200 font-mono text-sm flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
          <div>
            <div className="font-bold text-red-300 uppercase">KẾT THÚC NHIỆM VỤ (GAME OVER)</div>
            <div>{parsecsState.gameOverReason}</div>
          </div>
        </div>
      )}

      <dialog
        ref={panelDialog}
        className={`parsecs-dialog parsecs-dialog--${panel ?? 'closed'} ${referenceMode ? '' : 'parsecs-dialog--nasa'}`}
        aria-labelledby="parsecs-panel-title"
        onClose={() => setPanel(null)}
      >
        {panel && (
          <>
            {PANEL_ART[panel] && <img className="parsecs-panel-art" alt="" src={ASSET_BASE + '/' + PANEL_ART[panel]} />}
            <header className="parsecs-dialog-header">
              <h2 id="parsecs-panel-title">{ROOM_PANELS[panel]}</h2>
              <form method="dialog">
                <button className="parsecs-panel-close" aria-label="Đóng" type="submit">⏻</button>
              </form>
            </header>
            {referenceMode && panel === 'craft' && (
              <div className="parsecs-craft-resources" aria-label="Kho tài nguyên">
                {Object.entries(parsecsState.resources).map(([name, value]) => (
                  <span key={name} title={name}>{value}</span>
                ))}
              </div>
            )}
            <div className="parsecs-dialog-body">
              {!referenceMode && panel === 'log' && <EventTerminal />}
              {!referenceMode && panel === 'craft' && <SystemControls />}
              {!referenceMode && (panel === 'crew' || panel === 'end') && (
                <>
                  {panel === 'crew' && focusedCrewName && (
                    <p className="px-3 py-2 text-sm text-slate-100">
                      {focusedCrewName} · Kế hoạch khẩu phần dùng chung cho phi hành đoàn
                    </p>
                  )}
                  <RationingPanel />
                  {gameState.phase === 'comms' && <CommsLogisticsPanel />}
                </>
              )}
              {!referenceMode && panel === 'expedition' && (
                <div className="parsecs-expedition-unavailable" role="status">
                  <AlertTriangle aria-hidden="true" />
                  <strong>Khảo sát robot chưa khả dụng</strong>
                  <p>Tiền đồn chưa có mô-đun điều phối robot.</p>
                </div>
              )}
              {referenceMode && panel === 'end' && (
                <div className="parsecs-end-console">
                  <div className="parsecs-ration-sheet">
                    <h3>Khẩu phần trước khi chốt Sol</h3>
                    {parsecsState.crew.map(member => (
                      <div key={member.id} className="parsecs-ration-row">
                        <img src={getCrewJournalSprite(member)} alt="" />
                        <span>{member.firstName}</span>
                        <label>
                          <img src={ASSET_BASE + '/IconSoup.webp'} alt="" />
                          <input type="checkbox" aria-label={'Súp cho ' + member.firstName}
                            checked={member.plannedSoup} disabled={!member.isAlive || member.isAwayOnExpedition}
                            onChange={() => parsecsToggleRation(member.id, 'soup')} />
                        </label>
                        <label>
                          <img src={ASSET_BASE + '/IconMedkit.webp'} alt="" />
                          <input type="checkbox" aria-label={'Thuốc cho ' + member.firstName}
                            checked={member.plannedMedkit} disabled={!member.isAlive || member.isAwayOnExpedition}
                            onChange={() => parsecsToggleRation(member.id, 'medkit')} />
                        </label>
                      </div>
                    ))}
                  </div>
                  <button
                    className="parsecs-lever"
                    type="button"
                    disabled={Boolean(parsecsState.gameOverReason)}
                    onClick={() => { panelDialog.current?.close(); parsecsEndSol(); }}
                  >
                    <span aria-hidden="true" />
                    Gạt cần · Sol {parsecsState.sol}
                  </button>
                </div>
              )}
              {referenceMode && panel === 'log' && (
                <article className="parsecs-paper">
                  <h3>Sol {parsecsState.sol}</h3>
                  {currentEv ? (
                    <div className="flex flex-col gap-3">
                      <p>{formatStarlogText(currentEv.prompt, parsecsState.crew)}</p>

                      {!parsecsState.eventResolvedToday ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {currentEv.options.map((optLabel, idx) => (
                            <button
                              key={idx}
                              onClick={() => parsecsChooseEventOption(idx)}
                              className="hud-button text-left px-3 py-2 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-600/40 text-emerald-200 text-xs font-mono flex items-center justify-between gap-2 cursor-pointer"
                            >
                              <span className="flex items-center gap-2">
                                <span>
                                  [{idx + 1}] Quyết định: <strong>{optLabel}</strong>
                                </span>
                              </span>
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-emerald-950/40 border border-emerald-700/50 rounded-lg p-3 text-xs font-mono text-emerald-200 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>{parsecsState.lastEventOutcomeText}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs font-mono text-slate-400 p-4">Không có sự kiện nào trong hàng đợi.</div>
                  )}
                </article>
              )}
              {referenceMode && panel === 'crew' && (
                <div className="hud-panel rounded-xl p-4 border border-slate-800 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      PHI HÀNH ĐOÀN &amp; MÁY TRẠNG THÁI 5 BẬC (HYSTERESIS FSM CIL 06002F05)
                    </h2>

                    <div className="flex flex-wrap items-center gap-1">
                      {PARSECS_CATALOG.characters.map(ch => {
                        const active = rosterSelection.includes(ch.id);
                        const key = CHAR_SPRITE_KEY[ch.id] ?? 'April';
                        return (
                          <button
                            key={ch.id}
                            onClick={() => toggleRosterChar(ch.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer flex items-center gap-1 ${
                              active
                                ? 'bg-cyan-950 border-cyan-500 text-cyan-200 font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-500'
                            }`}
                          >
                            <img
                              src={`${ASSET_BASE}/Journal${key}.webp`}
                              alt={ch.firstName}
                              className="w-3.5 h-3.5 object-contain"
                            />
                            {ch.firstName}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => parsecsSetCrewRoster(rosterSelection)}
                        className="ml-1 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500 text-slate-950 font-bold cursor-pointer"
                      >
                        Đổi Đội Hình
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {parsecsState.crew.map(c => (
                      <div
                        key={c.id}
                        className={`rounded-lg p-3 border ${
                          !c.isAlive
                            ? 'bg-red-950/30 border-red-800/60 opacity-75'
                            : c.isAwayOnExpedition
                              ? 'bg-cyan-950/20 border-cyan-700/50'
                              : 'bg-slate-900/90 border-slate-800'
                        } flex flex-col gap-2.5`}
                      >
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={getCrewPhotoSprite(c)}
                              alt={`${c.firstName} ${c.surname}`}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-700 bg-slate-950 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold font-mono text-slate-100 flex items-center gap-1.5">
                                <span className="truncate">
                                  {c.firstName} {c.surname}
                                </span>
                                {c.isCaptain && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px]">
                                    CAPTAIN
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-0.5">
                                  <img src={`${ASSET_BASE}/IconAgility.webp`} alt="AGI" className="w-3 h-3 object-contain" />
                                  {c.attributes.agility.toFixed(1)}
                                </span>
                                <span className="flex items-center gap-0.5">
                                  <img
                                    src={`${ASSET_BASE}/IconInteligence.webp`}
                                    alt="INT"
                                    className="w-3 h-3 object-contain"
                                  />
                                  {c.attributes.intelligence.toFixed(1)}
                                </span>
                                <span className="flex items-center gap-0.5">
                                  <img src={`${ASSET_BASE}/IconStrengthCrew.webp`} alt="STR" className="w-3 h-3 object-contain" />
                                  {c.attributes.strength.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {!c.isAlive ? (
                            <span className="px-2 py-0.5 rounded bg-red-900 text-red-200 text-[10px] font-mono font-bold">
                              HY SINH
                            </span>
                          ) : c.isAwayOnExpedition ? (
                            <span className="px-2 py-0.5 rounded bg-cyan-900 text-cyan-200 text-[10px] font-mono">
                              ĐANG THÁM HIỂM
                            </span>
                          ) : null}
                        </div>

                        {/* 4 Needs Bars with Hysteresis Tier */}
                        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                          {([
                            ['need_health', 'HEALTH'],
                            ['need_hunger', 'HUNGER'],
                            ['need_morale', 'MORALE'],
                            ['need_sanity', 'SANITY'],
                          ] as const).map(([nid, label]) => {
                            const need = c.needs[nid];
                            const pct = Math.round(need.value * 100);
                            return (
                              <div
                                key={nid}
                                className="bg-slate-950/80 border border-slate-800/80 rounded px-2 py-1 flex flex-col gap-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-400 uppercase">{label}</span>
                                  <span className={`px-1 rounded border text-[9px] ${needBadgeColor(need.tier)}`}>
                                    {need.activeStatus || need.tier} ({pct}%)
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      pct >= 60
                                        ? 'bg-emerald-400'
                                        : pct >= 35
                                          ? 'bg-cyan-400'
                                          : 'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Paper-Doll 7-Layer Sprite Rig Readout */}
                        <div className="text-[9px] font-mono text-slate-400 bg-slate-950/60 px-2 py-1 rounded border border-slate-800/60 truncate">
                          Sprite Rig: <span className="text-cyan-300">{c.paperDoll.body}</span> |{' '}
                          <span className="text-amber-300">{c.paperDoll.face}</span> | HairLv.{c.paperDoll.hairProgress}
                        </div>

                        {/* Rationing & Counseling Controls */}
                        {c.isAlive && !c.isAwayOnExpedition && (
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <button
                              onClick={() => parsecsToggleRation(c.id, 'soup')}
                              className={`flex-1 py-1 px-2 rounded text-[10px] font-mono border flex items-center justify-center gap-1.5 cursor-pointer ${
                                c.plannedSoup
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <img src={`${ASSET_BASE}/IconSoup.webp`} alt="Soup" className="w-3.5 h-3.5 object-contain" />
                              {c.plannedSoup ? 'Đã Cấp Súp (+55)' : 'Cấp Súp'}
                            </button>

                            <button
                              onClick={() => parsecsToggleRation(c.id, 'medkit')}
                              className={`flex-1 py-1 px-2 rounded text-[10px] font-mono border flex items-center justify-center gap-1.5 cursor-pointer ${
                                c.plannedMedkit
                                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <img
                                src={`${ASSET_BASE}/IconMedkit.webp`}
                                alt="Medkit"
                                className="w-3.5 h-3.5 object-contain"
                              />
                              {c.plannedMedkit ? 'Đã Cấp Medkit' : 'Medkit'}
                            </button>

                            <button
                              onClick={() => parsecsCounselCrew(c.id)}
                              className="py-1 px-2 rounded text-[10px] font-mono border bg-cyan-950/50 hover:bg-cyan-900/60 border-cyan-700/50 text-cyan-200 flex items-center gap-1 cursor-pointer"
                              title="Trò chuyện động viên (-5 Power -> +14 Morale, +12 Sanity)"
                            >
                              <img src={`${ASSET_BASE}/IconPower.webp`} alt="Power" className="w-3 h-3 object-contain" />
                              -5P
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {referenceMode && panel === 'craft' && !craftOperation && (
                <div className="parsecs-craft-home">
                  <h3>Bạn muốn làm gì?</h3>
                  <div className="parsecs-craft-options">
                    {CRAFT_OPERATIONS.map(({ id, label, icon }) => (
                      <button type="button" key={id} onClick={() => setCraftOperation(id)}>
                        <img src={ASSET_BASE + '/' + icon} alt="" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {referenceMode && panel === 'craft' && craftOperation && (
                <div className="hud-panel rounded-xl p-4 border border-slate-800 flex flex-col gap-3">
                  <button className="parsecs-room-control" type="button" onClick={() => setCraftOperation(null)}>
                    ← Chọn thao tác
                  </button>
                  {craftOperation === 'craft' && (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-2">
                    <div className="text-[11px] font-mono text-amber-300 font-semibold flex items-center gap-1.5">
                      <img src={`${ASSET_BASE}/IconSoup.webp`} alt="Soup" className="w-4 h-4 object-contain" />
                      Chế tạo Súp (ConsumableRemedium):
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {([1, 2, 3] as const).map(batch => {
                        const cost = batch === 1 ? 10 : batch === 2 ? 15 : 20;
                        const soupIcon =
                          batch === 1 ? 'IconSoup.webp' : batch === 2 ? 'IconSoup2.webp' : 'IconSoup3.webp';
                        return (
                          <button
                            key={batch}
                            onClick={() => parsecsCraftSoup(batch)}
                            className="py-1.5 px-2 rounded bg-amber-950/50 hover:bg-amber-900/70 border border-amber-600/40 text-amber-200 text-[10px] font-mono cursor-pointer flex items-center justify-center gap-1"
                          >
                            <img src={`${ASSET_BASE}/${soupIcon}`} alt="Soup" className="w-4 h-4 object-contain" />
                            <span>
                              +{batch} Súp (-{cost}C)
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  )}
                  {craftOperation === 'upgrade' && (
                  <div className="grid grid-cols-2 gap-2">
                    {(['Crafting', 'Engine', 'Expedition', 'Suit'] as ParsecsSystemId[]).map(sysId => {
                      const lvl = parsecsState.shipSystems[sysId];
                      const cfg = PARSECS_SYSTEM_UPGRADE_TABLE[sysId].find(u => u.fromLevel === lvl) ?? null;
                      const isUpgradingThis = parsecsState.activeSystemUpgrade?.system === sysId;
                      const costText = cfg
                        ? Object.entries(cfg.cost)
                            .map(([k, v]) => `${v}${k[0]}`)
                            .join('+')
                        : '';

                      return (
                        <div
                          key={sysId}
                          className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between gap-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                              <img src={SYSTEM_ICON_MAP[sysId]} alt={sysId} className="w-4 h-4 object-contain" />
                              {sysId}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50 text-[10px] font-mono">
                              Lv.{lvl}/3
                            </span>
                          </div>

                          {isUpgradingThis ? (
                            <div className="text-[10px] font-mono text-amber-300">
                              ⏳ Đang nâng cấp (
                              {parsecsState.activeSystemUpgrade
                                ? parsecsState.activeSystemUpgrade.totalDays -
                                  parsecsState.activeSystemUpgrade.progressDays
                                : 0}{' '}
                              ngày)
                            </div>
                          ) : cfg ? (
                            <button
                              onClick={() => parsecsUpgradeShipSystem(sysId)}
                              disabled={Boolean(parsecsState.activeSystemUpgrade)}
                              className="py-1 px-2 rounded bg-cyan-950/70 hover:bg-cyan-900/80 disabled:opacity-40 border border-cyan-600/40 text-cyan-200 text-[10px] font-mono text-left cursor-pointer"
                            >
                              Nâng Lv.{lvl + 1} ({cfg.days}d: {costText})
                            </button>
                          ) : (
                            <div className="text-[10px] font-mono text-emerald-400">✓ Đã tối đa (Lv.3)</div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  )}
                  {/* 11 Decompiled Shelf Items with Real Icons & Shelf Sprites */}
                  <div className="flex flex-col gap-1.5 max-h-[290px] overflow-y-auto pr-1">
                    {craftItems.length === 0 && (
                      <p className="p-2 text-sm">Không có vật phẩm phù hợp.</p>
                    )}
                    {craftItems.map(item => (
                      <div
                        key={item.id}
                        className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-2 flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={getItemIconSprite(item.id, item.damaged)}
                              alt={item.name}
                              className="w-8 h-8 object-contain shrink-0 bg-slate-900 rounded p-1 border border-slate-800"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-mono font-bold text-slate-200 truncate">
                                {item.upgraded ? item.upgradedName : item.name}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400">
                                {!item.owned
                                  ? 'Chưa sở hữu'
                                  : item.damaged
                                    ? '⚠️ Đang hỏng (Damaged)'
                                    : item.upgraded
                                      ? '★ Đã nâng cấp (Upgraded)'
                                      : 'Nguyên vẹn (Intact Lv.1)'}
                              </div>
                            </div>
                          </div>

                          {!item.owned ? (
                            <button
                              onClick={() => parsecsItemOp('craft-item', item.id)}
                              className="px-2 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-200 text-[10px] font-mono cursor-pointer shrink-0 flex items-center gap-1"
                            >
                              <img
                                src={`${ASSET_BASE}/CraftingIconCraft.webp`}
                                alt="Craft"
                                className="w-3.5 h-3.5 object-contain"
                              />
                              Chế tạo (-10C -5P)
                            </button>
                          ) : (
                            <div className="flex flex-wrap items-center gap-1">
                              {craftOperation === 'repair' && (
                                <button
                                  onClick={() => parsecsItemOp('repair-item', item.id)}
                                  className="px-2 py-0.5 rounded bg-amber-950 hover:bg-amber-900 border border-amber-500/50 text-amber-200 text-[10px] font-mono cursor-pointer"
                                >
                                  Sửa (-10M)
                                </button>
                              )}
                              {craftOperation === 'upgrade' && (
                                <button
                                  onClick={() => parsecsItemOp('upgrade-item', item.id)}
                                  className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 text-[10px] font-mono cursor-pointer"
                                >
                                  Nâng cấp (-30C -5P)
                                </button>
                              )}
                              {craftOperation === 'recycle' && (
                              <button
                                onClick={() => parsecsItemOp('recycle-item', item.id)}
                                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-red-950/70 border border-slate-700 text-slate-300 text-[10px] font-mono cursor-pointer"
                              >
                                Tái chế (+Chem/Min)
                              </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {referenceMode && panel === 'expedition' && (
                <div className="hud-panel rounded-xl p-4 border border-slate-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                      <img
                        src={`${ASSET_BASE}/ExpeditionComputerAll.webp`}
                        alt="Expedition"
                        className="w-6 h-6 object-contain"
                      />
                      Trung tâm thám hiểm
                    </h2>
                  </div>

                  {!parsecsState.activeExpedition && availableExplorers.length === 0 ? (
                    <div className="parsecs-expedition-unavailable">
                      <AlertTriangle aria-hidden="true" />
                      <strong>Hệ thống chưa khả dụng</strong>
                      <p>Chưa có thành viên nào có thể xuất phát.</p>
                    </div>
                  ) : parsecsState.activeExpedition ? (
                    <div className="bg-cyan-950/40 border border-cyan-600/50 rounded-lg p-3 text-xs font-mono text-cyan-200 flex flex-col gap-1.5">
                      <div className="font-bold text-cyan-300">
                        🚀 ĐANG THÁM HIỂM: {parsecsState.activeExpedition.destinationTitle}
                      </div>
                      <div>
                        Thời gian trở về: còn{' '}
                        <strong>
                          {parsecsState.activeExpedition.totalDays - parsecsState.activeExpedition.elapsedDays}
                        </strong>{' '}
                        ngày Sol
                      </div>
                      <div>
                        Giáp bảo hộ ngăn chặn mối nguy:{' '}
                        {parsecsState.activeExpedition.blockedThreats.join(', ') || 'Không có'}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5 text-xs font-mono">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">
                          Chọn Điểm Đến (36 Địa điểm từ sharedassets0):
                        </label>
                        <select
                          value={selectedDestId}
                          onChange={e => setSelectedDestId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
                        >
                          {PARSECS_CATALOG.expeditionDestinations.map(d => (
                            <option key={d.id} value={d.id}>
                              [{d.planet}] {d.title} (PathID #{d.pathId})
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedDest && (
                        <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 flex items-center gap-3">
                          <img
                            src={`${ASSET_BASE}/${
                              DESTINATION_SPRITE_MAP[selectedDest.id] ?? 'Planet01ExpeditionDestinationArena.webp'
                            }`}
                            alt={selectedDest.title}
                            className="w-24 h-16 rounded object-cover border border-slate-700 shrink-0 bg-slate-900"
                          />
                          <div className="text-[11px] text-slate-300 leading-relaxed flex-1">
                            <div className="font-bold text-emerald-300 mb-0.5">
                              {selectedDest.title} ({selectedDest.planet})
                            </div>
                            <div className="text-[10px] text-slate-400">{selectedDest.description}</div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <img
                                src={`${ASSET_BASE}/IconBiohazard_small.webp`}
                                alt="Biohazard"
                                className="w-3.5 h-3.5 object-contain"
                                title="Biohazard"
                              />
                              <img
                                src={`${ASSET_BASE}/IconFauna_small.webp`}
                                alt="Fauna"
                                className="w-3.5 h-3.5 object-contain"
                                title="Fauna"
                              />
                              <img
                                src={`${ASSET_BASE}/IconEnvironment_small.webp`}
                                alt="Environment"
                                className="w-3.5 h-3.5 object-contain"
                                title="Environment"
                              />
                              <img
                                src={`${ASSET_BASE}/IconDarkness_small.webp`}
                                alt="Darkness"
                                className="w-3.5 h-3.5 object-contain"
                                title="Darkness"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Chọn Người Đi Thám Hiểm:</label>
                        <select
                          value={selectedExplorerId}
                          onChange={e => setSelectedExplorerId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
                        >
                          {availableExplorers
                            .map(c => (
                              <option key={c.id} value={c.id}>
                                {c.firstName} {c.surname} {c.isCaptain ? '(Captain)' : ''} (Health{' '}
                                {Math.round(c.needs.need_health.value * 100)}%)
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-400 mb-1">
                          Chọn tối đa 3 Trang Bị Mang Theo (Khắc chế Biohazard/Fauna/Environment/Darkness):
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {parsecsState.shelf
                            .filter(it => it.owned && !it.damaged)
                            .map(it => {
                              const active = selectedExpItems.includes(it.id);
                              return (
                                <button
                                  key={it.id}
                                  onClick={() => toggleExpItem(it.id)}
                                  className={`px-2 py-1 rounded text-[10px] border cursor-pointer flex items-center gap-1.5 ${
                                    active
                                      ? 'bg-emerald-950 border-emerald-400 text-emerald-200 font-bold'
                                      : 'bg-slate-900 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  <img
                                    src={getItemIconSprite(it.id)}
                                    alt={it.name}
                                    className="w-4 h-4 object-contain"
                                  />
                                  {it.upgraded ? it.upgradedName : it.name}
                                </button>
                              );
                            })}
                        </div>
                      </div>

                      <button
                        onClick={() => parsecsSendExpedition(selectedDestId, selectedExplorerId, selectedExpItems)}
                        className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Compass className="w-4 h-4" />
                        PHÁI ĐOÀN THÁM HIỂM (SEND EXPEDITION)
                      </button>
                    </div>
                  )}
                </div>
              )}
              {referenceMode && panel === 'trace' && (
                <div className="hud-panel rounded-xl p-4 border border-slate-800 flex flex-col gap-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    CIL ENDOFDAYMANAGER LISTENER TRACE (06002FE6)
                  </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={parsecsState.activeDeckId}
                        onChange={e => parsecsSelectDeck(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] font-mono text-slate-200"
                        title="Chọn Deck sự kiện từ sharedassets0.assets"
                      >
                        {PARSECS_CATALOG.decks.map(d => (
                          <option key={d.id} value={d.id}>
                            Deck: {d.assetName} (P={d.probability}, {d.eventCount} ev)
                          </option>
                        ))}
                      </select>

                      <select
                        value={currentEv?.id ?? ''}
                        onChange={e => parsecsSelectEventById(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] font-mono text-cyan-300 max-w-[220px]"
                        title="Chọn trực tiếp sự kiện từ 80 Event Graph"
                      >
                        {PARSECS_CATALOG.events.map(ev => (
                          <option key={ev.id} value={ev.id}>
                            [{ev.category}] {ev.assetName} ({ev.nodeCount} nodes)
                          </option>
                        ))}
                      </select>
                    </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 max-h-[160px] overflow-y-auto text-[11px] font-mono text-slate-300 flex flex-col gap-1">
                    {parsecsState.lastEndOfDayTrace.length > 0 ? (
                      parsecsState.lastEndOfDayTrace.map((line, i) => (
                        <div key={i} className="text-emerald-300">
                          &gt; {line}
                        </div>
                      ))
                    ) : (
                      parsecsState.starlogHistory.map((line, i) => (
                        <div key={i} className="text-cyan-300">
                          {line}
                        </div>
                      ))
              )}
            </div>
          </div>
              )}
            </div>
          </>
        )}
      </dialog>
    </div>
  );
};
