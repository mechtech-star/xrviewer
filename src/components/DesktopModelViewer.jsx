import { useEffect, useRef, useMemo } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { Box3, Vector3 } from 'three'
import machineUrl from '../models/machine.glb?url'

export default function DesktopModelViewer({ modelUrl, activeAnimation, onAnimationNames }) {
  const group = useRef()
  const url = modelUrl || machineUrl
  const gltf = useGLTF(url)
  const { actions, names } = useAnimations(gltf.animations, group)

  const stableNames = useMemo(() => names ?? [], [names])

  useEffect(() => {
    onAnimationNames?.(stableNames)
  }, [onAnimationNames, stableNames])

  // Center and scale model to fit in view
  useEffect(() => {
    if (!gltf?.scene || !group.current) return

    const box = new Box3().setFromObject(gltf.scene)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())

    // move model so its center is at origin
    group.current.position.set(-center.x, -center.y, -center.z)

    // scale to fit into a ~1.6 unit cube
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const scale = 1.6 / maxDim
    group.current.scale.setScalar(scale)
  }, [gltf])

  useEffect(() => {
    if (!actions) return

    for (const key of Object.keys(actions)) actions[key]?.stop()

    if (!activeAnimation) return

    const next = actions[activeAnimation]
    if (!next) return

    next.reset()
    next.fadeIn(0.12)
    next.play()

    return () => {
      next.fadeOut(0.12)
    }
  }, [actions, activeAnimation])

  return (
    <group ref={group}>
      <primitive object={gltf.scene} />
    </group>
  )
}

useGLTF.preload(machineUrl)
