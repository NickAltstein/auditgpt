'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Torus } from '@react-three/drei';
import type { Mesh, Group } from 'three';

function MakroSphere() {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);

  useFrame(({ clock, pointer }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.08;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.12;
    }
    if (groupRef.current) {
      // Subtle parallax response to mouse cursor
      groupRef.current.rotation.y = pointer.x * 0.2;
      groupRef.current.rotation.x = -pointer.y * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2.5} rotationIntensity={0.5} floatIntensity={0.9}>
        {/* Core Makro Organic Lavender/Sky Iridescent Translucent Sphere */}
        <Sphere ref={meshRef} args={[1, 64, 64]} scale={2.4}>
          <MeshDistortMaterial
            color="#ffffff"
            attach="material"
            distort={0.4}
            speed={2.0}
            roughness={0.1}
            metalness={0.08}
            emissive="#c0adff"
            emissiveIntensity={0.25}
            transparent
            opacity={0.92}
            clearcoat={0.95}
            clearcoatRoughness={0.08}
          />
        </Sphere>
      </Float>
    </group>
  );
}

function SatelliteNodes() {
  const ringRef = useRef<Group>(null);
  const torusRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.05;
      ringRef.current.rotation.y = clock.getElapsedTime() * 0.03;
    }
    if (torusRef.current) {
      torusRef.current.rotation.x = clock.getElapsedTime() * 0.08;
      torusRef.current.rotation.y = clock.getElapsedTime() * 0.06;
    }
  });

  return (
    <group ref={ringRef}>
      {/* Node 1: Makro Lime Accent (#d9ff5c) */}
      <mesh position={[3.2, 1.3, -0.8]}>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshStandardMaterial color="#d9ff5c" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Node 2: Makro Sky Blue Accent (#b8deff) */}
      <mesh position={[-3.2, -1.5, 0.4]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#b8deff" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Node 3: Makro Coral/Peach Warm Accent (#fae9e6) */}
      <mesh position={[1.8, -2.8, -0.5]}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color="#fae9e6" roughness={0.3} />
      </mesh>

      {/* Makro Floating Orbiting Torus Ring */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.6}>
        <Torus ref={torusRef} args={[3.6, 0.025, 16, 100]} rotation={[1.1, 0.4, 0]}>
          <meshStandardMaterial color="#c0adff" transparent opacity={0.5} roughness={0.2} />
        </Torus>
      </Float>
    </group>
  );
}

export function MakroHeroCanvas() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 -top-20 z-0 h-[720px] w-full overflow-hidden opacity-75 sm:opacity-90">
      <Canvas camera={{ position: [0, 0, 6.2], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={1.8} color="#ffffff" />
        <directionalLight position={[6, 8, 5]} intensity={2.4} color="#ffffff" />
        <directionalLight position={[-5, -4, -3]} intensity={1.2} color="#c0adff" />
        <pointLight position={[3, -2, 3]} intensity={1.5} color="#b8deff" />
        <pointLight position={[-3, 2, 2]} intensity={1.2} color="#d9ff5c" />
        <MakroSphere />
        <SatelliteNodes />
      </Canvas>
    </div>
  );
}
