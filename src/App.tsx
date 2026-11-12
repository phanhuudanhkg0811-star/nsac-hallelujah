import { useState, useTransition } from 'react';
import { createInitialGameState, advanceMissionDay } from './core/engine';
import { GameState } from './core/types';
import './index.css';

export function App() {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState());
  const [isPending, startTransition] = useTransition();

  const handleEndDay = () => {
    startTransition(() => {
      setGameState((prev) => advanceMissionDay(prev));
    });
  };

  const handleReset = () => {
    setGameState(createInitialGameState());
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'left' }}>
      <header style={{ marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
        <h1 style={{ margin: 0, color: '#38bdf8' }}>🚀 Project Hail</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#94a3b8' }}>
          Junior Astronaut Mission Trainer — Lunar Outpost (React 19)
        </p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', background: '#1e293b', borderRadius: '8px' }}>
          <h3>Mission Day</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            {gameState.missionDay} / {gameState.maxDays}
          </p>
        </div>
        <div style={{ padding: '1rem', background: '#1e293b', borderRadius: '8px' }}>
          <h3>Expeditions</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            {gameState.expeditionsCompleted} / 3
          </p>
        </div>
        <div style={{ padding: '1rem', background: '#1e293b', borderRadius: '8px' }}>
          <h3>Status</h3>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, color: gameState.isGameOver ? '#f87171' : '#4ade80' }}>
            {gameState.isGameOver ? (gameState.hasWon ? '🏆 Mission Success' : '❌ Mission Failed') : '🟢 Operational'}
          </p>
        </div>
      </section>

      <section style={{ padding: '1rem', background: '#1e293b', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <h3>Station Resources</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>⚡ Power: {gameState.resources.power} kWh</li>
          <li>🫧 Oxygen: {gameState.resources.oxygen} kg</li>
          <li>💧 Water: {gameState.resources.water} L</li>
        </ul>
      </section>

      <section style={{ padding: '1rem', background: '#1e293b', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <h3>Crew Roster (4 Astronauts)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {gameState.crew.map((member) => (
            <div key={member.id} style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px' }}>
              <strong>{member.name}</strong>
              <div>Health: {member.health}%</div>
              <div>Status: {member.status}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={handleEndDay}
          disabled={isPending || gameState.isGameOver}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#0284c7',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            cursor: gameState.isGameOver ? 'not-allowed' : 'pointer',
            opacity: isPending || gameState.isGameOver ? 0.6 : 1,
          }}
        >
          {isPending ? 'Simulating Night...' : 'End Mission Day'}
        </button>

        {gameState.isGameOver && (
          <button
            onClick={handleReset}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#475569',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Restart Mission
          </button>
        )}
      </div>
    </div>
  );
}

export default App;

