import { useState } from 'react';
import { CabinLayoutEditor } from './components/editor/CabinLayoutEditor.tsx';
import { ParsecsGameViewport } from './components/ParsecsGameViewport.tsx';

export default function App() {
  const [activeView, setActiveView] = useState<'editor' | 'game'>('editor');

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* Primary View */}
      {activeView === 'editor' ? (
        <CabinLayoutEditor />
      ) : (
        <ParsecsGameViewport />
      )}

      {/* Floating Toggle Pill in Bottom-Left Corner */}
      <div className="fixed bottom-3 left-3 z-[9999] opacity-40 hover:opacity-100 transition-opacity">
        <button
          onClick={() => setActiveView(v => (v === 'editor' ? 'game' : 'editor'))}
          className="px-2.5 py-1 text-[11px] font-mono rounded bg-slate-900/90 text-cyan-300 border border-slate-700 hover:border-cyan-400 shadow-lg backdrop-blur-sm"
        >
          {activeView === 'editor' ? '⇄ Xem Game View' : '⇄ Mở Layout Editor'}
        </button>
      </div>
    </div>
  );
}
