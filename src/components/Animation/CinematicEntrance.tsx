import React, { useEffect, useRef } from 'react';
import { Shield, Sparkles, Terminal, Check } from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import confetti from 'canvas-confetti';

export const CinematicEntrance: React.FC = () => {
  const { entranceState, setEntranceStage } = useVault();
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  // Quantum Warp Drive Canvas Speed Lines
  useEffect(() => {
    if (entranceState.stage !== 'warp') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < 600; i++) {
      stars.push({
        x: (Math.random() - 0.5) * canvas.width * 2,
        y: (Math.random() - 0.5) * canvas.height * 2,
        z: Math.random() * canvas.width
      });
    }

    let animationId: number;

    const render = () => {
      ctx.fillStyle = 'rgba(5, 2, 12, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.z -= 28; // Speed factor

        if (star.z <= 0) {
          star.z = canvas.width;
          star.x = (Math.random() - 0.5) * canvas.width * 2;
          star.y = (Math.random() - 0.5) * canvas.height * 2;
        }

        const k = 250 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
          const size = (1 - star.z / canvas.width) * 3;
          ctx.beginPath();
          ctx.fillStyle = '#00f0ff';
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();

          // Speed streak tail
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(112, 0, 255, 0.4)';
          ctx.lineWidth = size * 0.8;
          ctx.moveTo(px, py);
          ctx.lineTo(star.x * (k * 0.85) + cx, star.y * (k * 0.85) + cy);
          ctx.stroke();
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    // Auto transition to Dashboard after 2.8 seconds
    const timer = setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#7000ff', '#ffb700']
      });
      setEntranceStage('dashboard');
    }, 2800);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(timer);
    };
  }, [entranceState.stage, setEntranceStage]);

  if (entranceState.stage === 'auth' || entranceState.stage === 'dashboard') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05020a] overflow-hidden select-none">
      {/* Warp Speed Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Decryption Phase Overlay */}
      {entranceState.stage === 'decryption' && (
        <div className="relative z-10 w-full max-w-lg p-8 rounded-3xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center mx-auto animate-pulse">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Zero-Knowledge Decryption</h2>
            <p className="text-xs text-cyan-300 font-mono mt-1">Generating AES-256-GCM Keys locally...</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/10 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-300 rounded-full transition-all duration-300 shadow-[0_0_12px_#00f0ff]"
              style={{ width: `${entranceState.progress}%` }}
            />
          </div>

          {/* Console Decryption Logs */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 text-left font-mono text-[11px] space-y-2 max-h-40 overflow-y-auto">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Decryption Stream Log</span>
            </div>
            {entranceState.decryptionLog.map((log, index) => (
              <div key={index} className="text-cyan-200 flex items-center gap-2">
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quantum Warp Phase Overlay */}
      {entranceState.stage === 'warp' && (
        <div className="relative z-10 text-center animate-fade-in">
          <h1 className="text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-white font-sans drop-shadow-[0_0_35px_rgba(0,240,255,0.8)]">
            ENTERING MEMORY VAULT
          </h1>
          <p className="text-sm font-mono text-cyan-300/80 mt-3 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
            INITIALIZING 3D KNOWLEDGE GRAPH
          </p>
        </div>
      )}
    </div>
  );
};
