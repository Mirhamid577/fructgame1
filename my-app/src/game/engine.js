import { drawFruit, drawHalf, drawBombSpark } from './fruits'
import { drawSword, drawHeart } from './sword'

export const FRUITS = ['watermelon', 'apple', 'orange', 'lemon', 'kiwi']

const GRAVITY = 2000
const MIN_SLICE_SPEED = 5
const COMBO_WINDOW = 1.4

function distToSegment(px, py, seg) {
  const dx = seg.x1 - seg.x0
  const dy = seg.y1 - seg.y0
  const len2 = dx * dx + dy * dy
  let t = len2 === 0 ? 0 : ((px - seg.x0) * dx + (py - seg.y0) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  const cx = seg.x0 + t * dx
  const cy = seg.y0 + t * dy
  return Math.hypot(px - cx, py - cy)
}

export class Game {
  constructor(canvas, weapon) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.weapon = weapon
    this.width = 1280
    this.height = 720
    canvas.width = this.width
    canvas.height = this.height
    this.reset()
  }

  reset() {
    this.fruits = []
    this.halves = []
    this.particles = []
    this.trail = []
    this.floaters = []
    this.rings = []
    this.score = 0
    this.combo = 0
    this.comboTimer = 0
    this.lives = 3
    this.time = 0
    this.spawnTimer = 0.8
    this.over = false
    this._notified = false
    this.shake = 0
    this.blades = []
    this.lastBlade = null
    this.lastAngle = 0
    this.video = null
  }

  start(video) {
    this.reset()
    this.video = video
  }

  setBlades(segments) {
    this.blades = segments
    for (const s of segments) {
      this.trail.push({ x: s.x1, y: s.y1, t: this.time })
      this.lastBlade = s
      this.lastAngle = Math.atan2(s.y1 - s.y0, s.x1 - s.x0)
    }
  }

  spawn() {
    const burst = Math.random() < 0.3 ? 2 + Math.floor(Math.random() * 2) : 1
    for (let i = 0; i < burst; i += 1) {
      const bomb = Math.random() < Math.min(0.28, 0.08 + this.time * 0.004)
      const type = bomb ? 'bomb' : FRUITS[Math.floor(Math.random() * FRUITS.length)]
      const r = bomb ? 46 : 38 + Math.random() * 18
      this.fruits.push({
        type,
        x: r + Math.random() * (this.width - 2 * r),
        y: this.height + r * 0.5 + Math.random() * 40,
        vx: (Math.random() - 0.5) * 340,
        vy: -(1150 + Math.random() * 420 + this.time * 6),
        r,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 6,
        points: type === 'watermelon' ? 3 : 1,
      })
    }
  }

  update(dt) {
    this.time += dt
    if (this.over) return

    this.spawnTimer -= dt
    if (this.spawnTimer <= 0) {
      this.spawn()
      this.spawnTimer = Math.max(0.7, 1.35 - this.time * 0.006)
    }

    if (this.comboTimer > 0) {
      this.comboTimer -= dt
      if (this.comboTimer <= 0) this.combo = 0
    }

    for (const f of this.fruits) {
      f.vy += GRAVITY * dt
      f.x += f.vx * dt
      f.y += f.vy * dt
      f.angle += f.spin * dt
    }
    this.fruits = this.fruits.filter((f) => f.y - f.r < this.height + 60)

    for (const h of this.halves) {
      h.vy += GRAVITY * dt
      h.x += h.vx * dt
      h.y += h.vy * dt
      h.rot += h.spin * dt
      h.age += dt
    }
    this.halves = this.halves.filter((h) => h.y < this.height + 80 && h.age < 2)

    for (const p of this.particles) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += (p.gravity ?? 500) * dt
      p.life -= dt
    }
    this.particles = this.particles.filter((p) => p.life > 0)

    for (const r of this.rings) r.age += dt
    this.rings = this.rings.filter((r) => r.age < r.maxAge)

    for (const f of this.floaters) f.age += dt
    this.floaters = this.floaters.filter((f) => f.age < 1)

    this.trail = this.trail.filter((t) => this.time - t.t < 0.22)

    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 40)

    for (const seg of this.blades) {
      this.applySlice(seg)
    }
    this.blades = []
  }

  setHint(text) {
    this.hint = text
  }

  applySlice(seg) {
    if (Math.hypot(seg.x1 - seg.x0, seg.y1 - seg.y0) < MIN_SLICE_SPEED) return
    for (let i = this.fruits.length - 1; i >= 0; i -= 1) {
      const f = this.fruits[i]
      if (distToSegment(f.x, f.y, seg) > f.r) continue
      if (f.type === 'bomb') {
        this.explode(f)
      } else {
        this.cutFruit(f, seg)
        this.combo += 1
        this.comboTimer = COMBO_WINDOW
        const pts = f.points * this.combo
        this.score += pts
        this.floaters.push({ x: f.x, y: f.y, text: `+${pts}`, age: 0 })
        if (this.combo >= 2) {
          this.floaters.push({ x: this.width / 2, y: 190, text: `COMBO x${this.combo}`, age: 0, big: true })
        }
        for (let j = 0; j < 8; j += 1) {
          const a = Math.random() * Math.PI * 2
          const s = 60 + Math.random() * 260
          this.particles.push({
            x: f.x, y: f.y,
            vx: Math.cos(a) * s, vy: Math.sin(a) * s,
            life: 0.35 + Math.random() * 0.3,
            r: 2 + Math.random() * 4,
            color: '#fb7185',
          })
        }
      }
      this.fruits.splice(i, 1)
    }
  }

  cutFruit(f, seg) {
    const angle = Math.atan2(seg.y1 - seg.y0, seg.x1 - seg.x0)
    const perpX = -Math.sin(angle)
    for (const side of [-1, 1]) {
      this.halves.push({
        type: f.type,
        x: f.x,
        y: f.y,
        r: f.r,
        vx: f.vx + perpX * side * (80 + Math.random() * 130),
        vy: f.vy - (60 + Math.random() * 110),
        cut: angle,
        side,
        rot: 0,
        spin: (Math.random() * 7 - 3.5) * side,
        age: 0,
      })
    }
  }

  explode(b) {
    this.lives -= 1
    this.shake = 16
    this.rings.push({ x: b.x, y: b.y, age: 0, maxAge: 0.5 })
    for (let i = 0; i < 36; i += 1) {
      const a = Math.random() * Math.PI * 2
      const s = 120 + Math.random() * 540
      this.particles.push({
        x: b.x, y: b.y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: 0.5 + Math.random() * 0.45,
        r: 2 + Math.random() * 5,
        color: i % 3 ? '#f97316' : '#facc15',
        gravity: 300,
      })
    }
    if (this.lives <= 0) this.over = true
  }

  render(tracker) {
    const { ctx, width: w, height: h } = this
    ctx.save()

    if (this.video && this.video.readyState >= 2) {
      ctx.save()
      ctx.scale(-1, 1)
      ctx.translate(-w, 0)
      ctx.drawImage(this.video, 0, 0, w, h)
      ctx.restore()
    } else {
      ctx.fillStyle = '#0b1020'
      ctx.fillRect(0, 0, w, h)
    }
    ctx.fillStyle = 'rgba(8,12,24,0.2)'
    ctx.fillRect(0, 0, w, h)

    if (this.shake > 0) {
      ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake)
    }

    this.drawTrail()
    for (const f of this.fruits) {
      drawFruit(ctx, f)
      if (f.type === 'bomb') drawBombSpark(ctx, this.time, f.x, f.y - f.r * 1.5)
    }
    for (const hh of this.halves) drawHalf(ctx, hh)
    this.drawParticles()
    this.drawRings()
    if (this.lastBlade && this.time - this.trail[this.trail.length - 1]?.t < 0.22) {
      drawSword(ctx, this.lastBlade.x1, this.lastBlade.y1, this.lastAngle, this.weapon)
    }
    this.drawFloaters()
    if (tracker) tracker.drawSkeleton(ctx, this.time)
    this.drawHUD()

    if (this.time < 4) {
      ctx.textAlign = 'center'
      ctx.font = '700 30px system-ui'
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0, 1 - (this.time - 2.5) / 1.5)})`
      ctx.fillText(this.hint ?? 'Режь фрукты движением руки!', w / 2, h * 0.45)
    }

    ctx.restore()
  }

  drawTrail() {
    const { ctx } = this
    if (this.trail.length < 2) return
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (let i = 1; i < this.trail.length; i += 1) {
      const p0 = this.trail[i - 1]
      const p1 = this.trail[i]
      const k = Math.max(0, 1 - (this.time - p1.t) / 0.22)
      ctx.strokeStyle = `rgba(${this.weapon.trailColor},${k * 0.55})`
      ctx.lineWidth = 5 + k * 18
      ctx.beginPath()
      ctx.moveTo(p0.x, p0.y)
      ctx.lineTo(p1.x, p1.y)
      ctx.stroke()
    }
  }

  drawParticles() {
    const { ctx } = this
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 0.4))
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  drawRings() {
    const { ctx } = this
    for (const r of this.rings) {
      const k = r.age / r.maxAge
      ctx.globalAlpha = 1 - k
      ctx.strokeStyle = '#f97316'
      ctx.lineWidth = 8 * (1 - k)
      ctx.beginPath()
      ctx.arc(r.x, r.y, 20 + k * 220, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  drawFloaters() {
    const { ctx } = this
    ctx.textAlign = 'center'
    for (const f of this.floaters) {
      const k = f.age / 1
      ctx.globalAlpha = 1 - k
      if (f.big) {
        ctx.font = '800 42px system-ui'
        ctx.fillStyle = '#fbbf24'
        ctx.shadowColor = '#f59e0b'
        ctx.shadowBlur = 16
        ctx.fillText(f.text, f.x, f.y - k * 30)
        ctx.shadowBlur = 0
      } else {
        ctx.font = '700 30px system-ui'
        ctx.fillStyle = '#fff'
        ctx.fillText(f.text, f.x, f.y - k * 46)
      }
    }
    ctx.globalAlpha = 1
  }

  drawHUD() {
    const { ctx, width: w } = this
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.8)'
    ctx.shadowBlur = 6
    ctx.textAlign = 'left'
    ctx.fillStyle = '#fff'
    ctx.font = '700 22px system-ui'
    ctx.fillText('СЧЁТ', 26, 44)
    ctx.font = '800 52px system-ui'
    ctx.fillText(String(this.score), 26, 98)
    for (let i = 0; i < 3; i += 1) {
      drawHeart(ctx, w - 34 - i * 52, 34, 30, i < this.lives ? '#ef4444' : '#1e293b', i < this.lives ? 1 : 0.5)
    }
    ctx.shadowBlur = 0
    if (this.combo >= 2 && this.comboTimer > 0) {
      ctx.textAlign = 'center'
      ctx.fillStyle = '#fbbf24'
      ctx.font = '900 48px system-ui'
      ctx.fillText(`x${this.combo}`, w / 2, 120)
    }
    ctx.restore()
  }
}
