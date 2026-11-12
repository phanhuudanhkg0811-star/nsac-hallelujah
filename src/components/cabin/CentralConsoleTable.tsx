import { useGameStore } from '../../store/gameStore.ts';
import { assetUrl } from './assets.ts';

interface CentralConsoleTableProps {
  unread: boolean;
  onClick: () => void;
  onCommsClick?: () => void;
}

export function CentralConsoleTable({
  unread,
  onClick,
  onCommsClick,
}: CentralConsoleTableProps) {
  const shelf = useGameStore(s => s.parsecsState.shelf);
  const artifactItem = shelf.find(i => i.id === 'item_artifact' && i.owned);

  return (
    <div className="cabin-console-cluster" aria-label="Bàn điều khiển trung tâm">
      {/* 1. Main Console Table Base */}
      <img
        src={assetUrl('SpaceshipConsole.png')}
        alt="Bàn điều khiển trung tâm"
        draggable={false}
        className="absolute pointer-events-none select-none"
        style={{
          left: '36.146%',
          top: '54.063%',
          width: '26.979%',
          height: '33.333%',
          zIndex: 40,
        }}
      />

      {/* 2. Golden Hippo Artifact on Table (if owned) */}
      {artifactItem && (
        <img
          src={assetUrl(
            artifactItem.upgraded
              ? 'SpaceshipItemArtifactUpgraded.png'
              : artifactItem.damaged
              ? 'SpaceshipItemArtifactDamaged.png'
              : 'SpaceshipItemArtifact.png',
          )}
          alt="Cổ vật không gian"
          draggable={false}
          className="absolute pointer-events-none select-none transition-transform duration-300 hover:scale-110"
          style={{
            left: '47.851%',
            top: '50.254%',
            width: '4.381%',
            height: '11.813%',
            zIndex: 41,
          }}
        />
      )}

      {/* 3. Yellow Communicator Telephone on Console Left */}
      <button
        type="button"
        aria-label="Bộ đàm bàn điều khiển"
        className="cabin-hotspot absolute group focus:outline-none"
        onClick={onCommsClick ?? onClick}
        style={{
          left: '35.005%',
          top: '60.458%',
          width: '13.464%',
          height: '27.153%',
          zIndex: 42,
        }}
      >
        <img
          src={assetUrl('SpaceshipConsoleCommunicator.png')}
          alt="Bộ đàm bàn điều khiển"
          draggable={false}
          className="w-full h-full object-contain pointer-events-none transition-transform group-hover:scale-105"
        />
        <span className="cabin-tooltip">
          Bộ đàm liên lạc
          <small>Liên lạc mặt đất</small>
        </span>
      </button>

      {/* 4. CRT Event Computer with Screen */}
      <button
        type="button"
        aria-label="Màn hình sự kiện Starlog"
        className="cabin-hotspot absolute group focus:outline-none"
        onClick={onClick}
        style={{
          left: '44.352%',
          top: '61.625%',
          width: '10.547%',
          height: '16.493%',
          zIndex: 42,
        }}
      >
        <img
          src={assetUrl('SpaceshipEvent.png')}
          alt="Màn hình sự kiện Starlog"
          draggable={false}
          className="w-full h-full object-contain pointer-events-none transition-transform group-hover:scale-105"
        />
        <span className="cabin-tooltip">
          Nhật ký sự kiện
          <small>{unread ? 'Có báo cáo mới!' : 'Xem nhật ký'}</small>
        </span>
      </button>

      {/* 5. Glowing Bulb on Top of Event Computer */}
      {unread ? (
        <img
          src={assetUrl('SpaceshipEventLightGreen.png')}
          alt="Tín hiệu sự kiện"
          draggable={false}
          className="absolute pointer-events-none select-none animate-pulse"
          style={{
            left: '45.336%',
            top: '58.677%',
            width: '5.885%',
            height: '7.917%',
            zIndex: 43,
            filter: 'drop-shadow(0 0 10px #70ff70) drop-shadow(0 0 20px #30c030)',
          }}
        />
      ) : (
        <img
          src={assetUrl('SpaceshipEventLightGreen.png')}
          alt=""
          draggable={false}
          className="absolute pointer-events-none select-none opacity-40"
          style={{
            left: '45.336%',
            top: '58.677%',
            width: '5.885%',
            height: '7.917%',
            zIndex: 43,
          }}
        />
      )}
    </div>
  );
}
