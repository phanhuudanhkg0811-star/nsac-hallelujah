import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore.ts';

export function NightCutsceneModal() {
  const { isNightTransition, currentBrief, lastStatsDelta, referenceTransitionSol, gameState, completeNightTransition, parsecsState } = useGameStore();
  const [length, setLength] = useState(0);
  const [skip, setSkip] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const fullText = currentBrief?.content ?? '';
  const sol = referenceTransitionSol ?? gameState.sol;
  useEffect(() => {
    if (!isNightTransition) { dialog.current?.close(); return; }
    dialog.current?.showModal();
    setLength(0); setSkip(false);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setLength(fullText.length); return; }
    const start = performance.now();
    const timer = window.setInterval(() => {
      const count = Math.min(fullText.length, Math.floor((performance.now() - start) / 15));
      setLength(count);
      if (count === fullText.length) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [isNightTransition, fullText]);
  if (!isNightTransition) return null;
  return <dialog ref={dialog} className="night-cutscene" aria-labelledby="night-title" onCancel={e => e.preventDefault()}>
    <div className="night-content">
      <p className="mission-kicker">{referenceTransitionSol ? 'PARSECS / NHẬT KÝ HÀNH TRÌNH' : 'HAIL / BÁO CÁO TRẠM'}</p>
      <h2 id="night-title">Sol {String(sol - 1).padStart(3, '0')}<span>đã khép lại.</span></h2>
      {lastStatsDelta ? <dl className="night-stats">{[
        ['Dưỡng khí O₂', lastStatsDelta.oxygenDelta, 'kg'], ['Nước trong kho', lastStatsDelta.waterDelta, 'L'], ['Điện trong pin', lastStatsDelta.batteryDelta, 'kWh'],
      ].map(([label, value, unit]) => <div key={label}><dt>{label}</dt><dd>{Number(value) > 0 ? '+' : ''}{value}<small>{unit}</small></dd></div>)}</dl> : <p className="night-summary">Còn {parsecsState.soupCans} hộp súp · {parsecsState.crew.filter(c => c.isAlive).length} thành viên sống sót</p>}
      {lastStatsDelta && <p className="night-caption">Thay đổi ròng trong kho sau một Sol.</p>}
      <section className="night-brief"><p className="mission-kicker">NASA Science Brief</p><h3>{currentBrief?.title}</h3><p aria-hidden="true" className="night-typewriter">{skip ? fullText : fullText.slice(0, length)}<span className="typewriter-cursor" /></p><p className="sr-only">{fullText}</p><small>{currentBrief?.source}</small></section>
      <div className="night-actions">{!skip && length < fullText.length && <button onClick={() => setSkip(true)} className="night-skip">Hiện toàn bộ nội dung</button>}<button className="mission-button" onClick={completeNightTransition}>Thức dậy vào Sol {sol} →</button></div>
    </div>
  </dialog>;
}
