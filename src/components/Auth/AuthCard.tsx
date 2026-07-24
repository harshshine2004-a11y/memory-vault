import React, { useState } from 'react';
import { Shield, Lock, User, Key, Fingerprint, Eye, EyeOff, Sparkles, AlertTriangle, CheckCircle2, HelpCircle, Mail, Server, HardDrive } from 'lucide-react';
import { SecurityEngine } from '../../utils/security';
import type { PasswordStrength } from '../../utils/security';
import { WebAuthnEngine } from '../../utils/webauthn';
import { useVault } from '../../context/VaultContext';

export const AuthCard: React.FC = () => {
  const { login, registerTenant, addAuditLog } = useVault();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('Harsh Kumar');
  const [email, setEmail] = useState('harsh@antigravity.ai');
  const [password, setPassword] = useState('VaultMaster#2026Secure!');
  const [selectedTier, setSelectedTier] = useState<'starter' | 'pro' | 'enterprise'>('starter');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [currentCaptcha, setCurrentCaptcha] = useState(SecurityEngine.generateCaptcha());
  const [show2FA, setShow2FA] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const strength: PasswordStrength = SecurityEngine.evaluatePasswordStrength(password);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'signup') {
      if (!username.trim() || !email.trim() || !password.trim()) {
        setErrorMessage('Please fill out all required fields.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Passphrase must be at least 6 characters.');
        return;
      }

      setIsLoading(true);
      const success = registerTenant(username.trim(), email.trim(), password, selectedTier);
      setIsLoading(false);

      if (success) {
        await login(password);
      } else {
        setErrorMessage('Account registration failed.');
      }
      return;
    }

    // Login Flow
    if (showCaptcha && parseInt(captchaAnswer) !== currentCaptcha.answer) {
      setErrorMessage('Incorrect CAPTCHA answer. Please solve the security puzzle.');
      setCurrentCaptcha(SecurityEngine.generateCaptcha());
      return;
    }

    if (failedAttempts >= 3 && !showCaptcha) {
      setShowCaptcha(true);
      return;
    }

    setIsLoading(true);

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    if (!show2FA) {
      setShow2FA(true);
      setIsLoading(false);
      return;
    }

    if (totpCode.length !== 6) {
      setErrorMessage('Please enter valid 6-digit TOTP authentication code.');
      setIsLoading(false);
      return;
    }

    const success = await login(password);
    setIsLoading(false);

    if (!success) {
      setFailedAttempts(prev => prev + 1);
      if (failedAttempts + 1 >= 3) {
        setShowCaptcha(true);
        setCurrentCaptcha(SecurityEngine.generateCaptcha());
      }
      setErrorMessage('Invalid authentication passkey. Access denied.');
    }
  };

  const handleBiometricsLogin = async () => {
    setIsLoading(true);
    const verified = await WebAuthnEngine.verifyBiometrics();
    if (verified) {
      addAuditLog('LOGIN_SUCCESS', 'Biometric TouchID/FaceID passkey authenticated');
      await login(password);
    } else {
      setErrorMessage('Biometric verification failed.');
    }
    setIsLoading(false);
  };

  return (
    <div className="relative z-20 w-full max-w-md p-8 rounded-3xl transition-all duration-500 border shadow-2xl backdrop-blur-2xl bg-slate-950/80 border-white/10 shadow-cyan-950/40">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20 mb-4 animate-float">
          <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-purple-300 font-sans">
          MEMORY VAULT
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Multi-Tenant SaaS Cloud Vault
        </p>

        {/* Tab Toggle: Sign In vs Create SaaS Account */}
        <div className="grid grid-cols-2 p-1 mt-4 rounded-2xl bg-slate-900 border border-white/10 w-full text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
            }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'login' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage('');
            }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'signup' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-shake">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {show2FA && mode === 'login' ? (
        <form onSubmit={handleAuthSubmit} className="space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mx-auto mb-3 text-purple-300">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">Two-Factor Authentication</h3>
            <p className="text-xs text-slate-400 mt-1">Enter 6-digit code from your Authenticator app</p>
          </div>

          <div>
            <input
              type="text"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 rounded-xl bg-slate-900/80 border border-purple-500/30 text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              autoFocus
            />
            <p className="text-[11px] text-slate-500 text-center mt-2">Simulation code: <span className="text-purple-300 font-mono">123456</span></p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-purple-900/30 hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Decrypt & Enter Private Vault
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Vault Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-300">Master Passphrase</label>
              {mode === 'login' && <span className="text-[11px] text-cyan-400 hover:underline cursor-pointer">Forgot?</span>}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter ZK passphrase"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[11px] font-medium">
                  <span className="text-slate-400">Strength: <span className="text-cyan-300">{strength.label}</span></span>
                  <span className="text-slate-500 font-mono">{strength.entropy} bits entropy</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-full flex-1 rounded-full transition-all duration-500 ${
                        i < strength.score
                          ? strength.score === 4 ? 'bg-emerald-400' : strength.score >= 2 ? 'bg-cyan-400' : 'bg-amber-400'
                          : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" /> SaaS Storage Allocation Plan
              </label>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedTier('starter')}
                  className={`p-2.5 rounded-xl border transition-all ${
                    selectedTier === 'starter' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold' : 'bg-slate-900 border-white/10 text-slate-400'
                  }`}
                >
                  <div>25 GB</div>
                  <span className="text-[9px] opacity-70">FREE TIER</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTier('pro')}
                  className={`p-2.5 rounded-xl border transition-all ${
                    selectedTier === 'pro' ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold' : 'bg-slate-900 border-white/10 text-slate-400'
                  }`}
                >
                  <div>250 GB</div>
                  <span className="text-[9px] opacity-70">PRO PLAN</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTier('enterprise')}
                  className={`p-2.5 rounded-xl border transition-all ${
                    selectedTier === 'enterprise' ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold' : 'bg-slate-900 border-white/10 text-slate-400'
                  }`}
                >
                  <div>2 TB</div>
                  <span className="text-[9px] opacity-70">ENTERPRISE</span>
                </button>
              </div>
            </div>
          )}

          {showCaptcha && mode === 'login' && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
                <HelpCircle className="w-4 h-4" />
                <span>Security CAPTCHA Protection</span>
              </div>
              <p className="text-xs text-slate-300">{currentCaptcha.question}</p>
              <input
                type="number"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                placeholder="Enter answer"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/40 text-white text-xs"
              />
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-slate-900 border-white/20 text-cyan-500 focus:ring-0"
              />
              <span>Remember session</span>
            </label>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
              <Shield className="w-3 h-3" /> Tenant Isolated
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-600 to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : mode === 'signup' ? (
              <>
                <Server className="w-4 h-4" />
                Create Private SaaS Vault
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Unlock Memory Vault
              </>
            )}
          </button>

          {WebAuthnEngine.isSupported() && mode === 'login' && (
            <button
              type="button"
              onClick={handleBiometricsLogin}
              className="w-full py-2.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/50 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Fingerprint className="w-4 h-4 text-cyan-400" />
              Sign in with Biometrics (Passkey / TouchID)
            </button>
          )}
        </form>
      )}
    </div>
  );
};
