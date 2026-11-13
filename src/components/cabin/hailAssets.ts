import type { SystemId } from '../../types/index.ts';

export const HAIL_ASSET_BASE = '/assets/hail';

export function hailUrl(relPath: string): string {
  return `${HAIL_ASSET_BASE}/${relPath.replace(/^\/+/, '')}`;
}

export const HAIL_ENV = {
  spaceDeep: hailUrl('environments/PH_ENV_SPACE_DEEP_BASE_V01.webp'),
  lunarDay: hailUrl('environments/PH_ENV_LUNAR_EXTERIOR_DAY_V01.webp'),
  lunarNight: hailUrl('environments/PH_ENV_LUNAR_EXTERIOR_NIGHT_V01.webp'),
  cockpitShell: hailUrl('environments/PH_ENV_COCKPIT_SHELL_BASE_V01.webp'),
  lunarMap: hailUrl('environments/PH_ENV_LUNAR_MAP_BASE_V01.webp'),
  lunarCrater: hailUrl('environments/PH_ENV_LUNAR_CRATER_BASE_V01.webp'),
  regolithField: hailUrl('environments/PH_ENV_REGOLITH_FIELD_BASE_V01.webp'),
  lunarPsr: hailUrl('environments/PH_ENV_LUNAR_PSR_BASE_V01.webp'),
} as const;

export const HAIL_FX = {
  degraded: hailUrl('effects/PH_FX_OVERLAY_DEGRADED_V01.webp'),
  broken: hailUrl('effects/PH_FX_OVERLAY_BROKEN_V01.webp'),
} as const;

export const HAIL_EQUIPMENT = {
  oxygenBase: hailUrl('equipment/PH_EQP_OXYGEN_GENERATOR_BASE_V01.webp'),
  oxygenDegraded: hailUrl('equipment/PH_EQP_OXYGEN_GENERATOR_DEGRADED_V01.webp'),
  oxygenBroken: hailUrl('equipment/PH_EQP_OXYGEN_GENERATOR_BROKEN_V01.webp'),
  waterBase: hailUrl('equipment/PH_EQP_WATER_RECYCLER_BASE_V01.webp'),
  waterBroken: hailUrl('equipment/PH_EQP_WATER_RECYCLER_BROKEN_V01.webp'),
  powerBase: hailUrl('equipment/PH_EQP_POWER_MODULE_BASE_V01.webp'),
  powerBroken: hailUrl('equipment/PH_EQP_POWER_MODULE_BROKEN_V01.webp'),
  comms: hailUrl('equipment/PH_EQP_COMMS_TERMINAL_BASE_V01.webp'),
  medical: hailUrl('equipment/PH_EQP_MEDICAL_STATION_BASE_V01.webp'),
  robotStation: hailUrl('equipment/PH_EQP_ROBOT_STATION_BASE_V01.webp'),
  endDayConsole: hailUrl('equipment/PH_EQP_ENDDAY_CONSOLE_BASE_V01.webp'),
  consoleDesk: hailUrl('equipment/PH_EQP_CONSOLE_DESK_BASE_V01.webp'),
  lockerLeftOpen: hailUrl('equipment/PH_EQP_LOCKER_LEFT_OPEN_V01.webp'),
  lockerRightOpen: hailUrl('equipment/PH_EQP_LOCKER_RIGHT_OPEN_V01.webp'),
  lockerDoorLeftTop: hailUrl('equipment/PH_EQP_LOCKER_DOOR_LEFT_TOP_V01.webp'),
  lockerDoorLeftBottom: hailUrl('equipment/PH_EQP_LOCKER_DOOR_LEFT_BOT_V01.webp'),
  lockerDoorRightTop: hailUrl('equipment/PH_EQP_LOCKER_DOOR_RIGHT_TOP_V01.webp'),
  lockerDoorRightBottom: hailUrl('equipment/PH_EQP_LOCKER_DOOR_RIGHT_BOT_V01.webp'),
  crewSeat: hailUrl('equipment/PH_EQP_CREW_SEAT_BASE_V01.webp'),
  captainSeat: hailUrl('equipment/PH_EQP_CREW_SEAT_CAPTAIN_V01.webp'),
} as const;

