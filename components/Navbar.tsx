'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handler = () => setMobileOpen(false)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const links = [
    { href: '/salaries', label: 'Salaries' },
    { href: '/companies', label: 'Companies' },
    { href: '/compare', label: 'Compare' },
    { href: '/predict', label: 'Predict' },
    { href: '/levels', label: 'Levels' },
  ]

  return (
    <nav
      suppressHydrationWarning
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(10,10,15,0.90)' : 'rgba(10,10,15,0.5)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: scrolled ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(255,255,255,0.06)',
        boxShadow: scrolled ? '0 4px 40px rgba(0,0,0,0.4), 0 0 0 0 transparent' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-12"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
              boxShadow: '0 0 20px rgba(99,102,241,0.5)',
            }}
          >
            CI
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Comp
            <span
              style={{
                background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              IQ
            </span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                href={href}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 relative group"
                style={{
                  color: active ? '#818cf8' : '#94a3b8',
                  background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                  border: active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                }}
              >
                {label}
                {!active && (
                  <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          {!mounted ? (
            <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />
          ) : status === 'loading' ? (
            <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />
          ) : session ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 hover:scale-105 group"
                style={{
                  background: profileOpen ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                  border: profileOpen ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: profileOpen ? '0 0 15px rgba(99,102,241,0.2)' : 'none',
                }}
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="avatar"
                    className="w-7 h-7 rounded-full"
                    style={{
                      border: '2px solid rgba(99,102,241,0.5)',
                      boxShadow: '0 0 8px rgba(99,102,241,0.3)',
                    }}
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#22d3ee)' }}
                  >
                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="text-sm text-slate-300 hidden lg:block max-w-[100px] truncate">
                  {session.user?.name?.split(' ')[0]}
                </span>
                <svg
                  className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {profileOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 rounded-2xl overflow-hidden z-50"
                  style={{
                    background: 'rgba(13,11,26,0.98)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    boxShadow:
                      '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1), 0 0 40px rgba(99,102,241,0.1)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div
                    className="px-4 py-4"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(34,211,238,0.05))',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt="avatar"
                          className="w-10 h-10 rounded-full"
                          style={{
                            border: '2px solid rgba(99,102,241,0.5)',
                            boxShadow: '0 0 12px rgba(99,102,241,0.3)',
                          }}
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ background: 'linear-gradient(135deg,#6366f1,#22d3ee)' }}
                        >
                          {session.user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{session.user?.name || 'User'}</p>
                        <p className="text-slate-400 text-xs truncate">{session.user?.email}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-green-400">Verified contributor</span>
                    </div>
                  </div>

                  <div className="p-2">
                    {[
                      { icon: 'S', label: 'My Submissions', sub: 'View your salary entries', href: '/salaries?mine=true' },
                      { icon: '+', label: 'Submit Salary', sub: 'Add a new entry', href: '/submit' },
                      { icon: 'C', label: 'Compare Tools', sub: 'Compare companies', href: '/compare' },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 hover:scale-[1.02] group w-full"
                        style={{ color: 'inherit', textDecoration: 'none' }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.background = 'rgba(99,102,241,0.1)'
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-sm font-bold text-indigo-300">
                          {item.icon}
                        </span>
                        <div>
                          <p className="text-white text-sm font-medium">{item.label}</p>
                          <p className="text-slate-500 text-xs">{item.sub}</p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 12px' }} />

                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false)
                        signOut({ callbackUrl: '/' })
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left group"
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-sm font-bold text-red-300">
                        X
                      </span>
                      <div>
                        <p className="text-red-400 text-sm font-medium group-hover:text-red-300 transition-colors">Sign Out</p>
                        <p className="text-slate-600 text-xs">See you next time</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => signIn('google')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all hover:scale-105"
              style={{
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'
                event.currentTarget.style.background = 'rgba(99,102,241,0.08)'
                event.currentTarget.style.boxShadow = '0 0 15px rgba(99,102,241,0.2)'
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                event.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                event.currentTarget.style.boxShadow = 'none'
              }}
            >
              Login with Google
            </button>
          )}

          <Link
            href="/submit"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 hidden md:flex items-center gap-1.5"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 0 20px rgba(99,102,241,0.35)',
            }}
          >
            <span>+</span> Submit Salary
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg transition-all"
            style={{
              background: mobileOpen ? 'rgba(99,102,241,0.15)' : 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileOpen}
          >
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden absolute top-16 inset-x-0 z-50"
          style={{
            background: 'rgba(10,10,15,0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div className="px-4 py-4 space-y-1">
            {links.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                  style={{
                    background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: active ? '#818cf8' : '#94a3b8',
                    border: active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                  }}
                >
                  <span className="text-sm font-medium">{label}</span>
                  {active && (
                    <span className="ml-auto text-indigo-400 text-xs">
                      *
                    </span>
                  )}
                </Link>
              )
            })}

            <div className="pt-2 border-t border-slate-800">
              {session ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-4 py-3">
                    {session.user?.image ? (
                      <img src={session.user.image} className="w-8 h-8 rounded-full" alt="avatar" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                        {session.user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{session.user?.name}</p>
                      <p className="text-slate-500 text-xs truncate">{session.user?.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/submit"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    }}
                  >
                    + Submit Salary
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      signOut({ callbackUrl: '/' })
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 text-sm font-medium"
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.15)',
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false)
                    signIn('google')
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-medium"
                  style={{
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.3)',
                  }}
                >
                  Login with Google
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
