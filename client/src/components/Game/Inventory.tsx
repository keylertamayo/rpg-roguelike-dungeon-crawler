import { useInventory } from '../../lib/stores/useInventory';
import { usePlayer } from '../../lib/stores/usePlayer';
import { ItemSystem } from '../../lib/itemSystem';
import { ItemType } from '../../lib/gameTypes';

export function Inventory() {
  const { isOpen, selectedItem, closeInventory, selectItem, useItem, equipItem, unequipItem } = useInventory();
  const { player, removeItem, addItem, setEquipment } = usePlayer();

  if (!isOpen) return null;

  const handleUseItem = (item: any) => {
    const message = useItem(item, player);
    console.log(message);
    
    if (item.type === ItemType.CONSUMABLE) {
      removeItem(item.id);
    }
  };

  const handleEquipItem = (item: any) => {
    const message = equipItem(item, player);
    console.log(message);
    
    if (message.includes('Equipped')) {
      removeItem(item.id);
      
      if (item.type === ItemType.WEAPON) {
        setEquipment({ weapon: item });
      } else if (item.type === ItemType.ARMOR) {
        setEquipment({ armor: item });
      }
    }
  };

  const handleUnequipItem = (item: any) => {
    const message = unequipItem(item, player);
    console.log(message);
    
    if (message.includes('Unequipped')) {
      addItem(item);
      
      if (item.type === ItemType.WEAPON) {
        setEquipment({ weapon: undefined });
      } else if (item.type === ItemType.ARMOR) {
        setEquipment({ armor: undefined });
      }
    }
  };

  const sortedInventory = ItemSystem.sortInventory([...player.inventory]);

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center pointer-events-auto">
      <div className="bg-gray-900 text-white p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Inventory</h2>
          <button
            onClick={closeInventory}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Equipment Panel */}
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-lg font-semibold mb-3">Equipment</h3>
            
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-400">Weapon</div>
                {player.equipment.weapon ? (
                  <div className="bg-gray-700 p-2 rounded">
                    <div 
                      className="font-medium"
                      style={{ color: ItemSystem.getItemRarityColor(player.equipment.weapon.rarity) }}
                    >
                      {player.equipment.weapon.name}
                    </div>
                    <div className="text-xs text-gray-400">{player.equipment.weapon.description}</div>
                    <button
                      onClick={() => handleUnequipItem(player.equipment.weapon)}
                      className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded mt-1 transition-colors"
                    >
                      Unequip
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-700 p-2 rounded text-gray-500 text-sm">
                    No weapon equipped
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm font-medium text-gray-400">Armor</div>
                {player.equipment.armor ? (
                  <div className="bg-gray-700 p-2 rounded">
                    <div 
                      className="font-medium"
                      style={{ color: ItemSystem.getItemRarityColor(player.equipment.armor.rarity) }}
                    >
                      {player.equipment.armor.name}
                    </div>
                    <div className="text-xs text-gray-400">{player.equipment.armor.description}</div>
                    <button
                      onClick={() => handleUnequipItem(player.equipment.armor)}
                      className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded mt-1 transition-colors"
                    >
                      Unequip
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-700 p-2 rounded text-gray-500 text-sm">
                    No armor equipped
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Inventory Items */}
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-lg font-semibold mb-3">Items ({player.inventory.length}/50)</h3>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {sortedInventory.length === 0 ? (
                <div className="text-gray-500 text-sm">No items in inventory</div>
              ) : (
                sortedInventory.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-gray-700 p-2 rounded cursor-pointer transition-colors ${
                      selectedItem?.id === item.id ? 'bg-blue-600' : 'hover:bg-gray-600'
                    }`}
                    onClick={() => selectItem(selectedItem?.id === item.id ? null : item)}
                  >
                    <div 
                      className="font-medium"
                      style={{ color: ItemSystem.getItemRarityColor(item.rarity) }}
                    >
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-400">{item.type}</div>
                    {item.stats && (
                      <div className="text-xs text-green-400">
                        {item.stats.attack && `+${item.stats.attack} ATK `}
                        {item.stats.defense && `+${item.stats.defense} DEF `}
                        {item.stats.health && `+${item.stats.health} HP `}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Item Details */}
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-lg font-semibold mb-3">Item Details</h3>
            
            {selectedItem ? (
              <div className="space-y-3">
                <div>
                  <div 
                    className="text-lg font-medium"
                    style={{ color: ItemSystem.getItemRarityColor(selectedItem.rarity) }}
                  >
                    {selectedItem.name}
                  </div>
                  <div className="text-sm text-gray-400 capitalize">{selectedItem.rarity} {selectedItem.type}</div>
                </div>

                <div className="text-sm">
                  {selectedItem.description}
                </div>

                {selectedItem.stats && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Stats:</div>
                    {selectedItem.stats.attack && (
                      <div className="text-sm text-green-400">Attack: +{selectedItem.stats.attack}</div>
                    )}
                    {selectedItem.stats.defense && (
                      <div className="text-sm text-blue-400">Defense: +{selectedItem.stats.defense}</div>
                    )}
                    {selectedItem.stats.health && (
                      <div className="text-sm text-red-400">Health: +{selectedItem.stats.health}</div>
                    )}
                  </div>
                )}

                <div className="text-sm text-yellow-400">
                  Value: {selectedItem.value} gold
                </div>

                <div className="space-y-2">
                  {selectedItem.type === ItemType.CONSUMABLE && (
                    <button
                      onClick={() => handleUseItem(selectedItem)}
                      className="w-full bg-green-600 hover:bg-green-700 px-3 py-2 rounded transition-colors text-sm"
                    >
                      Use Item
                    </button>
                  )}
                  
                  {(selectedItem.type === ItemType.WEAPON || selectedItem.type === ItemType.ARMOR) && (
                    <button
                      onClick={() => handleEquipItem(selectedItem)}
                      className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded transition-colors text-sm"
                    >
                      Equip
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                Select an item to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
