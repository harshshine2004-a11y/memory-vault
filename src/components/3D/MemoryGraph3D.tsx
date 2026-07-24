import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ChevronLeft, ChevronRight, Maximize2, Sparkles, X, Edit3 } from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { useTheme } from '../../context/ThemeContext';
import { useDeviceAdapter } from '../../hooks/useDeviceAdapter';
import { ThemeEnvironment } from './ThemeEnvironment';
import type { MemoryNode, PhotoBranch } from '../../types';

// Adaptive Camera Controller for Desktop, Tablet & Mobile Auto-Focus Focus
const CameraController: React.FC = () => {
  const { targetCameraPosition } = useVault();
  const { camera } = useThree();
  const graphics = useDeviceAdapter();
  const targetPos = useRef<THREE.Vector3 | null>(null);

  React.useEffect(() => {
    if (targetCameraPosition) {
      const zOffset = graphics.isMobile ? 10 : 7.5;
      targetPos.current = new THREE.Vector3(
        targetCameraPosition[0],
        targetCameraPosition[1],
        targetCameraPosition[2] + zOffset
      );
    }
  }, [targetCameraPosition, graphics.isMobile]);

  useFrame((_, delta) => {
    if (targetPos.current) {
      camera.position.lerp(targetPos.current, delta * 3.5);
      if (camera.position.distanceTo(targetPos.current) < 0.1) {
        targetPos.current = null;
      }
    }
  });

  return null;
};

// Radial Photo Branch Spoke Component
const RadialPhotoBranch: React.FC<{
  branch: PhotoBranch;
  index: number;
  totalBranches: number;
  nodeColor: string;
  onSelectPhoto: (photo: PhotoBranch) => void;
}> = ({ branch, index, totalBranches, nodeColor, onSelectPhoto }) => {
  const [hovered, setHovered] = useState(false);
  const { currentTheme } = useTheme();
  const graphics = useDeviceAdapter();

  const { targetPos, linePoints } = useMemo(() => {
    const angle = (index / (totalBranches || 1)) * Math.PI * 2;
    const elevationAngle = (index % 2 === 0 ? 0.35 : -0.35);
    const radius = graphics.isMobile ? 3.2 : 4.2;

    const bx = Math.cos(angle) * radius * Math.cos(elevationAngle);
    const by = Math.sin(elevationAngle) * (radius * 0.85);
    const bz = Math.sin(angle) * radius * Math.cos(elevationAngle);

    const pos: [number, number, number] = [bx, by, bz];
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(bx, by, bz)];
    return { targetPos: pos, linePoints: points };
  }, [index, totalBranches, graphics.isMobile]);

  return (
    <group>
      <line>
        <bufferGeometry
          attach="geometry"
          onUpdate={(geo) => geo.setFromPoints(linePoints)}
        />
        <lineBasicMaterial
          attach="material"
          color={hovered ? '#ffffff' : (nodeColor || currentTheme.accentColor)}
          transparent
          opacity={hovered ? 0.95 : 0.45}
          linewidth={hovered ? 2 : 1}
        />
      </line>

      <Html
        distanceFactor={graphics.isMobile ? 15 : 13}
        position={targetPos}
        center
        className="pointer-events-auto select-none"
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectPhoto(branch);
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`flex items-center gap-2 p-1.5 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-xl border ${
            hovered
              ? 'bg-slate-950/95 border-cyan-400 text-white scale-110 shadow-[0_0_25px_rgba(0,240,255,0.6)] z-30'
              : 'bg-slate-950/80 border-white/20 text-slate-200 hover:border-white/40 shadow-lg'
          }`}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-white/20 shrink-0 bg-slate-900 shadow-inner">
            <img
              src={branch.thumbnailUrl || branch.url}
              alt={branch.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="pr-2 max-w-[110px] sm:max-w-[140px] truncate">
            <p className="text-[10px] sm:text-[11px] font-bold truncate leading-tight">{branch.title}</p>
            <span className="text-[8px] sm:text-[9px] font-mono text-cyan-300 opacity-80">
              #{index + 1} • {branch.aiTags[0] || 'Photo'}
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
};

