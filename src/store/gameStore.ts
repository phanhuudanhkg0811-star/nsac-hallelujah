import { create } from 'zustand';
import type { GameState, SimulationConfig, SystemId, Cargo } from '../types/index.ts';
import { DaySimulationEngine } from '../engine/DaySimulationEngine.ts';
import {
  createInitialParsecsState,
  toggleCrewRation,
  counselCrewMember,
  executeCraftingOperation,
  startShipSystemUpgrade,
  dispatchExpedition,
  resolveParsecsEventDecision,
  executeParsecsEndOfDay,
  PARSECS_CATALOG,
  type ParsecsSimulationState,
  type ParsecsSystemId,
} from '../engine/ParsecsDecompiledEngine.ts';
import initialStateJson from '../data/initial-state.json';
import balanceJson from '../data/balance.json';
import eventsJson from '../data/events.json';
import briefsJson from '../data/nasa-briefs.json';

export interface StemBrief {
  id: string;
  title: string;
  content: string;
  source: string;
}

export type StationRoomTab = 'parsecs' | 'bridge' | 'engineering' | 'logistics';

interface GameStore {
  activeRoomTab: StationRoomTab;
  gameState: GameState;
  parsecsState: ParsecsSimulationState;
  config: SimulationConfig;
  isNightTransition: boolean;
  referenceTransitionSol: number | null;
  currentBrief: StemBrief | null;
  dailyDecision: { sol: number; summary: string } | null;
  lastStatsDelta: {
    oxygenDelta: number;
    waterDelta: number;
    batteryDelta: number;
  } | null;

  // Room Tab Navigation
  setActiveRoomTab: (tab: StationRoomTab) => void;

  // NASA Outpost Actions
  advancePhase: () => void;
  chooseEventOption: (choiceId: string) => void;
  repairSystem: (system: SystemId) => void;
  upgradeSystem: (system: SystemId) => void;
  updatePlan: (plan: Partial<GameState['plan']>) => void;
  transmitRadio: (message: string) => void;
  tickRadio: (deltaMs: number) => void;
  requestResupply: (payload: Cargo) => void;
  endSol: () => void;
  launchToMars: () => void;
  completeNightTransition: () => void;
  resetGame: () => void;

  // 60 Parsecs! Decompiled Survival Actions
  parsecsToggleRation: (crewId: string, kind: 'soup' | 'medkit') => void;
  parsecsCounselCrew: (crewId: string) => void;
  parsecsCraftSoup: (count: 1 | 2 | 3) => void;
  parsecsItemOp: (kind: 'craft-item' | 'repair-item' | 'upgrade-item' | 'recycle-item', itemId: string) => void;
  parsecsUpgradeShipSystem: (system: ParsecsSystemId) => void;
  parsecsSendExpedition: (destinationId: string, crewId: string, itemIds: readonly string[]) => void;
  parsecsChooseEventOption: (optionIndex: number) => void;
  parsecsSelectDeck: (deckId: string) => void;
  parsecsSelectEventById: (eventId: string) => void;
  parsecsSetCrewRoster: (crewIds: readonly string[]) => void;
  parsecsEndSol: () => void;
}

const config: SimulationConfig = {
  ...(balanceJson as unknown as Omit<SimulationConfig, 'events'>),
  events: eventsJson as unknown as SimulationConfig['events'],
};

