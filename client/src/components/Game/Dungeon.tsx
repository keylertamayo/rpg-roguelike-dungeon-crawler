import { useEffect, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { useDungeon } from '../../lib/stores/useDungeon';
import { usePlayer } from '../../lib/stores/usePlayer';
import { TileType } from '../../lib/gameTypes';
import * as THREE from 'three';

export function Dungeon() {
  const { dungeon, generateDungeon, items } = useDungeon();
  const { movePlayer } = usePlayer();
  
  // Load textures
  const grassTexture = useTexture('/textures/grass.png');
  const woodTexture = useTexture('/textures/wood.jpg');
  
  // Generate dungeon on component mount
  useEffect(() => {
    if (!dungeon) {
      generateDungeon();
    }
  }, [dungeon, generateDungeon]);

  // Set player starting position when dungeon is generated
  useEffect(() => {
    if (dungeon && dungeon.startRoom) {
      movePlayer(dungeon.startRoom);
    }
  }, [dungeon, movePlayer]);

  // Create tile meshes
  const tiles = useMemo(() => {
    if (!dungeon) return [];

    const tileComponents = [];
    
    for (let y = 0; y < dungeon.height; y++) {
      for (let x = 0; x < dungeon.width; x++) {
        const tileType = dungeon.tiles[y][x];
        const key = `tile-${x}-${y}`;
        
        if (tileType === TileType.FLOOR || tileType === TileType.STAIRS_UP || tileType === TileType.STAIRS_DOWN) {
          // Floor tile
          tileComponents.push(
            <mesh key={key} position={[x, 0, y]} receiveShadow>
              <boxGeometry args={[1, 0.1, 1]} />
              <meshStandardMaterial map={grassTexture} />
            </mesh>
          );
          
          // Special tiles
          if (tileType === TileType.STAIRS_UP) {
            tileComponents.push(
              <mesh key={`stairs-up-${x}-${y}`} position={[x, 0.3, y]}>
                <cylinderGeometry args={[0.3, 0.4, 0.4, 8]} />
                <meshStandardMaterial color="#ffff00" />
              </mesh>
            );
          } else if (tileType === TileType.STAIRS_DOWN) {
            tileComponents.push(
              <mesh key={`stairs-down-${x}-${y}`} position={[x, 0.3, y]}>
                <cylinderGeometry args={[0.4, 0.3, 0.4, 8]} />
                <meshStandardMaterial color="#00ffff" />
              </mesh>
            );
          }
        } else if (tileType === TileType.WALL) {
          // Wall tile
          tileComponents.push(
            <mesh key={key} position={[x, 0.5, y]} castShadow receiveShadow>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial map={woodTexture} />
            </mesh>
          );
        }
      }
    }
    
    return tileComponents;
  }, [dungeon, grassTexture, woodTexture]);

  // Render items in the dungeon
  const itemMeshes = useMemo(() => {
    if (!items.length) return [];

    return items.map((item, index) => {
      if (!item.position) return null;

      const color = getItemColor(item.rarity);
      
      return (
        <mesh 
          key={item.id} 
          position={[item.position.x, 0.3, item.position.y]}
          rotation={[0, Date.now() * 0.001 + index, 0]} // Rotating items
        >
          <octahedronGeometry args={[0.2]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
        </mesh>
      );
    }).filter(Boolean);
  }, [items]);

  if (!dungeon) {
    return null;
  }

  return (
    <group>
      {tiles}
      {itemMeshes}
    </group>
  );
}

function getItemColor(rarity: string): string {
  switch (rarity) {
    case 'common': return '#ffffff';
    case 'uncommon': return '#1eff00';
    case 'rare': return '#0070dd';
    case 'epic': return '#a335ee';
    case 'legendary': return '#ff8000';
    default: return '#ffffff';
  }
}