// Node Touch / Click Photo Swiper Popup Card
const NodePhotoSwiperPopup: React.FC<{
  node: MemoryNode;
  onClose: () => void;
  onSelectPhoto: (photo: PhotoBranch) => void;
  onEditNode: (node: MemoryNode) => void;
}> = ({ node, onClose, onSelectPhoto, onEditNode }) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const graphics = useDeviceAdapter();

  if (!node.branches || node.branches.length === 0) return null;

  const currentPhoto = node.branches[photoIndex] || node.branches[0];

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev === 0 ? node.branches.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev === node.branches.length - 1 ? 0 : prev + 1));
  };

  return (
    <Html distanceFactor={graphics.isMobile ? 13 : 11} position={[0, 2.6, 0]} center className="pointer-events-auto select-none z-50">
      <div className="w-64 sm:w-72 p-3 sm:p-3.5 rounded-3xl bg-slate-950/95 border-2 border-cyan-400 backdrop-blur-2xl shadow-[0_0_35px_rgba(0,240,255,0.4)] text-white space-y-2.5 animate-float">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="truncate max-w-[120px]">{node.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditNode(node);
              }}
              title="Rename Node"
              className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:text-white hover:bg-cyan-500 transition-all ml-0.5"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden border border-white/20 group bg-slate-900 flex items-center justify-center">
          <img
            src={currentPhoto.url || currentPhoto.thumbnailUrl}
            alt={currentPhoto.title}
            className="w-full h-full object-cover"
          />

          <button
            onClick={handlePrevPhoto}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/80 hover:bg-cyan-500 border border-white/30 text-white shadow-lg transition-all active:scale-95"
            title="Previous Photo"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleNextPhoto}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/80 hover:bg-cyan-500 border border-white/30 text-white shadow-lg transition-all active:scale-95"
            title="Next Photo (Swipe)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-white/20">
            Photo {photoIndex + 1} of {node.branches.length}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <p className="font-semibold text-slate-200 truncate pr-2 max-w-[140px]">{currentPhoto.title}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectPhoto(currentPhoto);
            }}
            className="p-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-white border border-cyan-500/40 transition-all flex items-center gap-1 text-[11px] font-bold shrink-0"
          >
            <Maximize2 className="w-3 h-3" /> View
          </button>
        </div>
      </div>
    </Html>
  );
};

