import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { XR } from '@react-three/xr'
import Model from './Model.jsx'
import XRControls from './XRControls.jsx'

export default function XRCanvas({
  store,
  activeAnimation,
  setActiveAnimation,
  animationNames,
  setAnimationNames,
}) {
  return (
    <Canvas
      className="h-full w-full"
      // XR-specific decision:
      // - Provide a sane desktop camera; in XR the headset pose drives the camera.
      camera={{ position: [0, 1.6, 0], fov: 60 }}
      gl={{ antialias: true }}
      dpr={[1, 1.5]}
    >
      <XR store={store}>
        {/*
          XR-specific decision:
          - Keep scene setup inside Canvas/XR so Three owns the render loop.
          - This @react-three/xr version mounts controllers/hands inputs internally.
        */}
        <ambientLight intensity={0.35} />
        <directionalLight position={[2, 4, 2]} intensity={1.1} />

        <Suspense fallback={null}>
          <Model
            activeAnimation={activeAnimation}
            onAnimationNames={setAnimationNames}
          />

          <XRControls
            animationNames={animationNames}
            activeAnimation={activeAnimation}
            setActiveAnimation={setActiveAnimation}
          />
        </Suspense>
      </XR>
    </Canvas>
  )
}
