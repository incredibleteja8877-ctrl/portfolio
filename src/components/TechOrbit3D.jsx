import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, RoundedBox, Text } from '@react-three/drei'

// Real brand colors, not arbitrary — each chip reads as the actual stack.
const CHIPS = [
  { label: 'FLUTTER', color: '#02569B', position: [-2.3, 1.15, -0.4], rotationSpeed: 0.4 },
  { label: 'REACT', color: '#149ECA', position: [2.3, 1.3, 0.1], rotationSpeed: -0.3 },
  { label: 'FIREBASE', color: '#DD8B1A', position: [-2.4, -1.2, -0.1], rotationSpeed: 0.35 },
  { label: 'DART', color: '#0175C2', position: [2.2, -1.3, -0.5], rotationSpeed: -0.45 },
]

function Chip({ label, color, position, rotationSpeed, floatSpeed }) {
  const mesh = useRef(null)

  useFrame((_, delta) => {
    if (mesh.current) mesh.current.rotation.y += delta * rotationSpeed
  })

  return (
    <Float speed={floatSpeed} rotationIntensity={0.3} floatIntensity={0.8}>
      <group ref={mesh} position={position}>
        <RoundedBox args={[1.75, 0.6, 0.2]} radius={0.09} smoothness={4}>
          <meshStandardMaterial color={color} metalness={0.35} roughness={0.35} />
        </RoundedBox>
        <Text
          position={[0, 0, 0.11]}
          fontSize={0.23}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.03}
          fontWeight="bold"
        >
          {label}
        </Text>
      </group>
    </Float>
  )
}

function Scene({ reducedMotion }) {
  const chips = useMemo(
    () => CHIPS.map((c) => ({ ...c, floatSpeed: reducedMotion ? 0 : 1.6 })),
    [reducedMotion],
  )

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />
      <directionalLight position={[-3, -2, 2]} intensity={0.35} color="#d4a017" />
      {chips.map((chip) => (
        <Chip key={chip.label} {...chip} />
      ))}
    </>
  )
}

function TechOrbit3D() {
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div className="hero-3d" aria-hidden="true">
      <Suspense fallback={null}>
        <Canvas
          dpr={[1, 1.6]}
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 0, 7], fov: 40 }}
        >
          <Scene reducedMotion={reducedMotion} />
        </Canvas>
      </Suspense>
    </div>
  )
}

export default TechOrbit3D
