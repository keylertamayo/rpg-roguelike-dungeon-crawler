import { Dungeon, Room, TileType, Position, Enemy, Item, EnemyType, AIBehavior, ItemType, ItemRarity } from './gameTypes';

export class DungeonGenerator {
  private width: number;
  private height: number;
  private maxRooms: number;
  private minRoomSize: number;
  private maxRoomSize: number;

  constructor(width = 80, height = 60, maxRooms = 15, minRoomSize = 6, maxRoomSize = 12) {
    this.width = width;
    this.height = height;
    this.maxRooms = maxRooms;
    this.minRoomSize = minRoomSize;
    this.maxRoomSize = maxRoomSize;
  }

  generate(): Dungeon {
    // Initialize dungeon with walls
    const tiles: TileType[][] = Array(this.height).fill(null).map(() => 
      Array(this.width).fill(TileType.WALL)
    );

    const rooms: Room[] = [];

    // Generate rooms
    for (let i = 0; i < this.maxRooms; i++) {
      const room = this.generateRoom();
      
      // Check if room overlaps with existing rooms
      if (!this.roomOverlaps(room, rooms)) {
        this.carveRoom(tiles, room);
        
        // Connect to previous room if not the first room
        if (rooms.length > 0) {
          this.connectRooms(tiles, rooms[rooms.length - 1], room);
        }
        
        rooms.push(room);
      }
    }

    // Add enemies and items to rooms (except first room)
    for (let i = 1; i < rooms.length; i++) {
      this.populateRoom(rooms[i]);
    }

    const startRoom = rooms[0]?.position || { x: 1, y: 1 };
    const endRoom = rooms[rooms.length - 1]?.position || { x: this.width - 2, y: this.height - 2 };

    // Place stairs
    if (rooms.length > 0) {
      const startTileX = Math.floor(startRoom.x + rooms[0].width / 2);
      const startTileY = Math.floor(startRoom.y + rooms[0].height / 2);
      tiles[startTileY][startTileX] = TileType.STAIRS_UP;

      const endTileX = Math.floor(endRoom.x + rooms[rooms.length - 1].width / 2);
      const endTileY = Math.floor(endRoom.y + rooms[rooms.length - 1].height / 2);
      tiles[endTileY][endTileX] = TileType.STAIRS_DOWN;
    }

    return {
      width: this.width,
      height: this.height,
      tiles,
      rooms,
      startRoom,
      endRoom
    };
  }

  private generateRoom(): Room {
    const width = Math.floor(Math.random() * (this.maxRoomSize - this.minRoomSize)) + this.minRoomSize;
    const height = Math.floor(Math.random() * (this.maxRoomSize - this.minRoomSize)) + this.minRoomSize;
    const x = Math.floor(Math.random() * (this.width - width - 2)) + 1;
    const y = Math.floor(Math.random() * (this.height - height - 2)) + 1;

    return {
      x,
      y,
      width,
      height,
      connected: false,
      enemies: [],
      items: [],
      position: { x, y }
    };
  }

  private roomOverlaps(newRoom: Room, existingRooms: Room[]): boolean {
    return existingRooms.some(room => 
      newRoom.x < room.x + room.width + 2 &&
      newRoom.x + newRoom.width + 2 > room.x &&
      newRoom.y < room.y + room.height + 2 &&
      newRoom.y + newRoom.height + 2 > room.y
    );
  }

