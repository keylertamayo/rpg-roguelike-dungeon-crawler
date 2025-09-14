export interface Position {
  x: number;
  y: number;
}

export interface Stats {
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  experience: number;
  level: number;
}

export interface Player {
  position: Position;
  stats: Stats;
  inventory: Item[];
  equipment: Equipment;
}

export interface Enemy {
  id: string;
  position: Position;
  stats: Stats;
  type: EnemyType;
  behavior: AIBehavior;
}

export enum EnemyType {
  GOBLIN = 'goblin',
  ORC = 'orc',
  SKELETON = 'skeleton',
  TROLL = 'troll'
}

export enum AIBehavior {
  AGGRESSIVE = 'aggressive',
  DEFENSIVE = 'defensive',
  WANDERING = 'wandering'
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  stats?: Partial<Stats>;
  value: number;
  description: string;
  position?: Position;
}

export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  CONSUMABLE = 'consumable',
  TREASURE = 'treasure'
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export interface Equipment {
  weapon?: Item;
  armor?: Item;
  accessory?: Item;
}

export interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
  connected: boolean;
  enemies: Enemy[];
  items: Item[];
  position: Position;
}

export interface Dungeon {
  width: number;
  height: number;
  tiles: TileType[][];
  rooms: Room[];
  startRoom: Position;
  endRoom: Position;
}

export enum TileType {
  WALL = 0,
  FLOOR = 1,
  DOOR = 2,
  STAIRS_UP = 3,
  STAIRS_DOWN = 4
}

export interface CombatState {
  isActive: boolean;
  currentTurn: 'player' | 'enemy';
  targetEnemy?: Enemy;
  combatLog: string[];
}

export enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  COMBAT = 'combat',
  INVENTORY = 'inventory',
  GAME_OVER = 'game_over',
  VICTORY = 'victory'
}
