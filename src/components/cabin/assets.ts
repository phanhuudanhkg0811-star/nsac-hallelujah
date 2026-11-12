import type { ParsecsCrewRuntime, ParsecsShelfItem, ParsecsSystemId } from '../../engine/ParsecsDecompiledEngine.ts';
import { assetUrl } from '../../utils/parsecsAssetUrl.ts';
export { ASSET_BASE, assetUrl } from '../../utils/parsecsAssetUrl.ts';
export {
  PARSECS_SITTING_TABLE,
  PARSECS_SCENE_COORDINATES,
  SITTING_CHAR_KEYS,
  getSittingCrewSprite,
  getSoupCanSprite,
  getClockDigitSprite,
  getChairSprite,
} from '../../utils/parsecsAssetResolver.ts';


export const CHAR_SPRITE_KEY: Record<string, string> = {
  char_aa: 'April',
  char_bb: 'Baby',
  char_dd: 'Deedee',
  char_ee: 'Emmet',
  char_mm: 'Maegan',
  char_tt: 'Tom',
};

export function getCrewFigureSprite(c: ParsecsCrewRuntime): string {
  const key = CHAR_SPRITE_KEY[c.id] ?? 'April';
  if (!c.isAlive) return assetUrl(`EndCrew${key}Dead.webp`);
  if (c.needs.need_morale.tier === 'Max' || c.needs.need_sanity.tier === 'Max') {
    return assetUrl(`EndCrew${key}Personal.webp`);
  }
  return assetUrl(`EndCrew${key}Standard.webp`);
}

export function getCrewJournalSprite(c: ParsecsCrewRuntime): string {
  const key = CHAR_SPRITE_KEY[c.id] ?? 'April';
  if (!c.isAlive) return assetUrl(`Journal${key}Dead.webp`);
  return assetUrl(`Journal${key}.webp`);
}

export function getCrewPhotoSprite(c: ParsecsCrewRuntime): string {
  const key = CHAR_SPRITE_KEY[c.id] ?? 'April';
  return assetUrl(`StarlogPhoto${key}.webp`);
}

export function getItemIconSprite(itemId: string, damaged = false): string {
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
  return assetUrl(`${damaged ? pair[1] : pair[0]}`);
}

export function getItemShelfSprite(item: ParsecsShelfItem): string {
  const map: Record<string, { base: string; upg: string; dmg: string; upgDmg: string }> = {
    item_armor: {
      base: 'SpaceshipItemArmor.png',
      upg: 'SpaceshipItemArmorUpgraded.png',
      dmg: 'SpaceshipItemArmorDamaged.png',
      upgDmg: 'SpaceshipItemArmorUpgradedDamaged.png',
    },
    item_artifact: {
      base: 'SpaceshipItemArtifact.png',
      upg: 'SpaceshipItemArtifactUpgraded.png',
      dmg: 'SpaceshipItemArtifactDamaged.png',
      upgDmg: 'SpaceshipItemArtifactUpgradedDamaged.png',
    },
    item_battery: {
      base: 'SpaceshipItemBattery.png',
      upg: 'SpaceshipItemBatteryUpgrade.png',
      dmg: 'SpaceshipItemBatteryDamaged.png',
      upgDmg: 'SpaceshipItemBatteryUpgradeDamaged.png',
    },
    item_communicator: {
      base: 'SpaceshipItemCommunicator.png',
      upg: 'SpaceshipItemCommunicatorUpgrade.png',
      dmg: 'SpaceshipItemCommunicatorDamaged.png',
      upgDmg: 'SpaceshipItemCommunicatorUpgradeDamaged.png',
    },
    item_gun: {
      base: 'SpaceshipItemGun.png',
      upg: 'SpaceshipItemGunUpgrade.png',
      dmg: 'SpaceshipItemGunDamaged.png',
      upgDmg: 'SpaceshipItemGunUpgradeDamaged.png',
    },
    item_handbook: {
      base: 'SpaceshipItemBook.png',
      upg: 'SpaceshipItemBookUpgrade.png',
      dmg: 'SpaceshipItemBookDamaged.png',
      upgDmg: 'SpaceshipItemBookUpgradeDamaged.png',
    },
    Item_LifeSupportSystem: {
      base: 'SpaceshipItemConcentrate.png',
      upg: 'SpaceshipItemConcentrate.png',
      dmg: 'SpaceshipItemConcentrate.png',
      upgDmg: 'SpaceshipItemConcentrate.png',
    },
    item_lighter: {
      base: 'SpaceshipItemLighter.png',
      upg: 'SpaceshipItemLighterUpgrade.png',
      dmg: 'SpaceshipItemLighterDamaged.png',
      upgDmg: 'SpaceshipItemLighterUpgradeDamaged.png',
    },
    item_mask: {
      base: 'SpaceshipItemMask.png',
      upg: 'SpaceshipItemMaskUpgrade.png',
      dmg: 'SpaceshipItemMaskDamaged.png',
      upgDmg: 'SpaceshipItemMaskUpgradeDamaged.png',
    },
    item_shovel: {
      base: 'SpaceshipItemShovel.png',
      upg: 'SpaceshipItemShovelUpgrade.png',
      dmg: 'SpaceshipItemShovelDamaged.png',
      upgDmg: 'SpaceshipItemShovelUpgradeDamaged.png',
    },
    item_tape: {
      base: 'SpaceshipItemDuckttape.png',
      upg: 'SpaceshipItemDuckttapeUpgrade.png',
      dmg: 'SpaceshipItemDuckttapeDamaged.png',
      upgDmg: 'SpaceshipItemDuckttapeUpgradeDamaged.png',
    },
  };
  const entry = map[item.id] ?? {
    base: 'SpaceshipItemSock.png',
    upg: 'SpaceshipItemSockUpgrade.png',
    dmg: 'SpaceshipItemSock.png',
    upgDmg: 'SpaceshipItemSockUpgrade.png',
  };
  if (item.upgraded && item.damaged) return assetUrl(`${entry.upgDmg}`);
  if (item.upgraded) return assetUrl(`${entry.upg}`);
  if (item.damaged) return assetUrl(`${entry.dmg}`);
  return assetUrl(`${entry.base}`);
}

export const DESTINATION_SPRITE_MAP: Record<string, string> = {
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

export const SYSTEM_ICON_MAP: Record<ParsecsSystemId, string> = {
  Crafting: assetUrl(`IconCrafting.webp`),
  Engine: assetUrl(`IconEngine.webp`),
  Expedition: assetUrl(`IconNavigation.webp`),
  Suit: assetUrl(`IconSuit.webp`),
};

