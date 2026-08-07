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
    this.video = document.createElement('video')
    this.video.autoplay = true
    this.video.muted = true
    this.video.playsInline = true
  }

  async initCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: false,
    })
    this.video.srcObject = stream
    await this.video.play()
    return stream
  }

  async loadModel() {
    if (!this.detector) {
      this.detector = await getDetector(this.modelType, this.maxHands)
    }
    return this.detector
  }

  async estimate() {
    if (!this.detector || this.video.readyState < 2) return []
    this.hands = await this.detector.estimateHands(this.video, {
      flipHorizontal: true,
      staticImageMode: true,
    })
    return this.hands
  }

  computeBlades() {
    const blades = []
    const seen = new Set()
    for (const hand of this.hands) {
      const key = hand.handedness
      seen.add(key)
      const tip = hand.keypoints[INDEX_TIP]
      const x = tip.x * this.width
      const y = tip.y * this.height
      const prev = this.prevTips.get(key)
      if (prev) {
        blades.push({ x0: prev.x, y0: prev.y, x1: x, y1: y })
      }
      this.prevTips.set(key, { x, y })
    }
    for (const key of [...this.prevTips.keys()]) {
      if (!seen.has(key)) this.prevTips.delete(key)
    }
    return blades
  }

  drawSkeleton(ctx) {
    for (const hand of this.hands) {
      const pts = hand.keypoints
      ctx.strokeStyle = 'rgba(0,255,170,0.9)'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      for (const [a, b] of HAND_CONNECTIONS) {
        ctx.beginPath()
        ctx.moveTo(pts[a].x * this.width, pts[a].y * this.height)
        ctx.lineTo(pts[b].x * this.width, pts[b].y * this.height)
        ctx.stroke()
      }
      for (let i = 0; i < pts.length; i += 1) {
        ctx.beginPath()
        ctx.arc(pts[i].x * this.width, pts[i].y * this.height, i === INDEX_TIP ? 6 : 4, 0, Math.PI * 2)
        ctx.fillStyle = i === INDEX_TIP ? '#ff3b6b' : '#00ffaa'
        ctx.fill()
      }
      const t = pts[INDEX_TIP]
      const tx = t.x * this.width
      const ty = t.y * this.height
      const g = ctx.createRadialGradient(tx, ty, 2, tx, ty, 30)
      g.addColorStop(0, 'rgba(255,59,107,0.5)')
      g.addColorStop(1, 'rgba(255,59,107,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(tx, ty, 30, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}
