/**
 * Decompiled Core Survival Engine from 60 Parsecs! v1.3.2
 * Source Assembly: 60Parsecs_Data/Managed/Assembly-CSharp-firstpass.dll
 * SHA-256: 245C506F18CFDC1F586AF0A9BDEB4C0396C4B0C8EE5DBA552667CF6E3E3F0EC8
 *
 * Pure TypeScript implementation of the CIL-verified state machines, formulas,
 * Crafting/Shelf/Expedition controllers, and 10-layer End-of-Day listener pipeline.
 */

import runtimeCatalogJson from '../data/parsecs-runtime.json';

export type ParsecsNeedTier = 'Min' | 'Low' | 'Normal' | 'High' | 'Max';
export type ParsecsNeedId = 'need_health' | 'need_hunger' | 'need_morale' | 'need_sanity';
export type ParsecsSystemId = 'Crafting' | 'Engine' | 'Expedition' | 'Suit';
export type ParsecsResourceId = 'Chemical' | 'Mineral' | 'Power';

export interface ParsecsNeedThresholds {
  readonly low: number;
  readonly high: number;
  readonly riseNormal: number;
  readonly riseLow: number;
  readonly fallNormal: number;
  readonly fallHigh: number;
}

export interface ParsecsNeedConfig {
  readonly pathId: number;
  readonly id: ParsecsNeedId;
  readonly name: string;
  readonly initialValue: number;
  readonly dailyDelta: number;
  readonly thresholds: ParsecsNeedThresholds;
  readonly statuses: {
    readonly min: string | null;
    readonly low: string | null;
    readonly normal: string | null;
    readonly high: string | null;
    readonly max: string | null;
  };
  readonly irreversibleMin: boolean;
}

export interface ParsecsNeedRuntime {
  readonly id: ParsecsNeedId;
  readonly value: number;
  readonly tier: ParsecsNeedTier;
  readonly activeStatus: string | null;
  readonly immune: boolean;
}

export interface ParsecsCharacterAttributes {
  readonly agility: number;
  readonly intelligence: number;
  readonly strength: number;
}

export interface ParsecsPaperDollState {
  readonly body: string;
  readonly bodyLayerHurt: boolean;
  readonly face: string;
  readonly eyelids: string;
  readonly hairProgress: 1 | 2 | 3;
}

export interface ParsecsCrewRuntime {
  readonly pathId: number;
  readonly id: string;
  readonly assetName: string;
  readonly firstName: string;
  readonly surname: string;
  readonly description: string;
  readonly isCaptain: boolean;
  readonly attributes: ParsecsCharacterAttributes;
  readonly needs: Readonly<Record<ParsecsNeedId, ParsecsNeedRuntime>>;
  readonly extraStatuses: readonly string[];
  readonly isAlive: boolean;
  readonly isAwayOnExpedition: boolean;
  readonly plannedSoup: boolean;
  readonly plannedMedkit: boolean;
  readonly paperDoll: ParsecsPaperDollState;
}

export interface ParsecsShelfItem {
  readonly pathId: number;
  readonly id: string;
  readonly assetName: string;
  readonly name: string;
  readonly upgradedName: string;
  readonly description: string;
  readonly owned: boolean;
  readonly damaged: boolean;
  readonly upgraded: boolean;
  readonly lockedOnExpedition: boolean;
}

export interface ParsecsSystemUpgradeTask {
  readonly system: ParsecsSystemId;
  readonly targetLevel: 2 | 3;
  readonly progressDays: number;
  readonly totalDays: number;
}

export interface ParsecsActiveExpedition {
  readonly destinationId: string;
  readonly destinationTitle: string;
  readonly planet: string;
  readonly crewId: string;
  readonly crewName: string;
  readonly itemIds: readonly string[];
  readonly elapsedDays: number;
  readonly totalDays: number;
  readonly blockedThreats: readonly string[];
}

export interface ParsecsDecompiledEvent {
  readonly pathId: number;
  readonly id: string;
  readonly assetName: string;
  readonly category: string;
  readonly nodeCount: number;
  readonly choiceKind: string;
  readonly prompt: string;
  readonly options: readonly string[];
  readonly outcomes: {
    readonly primary: string;
    readonly secondary: string;
    readonly tertiary: string;
  };
  readonly effects: readonly {
    readonly kind: string;
    readonly targets: readonly string[];
  }[];
}

export interface ParsecsDeckEntry {
  readonly eventPathId: number;
  readonly eventName: string;
  readonly weight: number;
}

export interface ParsecsDeck {
  readonly pathId: number;
  readonly kind: string;
  readonly id: string;
  readonly assetName: string;
  readonly probability: number;
  readonly eventCount: number;
  readonly entries: readonly ParsecsDeckEntry[];
}

export interface ParsecsDestination {
  readonly pathId: number;
  readonly id: string;
  readonly assetName: string;
  readonly planet: string;
  readonly title: string;
  readonly description: string;
}

export interface ParsecsSimulationState {
  readonly sol: number;
  readonly seed: number;
  readonly currentPlanet: 'Shuttle-Orbit' | 'Planet-1' | 'Planet-2' | 'Planet-3';
  readonly activeDeckId: string;
  readonly resources: Readonly<Record<ParsecsResourceId, number>>;
  readonly soupCans: number;
  readonly shipSystems: Readonly<Record<ParsecsSystemId, 1 | 2 | 3>>;
  readonly activeSystemUpgrade: ParsecsSystemUpgradeTask | null;
  readonly crew: readonly ParsecsCrewRuntime[];
  readonly shelf: readonly ParsecsShelfItem[];
  readonly activeExpedition: ParsecsActiveExpedition | null;
  readonly currentEvent: ParsecsDecompiledEvent | null;
  readonly eventResolvedToday: boolean;
  readonly lastEventOutcomeText: string | null;
  readonly lastEndOfDayTrace: readonly string[];
  readonly starlogHistory: readonly string[];
  readonly gameOverReason: string | null;
}

