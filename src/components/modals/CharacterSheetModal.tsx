import { useGameStore } from '../../store/gameStore.ts';
import { getCrewPhotoSprite, assetUrl } from '../cabin/assets.ts';

export function CharacterSheetModal({
  crewId,
  referenceMode,
  onSelect,
}: {
  crewId: string;
  referenceMode: boolean;
  onSelect: (id: string) => void;
}) {
  const { gameState, parsecsState } = useGameStore();

  const index = referenceMode
    ? parsecsState.crew.findIndex(c => c.id === crewId)
    : gameState.crew.findIndex(c => c.id === crewId);

  const original = parsecsState.crew[Math.max(index, 0)];
  const nasa = gameState.crew[Math.max(index, 0)];
  const members = referenceMode
    ? parsecsState.crew.map(c => ({ id: c.id, name: c.firstName }))
    : gameState.crew;

  if (!original || !nasa) {
    return <p className="p-4 text-center">Chưa có hồ sơ thành viên.</p>;
  }

  // Calculate skill levels (1..4) from attributes
  const getSkillLvl = (val: number): 1 | 2 | 3 | 4 => {
    if (val >= 7.5) return 4;
    if (val >= 5.0) return 3;
    if (val >= 2.5) return 2;
    return 1;
  };

  const agilityLvl = getSkillLvl(original.attributes.agility);
  const intelLvl = getSkillLvl(original.attributes.intelligence);
  const strengthLvl = getSkillLvl(original.attributes.strength);

  const stats: Array<{ label: string; value: number; color: string }> =
    referenceMode
      ? [
          {
            label: 'Sức khỏe',
            value: Math.round(original.needs.need_health.value * 100),
            color: '#52c41a',
          },
          {
            label: 'Dinh dưỡng',
            value: Math.round(original.needs.need_hunger.value * 100),
            color: '#faad14',
          },
          {
            label: 'Tinh thần',
            value: Math.round(original.needs.need_morale.value * 100),
            color: '#1890ff',
          },
          {
            label: 'Tỉnh táo',
            value: Math.round(original.needs.need_sanity.value * 100),
            color: '#722ed1',
          },
        ]
      : [
          { label: 'Sức khỏe', value: nasa.health, color: '#52c41a' },
          { label: 'Đói', value: nasa.hunger, color: '#faad14' },
          { label: 'Khát', value: nasa.thirst, color: '#1890ff' },
          { label: 'Stress', value: nasa.stress, color: '#f5222d' },
          { label: 'Mệt mỏi', value: nasa.fatigue, color: '#722ed1' },
        ];

  const conditions = [
    ...Object.values(original.needs)
      .map(n => n.activeStatus)
      .filter(Boolean),
    ...original.extraStatuses,
  ];

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
              src={getCrewPhotoSprite(original)}
              alt="Ảnh hồ sơ phi hành gia"
              draggable={false}
              className="cadet-photo"
            />
            <div className="paperclip-graphic" aria-hidden="true" />
          </div>

          <div className="cadet-title-col">
            <div className="dossier-kicker">
              <span>HỒ SƠ NHÂN SỰ VŨ TRỤ · CONFIDENTIAL</span>
            </div>
            <h3 className="cadet-full-name">
              {referenceMode
                ? `${original.firstName} ${original.surname}`
                : nasa.name}
            </h3>
            <p className="cadet-role-badge">
              {referenceMode
                ? !original.isAlive
                  ? '☠️ ĐÃ TỬ NẠN TRÊN QUỸ ĐẠO'
                  : original.isAwayOnExpedition
                  ? '🚀 ĐANG THỰC HIỆN THÁM HIỂM EVA'
                  : original.isCaptain
                  ? '⭐ CHỈ HUY TRẠM (CAPTAIN)'
                  : '👨‍🚀 THÀNH VIÊN TỔ BAY'
                : nasa.status === 'fit'
                ? '✅ THỂ LỰC TIÊU CHUẨN'
                : nasa.status === 'impaired'
                ? '⚠️ CẦN GIÁM SÁT Y TẾ'
                : 'ĐÃ SƠ TÁN KHẨN CẤP'}
            </p>
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

        {/* Authentic Skill Medals (Reference Mode) */}
        {referenceMode && (
          <div className="dossier-section">
            <h4 className="dossier-subheading">HUY HIỆU & NĂNG LỰC CHUYÊN MÔN</h4>
            <div className="dossier-skills-grid">
              {/* Agility */}
              <div className="skill-badge-card">
                <img
                  src={assetUrl(`IconAgilityCrewLvl${agilityLvl}.webp`)}
                  alt="Nhanh nhẹn"
                  className="w-12 h-12 object-contain"
                />
                <div className="skill-badge-info">
                  <strong>Nhanh nhẹn (Agility)</strong>
                  <span>
                    Cấp {agilityLvl} · {original.attributes.agility.toFixed(1)} pts
                  </span>
                  <small>Tăng tốc thu thập & né tránh rủi ro</small>
                </div>
              </div>

              {/* Intelligence */}
              <div className="skill-badge-card">
                <img
                  src={assetUrl(`IconInteligenceCrewLvl${intelLvl}.webp`)}
                  alt="Trí tuệ"
                  className="w-12 h-12 object-contain"
                />
                <div className="skill-badge-info">
                  <strong>Trí tuệ (Intelligence)</strong>
                  <span>
                    Cấp {intelLvl} · {original.attributes.intelligence.toFixed(1)} pts
                  </span>
                  <small>Tối ưu hóa nghiên cứu & sửa chữa</small>
                </div>
              </div>

              {/* Strength */}
              <div className="skill-badge-card">
                <img
                  src={assetUrl(`IconStrengthCrewLvl${strengthLvl}.webp`)}
                  alt="Sức mạnh"
                  className="w-12 h-12 object-contain"
                />
                <div className="skill-badge-info">
                  <strong>Sức mạnh (Strength)</strong>
                  <span>
                    Cấp {strengthLvl} · {original.attributes.strength.toFixed(1)} pts
                  </span>
                  <small>Kháng cự thể chất & mang vác</small>
                </div>
              </div>
            </div>
          </div>
        )}

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
