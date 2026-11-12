import { useEffect, useState } from 'react';
import '../game.css';
import { useGameStore } from '../store/gameStore.ts';
import { ASSET_BASE, assetUrl } from './cabin/assets.ts';
import { CabinHotspot } from './cabin/CabinHotspot.tsx';
import { ViewportPorthole } from './cabin/ViewportPorthole.tsx';
import { LeftEquipmentShelf } from './cabin/LeftEquipmentShelf.tsx';
import { CraftingStation3D } from './cabin/CraftingStation3D.tsx';
import { CentralConsoleTable } from './cabin/CentralConsoleTable.tsx';
import { RightConsumableShelf } from './cabin/RightConsumableShelf.tsx';
import { ExpeditionSuitHatch } from './cabin/ExpeditionSuitHatch.tsx';
import { EndDayLeverControl } from './cabin/EndDayLeverControl.tsx';
import { CrewCabinSeats } from './cabin/CrewCabinSeats.tsx';
import { StarlogPrinterStation } from './cabin/StarlogPrinterStation.tsx';
import { TelemetryTopBar } from './hud/TelemetryTopBar.tsx';
import { MissionDialog } from './modals/MissionDialog.tsx';
import { StarlogModal } from './modals/StarlogModal.tsx';
import { CharacterSheetModal } from './modals/CharacterSheetModal.tsx';
import { EndOfDayModal } from './modals/EndOfDayModal.tsx';
import { CraftingModal } from './modals/CraftingModal.tsx';
import { ExpeditionModal } from './modals/ExpeditionModal.tsx';
import { CommsLogisticsModal } from './modals/CommsLogisticsModal.tsx';
import { MissionLaunchModal } from './modals/MissionLaunchModal.tsx';
import { NightCutsceneModal } from './modals/NightCutsceneModal.tsx';

const PANELS = {
  starlog: ['Starlog · Nhật ký trạm', 'StarlogComputer.webp'],
  character: ['Hồ sơ phi hành gia', 'IconAgility.webp'],
  crafting: ['Kỹ thuật & chế tạo', 'CraftingComputer.webp'],
  expedition: ['Thám hiểm', 'ExpeditionComputerAll.webp'],
  end: ['Tổng kết cuối ngày', 'SpaceshipEndday.webp'],
  comms: ['Liên lạc & tiếp tế', 'SpaceshipItemCommunicator.webp'],
  launch: ['Hành trình đến Sao Hỏa', 'IconEngine.webp'],
  menu: ['Điều khiển nhiệm vụ', 'IconBook.webp'],
} as const;
type Panel = keyof typeof PANELS;

