export function drawSword(ctx, x, y, angle, weapon) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  const len = 300
  const u = len / 150
  ctx.shadowColor = weapon.glow
  ctx.shadowBlur = 22 * u
  const blade = new Path2D()
  blade.moveTo(0, -6.5 * u)
  blade.lineTo(len, 0)
  blade.lineTo(0, 6.5 * u)
  blade.closePath()
  ctx.fillStyle = weapon.blade
  ctx.fill(blade)
  ctx.shadowBlur = 0
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'
  ctx.lineWidth = 1 * u
  ctx.stroke(blade)
  ctx.fillStyle = weapon.guard
  ctx.fillRect(-10 * u, -11 * u, 9 * u, 22 * u)
  ctx.fillStyle = weapon.handle
  ctx.beginPath()
  ctx.roundRect(-48 * u, -4.5 * u, 38 * u, 9 * u, 4 * u)
  ctx.fill()
  ctx.fillStyle = weapon.guard
  ctx.beginPath()
  ctx.arc(-49 * u, 0, 4.6 * u, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export function drawHeart(ctx, x, y, size, color, alpha = 1) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x, y + size * 0.32)
  ctx.bezierCurveTo(x, y, x - size * 0.5, y - size * 0.15, x - size * 0.5, y + size * 0.18)
  ctx.bezierCurveTo(x - size * 0.5, y + size * 0.42, x, y + size * 0.62, x, y + size * 0.78)
  ctx.bezierCurveTo(x, y + size * 0.62, x + size * 0.5, y + size * 0.42, x + size * 0.5, y + size * 0.18)
  ctx.bezierCurveTo(x + size * 0.5, y - size * 0.15, x, y, x, y + size * 0.32)
  ctx.fill()
  ctx.restore()
}
