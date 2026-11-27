import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'framer-motion';
import { useMemo, useRef } from 'react';
import type { Group, Mesh } from 'three';
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
          <meshStandardMaterial color="#fbfbf8" flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Tree({
  position,
  scale = 1,
  color = '#8fae86',
}: {
  position: [number, number, number];
  scale?: number;
  color?: string;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 1, 6]} />
        <meshStandardMaterial color="#a68a6d" flatShading />
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
        <meshStandardMaterial color="#86a878" />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <dodecahedronGeometry args={[0.14, 0]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </group>
  );
}

function Meadow() {
  const flowers = useMemo(() => {
    const rng = createRng(11);
    return Array.from({ length: 18 }, () => ({
      position: [(rng() - 0.5) * 16, -1.9, -1 - rng() * 4] as [number, number, number],
      color: ['#e9d8a6', '#d9c4e0', '#f0e3e6', '#cfe0ee'][Math.floor(rng() * 4)],
      phase: rng() * 6,
    }));
  }, []);
  return (
    <>
      <mesh position={[-5, -6.5, -6]} scale={[9, 5, 4]}>
        <sphereGeometry args={[1, 16, 10]} />
        <meshStandardMaterial color="#b4cda2" flatShading />
      </mesh>
      <mesh position={[6, -6.8, -7]} scale={[10, 5, 4]}>
        <sphereGeometry args={[1, 16, 10]} />
        <meshStandardMaterial color="#a9c497" flatShading />
      </mesh>
      <mesh position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color="#bcd3a9" />
      </mesh>
      <Tree position={[-6.5, -2.2, -5]} scale={1.3} />
      <Tree position={[-4.8, -2.2, -6]} />
      <Tree position={[6.2, -2.2, -5]} scale={1.2} color="#9cb98f" />
      {flowers.map((f, i) => (
        <Flower key={i} {...f} />
      ))}
      <Cloud x={-8} y={3.2} z={-6} speed={0.18} />
      <Cloud x={3} y={4} z={-8} speed={0.12} />
      <Cloud x={9} y={2.6} z={-7} speed={0.15} />
    </>
  );
}

function Bubble({ x, z, delay, speed }: { x: number; z: number; delay: number; speed: number }) {
  const ref = useRef<Mesh>(null);
  const t = useSlowTime();
  useFrame(() => {
    if (!ref.current) return;
    const y = ((t.current * speed + delay) % 8) - 3;
    ref.current.position.set(x + Math.sin(t.current + delay) * 0.2, y, z);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.12, 8, 6]} />
      <meshStandardMaterial color="#eef6fa" transparent opacity={0.55} />
    </mesh>
  );
}

function Fish({ y, z, speed, color, dir }: { y: number; z: number; speed: number; color: string; dir: 1 | -1 }) {
  const ref = useRef<Group>(null);
  const t = useSlowTime();
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.position.x += dt * speed * dir;
    if (ref.current.position.x > 12) ref.current.position.x = -12;
    if (ref.current.position.x < -12) ref.current.position.x = 12;
    ref.current.position.y = y + Math.sin(t.current * 0.7) * 0.2;
  });
  return (
    <group ref={ref} position={[dir * -8, y, z]} scale={[dir, 1, 1]}>
      <mesh>
        <sphereGeometry args={[0.4, 8, 6]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh position={[-0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.28, 0.4, 4]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </group>
  );
}

function Ocean() {
  const water = useRef<Mesh>(null);
  const t = useSlowTime();
  useFrame(() => {
    if (water.current) water.current.position.y = -2.3 + Math.sin(t.current * 0.6) * 0.05;
  });
  const bubbles = useMemo(() => {
    const rng = createRng(5);
    return Array.from({ length: 12 }, () => ({
      x: (rng() - 0.5) * 16,
      z: -2 - rng() * 4,
      delay: rng() * 8,
      speed: 0.35 + rng() * 0.3,
    }));
  }, []);
  return (
    <>
      <mesh ref={water} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 20, 1, 1]} />
        <meshStandardMaterial color="#9fc2d3" />
      </mesh>
      {[-6, -4.5, 5.5].map((x, i) => (
        <mesh key={i} position={[x, -2, -4 - i]} scale={[1.2, 0.8, 1]}>
          <dodecahedronGeometry args={[0.9, 0]} />
          <meshStandardMaterial color="#c7c0b4" flatShading />
        </mesh>
      ))}
      {[-6.6, -6.2, 6.1].map((x, i) => (
        <mesh key={`w${i}`} position={[x, -1, -4.5]} rotation={[0, 0, (i - 1) * 0.15]}>
          <cylinderGeometry args={[0.05, 0.08, 2.4, 5]} />
          <meshStandardMaterial color="#8fb59a" flatShading />
        </mesh>
      ))}
      <Fish y={0.5} z={-5} speed={0.5} color="#e7c9a3" dir={1} />
      <Fish y={1.8} z={-7} speed={0.35} color="#c9bfe0" dir={-1} />
      {bubbles.map((b, i) => (
        <Bubble key={i} {...b} />
      ))}
    </>
  );
}

function Forest() {
  const trees = useMemo(() => {
    const rng = createRng(3);
    return Array.from({ length: 14 }, () => ({
      position: [(rng() - 0.5) * 18, -2.2, -3 - rng() * 6] as [number, number, number],
      scale: 0.9 + rng() * 0.8,
      color: ['#7f9f78', '#8fae86', '#6d8c6a'][Math.floor(rng() * 3)],
    }));
  }, []);
  return (
    <>
      <mesh position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color="#a8bd99" />
      </mesh>
      {trees.map((tr, i) => (
        <Tree key={i} {...tr} />
      ))}
    </>
  );
}

function SpaceScene() {
  const ref = useRef<Group>(null);
  const stars = useMemo(() => {
    const rng = createRng(9);
    return Array.from(
      { length: 80 },
      () => [(rng() - 0.5) * 30, (rng() - 0.3) * 14, -6 - rng() * 6] as [number, number, number],
    );
  }, []);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.01;
  });
  return (
    <group ref={ref}>
      {stars.map((p, i) => (
        <mesh key={i} position={p}>
          <octahedronGeometry args={[0.06, 0]} />
          <meshBasicMaterial color="#e9e6f7" />
        </mesh>
      ))}
      <mesh position={[5, 2.5, -8]}>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshStandardMaterial color="#c8b9d9" flatShading />
      </mesh>
    </group>
  );
}

function Castle() {
  return (
    <>
      <mesh position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color="#c6cdb4" />
      </mesh>
      {[-5.5, -3.5, 4, 6].map((x, i) => (
        <group key={i} position={[x, -2.2, -6]}>
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 2.8, 8]} />
            <meshStandardMaterial color="#d8d2df" flatShading />
          </mesh>
          <mesh position={[0, 3.3, 0]}>
            <coneGeometry args={[0.8, 1.2, 8]} />
            <meshStandardMaterial color="#a79fc0" flatShading />
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
    case 'ocean':
      return <Ocean />;
    case 'forest':
      return <Forest />;
    case 'space':
      return <SpaceScene />;
    case 'garden':
      return <Meadow />;
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
        <fog attach="fog" args={[t.sky, 9, 22]} />
        <hemisphereLight args={['#ffffff', t.ground, 1.1]} />
        <directionalLight position={[4, 6, 5]} intensity={0.9} />
        <SceneContent theme={theme} />
      </Canvas>
    </div>
  );
}
