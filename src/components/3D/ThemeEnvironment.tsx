import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';
import { useDeviceAdapter } from '../../hooks/useDeviceAdapter';

// Animated Swimming Fish Meshes for Underwater Theme
const SwimmingFishGroup: React.FC<{ count: number }> = ({ count }) => {
  const groupRef = useRef<THREE.Group>(null!);

  const fishData = useMemo(() => {
    return [...Array(count)].map((_, i) => ({
      initialPos: new THREE.Vector3(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 14
      ),
      speed: 0.8 + Math.random() * 0.7,
      scale: 0.2 + Math.random() * 0.2,
      phase: i * 0.5
    }));
  }, [count]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    groupRef.current.children.forEach((fish, i) => {
      const data = fishData[i];
      if (!data) return;
      fish.position.x = data.initialPos.x + Math.sin(time * data.speed + data.phase) * 4;
      fish.position.y = data.initialPos.y + Math.cos(time * data.speed * 0.7 + data.phase) * 1.5;
      fish.rotation.y = Math.cos(time * data.speed + data.phase) > 0 ? 0 : Math.PI;
      fish.rotation.z = Math.sin(time * 3 + data.phase) * 0.15;
    });
  });

  return (
    <group ref={groupRef}>
      {fishData.map((f, idx) => (
        <group key={idx} position={f.initialPos} scale={f.scale}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.5, 1.4, 8]} />
            <meshStandardMaterial color="#00ffff" emissive="#0088cc" emissiveIntensity={0.5} roughness={0.2} />
          </mesh>
          <mesh position={[-0.8, 0, 0]}>
            <boxGeometry args={[0.4, 0.6, 0.05]} />
            <meshBasicMaterial color="#00ffaa" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Animated Fluttering Butterflies for Garden Theme
const FlutteringButterfliesGroup: React.FC<{ count: number }> = ({ count }) => {
  const groupRef = useRef<THREE.Group>(null!);

  const butterflyData = useMemo(() => {
    return [...Array(count)].map((_, i) => ({
      initialPos: new THREE.Vector3(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 8 + 1,
        (Math.random() - 0.5) * 12
      ),
      speed: 1.2 + Math.random() * 0.8,
      color: ['#ff7700', '#ff00aa', '#00ffaa', '#ffcc00'][i % 4]
    }));
  }, [count]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    groupRef.current.children.forEach((b, i) => {
      const data = butterflyData[i];
      if (!data) return;
      b.position.x = data.initialPos.x + Math.sin(time * data.speed) * 2.5;
      b.position.y = data.initialPos.y + Math.sin(time * 3 + i) * 0.8;
      b.position.z = data.initialPos.z + Math.cos(time * data.speed) * 2.5;
      b.rotation.y = time * data.speed;
    });
  });

  return (
    <group ref={groupRef}>
      {butterflyData.map((b, idx) => (
        <group key={idx} position={b.initialPos} scale={0.18}>
          <mesh position={[-0.3, 0, 0]} rotation={[0, 0, 0.2]}>
            <planeGeometry args={[0.8, 0.6]} />
            <meshBasicMaterial color={b.color} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.3, 0, 0]} rotation={[0, 0, -0.2]}>
            <planeGeometry args={[0.8, 0.6]} />
            <meshBasicMaterial color={b.color} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Central Glowing Sun Mesh for Solar System Theme
const GlowingSunCore: React.FC = () => {
  const sunRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={sunRef}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial color="#ffaa00" />
      </mesh>
      <mesh scale={1.4}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial color="#ff4400" transparent opacity={0.2} wireframe />
      </mesh>
      <pointLight color="#ffbb00" intensity={4.5} distance={40} />
    </group>
  );
};

// Floating Books with Glowing Runes for Ancient Library Theme
const FloatingLibraryBooks: React.FC<{ count: number }> = ({ count }) => {
  const groupRef = useRef<THREE.Group>(null!);

  const bookData = useMemo(() => {
    return [...Array(count)].map((_, i) => ({
      initialPos: new THREE.Vector3(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 12
      ),
      rotSpeed: 0.3 + Math.random() * 0.4,
      phase: i * 0.7
    }));
  }, [count]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    groupRef.current.children.forEach((book, i) => {
      const data = bookData[i];
      if (!data) return;
      book.position.y = data.initialPos.y + Math.sin(time * 1.5 + data.phase) * 0.6;
      book.rotation.y = time * data.rotSpeed;
      book.rotation.z = Math.sin(time + data.phase) * 0.1;
    });
  });

  return (
    <group ref={groupRef}>
      {bookData.map((b, idx) => (
        <group key={idx} position={b.initialPos} scale={0.4}>
          <mesh>
            <boxGeometry args={[1.2, 0.3, 1.6]} />
            <meshStandardMaterial color="#78350f" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[1.1, 0.26, 1.5]} />
            <meshBasicMaterial color="#fffbeb" />
          </mesh>
          <pointLight color="#f59e0b" intensity={0.8} distance={3} />
        </group>
      ))}
    </group>
  );
};

// Main 3D Theme World Renderer Component
export const ThemeEnvironment: React.FC = () => {
  const { currentTheme } = useTheme();
  const graphics = useDeviceAdapter();
  const particlesRef = useRef<THREE.Points>(null!);

  const particleGeometry = useMemo(() => {
    const count = graphics.particleCount;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 45;
      positions[i + 1] = (Math.random() - 0.5) * 45;
      positions[i + 2] = (Math.random() - 0.5) * 45;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [graphics.particleCount]);

  useFrame((state) => {
    if (!particlesRef.current) return;
    const time = state.clock.getElapsedTime();

    if (currentTheme.id === 'abyssal_ocean') {
      const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] += 0.04;
        if (pos[i] > 22) pos[i] = -22;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    } else if (currentTheme.id === 'snow_mountain') {
      const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] -= 0.06;
        if (pos[i] < -22) pos[i] = 22;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    } else {
      particlesRef.current.rotation.y = time * 0.02;
    }
  });

  return (
    <>
      <color attach="background" args={[currentTheme.fogColor || '#030712']} />
      <fog attach="fog" args={[currentTheme.fogColor || '#030712', 12, 45]} />

      <ambientLight color={currentTheme.ambientLightColor || '#1e1b4b'} intensity={currentTheme.lightIntensity || 1.5} />
      <directionalLight position={[10, 15, 10]} intensity={2.0} color={currentTheme.accentColor} />
      <pointLight position={[-10, -10, -10]} intensity={1.2} color="#ffffff" />

      <points ref={particlesRef} geometry={particleGeometry}>
        <pointsMaterial
          size={graphics.isMobile ? 0.16 : 0.12}
          color={currentTheme.particleColor}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {currentTheme.id === 'abyssal_ocean' && <SwimmingFishGroup count={graphics.isMobile ? 5 : 12} />}
      {(currentTheme.id === 'garden' || currentTheme.id === 'rainforest') && <FlutteringButterfliesGroup count={graphics.isMobile ? 6 : 14} />}
      {currentTheme.id === 'solar_system' && <GlowingSunCore />}
      {currentTheme.id === 'ancient_library' && <FloatingLibraryBooks count={graphics.isMobile ? 4 : 10} />}
    </>
  );
};
