import * as handPoseDetection from '@tensorflow-models/hand-pose-detection'

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

let cachedDetector = null
let cachedModelType = null

async function getDetector(modelType, maxHands) {
  if (!cachedDetector || cachedModelType !== modelType) {
    cachedDetector = await handPoseDetection.createDetector(
      handPoseDetection.SupportedModels.MediaPipeHands,
      {
        runtime: 'mediapipe',
        solutionPath: SOLUTION_PATH,
        modelType,
        maxHands,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      },
    )
    cachedModelType = modelType
  }
  return cachedDetector
}

export class HandTracker {
  constructor(width, height, opts = {}) {
    this.width = width
    this.height = height
    this.modelType = opts.modelType ?? 'lite'
    this.maxHands = opts.maxHands ?? 2
    this.detector = null
    this.hands = []
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
    return this.hands.length > 0
  }

  async loadModel() {
    if (!this.detector) {
      this.detector = await getDetector(this.modelType, this.maxHands)
    }
    return this.detector
  }

  async estimate(time = 0) {
    if (!this.detector || this.video.readyState < 2) return []
    try {
      this.hands = await this.detector.estimateHands(this.video, {
        flipHorizontal: true,
        staticImageMode: false,
      })
    } catch {
      this.hands = []
    }
    if (this.hands.length > 0) this.lastDetected = time
    return this.hands
  }

  computeBlades() {
    const blades = []
    const seen = new Set()
    for (const hand of this.hands) {
      const key = hand.handedness
      seen.add(key)
      const tip = hand.keypoints[INDEX_TIP]
      let x = tip.x * this.width
      let y = tip.y * this.height
      const prevSmooth = this.smoothTips.get(key)
      if (prevSmooth) {
        x = prevSmooth.x + (x - prevSmooth.x) * (1 - SMOOTHING)
        y = prevSmooth.y + (y - prevSmooth.y) * (1 - SMOOTHING)
      }
      this.smoothTips.set(key, { x, y })
      const prev = this.prevTips.get(key)
      if (prev) {
        if (Math.hypot(x - prev.x, y - prev.y) > MIN_BLADE_LEN) {
          blades.push({ x0: prev.x, y0: prev.y, x1: x, y1: y })
        }
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
    for (const hand of this.hands) {
      const pts = hand.keypoints
      ctx.save()
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.shadowColor = 'rgba(0,255,170,0.9)'
      ctx.shadowBlur = 14
      for (const [a, b] of HAND_CONNECTIONS) {
        const x0 = pts[a].x * this.width
        const y0 = pts[a].y * this.height
        const x1 = pts[b].x * this.width
        const y1 = pts[b].y * this.height
        ctx.strokeStyle = 'rgba(0,255,170,0.85)'
        ctx.lineWidth = 6
        ctx.beginPath()
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y1)
        ctx.stroke()
      }
      for (let i = 0; i < pts.length; i += 1) {
        const x = pts[i].x * this.width
        const y = pts[i].y * this.height
        ctx.beginPath()
        ctx.arc(x, y, i === INDEX_TIP ? 10 : 5.5, 0, Math.PI * 2)
        ctx.fillStyle = i === INDEX_TIP ? '#ff3b6b' : '#00ffaa'
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.9)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
      const t = pts[INDEX_TIP]
      const tx = t.x * this.width
      const ty = t.y * this.height
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
