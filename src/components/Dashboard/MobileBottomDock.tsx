import React from 'react';
import { Home, Search, Plus, Upload, User } from 'lucide-react';
import { useVault } from '../../context/VaultContext';

export const MobileBottomDock: React.FC<{
  onOpenSearch: () => void;
  onOpenCreateNode: () => void;
  onOpenUpload: () => void;
  onOpenProfile: () => void;
}> = ({ onOpenSearch, onOpenCreateNode, onOpenUpload, onOpenProfile }) => {
  const { selectNode } = useVault();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden pointer-events-none safe-area-bottom pb-3 px-4">
      <div className="mx-auto max-w-sm rounded-3xl bg-slate-950/85 border border-white/20 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,240,255,0.3)] pointer-events-auto p-2 flex items-center justify-around text-slate-400">
        <button
          onClick={() => selectNode(null)}
          className="flex flex-col items-center gap-0.5 p-2 rounded-2xl hover:text-cyan-400 active:scale-90 transition-all"
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-medium">Vault</span>
        </button>

        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center gap-0.5 p-2 rounded-2xl hover:text-cyan-400 active:scale-90 transition-all"
        >
          <Search className="w-5 h-5" />
          <span className="text-[9px] font-medium">Search</span>
        </button>

        <button
          onClick={onOpenCreateNode}
          className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/40 border-2 border-slate-950 active:scale-90 transition-all"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        <button
          onClick={onOpenUpload}
          className="flex flex-col items-center gap-0.5 p-2 rounded-2xl hover:text-cyan-400 active:scale-90 transition-all"
        >
          <Upload className="w-5 h-5" />
          <span className="text-[9px] font-medium">Upload</span>
        </button>

        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center gap-0.5 p-2 rounded-2xl hover:text-cyan-400 active:scale-90 transition-all"
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] font-medium">Profile</span>
        </button>
      </div>
    </div>
  );
};
