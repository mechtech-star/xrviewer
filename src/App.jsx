import { useEffect, useMemo, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { createXRStore } from '@react-three/xr'
import Home from './pages/Home.jsx'
import ModelBrowser from './pages/ModelBrowser.jsx'
import UploadPage from './pages/UploadPage.jsx'
import Viewer from './pages/Viewer.jsx'
import DesktopViewer from './pages/DesktopViewer.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'

const builtinModel = {
  id: 'builtin-demo',
  name: 'Demo Machine',
  description: 'Bundled sample model with a short looping animation.',
  url: null,
  source: 'builtin',
  persisted: true,
}

const loadStoredModels = () => {
  try {
    const raw = localStorage.getItem('xr:models')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch (e) {
    console.warn('Unable to read stored models', e)
    return []
  }
}

const useXRSupport = () => {
  const [supported, setSupported] = useState(null)

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      if (!navigator?.xr?.isSessionSupported) {
        if (!cancelled) setSupported(false)
        return
      }

      try {
        const ok = await navigator.xr.isSessionSupported('immersive-vr')
        if (!cancelled) setSupported(ok)
      } catch (e) {
        console.error('XR capability check failed', e)
        if (!cancelled) setSupported(false)
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [])

  return supported
}

function App() {
  const xrSupport = useXRSupport()
  const [isDesktop, setIsDesktop] = useState(true)

  const [models, setModels] = useState(() => [builtinModel, ...loadStoredModels()])
  const [selectedModelId, setSelectedModelId] = useState(builtinModel.id)
  const [modelUrl, setModelUrl] = useState(() => {
    return localStorage.getItem('xr:selectedModel') || null
  })

  const [activeAnimation, setActiveAnimation] = useState(null)
  const [animationNames, setAnimationNames] = useState([])

  const xrStore = useMemo(() => createXRStore({ offerSession: false }), [])

  // Track desktop vs headset for upload gating
  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    const sync = () => setIsDesktop(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // Keep persisted model list in localStorage (excluding the builtin card and transient previews)
  useEffect(() => {
    const persistable = models.filter((m) => m.source !== 'builtin' && m.persisted)
    try {
      localStorage.setItem('xr:models', JSON.stringify(persistable))
    } catch (e) {
      console.warn('Unable to persist model list', e)
    }
  }, [models])

  // Sync selected model id with a stored URL if available
  useEffect(() => {
    const stored = localStorage.getItem('xr:selectedModel')
    if (!stored) return
    const match = models.find((m) => m.url === stored)
    if (match) {
      setSelectedModelId(match.id)
    }
  }, [models])

  // Keep model URL aligned with selected card and validate server paths
  useEffect(() => {
    const current = models.find((m) => m.id === selectedModelId) || builtinModel
    setModelUrl(current.url || null)

    if (current.url) {
      localStorage.setItem('xr:selectedModel', current.url)
      localStorage.removeItem('xr:selectedModel:preview')
    } else {
      localStorage.removeItem('xr:selectedModel')
    }
  }, [models, selectedModelId])

  useEffect(() => {
    if (!modelUrl) return
    if (typeof modelUrl === 'string' && modelUrl.startsWith('/')) {
      let aborted = false
        ; (async () => {
          try {
            let ok = false
            try {
              const r = await fetch(modelUrl, { method: 'HEAD' })
              ok = r.ok
            } catch (e) {
              const r2 = await fetch(modelUrl, { method: 'GET' })
              ok = r2.ok
            }

            if (!ok && !aborted) {
              console.warn('Model path appears invalid:', modelUrl)
              alert('Selected model not found on the server. It may not have uploaded correctly.')
              setModelUrl(null)
              localStorage.removeItem('xr:selectedModel')
            }
          } catch (e) {
            console.error('Error validating model URL', e)
          }
        })()
      return () => {
        aborted = true
      }
    }
  }, [modelUrl])

  const addModel = (url, info = {}) => {
    if (!url) return
    const id = info.id || `mdl-${Date.now()}`
    const name = info.name || info.fileName || 'Uploaded model'
    const description = info.description || (info.persisted ? 'Stored on server' : 'Local preview for this session')
    const persisted = !!info.persisted
    const source = persisted ? 'uploaded' : 'local'
    const newEntry = {
      id,
      name,
      description,
      url,
      persisted,
      source,
    }

    setModels((prev) => {
      const custom = prev.filter((m) => m.source !== 'builtin')
      const deduped = custom.filter((m) => {
        if (m.url === url) return false
        if (persisted && info.fileName && m.source === 'local' && m.name === name) return false
        return true
      })
      return [builtinModel, ...deduped, newEntry]
    })

    setSelectedModelId(id)
  }

  // Fetch models from the upload server and merge them into state
  useEffect(() => {
    let cancelled = false
      ; (async () => {
        try {
          const res = await fetch('/api/models')
          if (!res.ok) return
          const list = await res.json()
          if (cancelled) return

          setModels((prev) => {
            const existing = prev.filter((m) => m.source === 'builtin')
            const custom = prev.filter((m) => m.source !== 'builtin')
            const serverEntries = (list || []).map((it) => ({
              id: `srv-${it.name}`,
              name: it.name,
              description: 'Uploaded to server',
              url: it.path,
              persisted: true,
              source: 'uploaded',
            }))

            // merge deduped by url
            const urls = new Set()
            const merged = [
              ...existing,
              ...serverEntries.filter((s) => {
                if (urls.has(s.url)) return false
                urls.add(s.url)
                return true
              }),
              ...custom.filter((c) => !urls.has(c.url)),
            ]

            return merged
          })
        } catch (e) {
          // ignore — server may not be running in some environments
        }
      })()

    return () => {
      cancelled = true
    }
  }, [])

  const deleteModel = async (model) => {
    if (!model || !model.persisted || !model.url) return
    try {
      const name = model.url.split('/').pop()
      const res = await fetch(`/api/upload/${encodeURIComponent(name)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete failed')

      setModels((prev) => prev.filter((m) => m.url !== model.url))
      // update persisted list
      try {
        const persistable = models.filter((m) => m.source !== 'builtin' && m.persisted && m.url !== model.url)
        localStorage.setItem('xr:models', JSON.stringify(persistable))
      } catch (e) {
        // ignore
      }
    } catch (e) {
      console.error('Failed to delete model', e)
      alert('Failed to delete model on server')
    }
  }

  const handleViewModel = (model) => {
    setSelectedModelId(model.id)
    setActiveAnimation(null)
  }
  // Pages are implemented in separate files and receive App-managed state as props.

  return (
    <>
      <div className="pointer-events-none fixed top-4 right-4 z-50">
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </div>
      <Routes>
        <Route path="/" element={<Home xrSupport={xrSupport} isDesktop={isDesktop} />} />
        <Route path="/models" element={<ModelBrowser models={models} isDesktop={isDesktop} handleViewModel={handleViewModel} onDelete={deleteModel} />} />
        <Route path="/upload" element={<UploadPage models={models} isDesktop={isDesktop} addModel={addModel} handleViewModel={handleViewModel} onDelete={deleteModel} />} />
        <Route path="/viewer/:id" element={<Viewer models={models} selectedModelId={selectedModelId} setSelectedModelId={setSelectedModelId} modelUrl={modelUrl} xrStore={xrStore} activeAnimation={activeAnimation} setActiveAnimation={setActiveAnimation} animationNames={animationNames} setAnimationNames={setAnimationNames} />} />
        <Route path="/preview/:id" element={<DesktopViewer models={models} selectedModelId={selectedModelId} modelUrl={modelUrl} xrStore={xrStore} activeAnimation={activeAnimation} setActiveAnimation={setActiveAnimation} animationNames={animationNames} />} />
        <Route path="*" element={<Home xrSupport={xrSupport} isDesktop={isDesktop} />} />
      </Routes>
    </>
  )
}

export default App
