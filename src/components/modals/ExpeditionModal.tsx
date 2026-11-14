import { useState } from 'react';
import { useGameStore } from '../../store/gameStore.ts';
import {
  HAIL_ENV,
  HAIL_INVENTORY,
  HAIL_ROVER,
  HAIL_SVG,
} from '../cabin/hailAssets.ts';

const LUNAR_SITES = [
  {
    id: 'crater',
    name: 'Hố Thiên Thạch Nam Cực (Lunar Crater)',
    image: HAIL_ENV.lunarCrater,
    distance: '1.8 km Đông Nam',
    risk: 'Thấp · Độ dốc 14°',
    science:
      'Vành hố đá bazan cổ đại lưu giữ lớp địa chất Mặt Trăng giúp nghiên cứu lịch sử va chạm Hệ Mặt Trời.',
  },
  {
    id: 'regolith',
    name: 'Cánh Đồng Bụi Regolith (Regolith Field)',
    image: HAIL_ENV.regolithField,
    distance: '0.9 km Phía Tây',
    risk: 'Trung bình · Bụi tĩnh điện',
    science:
      'Đất mịn regolith giàu oxy liên kết oxit (~40% khối lượng) và khoáng sản ilmenite để trích xuất nguyên liệu tại chỗ (ISRU).',
  },
  {
    id: 'psr',
    name: 'Vùng Bóng Tối Vĩnh Cửu (PSR)',
    image: HAIL_ENV.lunarPsr,
    distance: '3.4 km Cực Nam',
    risk: 'Cao · -230°C & Mất ánh sáng Mặt Trời',
    science:
      'Đáy hố không bao giờ đón ánh nắng chứa băng nước (H₂O ice) quý giá để sản xuất nước uống và nhiên liệu hydro.',
  },
] as const;

export function ExpeditionModal() {
  const { gameState } = useGameStore();
  const [selectedSiteId, setSelectedSiteId] = useState<(typeof LUNAR_SITES)[number]['id']>('crater');

  const activeSite = LUNAR_SITES.find(s => s.id === selectedSiteId) ?? LUNAR_SITES[0];
  const airlockIntegrity = gameState.systems.airlock.integrity;
  const roverImg =
    airlockIntegrity < 0.45
      ? HAIL_ROVER.broken
      : gameState.phase === 'engineering' || gameState.phase === 'comms'
        ? HAIL_ROVER.active
        : HAIL_ROVER.base;
  const roverLabel =
    airlockIntegrity < 0.45
      ? 'CẦN BẢO TRÌ KHÓA KHÍ / ROVER'
      : gameState.phase === 'engineering'
        ? 'ĐANG HOẠT ĐỘNG KHẢO SÁT'
        : 'CHẾ ĐỘ CHỜ SẴN SÀNG';

  return (
    <div className="hail-expedition-panel">
      <div className="hail-lunar-map-banner">
        <img
          src={HAIL_ENV.lunarMap}
          alt="Bản đồ khảo sát Cực Nam Mặt Trăng"
          className="hail-lunar-map-img"
          draggable={false}
        />
        <div className="hail-lunar-map-overlay">
          <div>
            <span className="hail-tag-pill">ARTEMIS SOUTH POLE · SECTOR 04</span>
            <h3>Bản đồ Thám hiểm & Điều khiển Survey Rover</h3>
          </div>
          <div className="hail-rover-status-card">
            <img src={roverImg} alt="Survey Rover" className="w-20 h-16 object-contain" draggable={false} />
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E7E6DF]">
                <img
                  src={airlockIntegrity < 0.45 ? HAIL_SVG.stateCritical : HAIL_SVG.stateOk}
                  alt=""
                  className="w-4 h-4"
                />
                <span>{roverLabel}</span>
              </div>
              <p className="text-[11px] text-[#C7CBC8] mt-1">
                Độ bền cửa xuất kích: {Math.round(airlockIntegrity * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="hail-site-tabs" role="tablist" aria-label="Điểm khảo sát Mặt Trăng">
        {LUNAR_SITES.map(site => (
          <button
            key={site.id}
            type="button"
            role="tab"
            aria-selected={site.id === activeSite.id}
            className={`hail-site-tab ${site.id === activeSite.id ? 'is-active' : ''}`}
            onClick={() => setSelectedSiteId(site.id)}
          >
            <img src={HAIL_SVG.actExplore} alt="" className="w-4 h-4" />
            <span>{site.name.split('(')[0].trim()}</span>
          </button>
        ))}
      </div>

      <div className="hail-site-detail-card">
        <img
          src={activeSite.image}
          alt={activeSite.name}
          className="hail-site-preview-img"
          draggable={false}
        />
        <div className="hail-site-meta">
          <h4>{activeSite.name}</h4>
          <div className="hail-site-badges">
            <span>Khoảng cách: {activeSite.distance}</span>
            <span>Môi trường: {activeSite.risk}</span>
          </div>
          <p>{activeSite.science}</p>
          <div className="hail-site-tool-row">
            <img src={HAIL_INVENTORY.sampleDrill} alt="Máy khoan mẫu" className="w-12 h-9 object-contain" draggable={false} />
            <span>
              Thiết bị mang theo: <strong>Mũi khoan lấy mẫu địa chất</strong> &amp; cảm biến quang phổ (thông số đồng bộ theo pha Kỹ thuật).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
