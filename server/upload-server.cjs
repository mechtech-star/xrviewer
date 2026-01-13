const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 5175

// Ensure public/models exists
const uploadDir = path.join(__dirname, '..', 'public', 'models')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const safe = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
    cb(null, safe)
  },
})

const upload = multer({ storage })

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no file' })
  const urlPath = `/models/${path.basename(req.file.path)}`
  res.json({ path: urlPath })
})

// List uploaded models
app.get('/api/models', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'failed to read uploads' })

    const list = files
      .filter((f) => f.toLowerCase().endsWith('.glb'))
      .map((f) => ({ path: `/models/${f}`, name: f }))

    res.json(list)
  })
})

// Delete uploaded model by filename
app.delete('/api/upload/:filename', (req, res) => {
  const fn = req.params.filename
  if (!fn) return res.status(400).json({ error: 'missing filename' })

  const target = path.join(uploadDir, path.basename(fn))
  fs.unlink(target, (err) => {
    if (err) return res.status(404).json({ error: 'file not found' })
    res.json({ ok: true })
  })
})

app.listen(PORT, () => console.log(`Upload server running on http://localhost:${PORT}`))