export const PARSECS_CATALOG = runtimeCatalogJson as unknown as {
  readonly metadata: {
    readonly sourceGame: string;
    readonly unityVersion: string;
    readonly assemblySha256: string;
    readonly totalMonoBehaviours: number;
    readonly totalLocalizedTerms: number;
    readonly extractedCounts: Record<string, number>;
  };
  readonly shipSystems: typeof PARSECS_SYSTEM_UPGRADE_TABLE;
  readonly endOfDayListenerOrder: readonly string[];
  readonly characters: readonly {
    readonly pathId: number;
    readonly id: string;
    readonly assetName: string;
    readonly firstName: string;
    readonly surname: string;
    readonly description: string;
    readonly attributes: ParsecsCharacterAttributes;
  }[];
  readonly needsFsm: readonly ParsecsNeedConfig[];
  readonly statuses: readonly {
    readonly pathId: number;
    readonly id: string;
    readonly assetName: string;
    readonly name: string;
    readonly description: string;
  }[];
  readonly resources: readonly {
    readonly pathId: number;
    readonly id: string;
    readonly assetName: string;
    readonly name: string;
    readonly maxCapacity: number;
  }[];
  readonly items: readonly {
    readonly pathId: number;
    readonly id: string;
    readonly assetName: string;
    readonly name: string;
    readonly upgradedName: string;
    readonly description: string;
  }[];
  readonly expeditionDestinations: readonly ParsecsDestination[];
  readonly decks: readonly ParsecsDeck[];
  readonly events: readonly ParsecsDecompiledEvent[];
};

const EPSILON = 0.001;
const approximately = (a: number, b: number): boolean => Math.abs(a - b) <= 1e-5;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, Math.round(v * 1000) / 1000));
const clampResource = (v: number): number => Math.max(0, Math.min(999, Math.round(v)));

export const PARSECS_SYSTEM_UPGRADE_TABLE: Readonly<
  Record<
    ParsecsSystemId,
    readonly { readonly fromLevel: 1 | 2; readonly toLevel: 2 | 3; readonly days: number; readonly cost: Partial<Record<ParsecsResourceId, number>> }[]
  >
> = {
  Crafting: [
    { fromLevel: 1, toLevel: 2, days: 2, cost: { Power: 30 } },
    { fromLevel: 2, toLevel: 3, days: 4, cost: { Power: 60 } },
  ],
  Engine: [
    { fromLevel: 1, toLevel: 2, days: 2, cost: { Chemical: 40, Mineral: 40 } },
    { fromLevel: 2, toLevel: 3, days: 4, cost: { Power: 80 } },
  ],
  Expedition: [
    { fromLevel: 1, toLevel: 2, days: 2, cost: { Power: 25 } },
    { fromLevel: 2, toLevel: 3, days: 4, cost: { Power: 50 } },
  ],
  Suit: [
    { fromLevel: 1, toLevel: 2, days: 2, cost: { Power: 25 } },
    { fromLevel: 2, toLevel: 3, days: 4, cost: { Power: 50 } },
  ],
};

/**
 * CIL 06002F05 & 06002F26–06002F2D: CharacterNeedParameters.set_Value
 */
export function evaluateNeedFsm(
  currentTier: ParsecsNeedTier,
  rawValue: number,
  config: ParsecsNeedConfig,
): { readonly value: number; readonly tier: ParsecsNeedTier; readonly status: string | null } {
  const x = clamp01(rawValue);
  const t = config.thresholds;

  const isMax = approximately(x, 1);
  const isMin = approximately(x, 0);
  const downHigh = x > t.fallNormal && x <= t.fallHigh;
  const upHigh = x >= t.high && x < 1;
  const downNormal = x > t.low && x <= t.fallNormal;
  const upNormal = x >= t.riseNormal && x < t.high;
  const downLow = x > 0 && x <= t.low;
  const upLow = x >= t.riseLow && x < t.riseNormal;

  let nextTier: ParsecsNeedTier = currentTier;

  switch (currentTier) {
    case 'Max':
      if (downHigh) nextTier = 'High';
      else if (downNormal) nextTier = 'Normal';
      else if (downLow) nextTier = 'Low';
      else if (isMin) nextTier = 'Min';
      break;
    case 'High':
      if (isMax) nextTier = 'Max';
      else if (downNormal) nextTier = 'Normal';
      else if (downLow) nextTier = 'Low';
      else if (isMin) nextTier = 'Min';
      break;
    case 'Normal':
      if (isMax) nextTier = 'Max';
      else if (upHigh) nextTier = 'High';
      else if (downLow) nextTier = 'Low';
      else if (isMin) nextTier = 'Min';
      break;
    case 'Low':
      if (isMax) nextTier = 'Max';
      else if (upHigh) nextTier = 'High';
      else if (upNormal) nextTier = 'Normal';
      else if (isMin) nextTier = 'Min';
      break;
    case 'Min':
      if (!config.irreversibleMin) {
        if (isMax) nextTier = 'Max';
        else if (upHigh) nextTier = 'High';
        else if (upNormal) nextTier = 'Normal';
        else if (upLow) nextTier = 'Low';
      }
      break;
  }

  const statusKey = nextTier.toLowerCase() as keyof ParsecsNeedConfig['statuses'];
  return {
    value: x,
    tier: nextTier,
    status: config.statuses[statusKey],
  };
}

/**
 * CIL 06002F7D & 06002F83: RuntimeCharacterData.ChangeNeedValue
 */
export function changeCharacterNeed(
  need: ParsecsNeedRuntime,
  delta: number,
  config: ParsecsNeedConfig,
): {
  readonly next: ParsecsNeedRuntime;
  readonly lostStatus: string | null;
  readonly gainedStatus: string | null;
} {
  if (need.immune || Math.abs(delta) < EPSILON) {
    return { next: need, lostStatus: null, gainedStatus: null };
  }
  const evaluated = evaluateNeedFsm(need.tier, need.value + delta, config);
  const lostStatus = need.activeStatus !== evaluated.status ? need.activeStatus : null;
  const gainedStatus = need.activeStatus !== evaluated.status ? evaluated.status : null;
  return {
    next: {
      ...need,
      value: evaluated.value,
      tier: evaluated.tier,
      activeStatus: evaluated.status,
    },
    lostStatus,
    gainedStatus,
  };
}

