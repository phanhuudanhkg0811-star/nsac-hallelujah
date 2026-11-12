/**
 * Parsecs Graphic Asset Resolver
 * Tra cứu và ánh xạ chính xác 100% tài nguyên đồ họa WebP theo đúng thiết lập trong mã nguồn C# của 60 Parsecs!
 * Nguồn: Assembly-CSharp-firstpass.dll (SpaceshipItemController, SpaceshipLeftShelfController, CharacterBody, WindowView)
 */

import sittingTable from '../data/parsecsSittingTable.json';
import sceneCoords from '../data/parsecsSceneCoordinates.json';

import { assetUrl } from './parsecsAssetUrl.ts';
export { ASSET_BASE } from './parsecsAssetUrl.ts';

export const PARSECS_SITTING_TABLE = sittingTable as unknown as Record<string, Record<'slot0' | 'slot1' | 'slot2' | 'slot3', {
  normal: { left: number; top: number; width: number; height: number; flipX: boolean; zIndex: number };
  dead: { left: number; top: number; width: number; height: number; flipX: boolean; zIndex: number };
}>>;

export const PARSECS_SCENE_COORDINATES = sceneCoords as unknown as Record<string, {
  sprite?: string;
  layer?: number;
  ord?: number;
  flipX?: boolean;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  wx: number;
  wy: number;
  sx: number;
  sy: number;
}>;

// ==========================================
// 1. NGOẠI CẢNH CỬA SỔ (WINDOW VIEWPORT)
// C# Class: WindowView & PlanetLandingController
// ==========================================
export function getWindowExteriorSprite(planet: 'moon' | 'mars', isLanded = true, isDistant = false): string {
  if (planet === 'moon') {
    if (isDistant) return assetUrl(`SurvSpaceShuttlePlanet01Distant.webp`);
    return assetUrl(`SurvSpaceshuttlePlanet01View01.webp`);
  }
  if (isDistant) return assetUrl(`SurvSpaceShuttlePlanet02Distant.webp`);
  return assetUrl(`SurvSpaceshuttlePlanet02View01.webp`);
}

// ==========================================
// 2. MÁY CHẾ TẠO 3D (CRAFTING STATION)
// C# Class: CraftingManager & ShipSystem (PathID 13489)
// ==========================================
export function getCraftingStationSprite(level: 1 | 2 | 3): string {
  switch (level) {
    case 3: return assetUrl(`SpaceshipCraftingLevel3.png`);
    case 2: return assetUrl(`SpaceshipCraftingLevel2.png`);
    case 1:
    default: return assetUrl(`SpaceshipCrafting.png`);
  }
}

// ==========================================
// 3. BỘ GIÁP EVA & CỬA THÁM HIỂM (SUIT HATCH)
// C# Class: ExpeditionManager & ShipSystem (PathID 13492)
// ==========================================
export function getSuitStationSprite(level: 1 | 2 | 3): string {
  switch (level) {
    case 3: return assetUrl(`SpaceshipItemSuitLevel3.png`);
    case 2: return assetUrl(`SpaceshipItemSuitLevel2.png`);
    case 1:
    default: return assetUrl(`SpaceshipItemSuit.png`);
  }
}

// ==========================================
// 4. CHỒNG HỘP SÚP TIÊU HAO (SOUP SHELF)
// C# Class: SpaceshipConsumableShelfController
// ==========================================
export function getSoupCansSprite(cansCount: number): string | null {
  if (cansCount <= 0) return null;
  const clamped = Math.min(9, Math.max(1, cansCount));
  const pad = String(clamped).padStart(2, '0');
  return assetUrl(`SpaceshipItemSoup${pad}.png`);
}

// ==========================================
// 5. KỆ VẬT PHẨM TRANG BỊ VÁCH TRÁI (LEFT SHELF ITEMS)
// C# Class: SpaceshipLeftShelfController & SpaceshipItemController
// ==========================================
export interface ShelfItemVisualDefinition {
  base: string;
  upgraded: string;
  damaged: string;
  upgradedDamaged: string;
  icon: string;
  iconDamaged: string;
}

