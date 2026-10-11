import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Wraps its children (meant for the hero name) in a two-layer canvas
 * overlay that "burns" away on mount, left to right, revealing the real
 * text underneath. The text itself is always real DOM (selectable,
 * crawlable, accessible); both canvases are purely decorative and unmount
 * once the burn completes.
 *
 * Two canvases, not one, because the reveal mechanic and the fire
 * decoration (flames, embers, smoke) have conflicting needs on the same
 * pixels:
 *  - reveal canvas: an opaque cover with clearRect() punching permanent
 *    holes in it as the burn progresses -- these holes must never be
 *    redrawn over, or already-revealed text gets re-hidden.
 *  - fire canvas: flickering flames, drifting embers, rising smoke, all
 *    of which must be fully cleared and redrawn every single frame to
 *    animate at all. Doing that on the same canvas as the reveal holes
 *    would require erasing last frame's fire pixels first, which risks
 *    clearing part of the cover that hasn't officially been revealed yet.
 * The fire canvas is also taller than the text and offset upward, so
 * flames/embers/smoke have real room to rise instead of clipping at the
 * text's own edge -- capped modestly, since the hero photo sits close
 * above the name and tall flames would visually collide with it.
 *
 * IMPORTANT: neither canvas may have a CSS background. A CSS background
 * paints *behind* a canvas's own 2D-drawn pixels but *in front of*
 * whatever DOM sits behind the (absolutely positioned) canvas element --
 * so clearRect() would only ever expose that CSS background, never the
 * real text. The opaque cover has to be drawn pixels, not CSS.
 */
function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Smooth, organic burn-front curve: a handful of sine waves at different
// frequencies/phases summed together -- a few real flame tongues licking
// across, not per-pixel static.
function makeFrontCurve() {
  const waves = [
    { amp: 10, freq: 0.045, phase: Math.random() * Math.PI * 2 },
    { amp: 6, freq: 0.11, phase: Math.random() * Math.PI * 2 },
    { amp: 3.5, freq: 0.23, phase: Math.random() * Math.PI * 2 },
  ]
  return (x) => waves.reduce((sum, w) => sum + w.amp * Math.sin(x * w.freq + w.phase), 0)
}

// A tapered, swaying flame silhouette (bezier teardrop, not an ellipse) in
// deep orange-red, with a brighter inner core. Chaotic flicker is layered
// noise at different speeds, not one smooth sine -- real combustion jitters,
// it doesn't breathe. Returns the current tip position for ember spawning.
function drawFlame(ctx, x, baseY, baseHeight, now, seed) {
  const n1 = Math.sin(now * 0.028 + seed)
  const n2 = Math.sin(now * 0.067 + seed * 1.9)
  const n3 = Math.sin(now * 0.015 + seed * 0.37)
  const chaos = n1 * 0.5 + n2 * 0.32 + n3 * 0.18

  const h = baseHeight * (1 + chaos * 0.4)
  const sway = chaos * baseHeight * 0.16
  const w = Math.max(baseHeight * 0.26, 6)

  ctx.save()
  ctx.translate(x, baseY)
  ctx.globalCompositeOperation = 'lighter'

  function teardrop(width, height, tipSway, grad) {
    ctx.beginPath()
    ctx.moveTo(-width, 0)
    ctx.bezierCurveTo(-width, -height * 0.38, -width * 0.28 + tipSway * 0.5, -height * 0.78, tipSway, -height)
    ctx.bezierCurveTo(width * 0.28 + tipSway * 0.5, -height * 0.78, width, -height * 0.38, width, 0)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()
  }

  let g = ctx.createLinearGradient(0, 0, 0, -h)
  g.addColorStop(0, 'rgba(160,20,5,0)')
  g.addColorStop(0.18, 'rgba(190,35,8,0.7)')
  g.addColorStop(0.55, 'rgba(225,75,12,0.6)')
  g.addColorStop(1, 'rgba(250,130,25,0)')
  teardrop(w, h, sway, g)

  const hc = h * 0.6
  const wc = w * 0.42
  g = ctx.createLinearGradient(0, 0, 0, -hc)
  g.addColorStop(0, 'rgba(255,110,15,0)')
  g.addColorStop(0.3, 'rgba(255,145,25,0.85)')
  g.addColorStop(1, 'rgba(255,200,80,0)')
  teardrop(wc, hc, sway * 0.75, g)

  ctx.restore()
  return { x: x + sway, y: baseY - h }
}

