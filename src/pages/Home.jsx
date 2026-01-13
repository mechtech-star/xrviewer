import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Home({ xrSupport, isDesktop }) {
  const enterLabel = xrSupport === false ? 'XR Not Supported' : xrSupport === null ? 'Checking XR...' : 'Enter XR'
  const enterDisabled = xrSupport === false
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="rounded-3xl bg-card border p-8 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-300">XR Studio</p>
              <h1 className="mt-3 text-4xl font-extrabold leading-tight">A modern viewer for your 3D assets — upload, preview, and enter XR</h1>
              <p className="mt-4 text-lg text-muted-foreground">Quickly preview GLB models in a production-ready desktop viewer or launch them into an immersive XR session. Upload files from your desktop and manage them securely on the server.</p>

              <div className="mt-6 flex flex-wrap gap-4">
                <Button className="inline-flex items-center gap-3 font-semibold" variant="default" size="lg" disabled={enterDisabled} onClick={() => navigate('/models')}>{enterLabel}</Button>
                <Button className="inline-flex items-center gap-3 font-medium" variant="outline" size="lg" disabled={!isDesktop} onClick={() => navigate('/upload')}>Upload Models</Button>
              </div>

              {!isDesktop && <div className="mt-4 text-sm text-amber-200/90">Uploads are available on desktop browsers only.</div>}
            </div>

            <div className="hidden lg:flex items-center justify-center">
              <div className="w-full rounded-md overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
                <img src="/webxr.png" alt="WebXR" className="w-full h-full object-cover object-center" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
