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
  watermelon: '#dcfce7',
  apple: '#ffedd5',
  orange: '#ffedd5',
  lemon: '#fef9c3',
  kiwi: '#4d2b16',
  bomb: '#0a0a0a',
}

function paintBase(ctx, type, r) {
  switch (type) {
    case 'watermelon': {
      const g = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r * 1.2)
      g.addColorStop(0, '#4ade80')
      g.addColorStop(1, '#15803d')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.save()
      ctx.clip()
      ctx.strokeStyle = 'rgba(21,128,61,0.75)'
      ctx.lineWidth = r * 0.24
      for (let i = -3; i <= 3; i += 1) {
        ctx.beginPath()
        ctx.arc(0, i * r * 0.4, r * 0.9, -Math.PI * 0.25, Math.PI * 0.25)
        ctx.stroke()
      }
      ctx.restore()
      break
    }
    case 'apple': {
      const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.2)
      g.addColorStop(0, '#f87171')
      g.addColorStop(1, '#b91c1c')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#7f1d1d'
      ctx.lineWidth = r * 0.06
      ctx.stroke()
      ctx.strokeStyle = '#92400e'
      ctx.lineWidth = r * 0.09
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(0, -r * 0.9)
      ctx.quadraticCurveTo(r * 0.08, -r * 1.4, -r * 0.05, -r * 1.55)
      ctx.stroke()
      ctx.fillStyle = '#4ade80'
      ctx.beginPath()
      ctx.ellipse(r * 0.32, -r * 1.28, r * 0.26, r * 0.14, -0.5, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'orange': {
      const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.2)
      g.addColorStop(0, '#fdba74')
      g.addColorStop(1, '#ea580c')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.14)'
      ctx.beginPath()
      ctx.arc(-r * 0.3, -r * 0.35, r * 0.3, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'lemon': {
      const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r * 1.2)
      g.addColorStop(0, '#fef08a')
      g.addColorStop(1, '#ca8a04')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.ellipse(0, 0, r, r * 0.82, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#a16207'
      ctx.lineWidth = r * 0.05
      ctx.stroke()
      break
    }
    case 'kiwi': {
      ctx.fillStyle = '#8b5a2b'
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.save()
      ctx.clip()
      ctx.strokeStyle = 'rgba(60,35,15,0.5)'
      ctx.lineWidth = r * 0.06
      for (let i = 0; i < 8; i += 1) {
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(Math.cos((i / 8) * Math.PI * 2) * r, Math.sin((i / 8) * Math.PI * 2) * r)
        ctx.stroke()
      }
      ctx.restore()
      break
    }
    case 'bomb': {
      const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r * 1.2)
      g.addColorStop(0, '#4b5563')
      g.addColorStop(1, '#0a0a0a')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.28)'
      ctx.beginPath()
      ctx.arc(-r * 0.32, -r * 0.38, r * 0.22, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#78350f'
      ctx.lineWidth = r * 0.1
      ctx.beginPath()
      ctx.moveTo(0, -r * 0.85)
      ctx.quadraticCurveTo(r * 0.15, -r * 1.2, 0, -r * 1.5)
      ctx.stroke()
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
  paintBase(ctx, fruit.type, fruit.r)
  ctx.restore()
}

export function drawHalf(ctx, half) {
  const { x, y, r, cut, rot, side, type, age } = half
  const alpha = age > 1.4 ? Math.max(0, 1 - (age - 1.4) / 0.6) : 1
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
  const k = side > 0 ? 1 : -1
  ctx.save()
  ctx.translate(r * 0.12 * k, 0)
  ctx.scale(1, 1)
  ctx.beginPath()
  ctx.ellipse(0, 0, r * 0.34, r * 0.94, 0, 0, Math.PI * 2)
  ctx.fillStyle = FLESH[type]
  ctx.fill()
  ctx.strokeStyle = RIND[type]
  ctx.lineWidth = r * 0.1
  ctx.stroke()
  ctx.restore()
  const seed = SEED[type]
  if (seed) {
    ctx.fillStyle = seed
    const count = type === 'kiwi' ? 10 : 5
    for (let i = 0; i < count; i += 1) {
      const a = (i / count) * Math.PI
      const sr = type === 'kiwi' ? r * 0.12 : r * 0.06
      ctx.beginPath()
      ctx.arc(Math.cos(a) * r * 0.55 * k, Math.sin(a) * r * 0.7, sr, 0, Math.PI * 2)
      ctx.fill()
    }
    if (type === 'kiwi') {
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.beginPath()
      ctx.ellipse(r * 0.1 * k, 0, r * 0.2, r * 0.45, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }
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
  ctx.restore()
}
