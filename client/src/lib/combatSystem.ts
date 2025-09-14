import { Player, Enemy, Stats } from './gameTypes';

export class CombatSystem {
  static calculateDamage(attacker: Stats, defender: Stats): number {
    const baseDamage = attacker.attack;
    const defense = defender.defense;
    const randomFactor = 0.8 + Math.random() * 0.4; // 80% - 120% damage variance
    
    const damage = Math.max(1, Math.floor((baseDamage - defense) * randomFactor));
    return damage;
  }

  static applyDamage(target: Stats, damage: number): boolean {
    target.health = Math.max(0, target.health - damage);
    return target.health <= 0;
  }

  static calculateExperienceGain(enemy: Enemy): number {
    return enemy.stats.level * 15 + Math.floor(Math.random() * 10);
  }

  static checkLevelUp(player: Stats): boolean {
    const experienceRequired = player.level * 100;
    return player.experience >= experienceRequired;
  }

  static levelUp(player: Stats): void {
    const experienceRequired = player.level * 100;
    player.experience -= experienceRequired;
    player.level += 1;
    
    // Increase stats on level up
    const healthIncrease = 15 + Math.floor(Math.random() * 10);
    const attackIncrease = 2 + Math.floor(Math.random() * 3);
    const defenseIncrease = 1 + Math.floor(Math.random() * 2);
    
    player.maxHealth += healthIncrease;
    player.health = player.maxHealth; // Full heal on level up
    player.attack += attackIncrease;
    player.defense += defenseIncrease;
  }

  static getPlayerInitialStats(): Stats {
    return {
      health: 100,
      maxHealth: 100,
      attack: 10,
      defense: 5,
      experience: 0,
      level: 1
    };
  }

  static canPlayerMove(playerPos: { x: number, y: number }, newPos: { x: number, y: number }, enemies: Enemy[]): boolean {
    // Check if there's an enemy at the target position
    return !enemies.some(enemy => 
      enemy.position.x === newPos.x && enemy.position.y === newPos.y
    );
  }

  static getEnemyAtPosition(position: { x: number, y: number }, enemies: Enemy[]): Enemy | undefined {
    return enemies.find(enemy => 
      enemy.position.x === position.x && enemy.position.y === position.y
    );
  }
}
