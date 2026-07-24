import React from 'react';
import { Edit3, Upload, Trash2, Eye, X, Sparkles } from 'lucide-react';
import type { MemoryNode } from '../../types';

export const MobileContextMenu: React.FC<{
  node: MemoryNode | null;
  isOpen: boolean;
  onClose: () => void;
  onRename: (node: MemoryNode) => void;
  onUpload: (node: MemoryNode) => void;
  onViewDetails: (node: MemoryNode) => void;
  onDelete: (node: MemoryNode) => void;
}> = ({ node, isOpen, onClose, onRename, onUpload, onViewDetails, onDelete }) => {
  if (!isOpen || !node) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-slate-950/95 border border-cyan-500/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,240,255,0.3)] text-white p-5 space-y-4 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="truncate max-w-[200px]">{node.title}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action List */}
        <div className="space-y-2">
          <button
            onClick={() => {
              onRename(node);
              onClose();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 font-semibold text-xs flex items-center gap-3 transition-all border border-white/10"
          >
            <Edit3 className="w-4 h-4 text-cyan-400" />
            <span>Rename & Customize Node</span>
          </button>

          <button
            onClick={() => {
              onUpload(node);
              onClose();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-purple-500/20 text-slate-200 hover:text-purple-300 font-semibold text-xs flex items-center gap-3 transition-all border border-white/10"
          >
            <Upload className="w-4 h-4 text-purple-400" />
            <span>Upload Photo Assets</span>
          </button>

          <button
            onClick={() => {
              onViewDetails(node);
              onClose();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 font-semibold text-xs flex items-center gap-3 transition-all border border-white/10"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>View Full Node Gallery</span>
          </button>

          <button
            onClick={() => {
              onDelete(node);
              onClose();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white font-semibold text-xs flex items-center gap-3 transition-all border border-rose-500/30"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Memory Node</span>
          </button>
        </div>
      </div>
    </div>
  );
};
