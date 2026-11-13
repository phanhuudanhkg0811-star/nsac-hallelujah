import type {
  Cargo, Condition, CrewMember, DayAction, DayActions, GameState,
  MissionEvaluation, MissionRequirementCheck, SimulationConfig, SystemId,
} from '../types/index.ts';

const clamp = (value: number, max = 1) => Math.max(0, Math.min(max, value));

function pick<T extends { readonly weight: number }>(items: readonly T[], seed: number) {
  if (items.length === 0) return { item: undefined, seed };
  const nextSeed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = nextSeed / 4294967296 * total;
  return { item: items.find(item => (roll -= item.weight) < 0), seed: nextSeed };
}

function eligible(state: GameState, condition: Condition): boolean {
  switch (condition.kind) {
    case 'planet': return state.planet === condition.value;
    case 'min-sol': return state.sol >= condition.value;
    case 'integrity-below': return state.systems[condition.system].integrity < condition.value;
  }
}

function brief(state: GameState, config: SimulationConfig): GameState {
  const candidates = config.events.filter(event => !state.seenEvents.includes(event.id)
    && event.when.every(condition => eligible(state, condition)));
  const { item, seed } = pick(candidates, state.seed);
  return { ...state, seed, activeEvent: item?.id ?? null };
}

function updateCrew(member: CrewMember, oxygen: number, water: number, food: number, rest: number): CrewMember {
  if (member.status === 'evacuated') return member;
  const thirst = clamp(member.thirst + 28 * (1 - water) - 12 * water, 100);
  const hunger = clamp(member.hunger + 20 * (1 - food) - 8 * food, 100);
  const fatigue = clamp(member.fatigue + 20 * (1 - rest) - 10 * rest, 100);
  const stress = clamp(member.stress + 12 * (1 - oxygen) + 8 * (1 - rest) - 4 * rest, 100);
  const health = clamp(member.health + 3 - 43 * (1 - oxygen)
    - 15 * (1 - water) - 6 * (1 - food) - 5 * (1 - rest), 100);
  const status = health === 0 ? 'evacuated'
    : health <= 50 || Math.max(thirst, hunger, fatigue, stress) >= 70 ? 'impaired' : 'fit';
  return { ...member, health, hunger, thirst, fatigue, stress, status };
}

function addCargo(resources: GameState['resources'], cargo: Cargo): GameState['resources'] {
  return {
    ...resources,
    oxygenKg: resources.oxygenKg + cargo.oxygenKg,
    waterL: resources.waterL + cargo.waterL,
    foodKg: resources.foodKg + cargo.foodKg,
    partsKg: resources.partsKg + cargo.partsKg,
  };
}

