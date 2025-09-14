import { create } from 'zustand';
import { Item, Player } from '../gameTypes';
import { ItemSystem } from '../itemSystem';

interface InventoryState {
  isOpen: boolean;
  selectedItem: Item | null;
  
  // Actions
  openInventory: () => void;
  closeInventory: () => void;
  toggleInventory: () => void;
  selectItem: (item: Item | null) => void;
  useItem: (item: Item, player: Player) => string;
  equipItem: (item: Item, player: Player) => string;
  unequipItem: (item: Item, player: Player) => string;
}

export const useInventory = create<InventoryState>((set, get) => ({
  isOpen: false,
  selectedItem: null,

  openInventory: () => set({ isOpen: true }),
  
  closeInventory: () => set({ isOpen: false, selectedItem: null }),
  
  toggleInventory: () => set((state) => ({ 
    isOpen: !state.isOpen,
    selectedItem: state.isOpen ? null : state.selectedItem
  })),

  selectItem: (item: Item | null) => set({ selectedItem: item }),

  useItem: (item: Item, player: Player) => {
    return ItemSystem.useItem(item, player);
  },

  equipItem: (item: Item, player: Player) => {
    return ItemSystem.equipItem(item, player);
  },

  unequipItem: (item: Item, player: Player) => {
    return ItemSystem.unequipItem(item, player);
  }
}));
