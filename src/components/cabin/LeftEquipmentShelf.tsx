import { useGameStore } from '../../store/gameStore.ts';
import { assetUrl } from './assets.ts';

const SOUP_CAN_COORDINATES = [
  // Bottom Shelf Tier (wy ≈ 3.3)
  { id: 1, sprite: 'SpaceshipItemSoup01.png', left: 14.333, top: 35.795, width: 2.813, height: 5.313, zIndex: 23 },
  { id: 2, sprite: 'SpaceshipItemSoup02.png', left: 16.932, top: 36.059, width: 2.604, height: 5.000, zIndex: 22 },
  { id: 3, sprite: 'SpaceshipItemSoup03.png', left: 19.375, top: 36.302, width: 2.422, height: 4.618, zIndex: 21 },
  // Middle Shelf Tier (wy ≈ 5.0)
  { id: 4, sprite: 'SpaceshipItemSoup04.png', left: 14.188, top: 29.552, width: 2.917, height: 5.417, zIndex: 23 },
  { id: 5, sprite: 'SpaceshipItemSoup05.png', left: 16.794, top: 30.247, width: 2.760, height: 5.069, zIndex: 22 },
  { id: 6, sprite: 'SpaceshipItemSoup06.png', left: 19.268, top: 30.990, width: 2.526, height: 4.688, zIndex: 21 },
  // Top Shelf Tier (wy ≈ 6.5)
  { id: 7, sprite: 'SpaceshipItemSoup07.png', left: 14.154, top: 23.396, width: 2.917, height: 5.382, zIndex: 23 },
  { id: 8, sprite: 'SpaceshipItemSoup08.png', left: 16.865, top: 24.660, width: 2.734, height: 5.035, zIndex: 22 },
  { id: 9, sprite: 'SpaceshipItemSoup09.png', left: 19.359, top: 25.941, width: 2.474, height: 4.549, zIndex: 21 },
];

interface LeftEquipmentShelfProps {
  referenceMode: boolean;
  onClick: () => void;
  onItemClick?: (itemId: string) => void;
}

