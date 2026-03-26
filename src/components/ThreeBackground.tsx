import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const FloatingGeometry = ({ position, color, speed }: { position: [number, number, number]; color: string; speed: number }) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    meshRef.current.rotation.x = t * 0.4;
    meshRef.current.rotation.y = t * 0.6;
    meshRef.current.position.y = position[1] + Math.sin(t) * 0.3;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial color={color} transparent opacity={0.15} wireframe />
    </mesh>
  );
};

const FloatingSpheres = () => {
  const points = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < 8; i++) {
      arr.push([
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4 - 2,
      ]);
    }
    return arr;
  }, []);

  const colors = ["#7c3aed", "#06b6d4", "#8b5cf6", "#0ea5e9"];

  return (
    <>
      {points.map((pos, i) => (
        <FloatingGeometry
          key={i}
          position={pos}
          color={colors[i % colors.length]}
          speed={0.3 + Math.random() * 0.5}
        />
      ))}
    </>
  );
};

const ThreeBackground = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-60">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#7c3aed" />
        <pointLight position={[-5, -5, 3]} intensity={0.5} color="#06b6d4" />
        <FloatingSpheres />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
