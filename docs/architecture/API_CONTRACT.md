# Project Hail — API & Data Contract

> **Scope**: Hợp đồng kỹ thuật chuẩn (Single Source of Truth) giữa **Core Simulation Engine**, **Zustand Store**, **UI/HUD Components**, **Game Content (`src/data/*.json`)**, và **Asset Pipeline (`public/assets/hail/`)**.  
> **Rule**: UI tuyệt đối không chứa công thức mô phỏng hoặc rule cân bằng cứng; toàn bộ trạng thái và logic đi qua `DaySimulationEngine` + `useGameStore` + JSON schemas.

---

## 1. Kiến trúc phân tầng & Luồng dữ liệu

```text
src/data/*.json  ──► SimulationConfig + Initial GameState
                            │
                            ▼
src/engine/DaySimulationEngine.ts  (Pure TS, Zero React/DOM)
                            │
                            ▼
src/store/gameStore.ts (useGameStore - Zustand)
                            │
        ┌───────────────────┴───────────────────┐
        ▼                                       ▼
src/components/HailGameViewport.tsx     src/components/modals/*
src/components/hud/TelemetryTopBar.tsx  src/components/*Panel.tsx
        ▲
        │
src/components/cabin/hailAssets.ts ──► /assets/hail/*
```

---

## 2. Core Domain Types (`src/types/index.ts`)

### 2.1 Primitives & Identifiers

| Type | Values | Ý nghĩa |
| --- | --- | --- |
| `Planet` | `'moon' \| 'mars'` | Hành tinh hiện tại (Artemis Moon Base / Ares Mars Base) |
| `SystemId` | `'scrubber' \| 'recycler' \| 'solar' \| 'airlock'` | 4 hệ thống trạm cốt lõi |
| `Level` | `1 \| 2 \| 3` | Cấp nâng cấp công nghệ của từng hệ thống |
| `GameState['phase']` | `'briefing' \| 'engineering' \| 'comms' \| 'rationing' \| 'ended'` | Pha hiện tại trong chu kỳ 1 Sol |
| `CrewMember['status']` | `'fit' \| 'impaired' \| 'evacuated'` | Trạng thái sinh tồn của phi hành gia |

### 2.2 `GameState`

```ts
export interface GameState {
  readonly plan: {
    readonly oxygenFraction: number; // [0..1]
    readonly waterFraction: number;  // [0..1]
    readonly foodFraction: number;   // [0..1]
    readonly restFraction: number;   // [0..1]
    readonly recycle: boolean;       // Bật/tắt WRS
    readonly moxie: boolean;         // Bật/tắt MOXIE (chỉ có hiệu lực ở 'mars')
  };
  readonly sol: number;              // Bắt đầu từ 1; reset về 1 khi launch-mars
  readonly phase: 'briefing' | 'engineering' | 'comms' | 'rationing' | 'ended';
  readonly planet: 'moon' | 'mars';
  readonly seed: number;             // LCG RNG seed (deterministic)
  readonly radioClockMs: number;     // Đồng hồ mô phỏng sóng vô tuyến (ms)
  readonly crew: readonly CrewMember[];
  readonly resources: OutpostResources;
  readonly systems: Readonly<Record<SystemId, StationSystem>>;
  readonly missions: readonly ResupplyMission[];
  readonly radio: readonly RadioTransmission[];
  readonly seenEvents: readonly string[];
  readonly activeEvent: string | null; // ID của event đang chờ xử lý ở pha briefing
  readonly log: readonly string[];
}
```

### 2.3 Entity Interfaces

- **`CrewMember`**: `{ id, name, health, stress, fatigue, hunger, thirst, status }` (`health`, `stress`, `fatigue`, `hunger`, `thirst` trong khoảng `0..100`).
  - `status = 'evacuated'` khi `health === 0`.
  - `status = 'impaired'` khi `health <= 50 || max(thirst, hunger, fatigue, stress) >= 70`.
  - Ngược lại `status = 'fit'`.
