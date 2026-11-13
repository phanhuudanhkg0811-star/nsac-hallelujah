import { useGameStore } from '../../store/gameStore.ts';
import { getHailCrewVisual, HAIL_INVENTORY, HAIL_SVG } from '../cabin/hailAssets.ts';

export function CharacterSheetModal({
  crewId,
  onSelect,
}: {
  crewId: string;
  onSelect: (id: string) => void;
}) {
  const { gameState } = useGameStore();

  const index = gameState.crew.findIndex(c => c.id === crewId);
  const nasa = gameState.crew[Math.max(index, 0)];
  const members = gameState.crew;

  if (!nasa) {
    return <p className="p-4 text-center">Chưa có hồ sơ thành viên.</p>;
  }

  const stats: Array<{ label: string; value: number; color: string }> = [
    { label: 'Sức khỏe', value: Math.round(nasa.health), color: '#91A978' },
    { label: 'Mức đói', value: Math.round(nasa.hunger), color: '#D7B66C' },
    { label: 'Mức khát', value: Math.round(nasa.thirst), color: '#6E91B1' },
    { label: 'Căng thẳng', value: Math.round(nasa.stress), color: '#C57D59' },
    { label: 'Mệt mỏi', value: Math.round(nasa.fatigue), color: '#75A9A5' },
  ];

  const hailCrewVisual = getHailCrewVisual(nasa.id);
  const conditions = [
    nasa.health < 55 ? 'Cần chăm sóc y tế tại trạm' : '',
    nasa.hunger > 65 ? 'Thiếu dinh dưỡng' : '',
    nasa.thirst > 65 ? 'Thiếu nước uống' : '',
    nasa.stress > 65 ? 'Quá tải tâm lý' : '',
  ].filter(Boolean);

  return (
    <div className="character-dossier-sheet">
      {/* Astronaut Folder Tabs */}
      <nav className="dossier-tabs" aria-label="Chọn phi hành gia">
        {members.map((c, i) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={c.id === crewId}
            className={`dossier-tab-btn ${c.id === crewId ? 'active' : ''}`}
            onClick={() => onSelect(c.id)}
          >
            <span className="tab-num">0{i + 1}</span>
            <span className="tab-name">{c.name}</span>
          </button>
        ))}
      </nav>

      {/* Main Cadet Dossier Card */}
      <div className="dossier-card">
        {/* Top Header Card */}
        <div className="dossier-header-row">
          <div className="cadet-photo-wrapper">
            <img
              src={hailCrewVisual.portrait}
              alt={`Chân dung ${nasa.name}`}
              draggable={false}
              className="cadet-photo"
            />
            <span className="hail-concept-tag" title="Artemis Crew">
              ARTEMIS CREW
            </span>
          </div>

          <div className="cadet-title-col">
            <div className="dossier-kicker">
              <span>{hailCrewVisual.role}</span>
            </div>
            <h3 className="cadet-full-name">{nasa.name}</h3>
            <p className="text-xs text-[#929B9D] mb-2">{hailCrewVisual.specialty}</p>
            <p className="cadet-role-badge">
              {nasa.status === 'fit'
                ? 'THỂ LỰC TIÊU CHUẨN · SẴN SÀNG'
                : nasa.status === 'impaired'
                ? 'CẦN GIÁM SÁT Y TẾ'
                : 'ĐÃ SƠ TÁN KHẨN CẤP'}
            </p>
          </div>
          <div className="hail-medkit-chip">
            <img src={HAIL_INVENTORY.medicalKit} alt="Bộ y tế" className="w-12 h-12 object-contain" draggable={false} />
            <div className="flex items-center gap-1 text-[11px] text-[#E7E6DF]">
              <img src={nasa.status === 'fit' ? HAIL_SVG.stateOk : HAIL_SVG.stateWarn} alt="" className="w-3.5 h-3.5" />
              <span>Trạm Y tế sẵn sàng</span>
            </div>
          </div>
        </div>

        {/* Vital Gauges */}
        <div className="dossier-section">
          <h4 className="dossier-subheading">CHỈ SỐ SINH TỒN & TÂM LÝ</h4>
          <div className="dossier-gauges-grid">
            {stats.map(({ label, value, color }) => (
              <div key={label} className="dossier-gauge-card">
                <div className="gauge-header">
                  <span className="gauge-title">{label}</span>
                  <span className="gauge-val" style={{ color }}>
                    {value}%
                  </span>
                </div>
                <div className="gauge-bar-track">
                  <div
                    className="gauge-bar-fill"
                    style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Active Statuses */}
        <div className="dossier-section">
          <h4 className="dossier-subheading">TÌNH TRẠNG HIỆN TẠI</h4>
          <div className="dossier-conditions-box">
            {conditions.length > 0 ? (
              <div className="condition-tags-wrap">
                {conditions.map((cond, i) => (
                  <span key={i} className="condition-tag">
                    ⚠️ {cond}
                  </span>
                ))}
              </div>
            ) : (
              <p className="condition-none">
                Không ghi nhận trạng thái bất lợi hay chấn thương thể xác.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