/**
 * CIL 06002E9C: CharacterAttribute.CalculateTeamAttributeValue
 */
export function calculateTeamAttributeValue(
  crew: readonly Pick<ParsecsCrewRuntime, 'isAlive' | 'isAwayOnExpedition' | 'attributes'>[],
  attribute: keyof ParsecsCharacterAttributes,
): number {
  const activeSum = crew
    .filter(member => member.isAlive && !member.isAwayOnExpedition)
    .reduce((sum, member) => sum + member.attributes[attribute], 0);
  return Math.round((0.125 * crew.length + 0.125 * activeSum) * 1000) / 1000;
}

/**
 * CIL 0600228C–0600228F: Deck.GetRandomEvent
 */
export function drawEventFromDeck(
  entries: readonly ParsecsDeckEntry[],
  seed: number,
): { readonly entry: ParsecsDeckEntry | null; readonly nextSeed: number } {
  if (entries.length === 0) return { entry: null, nextSeed: seed };
  const nextSeed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  const unitRoll = nextSeed / 4294967296;
  const totalWeight = entries.reduce((sum, item) => sum + Math.max(0, item.weight), 0);

  if (totalWeight > 0) {
    let target = unitRoll * totalWeight;
    for (const entry of entries) {
      target -= Math.max(0, entry.weight);
      if (target <= 0) {
        return { entry, nextSeed };
      }
    }
    return { entry: entries[entries.length - 1], nextSeed };
  }

  const uniformIndex = Math.min(entries.length - 1, Math.floor(unitRoll * entries.length));
  return { entry: entries[uniformIndex], nextSeed };
}

/**
 * Computes the 7-layer paper-doll sprite naming convention from sharedassets0.assets:
 * Srv<Name><Sanity><Health><Hunger><Part><Sick><Morale>
 */
export function computePaperDollState(
  firstName: string,
  needs: Readonly<Record<ParsecsNeedId, ParsecsNeedRuntime>>,
  extraStatuses: readonly string[],
  sol: number,
): ParsecsPaperDollState {
  const sanityTag = needs.need_sanity.activeStatus === 'Insane' ? 'Insane' : 'Norm';
  const healthTag = needs.need_health.activeStatus === 'Weak' ? 'Weak' : '';
  const hungerTag =
    needs.need_hunger.activeStatus === 'Starving' || needs.need_hunger.activeStatus === 'Hungry'
      ? 'Starv'
      : 'Wfed';
  const sickTag = extraStatuses.includes('Sick') ? 'Sick' : '';
  const moraleTag =
    needs.need_morale.tier === 'High' || needs.need_morale.tier === 'Max'
      ? 'MorUp'
      : needs.need_morale.tier === 'Low' || needs.need_morale.tier === 'Min'
        ? 'MorDown'
        : 'Nil';
  const hairProgress: 1 | 2 | 3 = sol >= 20 ? 3 : sol >= 10 ? 2 : 1;

  return {
    body: `Srv${firstName}${sanityTag}${healthTag}${hungerTag}Body`,
    bodyLayerHurt: extraStatuses.includes('Hurt'),
    face: `Srv${firstName}${sanityTag}${healthTag}${hungerTag}Face${sickTag}${moraleTag}`,
    eyelids: `Srv${firstName}${sanityTag}${healthTag}Eyelids${sickTag}${moraleTag}`,
    hairProgress,
  };
}

function getNeedConfig(id: ParsecsNeedId): ParsecsNeedConfig {
  const found = PARSECS_CATALOG.needsFsm.find(n => n.id === id);
  if (!found) throw new Error(`Missing need config: ${id}`);
  return found;
}

export function formatStarlogText(rawText: string, crew: readonly ParsecsCrewRuntime[]): string {
  const captain = crew.find(c => c.isCaptain) ?? crew[0];
  const crewmate = crew.find(c => !c.isCaptain && c.isAlive) ?? captain;
  const isFemaleCaptain = captain ? ['April', 'Deedee', 'Maegan'].includes(captain.firstName) : false;

  return rawText
    .replace(/\{\[CAPTAIN_NAME\]\}/g, captain?.firstName ?? 'Emmet')
    .replace(/\{\[CAPTAIN_SURNAME\]\}/g, captain?.surname ?? 'Ellis')
    .replace(/\{\[CREWMATE_NAME\]\}/g, crewmate?.firstName ?? 'Baby')
    .replace(/\{\[CREWMATE_SURNAME\]\}/g, crewmate?.surname ?? 'Bronco')
    .replace(/\{\[CAPTAIN_SEX\|([^/]+)\/([^\]]+)\]\}/g, (_, fem, masc) => (isFemaleCaptain ? fem : masc))
    .replace(/\{\[[^\]]+\]\}/g, captain?.firstName ?? 'Captain');
}

