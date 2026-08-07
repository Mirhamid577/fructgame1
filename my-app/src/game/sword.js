export function drawSword(ctx, x, y, angle, weapon) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  const len = 150
  ctx.shadowColor = weapon.glow
  ctx.shadowBlur = 22
  const blade = new Path2D()
  blade.moveTo(0, -6.5)
  blade.lineTo(len, 0)
  blade.lineTo(0, 6.5)
  blade.closePath()
  ctx.fillStyle = weapon.blade
  ctx.fill(blade)
  ctx.shadowBlur = 0
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'
  ctx.lineWidth = 1
  ctx.stroke(blade)
  ctx.fillStyle = weapon.guard
  ctx.fillRect(-10, -11, 9, 22)
  ctx.fillStyle = weapon.handle
  ctx.beginPath()
  ctx.roundRect(-48, -4.5, 38, 9, 4)
  ctx.fill()
  ctx.fillStyle = weapon.guard
  ctx.beginPath()
  ctx.arc(-49, 0, 4.6, 0, Math.PI * 2)
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