- **`OutpostResources`**: `{ oxygenKg, waterL, wasteWaterL, foodKg, partsKg, batteryKWh }`.
- **`Cargo`**: `Omit<OutpostResources, 'batteryKWh' | 'wasteWaterL'>` (`oxygenKg`, `waterL`, `foodKg`, `partsKg`).
- **`StationSystem`**: `{ level: 1 | 2 | 3, integrity: number }` (`integrity` trong `[0..1]`).
- **`ResupplyMission`**: `{ id, arrivalSol, payload: Cargo, status: 'in-transit' | 'delivered' }`.
- **`RadioTransmission`**: `{ id, message, groundReceivesAtMs, replyAtMs, status: 'outbound' | 'awaiting-reply' | 'reply-received' }`.
- **`MissionEvaluation`**: `{ planet: Planet, canTransition: boolean, checks: readonly MissionRequirementCheck[] }`.

---

## 3. Simulation Engine Contract (`src/engine/DaySimulationEngine.ts`)

### 3.1 Public Functions

1. **`DaySimulationEngine(currentState: GameState, actions: DayActions): GameState`**
   - Hàm thuần (`immutable`), nhận `actions.config` (`SimulationConfig`) và mảng `actions.commands` (`readonly DayAction[]`).
2. **`evaluateMissionProgress(state: GameState, config: SimulationConfig): MissionEvaluation`**
   - Đánh giá điều kiện chuyển tiếp `marsLaunch` (khi `planet === 'moon'`) hoặc `marsVictory` (khi `planet === 'mars'`).
   - Trả về 9 tiêu chí `checks` (`sol`, `crew`, `systems-level`, `systems-integrity`, `oxygen`, `water`, `food`, `parts`, `battery`) và `canTransition`.

### 3.2 State Machine & Phase Guards

```text
  ┌──────────┐  advance (activeEvent === null)   ┌─────────────┐
  │ briefing │ ────────────────────────────────► │ engineering │
  └──────────┘                                   └─────────────┘
       ▲                                                │
       │ end-sol (crew alive > 0)                       │ advance
       │                                                ▼
  ┌───────────┐       advance                    ┌─────────────┐
  │ rationing │ ◄─────────────────────────────── │    comms    │
  └───────────┘                                  └─────────────┘
       │
       │ end-sol (all crew evacuated)
       ▼
  ┌───────────┐
  │   ended   │ (mọi action trừ 'radio-tick' đều no-op)
  └───────────┘
```

### 3.3 `DayAction` Command Table

| Command `type` | Payload bắt buộc | Điều kiện hợp lệ (Guard) | Tác động chính |
| --- | --- | --- | --- |
| `'advance'` | *(không)* | `phase !== 'ended' && activeEvent === null` | Chuyển pha tuần tự: `briefing -> engineering -> comms -> rationing` |
| `'choose'` | `eventId`, `choiceId` | `phase === 'briefing' && activeEvent === eventId && partsKg >= choice.partsKg` | Trừ `partsKg`, roll outcome theo `weight` + `seed`, áp `effects`, xóa `activeEvent`, thêm vào `seenEvents` & `log` |
| `'repair'` | `system` | `phase === 'engineering' && integrity < 1 && partsKg >= config.repairKg` | Trừ `config.repairKg`, đưa `systems[system].integrity = 1` |
| `'upgrade'` | `system` | `phase === 'engineering' && level < 3 && partsKg >= config.upgradeKg[level]` | Trừ `partsKg`, tăng `level` lên `level + 1` |
| `'resupply'` | `id`, `payload: Cargo` | `phase === 'comms'`, `id` chưa trùng, mọi khối lượng `>= 0`, `0 < sum <= config.maxCargoKg` | Tạo `ResupplyMission` với `arrivalSol = sol + config.transitSols[planet]` |
| `'transmit'` | `id`, `message` (non-blank) | `phase === 'comms'`, `id` chưa trùng | Tính `groundReceivesAtMs = radioClockMs + latency`, `replyAtMs = radioClockMs + 2 * latency + groundProcessingMs` |
| `'radio-tick'` | `nowMs` (`SafeInteger > radioClockMs`) | Chạy được ở mọi pha (kể cả `ended`) | Cập nhật `radioClockMs` & status (`outbound` → `awaiting-reply` → `reply-received`) |
| `'plan'` | `oxygenFraction`, `waterFraction`, `foodFraction`, `restFraction` (`0..1`), `recycle`, `moxie` | `phase === 'rationing'` | Lưu kế hoạch vận hành cuối ngày trước khi `end-sol` |
| `'end-sol'` | *(không)* | `phase === 'rationing'` | Chạy cân bằng ECLSS, điện năng (ngày/đêm Mặt Trăng, bão bụi Sao Hỏa), sinh tồn Crew, giao hàng Cargo đến hạn, tăng `sol + 1`, roll event mới |
| `'launch-mars'` | *(không)* | `planet === 'moon' && evaluateMissionProgress(...).canTransition === true` | Trừ `transitConsumption`, đặt `planet = 'mars'`, `sol = 1`, `phase = 'briefing'`, reset `missions`/`radio`, phục hồi nhẹ `fatigue`/`stress` và roll event Sao Hỏa |

