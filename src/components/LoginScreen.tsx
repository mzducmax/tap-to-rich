import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { LogIn, Mail, Boxes } from 'lucide-react';

const LAST_EMAIL_KEY = 'stack_last_email';

export function getLastLoginEmail(): string {
  return localStorage.getItem(LAST_EMAIL_KEY)?.trim() ?? '';
}

export function saveLastLoginEmail(email: string): void {
  localStorage.setItem(LAST_EMAIL_KEY, email.trim());
}

interface LoginScreenProps {
  onLogin: (email: string) => void;
  isLoading?: boolean;
  loadingMessage?: string;
  error?: string | null;
  defaultEmail?: string;
}

export default function LoginScreen({
  onLogin,
  isLoading = false,
  loadingMessage = 'Signing in...',
  error,
  defaultEmail = '',
}: LoginScreenProps) {
  const [email, setEmail] = useState(defaultEmail || getLastLoginEmail());

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || isLoading) return;
    onLogin(trimmed);
  };

  return (
    <div className="w-screen h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b] via-[#5facdf]/30 to-[#1e1b4b] pointer-events-none" />
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        {Array.from({ length: 24 }, (_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-twinkle"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 70}%`,
              width: 3,
              height: 3,
              animationDelay: `${(i % 5) * 0.6}s`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[28px] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg mb-4">
              <Boxes className="w-8 h-8 text-indigo-950" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Stack Box</h1>
            <p className="text-xs text-white/50 mt-1 font-medium">Sign in with Vlive Pro to play and receive live gifts</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="text-[10px] font-black uppercase tracking-widest text-white/50"
              >
                Account email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-black/35 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/50 disabled:opacity-60"
                />
              </div>
            </div>

            {error ? (
              <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-400/20 rounded-xl px-3 py-2.5 leading-relaxed">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-wide shadow-lg transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                  />
                  <span>{loadingMessage}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign in &amp; play</span>
                </>
              )}
            </button>
          </form>

          <p className="text-[10px] text-white/35 text-center mt-6 leading-relaxed">
            A Vlive Pro account is required to connect TikTok live and sync the leaderboard.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