function endSol(state: GameState, config: SimulationConfig): GameState {
  const { resources, plan, systems } = state;
  const moon = state.planet === 'moon';
  const days = moon ? 1 : 88775 / 86400;
  const night = moon && Math.floor((state.sol - 1) / config.lunarHalfCycleDays) % 2 === 1;
  const dustStorm = !moon && config.marsDustWindows.some(window =>
    state.sol >= window.startSol && state.sol < window.endSol);
  const transmission = night ? 0 : dustStorm ? config.marsDustTransmission : 1;
  const generation = days * (config.fissionKWhPerDay
    + config.solarKWhPerDay * config.solarOutput[systems.solar.level] * transmission * systems.solar.integrity);
  const available = resources.batteryKWh + generation;
  const essential = config.essentialKWhPerDay * days;
  const power = clamp(available / essential);
  const remaining = Math.max(0, available - essential);
  const recycleCost = config.recyclerKWhPerDay * days;
  const recycling = plan.recycle && resources.wasteWaterL > 0
    && systems.recycler.integrity > 0 && remaining >= recycleCost;
  const recovered = recycling
    ? resources.wasteWaterL * config.recovery[systems.recycler.level] * systems.recycler.integrity : 0;
  const afterRecycling = remaining - (recycling ? recycleCost : 0);
  const moxieCost = days * config.moxieKWhPerDay;
  const moxie = !moon && plan.moxie && afterRecycling >= moxieCost;
  const oxygenStock = resources.oxygenKg + (moxie ? days * config.moxieOxygenKgPerDay : 0);
  const crewCount = state.crew.filter(member => member.status !== 'evacuated').length;
  const oxygenDemand = crewCount * config.oxygenKgPerDay * days;
  const waterDemand = crewCount * config.waterLPerDay * days;
  const foodDemand = crewCount * config.foodKgPerDay * days;
  const leak = Math.min(oxygenStock, days * config.airlockLeakKgPerDay * (1 - systems.airlock.integrity) * config.airlockLeakFactor[systems.airlock.level]);
  const oxygen = Math.min(oxygenStock - leak, oxygenDemand * Math.min(plan.oxygenFraction, clamp(power * systems.scrubber.integrity * config.scrubberFlow[systems.scrubber.level])));
  const water = Math.min(resources.waterL + recovered, waterDemand * plan.waterFraction);
  const food = Math.min(resources.foodKg, foodDemand * plan.foodFraction);
  const crew = state.crew.map(member => updateCrew(member, oxygenDemand ? oxygen / oxygenDemand : 1,
    waterDemand ? water / waterDemand : 1, foodDemand ? food / foodDemand : 1, plan.restFraction));
  let inventory = {
    ...resources,
    oxygenKg: oxygenStock - leak - oxygen,
    waterL: resources.waterL + recovered - water,
    wasteWaterL: (recycling ? 0 : resources.wasteWaterL) + water,
    foodKg: resources.foodKg - food,
    batteryKWh: clamp(afterRecycling - (moxie ? moxieCost : 0), config.batteryCapacityKWh),
  };
  const sol = state.sol + 1;
  const arrivals: string[] = [];
  const missions = state.missions.map(mission => {
    if (mission.status !== 'in-transit' || mission.arrivalSol > sol) return mission;
    inventory = addCargo(inventory, mission.payload);
    arrivals.push(mission.id);
    return { ...mission, status: 'delivered' as const };
  });
  const ended = crew.every(member => member.status === 'evacuated');
  const next: GameState = {
    ...state, sol, crew, missions, resources: inventory, phase: ended ? 'ended' : 'briefing',
    log: [...state.log, `Sol ${state.sol}: O2 used ${oxygen.toFixed(2)} kg, leaked ${leak.toFixed(2)} kg; water recovered ${recovered.toFixed(2)} L.`,
      ...arrivals.map(id => `Cargo arrived: ${id}`)],
  };
  return ended ? next : brief(next, config);
}