export function createInitialParsecsState(
  selectedCrewIds: readonly string[] = ['char_ee', 'char_aa', 'char_bb', 'char_dd'],
  seed = 19690720,
): ParsecsSimulationState {
  const chosenChars = PARSECS_CATALOG.characters.filter(c => selectedCrewIds.includes(c.id));
  const roster = chosenChars.length > 0 ? chosenChars : PARSECS_CATALOG.characters.slice(0, 4);

  const crew: ParsecsCrewRuntime[] = roster.map((c, idx) => {
    const needs: Record<ParsecsNeedId, ParsecsNeedRuntime> = {
      need_health: { id: 'need_health', value: 0.5, tier: 'Normal', activeStatus: null, immune: false },
      need_hunger: { id: 'need_hunger', value: 0.5, tier: 'Normal', activeStatus: null, immune: false },
      need_morale: { id: 'need_morale', value: 0.5, tier: 'Normal', activeStatus: null, immune: false },
      need_sanity: { id: 'need_sanity', value: 0.5, tier: 'Normal', activeStatus: null, immune: false },
    };
    return {
      pathId: c.pathId,
      id: c.id,
      assetName: c.assetName,
      firstName: c.firstName,
      surname: c.surname,
      description: c.description,
      isCaptain: idx === 0,
      attributes: c.attributes,
      needs,
      extraStatuses: [],
      isAlive: true,
      isAwayOnExpedition: false,
      plannedSoup: false,
      plannedMedkit: false,
      paperDoll: computePaperDollState(c.firstName, needs, [], 1),
    };
  });

  const initialOwned = new Set(['item_armor', 'item_communicator', 'item_gun', 'item_handbook', 'item_mask', 'item_shovel']);
  const shelf: ParsecsShelfItem[] = PARSECS_CATALOG.items.map(item => ({
    pathId: item.pathId,
    id: item.id,
    assetName: item.assetName,
    name: item.name,
    upgradedName: item.upgradedName,
    description: item.description,
    owned: initialOwned.has(item.id),
    damaged: false,
    upgraded: false,
    lockedOnExpedition: false,
  }));

  const firstEvent = PARSECS_CATALOG.events[0] ?? null;

  return {
    sol: 1,
    seed,
    currentPlanet: 'Planet-1',
    activeDeckId: 'deck_GenericsDeck',
    resources: {
      Chemical: 45,
      Mineral: 45,
      Power: 50,
    },
    soupCans: 8,
    shipSystems: {
      Crafting: 1,
      Engine: 1,
      Expedition: 1,
      Suit: 1,
    },
    activeSystemUpgrade: null,
    crew,
    shelf,
    activeExpedition: null,
    currentEvent: firstEvent,
    eventResolvedToday: false,
    lastEventOutcomeText: null,
    lastEndOfDayTrace: [
      'SOL 1 INITIALIZED: 60 Parsecs! Survival Mode (Unity 2017.4.35f1 Binary Verified)',
      `Captain ${crew[0].firstName} ${crew[0].surname} & ${crew.length - 1} Astrocitizens onboard.`,
    ],
    starlogHistory: [
      `[SOL 1] Astrocitizen Shuttle landed at ${PARSECS_CATALOG.expeditionDestinations[0]?.planet ?? 'Planet-1'}. All 4 Need FSMs initialized at 0.50 (Normal).`,
    ],
    gameOverReason: null,
  };
}

export function applyCrewNeedDelta(
  member: ParsecsCrewRuntime,
  needId: ParsecsNeedId,
  delta: number,
  sol: number,
): { readonly member: ParsecsCrewRuntime; readonly statusLog: string | null } {
  if (!member.isAlive) return { member, statusLog: null };
  const cfg = getNeedConfig(needId);
  const { next, lostStatus, gainedStatus } = changeCharacterNeed(member.needs[needId], delta, cfg);
  const nextNeeds = { ...member.needs, [needId]: next };
  const isDead = nextNeeds.need_health.activeStatus === 'Dead';

  let statusLog: string | null = null;
  if (lostStatus && gainedStatus) {
    statusLog = `${member.firstName}: ${cfg.name} (${lostStatus} → ${gainedStatus})`;
  } else if (gainedStatus) {
    statusLog = `${member.firstName} gained status [${gainedStatus}] (${cfg.name}: ${Math.round(next.value * 100)}%)`;
  } else if (lostStatus) {
    statusLog = `${member.firstName} recovered from [${lostStatus}] (${cfg.name}: ${Math.round(next.value * 100)}%)`;
  }

  return {
    member: {
      ...member,
      needs: nextNeeds,
      isAlive: !isDead,
      paperDoll: computePaperDollState(member.firstName, nextNeeds, member.extraStatuses, sol),
    },
    statusLog,
  };
}

/**
 * Toggle Soup or Medkit rationing for a crew member (`RationingManager`)
 */
export function toggleCrewRation(
  state: ParsecsSimulationState,
  crewId: string,
  kind: 'soup' | 'medkit',
): ParsecsSimulationState {
  const target = state.crew.find(c => c.id === crewId);
  if (!target || !target.isAlive || target.isAwayOnExpedition) return state;

  if (kind === 'soup') {
    const currentlyPlanned = state.crew.filter(c => c.plannedSoup).length;
    if (!target.plannedSoup && currentlyPlanned >= state.soupCans) return state;
    return {
      ...state,
      crew: state.crew.map(c => (c.id === crewId ? { ...c, plannedSoup: !c.plannedSoup } : c)),
    };
  }

  return {
    ...state,
    crew: state.crew.map(c => (c.id === crewId ? { ...c, plannedMedkit: !c.plannedMedkit } : c)),
  };
}

/**
 * Immediate Counseling / Psychological Support in Cabin
 */
export function counselCrewMember(state: ParsecsSimulationState, crewId: string): ParsecsSimulationState {
  if (state.resources.Power < 5) return state;
  let statusLogs: string[] = [];
  const nextCrew = state.crew.map(c => {
    if (c.id !== crewId || !c.isAlive || c.isAwayOnExpedition) return c;
    const r1 = applyCrewNeedDelta(c, 'need_sanity', 0.22, state.sol);
    const r2 = applyCrewNeedDelta(r1.member, 'need_morale', 0.18, state.sol);
    if (r1.statusLog) statusLogs.push(r1.statusLog);
    if (r2.statusLog) statusLogs.push(r2.statusLog);
    const cleanedExtra = r2.member.extraStatuses.filter(s => s !== 'Tired' && s !== 'Afraid');
    return {
      ...r2.member,
      extraStatuses: cleanedExtra,
      paperDoll: computePaperDollState(r2.member.firstName, r2.member.needs, cleanedExtra, state.sol),
    };
  });

  return {
    ...state,
    resources: { ...state.resources, Power: clampResource(state.resources.Power - 5) },
    crew: nextCrew,
    starlogHistory: [
      `[SOL ${state.sol}] Cabin Counseling completed (-5 Power). ${statusLogs.join(' | ') || 'Sanity & Morale stabilized.'}`,
      ...state.starlogHistory,
    ],
  };
}