  private carveRoom(tiles: TileType[][], room: Room): void {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
          tiles[y][x] = TileType.FLOOR;
        }
      }
    }
  }

  private connectRooms(tiles: TileType[][], room1: Room, room2: Room): void {
    const center1 = {
      x: Math.floor(room1.x + room1.width / 2),
      y: Math.floor(room1.y + room1.height / 2)
    };
    const center2 = {
      x: Math.floor(room2.x + room2.width / 2),
      y: Math.floor(room2.y + room2.height / 2)
    };

    // Create L-shaped corridor
    if (Math.random() < 0.5) {
      // Horizontal then vertical
      this.carveHorizontalTunnel(tiles, center1.x, center2.x, center1.y);
      this.carveVerticalTunnel(tiles, center1.y, center2.y, center2.x);
    } else {
      // Vertical then horizontal
      this.carveVerticalTunnel(tiles, center1.y, center2.y, center1.x);
      this.carveHorizontalTunnel(tiles, center1.x, center2.x, center2.y);
    }
  }

  private carveHorizontalTunnel(tiles: TileType[][], x1: number, x2: number, y: number): void {
    const start = Math.min(x1, x2);
    const end = Math.max(x1, x2);
    
    for (let x = start; x <= end; x++) {
      if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
        tiles[y][x] = TileType.FLOOR;
      }
    }
  }

  private carveVerticalTunnel(tiles: TileType[][], y1: number, y2: number, x: number): void {
    const start = Math.min(y1, y2);
    const end = Math.max(y1, y2);
    
    for (let y = start; y <= end; y++) {
      if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
        tiles[y][x] = TileType.FLOOR;
      }
    }
  }

  private populateRoom(room: Room): void {
    // Add enemies (1-3 per room)
    const enemyCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < enemyCount; i++) {
      const enemy: Enemy = {
        id: `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}`,
        position: {
          x: room.x + Math.floor(Math.random() * room.width),
          y: room.y + Math.floor(Math.random() * room.height)
        },
        stats: this.generateEnemyStats(),
        type: this.getRandomEnemyType(),
        behavior: this.getRandomBehavior()
      };
      room.enemies.push(enemy);
    }

    // Add items (0-2 per room)
    const itemCount = Math.floor(Math.random() * 3);
    for (let i = 0; i < itemCount; i++) {
      const item = this.generateRandomItem(room);
      room.items.push(item);
    }
  }

  private generateEnemyStats() {
    const level = Math.floor(Math.random() * 5) + 1;
    return {
      health: 20 + (level * 10),
      maxHealth: 20 + (level * 10),
      attack: 5 + (level * 3),
      defense: 2 + level,
      experience: level * 10,
      level
    };
  }

  private getRandomEnemyType(): EnemyType {
    const types = Object.values(EnemyType);
    return types[Math.floor(Math.random() * types.length)];
  }

  private getRandomBehavior(): AIBehavior {
    const behaviors = Object.values(AIBehavior);
    return behaviors[Math.floor(Math.random() * behaviors.length)];
  }

  private generateRandomItem(room: Room): Item {
    const types = Object.values(ItemType);
    const rarities = Object.values(ItemRarity);
    const type = types[Math.floor(Math.random() * types.length)];
    const rarity = rarities[Math.floor(Math.random() * rarities.length)];

    const rarityMultiplier = {
      [ItemRarity.COMMON]: 1,
      [ItemRarity.UNCOMMON]: 1.5,
      [ItemRarity.RARE]: 2,
      [ItemRarity.EPIC]: 3,
      [ItemRarity.LEGENDARY]: 5
    };

    const baseStats = this.getBaseItemStats(type);
    const multiplier = rarityMultiplier[rarity];

    return {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: this.generateItemName(type, rarity),
      type,
      rarity,
      stats: {
        attack: Math.floor((baseStats.attack || 0) * multiplier),
        defense: Math.floor((baseStats.defense || 0) * multiplier),
        health: Math.floor((baseStats.health || 0) * multiplier)
      },
      value: Math.floor(50 * multiplier),
      description: `A ${rarity} ${type}`,
      position: {
        x: room.x + Math.floor(Math.random() * room.width),
        y: room.y + Math.floor(Math.random() * room.height)
      }
    };
  }

  private getBaseItemStats(type: ItemType) {
    switch (type) {
      case ItemType.WEAPON:
        return { attack: 5 };
      case ItemType.ARMOR:
        return { defense: 3 };
      case ItemType.CONSUMABLE:
        return { health: 20 };
      default:
        return {};
    }
  }

  private generateItemName(type: ItemType, rarity: ItemRarity): string {
    const prefixes = {
      [ItemRarity.COMMON]: '',
      [ItemRarity.UNCOMMON]: 'Fine ',
      [ItemRarity.RARE]: 'Masterwork ',
      [ItemRarity.EPIC]: 'Enchanted ',
      [ItemRarity.LEGENDARY]: 'Legendary '
    };

    const names = {
      [ItemType.WEAPON]: ['Sword', 'Axe', 'Dagger', 'Mace', 'Bow'],
      [ItemType.ARMOR]: ['Armor', 'Shield', 'Helmet', 'Boots', 'Gloves'],
      [ItemType.CONSUMABLE]: ['Potion', 'Elixir', 'Scroll', 'Food'],
      [ItemType.TREASURE]: ['Gem', 'Coin', 'Artifact', 'Relic']
    };

    const typeNames = names[type];
    const name = typeNames[Math.floor(Math.random() * typeNames.length)];
    
    return `${prefixes[rarity]}${name}`;
  }
}