function apply(state: GameState, action: DayAction, config: SimulationConfig): GameState {
  if (action.type === 'radio-tick') {
    if (!Number.isSafeInteger(action.nowMs) || action.nowMs <= state.radioClockMs) return state;
    return { ...state, radioClockMs: action.nowMs, radio: state.radio.map(message => ({
      ...message, status: action.nowMs >= message.replyAtMs ? 'reply-received'
        : action.nowMs >= message.groundReceivesAtMs ? 'awaiting-reply' : 'outbound',
    })) };
  }
  if (state.phase === 'ended') return state;
  switch (action.type) {
    case 'advance': {
      if (state.activeEvent) return state;
      const next = { briefing: 'engineering', engineering: 'comms', comms: 'rationing' } as const;
      return state.phase === 'rationing' ? state : { ...state, phase: next[state.phase] };
    }
    case 'end-sol':
      return state.phase === 'rationing' ? endSol(state, config) : state;
    case 'plan': {
      if (state.phase !== 'rationing') return state;
      const { oxygenFraction, waterFraction, foodFraction, restFraction, recycle, moxie } = action;
      if (![oxygenFraction, waterFraction, foodFraction, restFraction].every(value => Number.isFinite(value) && value >= 0 && value <= 1)) return state;
      return { ...state, plan: { oxygenFraction, waterFraction, foodFraction, restFraction, recycle, moxie } };
    }
    case 'repair':
    case 'upgrade': {
      if (state.phase !== 'engineering') return state;
      const system = state.systems[action.system];
      if (action.type === 'repair' && system.integrity === 1) return state;
      if (action.type === 'upgrade' && system.level === 3) return state;
      const level = action.type === 'upgrade' ? (system.level === 1 ? 2 : 3) : system.level;
      const cost = action.type === 'repair' ? config.repairKg : config.upgradeKg[system.level === 1 ? 1 : 2];
      if (state.resources.partsKg < cost) return state;
      return { ...state, resources: { ...state.resources, partsKg: state.resources.partsKg - cost },
        systems: { ...state.systems, [action.system]: { level, integrity: action.type === 'repair' ? 1 : system.integrity } } };
    }
    case 'resupply': {
      if (state.phase !== 'comms' || !action.id || state.missions.some(mission => mission.id === action.id)) return state;
      const { oxygenKg, waterL, foodKg, partsKg } = action.payload;
      const masses = [oxygenKg, waterL, foodKg, partsKg];
      const total = masses.reduce((sum, mass) => sum + mass, 0);
      if (!masses.every(mass => Number.isFinite(mass) && mass >= 0) || total <= 0 || total > config.maxCargoKg) return state;
      return { ...state, missions: [...state.missions, { id: action.id, arrivalSol: state.sol + config.transitSols[state.planet],
        payload: { oxygenKg, waterL, foodKg, partsKg }, status: 'in-transit' }] };
    }
    case 'transmit': {
      if (state.phase !== 'comms' || !action.id || !action.message.trim() || state.radio.some(message => message.id === action.id)) return state;
      const latency = config.radioLatencyMs[state.planet];
      return { ...state, radio: [...state.radio, { id: action.id, message: action.message,
        groundReceivesAtMs: state.radioClockMs + latency,
        replyAtMs: state.radioClockMs + 2 * latency + config.groundProcessingMs, status: 'outbound' }] };
    }
    case 'choose': {
      if (state.phase !== 'briefing' || state.activeEvent !== action.eventId) return state;
      const event = config.events.find(event => event.id === action.eventId);
      const choice = event?.choices.find(choice => choice.id === action.choiceId);
      if (!choice || choice.partsKg > state.resources.partsKg) return state;
      const { item, seed } = pick(choice.outcomes, state.seed);
      if (!item) return state;
      const resources = { ...state.resources, partsKg: state.resources.partsKg - choice.partsKg };
      const systems = { ...state.systems };
      let crew = state.crew;
      for (const effect of item.effects) {
        if (effect.kind === 'damage') {
          const system = systems[effect.system];
          systems[effect.system] = { ...system, integrity: clamp(system.integrity - effect.amount) };
        } else if (effect.kind === 'oxygen-loss') {
          resources.oxygenKg = Math.max(0, resources.oxygenKg - effect.amount);
        } else {
          crew = crew.map(member => member.status === 'evacuated' ? member : {
            ...member, stress: clamp(member.stress + effect.amount, 100),
          });
        }
      }
      return { ...state, resources, systems, crew, seed, activeEvent: null,
        seenEvents: [...state.seenEvents, action.eventId], log: [...state.log, item.summary] };
    }
    case 'launch-mars': {
      if (state.planet !== 'moon') return state;
      const evaluation = evaluateMissionProgress(state, config);
      if (!evaluation.canTransition) return state;
      const tc = config.marsLaunch.transitConsumption;
      const nextResources = {
        ...state.resources,
        oxygenKg: Math.max(0, state.resources.oxygenKg - tc.oxygenKg),
        waterL: Math.max(0, state.resources.waterL - tc.waterL),
        foodKg: Math.max(0, state.resources.foodKg - tc.foodKg),
        partsKg: Math.max(0, state.resources.partsKg - tc.partsKg),
      };
      const nextCrew = state.crew.map(member => member.status === 'evacuated' ? member : {
        ...member,
        fatigue: Math.max(0, member.fatigue - 30),
        stress: Math.max(0, member.stress - 20),
      });
      const transitioned: GameState = {
        ...state,
        planet: 'mars',
        sol: 1,
        phase: 'briefing',
        resources: nextResources,
        crew: nextCrew,
        missions: [],
        radio: [],
        activeEvent: null,
        log: [
          ...state.log,
          `SỨ MỆNH CHUYỂN TIẾP: Tàu liên hành tinh rời Mặt Trăng sau ${state.sol} Sol. Đã tiêu hao ${tc.oxygenKg}kg O₂, ${tc.waterL}L nước, ${tc.foodKg}kg lương thực trong hành trình Hohmann và hạ cánh thành công xuống bình nguyên Chryse Planitia (Sao Hỏa)!`,
        ],
      };
      return brief(transitioned, config);
    }
  }
}

