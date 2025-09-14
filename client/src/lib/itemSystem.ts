import { Item, ItemType, Player, Stats } from './gameTypes';

export class ItemSystem {
  static useItem(item: Item, player: Player): string {
    if (item.type !== ItemType.CONSUMABLE) {
      return "This item cannot be used directly.";
    }

    let message = "";

    if (item.stats?.health) {
      const healthRestored = Math.min(item.stats.health, player.stats.maxHealth - player.stats.health);
      player.stats.health += healthRestored;
      message = `Restored ${healthRestored} health.`;
    }

    // Remove item from inventory after use
    const itemIndex = player.inventory.findIndex(invItem => invItem.id === item.id);
    if (itemIndex !== -1) {
      player.inventory.splice(itemIndex, 1);
    }

    return message;
  }

  static equipItem(item: Item, player: Player): string {
    if (item.type !== ItemType.WEAPON && item.type !== ItemType.ARMOR) {
      return "This item cannot be equipped.";
    }

    // Unequip current item if any
    let unequippedItem: Item | undefined;
    
    if (item.type === ItemType.WEAPON) {
      unequippedItem = player.equipment.weapon;
      player.equipment.weapon = item;
    } else if (item.type === ItemType.ARMOR) {
      unequippedItem = player.equipment.armor;
      player.equipment.armor = item;
    }

    // Apply item stats
    this.applyItemStats(item, player.stats, true);

    // Remove item from inventory
    const itemIndex = player.inventory.findIndex(invItem => invItem.id === item.id);
    if (itemIndex !== -1) {
      player.inventory.splice(itemIndex, 1);
    }

    // Add unequipped item back to inventory
    if (unequippedItem) {
      this.applyItemStats(unequippedItem, player.stats, false);
      player.inventory.push(unequippedItem);
    }

    return `Equipped ${item.name}.`;
  }

  static unequipItem(item: Item, player: Player): string {
    let unequipped = false;

    if (player.equipment.weapon?.id === item.id) {
      player.equipment.weapon = undefined;
      unequipped = true;
    } else if (player.equipment.armor?.id === item.id) {
      player.equipment.armor = undefined;
      unequipped = true;
    }

    if (unequipped) {
      this.applyItemStats(item, player.stats, false);
      player.inventory.push(item);
      return `Unequipped ${item.name}.`;
    }

    return "Item is not equipped.";
  }

  private static applyItemStats(item: Item, stats: Stats, equip: boolean): void {
    const multiplier = equip ? 1 : -1;

    if (item.stats?.attack) {
      stats.attack += item.stats.attack * multiplier;
    }
    if (item.stats?.defense) {
      stats.defense += item.stats.defense * multiplier;
    }
    if (item.stats?.maxHealth) {
      stats.maxHealth += item.stats.maxHealth * multiplier;
      // Adjust current health if max health changed
      if (!equip && stats.health > stats.maxHealth) {
        stats.health = stats.maxHealth;
      }
    }
  }

  static getItemRarityColor(rarity: string): string {
    switch (rarity) {
      case 'common': return '#ffffff';
      case 'uncommon': return '#1eff00';
      case 'rare': return '#0070dd';
      case 'epic': return '#a335ee';
      case 'legendary': return '#ff8000';
      default: return '#ffffff';
    }
  }

  static sortInventory(items: Item[]): Item[] {
    const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
    const typeOrder = { weapon: 1, armor: 2, consumable: 3, treasure: 4 };

    return items.sort((a, b) => {
      // Sort by type first, then by rarity
      const typeComparison = typeOrder[a.type] - typeOrder[b.type];
      if (typeComparison !== 0) return typeComparison;
      
      return rarityOrder[b.rarity] - rarityOrder[a.rarity]; // Higher rarity first
    });
  }
}
