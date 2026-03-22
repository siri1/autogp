'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SAMPLE_USERS, ROLE_LABELS, ROLE_COLORS, type Role } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Wrench, Shield, Zap, BarChart3, CheckCircle } from 'lucide-react';

// Show superadmin first (separate callout), then workshop roles
const DEMO_ACCOUNTS = SAMPLE_USERS.map(u => ({
  name:  u.name,
  email: u.email,
  pass:  u.password,
  role:  u.role as Role,
}));

const SUPERADMIN_ACCOUNT = DEMO_ACCOUNTS.find(a => a.role === 'superadmin')!;
const WORKSHOP_ACCOUNTS  = DEMO_ACCOUNTS.filter(a => a.role !== 'superadmin');

const FEATURES = [
  { icon: Wrench,    text: 'Full workshop job management' },
  { icon: BarChart3, text: 'Real-time KPIs & analytics'   },
  { icon: Shield,    text: 'Role-based access control'     },
  { icon: Zap,       text: 'Fast, multilingual interface'  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400)); // brief UX delay
    const ok = login(email, password);
    if (!ok) setError('Invalid email or password. Try a demo account below.');
    setLoading(false);
  };

  const quickLogin = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT: Hero panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden bg-slate-950">
        {/* Background gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, #1d4ed8 0%, transparent 50%),
                              radial-gradient(circle at 60% 80%, #0f172a 0%, transparent 50%)`,
          }}
        />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-12 flex-1 flex flex-col justify-center">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-2xl tracking-tight">AutoGP</h1>
                <p className="text-blue-400 text-xs font-medium tracking-widest uppercase">Workshop Management</p>
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-10">
            <h2 className="text-5xl font-extrabold text-white leading-tight mb-4">
              Drive your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                workshop forward
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              The complete management platform for modern automotive workshops — from first inspection to final invoice.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="relative z-10 p-12 pt-0">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            <span>Angolan GAAP compliant · ISO 9001 ready · RGPD data privacy</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login form ── */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 bg-white lg:px-16 xl:px-24">
        <div className="max-w-md w-full mx-auto">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Wrench className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">AutoGP</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-slate-900 mb-1">Welcome back</h3>
            <p className="text-slate-500 text-sm">Sign in to access your workshop dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
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
                  Signing in…
                </span>
              ) : 'Sign in'}
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">Demo accounts</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* SuperAdmin callout */}
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

            {/* Workshop role accounts */}
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
            <p className="text-center text-xs text-slate-400 mt-3">Click a card to prefill credentials, then sign in</p>
          </div>
        </div>
      </div>
    </div>
  );
}
