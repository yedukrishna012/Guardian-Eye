import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, Stars } from '@react-three/drei'
import { MathUtils } from 'three'

function OrbitingNode({ radius = 2.6, speed = 0.18, offset = 0, color = '#22D3EE', size = 0.055 }) {
  const ref = useRef(null)

  useFrame((state) => {
    if (!ref.current) return
    const time = state.clock.getElapsedTime() * speed + offset
    ref.current.position.set(
      Math.cos(time) * radius,
      Math.sin(time * 1.35) * 0.55,
      Math.sin(time) * radius,
    )
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

function GuardianCore({ reducedMotion }) {
  const group = useRef(null)

  useFrame((state, delta) => {
    if (!group.current || reducedMotion) return

    group.current.rotation.y = MathUtils.damp(
      group.current.rotation.y,
      state.pointer.x * 0.5,
      3.2,
      delta,
    )
    group.current.rotation.x = MathUtils.damp(
      group.current.rotation.x,
      -state.pointer.y * 0.32,
      3.2,
      delta,
    )
  })

  return (
    <group ref={group}>
      <Float
        speed={reducedMotion ? 0 : 1.5}
        rotationIntensity={reducedMotion ? 0 : 0.45}
        floatIntensity={reducedMotion ? 0 : 0.9}
      >
        <Sphere args={[1, 64, 64]} scale={1.85}>
          <MeshDistortMaterial
            color="#1D4ED8"
            distort={0.36}
            speed={1.35}
            roughness={0.24}
            metalness={0.62}
            emissive="#0EA5E9"
            emissiveIntensity={0.18}
          />
        </Sphere>

        <mesh scale={2.12}>
          <sphereGeometry args={[1, 22, 22]} />
          <meshBasicMaterial color="#22D3EE" wireframe transparent opacity={0.09} />
        </mesh>
      </Float>

      <mesh rotation={[Math.PI / 2.15, 0.1, 0.15]}>
        <torusGeometry args={[2.45, 0.012, 16, 180]} />
        <meshBasicMaterial color="#22D3EE" transparent opacity={0.5} />
      </mesh>

      <mesh rotation={[Math.PI / 1.72, 0.45, -0.35]}>
        <torusGeometry args={[2.82, 0.006, 16, 180]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.34} />
      </mesh>

      <OrbitingNode radius={2.55} speed={0.22} offset={0} color="#22D3EE" />
      <OrbitingNode radius={2.8} speed={-0.16} offset={2.1} color="#A78BFA" size={0.045} />
      <OrbitingNode radius={2.35} speed={0.28} offset={4.2} color="#60A5FA" size={0.04} />

      <pointLight position={[0, 0, 0]} intensity={2.2} distance={5} color="#38BDF8" />
    </group>
  )
}

export default function HeroScene({ reducedMotion = false }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6.6], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 2]} intensity={1.5} color="#3B82F6" />
      <directionalLight position={[-4, -2, 3]} intensity={0.7} color="#A78BFA" />
      <GuardianCore reducedMotion={reducedMotion} />
      <Stars
        radius={80}
        depth={45}
        count={1600}
        factor={3.2}
        saturation={0}
        fade
        speed={reducedMotion ? 0 : 0.35}
      />
    </Canvas>
  )
}
