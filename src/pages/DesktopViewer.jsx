import React, { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import DesktopModelViewer from '../components/DesktopModelViewer.jsx'
import EnterXR from '../components/EnterXR.jsx'
import { Button } from '@/components/ui/button'

export default function DesktopViewer({ models, selectedModelId, modelUrl, xrStore, activeAnimation, setActiveAnimation, animationNames }) {
  const current = models.find((m) => m.id === selectedModelId) || models[0]
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => window.history.back()}>Back</Button>
            <div className="text-sm text-foreground">{current?.name}</div>
          </div>

          <div className="flex items-center gap-3">
            <EnterXR store={xrStore} />
          </div>
        </div>

          <div className="rounded-2xl border bg-card p-4">
          <div className="h-[64vh] w-full rounded bg-gradient-to-b from-primary/80 to-secondary/80">
            <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
              <ambientLight intensity={0.6} />
              <directionalLight castShadow position={[5, 5, 5]} intensity={1} />
              <Suspense fallback={<Html center>Loading...</Html>}>
                <DesktopModelViewer modelUrl={modelUrl} activeAnimation={activeAnimation} onAnimationNames={() => {}} />
              </Suspense>
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            </Canvas>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {Array.isArray(animationNames) && animationNames.length > 0 ? (
                <select className="rounded bg-background/20 px-2 py-1 text-sm text-foreground" value={activeAnimation || ''} onChange={(e) => setActiveAnimation(e.target.value || null)}>
                  <option value="">Stop</option>
                  {animationNames.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              ) : (
                <div className="text-sm text-muted-foreground">No animations</div>
              )}
            </div>

            <div className="text-sm text-muted-foreground">Drag to rotate, scroll to zoom</div>
          </div>
        </div>
      </div>
    </div>
  )
}
