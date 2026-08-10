const SOLUTION_PATH = '/vendor/hands'

export const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
]

export const INDEX_TIP = 8

const SMOOTHING = 0.55
const MIN_BLADE_LEN = 2.5

let cachedHands = null
let cachedInitialized = false

function getHands() {
  if (!cachedHands) {
    if (typeof globalThis.Hands !== 'function') {
      throw new Error('Модель рук MediaPipe не загрузилась. Проверь, что игра открыта по https и файлы /vendor/hands доступны.')
    }
    cachedHands = new globalThis.Hands({ locateFile: (file) => `${SOLUTION_PATH}/${file}` })
  }
  return cachedHands
}

export class HandTracker {
  constructor(width, height, opts = {}) {
    this.width = width
    this.height = height
    this.maxHands = opts.maxHands ?? 2
    this.modelComplexity = opts.modelComplexity ?? 0
    this.hands = null
    this.landmarks = []
    this.prevTips = new Map()
    this.smoothTips = new Map()
    this.lastDetected = -1
    this.video = document.createElement('video')
    this.video.autoplay = true
    this.video.muted = true
    this.video.playsInline = true
    this.video.width = width
    this.video.height = height
  }

  get hasHands() {
    return this.landmarks.length > 0
  }

  async loadModel() {
    if (!this.hands) {
      const hands = getHands()
      hands.setOptions({
        maxNumHands: this.maxHands,
        modelComplexity: this.modelComplexity,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })
      hands.onResults((res) => this.onResults(res))
      if (!cachedInitialized) {
        await hands.initialize()
        cachedInitialized = true
      }
      this.hands = hands
    }
    return this.hands
  }

  onResults(results) {
    const list = []
    const labels = results.multiHandedness ?? []
    const landmarkLists = results.multiHandLandmarks ?? []
    for (let i = 0; i < landmarkLists.length; i += 1) {
      list.push({ keypoints: landmarkLists[i], handedness: labels[i]?.label ?? String(i) })
    }
    this.landmarks = list
  }

  async estimate(time = 0) {
    if (!this.hands || this.video.readyState < 2) return []
    try {
      await this.hands.send({ image: this.video })
    } catch {
      this.landmarks = []
      return []
    }
    if (this.landmarks.length > 0) this.lastDetected = time
    return this.landmarks
  }

  computeBlades() {
    const blades = []
    const seen = new Set()
    for (const hand of this.landmarks) {
      const key = hand.handedness
      seen.add(key)
      const tip = hand.keypoints[INDEX_TIP]
      let x = (1 - tip.x) * this.width
      let y = tip.y * this.height
      const prevSmooth = this.smoothTips.get(key)
      if (prevSmooth) {
        x = prevSmooth.x + (x - prevSmooth.x) * (1 - SMOOTHING)
        y = prevSmooth.y + (y - prevSmooth.y) * (1 - SMOOTHING)
      }
      this.smoothTips.set(key, { x, y })
      const prev = this.prevTips.get(key)
      if (prev && Math.hypot(x - prev.x, y - prev.y) > MIN_BLADE_LEN) {
        blades.push({ x0: prev.x, y0: prev.y, x1: x, y1: y })
      }
      this.prevTips.set(key, { x, y })
    }
    for (const key of [...this.prevTips.keys()]) {
      if (!seen.has(key)) {
        this.prevTips.delete(key)
        this.smoothTips.delete(key)
      }
    }
    return blades
  }

  drawSkeleton(ctx, time = 0) {
    const { width, height } = this
    for (const hand of this.landmarks) {
      const pts = hand.keypoints
      const X = (i) => (1 - pts[i].x) * width
      const Y = (i) => pts[i].y * height
      ctx.save()
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.shadowColor = 'rgba(0,255,170,0.9)'
      ctx.shadowBlur = 14
      for (const [a, b] of HAND_CONNECTIONS) {
        ctx.strokeStyle = 'rgba(0,255,170,0.85)'
        ctx.lineWidth = 6
        ctx.beginPath()
        ctx.moveTo(X(a), Y(a))
        ctx.lineTo(X(b), Y(b))
        ctx.stroke()
      }
      for (let i = 0; i < pts.length; i += 1) {
        ctx.beginPath()
        ctx.arc(X(i), Y(i), i === INDEX_TIP ? 10 : 5.5, 0, Math.PI * 2)
        ctx.fillStyle = i === INDEX_TIP ? '#ff3b6b' : '#00ffaa'
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.9)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
      const tx = X(INDEX_TIP)
      const ty = Y(INDEX_TIP)
      const pulse = 1 + Math.sin(time * 6) * 0.15
      const g = ctx.createRadialGradient(tx, ty, 2, tx, ty, 36 * pulse)
      g.addColorStop(0, 'rgba(255,59,107,0.55)')
      g.addColorStop(1, 'rgba(255,59,107,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(tx, ty, 36 * pulse, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }
}