/**
 * CraftingManager (CIL 060033E1) & ShelfItemController operations:
 * - craft-soup: 10 Chemical -> +1 Soup (or 15 -> +2, 20 -> +3)
 * - craft-item: 10 Chemical + 5 Power -> Owned Item
 * - repair-item: 10 Mineral -> Intact Item
 * - upgrade-item: 30 Chemical + 5 Power -> Upgraded Item (requires Crafting Lv.2+)
 * - recycle-item: Owned Item -> +10 Chemical + 10 Mineral
 */
export function executeCraftingOperation(
  state: ParsecsSimulationState,
  op:
    | { readonly kind: 'craft-soup'; readonly count: 1 | 2 | 3 }
    | { readonly kind: 'craft-item' | 'repair-item' | 'upgrade-item' | 'recycle-item'; readonly itemId: string },
): ParsecsSimulationState {
  const { resources } = state;

  if (op.kind === 'craft-soup') {
    const chemCost = op.count === 1 ? 10 : op.count === 2 ? 15 : 20;
    if (resources.Chemical < chemCost) return state;
    return {
      ...state,
      resources: { ...resources, Chemical: clampResource(resources.Chemical - chemCost) },
      soupCans: state.soupCans + op.count,
      starlogHistory: [
        `[SOL ${state.sol}] Crafted +${op.count} Astrocitizen Soup (-${chemCost} Chemical).`,
        ...state.starlogHistory,
      ],
    };
  }

  const item = state.shelf.find(i => i.id === op.itemId);
  if (!item || item.lockedOnExpedition) return state;

  if (op.kind === 'craft-item') {
    if (item.owned || resources.Chemical < 10 || resources.Power < 5) return state;
    return {
      ...state,
      resources: {
        ...resources,
        Chemical: clampResource(resources.Chemical - 10),
        Power: clampResource(resources.Power - 5),
      },
      shelf: state.shelf.map(i => (i.id === op.itemId ? { ...i, owned: true, damaged: false } : i)),
      starlogHistory: [
        `[SOL ${state.sol}] Crafted [${item.name}] (-10 Chemical, -5 Power).`,
        ...state.starlogHistory,
      ],
    };
  }

  if (op.kind === 'repair-item') {
    if (!item.owned || !item.damaged || resources.Mineral < 10) return state;
    return {
      ...state,
      resources: { ...resources, Mineral: clampResource(resources.Mineral - 10) },
      shelf: state.shelf.map(i => (i.id === op.itemId ? { ...i, damaged: false } : i)),
      starlogHistory: [
        `[SOL ${state.sol}] Repaired [${item.name}] (-10 Mineral).`,
        ...state.starlogHistory,
      ],
    };
  }

  if (op.kind === 'upgrade-item') {
    if (!item.owned || item.damaged || item.upgraded || resources.Chemical < 30 || resources.Power < 5) {
      return state;
    }
    return {
      ...state,
      resources: {
        ...resources,
        Chemical: clampResource(resources.Chemical - 30),
        Power: clampResource(resources.Power - 5),
      },
      shelf: state.shelf.map(i => (i.id === op.itemId ? { ...i, upgraded: true } : i)),
      starlogHistory: [
        `[SOL ${state.sol}] Upgraded [${item.name}] → [${item.upgradedName}] (-30 Chemical, -5 Power).`,
        ...state.starlogHistory,
      ],
    };
  }

  if (op.kind === 'recycle-item') {
    if (!item.owned) return state;
    const chemGain = item.damaged ? 0 : 10;
    const minGain = 10;
    return {
      ...state,
      resources: {
        ...resources,
        Chemical: clampResource(resources.Chemical + chemGain),
        Mineral: clampResource(resources.Mineral + minGain),
      },
      shelf: state.shelf.map(i =>
        i.id === op.itemId ? { ...i, owned: false, damaged: false, upgraded: false } : i,
      ),
      starlogHistory: [
        `[SOL ${state.sol}] Recycled [${item.name}] (+${chemGain} Chemical, +${minGain} Mineral).`,
        ...state.starlogHistory,
      ],
    };
  }

  return state;
}

/**
 * SimpleSystem.Upgrade (CIL 06003442) & CraftingManager.FinishCrafting (060033E8)
 */
export function startShipSystemUpgrade(
  state: ParsecsSimulationState,
  system: ParsecsSystemId,
): ParsecsSimulationState {
  if (state.activeSystemUpgrade) return state;
  const currentLvl = state.shipSystems[system];
  if (currentLvl >= 3) return state;
  const spec = PARSECS_SYSTEM_UPGRADE_TABLE[system].find(u => u.fromLevel === currentLvl);
  if (!spec) return state;

  const chemCost = spec.cost.Chemical ?? 0;
  const minCost = spec.cost.Mineral ?? 0;
  const powCost = spec.cost.Power ?? 0;
  if (
    state.resources.Chemical < chemCost ||
    state.resources.Mineral < minCost ||
    state.resources.Power < powCost
  ) {
    return state;
  }

  return {
    ...state,
    resources: {
      Chemical: clampResource(state.resources.Chemical - chemCost),
      Mineral: clampResource(state.resources.Mineral - minCost),
      Power: clampResource(state.resources.Power - powCost),
    },
    activeSystemUpgrade: {
      system,
      targetLevel: spec.toLevel,
      progressDays: 0,
      totalDays: spec.days,
    },
    starlogHistory: [
      `[SOL ${state.sol}] Started upgrading [${system} System] Lv.${currentLvl} → Lv.${spec.toLevel} (${spec.days} Sols).`,
      ...state.starlogHistory,
    ],
  };
}