export const useGameStore = create<GameStore>((set, get) => ({
  activeRoomTab: 'parsecs',
  gameState: {
    ...(initialStateJson as unknown as GameState),
    resources: { ...(initialStateJson.resources as GameState['resources']) },
    systems: { ...(initialStateJson.systems as unknown as GameState['systems']) },
    crew: [...(initialStateJson.crew as unknown as GameState['crew'])],
    log: [...initialStateJson.log],
  },
  parsecsState: createInitialParsecsState(),
  config,
  isNightTransition: false,
  referenceTransitionSol: null,
  currentBrief: null,
  dailyDecision: null,
  lastStatsDelta: null,

  setActiveRoomTab: (tab) => set({ activeRoomTab: tab }),

  advancePhase: () => {
    const { gameState, config } = get();
    const next = DaySimulationEngine(gameState, {
      config,
      commands: [{ type: 'advance' }],
    });
    set({ gameState: next });
  },

  chooseEventOption: (choiceId: string) => {
    const { gameState, config } = get();
    if (!gameState.activeEvent) return;
    const next = DaySimulationEngine(gameState, {
      config,
      commands: [{ type: 'choose', eventId: gameState.activeEvent, choiceId }],
    });
    set({ gameState: next, dailyDecision: next.activeEvent === null
      ? { sol: gameState.sol, summary: next.log.at(-1) ?? 'Đã ghi nhận quyết định.' }
      : get().dailyDecision });
  },

  repairSystem: (system: SystemId) => {
    const { gameState, config } = get();
    const next = DaySimulationEngine(gameState, {
      config,
      commands: [{ type: 'repair', system }],
    });
    set({ gameState: next });
  },

  upgradeSystem: (system: SystemId) => {
    const { gameState, config } = get();
    const next = DaySimulationEngine(gameState, {
      config,
      commands: [{ type: 'upgrade', system }],
    });
    set({ gameState: next });
  },

  updatePlan: (planPartial) => {
    const { gameState, config } = get();
    const merged = { ...gameState.plan, ...planPartial };
    const next = DaySimulationEngine(gameState, {
      config,
      commands: [{ type: 'plan', ...merged }],
    });
    set({ gameState: next });
  },

  transmitRadio: (message: string) => {
    const { gameState, config } = get();
    const id = `tx-sol${gameState.sol}-${gameState.radio.length + 1}`;
    const next = DaySimulationEngine(gameState, {
      config,
      commands: [{ type: 'transmit', id, message }],
    });
    set({ gameState: next });
  },

  tickRadio: (deltaMs: number) => {
    const { gameState, config } = get();
    const nowMs = gameState.radioClockMs + Math.max(1, Math.round(deltaMs));
    const next = DaySimulationEngine(gameState, {
      config,
      commands: [{ type: 'radio-tick', nowMs }],
    });
    set({ gameState: next });
  },

  requestResupply: (payload: Cargo) => {
    const { gameState, config } = get();
    const id = `CARGO-SOL${gameState.sol}-${gameState.missions.length + 1}`;
    const next = DaySimulationEngine(gameState, {
      config,
      commands: [{ type: 'resupply', id, payload }],
    });
    set({ gameState: next });
  },

  endSol: () => {
    if (get().isNightTransition) return;
    const { gameState, config } = get();
    const prevResources = { ...gameState.resources };

    const next = DaySimulationEngine(gameState, {
      config,
      commands: [{ type: 'end-sol' }],
    });

    if (next.sol === gameState.sol) return;

    const o2Delta = Math.round((next.resources.oxygenKg - prevResources.oxygenKg) * 10) / 10;
    const waterDelta = Math.round((next.resources.waterL - prevResources.waterL) * 10) / 10;
    const batteryDelta = Math.round((next.resources.batteryKWh - prevResources.batteryKWh) * 10) / 10;

    const briefs = briefsJson as StemBrief[];
    const briefIndex = (gameState.sol - 1) % briefs.length;
    const brief = briefs[briefIndex];

    set({
      gameState: next,
      isNightTransition: true,
      referenceTransitionSol: null,
      currentBrief: brief,
      lastStatsDelta: {
        oxygenDelta: o2Delta,
        waterDelta: waterDelta,
        batteryDelta: batteryDelta,
      },
    });
  },

  launchToMars: () => {
    const { gameState, config } = get();
    const prevPlanet = gameState.planet;
    const next = DaySimulationEngine(gameState, {
      config,
      commands: [{ type: 'launch-mars' }],
    });
    if (next.planet !== prevPlanet) {
      const briefs = briefsJson as StemBrief[];
      set({
        gameState: next,
        isNightTransition: true,
        referenceTransitionSol: null,
        currentBrief: briefs[4],
        lastStatsDelta: {
          oxygenDelta: -config.marsLaunch.transitConsumption.oxygenKg,
          waterDelta: -config.marsLaunch.transitConsumption.waterL,
          batteryDelta: 0,
        },
      });
    }
  },

  completeNightTransition: () => {
    set({ isNightTransition: false, referenceTransitionSol: null });
  },

  resetGame: () => {
    set({
      gameState: {
        ...(initialStateJson as unknown as GameState),
        planet: 'moon',
        resources: { ...(initialStateJson.resources as GameState['resources']) },
        systems: { ...(initialStateJson.systems as unknown as GameState['systems']) },
        crew: [...(initialStateJson.crew as unknown as GameState['crew'])],
        log: ['Trạm Mặt Trăng Artemis Base Camp được kích hoạt thành công vào Sol 1.'],
      },
      parsecsState: createInitialParsecsState(),
      isNightTransition: false,
      referenceTransitionSol: null,
      currentBrief: null,
      dailyDecision: null,
      lastStatsDelta: null,
    });
  },

  // 60 Parsecs! Decompiled Actions
  parsecsToggleRation: (crewId, kind) => {
    const { parsecsState } = get();
    set({ parsecsState: toggleCrewRation(parsecsState, crewId, kind) });
  },

  parsecsCounselCrew: (crewId) => {
    const { parsecsState } = get();
    set({ parsecsState: counselCrewMember(parsecsState, crewId) });
  },

  parsecsCraftSoup: (count) => {
    const { parsecsState } = get();
    set({ parsecsState: executeCraftingOperation(parsecsState, { kind: 'craft-soup', count }) });
  },

  parsecsItemOp: (kind, itemId) => {
    const { parsecsState } = get();
    set({ parsecsState: executeCraftingOperation(parsecsState, { kind, itemId }) });
  },

  parsecsUpgradeShipSystem: (system) => {
    const { parsecsState } = get();
    set({ parsecsState: startShipSystemUpgrade(parsecsState, system) });
  },

  parsecsSendExpedition: (destinationId, crewId, itemIds) => {
    const { parsecsState } = get();
    set({ parsecsState: dispatchExpedition(parsecsState, destinationId, crewId, itemIds) });
  },

  parsecsChooseEventOption: (optionIndex) => {
    const { parsecsState } = get();
    set({ parsecsState: resolveParsecsEventDecision(parsecsState, optionIndex) });
  },

  parsecsSelectDeck: (deckId) => {
    const { parsecsState } = get();
    const deck = PARSECS_CATALOG.decks.find(d => d.id === deckId);
    const firstMatch = deck
      ? PARSECS_CATALOG.events.find(ev => deck.entries.some(e => e.eventPathId === ev.pathId))
      : undefined;
    set({
      parsecsState: {
        ...parsecsState,
        activeDeckId: deckId,
        currentEvent: firstMatch ?? parsecsState.currentEvent,
        eventResolvedToday: false,
        lastEventOutcomeText: null,
      },
    });
  },

  parsecsSelectEventById: (eventId) => {
    const { parsecsState } = get();
    const found = PARSECS_CATALOG.events.find(e => e.id === eventId);
    if (!found) return;
    set({
      parsecsState: {
        ...parsecsState,
        currentEvent: found,
        eventResolvedToday: false,
        lastEventOutcomeText: null,
      },
    });
  },

  parsecsSetCrewRoster: (crewIds) => {
    set({ parsecsState: createInitialParsecsState(crewIds) });
  },

  parsecsEndSol: () => {
    if (get().isNightTransition) return;
    const { parsecsState } = get();
    const nextParsecs = executeParsecsEndOfDay(parsecsState);
    if (nextParsecs.sol === parsecsState.sol) return;
    const briefs = briefsJson as StemBrief[];
    set({
      parsecsState: nextParsecs,
      isNightTransition: true,
      referenceTransitionSol: nextParsecs.sol,
      currentBrief: briefs[(nextParsecs.sol - 1) % briefs.length],
      lastStatsDelta: null,
    });
  },
}));