export function LeftEquipmentShelf({
  referenceMode,
  onClick,
  onItemClick,
}: LeftEquipmentShelfProps) {
  const parsecsState = useGameStore(s => s.parsecsState);
  const gameState = useGameStore(s => s.gameState);

  const soupCount = referenceMode
    ? Math.floor(parsecsState.soupCans)
    : Math.min(9, Math.max(1, Math.round(gameState.resources.foodKg / 6)));

  const shelf = parsecsState.shelf;
  const findItem = (id: string) => shelf.find(i => i.id === id);

  const shovel = findItem('item_shovel');
  const lighter = findItem('item_lighter');
  const medkit = findItem('item_medkit');
  const sock = findItem('item_sock');

  return (
    <div className="cabin-left-shelf-cluster" aria-label="Kệ súp và trang bị bên trái">
      {/* 1. Nine individual soup cans on the 3 shelf tiers */}
      {SOUP_CAN_COORDINATES.map(can => {
        const isVisible = can.id <= soupCount;
        if (!isVisible) return null;

        return (
          <button
            key={`soup-${can.id}`}
            type="button"
            aria-label={`Hộp súp ${can.id}`}
            className="cabin-hotspot absolute group focus:outline-none"
            onClick={onClick}
            style={{
              left: `${can.left}%`,
              top: `${can.top}%`,
              width: `${can.width}%`,
              height: `${can.height}%`,
              zIndex: can.zIndex,
            }}
          >
            <img
              src={assetUrl(can.sprite)}
              alt="Hộp súp cà chua"
              draggable={false}
              className="w-full h-full object-contain pointer-events-none transition-transform group-hover:scale-110"
            />
            {can.id === soupCount && (
              <span className="cabin-tooltip">
                Kho lương thực
                <small>
                  {referenceMode
                    ? `${soupCount} lon súp`
                    : `${gameState.resources.foodKg.toFixed(1)} kg thực phẩm`}
                </small>
              </span>
            )}
          </button>
        );
      })}

      {/* 2. Shovel Leaning between Shelf and Crafting Station */}
      {(!referenceMode || shovel?.owned) && (
        <button
          type="button"
          aria-label="Xẻng sinh tồn"
          className="cabin-hotspot absolute group focus:outline-none"
          onClick={() => onItemClick?.('item_shovel') ?? onClick()}
          style={{
            left: '23.305%',
            top: '37.816%',
            width: '6.901%',
            height: '24.097%',
            zIndex: 25,
          }}
        >
          <img
            src={assetUrl(
              shovel?.upgraded
                ? 'SpaceshipItemShovelUpgrade.png'
                : shovel?.damaged
                ? 'SpaceshipItemShovelDamaged.png'
                : 'SpaceshipItemShovel.png',
            )}
            alt="Xẻng sinh tồn"
            draggable={false}
            className="w-full h-full object-contain pointer-events-none transition-transform group-hover:scale-105"
          />
          <span className="cabin-tooltip">
            Xẻng sinh tồn
            <small>{shovel?.damaged ? 'Hỏng hóc' : 'Sẵn sàng sử dụng'}</small>
          </span>
        </button>
      )}

      {/* 3. Lighter on bottom shelf edge */}
      {(!referenceMode || lighter?.owned) && (
        <button
          type="button"
          aria-label="Bật lửa"
          className="cabin-hotspot absolute group focus:outline-none"
          onClick={() => onItemClick?.('item_lighter') ?? onClick()}
          style={{
            left: '18.995%',
            top: '41.063%',
            width: '4.609%',
            height: '5.556%',
            zIndex: 25,
          }}
        >
          <img
            src={assetUrl(
              lighter?.upgraded
                ? 'SpaceshipItemLighterUpgrade.png'
                : lighter?.damaged
                ? 'SpaceshipItemLighterDamaged.png'
                : 'SpaceshipItemLighter.png',
            )}
            alt="Bật lửa"
            draggable={false}
            className="w-full h-full object-contain pointer-events-none transition-transform group-hover:scale-105"
          />
          <span className="cabin-tooltip">
            Bật lửa
            <small>{lighter?.damaged ? 'Hết gas' : 'Hoạt động tốt'}</small>
          </span>
        </button>
      )}

      {/* 4. First Aid Medkit on upper-left wall plate */}
      {(!referenceMode || medkit?.owned) && (
        <button
          type="button"
          aria-label="Túi cứu thương"
          className="cabin-hotspot absolute group focus:outline-none"
          onClick={() => onItemClick?.('item_medkit') ?? onClick()}
          style={{
            left: '1.154%',
            top: '26.188%',
            width: '7.057%',
            height: '8.646%',
            zIndex: 25,
          }}
        >
          <img
            src={assetUrl(
              medkit?.upgraded
                ? 'SpaceshipItemMedkitUpgrade.png'
                : 'SpaceshipItemMedkit.png',
            )}
            alt="Túi cứu thương"
            draggable={false}
            className="w-full h-full object-contain pointer-events-none transition-transform group-hover:scale-105"
          />
          <span className="cabin-tooltip">
            Túi cứu thương
            <small>Y tế trạm</small>
          </span>
        </button>
      )}

      {/* 5. Sock on far upper-left wall */}
      {(!referenceMode || sock?.owned) && (
        <button
          type="button"
          aria-label="Chiếc tất may mắn"
          className="cabin-hotspot absolute group focus:outline-none"
          onClick={() => onItemClick?.('item_sock') ?? onClick()}
          style={{
            left: '0.292%',
            top: '16.243%',
            width: '8.984%',
            height: '9.757%',
            zIndex: 25,
          }}
        >
          <img
            src={assetUrl(
              sock?.upgraded
                ? 'SpaceshipItemSockUpgrade.png'
                : 'SpaceshipItemSock.png',
            )}
            alt="Chiếc tất may mắn"
            draggable={false}
            className="w-full h-full object-contain pointer-events-none transition-transform group-hover:scale-105"
          />
          <span className="cabin-tooltip">
            Tất may mắn
            <small>Vật phẩm tinh thần</small>
          </span>
        </button>
      )}
    </div>
  );
}