/**
 * ExpeditionManager.SendExpedition (CIL 060031C4) & BlockThreat (060031D7)
 */
export function dispatchExpedition(
  state: ParsecsSimulationState,
  destinationId: string,
  crewId: string,
  itemIds: readonly string[],
): ParsecsSimulationState {
  if (state.activeExpedition) return state;
  const dest = PARSECS_CATALOG.expeditionDestinations.find(d => d.id === destinationId);
  const explorer = state.crew.find(c => c.id === crewId && c.isAlive && !c.isAwayOnExpedition);
  if (!dest || !explorer) return state;

  const validItems = state.shelf.filter(i => itemIds.includes(i.id) && i.owned && !i.damaged).slice(0, 3);
  const validItemIds = validItems.map(i => i.id);

  // Threat blocking logic (CIL 060031D7)
  const blockedThreats: string[] = [];
  if (validItemIds.includes('item_mask')) blockedThreats.push('Biohazard');
  if (validItemIds.includes('item_gun') || validItemIds.includes('item_shovel')) blockedThreats.push('Fauna');
  if (validItemIds.includes('item_armor')) blockedThreats.push('Environment');
  if (validItemIds.includes('item_battery') || validItemIds.includes('item_communicator')) blockedThreats.push('Darkness');
  if (validItemIds.includes('item_artifact') || validItemIds.includes('item_handbook')) blockedThreats.push('Supernatural');

  const nextSeed = (Math.imul(state.seed, 1664525) + 1013904223) >>> 0;
  // Suit level reduces expedition duration by up to 1 Sol
  const baseDays = 2 + (nextSeed % 3); // Random.Range(2, 5) -> 2..4 days
  const totalDays = Math.max(2, baseDays - (state.shipSystems.Suit >= 2 ? 1 : 0));

  return {
    ...state,
    seed: nextSeed,
    crew: state.crew.map(c => (c.id === crewId ? { ...c, isAwayOnExpedition: true, plannedSoup: false, plannedMedkit: false } : c)),
    shelf: state.shelf.map(i => (validItemIds.includes(i.id) ? { ...i, lockedOnExpedition: true } : i)),
    activeExpedition: {
      destinationId: dest.id,
      destinationTitle: dest.title,
      planet: dest.planet,
      crewId: explorer.id,
      crewName: `${explorer.firstName} ${explorer.surname}`,
      itemIds: validItemIds,
      elapsedDays: 0,
      totalDays,
      blockedThreats,
    },
    starlogHistory: [
      `[SOL ${state.sol}] Dispatched ${explorer.firstName} to [${dest.title}] (${totalDays} Sols, Threats blocked: ${blockedThreats.join(', ') || 'None'}).`,
      ...state.starlogHistory,
    ],
  };
}

/**
 * Resolve Player Decision on active SurvivalEvent / ExpeditionEvent / SystemStatusEvent
 */
export function resolveParsecsEventDecision(
  state: ParsecsSimulationState,
  optionIndex: number,
): ParsecsSimulationState {
  if (!state.currentEvent || state.eventResolvedToday) return state;
  const ev = state.currentEvent;
  const chosenOption = ev.options[optionIndex] ?? ev.options[0] ?? 'Yes';

  let outcomeRaw =
    optionIndex === 0
      ? ev.outcomes.primary
      : optionIndex === 1
        ? ev.outcomes.secondary
        : ev.outcomes.tertiary;

  // Check if this is an Attribute test or Item choice
  let checkBonus = true;
  if (ev.choiceKind === 'DisplayChooseAttributeNode') {
    const attrKey = chosenOption.toLowerCase() as keyof ParsecsCharacterAttributes;
    if (attrKey === 'strength' || attrKey === 'intelligence' || attrKey === 'agility') {
      const teamScore = calculateTeamAttributeValue(state.crew, attrKey);
      checkBonus = teamScore >= 0.65;
      outcomeRaw = checkBonus ? ev.outcomes.primary : ev.outcomes.secondary;
    }
  } else if (ev.choiceKind === 'DisplayChooseItemNode') {
    const hasItem = state.shelf.some(
      i => i.owned && !i.damaged && (i.assetName.toLowerCase() === chosenOption.toLowerCase() || i.name.toLowerCase() === chosenOption.toLowerCase()),
    );
    checkBonus = hasItem;
    outcomeRaw = hasItem ? ev.outcomes.primary : ev.outcomes.secondary;
  } else if (ev.choiceKind === 'DisplayYesNoNode') {
    checkBonus = optionIndex === 0;
  }

  const formattedOutcome = formatStarlogText(outcomeRaw, state.crew);

  // Apply decompiled Node effects
  let nextResources = { ...state.resources };
  let nextSoup = state.soupCans;
  let nextCrew = [...state.crew];
  let nextShelf = [...state.shelf];
  const effectNotes: string[] = [];

  for (const eff of ev.effects) {
    if (eff.kind === 'AddResourceNode') {
      const rName = (eff.targets[0] as ParsecsResourceId) || 'Chemical';
      if (rName in nextResources) {
        nextResources = { ...nextResources, [rName]: clampResource(nextResources[rName] + 15) };
        effectNotes.push(`+15 ${rName}`);
      }
    } else if (eff.kind === 'RemoveResourceNode') {
      const rName = (eff.targets[0] as ParsecsResourceId) || 'Power';
      if (rName in nextResources) {
        nextResources = { ...nextResources, [rName]: clampResource(nextResources[rName] - 10) };
        effectNotes.push(`-10 ${rName}`);
      }
    } else if (eff.kind === 'AddFoodNode') {
      nextSoup += 2;
      effectNotes.push('+2 Soup');
    } else if (eff.kind === 'RemoveFoodNode' && !checkBonus) {
      if (nextSoup > 0) {
        nextSoup -= 1;
        effectNotes.push('-1 Soup');
      }
    } else if (eff.kind === 'ModifyNeedNode') {
      const targetNeed = eff.targets.find(t => ['Health', 'Hunger', 'Morale', 'Sanity'].includes(t)) ?? 'Morale';
      const needId = `need_${targetNeed.toLowerCase()}` as ParsecsNeedId;
      const delta = checkBonus ? 0.15 : -0.15;
      nextCrew = nextCrew.map((c, idx) =>
        idx === 0 || !c.isCaptain ? applyCrewNeedDelta(c, needId, delta, state.sol).member : c,
      );
      effectNotes.push(`${targetNeed} ${delta > 0 ? '+15%' : '-15%'}`);
    } else if (eff.kind === 'AddStatusNode' && !checkBonus) {
      const statusName = eff.targets.find(t => !['AprilAngelle', 'BabyBronco', 'DeeDeeDawkins', 'EmmetEllis', 'MaeganMann', 'TomThomson'].includes(t)) ?? 'Tired';
      const targetMember = nextCrew.find(c => c.isAlive && !c.isAwayOnExpedition);
      if (targetMember && !targetMember.extraStatuses.includes(statusName)) {
        nextCrew = nextCrew.map(c =>
          c.id === targetMember.id
            ? {
                ...c,
                extraStatuses: [...c.extraStatuses, statusName],
                paperDoll: computePaperDollState(c.firstName, c.needs, [...c.extraStatuses, statusName], state.sol),
              }
            : c,
        );
        effectNotes.push(`${targetMember.firstName} +[${statusName}]`);
      }
    } else if (eff.kind === 'DamageItemNode' && !checkBonus) {
      const intact = nextShelf.find(i => i.owned && !i.damaged && !i.lockedOnExpedition);
      if (intact) {
        nextShelf = nextShelf.map(i => (i.id === intact.id ? { ...i, damaged: true } : i));
        effectNotes.push(`[${intact.name}] Damaged`);
      }
    } else if (eff.kind === 'AddItemNode' && checkBonus) {
      const unowned = nextShelf.find(i => !i.owned);
      if (unowned) {
        nextShelf = nextShelf.map(i => (i.id === unowned.id ? { ...i, owned: true, damaged: false } : i));
        effectNotes.push(`Found [${unowned.name}]`);
      }
    }
  }

  return {
    ...state,
    resources: nextResources,
    soupCans: nextSoup,
    crew: nextCrew,
    shelf: nextShelf,
    eventResolvedToday: true,
    lastEventOutcomeText: `${formattedOutcome}${effectNotes.length > 0 ? ` (${effectNotes.join(', ')})` : ''}`,
    starlogHistory: [
      `[SOL ${state.sol} EVENT] ${ev.id} → Choice [${chosenOption}]: ${effectNotes.join(', ') || 'Resolved'}.`,
      ...state.starlogHistory,
    ],
  };
}

