import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { LogIn, Mail } from 'lucide-react';
import vliveProLogo from '../assets/img/vlive-pro.png';

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

/** Spinning gold coin with a $ sign. */
function Coin({ size = 28 }: { size?: number }) {
  return (
    <div
      className="oc-coin-spin rounded-full flex items-center justify-center font-black text-amber-800 select-none"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.55,
        background: 'radial-gradient(circle at 35% 30%, #fff3b0, #ffcf3f 45%, #f59e0b 75%, #b45309)',
        boxShadow: 'inset 0 -2px 4px rgba(180,83,9,0.6), inset 0 2px 3px rgba(255,255,255,0.7), 0 2px 6px rgba(0,0,0,0.25)',
        border: '2px solid #fbbf24',
      }}
    >
      $
    </div>
  );
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

  // Pre-computed falling coins (deterministic positions)
  const coins = Array.from({ length: 14 }, (_, i) => ({
    left: `${(i * 53 + 7) % 100}%`,
    size: 14 + ((i * 7) % 20),
    delay: (i % 7) * 0.9,
    duration: 6 + ((i * 3) % 6),
  }));

  return (
    <div className="w-screen h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#f59e0b]">
      {/* Warm radial base */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, #ffe082 0%, #ffb300 35%, #fb8c00 70%, #e65100 100%)',
        }}
      />

      {/* Rotating sunburst rays */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="oc-rays-spin"
          style={{
            width: '180vmax',
            height: '180vmax',
            background:
              'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.18) 0deg 7deg, transparent 7deg 14deg)',
            maskImage: 'radial-gradient(circle, black 0%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Falling coins */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {coins.map((c, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: c.left,
              top: 0,
              animation: `oc-coin-fall ${c.duration}s linear ${c.delay}s infinite`,
            }}
          >
            <Coin size={c.size} />
          </div>
        ))}
      </div>

      {/* Soft vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_55%,rgba(120,53,15,0.45)_100%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="relative w-full max-w-md"
      >
        {/* Hammer + coin hero */}
        <div className="flex flex-col items-center text-center mb-6 relative z-10">
          <div className="relative oc-float-bob mb-2" style={{ width: 120, height: 120 }}>
            {/* impact flash */}
            <div
              className="oc-impact absolute left-1/2 top-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 90,
                height: 90,
                background: 'radial-gradient(circle, #fffbe6 0%, #ffd24a 45%, transparent 70%)',
              }}
            />
            {/* coin being smashed */}
            <div className="absolute left-1/2 bottom-1 -translate-x-1/2">
              <Coin size={56} />
            </div>
            {/* hammer */}
            <div
              className="oc-hammer-bounce absolute right-0 top-0 text-6xl"
              style={{ filter: 'drop-shadow(0 6px 6px rgba(120,53,15,0.5))' }}
            >
              🔨
            </div>
          </div>

          <h1
            className="oc-title-pop font-black tracking-tight leading-none oc-text-gold"
            style={{
              fontSize: 52,
              fontFamily: 'var(--font-heading)',
              filter: 'drop-shadow(0 3px 0 rgba(120,53,15,0.55)) drop-shadow(0 6px 10px rgba(0,0,0,0.25))',
              WebkitTextStroke: '2px rgba(146,64,14,0.55)',
            }}
          >
            ONLY CLICK
          </h1>
          <p className="text-sm font-bold text-amber-900/80 mt-1 tracking-wide drop-shadow-sm">
            Smash the coin — just click for gold! 💰
          </p>
        </div>

        {/* Card */}
        <div
          className="relative rounded-[28px] p-7 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(255,251,235,0.96), rgba(254,243,199,0.94))',
            border: '3px solid #fbbf24',
            boxShadow:
              '0 24px 70px rgba(120,53,15,0.45), inset 0 2px 0 rgba(255,255,255,0.9), inset 0 -3px 8px rgba(180,83,9,0.18)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="text-[11px] font-black uppercase tracking-widest text-amber-700"
              >
                Account email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
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
                  className="w-full bg-white border-2 border-amber-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold text-amber-950 placeholder:text-amber-300 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-300/40 disabled:opacity-60 transition-all"
                />
              </div>
            </div>

            {error ? (
              <p className="text-xs font-semibold text-rose-700 bg-rose-100 border-2 border-rose-300 rounded-xl px-3 py-2.5 leading-relaxed">
                {error}
              </p>
            ) : null}

            <motion.button
              type="submit"
              disabled={isLoading || !email.trim()}
              whileHover={{ scale: isLoading ? 1 : 1.03 }}
              whileTap={{ scale: isLoading ? 1 : 0.96 }}
              className="relative w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-amber-950 font-black text-base uppercase tracking-wide overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(180deg, #ffe066 0%, #ffc107 45%, #ff9800 100%)',
                border: '2px solid #fff3c4',
                boxShadow:
                  '0 8px 0 #c2740a, 0 12px 18px rgba(120,53,15,0.4), inset 0 2px 0 rgba(255,255,255,0.7)',
              }}
            >
              {/* shine sweep */}
              {!isLoading && (
                <span
                  className="oc-shine-sweep absolute top-0 left-0 h-full w-1/3 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)',
                  }}
                />
              )}
              {isLoading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 rounded-full border-[3px] border-amber-900/30 border-t-amber-900"
                  />
                  <span className="relative">{loadingMessage}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 relative" />
                  <span className="relative">Play now</span>
                </>
              )}
            </motion.button>
          </form>

          <div className="flex items-center justify-center gap-2 mt-5">
            <img
              src={vliveProLogo}
              alt="zOne Pro"
              className="w-7 h-7 rounded-lg shadow-md"
              style={{ boxShadow: '0 2px 6px rgba(120,53,15,0.35)' }}
            />
            <span className="text-xs font-black text-amber-800 tracking-wide">
              Powered by ZOne Pro
            </span>
          </div>
          <p className="text-[11px] font-medium text-amber-700/80 text-center mt-2 leading-relaxed">
            Sign in with zOne Pro to connect TikTok live &amp; sync the leaderboard.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