> **Lưu ý cho UI**: Nếu gọi action sai pha hoặc thiếu tài nguyên, Engine trả về **nguyên `currentState` (no-op)** mà không throw exception.

---

## 4. Zustand Store Contract (`src/store/gameStore.ts`) — Dành cho Team UI

Import hook: `import { useGameStore } from '../store/gameStore.ts';`

### 4.1 Exposed State

| Field | Type | Mô tả |
| --- | --- | --- |
| `gameState` | `GameState` | Toàn bộ state mô phỏng hiện tại |
| `config` | `SimulationConfig` | Nạp từ `balance.json` + `events.json` |
| `isNightTransition` | `boolean` | `true` sau khi `endSol()` sang ngày mới hoặc `launchToMars()`, mở `NightCutsceneModal` |
| `currentBrief` | `StemBrief \| null` | Bài học NASA STEM hiển thị trong màn chuyển đêm (`{ id, title, content, source }`) |
| `dailyDecision` | `{ sol: number; summary: string } \| null` | Tóm tắt quyết định sự kiện gần nhất cho `EndOfDayModal` |
| `lastStatsDelta` | `{ oxygenDelta, waterDelta, batteryDelta } \| null` | Biến động ròng sau khi kết thúc Sol |

### 4.2 Exposed Actions

| Action | Signature | Hành vi UI kỳ vọng |
| --- | --- | --- |
| `advancePhase` | `() => void` | Đẩy pha sang bước tiếp theo nếu không kẹt `activeEvent` |
| `chooseEventOption` | `(choiceId: string) => void` | Gửi lựa chọn cho `gameState.activeEvent` và cập nhật `dailyDecision` |
| `repairSystem` | `(system: SystemId) => void` | Sửa hệ thống (chỉ hoạt động ở pha `engineering`) |
| `upgradeSystem` | `(system: SystemId) => void` | Nâng cấp hệ thống (chỉ hoạt động ở pha `engineering`) |
| `updatePlan` | `(plan: Partial<GameState['plan']>) => void` | Gộp thay đổi slider/toggle vào `gameState.plan` ở pha `rationing` |
| `transmitRadio` | `(message: string) => void` | Tự sinh `id = tx-sol${sol}-${radio.length + 1}` và phát tin ở pha `comms` |
| `tickRadio` | `(deltaMs: number) => void` | Cộng `Math.max(1, Math.round(deltaMs))` vào `radioClockMs` |
| `requestResupply` | `(payload: Cargo) => void` | Tự sinh `id = CARGO-SOL${sol}-${missions.length + 1}` ở pha `comms` |
| `endSol` | `() => void` | Chạy `end-sol`; nếu `sol` tăng thì tính `lastStatsDelta`, chọn `StemBrief`, bật `isNightTransition = true` |
| `launchToMars` | `() => void` | Chạy `launch-mars`; nếu sang `'mars'` thì bật `isNightTransition = true` với `briefs[4]` |
| `completeNightTransition` | `() => void` | Đóng `NightCutsceneModal` (`isNightTransition = false`) |
| `resetGame` | `() => void` | Reset về `initial-state.json` (Mặt Trăng, Sol 1) |

### 4.3 Cockpit Viewport & Modal Slots (`src/components/HailGameViewport.tsx`)

- **Crew Hotspots (`CREW_SLOTS`, 4 vị trí cố định map theo `crew[0..3]`)**:
  - `[0] cmd`: `{ left: '20%', top: '36%', width: '16%', height: '57%' }`
  - `[1] eng`: `{ left: '36%', top: '42%', width: '12%', height: '38%' }`
  - `[2] doc`: `{ left: '52%', top: '42%', width: '12%', height: '38%' }`
  - `[3] geo`: `{ left: '64%', top: '36%', width: '16%', height: '57%' }`