export const ITEM_SHELF_CATALOG: Record<string, ShelfItemVisualDefinition> = {
  item_armor: {
    base: assetUrl(`SpaceshipItemArmor.png`),
    upgraded: assetUrl(`SpaceshipItemArmorUpgraded.png`),
    damaged: assetUrl(`SpaceshipItemArmorDamaged.png`),
    upgradedDamaged: assetUrl(`SpaceshipItemArmorUpgradedDamaged.png`),
    icon: assetUrl(`IconArmor.webp`),
    iconDamaged: assetUrl(`IconArmorDamaged.webp`),
  },
  item_artifact: {
    base: assetUrl(`SpaceshipItemArtifact.png`),
    upgraded: assetUrl(`SpaceshipItemArtifactUpgraded.png`),
    damaged: assetUrl(`SpaceshipItemArtifactDamaged.png`),
    upgradedDamaged: assetUrl(`SpaceshipItemArtifactUpgradedDamaged.png`),
    icon: assetUrl(`IconArtifact.webp`),
    iconDamaged: assetUrl(`IconArtifactDamaged.webp`),
  },
  item_battery: {
    base: assetUrl(`SpaceshipItemBattery.png`),
    upgraded: assetUrl(`SpaceshipItemBatteryUpgrade.png`),
    damaged: assetUrl(`SpaceshipItemBatteryDamaged.png`),
    upgradedDamaged: assetUrl(`SpaceshipItemBatteryUpgradeDamaged.png`),
    icon: assetUrl(`IconBattery.webp`),
    iconDamaged: assetUrl(`IconBatteryDamaged.webp`),
  },
  item_communicator: {
    base: assetUrl(`SpaceshipItemCommunicator.png`),
    upgraded: assetUrl(`SpaceshipItemCommunicatorUpgrade.png`),
    damaged: assetUrl(`SpaceshipItemCommunicatorDamaged.png`),
    upgradedDamaged: assetUrl(`SpaceshipItemCommunicatorUpgradeDamaged.png`),
    icon: assetUrl(`IconComm.webp`),
    iconDamaged: assetUrl(`IconCommDamaged.webp`),
  },
  item_gun: {
    base: assetUrl(`SpaceshipItemGun.png`),
    upgraded: assetUrl(`SpaceshipItemGunUpgrade.png`),
    damaged: assetUrl(`SpaceshipItemGunDamaged.png`),
    upgradedDamaged: assetUrl(`SpaceshipItemGunUpgradeDamaged.png`),
    icon: assetUrl(`IconGun.webp`),
    iconDamaged: assetUrl(`IconGunDamaged.webp`),
  },
  item_handbook: {
    base: assetUrl(`SpaceshipItemBook.png`),
    upgraded: assetUrl(`SpaceshipItemBookUpgrade.png`),
    damaged: assetUrl(`SpaceshipItemBookDamaged.png`),
    upgradedDamaged: assetUrl(`SpaceshipItemBookUpgradeDamaged.png`),
    icon: assetUrl(`IconBook.webp`),
    iconDamaged: assetUrl(`IconBookDamaged.webp`),
  },
  Item_LifeSupportSystem: {
    base: assetUrl(`SpaceshipItemConcentrate.png`),
    upgraded: assetUrl(`SpaceshipItemConcentrate.png`),
    damaged: assetUrl(`SpaceshipItemConcentrate.png`),
    upgradedDamaged: assetUrl(`SpaceshipItemConcentrate.png`),
    icon: assetUrl(`IconConcentrate.webp`),
    iconDamaged: assetUrl(`IconConcentrate.webp`),
  },
  item_lighter: {
    base: assetUrl(`SpaceshipItemLighter.png`),
    upgraded: assetUrl(`SpaceshipItemLighterUpgrade.png`),
    damaged: assetUrl(`SpaceshipItemLighterDamaged.png`),
    upgradedDamaged: assetUrl(`SpaceshipItemLighterUpgradeDamaged.png`),
    icon: assetUrl(`IconLighter.webp`),
    iconDamaged: assetUrl(`IconLighterDamaged.webp`),
  },
  item_mask: {
    base: assetUrl(`SpaceshipItemMask.png`),
    upgraded: assetUrl(`SpaceshipItemMaskUpgrade.png`),
    damaged: assetUrl(`SpaceshipItemMaskDamaged.png`),
    upgradedDamaged: assetUrl(`SpaceshipItemMaskUpgradeDamaged.png`),
    icon: assetUrl(`IconMask.webp`),
    iconDamaged: assetUrl(`IconMaskDamaged.webp`),
  },
  item_medkit: {
    base: assetUrl(`SpaceshipItemMedkit.png`),
    upgraded: assetUrl(`SpaceshipItemMedkitUpgrade.png`),
    damaged: assetUrl(`SpaceshipItemMedkit.png`),
    upgradedDamaged: assetUrl(`SpaceshipItemMedkitUpgrade.png`),
    icon: assetUrl(`IconMedkit.webp`),
    iconDamaged: assetUrl(`IconMedkit.webp`),
  },
  item_shovel: {
    base: assetUrl(`SpaceshipItemShovel.png`),
    upgraded: assetUrl(`SpaceshipItemShovelUpgrade.png`),
    damaged: assetUrl(`SpaceshipItemShovelDamaged.png`),
    upgradedDamaged: assetUrl(`SpaceshipItemShovelUpgradeDamaged.png`),
    icon: assetUrl(`IconShovel.webp`),
    iconDamaged: assetUrl(`IconSpadeDamaged.webp`),
  },
  item_tape: {
    base: assetUrl(`SpaceshipItemDuckttape.png`),
    upgraded: assetUrl(`SpaceshipItemDuckttapeUpgrade.png`),
    damaged: assetUrl(`SpaceshipItemDuckttapeDamaged.png`),
    upgradedDamaged: assetUrl(`SpaceshipItemDuckttapeUpgradeDamaged.png`),
    icon: assetUrl(`IconDucttape.webp`),
    iconDamaged: assetUrl(`IconDuckttapeDamaged.webp`),
  },
  item_sock: {
    base: assetUrl(`SpaceshipItemSock.png`),
    upgraded: assetUrl(`SpaceshipItemSockUpgrade.png`),
    damaged: assetUrl(`SpaceshipItemSock.png`),
    upgradedDamaged: assetUrl(`SpaceshipItemSockUpgrade.png`),
    icon: assetUrl(`IconSock.webp`),
    iconDamaged: assetUrl(`IconSock.webp`),
  },
};


