import EnterXR from './EnterXR.jsx'
import DesktopModelUploader from './DesktopModelUploader.jsx'

export default function DesktopModelControls({
  store,
  modelUrl,
  setModelUrl,
  animationNames,
  activeAnimation,
  setActiveAnimation,
}) {
  const basename = (u) => {
    try {
      return u?.split('/').pop()
    } catch (e) {
      return u
    }
  }

  return (
    <div className="flex items-center gap-3">
      <EnterXR store={store} />

      <div className="flex items-center gap-2">
        <DesktopModelUploader
          onModelUrl={(url, info) => {
            setModelUrl(url)
            if (info?.persisted && typeof url === 'string') {
              localStorage.setItem('xr:selectedModel', url)
              localStorage.removeItem('xr:selectedModel:preview')
            }
          }}
          uploadToServer={true}
        />
      </div>

      <div className="text-xs text-muted-foreground">
        {modelUrl ? `Model: ${basename(modelUrl)}` : 'Model: default'}
      </div>

      {Array.isArray(animationNames) && animationNames.length > 0 ? (
        <select
          className="rounded bg-background/20 px-2 py-1 text-sm text-foreground"
          value={activeAnimation ?? ''}
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
  )
}
