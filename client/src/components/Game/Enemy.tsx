import { useRef, useEffect } from 'react';
import { Box } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Enemy as EnemyType, AIBehavior, EnemyType as EnemyTypeEnum } from '../../lib/gameTypes';
import { usePlayer } from '../../lib/stores/usePlayer';
import { useDungeon } from '../../lib/stores/useDungeon';
import { TileType } from '../../lib/gameTypes';
import * as THREE from 'three';

interface EnemyProps {
  enemy: EnemyType;
}

export function Enemy({ enemy }: EnemyProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { player } = usePlayer();
  const { dungeon, moveEnemy } = useDungeon();
  
  const lastMoveTime = useRef(0);
  const moveDelay = 1000; // Enemies move slower than player

  // Get enemy color based on type
  const getEnemyColor = (type: EnemyTypeEnum): string => {
    switch (type) {
      case EnemyTypeEnum.GOBLIN:
        return '#9acd32'; // Yellow-green
      case EnemyTypeEnum.ORC:
        return '#8b4513'; // Brown
      case EnemyTypeEnum.SKELETON:
        return '#f5f5dc'; // Beige
      case EnemyTypeEnum.TROLL:
        return '#2f4f4f'; // Dark slate gray
      default:
        return '#ff0000'; // Red
    }
  };

  // AI movement logic
  useFrame(() => {
    if (!dungeon) return;

    const now = Date.now();
    if (now - lastMoveTime.current < moveDelay) return;

    const distance = Math.abs(player.position.x - enemy.position.x) + 
                    Math.abs(player.position.y - enemy.position.y);

    let newPosition = { ...enemy.position };
    let shouldMove = false;

    switch (enemy.behavior) {
      case AIBehavior.AGGRESSIVE:
        // Chase player if within 5 tiles
        if (distance <= 5) {
          shouldMove = true;
          if (player.position.x > enemy.position.x) {
            newPosition.x += 1;
          } else if (player.position.x < enemy.position.x) {
            newPosition.x -= 1;
          } else if (player.position.y > enemy.position.y) {
            newPosition.y += 1;
          } else if (player.position.y < enemy.position.y) {
            newPosition.y -= 1;
          }
        }
        break;

      case AIBehavior.WANDERING:
        // Random movement occasionally
        if (Math.random() < 0.3) {
          shouldMove = true;
          const directions = [
            { x: 0, y: -1 }, // up
            { x: 0, y: 1 },  // down
            { x: -1, y: 0 }, // left
            { x: 1, y: 0 }   // right
          ];
          const randomDir = directions[Math.floor(Math.random() * directions.length)];
          newPosition.x += randomDir.x;
          newPosition.y += randomDir.y;
        }
        break;

      case AIBehavior.DEFENSIVE:
        // Move away from player if too close
        if (distance <= 2) {
          shouldMove = true;
          if (player.position.x > enemy.position.x) {
            newPosition.x -= 1;
          } else if (player.position.x < enemy.position.x) {
            newPosition.x += 1;
          } else if (player.position.y > enemy.position.y) {
            newPosition.y -= 1;
          } else if (player.position.y < enemy.position.y) {
            newPosition.y += 1;
          }
        }
        break;
    }

    // Validate and execute movement
    if (shouldMove && isValidEnemyPosition(newPosition, dungeon)) {
      moveEnemy(enemy.id, newPosition);
      lastMoveTime.current = now;
    }
  });

  // Update mesh position
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(enemy.position.x, 0.5, enemy.position.y);
    }
  }, [enemy.position]);

  return (
    <Box
      ref={meshRef}
      args={[0.7, 0.8, 0.7]}
      position={[enemy.position.x, 0.4, enemy.position.y]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={getEnemyColor(enemy.type)} />
    </Box>
  );
}

function isValidEnemyPosition(position: { x: number, y: number }, dungeon: any): boolean {
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