// Central 3D Memory Node Component
const GraphNodeMesh: React.FC<{
  node: MemoryNode;
  isSelected: boolean;
  onSelect: (node: MemoryNode) => void;
  onEditNode: (node: MemoryNode) => void;
  onLongPressNode: (node: MemoryNode) => void;
  onDoubleTapNode: (node: MemoryNode) => void;
}> = ({ node, isSelected, onSelect, onEditNode, onLongPressNode, onDoubleTapNode }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const { currentTheme } = useTheme();
  const graphics = useDeviceAdapter();
  const { selectPhoto, selectNode } = useVault();
  const touchTimer = useRef<any>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.x += delta * 0.2;
    }
  });

  const renderGeometry = () => {
    switch (node.geometryShape) {
      case 'octahedron':
        return <octahedronGeometry args={[0.95, 0]} />;
      case 'torus':
        return <torusGeometry args={[0.75, 0.28, 16, 32]} />;
      case 'crystal':
        return <dodecahedronGeometry args={[0.9, 0]} />;
      case 'icosahedron':
        return <icosahedronGeometry args={[0.95, 0]} />;
      case 'sphere':
      default:
        return <sphereGeometry args={[0.9, 32, 32]} />;
    }
  };

  const renderMaterial = () => {
    const baseColor = hovered ? '#ffffff' : (isSelected ? currentTheme.accentColor : node.color);

    if (currentTheme.nodeMaterial === 'wireframe') {
      return <meshBasicMaterial color={baseColor} wireframe />;
    }
    if (currentTheme.nodeMaterial === 'gold') {
      return <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />;
    }
    if (currentTheme.nodeMaterial === 'glass') {
      return <meshPhysicalMaterial color={baseColor} transmission={0.7} roughness={0.1} thickness={0.5} transparent opacity={0.85} />;
    }
    if (currentTheme.nodeMaterial === 'crystal') {
      return <meshPhysicalMaterial color={baseColor} roughness={0.05} metalness={0.8} clearcoat={1} />;
    }
    return <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={isSelected || hovered ? 0.7 : 0.3} roughness={0.3} metalness={0.5} />;
  };

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node);
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          touchTimer.current = setTimeout(() => {
            onLongPressNode(node);
          }, 500);
        }}
        onPointerUp={() => {
          if (touchTimer.current) clearTimeout(touchTimer.current);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onDoubleTapNode(node);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => {
          if (touchTimer.current) clearTimeout(touchTimer.current);
          setHovered(false);
        }}
        scale={isSelected ? 1.4 : (hovered ? 1.25 : 1)}
      >
        {renderGeometry()}
        {renderMaterial()}
      </mesh>

      <mesh scale={isSelected ? 1.8 : 1.45}>
        <sphereGeometry args={[1.0, 16, 16]} />
        <meshBasicMaterial
          color={node.color}
          transparent
          opacity={hovered || isSelected ? 0.35 : 0.12}
          wireframe
        />
      </mesh>

      <Html distanceFactor={graphics.isMobile ? 15 : 13} position={[0, -1.6, 0]} center>
        <div
          onClick={() => onSelect(node)}
          className={`px-3 sm:px-3.5 py-1.5 rounded-2xl cursor-pointer transition-all duration-300 select-none whitespace-nowrap text-xs font-bold flex items-center gap-2 border ${
            isSelected
              ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 shadow-[0_0_20px_rgba(0,240,255,0.6)] backdrop-blur-xl scale-110'
              : hovered
              ? 'bg-slate-900/95 border-white/50 text-white backdrop-blur-md shadow-xl scale-105'
              : 'bg-slate-950/85 border-white/15 text-slate-200 backdrop-blur-md'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: node.color }} />
          <span>{node.title}</span>
          <span className="text-[10px] font-mono opacity-70">({node.branches.length} photos)</span>
        </div>
      </Html>

      {isSelected && (
        <NodePhotoSwiperPopup
          node={node}
          onClose={() => selectNode(null)}
          onSelectPhoto={selectPhoto}
          onEditNode={onEditNode}
        />
      )}

      {node.branches.map((branch: PhotoBranch, idx: number) => (
        <RadialPhotoBranch
          key={branch.id}
          branch={branch}
          index={idx}
          totalBranches={node.branches.length}
          nodeColor={node.color}
          onSelectPhoto={selectPhoto}
        />
      ))}
    </group>
  );
};

// Distinct Node-to-Node Interconnection Beams with Pulse Particles & Laser Styling
const DistinctNodeBeams: React.FC<{ nodes: MemoryNode[] }> = ({ nodes }) => {
  const pulseRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (pulseRef.current) {
      const time = state.clock.getElapsedTime();
      pulseRef.current.children.forEach((child, idx) => {
        const mesh = child as THREE.Mesh;
        const progress = (time * 0.4 + idx * 0.3) % 1;
        const start = mesh.userData.start as THREE.Vector3;
        const end = mesh.userData.end as THREE.Vector3;
        if (start && end) {
          mesh.position.lerpVectors(start, end, progress);
        }
      });
    }
  });

  return (
    <group>
      {nodes.map(node => {
        return node.connectedTo.map(targetId => {
          const targetNode = nodes.find(n => n.id === targetId);
          if (!targetNode) return null;

          const startVec = new THREE.Vector3(...node.position);
          const endVec = new THREE.Vector3(...targetNode.position);
          const midVec = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
          const points = [startVec, endVec];

          return (
            <group key={`beam-${node.id}-${targetId}`}>
              <line>
                <bufferGeometry
                  attach="geometry"
                  onUpdate={(geo) => geo.setFromPoints(points)}
                />
                <lineBasicMaterial
                  attach="material"
                  color="#00f0ff"
                  transparent
                  opacity={0.8}
                  linewidth={3}
                />
              </line>

              <line>
                <bufferGeometry
                  attach="geometry"
                  onUpdate={(geo) => geo.setFromPoints(points)}
                />
                <lineBasicMaterial
                  attach="material"
                  color="#ff00ff"
                  transparent
                  opacity={0.4}
                  linewidth={6}
                />
              </line>

              <Html distanceFactor={14} position={[midVec.x, midVec.y, midVec.z]} center>
                <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600/90 to-cyan-500/90 text-white font-mono text-[9px] font-bold border border-cyan-300/50 shadow-[0_0_12px_rgba(0,240,255,0.5)] backdrop-blur-md whitespace-nowrap">
                  ⚡ LINK {node.title.charAt(0)}↔{targetNode.title.charAt(0)}
                </div>
              </Html>
            </group>
          );
        });
      })}

      <group ref={pulseRef}>
        {nodes.flatMap(node =>
          node.connectedTo.map((targetId, i) => {
            const targetNode = nodes.find(n => n.id === targetId);
            if (!targetNode) return null;
            const start = new THREE.Vector3(...node.position);
            const end = new THREE.Vector3(...targetNode.position);

            return (
              <mesh
                key={`pulse-${node.id}-${targetId}-${i}`}
                userData={{ start, end }}
                scale={0.25}
              >
                <sphereGeometry args={[0.8, 16, 16]} />
                <meshBasicMaterial color="#00f0ff" />
              </mesh>
            );
          })
        )}
      </group>
    </group>
  );
};

export const MemoryGraph3D: React.FC<{
  onEditNode?: (node: MemoryNode) => void;
  onLongPressNode?: (node: MemoryNode) => void;
  onDoubleTapNode?: (node: MemoryNode) => void;
}> = ({ onEditNode, onLongPressNode, onDoubleTapNode }) => {
  const { nodes, selectedNode, selectNode, entranceState } = useVault();
  const graphics = useDeviceAdapter();
  const isAuthPage = entranceState.stage === 'auth';

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 4, graphics.isMobile ? 24 : 20], fov: graphics.fov }}
        gl={{ antialias: graphics.antialias, alpha: true }}
        dpr={graphics.pixelRatio}
      >
        <ThemeEnvironment />

        {!isAuthPage && (
          <>
            <CameraController />
            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              maxDistance={graphics.isMobile ? 40 : 50}
              minDistance={3}
              touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
            />
            
            <DistinctNodeBeams nodes={nodes} />

            {nodes.map(node => (
              <GraphNodeMesh
                key={node.id}
                node={node}
                isSelected={selectedNode?.id === node.id}
                onSelect={selectNode}
                onEditNode={(n) => onEditNode && onEditNode(n)}
                onLongPressNode={(n) => onLongPressNode && onLongPressNode(n)}
                onDoubleTapNode={(n) => onDoubleTapNode && onDoubleTapNode(n)}
              />
            ))}
          </>
        )}
      </Canvas>
    </div>
  );
};