export function ParsecsGameViewport() {
  const { gameState, parsecsState, isNightTransition, resetGame } = useGameStore();
  const [referenceMode, setReferenceMode] = useState(false);
  const [panel, setPanel] = useState<Panel | null>('starlog');
  const [crewId, setCrewId] = useState(gameState.crew[0].id);
  const [notice, setNotice] = useState('');
  const [showLabels, setShowLabels] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const sol = referenceMode ? parsecsState.sol : gameState.sol;
  const pending = referenceMode ? Boolean(parsecsState.currentEvent && !parsecsState.eventResolvedToday) : gameState.phase === 'briefing';
  useEffect(() => { setPanel(isNightTransition ? null : 'starlog'); }, [sol, isNightTransition, referenceMode]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 7000);
    return () => clearTimeout(timer);
  }, [notice]);
  const open = (next: Panel) => { setPanel(next); setConfirmReset(false); };
  const exterior = referenceMode ? {
    'Shuttle-Orbit': 'SurvSpaceshuttleBlackholeView01.webp', 'Planet-1': 'SurvSpaceshuttlePlanet01View01.webp', 'Planet-2': 'SurvSpaceshuttlePlanet02View01.webp', 'Planet-3': 'SurvSpaceshuttlePlanet03View01.webp',
  }[parsecsState.currentPlanet] : `SurvSpaceshuttlePlanet0${gameState.planet === 'moon' ? 1 : 2}View01.webp`;
  return <main className={`game-viewport ${showLabels ? 'show-hotspot-labels' : ''}`}>
    <div className="cabin-stage aspect-[4/3]" key={`${referenceMode}-${isNightTransition}`} aria-label="Buồng trạm không gian">
      <ViewportPorthole sprite={exterior} />
      <img className="cabin-shell" src={assetUrl(`Spaceship.webp`)} alt="Buồng trạm không gian" draggable={false} />
      <TelemetryTopBar referenceMode={referenceMode} />
      <StarlogPrinterStation hasUnread={pending} onClick={() => open('starlog')} />
      <LeftEquipmentShelf
        referenceMode={referenceMode}
        onClick={() => open('crafting')}
        onItemClick={id => open(id === 'item_medkit' ? 'character' : 'crafting')}
      />
      <CraftingStation3D level={referenceMode ? parsecsState.shipSystems.Crafting : 1} referenceMode={referenceMode} onClick={() => open('crafting')} />
      <RightConsumableShelf
        referenceMode={referenceMode}
        onClick={() => open('end')}
        onItemClick={id => open(id === 'item_handbook' ? 'menu' : id === 'item_gun' ? 'expedition' : 'end')}
      />
      <ExpeditionSuitHatch level={referenceMode ? parsecsState.shipSystems.Suit : 1} onClick={() => open('expedition')} />
      <EndDayLeverControl sol={sol} onClick={() => open('end')} />
      <CentralConsoleTable unread={pending} onClick={() => open('starlog')} onCommsClick={() => open('comms')} />
      <CrewCabinSeats referenceMode={referenceMode} onInspect={id => { setCrewId(id); open('character'); }} />
      <footer className="cabin-footer"><button onClick={() => open('menu')}>☰ <span>Nhiệm vụ</span></button><p>Chạm vào vật thể để tương tác</p><button aria-pressed={showLabels} onClick={() => setShowLabels(v => !v)}>Điểm tương tác</button></footer>
    </div>
    {notice && <div className="mission-toast" role="status"><span>{notice}</span><button aria-label="Ẩn thông báo" onClick={() => setNotice('')}>×</button></div>}
    {!isNightTransition && panel && <MissionDialog key={panel} panelType={panel} title={PANELS[panel][0]} art={PANELS[panel][1]} eyebrow={`${referenceMode ? 'PARSECS 1.3.2' : 'PROJECT HAIL'} / SOL ${String(sol).padStart(3, '0')}`} onClose={() => setPanel(null)}>
      {panel === 'starlog' && <StarlogModal referenceMode={referenceMode} onResolved={text => { setPanel(null); setNotice(text); }} />}
      {panel === 'character' && <CharacterSheetModal referenceMode={referenceMode} crewId={crewId} onSelect={setCrewId} />}
      {panel === 'crafting' && <CraftingModal referenceMode={referenceMode} />}
      {panel === 'expedition' && <ExpeditionModal referenceMode={referenceMode} />}
      {panel === 'end' && <EndOfDayModal referenceMode={referenceMode} onStarlog={() => open('starlog')} onComms={() => open('comms')} />}
      {panel === 'comms' && <CommsLogisticsModal />}
      {panel === 'launch' && <MissionLaunchModal />}
      {panel === 'menu' && <nav className="mission-menu" aria-label="Menu nhiệm vụ">
        <p className="mission-note">{referenceMode ? 'Parsecs: súp, trang bị, chế tạo và thám hiểm.' : 'Hail: dưỡng khí, nước, năng lượng và hành trình Mặt Trăng → Sao Hỏa.'} Hai chế độ có tiến trình độc lập.</p>
        <button onClick={() => open('starlog')}>Nhật ký trạm <span>01</span></button><button onClick={() => open('crafting')}>Kỹ thuật & chế tạo <span>02</span></button><button onClick={() => open('expedition')}>Thám hiểm <span>03</span></button>
        {!referenceMode && <><button onClick={() => open('comms')}>Liên lạc & tiếp tế <span>04</span></button><button onClick={() => open('launch')}>Hành trình Sao Hỏa <span>05</span></button></>}
        <button onClick={() => open('end')}>Tổng kết cuối ngày <span>→</span></button>
        <button onClick={() => { setReferenceMode(v => !v); setNotice(''); }}>{referenceMode ? 'Chuyển sang Project Hail' : 'Chuyển sang Parsecs 1.3.2'} <span>⇄</span></button>
        {!confirmReset ? <button onClick={() => setConfirmReset(true)}>Khởi động lại chiến dịch</button> : <div className="mission-warning"><p>Đặt lại cả hai chế độ về Sol 1?</p><div className="mission-actions"><button className="mission-button" onClick={() => { resetGame(); open('starlog'); }}>Đặt lại cả hai chế độ</button><button className="mission-button" onClick={() => setConfirmReset(false)}>Giữ tiến trình</button></div></div>}
      </nav>}
    </MissionDialog>}
    <NightCutsceneModal />
  </main>;
}
