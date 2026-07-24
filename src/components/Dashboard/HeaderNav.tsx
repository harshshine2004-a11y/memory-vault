import React, { useState } from 'react';
import { Shield, Search, Palette, Upload, Settings, LogOut, Wifi, WifiOff, Plus, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { useTheme, THEMES } from '../../context/ThemeContext';
import { audioEngine } from '../../utils/audio';
import type { ThemeId } from '../../types';

export const HeaderNav: React.FC<{
  onOpenUpload: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onOpenCreateNode: () => void;
  onOpenProfile: () => void;
}> = ({ onOpenUpload, onOpenSearch, onOpenSettings, onOpenCreateNode, onOpenProfile }) => {
  const { user, isOffline, logout } = useVault();
  const { currentTheme, setTheme } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(audioEngine.getIsMuted());

  const handleAudioToggle = () => {
    const muted = audioEngine.toggleMute();
    setIsAudioMuted(muted);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 px-6 py-4 flex items-center justify-between pointer-events-none">
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-white font-sans">MEMORY VAULT</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              SaaS Multi-Tenant
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            {isOffline ? (
              <span className="text-amber-400 flex items-center gap-1">
                <WifiOff className="w-3 h-3" /> Offline PWA Mode
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <Wifi className="w-3 h-3" /> Cloud Synced
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-950/70 border border-white/10 hover:border-cyan-500/50 text-slate-300 hover:text-white text-xs backdrop-blur-xl shadow-lg transition-all"
        >
          <Search className="w-4 h-4 text-cyan-400" />
          <span>Semantic AI & OCR Search...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-white/10">
            Ctrl+K
          </kbd>
        </button>

        <button
          onClick={onOpenCreateNode}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-purple-500/50 text-slate-200 hover:text-white text-xs font-semibold backdrop-blur-xl transition-all"
        >
          <Plus className="w-4 h-4 text-purple-400" />
          <span>New Node</span>
        </button>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 hover:opacity-95 hover:scale-105 transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Asset</span>
        </button>
      </div>

      <div className="flex items-center gap-3 pointer-events-auto relative">
        {/* Procedural 3D Audio Ambient Sound Mute/Unmute Toggle Button */}
        <button
          onClick={handleAudioToggle}
          className={`p-2.5 rounded-2xl border text-xs backdrop-blur-xl transition-all ${
            !isAudioMuted
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)] animate-pulse'
              : 'bg-slate-950/70 border-white/10 text-slate-400 hover:text-white'
          }`}
          title={isAudioMuted ? 'Unmute 3D Ambient Soundscape' : 'Mute 3D Soundscape'}
        >
          {!isAudioMuted ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* 3D Living Environment Theme Selector */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-950/70 border border-white/10 hover:border-cyan-400 text-slate-200 text-xs backdrop-blur-xl transition-all"
          >
            <Palette className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline font-medium">{currentTheme.name}</span>
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-64 p-2 rounded-2xl bg-slate-950/95 border border-white/15 backdrop-blur-2xl shadow-2xl space-y-1 max-h-85 overflow-y-auto z-50">
              <div className="px-2 py-1 text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>11 Living 3D Worlds</span>
                <Sparkles className="w-3 h-3 text-cyan-400" />
              </div>
              {Object.values(THEMES).map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id as ThemeId);
                    setShowThemeMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                    currentTheme.id === t.id
                      ? 'bg-cyan-500/20 text-cyan-200 font-semibold border border-cyan-500/40'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>{t.name}</span>
                  <span className="text-[10px] opacity-50 font-mono">{t.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-2xl bg-slate-950/70 border border-white/10 hover:border-cyan-400 text-slate-300 hover:text-white backdrop-blur-xl transition-all"
          title="Vault Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 p-1 rounded-2xl hover:bg-white/10 transition-all border border-transparent hover:border-cyan-400/40"
            title="Profile & Passphrase Security"
          >
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-8 h-8 rounded-full border border-cyan-400 object-cover shadow-md"
            />
          </button>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
