import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'framer-motion';
import { useMemo, useRef } from 'react';
import type { Group } from 'three';
import { THEMES, type ThemeId } from '../core/levels';
import { createRng } from '../core/random';

/**
 * Calm, low-poly 3D backdrop per theme. Slow motion only (drifting clouds,
 * swaying flowers, rising bubbles). Rendered behind the DOM game UI.
 */

function useSlowTime(speed = 1) {
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += Math.min(dt, 0.05) * speed;
  });
  return t;
}

function Cloud({ x, y, z, speed }: { x: number; y: number; z: number; speed: number }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.position.x += dt * speed;
    if (ref.current.position.x > 14) ref.current.position.x = -14;
  });
  return (
    <group ref={ref} position={[x, y, z]}>
      {[
        [0, 0, 0, 1],
        [1, 0.2, 0, 0.8],
        [-1, 0.1, 0, 0.75],
        [0.4, 0.6, 0, 0.7],
      ].map(([cx, cy, cz, r], i) => (
        <mesh key={i} position={[cx, cy, cz]}>
          <icosahedronGeometry args={[r, 0]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.45} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Tree({
  position,
  scale = 1,
  color = '#3f8f45',
}: {
  position: [number, number, number];
  scale?: number;
  color?: string;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 1, 6]} />
        <meshStandardMaterial color="#8a5a33" flatShading />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <coneGeometry args={[0.7, 1.6, 7]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </group>
  );
}

function Flower({ position, color, phase }: { position: [number, number, number]; color: string; phase: number }) {
  const ref = useRef<Group>(null);
  const t = useSlowTime();
  useFrame(() => {
    if (ref.current) ref.current.rotation.z = Math.sin(t.current * 0.8 + phase) * 0.12;
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 4]} />
        <meshStandardMaterial color="#4c9a3f" />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <dodecahedronGeometry args={[0.14, 0]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </group>
  );
}

/** Snow-capped peaks along the back, like a sunny alpine valley. */
function Mountains() {
  const peaks: [number, number, number, number, string][] = [
    [-12, 7, -22, 7.5, '#7f9cb8'],
    [-4, 9, -26, 9, '#8aa7c2'],
    [5, 8, -24, 8, '#7896b3'],
    [13, 7, -22, 7, '#86a2bd'],
  ];
  return (
    <>
      {peaks.map(([x, h, z, r, color], i) => (
        <group key={i} position={[x, -2.2, z]}>
          <mesh position={[0, h / 2, 0]}>
            <coneGeometry args={[r, h, 7]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
          <mesh position={[0, h - h * 0.14, 0]}>
            <coneGeometry args={[r * 0.29, h * 0.29, 7]} />
            <meshStandardMaterial color="#ffffff" flatShading />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Sun() {
  return (
    <mesh position={[9, 6.5, -20]}>
      <sphereGeometry args={[1.6, 20, 14]} />
      <meshBasicMaterial color="#ffd84a" fog={false} />
    </mesh>
  );
}

function Chalet({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0.5, 0]}>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[2, 1.4, 1.6]} />
        <meshStandardMaterial color="#b5703d" flatShading />
      </mesh>
      <mesh position={[0, 1.75, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.75, 0.9, 4]} />
        <meshStandardMaterial color="#7a4524" flatShading />
      </mesh>
      <mesh position={[0, 0.8, 0.81]}>
        <boxGeometry args={[0.5, 0.5, 0.02]} />
        <meshStandardMaterial color="#fff4d6" />
      </mesh>
    </group>
  );
}

function Hills({ color = '#7cc46a' }: { color?: string }) {
  return (
    <>
      <mesh position={[-6, -7, -10]} scale={[11, 6, 5]}>
        <sphereGeometry args={[1, 18, 12]} />
        <meshStandardMaterial color="#6cb95c" flatShading />
      </mesh>
      <mesh position={[7, -7.4, -11]} scale={[12, 6, 5]}>
        <sphereGeometry args={[1, 18, 12]} />
        <meshStandardMaterial color="#64b056" flatShading />
      </mesh>
      <mesh position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 30]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </>
  );
}

const FLOWER_COLORS = ['#f6c945', '#ffffff', '#e4572e', '#9b7fd1', '#f29fc5'];

function Meadow({ chalet = false }: { chalet?: boolean }) {
  const flowers = useMemo(() => {
    const rng = createRng(11);
    return Array.from({ length: 26 }, () => ({
      position: [(rng() - 0.5) * 18, -2.2, -1 - rng() * 5] as [number, number, number],
      color: FLOWER_COLORS[Math.floor(rng() * FLOWER_COLORS.length)],
      phase: rng() * 6,
    }));
  }, []);
  return (
    <>
      <Sun />
      <Mountains />
      <Hills />
      <Tree position={[-7, -2.2, -6]} scale={1.5} />
      <Tree position={[-5.4, -2.2, -7]} scale={1.2} />
      <Tree position={[6.8, -2.2, -6]} scale={1.4} color="#357f3c" />
      {chalet && <Chalet position={[4.5, -2.2, -8]} />}
      {flowers.map((f, i) => (
        <Flower key={i} {...f} />
      ))}
      <Cloud x={-8} y={3.6} z={-9} speed={0.18} />
      <Cloud x={3} y={4.4} z={-12} speed={0.12} />
    </>
  );
}

function Duck({ x, z, speed, phase }: { x: number; z: number; speed: number; phase: number }) {
  const ref = useRef<Group>(null);
  const t = useSlowTime();
  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.x = x + Math.sin(t.current * speed + phase) * 2.5;
    ref.current.position.y = -2.05 + Math.sin(t.current * 1.4 + phase) * 0.03;
  });
  return (
    <group ref={ref} position={[x, -2.05, z]}>
      <mesh>
        <sphereGeometry args={[0.3, 10, 8]} />
        <meshStandardMaterial color="#fff8e8" flatShading />
      </mesh>
      <mesh position={[0.22, 0.25, 0]}>
        <sphereGeometry args={[0.16, 10, 8]} />
        <meshStandardMaterial color="#fff8e8" flatShading />
      </mesh>
      <mesh position={[0.4, 0.23, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.06, 0.14, 6]} />
        <meshStandardMaterial color="#f2a33a" />
      </mesh>
    </group>
  );
}

function Lake() {
  return (
    <>
      <Sun />
      <Mountains />
      <Hills />
      <mesh position={[0, -2.17, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[7.5, 40]} />
        <meshStandardMaterial color="#3d9ad1" />
      </mesh>
      <Tree position={[-8, -2.2, -6]} scale={1.6} />
      <Tree position={[-6.6, -2.2, -8]} scale={1.3} color="#357f3c" />
      <Tree position={[7.8, -2.2, -7]} scale={1.5} />
      <Tree position={[9, -2.2, -5]} scale={1.1} color="#357f3c" />
      <Duck x={-2} z={-6} speed={0.25} phase={0} />
      <Duck x={2.5} z={-4} speed={0.2} phase={2} />
      <Cloud x={-6} y={4} z={-11} speed={0.15} />
    </>
  );
}

function Forest() {
  const trees = useMemo(() => {
    const rng = createRng(3);
    return Array.from({ length: 16 }, () => ({
      position: [(rng() - 0.5) * 20, -2.2, -3 - rng() * 7] as [number, number, number],
      scale: 1 + rng() * 0.9,
      color: ['#3f8f45', '#357f3c', '#4c9f49'][Math.floor(rng() * 3)],
    }));
  }, []);
  return (
    <>
      <Sun />
      <Mountains />
      <Hills color="#6cb95c" />
      {trees.map((tr, i) => (
        <Tree key={i} {...tr} />
      ))}
    </>
  );
}

function Castle() {
  return (
    <>
      <Sun />
      <Mountains />
      <Hills />
      {[-5.5, -3.5, 4, 6].map((x, i) => (
        <group key={i} position={[x, -2.2, -7]}>
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 2.8, 8]} />
            <meshStandardMaterial color="#efe6d4" flatShading />
          </mesh>
          <mesh position={[0, 3.3, 0]}>
            <coneGeometry args={[0.8, 1.2, 8]} />
            <meshStandardMaterial color="#7a62b0" flatShading />
          </mesh>
        </group>
      ))}
    </>
  );
}

function SceneContent({ theme }: { theme: ThemeId }) {
  switch (theme) {
    case 'meadow':
      return <Meadow />;
    case 'lake':
      return <Lake />;
    case 'forest':
      return <Forest />;
    case 'hut':
      return <Meadow chalet />;
    case 'village':
      return <Meadow chalet />;
    case 'castle':
      return <Castle />;
  }
}

export default function ThemeScene({ theme }: { theme: ThemeId }) {
  const reduce = useReducedMotion();
  const t = THEMES[theme];
  return (
    <div className="scene-bg" aria-hidden="true" style={{ background: t.sky }}>
      <Canvas
        dpr={[1, 1.5]}
        frameloop={reduce ? 'demand' : 'always'}
        camera={{ position: [0, 0.6, 8], fov: 50 }}
        gl={{ antialias: true, powerPreference: 'low-power' }}
      >
        <color attach="background" args={[t.sky]} />
        <fog attach="fog" args={[t.sky, 22, 45]} />
        <hemisphereLight args={['#ffffff', '#6cb95c', 1.25]} />
        <directionalLight position={[5, 8, 6]} intensity={1.4} color="#fff3dc" />
        <SceneContent theme={theme} />
      </Canvas>
    </div>
  );
}
