import React, { useState, useRef } from 'react';
import { Key, Download, CheckCircle, AlertCircle, X, HardDrive, Camera, User, Sparkles } from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { SecurityEngine } from '../../utils/security';

export const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, nodes, userMasterPassword, updateMasterPassword, updateUserProfile, exportVaultBackup, addAuditLog } = useVault();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameInput, setUsernameInput] = useState(user.username);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Admin1',
    'https://api.dicebear.com/7.x/bottts/svg?seed=CyberVault',
    'https://api.dicebear.com/7.x/bottts/svg?seed=CosmicAI'
  ];

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Please select a valid image file.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateUserProfile({ avatarUrl: dataUrl });
        setStatusMessage({ type: 'success', text: 'Profile picture updated successfully!' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    updateUserProfile({ username: usernameInput.trim() });
    setStatusMessage({ type: 'success', text: 'Admin name updated successfully!' });
  };

  const passwordStrength = SecurityEngine.evaluatePasswordStrength(newPassword);
  const strengthPercent = Math.min(100, Math.round((passwordStrength.score / 4) * 100));

  const getStrengthColor = (score: number) => {
    if (score <= 1) return '#f43f5e';
    if (score === 2) return '#eab308';
    if (score === 3) return '#06b6d4';
    return '#10b981';
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (currentPassword !== userMasterPassword) {
      setStatusMessage({ type: 'error', text: 'Current security passphrase is incorrect.' });
      return;
    }

    if (newPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'New passphrase must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New passphrase and confirmation do not match.' });
      return;
    }

    setIsUpdating(true);

    try {
      await SecurityEngine.deriveMasterKey(newPassword);
      updateMasterPassword(newPassword);
      addAuditLog('E2EE_KEY_DERIVED', 'Security passphrase updated & new PBKDF2 ZK master key derived');
      setStatusMessage({ type: 'success', text: 'Passphrase updated & saved successfully! Use your new passphrase on next login.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to update passphrase. Verification error.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadAllLocalPhotos = () => {
    setIsExportingZip(true);

    try {
      const allPhotos = nodes.flatMap(n => n.branches);

      if (allPhotos.length === 0) {
        setStatusMessage({ type: 'error', text: 'No photos found in vault to backup.' });
        setIsExportingZip(false);
        return;
      }

      exportVaultBackup();

      allPhotos.forEach((photo, idx) => {
        setTimeout(() => {
          const a = document.createElement('a');
          a.href = photo.url;
          a.download = `emergency_backup_${photo.filename || `photo_${idx + 1}.jpg`}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }, idx * 300);
      });

      setStatusMessage({
        type: 'success',
        text: `Emergency Backup Triggered! Downloading ${allPhotos.length} photo assets directly to your local device downloads folder.`
      });

      addAuditLog('DISASTER_RECOVERY_EXPORT', `Triggered emergency local download for ${allPhotos.length} photo files.`);
    } catch {
      setStatusMessage({ type: 'error', text: 'Error triggering emergency local backup download.' });
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-3xl bg-slate-950/95 border border-cyan-500/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] text-white overflow-hidden p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header with Custom Avatar Change & Camera Upload Button */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarFileChange}
              accept="image/*"
              className="hidden"
            />
            {/* Clickable Profile Avatar with Camera Hover Overlay */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-cyan-400 cursor-pointer group shadow-lg shrink-0"
              title="Click to Upload Custom Profile Photo"
            >
              <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <Camera className="w-5 h-5 text-cyan-300" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{user.username}</h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] border border-cyan-500/40 font-mono">
                  PRO SAAS ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{user.email}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 mt-0.5"
              >
                <Camera className="w-3 h-3" /> Change Profile Picture
              </button>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Avatar Selection */}
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Quick Preset Avatars
          </label>
          <div className="flex items-center gap-3">
            {PRESET_AVATARS.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => updateUserProfile({ avatarUrl: url })}
                className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all ${
                  user.avatarUrl === url ? 'border-cyan-400 scale-110 shadow-[0_0_15px_rgba(0,240,255,0.5)]' : 'border-white/20 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Form: Change Username */}
        <form onSubmit={handleSaveUsername} className="flex gap-2">
          <div className="relative flex-1">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Admin Username"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
          >
            Save Name
          </button>
        </form>

        {/* Status Message Alert */}
        {statusMessage && (
          <div className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Form: Change Security Passphrase */}
        <form onSubmit={handleChangePassword} className="space-y-4 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
            <Key className="w-4 h-4" /> Change Security Passphrase
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Current Passphrase</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">New Passphrase</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Confirm New Passphrase</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Strength Meter */}
          {newPassword && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-400">Passphrase Entropy</span>
                <span className="text-cyan-400 font-bold">{strengthPercent}% ({passwordStrength.label})</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${strengthPercent}%`, backgroundColor: getStrengthColor(passwordStrength.score) }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {isUpdating ? 'Deriving ZK Master Key...' : 'Update Security Passphrase'}
          </button>
        </form>

        {/* Section: Emergency Local Photo Backup */}
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <HardDrive className="w-4 h-4" /> Emergency Local Photo Backup
            </div>
            <span className="text-[10px] font-mono text-amber-400/80">OFFLINE SAFE</span>
          </div>

          <p className="text-[11px] text-slate-300">
            In case of emergency or cloud disconnection, download all photos directly to your local device hard drive so your memories are never lost!
          </p>

          <button
            onClick={handleDownloadAllLocalPhotos}
            disabled={isExportingZip}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExportingZip ? 'Preparing Emergency Local Backup...' : 'Download All Photos to Local Device'}
          </button>
        </div>
      </div>
    </div>
  );
};
