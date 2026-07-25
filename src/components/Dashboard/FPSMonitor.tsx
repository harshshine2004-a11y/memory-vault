import React, { useState, useEffect, useRef } from 'react';
import { Activity, Cpu, Wifi, Zap } from 'lucide-react';

export const FPSMonitor: React.FC = () => {
  const [fps, setFps] = useState<number>(60);
  const [frameTime, setFrameTime] = useState<number>(16);
  const [heapMB, setHeapMB] = useState<number>(38);
  const [latencyMs, setLatencyMs] = useState<number>(14);
  const [isThrottled, setIsThrottled] = useState<boolean>(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const lowFpsCountRef = useRef(0);

  useEffect(() => {
    let animId: number;

    const measureLoop = () => {
      frameCountRef.current++;
      const now = performance.now();
      const delta = now - lastTimeRef.current;

      if (delta >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / delta);
        const currentFrameTime = Math.round(delta / frameCountRef.current);
        setFps(currentFps);
        setFrameTime(currentFrameTime);

        if ((performance as any).memory) {
          const heap = Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
          setHeapMB(heap);
        }

        if (currentFps < 30) {
          lowFpsCountRef.current++;
          if (lowFpsCountRef.current >= 3) {
            setIsThrottled(true);
          }
        } else {
          lowFpsCountRef.current = 0;
        }

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animId = requestAnimationFrame(measureLoop);
    };

    animId = requestAnimationFrame(measureLoop);

    const pingInterval = setInterval(() => {
      const start = performance.now();
      fetch('http://localhost:5000/api/v1/healthz')
        .then(() => {
          setLatencyMs(Math.round(performance.now() - start));
        })
        .catch(() => setLatencyMs(0));
    }, 5000);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(pingInterval);
    };
  }, []);

  return (
    <div className="fixed top-20 right-6 z-40 hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-slate-950/85 border border-cyan-500/30 backdrop-blur-xl shadow-lg text-[11px] font-mono text-slate-300 pointer-events-none">
      <div className="flex items-center gap-1.5">
        <Activity className={`w-3.5 h-3.5 ${fps >= 55 ? 'text-emerald-400' : fps >= 30 ? 'text-amber-400' : 'text-rose-400 animate-pulse'}`} />
        <span className="font-bold text-white">{fps} FPS</span>
        <span className="text-slate-500">({frameTime}ms)</span>
      </div>

      <div className="w-px h-3 bg-white/15" />

      <div className="flex items-center gap-1">
        <Cpu className="w-3.5 h-3.5 text-purple-400" />
        <span>{heapMB} MB</span>
      </div>

      <div className="w-px h-3 bg-white/15" />

      <div className="flex items-center gap-1">
        <Wifi className="w-3.5 h-3.5 text-cyan-400" />
        <span>{latencyMs}ms</span>
      </div>

      {isThrottled && (
        <div className="flex items-center gap-1 text-amber-300 font-bold px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
          <Zap className="w-3 h-3" /> 60FPS Mode
        </div>
      )}
    </div>
  );
};
