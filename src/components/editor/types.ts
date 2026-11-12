export type BoxCategory = 'background' | 'structure' | 'equipment' | 'seats' | 'props' | 'custom';

export type ViewMode = 'wireframe' | 'hybrid' | 'preview';

export interface CabinLayoutBox {
  id: string;
  name: string;
  category: BoxCategory;
  left: number;       // percentage 0 - 100
  top: number;        // percentage 0 - 100
  width: number;      // percentage 0 - 100
  height: number;     // percentage 0 - 100
  zIndex: number;
  locked?: boolean;
  visible?: boolean;
  spriteUrl?: string; // Path relative to public (e.g. /AeroMatte_Sprites_PNG/...)
  color: string;      // Accent color hex or css color
  notes?: string;
}

export interface AvailableSprite {
  path: string;
  name: string;
  category: BoxCategory;
  defaultWidth: number;   // Suggested % on 1600x1200 canvas
  defaultHeight: number;  // Suggested % on 1600x1200 canvas
  defaultZIndex: number;
  color: string;
}

export const AEROMATTE_SPRITES_CATALOGUE: AvailableSprite[] = [
  // Background & Structure
  {
    path: '/AeroMatte_Sprites_PNG/background/bg_cabin_shell.png',
    name: 'Vỏ Buồng Tàu (Cabin Shell)',
    category: 'structure',
    defaultWidth: 100,
    defaultHeight: 100,
    defaultZIndex: 10,
    color: '#64748B',
  },
  {
    path: '/AeroMatte_Sprites_PNG/background/bg_cupola_space.png',
    name: 'Cửa Sổ Cupola (Ngoại Cảnh)',
    category: 'background',
    defaultWidth: 20,
    defaultHeight: 25,
    defaultZIndex: 0,
    color: '#00E5FF',
  },

  // Equipment
  {
    path: '/AeroMatte_Sprites_PNG/equipment/eq_eclss_wrs.png',
    name: 'Hệ Thống Khí ECLSS & Nước WRS',
    category: 'equipment',
    defaultWidth: 14,
    defaultHeight: 30,
    defaultZIndex: 20,
    color: '#10B981',
  },
  {
    path: '/AeroMatte_Sprites_PNG/equipment/eq_fabricator_idle.png',
    name: 'Máy Chế Tạo 3D (Idle - Nghỉ)',
    category: 'equipment',
    defaultWidth: 16,
    defaultHeight: 30,
    defaultZIndex: 20,
    color: '#8B5CF6',
  },
  {
    path: '/AeroMatte_Sprites_PNG/equipment/eq_fabricator_working.png',
    name: 'Máy Chế Tạo 3D (Working - Hoạt Động)',
    category: 'equipment',
    defaultWidth: 16,
    defaultHeight: 30,
    defaultZIndex: 20,
    color: '#F59E0B',
  },
  {
    path: '/AeroMatte_Sprites_PNG/equipment/eq_fabricator_damaged.png',
    name: 'Máy Chế Tạo 3D (Damaged - Hỏng Hóc)',
    category: 'equipment',
    defaultWidth: 16,
    defaultHeight: 30,
    defaultZIndex: 20,
    color: '#EF4444',
  },
  {
    path: '/AeroMatte_Sprites_PNG/equipment/eq_airlock_rack.png',
    name: 'Khoang Airlock & Giá Giáp EVA',
    category: 'equipment',
    defaultWidth: 15,
    defaultHeight: 36,
    defaultZIndex: 20,
    color: '#F97316',
  },
  {
    path: '/AeroMatte_Sprites_PNG/equipment/eq_sol_throttle.png',
    name: 'Cần Gạt Sol An Toàn (Throttle)',
    category: 'equipment',
    defaultWidth: 10,
    defaultHeight: 40,
    defaultZIndex: 30,
    color: '#FF5722',
  },
  {
    path: '/AeroMatte_Sprites_PNG/equipment/eq_telemetry_console.png',
    name: 'Bàn Console Telemetry Trung Tâm',
    category: 'equipment',
    defaultWidth: 32,
    defaultHeight: 36,
    defaultZIndex: 35,
    color: '#06B6D4',
  },
  {
    path: '/AeroMatte_Sprites_PNG/equipment/eq_starlog_screen.png',
    name: 'Màn Hình Starlog Tương Tác',
    category: 'equipment',
    defaultWidth: 12,
    defaultHeight: 18,
    defaultZIndex: 40,
    color: '#EC4899',
  },

  // Seats
  {
    path: '/AeroMatte_Sprites_PNG/equipment/eq_seat_pod_left.png',
    name: 'Ghế Phi Hành Gia (Pod Trái)',
    category: 'seats',
    defaultWidth: 16,
    defaultHeight: 34,
    defaultZIndex: 28,
    color: '#3B82F6',
  },
  {
    path: '/AeroMatte_Sprites_PNG/equipment/eq_seat_pod_right.png',
    name: 'Ghế Phi Hành Gia (Pod Phải)',
    category: 'seats',
    defaultWidth: 16,
    defaultHeight: 34,
    defaultZIndex: 28,
    color: '#3B82F6',
  },

  // Props
  {
    path: '/AeroMatte_Sprites_PNG/props/prop_battery.png',
    name: 'Khối Pin Năng Lượng (Battery)',
    category: 'props',
    defaultWidth: 6,
    defaultHeight: 8,
    defaultZIndex: 42,
    color: '#EAB308',
  },
  {
    path: '/AeroMatte_Sprites_PNG/props/prop_nanomed_kit.png',
    name: 'Hộp Sơ Cứu NanoMed (Medkit)',
    category: 'props',
    defaultWidth: 7,
    defaultHeight: 8,
    defaultZIndex: 42,
    color: '#EF4444',
  },
  {
    path: '/AeroMatte_Sprites_PNG/props/prop_respirator.png',
    name: 'Mặt Nạ Dưỡng Khí EVA (Respirator)',
    category: 'props',
    defaultWidth: 6,
    defaultHeight: 9,
    defaultZIndex: 42,
    color: '#14B8A6',
  },
  {
    path: '/AeroMatte_Sprites_PNG/props/prop_seal_tape.png',
    name: 'Băng Keo Chân Không (Seal Tape)',
    category: 'props',
    defaultWidth: 5,
    defaultHeight: 7,
    defaultZIndex: 42,
    color: '#A855F7',
  },
  {
    path: '/AeroMatte_Sprites_PNG/props/prop_core_drill.png',
    name: 'Mũi Khoan Lõi Địa Chất (Drill)',
    category: 'props',
    defaultWidth: 8,
    defaultHeight: 9,
    defaultZIndex: 42,
    color: '#D97706',
  },
  {
    path: '/AeroMatte_Sprites_PNG/props/prop_grapple_launcher.png',
    name: 'Súng Phóng Móc Cứu Hộ (Grapple)',
    category: 'props',
    defaultWidth: 9,
    defaultHeight: 8,
    defaultZIndex: 42,
    color: '#6366F1',
  },
  {
    path: '/AeroMatte_Sprites_PNG/props/prop_gas_scanner.png',
    name: 'Máy Quét Khí & Môi Trường (Scanner)',
    category: 'props',
    defaultWidth: 5,
    defaultHeight: 9,
    defaultZIndex: 42,
    color: '#0284C7',
  },
  {
    path: '/AeroMatte_Sprites_PNG/props/prop_specimen_core.png',
    name: 'Lõi Mẫu Vật Vũ Trụ (Specimen)',
    category: 'props',
    defaultWidth: 4,
    defaultHeight: 9,
    defaultZIndex: 42,
    color: '#F43F5E',
  },
];
