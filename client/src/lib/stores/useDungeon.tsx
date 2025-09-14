import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Dungeon, Enemy, Item, Position } from '../gameTypes';
import { DungeonGenerator } from '../dungeonGenerator';

interface DungeonState {
  dungeon: Dungeon | null;
  currentFloor: number;
  enemies: Enemy[];
  items: Item[];
  
  // Actions
  generateDungeon: () => void;
  removeEnemy: (enemyId: string) => void;
  removeItem: (itemId: string) => void;
  moveEnemy: (enemyId: string, newPosition: Position) => void;
  getEnemyAtPosition: (position: Position) => Enemy | undefined;
  getItemsAtPosition: (position: Position) => Item[];
  nextFloor: () => void;
  resetDungeon: () => void;
}

export const useDungeon = create<DungeonState>()(
  subscribeWithSelector((set, get) => ({
    dungeon: null,
    currentFloor: 1,
    enemies: [],
    items: [],

    generateDungeon: () => {
      const generator = new DungeonGenerator();
      const newDungeon = generator.generate();
      
      // Collect all enemies and items from rooms
      const allEnemies: Enemy[] = [];
      const allItems: Item[] = [];
      
      newDungeon.rooms.forEach(room => {
        allEnemies.push(...room.enemies);
        allItems.push(...room.items);
      });

      set({
        dungeon: newDungeon,
        enemies: allEnemies,
        items: allItems
      });
    },

    removeEnemy: (enemyId: string) => {
      set((state) => ({
        enemies: state.enemies.filter(enemy => enemy.id !== enemyId)
      }));
    },

    removeItem: (itemId: string) => {
      set((state) => ({
        items: state.items.filter(item => item.id !== itemId)
      }));
    },

    moveEnemy: (enemyId: string, newPosition: Position) => {
      set((state) => ({
        enemies: state.enemies.map(enemy =>
          enemy.id === enemyId
            ? { ...enemy, position: newPosition }
            : enemy
        )
      }));
    },

    getEnemyAtPosition: (position: Position) => {
      const { enemies } = get();
      return enemies.find(enemy =>
        enemy.position.x === position.x && enemy.position.y === position.y
      );
    },

    getItemsAtPosition: (position: Position) => {
      const { items } = get();
      return items.filter(item =>
        item.position &&
        Math.abs(item.position.x - position.x) <= 0.5 &&
        Math.abs(item.position.y - position.y) <= 0.5
      );
    },

    nextFloor: () => {
      set((state) => ({
        currentFloor: state.currentFloor + 1
      }));
      get().generateDungeon();
    },

    resetDungeon: () => {
      set({
        dungeon: null,
        currentFloor: 1,
        enemies: [],
        items: []
      });
    }
  }))
);
