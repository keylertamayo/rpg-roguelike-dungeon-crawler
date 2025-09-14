import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { Suspense } from "react";
import { Player } from "./Player";
import { Dungeon } from "./Dungeon";
import { Enemy } from "./Enemy";
import { useDungeon } from "../../lib/stores/useDungeon";
import * as THREE from "three";

// Define control keys for the game
enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  interact = 'interact',
  inventory = 'inventory',
  attack = 'attack'
}

const controlsMap = [
  { name: Controls.forward, keys: ['KeyW', 'ArrowUp'] },
  { name: Controls.backward, keys: ['KeyS', 'ArrowDown'] },
  { name: Controls.left, keys: ['KeyA', 'ArrowLeft'] },
  { name: Controls.right, keys: ['KeyD', 'ArrowRight'] },
  { name: Controls.interact, keys: ['KeyE', 'Space'] },
  { name: Controls.inventory, keys: ['KeyI', 'Tab'] },
  { name: Controls.attack, keys: ['KeyX', 'Enter'] }
];

// Lighting component
function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} />
    </>
  );
}

// Enemy renderer component
function EnemyRenderer() {
  const { enemies } = useDungeon();

  return (
    <>
      {enemies.map(enemy => (
        <Enemy key={enemy.id} enemy={enemy} />
      ))}
    </>
  );
}

export function GameCanvas() {
  return (
    <KeyboardControls map={controlsMap}>
      <Canvas
        shadows
        camera={{
          position: [0, 15, 10],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          powerPreference: "default"
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={["#1a1a1a"]} />
        
        <Lights />
        
        <Suspense fallback={null}>
          <Dungeon />
          <Player />
          <EnemyRenderer />
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
}
