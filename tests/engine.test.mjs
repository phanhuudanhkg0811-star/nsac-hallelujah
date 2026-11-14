import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEngine() {
  const sourcePath = path.join(rootDir, 'src/engine/DaySimulationEngine.ts');
  const tsCode = fs.readFileSync(sourcePath, 'utf8');
  const transpiled = ts.transpileModule(tsCode, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const encoded = Buffer.from(transpiled.outputText, 'utf8').toString('base64');
  return import(`data:text/javascript;base64,${encoded}`);
}

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, relPath), 'utf8'));
}

const initialState = readJson('src/data/initial-state.json');
const balance = readJson('src/data/balance.json');
const events = readJson('src/data/events.json');
const briefs = readJson('src/data/nasa-briefs.json');
const config = { ...balance, events };

test('initial state and data contracts match core specifications', () => {
  assert.equal(initialState.sol, 1);
  assert.equal(initialState.phase, 'briefing');
  assert.equal(initialState.planet, 'moon');
  assert.equal(initialState.crew.length, 4);
  assert.ok(events.length >= 1);
  assert.ok(briefs.length >= 5);
  for (const ev of events) {
    assert.ok(ev.id && ev.title && ev.prompt);
    assert.ok(Array.isArray(ev.when));
    assert.ok(Array.isArray(ev.choices) && ev.choices.length >= 1);
  }
});

test('DaySimulationEngine enforces phase transitions and end-sol ECLSS balance', async () => {
  const { DaySimulationEngine, evaluateMissionProgress } = await loadEngine();

  let state = DaySimulationEngine(initialState, {
    config,
    commands: [
      { type: 'advance' }, // briefing -> engineering
      { type: 'advance' }, // engineering -> comms
      { type: 'transmit', id: 'tx-sol1-1', message: 'Check Houston link' },
      { type: 'radio-tick', nowMs: config.radioLatencyMs.moon + config.groundProcessingMs + config.radioLatencyMs.moon },
      { type: 'advance' }, // comms -> rationing
    ],
  });

  assert.equal(state.phase, 'rationing');
  assert.equal(state.radio[0].status, 'reply-received');

  const nextSol = DaySimulationEngine(state, {
    config,
    commands: [{ type: 'end-sol' }],
  });

  assert.equal(nextSol.sol, 2);
  assert.equal(nextSol.phase, 'briefing');
  assert.ok(nextSol.resources.oxygenKg < initialState.resources.oxygenKg);

  const evalMoon = evaluateMissionProgress(nextSol, config);
  assert.equal(evalMoon.planet, 'moon');
  assert.equal(evalMoon.canTransition, false);
  assert.equal(evalMoon.checks.length, 9);
});
