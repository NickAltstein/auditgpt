'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Icosahedron, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import type { Mesh, Group, Points as ThreePoints } from 'three';

interface OrbMeshProps {
  isScanning?: boolean;
}

function GeodesicWireframe({ isScanning }: OrbMeshProps) {
  const meshRef = useRef<Mesh>(null);
  const innerRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const speedMultiplier = isScanning ? 4.0 : 1.0;

    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.12 * speedMultiplier;
      meshRef.current.rotation.y = time * 0.18 * speedMultiplier;

      // Color shift interpolation between Electric Violet and Neon Cyan
      const colorProgress = (Math.sin(time * 0.8) + 1) / 2;
      const violet = new THREE.Color('#7000FF');
      const cyan = new THREE.Color('#00F0FF');
      const currentColor = violet.clone().lerp(cyan, colorProgress);

      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.color = currentColor;
      }
    }

    if (innerRef.current) {
      innerRef.current.rotation.x = -time * 0.15 * speedMultiplier;
      innerRef.current.rotation.z = time * 0.2 * speedMultiplier;
    }
  });

  return (
    <group>
      {/* Outer Geodesic Wireframe */}
      <Icosahedron ref={meshRef} args={[2.0, 2]} scale={isScanning ? 2.3 : 2.1}>
        <meshBasicMaterial
          color="#7000FF"
          wireframe
          transparent
          opacity={isScanning ? 0.85 : 0.45}
        />
      </Icosahedron>

      {/* Inner Density Core */}
      <Icosahedron ref={innerRef} args={[1.2, 1]}>
        <meshBasicMaterial
          color="#00F0FF"
          wireframe
          transparent
          opacity={isScanning ? 0.9 : 0.35}
        />
      </Icosahedron>
    </group>
  );
}

function ParticleField({ isScanning }: OrbMeshProps) {
  const pointsRef = useRef<ThreePoints>(null);

  // Generate 450 spherical point-cloud particles
  const positions = useMemo(() => {
    const count = 450;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 2.4 + Math.random() * 1.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.05;
      pointsRef.current.rotation.x = time * 0.03;

      if (isScanning) {
        const pulse = 1 + Math.sin(time * 12) * 0.15;
        pointsRef.current.scale.set(pulse, pulse, pulse);
      } else {
        pointsRef.current.scale.set(1, 1, 1);
      }
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#00F0FF"
        size={0.045}
        sizeAttenuation
        depthWrite={false}
        opacity={isScanning ? 0.9 : 0.6}
      />
    </Points>
  );
}

function OrbScene({ isScanning }: OrbMeshProps) {
  const groupRef = useRef<Group>(null);

  useFrame(({ pointer }) => {
    if (groupRef.current) {
      // Parallax tracking based on mouse pointer
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.45, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -pointer.y * 0.45, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.8}>
        <GeodesicWireframe isScanning={isScanning} />
        <ParticleField isScanning={isScanning} />
      </Float>
    </group>
  );
}

export function ForensicOrb({ isScanning = false }: { isScanning?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 -top-16 z-0 h-[680px] w-full overflow-hidden opacity-90">
      <Canvas camera={{ position: [0, 0, 5.8], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.8} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#7000FF" />
        <pointLight position={[-5, -5, -5]} intensity={1.5} color="#00F0FF" />
        <OrbScene isScanning={isScanning} />
      </Canvas>
    </div>
  );
}
