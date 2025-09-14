import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Player, Position, Item, Equipment } from '../gameTypes';
import { CombatSystem } from '../combatSystem';

interface PlayerState {
  player: Player;
  
  // Actions
  movePlayer: (newPosition: Position) => void;
  takeDamage: (damage: number) => boolean;
  gainExperience: (exp: number) => boolean;
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  setEquipment: (equipment: Partial<Equipment>) => void;
  resetPlayer: () => void;
  healPlayer: (amount: number) => void;
}

const initialPlayer: Player = {
  position: { x: 1, y: 1 },
  stats: CombatSystem.getPlayerInitialStats(),
  inventory: [],
  equipment: {}
};

export const usePlayer = create<PlayerState>()(
  subscribeWithSelector((set, get) => ({
    player: initialPlayer,

    movePlayer: (newPosition: Position) => {
      set((state) => ({
        player: {
          ...state.player,
          position: newPosition
        }
      }));
    },

    takeDamage: (damage: number) => {
      let isDead = false;
      set((state) => {
        const newHealth = Math.max(0, state.player.stats.health - damage);
        isDead = newHealth === 0;
        
        return {
          player: {
            ...state.player,
            stats: {
              ...state.player.stats,
              health: newHealth
            }
          }
        };
      });
      return isDead;
    },

    gainExperience: (exp: number) => {
      let leveledUp = false;
      set((state) => {
        const newStats = {
          ...state.player.stats,
          experience: state.player.stats.experience + exp
        };

        // Check for level up
        if (CombatSystem.checkLevelUp(newStats)) {
          CombatSystem.levelUp(newStats);
          leveledUp = true;
        }

        return {
          player: {
            ...state.player,
            stats: newStats
          }
        };
      });
      return leveledUp;
    },

    addItem: (item: Item) => {
      set((state) => ({
        player: {
          ...state.player,
          inventory: [...state.player.inventory, item]
        }
      }));
    },

    removeItem: (itemId: string) => {
      set((state) => ({
        player: {
          ...state.player,
          inventory: state.player.inventory.filter(item => item.id !== itemId)
        }
      }));
    },

    setEquipment: (equipment: Partial<Equipment>) => {
      set((state) => ({
        player: {
          ...state.player,
          equipment: {
            ...state.player.equipment,
            ...equipment
          }
        }
      }));
    },

    healPlayer: (amount: number) => {
      set((state) => ({
        player: {
          ...state.player,
          stats: {
            ...state.player.stats,
            health: Math.min(state.player.stats.maxHealth, state.player.stats.health + amount)
          }
        }
      }));
    },

    resetPlayer: () => {
      set({ player: { ...initialPlayer, stats: CombatSystem.getPlayerInitialStats() } });
    }
  }))
);
