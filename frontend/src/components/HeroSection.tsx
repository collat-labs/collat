import { useRef, useEffect, useCallback } from 'react'
import { ArrowUpRight, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const HERO_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4'

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const animatingRef = useRef(false)

  const fadeTo = useCallback(
    (targetOpacity: number, duration: number, onComplete?: () => void) => {
      const video = videoRef.current
      if (!video || animatingRef.current) return
      animatingRef.current = true
      const startOpacity = video.style.opacity ? parseFloat(video.style.opacity) : 0
      const startTime = performance.now()

      function step(now: number) {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2
        const current = startOpacity + (targetOpacity - startOpacity) * eased
        if (video) video.style.opacity = String(current)
        if (progress < 1) {
          requestAnimationFrame(step)
        } else {
          if (video) video.style.opacity = String(targetOpacity)
          animatingRef.current = false
          onComplete?.()
        }
      }
      requestAnimationFrame(step)
    },
    [],
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.style.opacity = '0'

    const onCanPlay = () => {
      video.play()
      fadeTo(1, 500)
    }

    const onTimeUpdate = () => {
      if (!video || animatingRef.current) return
      const remaining = video.duration - video.currentTime
      if (remaining <= 0.55 && video.style.opacity !== '0') {
        fadeTo(0, 500)
      }
    }

    const onEnded = () => {
      if (!video) return
      video.style.opacity = '0'
      setTimeout(() => {
        if (!video) return
        video.currentTime = 0
        video.play()
        fadeTo(1, 500)
      }, 100)
    }

    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('ended', onEnded)

    return () => {
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('ended', onEnded)
    }
  }, [fadeTo])

  return (
    <section className="min-h-screen overflow-hidden relative flex flex-col">
      <video
        ref={videoRef}
        src={HERO_VIDEO}
        muted
        autoPlay
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover object-bottom"
      />

      <Navbar />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[5%]">
        <h1 className="text-7xl md:text-8xl lg:text-9xl text-white tracking-tight whitespace-nowrap font-serif-display">
          Bank on{' '}
          <em className="italic text-red-500">Bitcoin</em>
        </h1>

        <p className="mt-8 text-white/50 text-sm md:text-base leading-relaxed max-w-lg px-4">
          Deposit BTC once. Spend MUSD anywhere. Collat auto-borrows at checkout
          so you never sell your Bitcoin. Just use it.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/dashboard"
            className="liquid-glass rounded-full px-8 py-4 text-white text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <Zap size={16} className="text-red-500" />
            Launch App
            <ArrowUpRight size={14} />
          </Link>
          <a
            href="#how-it-works"
            className="liquid-glass rounded-full px-8 py-4 text-white/70 text-sm font-medium hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            How it Works ↓
          </a>
        </div>
      </div>

      <Footer />
    </section>
  )
}
