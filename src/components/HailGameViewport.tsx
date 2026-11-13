import { useCallback, useEffect, useState } from 'react';
import '../hail.css';
import { useGameStore } from '../store/gameStore.ts';
import type { SystemId } from '../types/index.ts';
import {
  HAIL_ENV,
  HAIL_EQUIPMENT,
  HAIL_INVENTORY,
  HAIL_SVG,
  getHailCrewVisual,
  getHailSystemSprite,
} from './cabin/hailAssets.ts';
import { TelemetryTopBar } from './hud/TelemetryTopBar.tsx';
import { MissionDialog, type MissionDialogType } from './modals/MissionDialog.tsx';
import { StarlogModal } from './modals/StarlogModal.tsx';
import { CharacterSheetModal } from './modals/CharacterSheetModal.tsx';
import { CraftingModal } from './modals/CraftingModal.tsx';
import { ExpeditionModal } from './modals/ExpeditionModal.tsx';
import { EndOfDayModal } from './modals/EndOfDayModal.tsx';
import { CommsLogisticsModal } from './modals/CommsLogisticsModal.tsx';
import { MissionLaunchModal } from './modals/MissionLaunchModal.tsx';
import { NightCutsceneModal } from './modals/NightCutsceneModal.tsx';

type Panel = Exclude<MissionDialogType, 'generic'>;
type FocusRegion =
  | 'room'
  | 'console'
  | 'left-wall'
  | 'left-floor'
  | 'right-wall'
  | 'right-floor'
  | 'crew-left'
  | 'crew-right';

const PANELS: Record<Panel, { title: string; art: string }> = {
  starlog: { title: 'Starlog · Nhật ký & Sự cố Trạm', art: HAIL_SVG.sysComms },
  character: { title: 'Hồ sơ Phi hành đoàn & Y tế', art: HAIL_SVG.sysMed },
  crafting: { title: 'Kỹ thuật · ECLSS & Năng lượng', art: HAIL_SVG.sysPower },
  expedition: { title: 'Điều khiển Survey Rover & Bản đồ Mặt Trăng', art: HAIL_SVG.sysRobot },
  end: { title: 'Điều độ Khẩu phần & Kết thúc Sol', art: HAIL_SVG.actEndDay },
  comms: { title: 'Liên lạc CAPCOM & Tiếp tế Cargo', art: HAIL_SVG.sysComms },
  launch: { title: 'Tiến trình Nhiệm vụ & Phóng Sao Hỏa', art: HAIL_SVG.badgeNasaStem },
  menu: { title: 'Trung tâm Điều khiển Nhiệm vụ', art: HAIL_SVG.badgeNasaStem },
};

/**
 * Section 4.4 Human-Centered Composition Contract — Crew Slots (% of 16:9 viewport)
 * Order maps crew[0..3]:
 *  - [0] cmd (Sarah): Tiền cảnh trái (20 / 36 / 16 / 57)
 *  - [1] eng (Alex):  Phía sau trái   (36 / 42 / 12 / 38)
 *  - [2] doc (Marcus): Phía sau phải  (52 / 42 / 12 / 38)
 *  - [3] geo (Elena): Tiền cảnh phải  (64 / 36 / 16 / 57)
 */
const CREW_SLOTS: ReadonlyArray<{
  depth: 'foreground' | 'rear';
  side: 'left' | 'right';
  style: { left: string; top: string; width: string; height: string };
}> = [
  { depth: 'foreground', side: 'left', style: { left: '20%', top: '36%', width: '16%', height: '57%' } },
  { depth: 'rear', side: 'left', style: { left: '36%', top: '42%', width: '12%', height: '38%' } },
  { depth: 'rear', side: 'right', style: { left: '52%', top: '42%', width: '12%', height: '38%' } },
  { depth: 'foreground', side: 'right', style: { left: '64%', top: '36%', width: '16%', height: '57%' } },
];

/**
 * Section 4.4 — Tối đa 4 Station chính trong cockpit cùng lúc (2 tường + 2 sàn)
 */
