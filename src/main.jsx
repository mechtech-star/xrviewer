import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // WebXR session / controller init can be sensitive to React 18/19 StrictMode
  // double-invocation in dev; keep the tree single-mounted.
  <App />,
)
