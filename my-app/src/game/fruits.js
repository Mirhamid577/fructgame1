const FLESH = {
  watermelon: '#f43f5e',
  apple: '#fff7ed',
  orange: '#fdba74',
  lemon: '#fef08a',
  kiwi: '#86efac',
  bomb: '#e11d48',
}

const SEED = {
  watermelon: '#3f0d12',
  apple: '#78350f',
  orange: null,
  lemon: null,
  kiwi: '#052e16',
}

const RIND = {
  watermelon: '#bbf7d0',
  apple: '#fed7aa',
  orange: '#ffedd5',
  lemon: '#fef9c3',
  kiwi: '#713f12',
  bomb: '#0a0a0a',
}

function gloss(ctx, r) {
  ctx.save()
  ctx.beginPath()
  ctx.ellipse(-r * 0.32, -r * 0.4, r * 0.24, r * 0.14, -0.6, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.fill()
  ctx.restore()
}

function paintBase(ctx, type, r) {
  switch (type) {
    case 'watermelon': {
      const g = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r * 1.3)
      g.addColorStop(0, '#86efac')
      g.addColorStop(0.55, '#22c55e')
      g.addColorStop(1, '#15803d')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.save()
      ctx.clip()
      ctx.strokeStyle = 'rgba(20,90,50,0.8)'
      ctx.lineWidth = r * 0.22
      ctx.lineCap = 'round'
      for (let i = -2; i <= 2; i += 1) {
        const y = i * r * 0.4
        ctx.beginPath()
        ctx.moveTo(-r, y)
        ctx.quadraticCurveTo(0, y - r * 0.22, r, y)
        ctx.stroke()
      }
      ctx.restore()
      gloss(ctx, r)
      break
    }
    case 'apple': {
      const g = ctx.createRadialGradient(-r * 0.35, -r * 0.42, r * 0.1, 0, 0, r * 1.25)
      g.addColorStop(0, '#fca5a5')
      g.addColorStop(0.45, '#ef4444')
      g.addColorStop(1, '#b91c1c')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(127,29,29,0.7)'
      ctx.lineWidth = r * 0.06
      ctx.stroke()
      ctx.strokeStyle = '#7c4a12'
      ctx.lineWidth = r * 0.1
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(0, -r * 0.85)
      ctx.quadraticCurveTo(r * 0.1, -r * 1.35, -r * 0.02, -r * 1.55)
      ctx.stroke()
      ctx.save()
      ctx.translate(r * 0.34, -r * 1.22)
      ctx.rotate(-0.55)
      ctx.fillStyle = '#22c55e'
      ctx.beginPath()
      ctx.ellipse(0, 0, r * 0.3, r * 0.14, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(20,90,50,0.6)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(-r * 0.28, 0)
      ctx.lineTo(r * 0.28, 0)
      ctx.stroke()
      ctx.restore()
      gloss(ctx, r)
      break
    }
    case 'orange': {
      const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.25)
      g.addColorStop(0, '#fdba74')
      g.addColorStop(0.6, '#fb923c')
      g.addColorStop(1, '#ea580c')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.save()
      ctx.clip()
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      for (let i = 0; i < 26; i += 1) {
        const a = Math.random() * Math.PI * 2
        const d = Math.random() * r * 0.85
        ctx.beginPath()
        ctx.arc(Math.cos(a) * d, Math.sin(a) * d, r * 0.03, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.strokeStyle = 'rgba(154,52,18,0.7)'
      ctx.lineWidth = r * 0.05
      ctx.beginPath()
      ctx.arc(0, -r * 0.55, r * 0.16, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
      gloss(ctx, r)
      break
    }
    case 'lemon': {
      const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r * 1.2)
      g.addColorStop(0, '#fef08a')
      g.addColorStop(0.6, '#fde047')
      g.addColorStop(1, '#ca8a04')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.ellipse(0, 0, r, r * 0.8, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#eab308'
      ctx.beginPath()
      ctx.ellipse(-r * 0.85, 0, r * 0.18, r * 0.13, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(r * 0.85, 0, r * 0.18, r * 0.13, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.save()
      ctx.clip()
      ctx.fillStyle = 'rgba(255,255,255,0.16)'
      for (let i = 0; i < 22; i += 1) {
        const a = Math.random() * Math.PI * 2
        const d = Math.random() * r * 0.85
        ctx.beginPath()
        ctx.arc(Math.cos(a) * d, Math.sin(a) * d, r * 0.035, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
      gloss(ctx, r)
      break
    }
    case 'kiwi': {
      const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r * 1.2)
      g.addColorStop(0, '#a16207')
      g.addColorStop(0.6, '#854d0e')
      g.addColorStop(1, '#4d2b16')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.save()
      ctx.clip()
      ctx.strokeStyle = 'rgba(60,35,15,0.35)'
      ctx.lineWidth = r * 0.05
      for (let i = 0; i < 10; i += 1) {
        const a = Math.random() * Math.PI * 2
        const d = Math.random() * r * 0.85
        ctx.beginPath()
        ctx.moveTo(Math.cos(a) * d, Math.sin(a) * d)
        ctx.lineTo(Math.cos(a) * (d + r * 0.12), Math.sin(a) * (d + r * 0.12))
        ctx.stroke()
      }
      ctx.restore()
      gloss(ctx, r)
      break
    }
    case 'bomb': {
      const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r * 1.2)
      g.addColorStop(0, '#6b7280')
      g.addColorStop(0.5, '#374151')
      g.addColorStop(1, '#0a0a0a')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#78350f'
      ctx.lineWidth = r * 0.1
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(0, -r * 0.85)
      ctx.quadraticCurveTo(r * 0.15, -r * 1.2, 0, -r * 1.5)
      ctx.stroke()
      gloss(ctx, r)
      break
    }
    default:
      break
  }
}

export function drawFruit(ctx, fruit) {
  ctx.save()
  ctx.translate(fruit.x, fruit.y)
  ctx.rotate(fruit.angle)
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetY = 6
  paintBase(ctx, fruit.type, fruit.r)
  ctx.restore()
}

export function drawHalf(ctx, half) {
  const { x, y, r, cut, rot, side, type, age } = half
  const alpha = age > 1.4 ? Math.max(0, 1 - (age - 1.4) / 0.6) : 1
  const k = side > 0 ? 1 : -1
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(x, y)
  ctx.rotate(cut + rot)

  ctx.save()
  ctx.beginPath()
  if (side > 0) {
    ctx.arc(0, 0, r, 0, Math.PI)
  } else {
    ctx.arc(0, 0, r, Math.PI, Math.PI * 2)
  }
  ctx.closePath()
  ctx.clip()
  paintBase(ctx, type, r)
  ctx.restore()

  ctx.save()
  ctx.translate(k * r * 0.14, 0)
  ctx.beginPath()
  ctx.ellipse(0, 0, r * 0.36, r * 0.96, 0, 0, Math.PI * 2)
  ctx.fillStyle = FLESH[type]
  ctx.fill()
  ctx.strokeStyle = RIND[type]
  ctx.lineWidth = r * 0.18
  ctx.stroke()
  ctx.restore()

  const seed = SEED[type]
  if (seed) {
    ctx.fillStyle = seed
    const count = type === 'kiwi' ? 10 : 5
    for (let i = 0; i < count; i += 1) {
      const a = (i / count) * Math.PI
      const sr = type === 'kiwi' ? r * 0.11 : r * 0.055
      ctx.beginPath()
      ctx.arc(Math.cos(a) * r * 0.5 * k + k * r * 0.12, Math.sin(a) * r * 0.62, sr, 0, Math.PI * 2)
      ctx.fill()
    }
    if (type === 'kiwi') {
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.beginPath()
      ctx.ellipse(k * r * 0.12, 0, r * 0.16, r * 0.4, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.save()
  ctx.translate(k * r * 0.14, -r * 0.32)
  ctx.beginPath()
  ctx.ellipse(0, 0, r * 0.13, r * 0.2, 0.3, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.fill()
  ctx.restore()

  ctx.restore()
}

export function drawBombSpark(ctx, time, x, y) {
  const pulse = 0.6 + Math.sin(time * 18) * 0.4
  ctx.save()
  ctx.translate(x, y)
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 26)
  g.addColorStop(0, `rgba(255,200,60,${pulse})`)
  g.addColorStop(1, 'rgba(255,80,0,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(0, 0, 26, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = `rgba(255,220,120,${pulse})`
  ctx.beginPath()
  ctx.arc(0, 0, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,180,60,0.9)'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(0, -4)
  ctx.lineTo(4, 8)
  ctx.moveTo(0, -4)
  ctx.lineTo(-4, 9)
  ctx.moveTo(0, -4)
  ctx.lineTo(0, 10)
  ctx.stroke()
  ctx.restore()
}