export const HAIL_ROVER = {
  base: hailUrl('robots/PH_BOT_SURVEY_ROVER_BASE_V01.webp'),
  active: hailUrl('robots/PH_BOT_SURVEY_ROVER_ACTIVE_V01.webp'),
  broken: hailUrl('robots/PH_BOT_SURVEY_ROVER_BROKEN_V01.webp'),
} as const;

export const HAIL_INVENTORY = {
  medicalKit: hailUrl('inventory/PH_ITEM_MEDICAL_KIT_BASE_V01.webp'),
  spareParts: hailUrl('inventory/PH_ITEM_SPARE_PARTS_BASE_V01.webp'),
  filterSeal: hailUrl('inventory/PH_ITEM_FILTER_SEAL_BASE_V01.webp'),
  sampleDrill: hailUrl('inventory/PH_ITEM_SAMPLE_DRILL_BASE_V01.webp'),
  mrePack: hailUrl('inventory/PH_ITEM_MRE_PACK_BASE_V01.webp'),
  waterPack: hailUrl('inventory/PH_ITEM_WATER_PACK_BASE_V01.webp'),
  oxygenCell: hailUrl('inventory/PH_ITEM_OXYGEN_CELL_BASE_V01.webp'),
  lunarSample: hailUrl('inventory/PH_ITEM_LUNAR_SAMPLE_BASE_V01.webp'),
  specialBeacon: hailUrl('inventory/PH_ITEM_SPECIAL_BEACON_BASE_V01.webp'),
} as const;

export const HAIL_SVG = {
  resPower: hailUrl('resources/PH_UI_RES_POWER_V01.svg'),
  resOxygen: hailUrl('resources/PH_UI_RES_OXYGEN_V01.svg'),
  resWater: hailUrl('resources/PH_UI_RES_WATER_V01.svg'),
  resFood: hailUrl('resources/PH_UI_RES_FOOD_V01.svg'),
  resParts: hailUrl('resources/PH_UI_RES_PARTS_V01.svg'),
  sysOxygen: hailUrl('ui/PH_UI_SYS_OXYGEN_V01.svg'),
  sysWater: hailUrl('ui/PH_UI_SYS_WATER_V01.svg'),
  sysPower: hailUrl('ui/PH_UI_SYS_POWER_V01.svg'),
  sysComms: hailUrl('ui/PH_UI_SYS_COMMS_V01.svg'),
  sysMed: hailUrl('ui/PH_UI_SYS_MED_V01.svg'),
  sysRobot: hailUrl('ui/PH_UI_SYS_ROBOT_V01.svg'),
  stateOk: hailUrl('ui/PH_UI_STATE_OK_V01.svg'),
  stateWarn: hailUrl('ui/PH_UI_STATE_WARN_V01.svg'),
  stateCritical: hailUrl('ui/PH_UI_STATE_CRITICAL_V01.svg'),
  actRepair: hailUrl('ui/PH_UI_ACT_REPAIR_V01.svg'),
  actUpgrade: hailUrl('ui/PH_UI_ACT_UPGRADE_V01.svg'),
  actExplore: hailUrl('ui/PH_UI_ACT_EXPLORE_V01.svg'),
  actEndDay: hailUrl('ui/PH_UI_ACT_ENDDAY_V01.svg'),
  navBack: hailUrl('ui/PH_UI_NAV_BACK_V01.svg'),
  navClose: hailUrl('ui/PH_UI_NAV_CLOSE_V01.svg'),
  badgeNasaStem: hailUrl('ui/PH_UI_BADGE_NASA_STEM_V01.svg'),
  frameCorner: hailUrl('ui/PH_UI_FRAME_CORNER_V01.svg'),
} as const;

export interface HailCrewVisual {
  role: string;
  specialty: string;
  portrait: string;
  seated: string;
}

