import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Enemy, CombatState } from '../gameTypes';

interface CombatStore extends CombatState {
  // Actions
  startCombat: (enemy: Enemy) => void;
  endCombat: () => void;
  setCurrentTurn: (turn: 'player' | 'enemy') => void;
  addToCombatLog: (message: string) => void;
  clearCombatLog: () => void;
}

export const useCombat = create<CombatStore>()(
  subscribeWithSelector((set, get) => ({
    isActive: false,
    currentTurn: 'player',
    targetEnemy: undefined,
    combatLog: [],

    startCombat: (enemy: Enemy) => {
      set({
        isActive: true,
        targetEnemy: enemy,
        currentTurn: 'player',
        combatLog: [`Combat started with ${enemy.type}!`]
      });
    },

    endCombat: () => {
      set({
        isActive: false,
        targetEnemy: undefined,
        currentTurn: 'player',
        combatLog: []
      });
    },

    setCurrentTurn: (turn: 'player' | 'enemy') => {
      set({ currentTurn: turn });
    },

    addToCombatLog: (message: string) => {
      set((state) => ({
        combatLog: [...state.combatLog, message].slice(-10) // Keep only last 10 messages
      }));
    },

    clearCombatLog: () => {
      set({ combatLog: [] });
    }
  }))
);
