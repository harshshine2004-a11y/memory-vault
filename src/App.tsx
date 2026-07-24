import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { VaultProvider, useVault } from './context/VaultContext';
import { AuthCard } from './components/Auth/AuthCard';
import { CinematicEntrance } from './components/Animation/CinematicEntrance';
import { MemoryGraph3D } from './components/3D/MemoryGraph3D';
import { HeaderNav } from './components/Dashboard/HeaderNav';
import { AISearchBar } from './components/Dashboard/AISearchBar';
import { NodeDetailsModal } from './components/Dashboard/NodeDetailsModal';
import { UploadModal } from './components/Dashboard/UploadModal';
import { RichNotesEditor } from './components/Dashboard/RichNotesEditor';
import { TimelineGeoView } from './components/Dashboard/TimelineGeoView';
import { SettingsModal } from './components/Settings/SettingsModal';
import { ProfileModal } from './components/Dashboard/ProfileModal';
import { EditNodeModal } from './components/Dashboard/EditNodeModal';
import { SlidersHorizontal, Sparkles, Edit3 } from 'lucide-react';
import type { MemoryNode } from './types';

const MainVaultContent: React.FC = () => {
  const { entranceState, selectedNode, createNode } = useVault();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<MemoryNode | null>(null);

  if (entranceState.stage === 'auth') {
    return (
      <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <MemoryGraph3D />
        </div>
        <AuthCard />
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none">
      <CinematicEntrance />

      <div className="absolute inset-0 z-0">
        <MemoryGraph3D onEditNode={(node) => setEditingNode(node)} />
      </div>

      <HeaderNav
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenCreateNode={() => {
          createNode({ title: 'New Memory Node', category: 'Personal' });
        }}
      />

      {/* Selected Node Action Bar */}
      {selectedNode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-950/80 border border-white/15 backdrop-blur-2xl shadow-2xl">
          {/* Rename Node Button */}
          <button
            onClick={() => setEditingNode(selectedNode)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500 hover:text-white transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Rename Node</span>
          </button>
          <div className="w-px h-4 bg-white/15" />

          {/* Markdown Notes */}
          <button
            onClick={() => setIsNotesOpen(!isNotesOpen)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isNotesOpen ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Markdown Notes</span>
          </button>
          <div className="w-px h-4 bg-white/15" />

          {/* Timeline / Geo View */}
          <button
            onClick={() => setIsTimelineOpen(!isTimelineOpen)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isTimelineOpen ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-300 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Timeline / Geo View</span>
          </button>
        </div>
      )}

      <AISearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      <NodeDetailsModal />
      <RichNotesEditor isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} />
      <TimelineGeoView isOpen={isTimelineOpen} onClose={() => setIsTimelineOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <EditNodeModal isOpen={!!editingNode} onClose={() => setEditingNode(null)} node={editingNode} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <VaultProvider>
        <MainVaultContent />
      </VaultProvider>
    </ThemeProvider>
  );
}
