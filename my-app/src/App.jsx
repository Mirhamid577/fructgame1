import { useEffect, useRef, useState } from 'react'
import { WEAPONS } from './game/weapons'
import { HandTracker } from './game/handTracker'
import { Game } from './game/engine'
import { drawSword } from './game/sword'
import './App.css'

function WeaponPreview({ weapon }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.translate(72, 112)
    ctx.rotate(-Math.PI / 4)
    drawSword(ctx, 0, 0, 0, weapon)
    ctx.restore()
  }, [weapon])
  return <canvas ref={ref} width={150} height={140} className="weapon-preview" />
}

function Menu({ weapon, setWeapon, onStart }) {
  return (
    <div className="menu">
      <h1 className="title">
        FRUIT <span>SLAYER</span>
      </h1>
      <p className="subtitle">
        Режь фрукты рукой в воздухе — меч летит за пальцем. Бомбы трогать нельзя!
      </p>

      <h2 className="section-title">Выбери меч</h2>
      <div className="weapon-grid">
        {WEAPONS.map((w) => (
          <button
            type="button"
            key={w.id}
            className={`weapon-card ${weapon.id === w.id ? 'selected' : ''}`}
            onClick={() => setWeapon(w)}
          >
            <WeaponPreview weapon={w} />
            <div className="weapon-name">{w.name}</div>
            <div className="weapon-price">{w.price === 0 ? 'Бесплатно' : `${w.price} монет`}</div>
          </button>
        ))}
      </div>

      <p className="notice">
        Понадобится разрешение на камеру. Магазин с платными мечами — скоро.
      </p>
      <button type="button" className="start-btn" onClick={onStart}>
        Играть
      </button>
    </div>
  )
}

function GameScreen({ weapon, onExit, onRestart }) {
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [over, setOver] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    let disposed = false
    let raf = 0
    let stream = null
    let tracker = null
    let engine = null

    async function init() {
      try {
        const canvas = canvasRef.current
        engine = new Game(canvas, weapon)
        tracker = new HandTracker(engine.width, engine.height, { modelType: 'lite' })

        setStatus('Запускаем камеру...')
        stream = await tracker.initCamera()
        setStatus('Загружаем модель TensorFlow...')
        await tracker.loadModel()
        setStatus('')
        engine.start(tracker.video)

        let last = performance.now()
        const tick = async () => {
          if (disposed) return
          try {
            const now = performance.now()
            const dt = Math.min(0.05, (now - last) / 1000)
            last = now
            if (!engine.over) {
              await tracker.estimate()
              engine.setBlades(tracker.computeBlades())
              engine.update(dt)
            } else {
              engine.update(dt)
            }
            engine.render(tracker)
            if (engine.over && !engine._notified) {
              engine._notified = true
              setOver(true)
              setScore(engine.score)
            }
          } catch (err) {
            console.error(err)
            if (!disposed) setError(err?.message || String(err))
            return
          }
          raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      } catch (e) {
        console.error(e)
        setError(e?.message || String(e))
      }
    }
    init()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      if (stream) stream.getTracks().forEach((t) => t.stop())
      tracker = null
      engine = null
    }
  }, [weapon])

  return (
    <div className="game-wrap">
      <canvas ref={canvasRef} />
      {status && <div className="status">{status}</div>}
      {error && <div className="error">Ошибка: {error}</div>}
      {over && (
        <div className="game-over">
          <h1>Game Over</h1>
          <div className="score-big">{score}</div>
          <div className="btn-row">
            <button type="button" className="btn primary" onClick={onRestart}>
              Ещё раз
            </button>
            <button type="button" className="btn" onClick={onExit}>
              В меню
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState('menu')
  const [weapon, setWeapon] = useState(WEAPONS[0])
  const [runId, setRunId] = useState(0)

  if (screen === 'menu') {
    return <Menu weapon={weapon} setWeapon={setWeapon} onStart={() => setScreen('game')} />
  }

  return (
    <GameScreen
      key={runId}
      weapon={weapon}
      onExit={() => setScreen('menu')}
      onRestart={() => setRunId((id) => id + 1)}
    />
  )
}