export function evaluateMissionProgress(state: GameState, config: SimulationConfig): MissionEvaluation {
  const req = state.planet === 'moon' ? config.marsLaunch : config.marsVictory;
  const activeCrew = state.crew.filter(c => c.status !== 'evacuated').length;
  const systemKeys = Object.keys(state.systems) as SystemId[];
  const totalLevels = systemKeys.reduce((sum, key) => sum + state.systems[key].level, 0);
  const minIntegrity = Math.min(...systemKeys.map(key => state.systems[key].integrity));

  const checks: MissionRequirementCheck[] = [
    {
      id: 'sol',
      label: state.planet === 'moon' ? 'Hoàn thành chu kỳ thử nghiệm Mặt Trăng' : 'Sinh tồn qua mùa bão bụi Sao Hỏa',
      currentText: `Sol ${state.sol}`,
      targetText: `≥ Sol ${req.minSol}`,
      met: state.sol >= req.minSol,
    },
    {
      id: 'crew',
      label: 'Quân số phi hành đoàn đủ sức khỏe trực chiến',
      currentText: `${activeCrew} người`,
      targetText: `≥ ${req.minActiveCrew} người`,
      met: activeCrew >= req.minActiveCrew,
    },
    {
      id: 'systems-level',
      label: 'Tổng cấp độ công nghệ hệ thống trạm',
      currentText: `Tổng cấp ${totalLevels}`,
      targetText: `≥ Cấp ${req.minSystemLevelTotal}`,
      met: totalLevels >= req.minSystemLevelTotal,
    },
    {
      id: 'systems-integrity',
      label: 'Độ bền tối thiểu của mọi hệ thống trạm',
      currentText: `${Math.round(minIntegrity * 100)}%`,
      targetText: `≥ ${Math.round(req.minSystemIntegrity * 100)}%`,
      met: minIntegrity >= req.minSystemIntegrity,
    },
    {
      id: 'oxygen',
      label: 'Dự trữ Dưỡng khí O₂ cho hành trình',
      currentText: `${state.resources.oxygenKg.toFixed(1)} kg`,
      targetText: `≥ ${req.requiredResources.oxygenKg} kg`,
      met: state.resources.oxygenKg >= req.requiredResources.oxygenKg,
    },
    {
      id: 'water',
      label: 'Dự trữ Nước sạch tuần hoàn',
      currentText: `${state.resources.waterL.toFixed(1)} L`,
      targetText: `≥ ${req.requiredResources.waterL} L`,
      met: state.resources.waterL >= req.requiredResources.waterL,
    },
    {
      id: 'food',
      label: 'Dự trữ Lương thực đóng gói',
      currentText: `${state.resources.foodKg.toFixed(1)} kg`,
      targetText: `≥ ${req.requiredResources.foodKg} kg`,
      met: state.resources.foodKg >= req.requiredResources.foodKg,
    },
    {
      id: 'parts',
      label: 'Dự trữ Phụ tùng cơ khí bảo dưỡng',
      currentText: `${state.resources.partsKg.toFixed(1)} kg`,
      targetText: `≥ ${req.requiredResources.partsKg} kg`,
      met: state.resources.partsKg >= req.requiredResources.partsKg,
    },
    {
      id: 'battery',
      label: 'Năng lượng Pin tích trữ khi phóng',
      currentText: `${state.resources.batteryKWh.toFixed(1)} kWh`,
      targetText: `≥ ${req.requiredResources.batteryKWh} kWh`,
      met: state.resources.batteryKWh >= req.requiredResources.batteryKWh,
    },
  ];

  return {
    planet: state.planet,
    canTransition: checks.every(c => c.met),
    checks,
  };
}

export function DaySimulationEngine(currentState: GameState, actions: DayActions): GameState {
  return actions.commands.reduce((state, action) => apply(state, action, actions.config), currentState);
}



