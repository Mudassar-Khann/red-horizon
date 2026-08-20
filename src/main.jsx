import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import './styles.css'
import './overrides.css'

gsap.registerPlugin(ScrollTrigger)

const chapters = [['01', 'Signal', 'signal'], ['02', 'Momentum', 'momentum'], ['03', 'Horizon', 'horizon'], ['04', 'Departure', 'departure']]

// Ambient chapter glow — the "world shifts as you walk" mood continuity
const AMBIENT = {
  arrival: ['#3874c7', '#0a2c75'],
  signal: ['#2560bc', '#081f54'],
  momentum: ['#ff7a42', '#f04a30'],
  horizon: ['#f3dfb4', '#cbb188'],
  departure: ['#1a3a73', '#041638'],
}

// Editorially styled headline with masked word-level reveals
const Headline = ({ lines }) => (
  <h2 className="story-headline">
    {lines.map((line, i) => (
      <span className="hl-line" key={i}>
        {line.map((w, j) => {
          const t = typeof w === 'string' ? w : w.t
          const em = typeof w === 'object' ? w.em : false
          return (
            <span className="hl-mask" key={j}>
              <span className={`hl-word${em ? ' accent' : ''}`}>{t}</span>
            </span>
          )
        })}
      </span>
    ))}
  </h2>
)

