import { GameState } from './types';

export function createInitialGameState(): GameState {
  return {
    missionDay: 1,
    maxDays: 12,
    resources: {
      power: 100,  // kWh
      oxygen: 100, // kg
      water: 100,  // L
    },
    crew: [
      { id: 'c1', name: 'Commander Alex', health: 100, status: 'Available', assignment: null },
      { id: 'c2', name: 'Engineer Brenda', health: 100, status: 'Available', assignment: null },
      { id: 'c3', name: 'Scientist Charlie', health: 100, status: 'Available', assignment: null },
      { id: 'c4', name: 'Pilot Dylan', health: 100, status: 'Available', assignment: null },
    ],
    expeditionsCompleted: 0,
    isGameOver: false,
    hasWon: false,
  };
}

export function advanceMissionDay(state: GameState): GameState {
  if (state.isGameOver) return state;

  const nextDay = state.missionDay + 1;
  const isFinalDay = nextDay > state.maxDays;

  // Basic consumption (pure function)
  const updatedResources = {
    power: Math.max(0, state.resources.power - 10),
    oxygen: Math.max(0, state.resources.oxygen - 8),
    water: Math.max(0, state.resources.water - 6),
  };

  const allAlive = state.crew.every((c) => c.health > 0);
  const hasWon = isFinalDay && allAlive && state.expeditionsCompleted >= 2;
  const isGameOver = isFinalDay || !allAlive;

  return {
    ...state,
    missionDay: isFinalDay ? state.maxDays : nextDay,
    resources: updatedResources,
    crew: state.crew.map((c) => ({ ...c, assignment: null, status: 'Available' })),
    isGameOver,
    hasWon,
  };
}

