import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import XRCanvas from '../components/XRCanvas.jsx'
import EnterXR from '../components/EnterXR.jsx'
import { Button } from '@/components/ui/button'
import ErrorBoundary from '../components/ErrorBoundary.jsx'

export default function Viewer({ models, selectedModelId, setSelectedModelId, modelUrl, xrStore, activeAnimation, setActiveAnimation, animationNames, setAnimationNames }) {
  const params = useParams()
  const navigate = useNavigate()

  // Ensure selectedModelId follows the route param
  useEffect(() => {
    if (params?.id) setSelectedModelId(params.id)
  }, [params?.id])

  const current = models.find((m) => m.id === selectedModelId) || models[0]

  return (
    <div className="relative h-screen w-full bg-background text-foreground">
      <ErrorBoundary>
        <XRCanvas
          store={xrStore}
          modelUrl={modelUrl}
          activeAnimation={activeAnimation}
          setActiveAnimation={setActiveAnimation}
          animationNames={animationNames}
          setAnimationNames={setAnimationNames}
        />
      </ErrorBoundary>

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
        <div className="pointer-events-auto flex flex-wrap items-center gap-3 rounded-2xl bg-popover/80 px-4 py-3 shadow-lg shadow-black/50 backdrop-blur">
          <Button variant="outline" size="sm" onClick={() => navigate('/models')}>Back to list</Button>

          <EnterXR store={xrStore} />

          <div className="ml-2 text-sm text-foreground">{current?.name}</div>

          {Array.isArray(animationNames) && animationNames.length > 0 ? (
              <select
              className="rounded-lg bg-background/20 px-2 py-1 text-sm text-foreground"
              value={activeAnimation || ''}
              onChange={(e) => setActiveAnimation(e.target.value || null)}
            >
              <option value="">Stop</option>
              {animationNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-xs text-muted-foreground">No animations in model</div>
          )}
        </div>

        <div className="pointer-events-auto self-end rounded-xl bg-popover px-3 py-2 text-xs text-muted-foreground shadow-lg shadow-black/50 backdrop-blur">
          Use your controller trigger (or mouse click on desktop) to interact with in-world buttons.
        </div>
      </div>
    </div>
  )
}
