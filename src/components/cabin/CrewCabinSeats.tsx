import { useGameStore } from '../../store/gameStore.ts';
import {
  assetUrl,
  PARSECS_SITTING_TABLE,
  SITTING_CHAR_KEYS,
  getSittingCrewSprite,
} from './assets.ts';

interface ChairConfig {
  sprite: string;
  left: number;
  top: number;
  width: number;
  height: number;
  flipX: boolean;
  zIndex: number;
}

const CHAIRS: ChairConfig[] = [
  // slot0: Captain (Front Left)
  {
    sprite: 'SpaceshipChairCaptain.png',
    left: 12.956,
    top: 44.983,
    width: 22.787,
    height: 39.132,
    flipX: false,
    zIndex: 60,
  },
  // slot1: Crew Front Right
  {
    sprite: 'SpaceshipChair.png',
    left: 63.763,
    top: 49.514,
    width: 22.839,
    height: 34.583,
    flipX: false,
    zIndex: 60,
  },
  // slot2: Crew Back Left
  {
    sprite: 'SpaceshipChair.png',
    left: 29.42,
    top: 45.773,
    width: 14.388,
    height: 21.788,
    flipX: true,
    zIndex: 35,
  },
  // slot3: Crew Back Right
  {
    sprite: 'SpaceshipChair.png',
    left: 55.462,
    top: 45.669,
    width: 14.388,
    height: 21.788,
    flipX: false,
    zIndex: 35,
  },
];

export function CrewCabinSeats({
  referenceMode,
  onInspect,
}: {
  referenceMode: boolean;
  onInspect: (id: string) => void;
}) {
  const parsecsCrew = useGameStore(s => s.parsecsState.crew);
  const nasaCrew = useGameStore(s => s.gameState.crew);

  // In Reference Mode: captain at slot0, remaining crew at slots 1..3
  // In NASA Mode: commander at slot0, remaining crew at slots 1..3
  const captain = parsecsCrew.find(c => c.isCaptain) || parsecsCrew[0];
  const others = parsecsCrew.filter(c => c.id !== captain?.id);

  const seatAssignments = [
    {
      slotIndex: 0,
      member: referenceMode ? captain : (nasaCrew[0] as any),
      isCaptain: true,
    },
    {
      slotIndex: 1,
      member: referenceMode ? others[0] : (nasaCrew[1] as any),
      isCaptain: false,
    },
    {
      slotIndex: 2,
      member: referenceMode ? others[1] : (nasaCrew[2] as any),
      isCaptain: false,
    },
    {
      slotIndex: 3,
      member: referenceMode ? others[2] : (nasaCrew[3] as any),
      isCaptain: false,
    },
  ];

  return (
    <div className="cabin-crew-layer" aria-label="Ghế ngồi phi hành đoàn">
      {seatAssignments.map(({ slotIndex, member }) => {
        const chair = CHAIRS[slotIndex];
        if (!member) return null;

        const isParsecs = referenceMode;
        const id = member.id;
        const name = isParsecs ? member.firstName : member.name;
        const isAlive = isParsecs ? member.isAlive : member.status !== 'dead';
        const isAway = isParsecs
          ? member.isAwayOnExpedition
          : member.status === 'evacuated';

        const charKey = SITTING_CHAR_KEYS[id] || 'April';
        const slotKey = `slot${slotIndex}` as 'slot0' | 'slot1' | 'slot2' | 'slot3';
        const stateKey = isAlive ? 'normal' : 'dead';
        const coords =
          PARSECS_SITTING_TABLE[charKey]?.[slotKey]?.[stateKey] ?? {
            left: chair.left,
            top: chair.top,
            width: chair.width,
            height: chair.height,
            flipX: false,
            zIndex: chair.zIndex + 1,
          };

        return (
          <div key={`seat-${slotIndex}`} className="contents">
            {/* Authentic Chair Element */}
            <img
              src={assetUrl(chair.sprite)}
              alt=""
              draggable={false}
              className="absolute pointer-events-none select-none transition-transform duration-200"
              style={{
                left: `${chair.left}%`,
                top: `${chair.top}%`,
                width: `${chair.width}%`,
                height: `${chair.height}%`,
                transform: chair.flipX ? 'scaleX(-1)' : undefined,
                zIndex: chair.zIndex,
              }}
            />

            {/* Astronaut Figure when seated */}
            {!isAway ? (
              <button
                type="button"
                aria-label={`Hồ sơ ${name}`}
                className="cabin-hotspot cabin-crew-person absolute group focus:outline-none"
                onClick={() => onInspect(id)}
                style={{
                  left: `${coords.left}%`,
                  top: `${coords.top}%`,
                  width: `${coords.width}%`,
                  height: `${coords.height}%`,
                  zIndex: coords.zIndex,
                }}
              >
                <img
                  src={getSittingCrewSprite(id, isAlive)}
                  alt={name}
                  draggable={false}
                  className="w-full h-full object-contain pointer-events-none transition-transform group-hover:scale-105"
                  style={{
                    transform: coords.flipX ? 'scaleX(-1)' : undefined,
                  }}
                />
                <span className="cabin-tooltip">
                  {name}
                  <small>Xem hồ sơ</small>
                </span>
              </button>
            ) : (
              <div
                className="absolute z-40 bg-black/75 text-amber-300 text-[10px] px-1.5 py-0.5 rounded border border-amber-500/50 pointer-events-none"
                style={{
                  left: `${chair.left + chair.width * 0.2}%`,
                  top: `${chair.top + chair.height * 0.4}%`,
                }}
              >
                {referenceMode ? 'Đang thám hiểm' : 'Đã sơ tán'}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