const MAIN_STATIONS: ReadonlyArray<{
  id: SystemId;
  slotKey: Exclude<FocusRegion, 'room' | 'console' | 'crew-left' | 'crew-right'>;
  mount: 'wall' | 'floor';
  label: string;
  panel: Panel;
  style: { left: string; top: string; width: string; height: string };
}> = [
  {
    id: 'scrubber',
    slotKey: 'left-wall',
    mount: 'wall',
    label: 'Máy lọc O₂',
    panel: 'crafting',
    style: { left: '2%', top: '13%', width: '16%', height: '32%' },
  },
  {
    id: 'recycler',
    slotKey: 'left-floor',
    mount: 'floor',
    label: 'Tái chế Nước WRS',
    panel: 'crafting',
    style: { left: '2%', top: '48%', width: '17%', height: '27%' },
  },
  {
    id: 'airlock',
    slotKey: 'right-wall',
    mount: 'wall',
    label: 'Trạm CAPCOM',
    panel: 'comms',
    style: { left: '82%', top: '13%', width: '16%', height: '32%' },
  },
  {
    id: 'solar',
    slotKey: 'right-floor',
    mount: 'floor',
    label: 'Pin & Năng lượng',
    panel: 'crafting',
    style: { left: '81%', top: '48%', width: '17%', height: '27%' },
  },
];

const BLUEPRINT_ZONES: ReadonlyArray<{
  label: string;
  coords: string;
  tone: 'hud' | 'crew' | 'window' | 'console' | 'station' | 'action';
  style: { left: string; top: string; width: string; height: string };
}> = [
  { label: 'HUD Top', coords: '0/0/100/8', tone: 'hud', style: { left: '0%', top: '0%', width: '100%', height: '8%' } },
  { label: 'Crew Focal Zone', coords: '18/30/64/63', tone: 'crew', style: { left: '18%', top: '30%', width: '64%', height: '63%' } },
  { label: 'Window (<=8%)', coords: '41/15/18/30', tone: 'window', style: { left: '41%', top: '15%', width: '18%', height: '30%' } },
  { label: 'FG Left', coords: '20/36/16/57', tone: 'crew', style: { left: '20%', top: '36%', width: '16%', height: '57%' } },
  { label: 'Rear Left', coords: '36/42/12/38', tone: 'crew', style: { left: '36%', top: '42%', width: '12%', height: '38%' } },
  { label: 'Rear Right', coords: '52/42/12/38', tone: 'crew', style: { left: '52%', top: '42%', width: '12%', height: '38%' } },
  { label: 'FG Right', coords: '64/36/16/57', tone: 'crew', style: { left: '64%', top: '36%', width: '16%', height: '57%' } },
  { label: 'Decision Console', coords: '28/35.6/44/58.2', tone: 'console', style: { left: '28%', top: '35.6%', width: '44%', height: '58.2%' } },
  { label: 'Left Wall', coords: '2/13/16/32', tone: 'station', style: { left: '2%', top: '13%', width: '16%', height: '32%' } },
  { label: 'Left Floor', coords: '2/48/17/27', tone: 'station', style: { left: '2%', top: '48%', width: '17%', height: '27%' } },
  { label: 'Right Wall', coords: '82/13/16/32', tone: 'station', style: { left: '82%', top: '13%', width: '16%', height: '32%' } },
  { label: 'Right Floor', coords: '81/48/17/27', tone: 'station', style: { left: '81%', top: '48%', width: '17%', height: '27%' } },
  { label: 'Action Band', coords: '0/93/100/7', tone: 'action', style: { left: '0%', top: '93%', width: '100%', height: '7%' } },
];

function StatusBadge({ state }: { state: 'ok' | 'degraded' | 'broken' }) {
  const icon =
    state === 'broken'
      ? HAIL_SVG.stateCritical
      : state === 'degraded'
        ? HAIL_SVG.stateWarn
        : HAIL_SVG.stateOk;
  return (
    <img
      src={icon}
      alt={state}
      className={`hail-state-badge is-${state}`}
      draggable={false}
    />
  );
}

