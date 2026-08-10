import { useEffect, useRef, useState } from 'react'
import { WEAPONS } from './game/weapons'
import { HandTracker } from './game/handTracker'
import { Game } from './game/engine'
import { drawSword } from './game/sword'

function cameraErrorHint(err) {
  const name = err?.name || ''
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || name === 'OverconstrainedError') {
    return 'Камера не найдена. Проверь, что она включена, не занята другой программой, и в настройках приватности Windows разрешён доступ к камере. Затем нажми «Играть» ещё раз.'
  }
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return 'Доступ к камере запрещён. Разреши камеру в настройках браузера и нажми «Играть» ещё раз.'
  }
  if (name === 'NotReadableError' || name === 'AbortError') {
    return 'Камера уже занята другой программой (Zoom, Teams, камера Windows). Закрой её и нажми «Играть» ещё раз.'
  }
  if (name === 'SecurityError') {
    return 'Браузер заблокировал доступ к камере. Разреши доступ и попробуй снова.'
  }
  return err?.message || String(err)
}

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
  return <canvas ref={ref} width={150} height={140} className="block mx-auto" />
}

function Menu({ weapon, setWeapon, onStart, error }) {
  return (
    <div
      className="min-h-dvh flex flex-col items-center gap-4 px-5 py-10 text-center"
      style={{
        background:
          'radial-gradient(ellipse at 20% 15%, rgba(34, 211, 238, 0.18), transparent 55%), radial-gradient(ellipse at 80% 85%, rgba(251, 191, 36, 0.16), transparent 55%), linear-gradient(180deg, #0a0f1e, #05070f)',
      }}
    >
      <h1 className="mt-auto text-5xl md:text-7xl font-black tracking-wider text-white [text-shadow:0_0_30px_rgba(34,211,238,0.5)]">
        FRUIT <span className="text-amber-400 [text-shadow:0_0_30px_rgba(251,191,36,0.5)]">SLAYER</span>
      </h1>

      <p className="max-w-[560px] text-gray-400">
        Режь фрукты рукой в воздухе — меч летит за пальцем. Бомбы трогать нельзя!
      </p>

      <h2 className="mt-2 text-xl text-gray-200">Выбери меч</h2>
      <div className="grid w-full max-w-[760px] grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4">
        {WEAPONS.map((w) => (
          <button
            type="button"
            key={w.id}
            onClick={() => setWeapon(w)}
            className={`cursor-pointer rounded-2xl bg-gradient-to-b from-[#151b2e] to-[#0d1220] p-3 transition hover:-translate-y-1 ${
              weapon.id === w.id
                ? 'border-2 border-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.35)]'
                : 'border-2 border-[#232c46]'
            }`}
          >
            <WeaponPreview weapon={w} />
            <div className="mt-1 font-bold text-white">{w.name}</div>
            <div className="mt-0.5 text-sm text-amber-400">{w.price === 0 ? 'Бесплатно' : `${w.price} монет`}</div>
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500">
        Понадобится разрешение на камеру. Магазин с платными мечами — скоро.
      </p>

      {error && <p className="max-w-[560px] text-sm text-red-400">{error}</p>}

      <button
        type="button"
        onClick={onStart}
        className="mb-auto cursor-pointer rounded-full bg-gradient-to-r from-cyan-400 to-amber-400 px-16 py-3.5 text-2xl font-extrabold text-[#05121a] shadow-[0_8px_30px_rgba(34,211,238,0.4)] transition hover:scale-105"
      >
        Играть
      </button>
    </div>
  )
}

function GameScreen({ weapon, stream, onExit, onRestart }) {
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [over, setOver] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    let disposed = false
    let raf = 0
    let tracker = null
    let engine = null

    async function init() {
      try {
        const canvas = canvasRef.current
        engine = new Game(canvas, weapon)
        tracker = new HandTracker(engine.width, engine.height, { modelType: 'lite' })
        tracker.video.srcObject = stream
        await tracker.video.play()

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
      tracker = null
      engine = null
    }
  }, [weapon, stream])

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#05070f]">
      <canvas ref={canvasRef} />
      {status && (
        <div className="fixed left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[#232c46] bg-[rgba(10,15,30,0.85)] px-7 py-3.5 font-semibold text-white">
          {status}
        </div>
      )}
      {error && (
        <div className="fixed left-1/2 top-1/2 z-10 max-w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-red-500 bg-[rgba(127,29,29,0.9)] px-7 py-3.5 text-white">
          Ошибка: {error}
        </div>
      )}
      {over && (
        <div className="fixed left-1/2 top-1/2 z-10 max-h-[90vh] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[#232c46] bg-[rgba(10,15,30,0.92)] px-6 py-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.6)] md:px-12">
          <h1 className="mb-2 text-4xl font-bold text-amber-400">Game Over</h1>
          <div className="my-2 text-6xl font-black text-white">{score}</div>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={onRestart}
              className="cursor-pointer rounded-full bg-gradient-to-r from-cyan-400 to-amber-400 px-7 py-3 text-lg font-bold text-[#05121a]"
            >
              Ещё раз
            </button>
            <button
              type="button"
              onClick={onExit}
              className="cursor-pointer rounded-full border-2 border-[#232c46] bg-[#151b2e] px-7 py-3 text-lg font-bold text-gray-200"
            >
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
  const [stream, setStream] = useState(null)
  const [startError, setStartError] = useState('')

  async function handleStart() {
    setStartError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setStartError('Камера доступна только через HTTPS или localhost. Открой игру по ссылке, начинающейся с https://')
      return
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      setStream(s)
      setRunId((id) => id + 1)
      setScreen('game')
    } catch (err) {
      console.error(err)
      setStartError(cameraErrorHint(err))
    }
  }

  function handleExit() {
    if (stream) stream.getTracks().forEach((t) => t.stop())
    setStream(null)
    setStartError('')
    setScreen('menu')
  }

  if (screen === 'menu') {
    return <Menu weapon={weapon} setWeapon={setWeapon} onStart={handleStart} error={startError} />
  }

  return (
    <GameScreen
      key={runId}
      weapon={weapon}
      stream={stream}
      onExit={handleExit}
      onRestart={() => setRunId((id) => id + 1)}
    />
  )
}