function App() {
  const rootRef = useRef(null)
  const [active, setActive] = useState('arrival')
  const [menuOpen, setMenuOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const reduced = reduceMotion.matches

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id) }),
      { rootMargin: '-42% 0px -42% 0px' }
    )
    root.querySelectorAll('[data-story]').forEach((section) => observer.observe(section))
    if (reduced) return () => observer.disconnect()

    // Buttery smooth scroll — the foundation of the scroll-storytelling feel
    let lenis = null
    if (!reduced) {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true, anchors: true })
      lenis.on('scroll', ScrollTrigger.update)
      const tick = (time) => lenis.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
      lenis._tick = tick
    }

    const ctx = gsap.context(() => {
      // Hero staged entrance
      gsap.from('.arrival-kicker, .arrival-title .word, .arrival-intro, .arrival-actions', { y: 42, opacity: 0, stagger: .09, duration: .9, ease: 'power4.out', delay: .2 })

      // Generic section reveals
      gsap.utils.toArray('.story-reveal').forEach((element) =>
        gsap.fromTo(element, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 78%', once: true } })
      )

      // Masked word-level headline reveals (staggered, editorial)
      gsap.utils.toArray('.story-headline').forEach((h2) =>
        gsap.fromTo(h2.querySelectorAll('.hl-word'), { yPercent: 120 }, { yPercent: 0, duration: .85, ease: 'power3.out', stagger: .03, delay: .22, scrollTrigger: { trigger: h2, start: 'top 86%', once: true } })
      )

      // Principle numbers masked reveal
      gsap.from('.principle-num', { yPercent: 120, duration: .55, ease: 'power3.out', stagger: .08, delay: .12, scrollTrigger: { trigger: '.rh-principles', start: 'top 88%', once: true } })

      // Image clip-path reveals (once)
      gsap.utils.toArray('.story-image').forEach((element) =>
        gsap.fromTo(element, { clipPath: 'inset(12% 12% 12% 12%)', scale: 1.08 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 82%', once: true } })
      )

      // Route-line narrative thread (overall scroll progress)
      gsap.fromTo('.route-line', { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: true } })

      // Hero depth
      gsap.to('.arrival-image', { yPercent: 10, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '#arrival', start: 'top top', end: 'bottom top', scrub: true } })
      gsap.to('.arrival-title', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '#arrival', start: 'top top', end: 'bottom top', scrub: true } })

      // Differential parallax — copy and imagery drift at different rates
      gsap.to('.rh-signal .rh-figure', { yPercent: -7, ease: 'none', scrollTrigger: { trigger: '.rh-signal', start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.to('.rh-signal .rh-section-copy', { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.rh-signal', start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.to('.rh-momentum .momentum-figure', { yPercent: -9, ease: 'none', scrollTrigger: { trigger: '.rh-momentum', start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.to('.rh-horizon .horizon-art', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.rh-horizon', start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.to('.rh-horizon .horizon-copy', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.rh-horizon', start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.to('.rh-departure .departure-image', { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.rh-departure', start: 'top bottom', end: 'bottom top', scrub: true } })

      // Sticky chapter-number drift
      gsap.utils.toArray('.chapter-number').forEach((element) =>
        gsap.to(element, { y: -35, ease: 'none', scrollTrigger: { trigger: element.closest('[data-story]'), start: 'top bottom', end: 'bottom top', scrub: true } })
      )

      // Line draw
      gsap.utils.toArray('.line-draw').forEach((element) =>
        gsap.fromTo(element, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 82%', once: true } })
      )
    }, root)

    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)

    return () => {
      observer.disconnect()
      window.removeEventListener('load', refresh)
      if (lenis) { lenis.destroy(); gsap.ticker.remove(lenis._tick) }
      ctx.revert()
    }
  }, [])

  return <div ref={rootRef} className="red-horizon-site">
    <a className="skip-link" href="#signal">Skip to story</a>
    <header className={`rh-nav ${active === 'horizon' ? 'is-dark' : ''}`}>
      <a href="#arrival" className="rh-mark"><span>RH</span><small>Red Horizon<br />Field Notes</small></a>
      <button className={menuOpen ? 'rh-menu is-open' : 'rh-menu'} aria-expanded={menuOpen} aria-controls="rh-nav" onClick={() => setMenuOpen(!menuOpen)}>
        <span className="menu-bars" aria-hidden="true"><i /><i /></span>Index
      </button>
      <nav id="rh-nav" className={menuOpen ? 'rh-links is-open' : 'rh-links'} aria-label="Primary navigation">
        {chapters.map(([number, label, id]) => <a key={id} href={`#${id}`} aria-current={active === id ? 'step' : undefined} onClick={() => setMenuOpen(false)}><span>{number}</span>{label}</a>)}
      </nav>
    </header>
    <aside className="rh-index" aria-label="Story index">
      {chapters.map(([number, label, id]) => <a key={id} className={active === id ? 'is-active' : ''} aria-current={active === id ? 'step' : undefined} href={`#${id}`}><b>{number}</b><span>{label}</span></a>)}
    </aside>
    <div className="ambient" aria-hidden="true" style={{ '--g1': AMBIENT[active][0], '--g2': AMBIENT[active][1] }} />
    <div className="route-line" aria-hidden="true" />
    <main>
      <section id="arrival" data-story className="rh-hero">
        <div className="hero-copy">
          <p className="rh-kicker arrival-kicker">A visual essay on forward motion / 2026</p>
          <h1 className="arrival-title"><span className="word">The road</span><span className="word accent">appears</span><span className="word">when you move.</span></h1>
          <p className="arrival-intro">There is no perfect map. Only the quiet decision to take the next visible step.</p>
          <div className="arrival-actions"><a className="rh-button" href="#signal">Begin the walk <span>↘</span></a><span className="rh-caption">01—04 / a field guide</span></div>
        </div>
        <div className="hero-art">
          <img className="story-image arrival-image" src="/images/hero-red-horizon.webp" alt="A reflective route crossing a red horizon toward a lone walker" decoding="async" />
          <div className="hero-art-label">The route<br />is the message</div>
        </div>
        <div className="hero-footer"><span>33° 41′ S / 18° 25′ E</span><span>Scroll to enter ↓</span></div>
      </section>

      <section id="signal" data-story className="rh-section rh-signal">
        <div className="chapter-number">01</div>
        <div className="rh-section-copy story-reveal">
          <p className="rh-kicker">The signal</p>
          <Headline lines={[['It', 'starts', 'as'], [{ t: 'a', em: true }, { t: 'flicker.', em: true }]]} />
          <p>Before the plan, there is a pull. A color in the distance. A line that only appears when you stop asking for directions.</p>
          <div className="line-draw" /><span className="section-note">Notice what keeps returning.</span>
        </div>
        <figure className="rh-figure story-reveal">
          <img className="story-image" src="/images/signal-opening.webp" alt="A blue field opening into a red horizon with a reflective route" loading="lazy" decoding="async" />
          <figcaption><span>01 / Signal</span><span>First light on the path</span></figcaption>
        </figure>
      </section>

      <section id="momentum" data-story className="rh-section rh-momentum">
        <div className="chapter-number">02</div>
        <div className="momentum-head story-reveal">
          <p className="rh-kicker">The momentum</p>
          <Headline lines={[['Follow', 'what'], [{ t: 'keeps', em: true }, { t: 'moving.', em: true }]]} />
        </div>
        <figure className="momentum-figure story-reveal">
          <img className="story-image" src="/images/momentum-split.webp" alt="A reflective route splitting through a vermilion field" loading="lazy" decoding="async" />
          <figcaption>Two directions can still belong to the same story.</figcaption>
        </figure>
        <div className="rh-principles">
          <article><span className="principle-mask"><b className="principle-num">01</b></span><h3>Leave room</h3><p>For the version of the story you could not have planned.</p></article>
          <article><span className="principle-mask"><b className="principle-num">02</b></span><h3>Stay open</h3><p>Let the landscape change the question. Let the question change you.</p></article>
          <article><span className="principle-mask"><b className="principle-num">03</b></span><h3>Keep moving</h3><p>Direction is something you recognize in retrospect.</p></article>
        </div>
      </section>

      <section id="horizon" data-story className="rh-section rh-horizon">
        <div className="horizon-art"><img className="story-image" src="/images/horizon-sunline.webp" alt="A pale sun resting on a thin red horizon" loading="lazy" decoding="async" /></div>
        <div className="horizon-copy story-reveal">
          <p className="rh-kicker">The horizon</p>
          <Headline lines={[['The', 'path', 'gets', 'wider'], [{ t: 'as', em: true }, { t: 'you', em: true }, { t: 'walk.', em: true }]]} />
          <p>Not because the world has become simpler. Because you have.</p>
          <div className="horizon-coordinate">03<br /><span>the widening</span></div>
        </div>
      </section>

      <section id="departure" data-story className="rh-departure">
        <img className="story-image departure-image" src="/images/destination-horizon.webp" alt="A reflective route crossing a red horizon toward a distant walker" loading="lazy" decoding="async" />
        <div className="departure-overlay" />
        <div className="departure-copy story-reveal">
          <p className="rh-kicker">A note for the road ahead</p>
          <Headline lines={[['Keep', 'a', 'little'], [{ t: 'red', em: true }, { t: 'in', em: true }, { t: 'the', em: true }, { t: 'blue.', em: true }]]} />
          <p>For the days when the destination is still a question.</p>
          <form className={submitted ? 'rh-form is-success' : 'rh-form'} onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }}>
            <label htmlFor="field-note-email">Send me the next field note</label>
            <div>
              <input id="field-note-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
              <button className="rh-button" type="submit">{submitted ? 'You are on the list' : 'Take the next step'} <span>↗</span></button>
            </div>
          </form>
        </div>
        <div className="departure-footer"><span>RED HORIZON / 04</span><span>Made for the in-between</span><span>© 2026</span></div>
      </section>
    </main>
  </div>
}

createRoot(document.getElementById('root')).render(<App />)

