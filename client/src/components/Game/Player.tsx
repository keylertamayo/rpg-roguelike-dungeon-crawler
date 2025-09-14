import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { Box } from '@react-three/drei';
import { usePlayer } from '../../lib/stores/usePlayer';
import { useDungeon } from '../../lib/stores/useDungeon';
import { useCombat } from '../../lib/stores/useCombat';
import { useInventory } from '../../lib/stores/useInventory';
import { TileType } from '../../lib/gameTypes';
import { CombatSystem } from '../../lib/combatSystem';
import { useAudio } from '../../lib/stores/useAudio';
import * as THREE from 'three';

enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  interact = 'interact',
  inventory = 'inventory',
  attack = 'attack'
}

export function Player() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { player, movePlayer, addItem, gainExperience, takeDamage } = usePlayer();
  const { dungeon, enemies, items, removeEnemy, removeItem, getEnemyAtPosition } = useDungeon();
  const { startCombat, isActive: combatActive } = useCombat();
  const { toggleInventory } = useInventory();
  const { playHit, playSuccess } = useAudio();
  
  const [, getKeys] = useKeyboardControls<Controls>();
  
  const lastMoveTime = useRef(0);
  const moveDelay = 200; // milliseconds between moves

  useFrame(() => {
    if (!dungeon || combatActive) return;

    const now = Date.now();
    if (now - lastMoveTime.current < moveDelay) return;

    const { forward, backward, left, right, interact, inventory, attack } = getKeys();
    
    let newPosition = { ...player.position };
    let moved = false;

    // Handle movement
    if (forward) {
      newPosition.y -= 1;
      moved = true;
    } else if (backward) {
      newPosition.y += 1;
      moved = true;
    } else if (left) {
      newPosition.x -= 1;
      moved = true;
    } else if (right) {
      newPosition.x += 1;
      moved = true;
    }

    // Handle inventory toggle
    if (inventory) {
      toggleInventory();
      lastMoveTime.current = now;
      return;
    }

    // Validate movement
    if (moved) {
      if (isValidPosition(newPosition, dungeon)) {
        // Check for enemy at target position
        const enemyAtPosition = getEnemyAtPosition(newPosition);
        
        if (enemyAtPosition) {
          // Start combat instead of moving
          startCombat(enemyAtPosition);
          playHit();
        } else {
          movePlayer(newPosition);
          
          // Check for items at new position
          const itemsAtPosition = items.filter(item => 
            Math.abs((item.position?.x || 0) - newPosition.x) < 0.5 &&
            Math.abs((item.position?.y || 0) - newPosition.y) < 0.5
          );
          
          // Collect items
          itemsAtPosition.forEach(item => {
            addItem(item);
            removeItem(item.id);
            playSuccess();
          });
        }
        
        lastMoveTime.current = now;
      }
    }

    // Handle attack (for combat)
    if (attack && combatActive) {
      // This will be handled by the combat system
      lastMoveTime.current = now;
    }

    // Handle interact
    if (interact) {
      // Check for interactable objects (stairs, etc.)
      const currentTile = dungeon.tiles[player.position.y]?.[player.position.x];
      if (currentTile === TileType.STAIRS_DOWN) {
        // Go to next floor
        console.log("Going to next floor...");
      }
      lastMoveTime.current = now;
    }
  });

  // Update mesh position
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(player.position.x, 0.5, player.position.y);
    }
  }, [player.position]);

  return (
    <Box
      ref={meshRef}
      args={[0.8, 1, 0.8]}
      position={[player.position.x, 0.5, player.position.y]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color="#4f81bd" />
    </Box>
  );
}

function isValidPosition(position: { x: number, y: number }, dungeon: any): boolean {
  if (!dungeon || !dungeon.tiles) return false;
  
  const { x, y } = position;
  
  // Check bounds
  if (x < 0 || x >= dungeon.width || y < 0 || y >= dungeon.height) {
    return false;
  }
  
  // Check if tile is walkable
  const tile = dungeon.tiles[y]?.[x];
  return tile === TileType.FLOOR || tile === TileType.STAIRS_UP || tile === TileType.STAIRS_DOWN;
}
