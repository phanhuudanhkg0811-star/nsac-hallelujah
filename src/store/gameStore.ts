import { create } from 'zustand';
import type { GameState, SimulationConfig, SystemId, Cargo } from '../types/index.ts';
import { DaySimulationEngine } from '../engine/DaySimulationEngine.ts';
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

interface GameStore {
  gameState: GameState;
  config: SimulationConfig;
  isNightTransition: boolean;
  currentBrief: StemBrief | null;
  dailyDecision: { sol: number; summary: string } | null;
  lastStatsDelta: {
    oxygenDelta: number;
    waterDelta: number;
    batteryDelta: number;
  } | null;

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
}

const config: SimulationConfig = {
  ...(balanceJson as unknown as Omit<SimulationConfig, 'events'>),
  events: eventsJson as unknown as SimulationConfig['events'],
};

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: {
    ...(initialStateJson as unknown as GameState),
    resources: { ...(initialStateJson.resources as GameState['resources']) },
    systems: { ...(initialStateJson.systems as unknown as GameState['systems']) },
    crew: [...(initialStateJson.crew as unknown as GameState['crew'])],
    log: [...initialStateJson.log],
  },
  config,
  isNightTransition: false,
  currentBrief: null,
  dailyDecision: null,
  lastStatsDelta: null,

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
    set({
      gameState: next,
      dailyDecision:
        next.activeEvent === null
          ? { sol: gameState.sol, summary: next.log.at(-1) ?? 'Đã ghi nhận quyết định.' }
          : get().dailyDecision,
    });
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
    set({ isNightTransition: false });
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
      isNightTransition: false,
      currentBrief: null,
      dailyDecision: null,
      lastStatsDelta: null,
    });
  },
}));
