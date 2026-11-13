export type Planet = 'moon' | 'mars';
export type SystemId = 'scrubber' | 'recycler' | 'solar' | 'airlock';
export type Level = 1 | 2 | 3;
export type Cargo = Omit<OutpostResources, 'batteryKWh' | 'wasteWaterL'>;

export interface CrewMember {
  readonly id: string;
  readonly name: string;
  readonly health: number;
  readonly stress: number;
  readonly fatigue: number;
  readonly hunger: number;
  readonly thirst: number;
  readonly status: 'fit' | 'impaired' | 'evacuated';
}

export interface OutpostResources {
  readonly oxygenKg: number;
  readonly waterL: number;
  readonly wasteWaterL: number;
  readonly foodKg: number;
  readonly partsKg: number;
  readonly batteryKWh: number;
}

export interface StationSystem {
  readonly level: Level;
  readonly integrity: number;
}

export interface ResupplyMission {
  readonly id: string;
  readonly arrivalSol: number;
  readonly payload: Cargo;
  readonly status: 'in-transit' | 'delivered';
}

export interface RadioTransmission {
  readonly id: string;
  readonly message: string;
  readonly groundReceivesAtMs: number;
  readonly replyAtMs: number;
  readonly status: 'outbound' | 'awaiting-reply' | 'reply-received';
}

export type Condition =
  | { readonly kind: 'planet'; readonly value: Planet }
  | { readonly kind: 'min-sol'; readonly value: number }
  | { readonly kind: 'integrity-below'; readonly system: SystemId; readonly value: number };

export type Effect =
  | { readonly kind: 'damage'; readonly system: SystemId; readonly amount: number }
  | { readonly kind: 'oxygen-loss' | 'stress'; readonly amount: number };

export interface GameEvent {
  readonly id: string;
  readonly title: string;
  readonly prompt: string;
  readonly weight: number;
  readonly when: readonly Condition[];
  readonly choices: readonly {
    readonly id: string;
    readonly label: string;
    readonly partsKg: number;
    readonly outcomes: readonly {
      readonly weight: number;
      readonly summary: string;
      readonly effects: readonly Effect[];
    }[];
  }[];
}

export interface GameState {
  readonly plan: Omit<Extract<DayAction, { type: 'plan' }>, 'type'>;
  readonly sol: number;
  readonly phase: 'briefing' | 'engineering' | 'comms' | 'rationing' | 'ended';
  readonly planet: Planet;
  readonly seed: number;
  readonly radioClockMs: number;
  readonly crew: readonly CrewMember[];
  readonly resources: OutpostResources;
  readonly systems: Readonly<Record<SystemId, StationSystem>>;
  readonly missions: readonly ResupplyMission[];
  readonly radio: readonly RadioTransmission[];
  readonly seenEvents: readonly string[];
  readonly activeEvent: string | null;
  readonly log: readonly string[];
}

export interface MissionTransitionRequirements {
  readonly minSol: number;
  readonly minActiveCrew: number;
  readonly minSystemLevelTotal: number;
  readonly minSystemIntegrity: number;
  readonly requiredResources: Readonly<Omit<OutpostResources, 'wasteWaterL'>>;
  readonly transitConsumption: Readonly<Omit<OutpostResources, 'wasteWaterL' | 'batteryKWh'>>;
}

export interface MissionRequirementCheck {
  readonly id: string;
  readonly label: string;
  readonly currentText: string;
  readonly targetText: string;
  readonly met: boolean;
}

export interface MissionEvaluation {
  readonly planet: Planet;
  readonly canTransition: boolean;
  readonly checks: readonly MissionRequirementCheck[];
}

export interface SimulationConfig {
  readonly events: readonly GameEvent[];
  readonly oxygenKgPerDay: number;
  readonly waterLPerDay: number;
  readonly foodKgPerDay: number;
  readonly recovery: Readonly<Record<Level, number>>;
  readonly solarOutput: Readonly<Record<Level, number>>;
  readonly airlockLeakFactor: Readonly<Record<Level, number>>;
  readonly scrubberFlow: Readonly<Record<Level, number>>;
  readonly repairKg: number;
  readonly upgradeKg: Readonly<Record<1 | 2, number>>;
  readonly solarKWhPerDay: number;
  readonly fissionKWhPerDay: number;
  readonly essentialKWhPerDay: number;
  readonly recyclerKWhPerDay: number;
  readonly batteryCapacityKWh: number;
  readonly lunarHalfCycleDays: number;
  readonly marsDustTransmission: number;
  readonly marsDustWindows: readonly { readonly startSol: number; readonly endSol: number }[];
  readonly moxieOxygenKgPerDay: number;
  readonly moxieKWhPerDay: number;
  readonly airlockLeakKgPerDay: number;
  readonly maxCargoKg: number;
  readonly transitSols: Readonly<Record<Planet, number>>;
  readonly radioLatencyMs: Readonly<Record<Planet, number>>;
  readonly groundProcessingMs: number;
  readonly marsLaunch: MissionTransitionRequirements;
  readonly marsVictory: Omit<MissionTransitionRequirements, 'transitConsumption'>;
}

export type DayAction =
  | { readonly type: 'advance' | 'end-sol' | 'launch-mars' }
  | { readonly type: 'repair' | 'upgrade'; readonly system: SystemId }
  | { readonly type: 'choose'; readonly eventId: string; readonly choiceId: string }
  | { readonly type: 'resupply'; readonly id: string; readonly payload: Cargo }
  | { readonly type: 'transmit'; readonly id: string; readonly message: string }
  | { readonly type: 'radio-tick'; readonly nowMs: number }
  | { readonly type: 'plan'; readonly oxygenFraction: number; readonly waterFraction: number; readonly foodFraction: number; readonly restFraction: number; readonly recycle: boolean; readonly moxie: boolean };

export interface DayActions {
  readonly config: SimulationConfig;
  readonly commands: readonly DayAction[];
}