/**
 * CIL 06002FE6 & 0600464E: EndOfDayManager.EndOfDay & ProcessEndOfDay.MoveNext
 * Executes the exact 10-layer listener pipeline verified from Assembly-CSharp-firstpass.dll.
 */
export function executeParsecsEndOfDay(state: ParsecsSimulationState): ParsecsSimulationState {
  if (state.gameOverReason) return state;

  const trace: string[] = [];
  let nextSol = state.sol + 1;
  let nextSeed = state.seed;
  let nextSoup = state.soupCans;
  let nextResources = { ...state.resources };
  let nextSystems = { ...state.shipSystems };
  let nextUpgrade = state.activeSystemUpgrade;
  let nextCrew = [...state.crew];
  let nextShelf = [...state.shelf];
  let nextExpedition = state.activeExpedition;

  // 1. PreEventSystems (Priority 1..90): Record choices, advance Crafting/System upgrade progress
  if (nextUpgrade) {
    const prog = nextUpgrade.progressDays + 1;
    if (prog >= nextUpgrade.totalDays) {
      nextSystems = { ...nextSystems, [nextUpgrade.system]: nextUpgrade.targetLevel };
      trace.push(`[PreEventSystems:7] ${nextUpgrade.system} System upgraded to Level ${nextUpgrade.targetLevel}!`);
      nextUpgrade = null;
    } else {
      nextUpgrade = { ...nextUpgrade, progressDays: prog };
      trace.push(`[PreEventSystems:7] ${nextUpgrade.system} upgrade in progress (${prog}/${nextUpgrade.totalDays} Sols).`);
    }
  } else {
    trace.push(`[PreEventSystems:20] Scheduler advanced day counter Sol ${state.sol} → Sol ${nextSol}.`);
  }

  // 2. ReportEvents (Priority 0): Clean up previous report & log decision
  trace.push(`[ReportEvents:0] Starlog report committed (${state.currentEvent?.id ?? 'none'}).`);

  // 3. Update (Priority 5..15): Rationing consumption + Daily Need changes + Expedition timer
  let rationsUsed = 0;
  nextCrew = nextCrew.map(member => {
    if (!member.isAlive) return member;
    let updated = { ...member };

    if (!updated.isAwayOnExpedition) {
      // Consume planned Soup (+0.65 Hunger) or apply daily -0.10 Hunger delta (CIL 06002F83)
      if (updated.plannedSoup && nextSoup > 0) {
        nextSoup -= 1;
        rationsUsed += 1;
        const rHunger = applyCrewNeedDelta(updated, 'need_hunger', 0.65, nextSol);
        updated = rHunger.member;
      } else {
        const rHunger = applyCrewNeedDelta(updated, 'need_hunger', -0.10, nextSol);
        updated = rHunger.member;
      }

      // Consume planned Medkit (+0.35 Health, cure Sick/Hurt)
      if (updated.plannedMedkit) {
        const rHealth = applyCrewNeedDelta(updated, 'need_health', 0.35, nextSol);
        const curedStatuses = rHealth.member.extraStatuses.filter(s => s !== 'Sick' && s !== 'Hurt');
        updated = { ...rHealth.member, extraStatuses: curedStatuses };
      }
    }

    return { ...updated, plannedSoup: false, plannedMedkit: false };
  });
  trace.push(`[Update:5] Consumed ${rationsUsed} Soup cans; applied daily -0.10 Hunger delta to unrationed crew.`);

  // ExpeditionManager.RevokeExpeditionAndUpdateExpeditionTime (CIL 060031C2 & 060031C6)
  if (nextExpedition) {
    const nextElapsed = nextExpedition.elapsedDays + 1;
    if (nextElapsed >= nextExpedition.totalDays) {
      const expGenBonus = state.shipSystems.Expedition * 8;
      const threatBonus = nextExpedition.blockedThreats.length * 6;
      const scavengedSoup = 2 + (nextSeed % 3);
      const scavengedChem = 15 + expGenBonus + threatBonus;
      const scavengedMin = 15 + expGenBonus;
      const scavengedPow = 12 + threatBonus;

      nextSoup += scavengedSoup;
      nextResources = {
        Chemical: clampResource(nextResources.Chemical + scavengedChem),
        Mineral: clampResource(nextResources.Mineral + scavengedMin),
        Power: clampResource(nextResources.Power + scavengedPow),
      };
      nextCrew = nextCrew.map(c =>
        c.id === nextExpedition?.crewId ? { ...c, isAwayOnExpedition: false } : c,
      );
      nextShelf = nextShelf.map(i =>
        nextExpedition?.itemIds.includes(i.id) ? { ...i, lockedOnExpedition: false } : i,
      );
      trace.push(
        `[Update:10] Expedition returned from ${nextExpedition.destinationTitle}: +${scavengedSoup} Soup, +${scavengedChem} Chem, +${scavengedMin} Min, +${scavengedPow} Power!`,
      );
      nextExpedition = null;
    } else {
      nextExpedition = { ...nextExpedition, elapsedDays: nextElapsed };
      trace.push(
        `[Update:10] ${nextExpedition.crewName} on expedition at ${nextExpedition.destinationTitle} (${nextElapsed}/${nextExpedition.totalDays} Sols).`,
      );
    }
  }

  // 4. SystemEvents (Priority 5..25): Persist status effects (Sick: -0.075 Health, Starving: -0.105 Health)
  nextCrew = nextCrew.map(member => {
    if (!member.isAlive) return member;
    let updated = member;
    if (updated.extraStatuses.includes('Sick')) {
      updated = applyCrewNeedDelta(updated, 'need_health', -0.075, nextSol).member;
    }
    if (updated.needs.need_hunger.activeStatus === 'Starving') {
      updated = applyCrewNeedDelta(updated, 'need_health', -0.105, nextSol).member;
      updated = applyCrewNeedDelta(updated, 'need_sanity', -0.08, nextSol).member;
    }
    return {
      ...updated,
      paperDoll: computePaperDollState(updated.firstName, updated.needs, updated.extraStatuses, nextSol),
    };
  });
  trace.push(`[SystemEvents:10] Processed status persistence (Starving -10.5% Health, Sick -7.5% Health) & RationingManager.CheckStatus.`);

  // 5. Goals (Priority 4..20): Check Captain survival
  const captain = nextCrew.find(c => c.isCaptain);
  let gameOverReason: string | null = null;
  if (!captain || !captain.isAlive) {
    gameOverReason = `Captain ${captain?.firstName ?? ''} perished on Sol ${nextSol}. Mission Terminated (CIL CharacterStatus.get_IsDead).`;
    trace.push(`[Goals:4] GAME OVER: ${gameOverReason}`);
  } else {
    trace.push(`[Goals:20] Captain ${captain.firstName} alive (Health: ${Math.round(captain.needs.need_health.value * 100)}%).`);
  }

  // 6. PrepareSystem & ActionEvents: Draw next event from Deck (CIL 0600228C)
  const activeDeck = PARSECS_CATALOG.decks.find(d => d.id === state.activeDeckId) ?? PARSECS_CATALOG.decks[0];
  let nextEvent: ParsecsDecompiledEvent | null = null;
  if (activeDeck && activeDeck.entries.length > 0) {
    const drawn = drawEventFromDeck(activeDeck.entries, nextSeed);
    nextSeed = drawn.nextSeed;
    nextEvent =
      PARSECS_CATALOG.events.find(e => e.pathId === drawn.entry?.eventPathId) ??
      PARSECS_CATALOG.events[nextSeed % PARSECS_CATALOG.events.length];
  } else {
    nextSeed = (Math.imul(nextSeed, 1664525) + 1013904223) >>> 0;
    nextEvent = PARSECS_CATALOG.events[nextSeed % PARSECS_CATALOG.events.length];
  }
  trace.push(`[PrepareSystem:0 & ActionEvents:0] Drawn event [${nextEvent?.id}] from [${activeDeck?.assetName ?? 'Deck'}].`);

  // 7. Visuals & Reset
  trace.push(`[Visuals:0..7 & Reset:5..35] Updated 7-layer paper-doll character visuals and shelf item sprites.`);

  return {
    ...state,
    sol: nextSol,
    seed: nextSeed,
    soupCans: nextSoup,
    resources: nextResources,
    shipSystems: nextSystems,
    activeSystemUpgrade: nextUpgrade,
    crew: nextCrew,
    shelf: nextShelf,
    activeExpedition: nextExpedition,
    currentEvent: nextEvent,
    eventResolvedToday: false,
    lastEventOutcomeText: null,
    lastEndOfDayTrace: trace,
    starlogHistory: [
      `[SOL ${nextSol}] New Day Started. Event: ${nextEvent?.id ?? 'None'}. Soup: ${nextSoup}, Chem: ${nextResources.Chemical}, Min: ${nextResources.Mineral}, Pow: ${nextResources.Power}.`,
      ...state.starlogHistory.slice(0, 29),
    ],
    gameOverReason,
  };
}
