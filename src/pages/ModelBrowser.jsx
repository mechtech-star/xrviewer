import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ModelBrowser({ models, isDesktop, handleViewModel, onDelete }) {
  const navigate = useNavigate()
  const view = (model) => {
    handleViewModel(model)
    if (isDesktop) navigate(`/preview/${model.id}`)
    else navigate(`/viewer/${model.id}`)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-indigo-200/80">Models</p>
            <h2 className="text-3xl font-bold">Available 3D Models</h2>
            <p className="text-white/70 mt-1">Browse your uploaded assets or use the built-in demo. Click a card to preview or enter XR.</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>Home</Button>
            <Button variant="default" size="sm" onClick={() => navigate('/upload')} disabled={!isDesktop} title={isDesktop ? 'Open uploads (desktop only)' : 'Uploads are desktop-only'}>Upload</Button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {models.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-white/8 bg-white/4 p-8 text-center">No models found. Use the Upload page to add `.glb` files.</div>
          ) : (
            models.map((m) => (
              <ModelCard key={m.id} model={m} onView={view} onDelete={(model) => onDelete?.(model)} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function ModelCard({ model, onView, onDelete }) {
  const badge = model.source === 'builtin' ? 'Bundled' : model.persisted ? 'Uploaded' : 'Local preview'

  return (
    <Card className="flex flex-col justify-between overflow-hidden shadow-xl">
      <div className="h-36 bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center text-center">
        <div className="px-4">
          <div className="text-sm font-medium text-primary-foreground">{model.name}</div>
          <div className="mt-1 text-xs text-muted-foreground truncate">{model.url ? model.url.split('/').pop() : 'Built-in asset'}</div>
        </div>
      </div>

      <CardContent className="p-4 flex flex-col gap-3 bg-transparent">
        <p className="text-sm text-muted-foreground h-12 overflow-hidden">{model.description || 'No description provided.'}</p>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground truncate">{model.persisted ? 'Stored on server' : 'Local preview'}</div>

          <div className="flex items-center gap-2">
            {model.persisted && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => { if (confirm('Delete this model from server?')) onDelete?.(model) }}
                title="Delete uploaded model"
              >
                Delete
              </Button>
            )}

            <Button variant="default" size="sm" onClick={() => onView(model)}>
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
