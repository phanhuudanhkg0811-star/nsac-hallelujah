import { assetUrl } from './assets.ts';

interface StarlogPrinterStationProps {
  hasUnread?: boolean;
  onClick: () => void;
}

export function StarlogPrinterStation({
  hasUnread,
  onClick,
}: StarlogPrinterStationProps) {
  return (
    <div className="cabin-starlog-station" aria-label="Máy in nhật ký Starlog">
      {/* 1. Main Printer Base Machine */}
      <button
        type="button"
        aria-label="Máy in nhật ký Starlog"
        className="cabin-hotspot absolute group focus:outline-none cursor-pointer"
        onClick={onClick}
        style={{
          left: '0.026%',
          top: '35.504%',
          width: '10.130%',
          height: '34.479%',
          zIndex: 28,
        }}
      >
        <img
          src={assetUrl('SpaceshipStarlog.png')}
          alt="Máy in nhật ký Starlog"
          draggable={false}
          className="w-full h-full object-contain pointer-events-none transition-transform group-hover:scale-105"
        />
        <span className="cabin-tooltip">
          Nhật ký trạm
          <small>Máy in Starlog</small>
        </span>
      </button>

      {/* 2. Hanging Paper Spool Strip */}
      <img
        src={assetUrl('SpaceshipStarlogPaper1.png')}
        alt="Dải giấy nhật ký"
        draggable={false}
        className="absolute pointer-events-none select-none transition-transform duration-300 hover:rotate-1"
        style={{
          left: '4.836%',
          top: '42.542%',
          width: '5.547%',
          height: '13.438%',
          zIndex: 29,
        }}
      />

      {/* 3. Glowing Green Lamp on Top of Printer */}
      <img
        src={assetUrl('SpaceshipStarlogLightGreen.png')}
        alt=""
        draggable={false}
        className={`absolute pointer-events-none select-none ${
          hasUnread ? 'animate-pulse' : 'opacity-70'
        }`}
        style={{
          left: '2.990%',
          top: '28.590%',
          width: '11.797%',
          height: '18.681%',
          zIndex: 30,
          filter: hasUnread
            ? 'drop-shadow(0 0 8px #70ff70)'
            : undefined,
        }}
      />
    </div>
  );
}