export const HAIL_CREW_VISUALS: Record<string, HailCrewVisual> = {
  cmd: {
    role: 'Chỉ huy Trạm (Commander)',
    specialty: 'Điều phối nhiệm vụ & Quản lý ECLSS',
    portrait: hailUrl('characters/PH_CHAR_SARAH_PORTRAIT_V01.webp'),
    seated: hailUrl('characters/PH_CHAR_SARAH_SEATED_BASE_V01.webp'),
  },
  eng: {
    role: 'Kỹ sư Hệ thống (Systems Engineer)',
    specialty: 'Bảo trì pin Mặt Trời, WRS & Rover',
    portrait: hailUrl('characters/PH_CHAR_ALEX_PORTRAIT_V01.webp'),
    seated: hailUrl('characters/PH_CHAR_ALEX_SEATED_BASE_V01.webp'),
  },
  doc: {
    role: 'Bác sĩ Hàng không (Flight Surgeon)',
    specialty: 'Y tế phi hành đoàn & Kiểm soát tâm lý',
    portrait: hailUrl('characters/PH_CHAR_MARCUS_PORTRAIT_V01.webp'),
    seated: hailUrl('characters/PH_CHAR_MARCUS_SEATED_BASE_V01.webp'),
  },
  geo: {
    role: 'Nhà Địa chất Mặt Trăng (Lunar Geologist)',
    specialty: 'Khảo sát hố thiên thạch & Phân tích regolith',
    portrait: hailUrl('characters/PH_CHAR_ELENA_PORTRAIT_V01.webp'),
    seated: hailUrl('characters/PH_CHAR_ELENA_SEATED_BASE_V01.webp'),
  },
};

export function getHailCrewVisual(id: string): HailCrewVisual {
  return HAIL_CREW_VISUALS[id] ?? HAIL_CREW_VISUALS.cmd;
}

export function getHailSystemSprite(id: SystemId, integrity: number): {
  sprite: string;
  overlay: string | null;
  state: 'ok' | 'degraded' | 'broken';
} {
  const state: 'ok' | 'degraded' | 'broken' =
    integrity < 0.45 ? 'broken' : integrity < 0.85 ? 'degraded' : 'ok';

  if (id === 'scrubber') {
    return {
      sprite:
        state === 'broken'
          ? HAIL_EQUIPMENT.oxygenBroken
          : state === 'degraded'
            ? HAIL_EQUIPMENT.oxygenDegraded
            : HAIL_EQUIPMENT.oxygenBase,
      overlay: null,
      state,
    };
  }
  if (id === 'recycler') {
    return {
      sprite: state === 'broken' ? HAIL_EQUIPMENT.waterBroken : HAIL_EQUIPMENT.waterBase,
      overlay: state === 'degraded' ? HAIL_FX.degraded : null,
      state,
    };
  }
  if (id === 'solar') {
    return {
      sprite: state === 'broken' ? HAIL_EQUIPMENT.powerBroken : HAIL_EQUIPMENT.powerBase,
      overlay: state === 'degraded' ? HAIL_FX.degraded : null,
      state,
    };
  }
  // airlock / comms bay
  return {
    sprite: HAIL_EQUIPMENT.comms,
    overlay: state === 'broken' ? HAIL_FX.broken : state === 'degraded' ? HAIL_FX.degraded : null,
    state,
  };
}

export function getHailEventScene(eventId: string | null | undefined): string {
  switch (eventId) {
    case 'solar-particles':
      return hailUrl('events/PH_EVT_SOLAR_PARTICLE_BASE_V01.webp');
    case 'airlock-leak':
      return hailUrl('events/PH_EVT_AIRLOCK_LEAK_BASE_V01.webp');
    case 'regolith-filter':
      return hailUrl('events/PH_EVT_TECHNICAL_FAULT_BASE_V01.webp');
    default:
      return hailUrl('events/PH_EVT_ROBOT_SIGNAL_LOSS_BASE_V01.webp');
  }
}
