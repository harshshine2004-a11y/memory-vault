import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { VaultProvider, useVault } from './context/VaultContext';
import { VaultErrorBoundary } from './components/VaultErrorBoundary';
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
import { MobileContextMenu } from './components/Dashboard/MobileContextMenu';
import { MobileBottomDock } from './components/Dashboard/MobileBottomDock';
import { FPSMonitor } from './components/Dashboard/FPSMonitor';
import { SlidersHorizontal, Sparkles, Edit3 } from 'lucide-react';
import type { MemoryNode } from './types';

const MainVaultContent: React.FC = () => {
  const { entranceState, selectedNode, selectPhoto, createNode, deleteNode } = useVault();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<MemoryNode | null>(null);
  const [contextMenuNode, setContextMenuNode] = useState<MemoryNode | null>(null);

  if (entranceState.stage === 'auth') {
    return (
      <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden p-4 safe-area-top safe-area-bottom">
        <div className="absolute inset-0 z-0">
          <MemoryGraph3D />
        </div>
        <AuthCard />
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none safe-area-top safe-area-bottom">
      <CinematicEntrance />
      <FPSMonitor />

      <div className="absolute inset-0 z-0">
        <MemoryGraph3D
          onEditNode={(node) => setEditingNode(node)}
          onLongPressNode={(node) => setContextMenuNode(node)}
          onDoubleTapNode={(node) => {
            if (node.branches && node.branches.length > 0) {
              selectPhoto(node.branches[0]);
            }
          }}
        />
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

      {/* Selected Node Floating Desktop & Tablet Action Bar */}
      {selectedNode && (
        <div className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-30 items-center gap-3 px-4 py-2.5 rounded-full bg-slate-950/80 border border-white/15 backdrop-blur-2xl shadow-2xl">
          <button
            onClick={() => setEditingNode(selectedNode)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500 hover:text-white transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Rename Node</span>
          </button>
          <div className="w-px h-4 bg-white/15" />

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

      {/* Mobile Native Bottom Navigation Dock */}
      <MobileBottomDock
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCreateNode={() => createNode({ title: 'New Memory Node', category: 'Personal' })}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Mobile Touch Long-Press Context Menu */}
      <MobileContextMenu
        node={contextMenuNode}
        isOpen={!!contextMenuNode}
        onClose={() => setContextMenuNode(null)}
        onRename={(node) => setEditingNode(node)}
        onUpload={() => setIsUploadOpen(true)}
        onViewDetails={(node) => {
          if (node.branches && node.branches.length > 0) {
            selectPhoto(node.branches[0]);
          }
        }}
        onDelete={(node) => {
          deleteNode(node.id);
        }}
      />

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
    <VaultErrorBoundary>
      <ThemeProvider>
        <VaultProvider>
          <MainVaultContent />
        </VaultProvider>
      </ThemeProvider>
    </VaultErrorBoundary>
  );
}
