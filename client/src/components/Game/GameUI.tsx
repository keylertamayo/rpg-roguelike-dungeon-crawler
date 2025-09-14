import { usePlayer } from '../../lib/stores/usePlayer';
import { useDungeon } from '../../lib/stores/useDungeon';
import { useCombat } from '../../lib/stores/useCombat';
import { useGame } from '../../lib/stores/useGame';
import { CombatUI } from './CombatUI';
import { Inventory } from './Inventory';

export function GameUI() {
  const { player } = usePlayer();
  const { currentFloor } = useDungeon();
  const { isActive: combatActive } = useCombat();
  const { restart } = useGame();

  // Player stats bar
  const healthPercentage = (player.stats.health / player.stats.maxHealth) * 100;
  const expForNextLevel = player.stats.level * 100;
  const expPercentage = (player.stats.experience / expForNextLevel) * 100;

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Top HUD */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg pointer-events-auto">
        <div className="space-y-2">
          {/* Health Bar */}
          <div>
            <div className="text-sm font-semibold mb-1">Health</div>
            <div className="w-48 h-4 bg-gray-700 rounded">
              <div 
                className="h-full bg-red-500 rounded transition-all duration-300"
                style={{ width: `${healthPercentage}%` }}
              />
            </div>
            <div className="text-xs mt-1">
              {player.stats.health} / {player.stats.maxHealth}
            </div>
          </div>

          {/* Experience Bar */}
          <div>
            <div className="text-sm font-semibold mb-1">Level {player.stats.level}</div>
            <div className="w-48 h-3 bg-gray-700 rounded">
              <div 
                className="h-full bg-blue-500 rounded transition-all duration-300"
                style={{ width: `${expPercentage}%` }}
              />
            </div>
            <div className="text-xs mt-1">
              {player.stats.experience} / {expForNextLevel} XP
            </div>
          </div>

          {/* Player Stats */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Attack: {player.stats.attack}</div>
            <div>Defense: {player.stats.defense}</div>
          </div>

          {/* Floor Info */}
          <div className="text-sm border-t pt-2">
            Floor: {currentFloor}
          </div>
        </div>
      </div>

      {/* Controls Help */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg pointer-events-auto">
        <div className="text-sm space-y-1">
          <div className="font-semibold mb-2">Controls</div>
          <div>WASD / Arrows: Move</div>
          <div>E / Space: Interact</div>
          <div>I / Tab: Inventory</div>
          <div>X / Enter: Attack</div>
        </div>
      </div>

      {/* Game Over Screen */}
      {player.stats.health <= 0 && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center pointer-events-auto">
          <div className="bg-red-900 text-white p-8 rounded-lg text-center">
            <h2 className="text-3xl font-bold mb-4">Game Over</h2>
            <p className="mb-6">You have fallen in the dungeon...</p>
            <button
              onClick={restart}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded transition-colors"
            >
              Restart Game
            </button>
          </div>
        </div>
      )}

      {/* Combat UI */}
      {combatActive && <CombatUI />}

      {/* Inventory */}
      <Inventory />
    </div>
  );
}
