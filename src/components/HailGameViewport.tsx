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
  { depth: 'foreground', side: 'left', style: { left: '14%', top: '38%', width: '16%', height: '55%' } },
  { depth: 'rear', side: 'left', style: { left: '36%', top: '42%', width: '12%', height: '38%' } },
  { depth: 'rear', side: 'right', style: { left: '52%', top: '42%', width: '12%', height: '38%' } },
  { depth: 'foreground', side: 'right', style: { left: '70%', top: '38%', width: '16%', height: '55%' } },
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
    id: 'airlock',
    slotKey: 'right-wall',
    mount: 'wall',
    label: 'CAPCOM & Rover',
    panel: 'comms',
    style: { left: '81.1005%', top: '14.9841%', width: '15.9091%', height: '31.4559%' },
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
  { label: 'FG Left', coords: '14/38/16/55', tone: 'crew', style: { left: '14%', top: '38%', width: '16%', height: '55%' } },
  { label: 'Rear Left', coords: '36/42/12/38', tone: 'crew', style: { left: '36%', top: '42%', width: '12%', height: '38%' } },
  { label: 'Rear Right', coords: '52/42/12/38', tone: 'crew', style: { left: '52%', top: '42%', width: '12%', height: '38%' } },
  { label: 'FG Right', coords: '70/38/16/55', tone: 'crew', style: { left: '70%', top: '38%', width: '16%', height: '55%' } },
  { label: 'Decision Console', coords: '27.5/55.6/45/37.1', tone: 'console', style: { left: '27.5%', top: '55.6%', width: '45%', height: '37.1%' } },
  { label: 'UL: Food & Aid (CSS 2x2)', coords: '3.05/14.98/15.91/31.46', tone: 'station', style: { left: '3.0502%', top: '14.9841%', width: '15.9091%', height: '31.4559%' } },
  { label: 'LL: 3D Fabricator', coords: '2.87/53.56/16.21/31.14', tone: 'station', style: { left: '2.8708%', top: '53.56%', width: '16.2081%', height: '31.1371%' } },
  { label: 'UR: CAPCOM & Rover', coords: '81.10/14.98/15.91/31.46', tone: 'station', style: { left: '81.1005%', top: '14.9841%', width: '15.9091%', height: '31.4559%' } },
  { label: 'LR: Inventory & Sample (CSS 3x3)', coords: '80.98/53.56/16.21/31.14', tone: 'station', style: { left: '80.9809%', top: '53.56%', width: '16.2081%', height: '31.1371%' } },
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

          {/* L03: Wall-Rack Consolidation (4 Corner Bays · Center Wall Kept Clear) */}
          {/* UL Bay: Food & Aid Rack (CSS 2x2) */}
          <div className="hail-bay-rack hail-bay-rack--ul" aria-label="Tủ lương thực và sơ cứu (UL)">
            <div className="hail-bay-rack-shell">
              <div className="hail-rack-header" aria-hidden="true">
                <span className="hail-rack-header-stripe" />
                <span className="hail-rack-header-rivet" />
              </div>
              <div className="hail-rack-grid hail-rack-grid--2x2">
                <button
                  type="button"
                  className="hail-rack-cell"
                  aria-label={`Khẩu phần MRE (${Math.round(gameState.resources.foodKg)} kg)`}
                  onClick={() => open('end', 'left-wall')}
                >
                  <img
                    src={HAIL_INVENTORY.mrePack}
                    alt="Gói khẩu phần MRE"
                    className={`hail-rack-item ${gameState.resources.foodKg <= 0 ? 'is-empty-slot' : ''}`}
                    draggable={false}
                  />
                  <span className="hail-rack-cell-tag">MRE</span>
                </button>

                <button
                  type="button"
                  className="hail-rack-cell"
                  aria-label={`Khẩu phần MRE (${Math.round(gameState.resources.foodKg)} kg)`}
                  onClick={() => open('end', 'left-wall')}
                >
                  <img
                    src={HAIL_INVENTORY.mrePack}
                    alt="Gói khẩu phần MRE"
                    className={`hail-rack-item ${gameState.resources.foodKg < 15 ? 'is-empty-slot' : ''}`}
                    draggable={false}
                  />
                  <span className="hail-rack-cell-tag">MRE</span>
                </button>

                <button
                  type="button"
                  className="hail-rack-cell"
                  aria-label={`Khẩu phần MRE (${Math.round(gameState.resources.foodKg)} kg)`}
                  onClick={() => open('end', 'left-wall')}
                >
                  <img
                    src={HAIL_INVENTORY.mrePack}
                    alt="Gói khẩu phần MRE"
                    className={`hail-rack-item ${gameState.resources.foodKg < 30 ? 'is-empty-slot' : ''}`}
                    draggable={false}
                  />
                  <span className="hail-rack-cell-tag">MRE</span>
                </button>

                <button
                  type="button"
                  className="hail-rack-cell"
                  aria-label="Mở bộ sơ cứu y tế"
                  onClick={() => open('character', 'left-wall')}
                >
                  <img
                    src={HAIL_INVENTORY.medicalKit}
                    alt="Bộ sơ cứu y tế"
                    className="hail-rack-item"
                    draggable={false}
                  />
                  <span className="hail-rack-cell-tag">Y tế</span>
                </button>
              </div>
            </div>
          </div>

          {/* LL Bay: 3D Fabricator (HUMAN FRONTIER 2050+ 8-vertex cavity-locked sprite) */}
          <button
            type="button"
            data-slot="left-floor"
            className="hail-station hail-station--floor is-primary-focus"
            style={{ left: '2.8708%', top: '53.56%', width: '16.2081%', height: '31.1371%' }}
            aria-label={`3D Fabricator — Chế tạo & sửa chữa (${Math.round(gameState.resources.partsKg)} kg phụ tùng)`}
            onClick={() => open('crafting', 'left-floor')}
          >
            <img
              src={
                panel === 'crafting'
                  ? HAIL_EQUIPMENT.fabricatorWorking
                  : HAIL_EQUIPMENT.fabricatorIdle
              }
              alt="3D Fabricator"
              className="hail-sprite-contain"
              draggable={false}
            />
            <span className="hail-station-tag">3D Fabricator</span>
          </button>

          {/* UR Bay: CAPCOM & Rover Comms */}
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

          {/* LR Bay: Inventory & Sample Rack (CSS 3x3: 6 Equipment + 3 Lunar Samples) */}
          <div className="hail-bay-rack hail-bay-rack--lr" aria-label="Tủ dụng cụ và mẫu vật (LR)">
            <div className="hail-bay-rack-shell">
              <div className="hail-rack-header" aria-hidden="true">
                <span className="hail-rack-header-stripe" />
                <span className="hail-rack-header-rivet" />
              </div>
              <div className="hail-rack-grid hail-rack-grid--3x3">
                <button
                  type="button"
                  className="hail-rack-cell"
                  aria-label="Mở khoan lõi regolith"
                  onClick={() => open('expedition', 'right-floor')}
                >
                  <img
                    src={HAIL_INVENTORY.sampleDrill}
                    alt="Khoan lõi regolith"
                    className="hail-rack-item"
                    draggable={false}
                  />
                  <span className="hail-rack-cell-tag">Khoan lõi</span>
                </button>

                <button
                  type="button"
                  className="hail-rack-cell"
                  aria-label="Phin lọc & vòng đệm"
                  onClick={() => open('crafting', 'right-floor')}
                >
                  <img
                    src={HAIL_INVENTORY.filterSeal}
                    alt="Phin lọc & vòng đệm"
                    className="hail-rack-item"
                    draggable={false}
                  />
                  <span className="hail-rack-cell-tag">Phin lọc</span>
                </button>

                <button
                  type="button"
                  className="hail-rack-cell"
                  aria-label="Phụ tùng sửa chữa"
                  onClick={() => open('crafting', 'right-floor')}
                >
                  <img
                    src={HAIL_INVENTORY.spareParts}
                    alt="Phụ tùng sửa chữa"
                    className="hail-rack-item"
                    draggable={false}
                  />
                  <span className="hail-rack-cell-tag">Phụ tùng</span>
                </button>

                <button
                  type="button"
                  className="hail-rack-cell"
                  aria-label="Băng bịt rò hợp chất"
                  onClick={() => open('crafting', 'right-floor')}
                >
                  <img
                    src={HAIL_INVENTORY.sealantTape}
                    alt="Băng bịt rò hợp chất"
                    className="hail-rack-item"
                    draggable={false}
                  />
                  <span className="hail-rack-cell-tag">Băng bịt rò</span>
                </button>

                <button
                  type="button"
                  className="hail-rack-cell"
                  aria-label="Tấm chắn bụi tĩnh điện"
                  onClick={() => open('expedition', 'right-floor')}
                >
                  <img
                    src={HAIL_INVENTORY.dustShield}
                    alt="Tấm chắn bụi tĩnh điện"
                    className="hail-rack-item"
                    draggable={false}
                  />
                  <span className="hail-rack-cell-tag">Khiên bụi</span>
                </button>

                <button
                  type="button"
                  className="hail-rack-cell"
                  aria-label="Bộ tiếp sóng vô tuyến"
                  onClick={() => open('comms', 'right-floor')}
                >
                  <img
                    src={HAIL_INVENTORY.radioRepeater}
                    alt="Bộ tiếp sóng vô tuyến"
                    className="hail-rack-item"
                    draggable={false}
                  />
                  <span className="hail-rack-cell-tag">Tiếp sóng</span>
                </button>

                <button
                  type="button"
                  className="hail-rack-cell is-sample-slot"
                  aria-label="Mẫu vật địa chất 1"
                  onClick={() => open('expedition', 'right-floor')}
                >
                  <img
                    src={HAIL_INVENTORY.lunarSample}
                    alt="Mẫu vật địa chất 1"
                    className="hail-rack-item"
                    draggable={false}
                  />
                  <span className="hail-rack-cell-tag">Mẫu vật 1</span>
                </button>

                <button
                  type="button"
                  className="hail-rack-cell is-sample-slot"
                  aria-label="Mẫu vật địa chất 2"
                  onClick={() => open('expedition', 'right-floor')}
                >
                  <img
                    src={HAIL_INVENTORY.lunarSample}
                    alt="Mẫu vật địa chất 2"
                    className="hail-rack-item"
                    draggable={false}
                  />
                  <span className="hail-rack-cell-tag">Mẫu vật 2</span>
                </button>

                <button
                  type="button"
                  className="hail-rack-cell is-sample-slot"
                  aria-label="Mẫu vật địa chất 3"
                  onClick={() => open('expedition', 'right-floor')}
                >
                  <img
                    src={HAIL_INVENTORY.lunarSample}
                    alt="Mẫu vật địa chất 3"
                    className="hail-rack-item"
                    draggable={false}
                  />
                  <span className="hail-rack-cell-tag">Mẫu vật 3</span>
                </button>
              </div>
            </div>
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

            {/* Central Decision Console (27.5 / 55.6 / 45 / 37.1%) — large foreground centerpiece flanked by crew */}
            <div className="hail-decision-console" style={{ left: '27.5%', top: '55.6%', width: '45%', height: '37.1%' }}>
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