export function getItemSprite(itemId: string, upgraded = false, damaged = false): string {
  const def = ITEM_SHELF_CATALOG[itemId];
  if (!def) return assetUrl(`SpaceshipItemArtifact.webp`);
  if (upgraded && damaged) return def.upgradedDamaged;
  if (upgraded) return def.upgraded;
  if (damaged) return def.damaged;
  return def.base;
}

export function getItemIcon(itemId: string, damaged = false): string {
  const def = ITEM_SHELF_CATALOG[itemId];
  if (!def) return assetUrl(`IconArtifact.webp`);
  return damaged ? def.iconDamaged : def.icon;
}

// ==========================================
// 6. NHÂN VẬT & BIỂU CẢM (CREW FIGURES & PAPERDOLL)
// C# Class: CharacterBody & CadetIcon
// ==========================================
export type ParsecsCharacterKey = 'April' | 'Baby' | 'Deedee' | 'Emmet' | 'Maegan' | 'Tom';

export const CHARACTER_KEY_MAP: Record<string, ParsecsCharacterKey> = {
  char_aa: 'April', char_bb: 'Baby', char_dd: 'Deedee', char_ee: 'Emmet', char_mm: 'Maegan', char_tt: 'Tom',
  char_april: 'April',
  char_baby: 'Baby',
  char_deedee: 'Deedee',
  char_emmet: 'Emmet',
  char_maegan: 'Maegan',
  char_tom: 'Tom',
  cmd: 'Emmet',
  eng: 'Baby',
  doc: 'Deedee',
  geo: 'Maegan',
};

export function getCrewFigureSprite(
  charId: string,
  isAlive: boolean,
  isHeroicOrHighMorale = false,
): string {
  const key = CHARACTER_KEY_MAP[charId] || 'April';
  if (!isAlive) return assetUrl(`EndCrew${key}Dead.webp`);
  if (isHeroicOrHighMorale) return assetUrl(`EndCrew${key}Personal.webp`);
  return assetUrl(`EndCrew${key}Standard.webp`);
}

export function getCrewJournalPortrait(charId: string, isAlive: boolean): string {
  const key = CHARACTER_KEY_MAP[charId] || 'April';
  if (!isAlive) return assetUrl(`Journal${key}Dead.webp`);
  return assetUrl(`Journal${key}.webp`);
}

export function getCrewPhotoCard(charId: string): string {
  const key = CHARACTER_KEY_MAP[charId] || 'April';
  return assetUrl(`StarlogPhoto${key}.webp`);
}

// ==========================================
// 7. SEATED CREW SPRITES & HELPERS
// ==========================================
export const SITTING_CHAR_KEYS: Record<string, string> = {
  char_aa: 'April',
  char_bb: 'Baby',
  char_dd: 'DeeDee',
  char_ee: 'Emmet',
  char_mm: 'Maegan',
  char_tt: 'Tom',
  char_april: 'April',
  char_baby: 'Baby',
  char_deedee: 'DeeDee',
  char_emmet: 'Emmet',
  char_maegan: 'Maegan',
  char_tom: 'Tom',
  cmd: 'Emmet',
  eng: 'Baby',
  doc: 'DeeDee',
  geo: 'Maegan',
};

export function getSittingCrewSprite(charId: string, isAlive = true): string {
  const key = SITTING_CHAR_KEYS[charId] || 'April';
  return assetUrl(`Srv${key}${isAlive ? '' : 'Dead'}Sitting.png`);
}

export function getSoupCanSprite(canIndex: number): string {
  const idx = Math.min(Math.max(1, canIndex), 9);
  return assetUrl(`SpaceshipItemSoup0${idx}.png`);
}

export function getClockDigitSprite(digit: number | string): string {
  return assetUrl(`SpaceshipClockNumber${digit}.png`);
}

export function getChairSprite(isCaptain = false): string {
  return assetUrl(isCaptain ? 'SpaceshipChairCaptain.png' : 'SpaceshipChair.png');
}