function drawEmber(ctx, e, alpha) {
  ctx.globalCompositeOperation = 'lighter'
  const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size * 2.4)
  g.addColorStop(0, `rgba(255,215,130,${alpha})`)
  g.addColorStop(0.5, `rgba(255,120,30,${alpha * 0.6})`)
  g.addColorStop(1, 'rgba(255,80,20,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2)
  ctx.fill()
}

function drawSmoke(ctx, s, alpha) {
  ctx.globalCompositeOperation = 'source-over'
  const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size)
  g.addColorStop(0, `rgba(125,118,110,${alpha * 0.3})`)
  g.addColorStop(1, 'rgba(90,86,82,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
  ctx.fill()
}

function BurnReveal({ children, duration = 1700 }) {
  const wrapRef = useRef(null)
  const coverCanvasRef = useRef(null)
  const fireCanvasRef = useRef(null)
  // Derived at init, not corrected afterward -- a reduced-motion visitor
  // never renders either canvas, rather than mounting them then
  // immediately setState-ing them away inside the effect.
  const [burning, setBurning] = useState(() => !prefersReducedMotion())

  useLayoutEffect(() => {
    if (!burning) return

    const wrap = wrapRef.current
    const coverCanvas = coverCanvasRef.current
    const fireCanvas = fireCanvasRef.current
    if (!wrap || !coverCanvas || !fireCanvas) return

    let cancelled = false
    let raf = null
    const coverCtx = coverCanvas.getContext('2d')
    const fireCtx = fireCanvas.getContext('2d')

    // Fire canvas is taller than the text and shifted up, so flames/embers/
    // smoke have room to rise -- capped modestly since the hero photo sits
    // close above the name.
    let overflowTop = 0

    function sizeAndCover() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = wrap.getBoundingClientRect()
      const width = Math.max(rect.width, 1)
      const height = Math.max(rect.height, 1)
      overflowTop = height * 1.5

      coverCanvas.width = width * dpr
      coverCanvas.height = height * dpr
      coverCanvas.style.width = `${width}px`
      coverCanvas.style.height = `${height}px`
      coverCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      coverCtx.fillStyle = '#111214'
      coverCtx.fillRect(0, 0, width, height)

      const fireHeight = height + overflowTop
      fireCanvas.width = width * dpr
      fireCanvas.height = fireHeight * dpr
      fireCanvas.style.width = `${width}px`
      fireCanvas.style.height = `${fireHeight}px`
      fireCanvas.style.top = `${-overflowTop}px`
      fireCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      fireCtx.clearRect(0, 0, width, fireHeight)

      return { width, height }
    }

    sizeAndCover()

    // Web fonts load async and can resize the text after first paint. The
    // cover above already hides any mismatch, so this just re-paints the
    // cover at the correct final size before the burn itself starts.
    const fontsReady = document.fonts?.ready ?? Promise.resolve()
    const safetyTimeout = new Promise((resolve) => setTimeout(resolve, 600))

    Promise.race([fontsReady, safetyTimeout]).then(() => {
      if (cancelled) return
      const { width, height } = sizeAndCover()
      runBurn(width, height)
    })

    function runBurn(width, height) {
      const baseY = overflowTop + height // the text's own bottom edge, in fire-canvas space
      const frontCurve = makeFrontCurve()
      const curveSpan = 22

      const stripWidth = 3
      const stripCount = Math.ceil(width / stripWidth) + 1
      const burned = new Array(stripCount).fill(false)

      const sweepDistance = width + curveSpan * 2
      const start = performance.now()

      const flames = []
      const embers = []
      const smoke = []
      let distanceSinceSpawn = Infinity
      const spawnSpacing = 15

      function frame(now) {
        const elapsed = now - start
        const t = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - t, 2)
        const sweepX = eased * sweepDistance - curveSpan

        // --- reveal: permanent, only ever gains holes ---
        for (let i = 0; i < stripCount; i++) {
          if (burned[i]) continue
          const stripX = i * stripWidth
          if (stripX + frontCurve(stripX) > sweepX) continue
          burned[i] = true
          coverCtx.clearRect(stripX, 0, stripWidth + 0.5, height)
        }

        // --- spawn new flames as the front advances ---
        distanceSinceSpawn += stripWidth
        if (t < 1 && distanceSinceSpawn >= spawnSpacing) {
          distanceSinceSpawn = 0
          const fx = sweepX + frontCurve(sweepX) + (Math.random() - 0.5) * 6
          flames.push({
            x: fx,
            spawnedAt: now,
            life: 480 + Math.random() * 320,
            seed: Math.random() * 1000,
            heightMul: 0.85 + Math.random() * 0.55,
            lastTip: { x: fx, y: baseY - height * 0.6 },
            nextEmberAt: now + 60 + Math.random() * 90,
          })
        }

        // --- fire canvas: fully cleared and redrawn every frame ---
        fireCtx.clearRect(0, 0, width, overflowTop + height)

        for (let i = flames.length - 1; i >= 0; i--) {
          const f = flames[i]
          const age = now - f.spawnedAt
          if (age > f.life) {
            // Flame dies -> leaves a puff of smoke behind, drifting from
            // wherever its tip last was.
            smoke.push({
              x: f.lastTip.x + (Math.random() - 0.5) * 8,
              y: f.lastTip.y,
              vy: -0.018 - Math.random() * 0.012,
              vx: (Math.random() - 0.5) * 0.012,
              size: height * 0.22 + Math.random() * height * 0.12,
              growth: 0.012 + Math.random() * 0.01,
              spawnedAt: now,
              life: 750 + Math.random() * 400,
            })
            flames.splice(i, 1)
            continue
          }
          const lifeT = age / f.life
          const envelope = lifeT < 0.12 ? lifeT / 0.12 : 1 - (lifeT - 0.12) / 0.88
          const tip = drawFlame(fireCtx, f.x, baseY, height * f.heightMul * Math.max(envelope, 0), now, f.seed)
          f.lastTip = tip

          if (now >= f.nextEmberAt && envelope > 0.3) {
            f.nextEmberAt = now + 70 + Math.random() * 110
            embers.push({
              x: tip.x + (Math.random() - 0.5) * 6,
              y: tip.y,
              vx: (Math.random() - 0.5) * 0.05,
              vy: -0.1 - Math.random() * 0.07,
              size: 1.1 + Math.random() * 1.6,
              spawnedAt: now,
              life: 450 + Math.random() * 450,
            })
          }
        }

        for (let i = embers.length - 1; i >= 0; i--) {
          const e = embers[i]
          const age = now - e.spawnedAt
          if (age > e.life) {
            embers.splice(i, 1)
            continue
          }
          e.x += e.vx * 16
          e.y += e.vy * 16
          const alpha = 1 - age / e.life
          drawEmber(fireCtx, e, alpha)
        }

        for (let i = smoke.length - 1; i >= 0; i--) {
          const s = smoke[i]
          const age = now - s.spawnedAt
          if (age > s.life) {
            smoke.splice(i, 1)
            continue
          }
          s.x += s.vx * 16
          s.y += s.vy * 16
          s.size += s.growth * 16
          const lifeT = age / s.life
          const alpha = lifeT < 0.2 ? lifeT / 0.2 : 1 - (lifeT - 0.2) / 0.8
          drawSmoke(fireCtx, s, Math.max(alpha, 0))
        }

        if (t < 1 || flames.length > 0 || embers.length > 0 || smoke.length > 0) {
          raf = requestAnimationFrame(frame)
        } else {
          setBurning(false)
        }
      }

      raf = requestAnimationFrame(frame)
    }

    return () => {
      cancelled = true
      if (raf) cancelAnimationFrame(raf)
    }
  }, [duration, burning])

  return (
    <span ref={wrapRef} className="burn-reveal">
      {children}
      {burning && (
        <>
          <canvas ref={coverCanvasRef} className="burn-reveal-canvas" aria-hidden="true" />
          <canvas ref={fireCanvasRef} className="burn-reveal-canvas burn-reveal-fire" aria-hidden="true" />
        </>
      )}
    </span>
  )
}

export default BurnReveal