- **Equipment Hotspots (`MAIN_STATIONS`, 4 trạm chính)**:
  - `scrubber` (`left-wall`): `{ left: '2%', top: '13%', width: '16%', height: '32%' }` → mở `'crafting'`
  - `recycler` (`left-floor`): `{ left: '2%', top: '48%', width: '17%', height: '27%' }` → mở `'crafting'`
  - `airlock` (`right-wall`): `{ left: '82%', top: '13%', width: '16%', height: '32%' }` → mở `'comms'`
  - `solar` (`right-floor`): `{ left: '81%', top: '48%', width: '17%', height: '27%' }` → mở `'crafting'`
- **HUD / Overlay Zones**:
  - `TelemetryTopBar`: dải trên `0%..8%`
  - `Decision Console`: `{ left: '28%', top: '35.6%', width: '44%', height: '58.2%' }` → mở `'starlog'`
  - `Action Band`: dải dưới `93%..100%` (các nút mở nhanh `starlog`, `character`, `crafting`, `expedition`, `comms`, `launch`, `end`, `menu`)

---

## 5. Game Content & Balancing Contract (`src/data/*.json`) — Dành cho Team Thiết kế Nội dung

### 5.1 Event Catalog (`src/data/events.json` + `src/data/events.schema.json`)

Mỗi phần tử trong mảng `events.json` **bắt buộc** khớp JSON Schema (`additionalProperties: false`):

```json
{
  "id": "unique-kebab-case-id",
  "title": "Tiêu đề ngắn hiển thị trên Starlog",
  "prompt": "Tình huống khoa học / sự cố (1-2 câu rõ cho học sinh 7-12 tuổi)",
  "weight": 1,
  "when": [
    { "kind": "min-sol", "value": 2 },
    { "kind": "planet", "value": "moon" }
  ],
  "choices": [
    {
      "id": "choice-id",
      "label": "Nhãn nút quyết định",
      "partsKg": 0,
      "outcomes": [
        {
          "weight": 1,
          "summary": "Kết quả ghi vào Starlog history",
          "effects": [
            { "kind": "damage", "system": "scrubber", "amount": 0.2 }
          ]
        }
      ]
    }
  ]
}
```

- **`Condition` (`when[]`) hợp lệ**:
  - `{ "kind": "planet", "value": "moon" | "mars" }`
  - `{ "kind": "min-sol", "value": integer >= 1 }`
  - `{ "kind": "integrity-below", "system": "scrubber" | "recycler" | "solar" | "airlock", "value": number (0..1) }`
- **`Effect` (`effects[]`) hợp lệ**:
  - `{ "kind": "damage", "system": SystemId, "amount": number (0..1) }`
  - `{ "kind": "oxygen-loss", "amount": number >= 0 }` (kg)
  - `{ "kind": "stress", "amount": number (0..100) }`
- **Lưu ý vận hành**: Mỗi `event.id` chỉ xuất hiện tối đa 1 lần trong một lượt chơi vì Engine lưu vào `seenEvents`. Nếu thêm event mới có hình minh họa riêng, cần cập nhật `getHailEventScene(eventId)` trong `src/components/cabin/hailAssets.ts`.

### 5.2 Balance Parameters (`src/data/balance.json`)

Team cân bằng game chỉnh toàn bộ thông số tại đây mà không sửa code TypeScript:

