import { describe, it, expect } from 'vitest';
import { createInitialGameState, advanceMissionDay } from '../src/core/engine';

describe('Project Hail Core Game Engine', () => {
  it('initializes game state with 4 crew members and 100% resources', () => {
    const state = createInitialGameState();
    expect(state.missionDay).toBe(1);
    expect(state.maxDays).toBe(12);
    expect(state.crew).toHaveLength(4);
    expect(state.resources.power).toBe(100);
    expect(state.resources.oxygen).toBe(100);
    expect(state.resources.water).toBe(100);
    expect(state.isGameOver).toBe(false);
  });

  it('advances mission day and consumes daily resources', () => {
    const state = createInitialGameState();
    const nextState = advanceMissionDay(state);

    expect(nextState.missionDay).toBe(2);
    expect(nextState.resources.power).toBe(90);
    expect(nextState.resources.oxygen).toBe(92);
    expect(nextState.resources.water).toBe(94);
  });

  it('ends mission when reaching beyond maxDays (Day 12)', () => {
    let state = createInitialGameState();
    for (let day = 1; day <= 12; day++) {
      state = advanceMissionDay(state);
    }
    expect(state.isGameOver).toBe(true);
  });
});

