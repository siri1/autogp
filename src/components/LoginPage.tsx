'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SAMPLE_USERS, ROLE_LABELS, ROLE_COLORS, type Role } from '@/lib/auth';
import { type Language, LANGUAGE_NAMES, LANGUAGE_FLAGS } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Wrench, Shield, Zap, BarChart3, CheckCircle, Globe } from 'lucide-react';

const LANGUAGES: Language[] = ['en', 'pt', 'es', 'zh', 'fr'];

const DEMO_ACCOUNTS = SAMPLE_USERS.map(u => ({
  name: u.name,
  email: u.email,
  pass: u.password,
  role: u.role as Role,
}));
const SUPERADMIN_ACCOUNT = DEMO_ACCOUNTS.find(a => a.role === 'superadmin')!;
const WORKSHOP_ACCOUNTS  = DEMO_ACCOUNTS.filter(a => a.role !== 'superadmin');

const WORKSHOP_IMAGE =
  'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=1600&q=80&auto=format&fit=crop';

export default function LoginPage() {
  const { login }               = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Close language dropdown on outside click
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const FEATURES = [
    { icon: Wrench,    text: t.loginFeature1 },
    { icon: BarChart3, text: t.loginFeature2 },
    { icon: Shield,    text: t.loginFeature3 },
    { icon: Zap,       text: t.loginFeature4 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const ok = login(email, password);
    if (!ok) setError(t.loginError);
    setLoading(false);
  };

  const quickLogin = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setError('');
  };

  // Split tagline: last word gets gradient colour
  const taglineWords = t.loginTagline.split(' ');
  const taglineHead  = taglineWords.slice(0, -1).join(' ');
  const taglineTail  = taglineWords.at(-1)!;

  return (
    <div className="min-h-screen flex">

      {/* ══ LEFT PANEL — workshop photo + hero ══════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col">

        {/* Image layer — contained inside its own overflow-hidden wrapper */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={WORKSHOP_IMAGE}
            alt="Automotive workshop"
            fill
            sizes="55vw"
            className="object-cover brightness-[0.35]"
            priority
          />
        </div>

        {/* Dark gradient overlay for additional depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-blue-950/60 to-slate-900/75 pointer-events-none" />
        {/* Subtle accent glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 15% 65%, rgba(59,130,246,0.18) 0%, transparent 60%)`,
          }}
        />

        {/* ── Top bar: logo + language picker ─────────────────────────────── */}
        <div className="relative z-20 flex items-center justify-between px-10 pt-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/40 flex-shrink-0">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl tracking-tight">AutoGP</h1>
              <p className="text-blue-400 text-[10px] font-medium tracking-widest uppercase">
                Workshop Management
              </p>
            </div>
          </div>

          {/* Language picker — managed by LoginPage state, no sub-component */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/20 transition-all"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{LANGUAGE_FLAGS[language]}</span>
              <span>{LANGUAGE_NAMES[language]}</span>
            </button>

            {langOpen && (
              <div className="absolute top-full right-0 mt-2 w-44 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang); setLangOpen(false); }}
                    className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors ${
                      lang === language
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base">{LANGUAGE_FLAGS[lang]}</span>
                    <span>{LANGUAGE_NAMES[lang]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Centre hero copy ─────────────────────────────────────────────── */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-10">
          <h2 className="text-5xl font-extrabold text-white leading-tight mb-5 drop-shadow-lg">
            {taglineHead}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              {taglineTail}
            </span>
          </h2>

          <p className="text-slate-200 text-[15px] leading-relaxed max-w-md mb-10 drop-shadow">
            {t.loginTaglineDesc}
          </p>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-blue-300" />
                </div>
                <span className="text-slate-100 text-sm drop-shadow">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom trust strip ───────────────────────────────────────────── */}
        <div className="relative z-10 px-10 pb-8">
          <div className="flex items-center gap-2 text-slate-300 text-xs">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
            <span>{t.loginBadge}</span>
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL — login form ════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col bg-white">

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-6 pt-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Wrench className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">AutoGP</span>
          </div>
          {/* Mobile: flag row */}
          <div className="flex gap-1">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                title={LANGUAGE_NAMES[lang]}
                className={`px-1.5 py-1 rounded text-sm transition-all ${
                  lang === language ? 'bg-blue-100 scale-110' : 'opacity-50 hover:opacity-80'
                }`}
              >
                {LANGUAGE_FLAGS[lang]}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto flex flex-col justify-center px-8 py-10 lg:px-14 xl:px-20">
          <div className="max-w-md w-full mx-auto">

            <div className="mb-8">
              <h3 className="text-3xl font-bold text-slate-900 mb-1">{t.loginWelcome}</h3>
              <p className="text-slate-500 text-sm">{t.loginSubtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t.loginEmail}
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@autogp.ao"
                  required
                  autoFocus
                  className="h-11"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t.loginPassword}
                </label>
                <div className="relative">
                  <Input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    {t.loginSigningIn}
                  </span>
                ) : t.loginSignIn}
              </Button>
            </form>

            {/* Demo accounts */}
            <div className="mt-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">{t.loginDemoAccounts}</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <button
                type="button"
                onClick={() => quickLogin(SUPERADMIN_ACCOUNT.email, SUPERADMIN_ACCOUNT.pass)}
                className="w-full mb-3 p-3 rounded-xl border-2 border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 text-left transition-all hover:shadow-sm hover:border-rose-300 active:scale-[0.99]"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-500 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-rose-700">{SUPERADMIN_ACCOUNT.name}</div>
                    <div className="text-[10px] text-rose-500">Platform Super Admin — manages all business instances</div>
                  </div>
                </div>
              </button>

              <div className="grid grid-cols-2 gap-2">
                {WORKSHOP_ACCOUNTS.map(acc => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => quickLogin(acc.email, acc.pass)}
                    className={`p-2.5 rounded-lg border text-left transition-all hover:shadow-sm active:scale-95 ${ROLE_COLORS[acc.role]}`}
                  >
                    <div className="font-semibold text-xs leading-tight">{acc.name}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{ROLE_LABELS[acc.role]}</div>
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-slate-400 mt-3">{t.loginDemoHint}</p>
            </div>
          </div>
        </div>

        {/* Desktop: flag row footer */}
        <div className="hidden lg:flex items-center justify-center gap-1 py-5">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              title={LANGUAGE_NAMES[lang]}
              className={`px-2 py-1 rounded-lg text-sm transition-all ${
                lang === language
                  ? 'bg-blue-100 text-blue-700 font-semibold scale-110'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              {LANGUAGE_FLAGS[lang]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
