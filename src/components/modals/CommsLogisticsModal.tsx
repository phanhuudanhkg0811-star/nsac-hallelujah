import { useGameStore } from '../../store/gameStore.ts';
import { CommsLogisticsPanel } from '../CommsLogisticsPanel.tsx';
export function CommsLogisticsModal() {
  const { gameState, advancePhase } = useGameStore();
  const prepareComms = () => {
    for (let i = 0; i < 2; i++) {
      const { phase, activeEvent } = useGameStore.getState().gameState;
      if (activeEvent || (phase !== 'briefing' && phase !== 'engineering')) break;
      advancePhase();
    }
  };
  return <>
    {(gameState.phase === 'engineering' || gameState.phase === 'briefing') && <button className="mission-button" disabled={Boolean(gameState.activeEvent)} onClick={prepareComms}>Hoàn tất kỹ thuật, mở kênh Houston</button>}
    {gameState.phase === 'rationing' && <p className="mission-note">Pha liên lạc đã kết thúc. Có thể gửi báo cáo và yêu cầu tiếp tế vào Sol tiếp theo.</p>}
    <CommsLogisticsPanel />
  </>;
}
