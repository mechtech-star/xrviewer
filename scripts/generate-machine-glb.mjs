import fs from 'node:fs'
import path from 'node:path'
import { Accessor, Document, NodeIO } from '@gltf-transform/core'

// Generates a tiny GLB with embedded animation clips.
// XR-specific reason:
// - Keeping a generated placeholder model avoids shipping a large binary in the repo,
//   while still giving a Quest/Chrome-ready demo with animation clips.

const outPath = path.resolve('src/models/machine.glb')
fs.mkdirSync(path.dirname(outPath), { recursive: true })

const document = new Document()
const root = document.getRoot()
const buffer = document.createBuffer('buffer')

// Minimal cube geometry (24 vertices, per-face normals) so lighting works.
const cube = (() => {
  const positions = new Float32Array([
    // +X
    0.06, 0.06, 0.06, 0.06, -0.06, 0.06, 0.06, -0.06, -0.06, 0.06, 0.06, -0.06,
    // -X
    -0.06, 0.06, -0.06, -0.06, -0.06, -0.06, -0.06, -0.06, 0.06, -0.06, 0.06, 0.06,
    // +Y
    -0.06, 0.06, 0.06, -0.06, 0.06, -0.06, 0.06, 0.06, -0.06, 0.06, 0.06, 0.06,
    // -Y
    -0.06, -0.06, -0.06, -0.06, -0.06, 0.06, 0.06, -0.06, 0.06, 0.06, -0.06, -0.06,
    // +Z
    -0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, -0.06, 0.06, -0.06, -0.06, 0.06,
    // -Z
    0.06, 0.06, -0.06, -0.06, 0.06, -0.06, -0.06, -0.06, -0.06, 0.06, -0.06, -0.06,
  ])

  const normals = new Float32Array([
    // +X
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    // -X
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
    // +Y
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
    // -Y
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
    // +Z
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    // -Z
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
  ])

  const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3,
    4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11,
    12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19,
    20, 21, 22, 20, 22, 23,
  ])

  const positionAccessor = document
    .createAccessor('POSITION')
    .setArray(positions)
    .setType(Accessor.Type.VEC3)
    .setBuffer(buffer)

  const normalAccessor = document
    .createAccessor('NORMAL')
    .setArray(normals)
    .setType(Accessor.Type.VEC3)
    .setBuffer(buffer)

  const indexAccessor = document
    .createAccessor('INDICES')
    .setArray(indices)
    .setType(Accessor.Type.SCALAR)
    .setBuffer(buffer)

  const material = document.createMaterial('material')
  material.setMetallicFactor(0).setRoughnessFactor(1)

  const primitive = document
    .createPrimitive()
    .setAttribute('POSITION', positionAccessor)
    .setAttribute('NORMAL', normalAccessor)
    .setIndices(indexAccessor)
    .setMaterial(material)

  const mesh = document.createMesh('Cube').addPrimitive(primitive)
  return mesh
})()

const machine = document.createNode('Machine')
const base = document.createNode('Base').setMesh(cube).setTranslation([0, 0.06, 0])
const partA = document.createNode('PartA').setMesh(cube).setTranslation([-0.18, 0.18, 0])
const partB = document.createNode('PartB').setMesh(cube).setTranslation([0.18, 0.18, 0])
machine.addChild(base).addChild(partA).addChild(partB)

const scene = document.createScene('Scene')
scene.addChild(machine)
root.setDefaultScene(scene)

const makeTranslationClip = (name, a0, a1, b0, b1, duration = 1) => {
  const anim = document.createAnimation(name)

  const input = document
    .createAccessor(`${name}.times`)
    .setArray(new Float32Array([0, duration]))
    .setType(Accessor.Type.SCALAR)
    .setBuffer(buffer)

  const outputA = document
    .createAccessor(`${name}.PartA.translation`)
    .setArray(new Float32Array([...a0, ...a1]))
    .setType(Accessor.Type.VEC3)
    .setBuffer(buffer)

  const outputB = document
    .createAccessor(`${name}.PartB.translation`)
    .setArray(new Float32Array([...b0, ...b1]))
    .setType(Accessor.Type.VEC3)
    .setBuffer(buffer)

  const samplerA = document
    .createAnimationSampler(`${name}.A`)
    .setInput(input)
    .setOutput(outputA)
    .setInterpolation('LINEAR')

  const samplerB = document
    .createAnimationSampler(`${name}.B`)
    .setInput(input)
    .setOutput(outputB)
    .setInterpolation('LINEAR')

  const channelA = document
    .createAnimationChannel(`${name}.PartA`)
    .setTargetNode(partA)
    .setTargetPath('translation')
    .setSampler(samplerA)

  const channelB = document
    .createAnimationChannel(`${name}.PartB`)
    .setTargetNode(partB)
    .setTargetPath('translation')
    .setSampler(samplerB)

  anim.addSampler(samplerA).addSampler(samplerB)
  anim.addChannel(channelA).addChannel(channelB)
  return anim
}

makeTranslationClip(
  'Explode',
  [-0.18, 0.18, 0],
  [-0.45, 0.3, 0.18],
  [0.18, 0.18, 0],
  [0.45, 0.3, -0.18],
  1
)

makeTranslationClip(
  'Assemble',
  [-0.45, 0.3, 0.18],
  [-0.18, 0.18, 0],
  [0.45, 0.3, -0.18],
  [0.18, 0.18, 0],
  1
)

// Simple bobbing translation on the root as a safe animation clip.
{
  const anim = document.createAnimation('Run')
  const input = document
    .createAccessor('Run.times')
    .setArray(new Float32Array([0, 0.6, 1.2]))
    .setType(Accessor.Type.SCALAR)
    .setBuffer(buffer)

  const output = document
    .createAccessor('Run.Machine.translation')
    .setArray(new Float32Array([0, 0, 0, 0, 0.05, 0, 0, 0, 0]))
    .setType(Accessor.Type.VEC3)
    .setBuffer(buffer)

  const sampler = document
    .createAnimationSampler('Run.sampler')
    .setInput(input)
    .setOutput(output)
    .setInterpolation('LINEAR')

  const channel = document
    .createAnimationChannel('Run.channel')
    .setTargetNode(machine)
    .setTargetPath('translation')
    .setSampler(sampler)

  anim.addSampler(sampler)
  anim.addChannel(channel)
}

const io = new NodeIO()
await io.write(outPath, document)
process.stdout.write(`Generated ${outPath}\n`)
