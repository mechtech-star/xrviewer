import { useMemo, useState } from 'react'
import { createXRStore } from '@react-three/xr'
import EnterXR from './components/EnterXR.jsx'
import XRCanvas from './components/XRCanvas.jsx'

function App() {
  // React owns only UI state. Rendering + XR loop are owned by R3F/Three.
  const [activeAnimation, setActiveAnimation] = useState(null)
  const [animationNames, setAnimationNames] = useState([])

  // XR-specific decision:
  // - Create a single XR store and share it between <XR> and VRButton.
  // - Disable auto-offer; user explicitly clicks Enter XR.
  const xrStore = useMemo(() => createXRStore({ offerSession: false }), [])

  return (
    <div className="h-full w-full bg-black text-white">
      {/* Minimal DOM UI: XR entry only. */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-3">
        <EnterXR store={xrStore} />
        <div className="text-xs text-white/70">
          {animationNames.length > 0
            ? `Clips: ${animationNames.join(', ')}`
            : 'No clips detected (replace src/models/machine.glb).'}
        </div>
      </div>

      <XRCanvas
        store={xrStore}
        activeAnimation={activeAnimation}
        setActiveAnimation={setActiveAnimation}
        animationNames={animationNames}
        setAnimationNames={setAnimationNames}
      />
    </div>
  )
}

export default App