function getPrimaryStationId(
  phase: string,
  systems: Record<SystemId, { integrity: number }>
): SystemId | null {
  let lowestId: SystemId | null = null;
  let lowestScore = 0.85;
  for (const st of MAIN_STATIONS) {
    const val = systems[st.id]?.integrity ?? 1;
    if (val < lowestScore) {
      lowestScore = val;
      lowestId = st.id;
    }
  }
  if (lowestId) return lowestId;
  if (phase === 'engineering') return 'scrubber';
  if (phase === 'comms') return 'airlock';
  return null;
}

export function HailGameViewport() {
  const { gameState, isNightTransition, resetGame } = useGameStore();
  const [panel, setPanel] = useState<Panel | null>(null);
  const [focusRegion, setFocusRegion] = useState<FocusRegion>('room');
  const [crewId, setCrewId] = useState<string>(gameState.crew[0]?.id ?? 'cmd');
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 6500);
    return () => clearTimeout(timer);
  }, [notice]);

  const closeFocus = useCallback(() => {
    setPanel(null);
    setFocusRegion('room');
    setConfirmReset(false);
  }, []);

  const open = useCallback((next: Panel, region: FocusRegion = 'console') => {
    setPanel(next);
    setFocusRegion(region);
    setConfirmReset(false);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (panel || focusRegion !== 'room')) {
        closeFocus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [panel, focusRegion, closeFocus]);

  const pendingEvent = Boolean(gameState.activeEvent && gameState.phase === 'briefing');
  const isNightExterior = gameState.phase === 'rationing' || gameState.sol >= 10;
  const primaryStationId = getPrimaryStationId(gameState.phase, gameState.systems);

  const dockSide: 'left' | 'right' =
    focusRegion === 'right-wall' || focusRegion === 'right-floor' || focusRegion === 'crew-right'
      ? 'left'
      : 'right';

  const phaseHint = pendingEvent
    ? 'Sự cố mới trên Console Starlog'
    : gameState.phase === 'briefing'
      ? 'Bước 1 · Mở Starlog trên Console'
      : gameState.phase === 'engineering'
        ? 'Bước 2 · Kiểm tra 4 trạm ECLSS & Rover'
        : gameState.phase === 'comms'
          ? 'Bước 3 · Liên lạc CAPCOM bên phải'
          : 'Bước 4 · Chia khẩu phần & Kết thúc Sol';

  return (
    <main className="hail-viewport">
      <div
        className={`hail-stage ${showBlueprint ? 'is-blueprint' : ''}`}
        key={`${gameState.planet}-${isNightTransition}`}
        aria-label="Buồng điều khiển trạm Mặt Trăng Project Hail"
      >
        {/* Griductive-style 16:9 Camera Rig (Zooms smoothly to focused console/station/crew) */}
        <div className={`hail-camera-rig is-focus-${focusRegion}`}>
          {/* L00 + L01: Exterior Viewport Aperture locked strictly to 41 / 15 / 18 / 30 (5.4% area <= 8%) */}
          <div className="hail-window-aperture" aria-hidden="true">
            <img
              src={HAIL_ENV.spaceDeep}
              alt=""
              className="hail-l00-space"
              draggable={false}
            />
            <img
              src={isNightExterior ? HAIL_ENV.lunarNight : HAIL_ENV.lunarDay}
              alt=""
              className="hail-l01-lunar"
              draggable={false}
            />
          </div>

          {/* L02: Camera-locked cockpit shell with a single compact alpha window */}
          <img
            src={HAIL_ENV.cockpitShell}
            alt="Khoang chỉ huy trạm Project Hail"
            className="hail-l02-shell"
            draggable={false}
          />

          {/* L03: Strictly 4 Main Stations in Side Wall/Floor Bays (2% visual separation from crew focal zone) */}
          {MAIN_STATIONS.map(st => {
            const sys = gameState.systems[st.id];
            const vis = getHailSystemSprite(st.id, sys.integrity);
            const isPrimary = primaryStationId === st.id || vis.state !== 'ok';
            return (
              <button
                key={st.id}
                type="button"
                data-slot={st.slotKey}
                className={`hail-station hail-station--${st.mount} ${isPrimary ? 'is-primary-focus' : 'is-deemphasized'}`}
                style={st.style}
                aria-label={`${st.label} (${Math.round(sys.integrity * 100)}%)`}
                onClick={() => open(st.panel, st.slotKey)}
              >
                <img
                  src={vis.sprite}
                  alt={st.label}
                  className="hail-sprite-contain"
                  draggable={false}
                />
                {vis.overlay && (
                  <img src={vis.overlay} alt="" className="hail-fx-overlay" draggable={false} />
                )}
                <StatusBadge state={vis.state} />
                <span className="hail-station-tag">{st.label}</span>
              </button>
            );
          })}

          {/* L03.5: empty shell-fitted locker patches; contents are independent state-driven sprites */}
          <div className="hail-locker hail-locker--left" aria-label="Tủ tiếp tế sinh tồn">
            <img src={HAIL_EQUIPMENT.lockerLeftOpen} alt="" className="hail-locker-chassis" draggable={false} />
            {gameState.resources.foodKg > 0 && <img src={HAIL_INVENTORY.mrePack} alt="Khẩu phần MRE" className="hail-locker-item is-top-1" draggable={false} />}
            {gameState.resources.oxygenKg > 0 && <img src={HAIL_INVENTORY.oxygenCell} alt="Bình oxy dự phòng" className="hail-locker-item is-top-2" draggable={false} />}
            <img src={HAIL_INVENTORY.filterSeal} alt="Gioăng lọc dự phòng" className="hail-locker-item is-top-3" draggable={false} />
            {gameState.resources.waterL > 0 && <img src={HAIL_INVENTORY.waterPack} alt="Túi nước" className="hail-locker-item is-bottom-1" draggable={false} />}
            <img src={HAIL_INVENTORY.medicalKit} alt="Bộ y tế" className="hail-locker-item is-bottom-2" draggable={false} />
            {gameState.resources.partsKg > 0 && <img src={HAIL_INVENTORY.spareParts} alt="Linh kiện" className="hail-locker-item is-bottom-3" draggable={false} />}
            {gameState.resources.foodKg <= 0 && <img src={HAIL_EQUIPMENT.lockerDoorLeftTop} alt="" className="hail-locker-door" draggable={false} />}
            {gameState.resources.waterL <= 0 && <img src={HAIL_EQUIPMENT.lockerDoorLeftBottom} alt="" className="hail-locker-door" draggable={false} />}
          </div>

          <div className="hail-locker hail-locker--right" aria-label="Tủ mẫu vật và thiết bị">
            <img src={HAIL_EQUIPMENT.lockerRightOpen} alt="" className="hail-locker-chassis" draggable={false} />
            <img src={HAIL_INVENTORY.lunarSample} alt="Mẫu đá Mặt Trăng" className="hail-locker-item is-top-1" draggable={false} />
            <img src={HAIL_INVENTORY.sampleDrill} alt="Khoan lấy mẫu" className="hail-locker-item is-top-2" draggable={false} />
            <img src={HAIL_INVENTORY.specialBeacon} alt="Beacon khẩn cấp" className="hail-locker-item is-top-3" draggable={false} />
            <img src={HAIL_INVENTORY.spareParts} alt="Linh kiện dự phòng" className="hail-locker-item is-bottom-1" draggable={false} />
            <img src={HAIL_INVENTORY.filterSeal} alt="Gioăng lọc" className="hail-locker-item is-bottom-2" draggable={false} />
            <img src={HAIL_INVENTORY.oxygenCell} alt="Cell oxy" className="hail-locker-item is-bottom-3" draggable={false} />
            {gameState.phase === 'ended' && <img src={HAIL_EQUIPMENT.lockerDoorRightTop} alt="" className="hail-locker-door" draggable={false} />}
            {gameState.phase === 'ended' && <img src={HAIL_EQUIPMENT.lockerDoorRightBottom} alt="" className="hail-locker-door" draggable={false} />}
          </div>

          {/* L04-L06: Human-Centered Crew Focal Zone (18 / 30 / 64 / 63%) + Central Console (36 / 60 / 28 / 37%) */}
          <div className="hail-crew-stage">
            {gameState.crew.slice(0, 4).map((member, index) => {
              const slot = CREW_SLOTS[index];
              const vis = getHailCrewVisual(member.id);
              const isWarning = member.health < 55 || member.status !== 'fit';
              const isRear = slot.depth === 'rear';
              return (
                <button
                  key={member.id}
                  type="button"
                  className={`hail-crew-member is-${slot.depth} is-${slot.side} ${isWarning ? 'is-impaired' : ''}`}
                  style={slot.style}
                  aria-label={`Xem hồ sơ ${member.name} (${Math.round(member.health)}% HP)`}
                  onClick={() => {
                    setCrewId(member.id);
                    open('character', slot.side === 'left' ? 'crew-left' : 'crew-right');
                  }}
                >
                  {member.status !== 'evacuated' && (
                    <img
                      src={vis.seated}
                      alt={member.name}
                      className="hail-crew-figure"
                      draggable={false}
                    />
                  )}
                  <span className={`hail-crew-pill ${isRear ? 'is-rear-pill' : ''}`}>
                    {member.name.split(' ')[0]} · {Math.round(member.health)}%
                  </span>
                </button>
              );
            })}

            {/* Central Decision Console (28 / 35.6 / 44 / 58.2%) — foreground layer in front of all crew */}
            <div className="hail-decision-console" style={{ left: '28%', top: '35.6%', width: '44%', height: '58.2%' }}>
              <img
                src={HAIL_EQUIPMENT.consoleDesk}
                alt="Bàn điều khiển trung tâm"
                className="hail-console-art"
                draggable={false}
              />

              {/* Griductive-style perspective CSS Live Micro-Displays baked into console surface */}
              <div className="hail-console-screens">
                <button
                  type="button"
                  className={`hail-console-screen ${pendingEvent ? 'is-alert' : ''}`}
                  onClick={() => open('starlog', 'console')}
                  aria-label="Mở Starlog & Sự cố"
                >
                  <span className="hail-screen-code">LOG</span>
                  <strong>{pendingEvent ? 'ALERT' : `SOL ${gameState.sol}`}</strong>
                </button>

                <button
                  type="button"
                  className="hail-console-screen"
                  onClick={() => open('expedition', 'console')}
                  aria-label="Điều khiển Survey Rover & Bản đồ Mặt Trăng"
                >
                  <span className="hail-screen-code">ROVER</span>
                  <strong>SURVEY</strong>
                </button>

                <button
                  type="button"
                  className="hail-console-screen"
                  onClick={() => open('launch', 'console')}
                  aria-label="Tiến trình Sao Hỏa & Y tế"
                >
                  <span className="hail-screen-code">MARS</span>
                  <strong>{Math.min(100, Math.round((gameState.sol / 12) * 100))}%</strong>
                </button>
              </div>
            </div>
          </div>

          {/* Optional Section 4.4 Blueprint Verification Overlay */}
          {showBlueprint && (
            <div className="hail-blueprint-overlay" aria-hidden="true">
              {BLUEPRINT_ZONES.map(zone => (
                <div
                  key={zone.label}
                  className={`hail-bp-box is-${zone.tone}`}
                  style={zone.style}
                >
                  <span>
                    {zone.label} ({zone.coords})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* L07 Top Safe HUD Band (0 / 0 / 100 / 8%) */}
        <TelemetryTopBar />

        {/* Subtle Blueprint Verification Toggle tucked just below top 8% HUD on left margin */}
        <button
          type="button"
          className={`hail-bp-toggle ${showBlueprint ? 'is-active' : ''}`}
          onClick={() => setShowBlueprint(v => !v)}
          aria-pressed={showBlueprint}
          title="Hiển thị khung tỷ lệ Section 4.4"
        >
          {showBlueprint ? 'Ẩn Grid 4.4' : 'Grid 4.4'}
        </button>

        {/* L08 Bottom Action Band (0 / 93 / 100 / 7% — max 3 high-level actions) */}
        <footer className="hail-action-band" aria-label="Thanh hành động chính">
          <button type="button" onClick={() => open('starlog', 'console')}>
            <img src={HAIL_SVG.sysComms} alt="" />
            <span>Starlog</span>
          </button>

          <p className="hail-phase-hint">{phaseHint}</p>

          <div className="hail-action-band-right">
            <button type="button" onClick={() => open('menu', 'room')}>
              <img src={HAIL_SVG.badgeNasaStem} alt="" />
              <span>Nhiệm vụ</span>
            </button>
            <button type="button" className="is-primary" onClick={() => open('end', 'console')}>
              <img src={HAIL_SVG.actEndDay} alt="" />
              <span>Kết thúc Sol</span>
            </button>
          </div>
        </footer>
      </div>

      {notice && (
        <div className="mission-toast hail-toast" role="status">
          <span>{notice}</span>
          <button type="button" aria-label="Ẩn thông báo" onClick={() => setNotice('')}>
            <img src={HAIL_SVG.navClose} alt="×" className="w-4 h-4" />
          </button>
        </div>
      )}

      {!isNightTransition && panel && (
        <MissionDialog
          key={panel}
          panelType={panel}
          dockSide={dockSide}
          title={PANELS[panel].title}
          art={PANELS[panel].art}
          eyebrow={`PROJECT HAIL · SOL ${String(gameState.sol).padStart(2, '0')} / 12`}
          onClose={closeFocus}
        >
          {panel === 'starlog' && (
            <StarlogModal
              onResolved={text => {
                closeFocus();
                setNotice(text);
              }}
            />
          )}
          {panel === 'character' && (
            <CharacterSheetModal
              crewId={crewId}
              onSelect={setCrewId}
            />
          )}
          {panel === 'crafting' && <CraftingModal />}
          {panel === 'expedition' && <ExpeditionModal />}
          {panel === 'end' && (
            <EndOfDayModal
              onStarlog={() => open('starlog', 'console')}
              onComms={() => open('comms', 'right-wall')}
            />
          )}
          {panel === 'comms' && <CommsLogisticsModal />}
          {panel === 'launch' && <MissionLaunchModal />}
          {panel === 'menu' && (
            <nav className="mission-menu hail-menu" aria-label="Menu nhiệm vụ">
              <p className="mission-note">
                Project Hail · Trạm Mặt Trăng 2050+: Duy trì O₂, Nước (WRS), Pin Mặt Trời và sức khỏe 4 phi hành gia qua 12 ngày nhiệm vụ.
              </p>
              <button type="button" onClick={() => open('starlog', 'console')}>
                <span>Nhật ký & Sự cố Trạm</span> <span>01</span>
              </button>
              <button type="button" onClick={() => open('crafting', 'left-wall')}>
                <span>Kỹ thuật & Sửa chữa ECLSS</span> <span>02</span>
              </button>
              <button type="button" onClick={() => open('character', 'crew-left')}>
                <span>Trạm Y tế & Hồ sơ Phi hành đoàn</span> <span>03</span>
              </button>
              <button type="button" onClick={() => open('expedition', 'console')}>
                <span>Bản đồ Mặt Trăng & Survey Rover</span> <span>04</span>
              </button>
              <button type="button" onClick={() => open('comms', 'right-wall')}>
                <span>Liên lạc CAPCOM & Tiếp tế</span> <span>05</span>
              </button>
              <button type="button" onClick={() => open('launch', 'console')}>
                <span>Tiến trình & Hành trình Sao Hỏa</span> <span>06</span>
              </button>
              <button type="button" onClick={() => open('end', 'console')}>
                <span>Chia khẩu phần & Kết thúc Sol</span> <span>→</span>
              </button>
              {!confirmReset ? (
                <button type="button" onClick={() => setConfirmReset(true)}>
                  <span>Khởi động lại chiến dịch</span> <span>↺</span>
                </button>
              ) : (
                <div className="mission-warning">
                  <p>Đặt lại toàn bộ chiến dịch về Sol 1?</p>
                  <div className="mission-actions">
                    <button
                      type="button"
                      className="mission-button"
                      onClick={() => {
                        resetGame();
                        open('starlog', 'console');
                      }}
                    >
                      Xác nhận đặt lại Sol 1
                    </button>
                    <button
                      type="button"
                      className="mission-button"
                      onClick={() => setConfirmReset(false)}
                    >
                      Giữ tiến trình
                    </button>
                  </div>
                </div>
              )}
            </nav>
          )}
        </MissionDialog>
      )}

      <NightCutsceneModal />
    </main>
  );
}
