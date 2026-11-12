import { useState } from 'react';
import { assetUrl } from './assets.ts';

interface EndDayLeverControlProps {
  sol: number;
  onClick: () => void;
}

export function EndDayLeverControl({ sol, onClick }: EndDayLeverControlProps) {
  const [isPulling, setIsPulling] = useState(false);

  const solStr = String(sol).padStart(3, '0');
  const d0 = solStr[0] ?? '0';
  const d1 = solStr[1] ?? '0';
  const d2 = solStr[2] ?? '0';

  const handleLeverClick = () => {
    setIsPulling(true);
    setTimeout(() => {
      setIsPulling(false);
      onClick();
    }, 280);
  };

  return (
    <div className="cabin-endday-cluster" aria-label="Đồng hồ đếm ngày và Cần gạt kết thúc Sol">
      {/* 1. Mechanical Sol Flip-Clock Box */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          left: '89.479%',
          top: '10.799%',
          width: '10.547%',
          height: '23.125%',
          zIndex: 30,
        }}
      >
        <img
          src={assetUrl('SpaceshipClock.png')}
          alt="Đồng hồ đo Sol"
          draggable={false}
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>

      {/* Clock Top Lamp */}
      <img
        src={assetUrl('SpaceshipClockLightGreen.png')}
        alt=""
        draggable={false}
        className="absolute pointer-events-none select-none opacity-80"
        style={{
          left: '88.938%',
          top: '14.747%',
          width: '7.422%',
          height: '10.382%',
          zIndex: 31,
        }}
      />

      {/* 3 Mechanical Roll Dials */}
      <img
        src={assetUrl(`SpaceshipClockNumber${d0}.png`)}
        alt={`Chữ số ${d0}`}
        draggable={false}
        className="absolute pointer-events-none select-none"
        style={{
          left: '92.018%',
          top: '25.191%',
          width: '0.964%',
          height: '4.410%',
          zIndex: 32,
        }}
      />
      <img
        src={assetUrl(`SpaceshipClockNumber${d1}.png`)}
        alt={`Chữ số ${d1}`}
        draggable={false}
        className="absolute pointer-events-none select-none"
        style={{
          left: '93.685%',
          top: '25.087%',
          width: '0.964%',
          height: '4.410%',
          zIndex: 32,
        }}
      />
      <img
        src={assetUrl(`SpaceshipClockNumber${d2}.png`)}
        alt={`Chữ số ${d2}`}
        draggable={false}
        className="absolute pointer-events-none select-none"
        style={{
          left: '95.352%',
          top: '25.052%',
          width: '0.964%',
          height: '4.410%',
          zIndex: 32,
        }}
      />

      {/* 2. End Day Fusebox Plate */}
      <img
        src={assetUrl('SpaceshipEndday.png')}
        alt="Bảng cầu chì kết thúc ngày"
        draggable={false}
        className="absolute pointer-events-none select-none"
        style={{
          left: '90.242%',
          top: '31.375%',
          width: '9.766%',
          height: '20.104%',
          zIndex: 30,
        }}
      />

      {/* Papers pinned to Fusebox */}
      <img
        src={assetUrl('SpaceshipEnddayRationing.png')}
        alt="Báo cáo phân phối"
        draggable={false}
        className="absolute pointer-events-none select-none"
        style={{
          left: '92.534%',
          top: '39.778%',
          width: '3.073%',
          height: '4.688%',
          zIndex: 31,
        }}
      />
      <img
        src={assetUrl('SpaceshipEnddayExpedition.png')}
        alt="Báo cáo thám hiểm"
        draggable={false}
        className="absolute pointer-events-none select-none"
        style={{
          left: '90.737%',
          top: '39.674%',
          width: '2.057%',
          height: '5.000%',
          zIndex: 31,
        }}
      />
      <img
        src={assetUrl('SpaceshipEnddayCrafting.png')}
        alt="Báo cáo chế tạo"
        draggable={false}
        className="absolute pointer-events-none select-none"
        style={{
          left: '90.659%',
          top: '44.604%',
          width: '2.057%',
          height: '3.194%',
          zIndex: 31,
        }}
      />

      {/* 3. Pull Lever */}
      <button
        type="button"
        aria-label="Kéo cần gạt để kết thúc ngày"
        className="cabin-hotspot absolute group focus:outline-none cursor-pointer"
        onClick={handleLeverClick}
        style={{
          left: '95.766%',
          top: isPulling ? '43.5%' : '40.538%',
          width: '2.865%',
          height: '7.986%',
          zIndex: 33,
          transition: 'top 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <img
          src={assetUrl('SpaceshipEnddayAnim_0001.png')}
          alt="Cần gạt kết thúc Sol"
          draggable={false}
          className="w-full h-full object-contain pointer-events-none group-hover:brightness-110"
        />
        <span className="cabin-tooltip">
          Kết thúc Sol {sol}
          <small>Gạt cần để ngủ</small>
        </span>
      </button>
    </div>
  );
}
