import { useEffect } from 'react';
import { useCombat } from '../../lib/stores/useCombat';
import { usePlayer } from '../../lib/stores/usePlayer';
import { useDungeon } from '../../lib/stores/useDungeon';
import { CombatSystem } from '../../lib/combatSystem';
import { useAudio } from '../../lib/stores/useAudio';

export function CombatUI() {
  const { 
    isActive, 
    targetEnemy, 
    currentTurn, 
    combatLog, 
    endCombat, 
    setCurrentTurn, 
    addToCombatLog 
  } = useCombat();
  
  const { player, takeDamage, gainExperience } = usePlayer();
  const { removeEnemy } = useDungeon();
  const { playHit, playSuccess } = useAudio();

  // Handle enemy turn
  useEffect(() => {
    if (currentTurn === 'enemy' && targetEnemy && isActive) {
      const timer = setTimeout(() => {
        // Enemy attacks player
        const damage = CombatSystem.calculateDamage(targetEnemy.stats, player.stats);
        const isPlayerDead = takeDamage(damage);
        
        addToCombatLog(`${targetEnemy.type} deals ${damage} damage!`);
        playHit();

        if (isPlayerDead) {
          addToCombatLog("You have been defeated!");
          endCombat();
        } else {
          setCurrentTurn('player');
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentTurn, targetEnemy, isActive, player.stats, takeDamage, addToCombatLog, playHit, endCombat, setCurrentTurn]);

  const handlePlayerAttack = () => {
    if (!targetEnemy || currentTurn !== 'player') return;

    const damage = CombatSystem.calculateDamage(player.stats, targetEnemy.stats);
    const isEnemyDead = CombatSystem.applyDamage(targetEnemy.stats, damage);
    
    addToCombatLog(`You deal ${damage} damage to ${targetEnemy.type}!`);
    playHit();

    if (isEnemyDead) {
      const exp = CombatSystem.calculateExperienceGain(targetEnemy);
      const leveledUp = gainExperience(exp);
      
      addToCombatLog(`${targetEnemy.type} is defeated! You gain ${exp} experience.`);
      
      if (leveledUp) {
        addToCombatLog("You leveled up!");
        playSuccess();
      }
      
      removeEnemy(targetEnemy.id);
      endCombat();
    } else {
      setCurrentTurn('enemy');
    }
  };

  const handleRunAway = () => {
    if (Math.random() < 0.7) { // 70% chance to escape
      addToCombatLog("You successfully ran away!");
      endCombat();
    } else {
      addToCombatLog("You failed to escape!");
      setCurrentTurn('enemy');
    }
  };

  if (!isActive || !targetEnemy) return null;

  const enemyHealthPercentage = (targetEnemy.stats.health / targetEnemy.stats.maxHealth) * 100;

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white p-6 rounded-lg pointer-events-auto min-w-[600px]">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold mb-2">Combat with {targetEnemy.type}</h3>
        
        {/* Enemy Health Bar */}
        <div className="mb-4">
          <div className="text-sm font-semibold mb-1">{targetEnemy.type} Health</div>
          <div className="w-full h-4 bg-gray-700 rounded">
            <div 
              className="h-full bg-red-500 rounded transition-all duration-300"
              style={{ width: `${enemyHealthPercentage}%` }}
            />
          </div>
          <div className="text-xs mt-1">
            {targetEnemy.stats.health} / {targetEnemy.stats.maxHealth}
          </div>
        </div>

        {/* Turn Indicator */}
        <div className="mb-4">
          <div className={`text-lg font-semibold ${currentTurn === 'player' ? 'text-green-400' : 'text-red-400'}`}>
            {currentTurn === 'player' ? 'Your Turn' : 'Enemy Turn'}
          </div>
        </div>

        {/* Combat Actions */}
        {currentTurn === 'player' && (
          <div className="flex justify-center space-x-4 mb-4">
            <button
              onClick={handlePlayerAttack}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded transition-colors font-semibold"
            >
              Attack
            </button>
            <button
              onClick={handleRunAway}
              className="bg-yellow-600 hover:bg-yellow-700 px-6 py-2 rounded transition-colors font-semibold"
            >
              Run Away
            </button>
          </div>
        )}

        {/* Combat Log */}
        <div className="mt-4 border-t pt-4">
          <div className="text-sm font-semibold mb-2">Combat Log</div>
          <div className="max-h-32 overflow-y-auto text-left text-sm space-y-1">
            {combatLog.map((message, index) => (
              <div key={index} className="text-gray-300">
                {message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
