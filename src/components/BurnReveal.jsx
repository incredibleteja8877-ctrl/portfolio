import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Wraps its children (meant for the hero name) in a two-layer canvas
 * overlay that "burns" away on mount, left to right, revealing the real
 * text underneath. The text itself is always real DOM (selectable,
 * crawlable, accessible); both canvases are purely decorative and unmount
 * once the burn completes.
 *
 * Two canvases, not one, because the reveal mechanic and the flame
 * decoration have conflicting needs on the same pixels:
 *  - reveal canvas: an opaque cover with clearRect() punching permanent
 *    holes in it as the burn progresses -- these holes must never be
 *    redrawn over, or already-revealed text gets re-hidden.
 *  - flame canvas: small flickering flame shapes that must be fully
 *    cleared and redrawn every single frame to animate at all. Doing that
 *    on the SAME canvas as the reveal holes would require erasing last
 *    frame's flame pixels first, which risks clearing part of the cover
 *    that hasn't officially been revealed yet, desyncing the two.
 * Stacking two transparent canvases keeps them independent: the bottom
 * one only ever gains new permanent holes, the top one is freely wiped
 * and repainted every frame.
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
// frequencies/phases summed together. This is what makes the edge read as
// a few real flame tongues licking across, rather than per-pixel static.
function makeFrontCurve() {
  const waves = [
    { amp: 10, freq: 0.045, phase: Math.random() * Math.PI * 2 },
    { amp: 6, freq: 0.11, phase: Math.random() * Math.PI * 2 },
    { amp: 3.5, freq: 0.23, phase: Math.random() * Math.PI * 2 },
  ]
  return (x) => waves.reduce((sum, w) => sum + w.amp * Math.sin(x * w.freq + w.phase), 0)
}

function drawFlame(ctx, x, baseY, height, flicker) {
  const h = height * flicker
  const w = Math.max(height * 0.3, 6)

  ctx.save()
  ctx.translate(x, baseY)
  ctx.globalCompositeOperation = 'lighter'

  let g = ctx.createRadialGradient(0, -h * 0.35, 1, 0, -h * 0.35, h * 0.65)
  g.addColorStop(0, 'rgba(255,160,40,0.8)')
  g.addColorStop(0.55, 'rgba(255,80,20,0.5)')
  g.addColorStop(1, 'rgba(200,30,10,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.ellipse(0, -h * 0.4, w, h * 0.6, 0, 0, Math.PI * 2)
  ctx.fill()

  g = ctx.createRadialGradient(0, -h * 0.25, 1, 0, -h * 0.25, h * 0.35)
  g.addColorStop(0, 'rgba(255,240,195,0.85)')
  g.addColorStop(1, 'rgba(255,170,60,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.ellipse(0, -h * 0.3, w * 0.45, h * 0.38, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function BurnReveal({ children, duration = 1700 }) {
  const wrapRef = useRef(null)
  const coverCanvasRef = useRef(null)
  const flameCanvasRef = useRef(null)
  // Derived at init, not corrected afterward -- a reduced-motion visitor
  // never renders either canvas, rather than mounting them then
  // immediately setState-ing them away inside the effect.
  const [burning, setBurning] = useState(() => !prefersReducedMotion())

  useLayoutEffect(() => {
    if (!burning) return

    const wrap = wrapRef.current
    const coverCanvas = coverCanvasRef.current
    const flameCanvas = flameCanvasRef.current
    if (!wrap || !coverCanvas || !flameCanvas) return

    let cancelled = false
    let raf = null
    const coverCtx = coverCanvas.getContext('2d')
    const flameCtx = flameCanvas.getContext('2d')

    // Paint the opaque cover synchronously, before the browser's first
    // paint (useLayoutEffect, not useEffect) -- so there is no frame where
    // the real text is visible before the burn takes over.
    function sizeAndCover() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = wrap.getBoundingClientRect()
      const width = Math.max(rect.width, 1)
      const height = Math.max(rect.height, 1)

      for (const [canvas, ctx] of [[coverCanvas, coverCtx], [flameCanvas, flameCtx]]) {
        canvas.width = width * dpr
        canvas.height = height * dpr
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }

      coverCtx.fillStyle = '#111214'
      coverCtx.fillRect(0, 0, width, height)
      flameCtx.clearRect(0, 0, width, height)

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
      const frontCurve = makeFrontCurve()
      const curveSpan = 22 // max |frontCurve(x)| across the waves above

      const stripWidth = 3
      const stripCount = Math.ceil(width / stripWidth) + 1
      const burned = new Array(stripCount).fill(false)

      const sweepDistance = width + curveSpan * 2
      const start = performance.now()

      // Flames spawn along the front as it advances, live briefly, then
      // expire -- a traveling, flickering front instead of static marks.
      const flames = []
      let distanceSinceSpawn = Infinity
      const spawnSpacing = 13

      function frame(now) {
        const elapsed = now - start
        const t = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - t, 2)
        const sweepX = eased * sweepDistance - curveSpan

        for (let i = 0; i < stripCount; i++) {
          if (burned[i]) continue
          const stripX = i * stripWidth
          if (stripX + frontCurve(stripX) > sweepX) continue
          burned[i] = true
          coverCtx.clearRect(stripX, 0, stripWidth + 0.5, height)
        }

        // Spawn new flames as the front advances (not every frame).
        distanceSinceSpawn += stripWidth
        if (t < 1 && distanceSinceSpawn >= spawnSpacing) {
          distanceSinceSpawn = 0
          const fx = sweepX + frontCurve(sweepX) + (Math.random() - 0.5) * 6
          flames.push({
            x: fx,
            spawnedAt: now,
            life: 420 + Math.random() * 260,
            seed: Math.random() * 1000,
            peak: 0.55 + Math.random() * 0.5,
          })
        }

        // Redraw the flame layer fresh every frame -- this canvas is
        // independent of the reveal canvas, so a full clear here never
        // touches already-revealed text.
        flameCtx.clearRect(0, 0, width, height)
        for (let i = flames.length - 1; i >= 0; i--) {
          const f = flames[i]
          const age = now - f.spawnedAt
          if (age > f.life) {
            flames.splice(i, 1)
            continue
          }
          const lifeT = age / f.life
          // Quick fade in, lingering fade out.
          const envelope = lifeT < 0.15 ? lifeT / 0.15 : 1 - (lifeT - 0.15) / 0.85
          const flicker = f.peak * envelope * (0.8 + 0.2 * Math.sin(age * 0.02 + f.seed))
          drawFlame(flameCtx, f.x, height, height, Math.max(flicker, 0))
        }

        if (t < 1 || flames.length > 0) {
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
          <canvas ref={flameCanvasRef} className="burn-reveal-canvas" aria-hidden="true" />
        </>
      )}
    </span>
  )
}

export default BurnReveal
