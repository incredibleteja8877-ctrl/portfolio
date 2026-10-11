import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Wraps its children (meant for the hero name) in a canvas overlay that
 * "burns" away on mount, left to right, with a jagged charred edge and a
 * trailing ember glow -- like a page catching fire -- revealing the real
 * text underneath. The text itself is always real DOM (selectable,
 * crawlable, accessible); the canvas is a purely decorative one-shot
 * overlay that unmounts once the burn completes.
 *
 * IMPORTANT: the canvas must stay free of any CSS background. A CSS
 * background paints *behind* the canvas's own 2D-drawn pixels but *in
 * front of* whatever DOM sits behind the (absolutely positioned) canvas
 * element -- so clearRect() would only ever expose that CSS background,
 * never the real text. The opaque cover has to be drawn pixels, not CSS.
 */
function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function BurnReveal({ children, duration = 1500 }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  // Derived at init, not corrected afterward -- a reduced-motion visitor
  // never renders the canvas at all, rather than mounting it then
  // immediately setState-ing it away inside the effect.
  const [burning, setBurning] = useState(() => !prefersReducedMotion())

  useLayoutEffect(() => {
    if (!burning) return

    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    let cancelled = false
    let raf = null
    const ctx = canvas.getContext('2d')

    // Paint the opaque cover synchronously, before the browser's first
    // paint (useLayoutEffect, not useEffect) -- so there is no frame where
    // the real text is visible before the burn takes over.
    function paintCover() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = wrap.getBoundingClientRect()
      const width = Math.max(rect.width, 1)
      const height = Math.max(rect.height, 1)

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = '#111214'
      ctx.fillRect(0, 0, width, height)

      return { width, height }
    }

    paintCover()

    // Web fonts load async and can resize the text after first paint. The
    // cover above already hides any mismatch, so this just re-paints the
    // cover at the correct final size before the burn itself starts.
    const fontsReady = document.fonts?.ready ?? Promise.resolve()
    const safetyTimeout = new Promise((resolve) => setTimeout(resolve, 600))

    Promise.race([fontsReady, safetyTimeout]).then(() => {
      if (cancelled) return
      const { width, height } = paintCover()
      runBurn(width, height)
    })

    function runBurn(width, height) {
      const stripWidth = 4
      const stripCount = Math.ceil(width / stripWidth) + 1
      const maxOffset = 20
      // Each strip's burn front is jittered so the edge reads as an
      // irregular charred line, not a clean wipe.
      const offsets = Array.from({ length: stripCount }, () => (Math.random() - 0.5) * 2 * maxOffset)
      const burned = new Array(stripCount).fill(false)

      const sweepDistance = width + maxOffset * 2
      const start = performance.now()

      function drawEmber(x, h) {
        const grad = ctx.createLinearGradient(x, 0, x + 9, 0)
        grad.addColorStop(0, 'rgba(255,200,80,0)')
        grad.addColorStop(0.45, 'rgba(255,140,20,0.55)')
        grad.addColorStop(0.75, 'rgba(210,40,10,0.4)')
        grad.addColorStop(1, 'rgba(210,40,10,0)')
        ctx.globalCompositeOperation = 'lighter'
        ctx.fillStyle = grad
        ctx.fillRect(x - 2, 0, 11, h)
        ctx.globalCompositeOperation = 'source-over'
      }

      function frame(now) {
        const t = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - t, 2)
        const sweepX = eased * sweepDistance - maxOffset

        for (let i = 0; i < stripCount; i++) {
          if (burned[i]) continue
          const stripX = i * stripWidth
          if (stripX + offsets[i] > sweepX) continue
          burned[i] = true
          ctx.clearRect(stripX, 0, stripWidth + 0.5, height)
          drawEmber(stripX, height)
        }

        if (t < 1) {
          raf = requestAnimationFrame(frame)
        } else {
          // Drop the lingering ember streaks; the real text stays, clean.
          setTimeout(() => {
            if (cancelled) return
            setBurning(false)
          }, 180)
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
      {burning && <canvas ref={canvasRef} className="burn-reveal-canvas" aria-hidden="true" />}
    </span>
  )
}

export default BurnReveal
