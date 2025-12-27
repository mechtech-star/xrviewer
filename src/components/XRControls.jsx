import { useMemo } from 'react'
import { Interactive } from '@react-three/xr'
import { Text } from '@react-three/drei'

function ClipButton({ label, active, position, onSelect }) {
  return (
    <Interactive onSelect={onSelect}>
      <group position={position} scale={active ? 1.06 : 1}>
        <mesh
          // Desktop fallback (mouse): keeps controls usable outside XR.
          onClick={(e) => {
            e.stopPropagation()
            onSelect?.()
          }}
        >
          <boxGeometry args={[0.28, 0.08, 0.02]} />
          {/* XR-specific decision: wireframe avoids dependence on theme colors. */}
          <meshBasicMaterial wireframe transparent opacity={active ? 0.9 : 0.6} />
        </mesh>
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.035}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </group>
    </Interactive>
  )
}

export default function XRControls({
  animationNames,
  activeAnimation,
  setActiveAnimation,
}) {
  const names = useMemo(() => animationNames ?? [], [animationNames])

  if (names.length === 0) return null

  // XR-specific decision:
  // - Put controls in-world so they are usable in headsets without relying on DOM overlays.
  // - Keep them near eye level and ~1m away to be comfortable to target.
  return (
    <group position={[0, 1.35, -1.0]}>
      <Text
        position={[0, 0.12, 0.02]}
        fontSize={0.04}
        anchorX="center"
        anchorY="middle"
      >
        Animations
      </Text>

      <group position={[0, -0.02, 0.03]}>
        {names.slice(0, 6).map((name, i) => (
          <ClipButton
            key={name}
            label={name}
            active={activeAnimation === name}
            position={[-0.31 + (i % 3) * 0.31, 0.06 - Math.floor(i / 3) * 0.12, 0]}
            onSelect={() => setActiveAnimation(name)}
          />
        ))}

        <ClipButton
          label="Stop"
          active={!activeAnimation}
          position={[0.31, -0.18, 0]}
          onSelect={() => setActiveAnimation(null)}
        />
      </group>
    </group>
  )
}
