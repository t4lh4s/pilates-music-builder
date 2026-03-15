'use client'
import { useState, useEffect } from 'react'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  function handleEnter() {
    setLeaving(true)
    setTimeout(onEnter, 600)
  }

  return (
    <div className={`min-h-screen transition-opacity duration-600 ${leaving ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'linear-gradient(160deg, #1a2e1a 0%, #2d4a2d 30%, #1e3a2e 60%, #0f1f0f 100%)' }}>

      {/* Grain overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-30"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")', backgroundSize: '200px' }}/>

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #7ab87a 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}/>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #4a7c59 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }}/>
      </div>

      {/* Nav */}
      <nav className={`relative z-10 flex items-center justify-between px-8 py-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ background: 'rgba(122, 184, 122, 0.2)', border: '1px solid rgba(122, 184, 122, 0.3)' }}>
            🧘
          </div>
          <span className="text-white font-semibold tracking-wide text-sm">Pilates Music Builder</span>
        </div>
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-medium px-4 py-2 rounded-full transition-all duration-200"
                style={{ color: '#8bc88b' }}>
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="text-sm font-semibold px-5 py-2 rounded-full transition-all duration-200 hover:scale-105"
                style={{ background: 'rgba(122, 184, 122, 0.15)', border: '1px solid rgba(122, 184, 122, 0.4)', color: '#a8d4a8' }}>
                Get started →
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <button onClick={handleEnter}
              className="text-sm font-semibold px-5 py-2 rounded-full transition-all duration-200 hover:scale-105"
              style={{ background: 'rgba(122, 184, 122, 0.15)', border: '1px solid rgba(122, 184, 122, 0.4)', color: '#a8d4a8' }}>
              Open App →
            </button>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-8 h-8' } }}/>
          </SignedIn>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 pt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: copy */}
          <div className={`transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-8 tracking-wider uppercase"
              style={{ background: 'rgba(122, 184, 122, 0.1)', border: '1px solid rgba(122, 184, 122, 0.25)', color: '#8bc88b' }}>
              ✦ Built for Pilates Instructors
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6"
              style={{ fontFamily: 'Georgia, serif', color: '#f0f7f0' }}>
              Your class.<br/>
              <span style={{ color: '#7ab87a' }}>Perfectly</span><br/>
              soundtracked.
            </h1>

            <p className="text-lg leading-relaxed mb-10" style={{ color: '#8aab8a' }}>
              Stop wasting hours matching songs to exercises. Pilates Music Builder knows your blocks,
              reads your movements, and finds music that fits — so you can focus on teaching.
            </p>

            <div className="flex flex-col gap-3">
              {/* Primary CTA — sign up */}
              <SignedOut>
                <SignUpButton mode="modal">
                  <button
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold transition-all duration-200 hover:scale-105 hover:shadow-lg text-center"
                    style={{ background: 'linear-gradient(135deg, #5a9e5a, #3d7a3d)', color: 'white', boxShadow: '0 4px 24px rgba(90, 158, 90, 0.3)' }}>
                    Create Free Account
                  </button>
                </SignUpButton>
                <div className="flex items-center gap-3">
                  <span className="text-sm" style={{ color: '#6a8a6a' }}>Already have an account?</span>
                  <SignInButton mode="modal">
                    <button className="text-sm font-semibold underline underline-offset-2 transition-colors"
                      style={{ color: '#7ab87a' }}>
                      Sign in
                    </button>
                  </SignInButton>
                </div>
                <button onClick={handleEnter}
                  className="text-sm transition-colors"
                  style={{ color: '#4a6a4a' }}>
                  Continue without account →
                </button>
              </SignedOut>

              {/* If signed in, go straight to app */}
              <SignedIn>
                <button onClick={handleEnter}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold transition-all duration-200 hover:scale-105 text-center"
                  style={{ background: 'linear-gradient(135deg, #5a9e5a, #3d7a3d)', color: 'white', boxShadow: '0 4px 24px rgba(90, 158, 90, 0.3)' }}>
                  Open My App →
                </button>
              </SignedIn>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 mt-10">
              <div className="flex -space-x-2">
                {['🧘', '💪', '⭐', '🌿', '✨'].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-sm border-2"
                    style={{ background: 'rgba(45, 74, 45, 0.9)', borderColor: 'rgba(90, 158, 90, 0.3)' }}>
                    {e}
                  </div>
                ))}
              </div>
              <p className="text-sm" style={{ color: '#6a8a6a' }}>
                <span style={{ color: '#8bc88b' }} className="font-semibold">Instructors worldwide</span> are planning smarter
              </p>
            </div>
          </div>

          {/* Right: app preview card */}
          <div className={`transition-all duration-700 delay-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(122, 184, 122, 0.15)', backdropFilter: 'blur(20px)' }}>
              <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(122, 184, 122, 0.1)' }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }}/>
                  <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }}/>
                  <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }}/>
                </div>
                <span className="text-xs font-medium mx-auto" style={{ color: '#6a8a6a' }}>Class Builder — Mat Pilates · 55 min · Intermediate</span>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { emoji: '🌅', name: 'Warm Up', bpm: '60–78', time: '8:32', pct: 85, color: '#4a90d9' },
                  { emoji: '🧍', name: 'Standing Work', bpm: '75–92', time: '11:47', pct: 98, color: '#4ab87a' },
                  { emoji: '💪', name: 'Floor Work', bpm: '85–105', time: '14:23', pct: 96, color: '#6ab87a', active: true },
                  { emoji: '🔥', name: 'Peak Work', bpm: '100–130', time: '0:00', pct: 0, color: '#d97a4a' },
                  { emoji: '🧘', name: 'Cool Down', bpm: '60–78', time: '7:15', pct: 72, color: '#9a7acd' },
                ].map((block, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{
                      background: block.active ? 'rgba(122, 184, 122, 0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${block.active ? 'rgba(122, 184, 122, 0.3)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                    <span className="text-lg">{block.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold" style={{ color: '#c8e0c8' }}>{block.name}</span>
                        <span className="text-xs font-mono" style={{ color: '#6a8a6a' }}>{block.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div className="h-full rounded-full" style={{ width: `${block.pct}%`, background: block.color }}/>
                        </div>
                        <span className="text-xs" style={{ color: '#5a7a5a' }}>{block.bpm}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(122, 184, 122, 0.1)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a7a5a' }}>Energy Arc</span>
                    <span className="text-xs" style={{ color: '#5a7a5a' }}>41:57 / 55m</span>
                  </div>
                  <svg viewBox="0 0 240 40" className="w-full" style={{ height: '40px' }}>
                    <defs>
                      <linearGradient id="heroArcGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7ab87a" stopOpacity="0.4"/>
                        <stop offset="100%" stopColor="#7ab87a" stopOpacity="0.02"/>
                      </linearGradient>
                    </defs>
                    <path d="M 10 32 C 50 32, 50 20, 70 18 C 90 16, 110 10, 130 6 C 150 2, 170 28, 210 30"
                      fill="none" stroke="#7ab87a" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M 10 32 C 50 32, 50 20, 70 18 C 90 16, 110 10, 130 6 C 150 2, 170 28, 210 30 L 210 40 L 10 40 Z"
                      fill="url(#heroArcGrad)"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 py-20"
        style={{ borderTop: '1px solid rgba(122, 184, 122, 0.1)' }}>
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif', color: '#f0f7f0' }}>
            Everything you need to plan a class
          </h2>
          <p style={{ color: '#6a8a6a' }}>Two powerful tools. One seamless workflow.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {[
            {
              icon: '🎵',
              title: 'Song Browser',
              desc: 'Browse 746 curated tracks filtered by BPM, genre, tempo, and duration. Every song hand-picked for Pilates — no more searching Spotify for something that fits.',
              tags: ['BPM Filtering', 'Genre Sorting', 'Duration Control', 'Instant Search'],
            },
            {
              icon: '🏗️',
              title: 'Class Builder',
              desc: 'Build your full class structure in minutes. Pick Mat or Reformer, set your duration and level, select your movements — and let the music find itself.',
              tags: ['Mat & Reformer', 'Movement-Driven BPM', 'Block Structure', 'Energy Arc'],
            },
          ].map((f, i) => (
            <div key={i} className="rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02]"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(122, 184, 122, 0.12)' }}>
              <div className="text-4xl mb-5">{f.icon}</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#e0f0e0', fontFamily: 'Georgia, serif' }}>{f.title}</h3>
              <p className="leading-relaxed mb-5 text-sm" style={{ color: '#6a8a6a' }}>{f.desc}</p>
              <div className="flex flex-wrap gap-2">
                {f.tags.map(tag => (
                  <span key={tag} className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{ background: 'rgba(122, 184, 122, 0.1)', color: '#7ab87a', border: '1px solid rgba(122, 184, 122, 0.2)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: '⏱️', title: 'Save hours every week', desc: 'Instructors report cutting class prep time by 70%. Stop the endless Spotify rabbit hole.' },
            { icon: '🎯', title: 'BPM intelligence', desc: 'Select your movements and we calculate the perfect BPM. The Hundred wants 100 BPM. Swan Dive wants 78. We know.' },
            { icon: '📋', title: 'Export your full plan', desc: 'Equipment needed, movements, teaching notes, and tracklist — all in one document ready to copy or share.' },
          ].map((v, i) => (
            <div key={i} className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(122, 184, 122, 0.08)' }}>
              <div className="text-2xl mb-3">{v.icon}</div>
              <h4 className="font-semibold mb-2 text-sm" style={{ color: '#c0d8c0' }}>{v.title}</h4>
              <p className="text-xs leading-relaxed" style={{ color: '#5a7a5a' }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative z-10 max-w-2xl mx-auto px-8 py-20 text-center">
        <div className="rounded-3xl p-12"
          style={{ background: 'rgba(122, 184, 122, 0.06)', border: '1px solid rgba(122, 184, 122, 0.15)' }}>
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif', color: '#f0f7f0' }}>
            Ready to plan your best class yet?
          </h2>
          <p className="mb-8 text-sm" style={{ color: '#6a8a6a' }}>
            Free to start. No credit card required.
          </p>
          <SignedOut>
            <SignUpButton mode="modal">
              <button
                className="px-10 py-4 rounded-2xl text-base font-bold transition-all duration-200 hover:scale-105 mb-4"
                style={{ background: 'linear-gradient(135deg, #5a9e5a, #3d7a3d)', color: 'white', boxShadow: '0 4px 32px rgba(90, 158, 90, 0.25)' }}>
                Create Free Account
              </button>
            </SignUpButton>
            <div>
              <button onClick={handleEnter} className="text-xs transition-colors block mx-auto mt-3"
                style={{ color: '#4a6a4a' }}>
                Or continue without account →
              </button>
            </div>
          </SignedOut>
          <SignedIn>
            <button onClick={handleEnter}
              className="px-10 py-4 rounded-2xl text-base font-bold transition-all duration-200 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #5a9e5a, #3d7a3d)', color: 'white', boxShadow: '0 4px 32px rgba(90, 158, 90, 0.25)' }}>
              Open My App →
            </button>
          </SignedIn>
          <p className="mt-4 text-xs" style={{ color: '#4a6a4a' }}>Works on any device · Save your classes · Access anywhere</p>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center pb-10">
        <p className="text-xs" style={{ color: '#3a5a3a' }}>
          © 2026 Pilates Music Builder · Built for instructors, by people who care about the practice
        </p>
      </div>
    </div>
  )
}
