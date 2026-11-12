import { useGameStore } from '../../store/gameStore.ts';
import { assetUrl } from './assets.ts';

interface RightConsumableShelfProps {
  referenceMode: boolean;
  onClick: () => void;
  onItemClick?: (itemId: string) => void;
}

export function RightConsumableShelf({
  referenceMode,
  onClick,
  onItemClick,
}: RightConsumableShelfProps) {
  const shelf = useGameStore(s => s.parsecsState.shelf);
  const findItem = (id: string) => shelf.find(i => i.id === id);

  const gun = findItem('item_gun');
  const mask = findItem('item_mask');
  const book = findItem('item_handbook');
  const tape = findItem('item_tape');
  const battery = findItem('item_battery');

  return (
    <div className="cabin-right-shelf-cluster" aria-label="Tủ trang bị và thiết bị bên phải">
      {/* 1. Raygun in Hazard Striped Box */}
      {(!referenceMode || gun?.owned) && (
        <button
          type="button"
          aria-label="Súng laser phòng thủ"
          className="cabin-hotspot absolute group focus:outline-none"
          onClick={() => onItemClick?.('item_gun') ?? onClick()}
          style={{
            left: '74.510%',
            top: '19.469%',
            width: '12.500%',
            height: '15.347%',
            zIndex: 25,
          }}
        >
          <img
            src={assetUrl(
              gun?.upgraded && gun?.damaged
                ? 'SpaceshipItemGunUpgradeDamaged.png'
                : gun?.upgraded
                ? 'SpaceshipItemGunUpgrade.png'
                : gun?.damaged
                ? 'SpaceshipItemGunDamaged.png'
                : 'SpaceshipItemGun.png',
            )}
            alt="Súng laser phòng thủ"
            draggable={false}
            className="w-full h-full object-contain pointer-events-none transition-transform group-hover:scale-105"
          />
          <span className="cabin-tooltip">
            Súng laser
            <small>{gun?.damaged ? 'Hỏng mạch' : 'Sẵn sàng chiến đấu'}</small>
          </span>
        </button>
      )}

      {/* 2. Gas Mask Hanging on Wall Hook */}
      {(!referenceMode || mask?.owned) && (
        <button
          type="button"
          aria-label="Mặt nạ phòng độc"
          className="cabin-hotspot absolute group focus:outline-none"
          onClick={() => onItemClick?.('item_mask') ?? onClick()}
          style={{
            left: '67.943%',
            top: '19.649%',
            width: '5.026%',
            height: '10.451%',
            zIndex: 25,
          }}
        >
          <img
            src={assetUrl(
              mask?.upgraded && mask?.damaged
                ? 'SpaceshipItemMaskUpgradeDamaged.png'
                : mask?.upgraded
                ? 'SpaceshipItemMaskUpgrade.png'
                : mask?.damaged
                ? 'SpaceshipItemMaskDamaged.png'
                : 'SpaceshipItemMask.png',
            )}
            alt="Mặt nạ phòng độc"
            draggable={false}
            className="w-full h-full object-contain pointer-events-none transition-transform group-hover:scale-105"
          />
          <span className="cabin-tooltip">
            Mặt nạ dưỡng khí
            <small>{mask?.damaged ? 'Thủng màng lọc' : 'Lọc khí an toàn'}</small>
          </span>
        </button>
      )}

      {/* 3. Handbook Cosmos 101 on Right Shelf */}
      {(!referenceMode || book?.owned) && (
        <button
          type="button"
          aria-label="Sách hướng dẫn Cosmos 101"
          className="cabin-hotspot absolute group focus:outline-none"
          onClick={() => onItemClick?.('item_handbook') ?? onClick()}
          style={{
            left: '75.888%',
            top: '36.681%',
            width: '6.510%',
            height: '9.931%',
            zIndex: 25,
          }}
        >
          <img
            src={assetUrl(
              book?.upgraded && book?.damaged
                ? 'SpaceshipItemBookUpgradeDamaged.png'
                : book?.upgraded
                ? 'SpaceshipItemBookUpgrade.png'
                : book?.damaged
                ? 'SpaceshipItemBookDamaged.png'
                : 'SpaceshipItemBook.png',
            )}
            alt="Sổ tay Cosmos 101"
            draggable={false}
            className="w-full h-full object-contain pointer-events-none transition-transform group-hover:scale-105"
          />
          <span className="cabin-tooltip">
            Sổ tay Cosmos 101
            <small>{book?.damaged ? 'Rách gáy' : 'Cẩm nang sinh tồn'}</small>
          </span>
        </button>
      )}

      {/* 4. Duct Tape on Right Shelf */}
      {(!referenceMode || tape?.owned) && (
        <button
          type="button"
          aria-label="Cuộn băng keo chuyên dụng"
          className="cabin-hotspot absolute group focus:outline-none"
          onClick={() => onItemClick?.('item_tape') ?? onClick()}
          style={{
            left: '81.487%',
            top: '42.986%',
            width: '5.104%',
            height: '7.500%',
            zIndex: 25,
          }}
        >
          <img
            src={assetUrl(
              tape?.upgraded && tape?.damaged
                ? 'SpaceshipItemDuckttapeUpgradeDamaged.png'
                : tape?.upgraded
                ? 'SpaceshipItemDuckttapeUpgrade.png'
                : tape?.damaged
                ? 'SpaceshipItemDuckttapeDamaged.png'
                : 'SpaceshipItemDuckttape.png',
            )}
            alt="Băng keo chuyên dụng"
            draggable={false}
            className="w-full h-full object-contain pointer-events-none transition-transform group-hover:scale-105"
          />
          <span className="cabin-tooltip">
            Băng keo
            <small>{tape?.damaged ? 'Gần hết' : 'Vật tư sửa chữa'}</small>
          </span>
        </button>
      )}

      {/* 5. Battery on Floor (Lower Right) */}
      {(!referenceMode || battery?.owned) && (
        <button
          type="button"
          aria-label="Pin hạt nhân năng lượng"
          className="cabin-hotspot absolute group focus:outline-none"
          onClick={() => onItemClick?.('item_battery') ?? onClick()}
          style={{
            left: '81.990%',
            top: '67.198%',
            width: '8.828%',
            height: '13.333%',
            zIndex: 25,
          }}
        >
          <img
            src={assetUrl(
              battery?.upgraded && battery?.damaged
                ? 'SpaceshipItemBatteryUpgradeDamaged.png'
                : battery?.upgraded
                ? 'SpaceshipItemBatteryUpgrade.png'
                : battery?.damaged
                ? 'SpaceshipItemBatteryDamaged.png'
                : 'SpaceshipItemBattery.png',
            )}
            alt="Pin dự phòng"
            draggable={false}
            className="w-full h-full object-contain pointer-events-none transition-transform group-hover:scale-105"
          />
          <span className="cabin-tooltip">
            Pin dự phòng
            <small>{battery?.damaged ? 'Rò điện' : 'Sẵn sàng cấp nguồn'}</small>
          </span>
        </button>
      )}
    </div>
  );
}
