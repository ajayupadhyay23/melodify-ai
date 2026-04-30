"use client";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Torus } from "@react-three/drei";
import * as THREE from "three";

function FloatingOrb({ position, color, speed = 1, distort = 0.4, size = 1 }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2 * speed;
    }
  });

  return (
    <Float speed={speed * 1.5} rotationIntensity={0.4} floatIntensity={1.5}>
      <Sphere ref={meshRef} args={[size, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.8}
          distort={distort}
          speed={2}
          transparent
          opacity={0.7}
        />
      </Sphere>
    </Float>
  );
}

function FloatingRing({ position, color, speed = 1 }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.3 * speed) * 0.5 + 0.5;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.15 * speed;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.6} floatIntensity={1}>
      <Torus
        ref={meshRef}
        args={[1.2, 0.05, 16, 100]}
        position={position}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </Torus>
    </Float>
  );
}

function ParticleField() {
  const count = 200;
  const particlesRef = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  const colors = useMemo(() => {
    const cols = new Float32Array(count * 3);
    const palette = [
      new THREE.Color("#8b5cf6"),
      new THREE.Color("#06d6a0"),
      new THREE.Color("#f472b6"),
    ];
    for (let i = 0; i < count; i++) {
      const color = palette[Math.floor(Math.random() * palette.length)];
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;
    }
    return cols;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function Scene3D() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#8b5cf6" />
        <pointLight position={[-5, -3, 3]} intensity={0.5} color="#06d6a0" />
        <pointLight position={[0, 5, -5]} intensity={0.4} color="#f472b6" />

        <FloatingOrb
          position={[-3.5, 1.5, -2]}
          color="#8b5cf6"
          speed={0.8}
          distort={0.5}
          size={0.8}
        />
        <FloatingOrb
          position={[3.5, -1, -1]}
          color="#06d6a0"
          speed={0.6}
          distort={0.3}
          size={0.6}
        />
        <FloatingOrb
          position={[1, 2.5, -3]}
          color="#f472b6"
          speed={1}
          distort={0.6}
          size={0.5}
        />
        <FloatingOrb
          position={[-2, -2.5, -2]}
          color="#06d6a0"
          speed={0.7}
          distort={0.4}
          size={0.4}
        />

        <FloatingRing position={[-1.5, 0.5, -1]} color="#8b5cf6" speed={0.5} />
        <FloatingRing position={[2, 1, -2]} color="#06d6a0" speed={0.7} />

        <ParticleField />
      </Canvas>
    </div>
  );
}