| Key | Giá trị hiện tại | Đơn vị / Ý nghĩa |
| --- | --- | --- |
| `oxygenKgPerDay`, `waterLPerDay`, `foodKgPerDay` | `0.84`, `2.5`, `0.62` | Tiêu thụ cơ bản mỗi phi hành gia / ngày Trái Đất |
| `recovery` (`1\|2\|3`) | `0.85`, `0.9`, `0.93` | Hiệu suất thu hồi nước WRS |
| `solarOutput` (`1\|2\|3`) | `1`, `1.2`, `1.4` | Hệ số công suất pin Mặt Trời |
| `airlockLeakFactor` (`1\|2\|3`) | `1`, `0.75`, `0.5` | Hệ số giảm rò rỉ khóa khí khi nâng cấp |
| `scrubberFlow` (`1\|2\|3`) | `1`, `1.15`, `1.3` | Hệ số lưu lượng O₂ |
| `repairKg` / `upgradeKg` | `2` / `{ "1": 4, "2": 8 }` | Chi phí phụ tùng sửa chữa / nâng cấp (kg) |
| `lunarHalfCycleDays` | `14` | Số Sol nửa chu kỳ ngày/đêm Mặt Trăng (`Sol 15..28` là ban đêm: `transmission = 0`) |
| `marsDustTransmission` / `marsDustWindows` | `0.15` / `[{ startSol: 8, endSol: 16 }]` | Suy giảm nắng do bão bụi Sao Hỏa |
| `moxieOxygenKgPerDay` / `moxieKWhPerDay` | `0.12` / `2` | Sản lượng và điện năng MOXIE trên Sao Hỏa |
| `maxCargoKg` | `80` | Trần khối lượng mỗi chuyến tiếp tế |
| `transitSols` | `{ "moon": 4, "mars": 22 }` | Số Sol tàu hàng bay tới |
| `radioLatencyMs` / `groundProcessingMs` | `{ "moon": 1300, "mars": 840000 }` / `1000` | Độ trễ 1 chiều & thời gian xử lý Houston |
| `marsLaunch` / `marsVictory` | Xem `balance.json` | Điều kiện qua màn Mặt Trăng → Sao Hỏa và thắng Sao Hỏa |

### 5.3 Initial State & STEM Briefs

- **`src/data/initial-state.json`**: Khởi tạo `sol: 1`, `phase: "briefing"`, `planet: "moon"`, `crew` gồm 4 ID chuẩn (`cmd`, `eng`, `doc`, `geo`) khớp với `HAIL_CREW_VISUALS` trong `hailAssets.ts`.
- **`src/data/nasa-briefs.json`**: Mảng `{ id, title, content, source }`. Lưu ý: `gameStore.ts` dùng `briefs[4]` làm brief đặc biệt khi `launchToMars()` (hiện là `"brief-5": ĐỘ TRỄ SÓNG VÔ TUYẾN`); các Sol bình thường xoay vòng theo `(sol - 1) % briefs.length`.

---

## 6. Asset Registry Contract (`src/components/cabin/hailAssets.ts`)

Mọi asset runtime nằm dưới `public/assets/hail/` và được truy cập qua các map export sẵn:

- `HAIL_ENV`: `spaceDeep`, `lunarDay`, `lunarNight`, `cockpitShell`, `lunarMap`, `lunarCrater`, `regolithField`, `lunarPsr`
- `HAIL_EQUIPMENT`: `oxygenBase`, `oxygenDegraded`, `oxygenBroken`, `waterBase`, `waterBroken`, `powerBase`, `powerBroken`, `comms`, `medical`, `robotStation`, `endDayConsole`, `consoleDesk`, `lockerLeftOpen`, `lockerRightOpen`, `lockerDoorLeftTop`, `lockerDoorLeftBottom`, `lockerDoorRightTop`, `lockerDoorRightBottom`, `crewSeat`, `captainSeat`
- `HAIL_FX`: `degraded`, `broken`
- `HAIL_ROVER`: `base`, `active`, `broken`
- `HAIL_INVENTORY`: `medicalKit`, `spareParts`, `filterSeal`, `sampleDrill`, `mrePack`, `waterPack`, `oxygenCell`, `lunarSample`, `specialBeacon`
- `HAIL_SVG`: 22 vector HUD/icon SVG (`res*`, `sys*`, `state*`, `act*`, `nav*`, `badgeNasaStem`, `frameCorner`)
- `HAIL_CREW_VISUALS` / `getHailCrewVisual(id)`: map `'cmd' | 'eng' | 'doc' | 'geo'` → `{ role, specialty, portrait, seated }`
- `getHailSystemSprite(id, integrity)`: ngưỡng `integrity < 0.45` (`'broken'`), `< 0.85` (`'degraded'`), `>= 0.85` (`'ok'`)
- `getHailEventScene(eventId)`: map `'solar-particles' | 'airlock-leak' | 'regolith-filter' | default` → WebP scene banner
