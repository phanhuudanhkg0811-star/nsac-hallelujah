export type ResourceType = 'power' | 'oxygen' | 'water';

export interface StationResources {
  power: number;   // kWh
  oxygen: number;  // kg
  water: number;   // L
}

export type CrewStatus = 'Available' | 'Busy' | 'Injured' | 'Incapacitated';

export interface CrewMember {
  id: string;
  name: string;
  health: number; // 0 - 100
  status: CrewStatus;
  assignment: string | null;
}

export interface GameState {
  missionDay: number; // 1 to 12
  maxDays: number;
  resources: StationResources;
  crew: CrewMember[];
  expeditionsCompleted: number;
  isGameOver: boolean;
  hasWon: boolean;
}

