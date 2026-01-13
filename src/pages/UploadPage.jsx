import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function UploadPage({ models, isDesktop, addModel, handleViewModel, onDelete }) {
  const navigate = useNavigate()
  const view = (model) => {
    handleViewModel(model)
    if (isDesktop) navigate(`/preview/${model.id}`)
    else navigate(`/viewer/${model.id}`)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-primary/80">Uploads</p>
            <h2 className="text-3xl font-extrabold">Upload and Manage Models</h2>
            <p className="text-muted-foreground mt-1">Upload .glb files from your desktop. Uploaded models are stored on the server and available to preview or delete.</p>
          </div>

          <div>
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>Home</Button>
          </div>
        </div>

        <div className="rounded-3xl bg-card border p-8 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">Upload a .glb</h3>
              <p className="text-sm text-muted-foreground">Only desktop browsers can upload. Files are sent to /api/upload and become available immediately.</p>
            </div>
            <div className={isDesktop ? '' : 'pointer-events-none opacity-50'}>
              <DesktopModelUploader
                onModelUrl={(url, info) => {
                  addModel(url, info)
                }}
                uploadToServer={true}
              />
            </div>
          </div>
          {!isDesktop && <div className="mt-3 text-sm text-muted-foreground">Uploads are disabled on this device.</div>}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {models.length === 0 ? (
            <div className="col-span-full rounded-2xl border bg-card p-8 text-center">No uploaded models yet.</div>
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

function DesktopModelUploader({ onModelUrl, uploadToServer = true }) {
  const ref = useRef()

  const handleFile = async (file) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.glb')) return

    const blobUrl = URL.createObjectURL(file)
    onModelUrl?.(blobUrl, { persisted: false, fileName: file.name })

    if (uploadToServer) {
      try {
        const form = new FormData()
        form.append('file', file, file.name)
        const res = await fetch('/api/upload', { method: 'POST', body: form })
        if (res.ok) {
          const json = await res.json()
          if (json?.path) {
            onModelUrl?.(json.path, { persisted: true, fileName: file.name })
            localStorage.setItem('xr:selectedModel', json.path)
          }
        } else {
          console.error('Upload failed', await res.text())
        }
      } catch (e) {
        console.error('Upload error', e)
      }
    } else {
      try {
        localStorage.setItem('xr:selectedModel:preview', blobUrl)
      } catch (e) {
        // ignore
      }
    }
  }

  return (
    <div className="pointer-events-auto">
      <input
        ref={ref}
        type="file"
        accept=".glb"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <Button variant="default" size="sm" onClick={() => ref.current?.click()} title="Upload .glb (desktop)">Upload .glb</Button>
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
