import React, { useState } from 'react';
import { Shield, HardDrive, Smartphone, Activity, Download, RefreshCw, X, Fingerprint } from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { WebAuthnEngine } from '../../utils/webauthn';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, sessions, auditLogs, exportVaultBackup, restoreVaultBackup, revokeSession, addAuditLog } = useVault();
  const [activeTab, setActiveTab] = useState<'storage' | 'security' | 'sessions' | 'logs' | 'recovery'>('storage');
  const [restoreText, setRestoreText] = useState('');
  const [restoreMessage, setRestoreMessage] = useState('');

  if (!isOpen) return null;

  const storageUsedPercent = Math.round((user.storageUsedBytes / user.storageQuotaBytes) * 100);

  const handleRestoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = restoreVaultBackup(restoreText);
    if (success) {
      setRestoreMessage('Disaster recovery backup restored successfully!');
      setRestoreText('');
    } else {
      setRestoreMessage('Failed to parse backup JSON. Invalid file payload.');
    }
  };

  const handleSetupBiometrics = async () => {
    const ok = await WebAuthnEngine.registerBiometrics(user.username);
    if (ok) {
      addAuditLog('LOGIN_SUCCESS', 'Registered WebAuthn Biometric Passkey on active device');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-4xl rounded-3xl bg-slate-950/95 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 max-h-[85vh]">
        <div className="md:col-span-4 bg-slate-900/60 p-6 border-b md:border-b-0 md:border-r border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-full border border-cyan-400 object-cover" />
            <div>
              <h3 className="text-sm font-bold text-white">{user.username}</h3>
              <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('storage')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeTab === 'storage' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              <HardDrive className="w-4 h-4" /> Cloud Storage Meter
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeTab === 'security' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              <Shield className="w-4 h-4" /> ZK Security & Biometrics
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeTab === 'sessions' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-4 h-4" /> Active Devices ({sessions.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeTab === 'logs' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              <Activity className="w-4 h-4" /> Security Audit Log
            </button>
            <button
              onClick={() => setActiveTab('recovery')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeTab === 'recovery' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              <Download className="w-4 h-4" /> Backup & Disaster Recovery
            </button>
          </nav>

          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span>Cloudinary Storage</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="opacity-80">25 GB Free Cloud Tier Active</p>
          </div>
        </div>

        <div className="md:col-span-8 p-6 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider font-mono">
              {activeTab} ADMINISTRATION
            </h3>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {activeTab === 'storage' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Cloudinary 25 GB Free Cloud Quota</span>
                  <span className="text-cyan-400 font-mono">{(user.storageUsedBytes / 1024 / 1024 / 1024).toFixed(1)} GB / 25 GB</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                    style={{ width: `${storageUsedPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Powered by Cloudinary 25 GB Free Cloud Storage with automatic AVIF/WebP image optimization & AI Vision auto-tagging.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Zero-Knowledge End-to-End Encryption</h4>
                  <p className="text-slate-400 mt-0.5">PBKDF2/Argon2id + AES-256-GCM. Master keys never leave local browser memory.</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-[11px] border border-emerald-500/30">
                  ENABLED
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">WebAuthn Biometrics (TouchID / Passkey)</h4>
                  <p className="text-slate-400 mt-0.5">1-touch hardware passkey authentication.</p>
                </div>
                <button
                  onClick={handleSetupBiometrics}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1.5"
                >
                  <Fingerprint className="w-4 h-4" /> Register Passkey
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-3 text-xs">
              <h4 className="text-slate-400 font-semibold">Active Connected Sessions</h4>
              {sessions.map(session => (
                <div key={session.id} className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-white">{session.deviceName} {session.isCurrent && <span className="text-cyan-400 font-mono">(This device)</span>}</h5>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{session.browser} • {session.ipAddress} • {session.location}</p>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={() => revokeSession(session.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white font-semibold"
                    >
                      Revoke Session
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-2 text-xs max-h-72 overflow-y-auto">
              <h4 className="text-slate-400 font-semibold">Tamper-Proof Audit Trail</h4>
              {auditLogs.map(log => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between font-mono text-[11px]">
                  <div>
                    <span className="text-cyan-300 font-bold">{log.eventType}</span>
                    <p className="text-slate-300 mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'recovery' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
                <h4 className="font-bold text-white text-sm">Export Vault Snapshot (.vault)</h4>
                <p className="text-slate-400">Download complete encrypted graph structure and notes metadata.</p>
                <button
                  onClick={exportVaultBackup}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Export .vault Backup File
                </button>
              </div>

              <form onSubmit={handleRestoreSubmit} className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
                <h4 className="font-bold text-white text-sm">1-Click Disaster Recovery Restore</h4>
                {restoreMessage && (
                  <p className="text-cyan-300 font-mono">{restoreMessage}</p>
                )}
                <textarea
                  value={restoreText}
                  onChange={(e) => setRestoreText(e.target.value)}
                  placeholder="Paste contents of .vault JSON file..."
                  className="w-full h-24 p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-mono"
                />
                <button
                  type="submit"
                  disabled={!restoreText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Restore Vault Backup
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
