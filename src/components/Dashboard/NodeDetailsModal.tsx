import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Download, Trash2, Move, Camera, Tag, FileText, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useVault } from '../../context/VaultContext';

export const NodeDetailsModal: React.FC = () => {
  const { selectedNode, selectedPhoto, selectPhoto, deletePhotoFromNode, movePhotoToNode, nodes } = useVault();
  const [targetMoveNodeId, setTargetMoveNodeId] = useState('');

  // Handle keyboard arrow navigation (Left / Right keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedNode || !selectedPhoto || !selectedNode.branches.length) return;
      const currentIndex = selectedNode.branches.findIndex(p => p.id === selectedPhoto.id);
      if (currentIndex === -1) return;

      if (e.key === 'ArrowLeft') {
        const prevIdx = currentIndex === 0 ? selectedNode.branches.length - 1 : currentIndex - 1;
        selectPhoto(selectedNode.branches[prevIdx]);
      } else if (e.key === 'ArrowRight') {
        const nextIdx = currentIndex === selectedNode.branches.length - 1 ? 0 : currentIndex + 1;
        selectPhoto(selectedNode.branches[nextIdx]);
      } else if (e.key === 'Escape') {
        selectPhoto(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, selectedPhoto, selectPhoto]);

  if (!selectedPhoto || !selectedNode) return null;

  const branches = selectedNode.branches || [];
  const currentIndex = branches.findIndex(p => p.id === selectedPhoto.id);

  const handlePrevPhoto = () => {
    if (branches.length <= 1) return;
    const prevIdx = currentIndex === 0 ? branches.length - 1 : currentIndex - 1;
    selectPhoto(branches[prevIdx]);
  };

  const handleNextPhoto = () => {
    if (branches.length <= 1) return;
    const nextIdx = currentIndex === branches.length - 1 ? 0 : currentIndex + 1;
    selectPhoto(branches[nextIdx]);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = selectedPhoto.url;
    a.download = selectedPhoto.filename;
    a.click();
  };

  const handleDelete = () => {
    deletePhotoFromNode(selectedNode.id, selectedPhoto.id);
    if (branches.length > 1) {
      const nextIdx = currentIndex === branches.length - 1 ? 0 : currentIndex;
      selectPhoto(branches[nextIdx] || null);
    } else {
      selectPhoto(null);
    }
  };

  const handleMove = () => {
    if (targetMoveNodeId && targetMoveNodeId !== selectedNode.id) {
      movePhotoToNode(selectedPhoto.id, selectedNode.id, targetMoveNodeId);
      selectPhoto(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="w-full max-w-5xl rounded-3xl bg-slate-950/95 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 max-h-[90vh]">
        {/* Left Side: Photo Display with Next/Prev Swipe Arrows */}
        <div className="md:col-span-7 bg-black/60 p-6 flex flex-col justify-between items-center relative border-b md:border-b-0 md:border-r border-white/10 group">
          {/* Close Button */}
          <button
            onClick={() => selectPhoto(null)}
            className="absolute top-4 left-4 p-2 rounded-xl bg-slate-900/80 text-white hover:bg-slate-800 transition-all z-20 border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Photo Counter Badge */}
          {branches.length > 1 && (
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-900/80 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30 z-20 backdrop-blur-md">
              {currentIndex + 1} / {branches.length}
            </div>
          )}

          {/* Center Image Container with Side Swipe Arrow Buttons */}
          <div className="relative w-full h-full flex items-center justify-center my-auto min-h-[350px]">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              className="max-h-[60vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10 transition-all duration-300"
            />

            {/* Previous Photo Swipe Button */}
            {branches.length > 1 && (
              <button
                onClick={handlePrevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-950/80 hover:bg-cyan-500 text-white border border-white/20 shadow-2xl transition-all active:scale-90 hover:scale-110 z-20 backdrop-blur-md"
                title="Previous Photo (Left Arrow Key)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next Photo Swipe Button */}
            {branches.length > 1 && (
              <button
                onClick={handleNextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-950/80 hover:bg-cyan-500 text-white border border-white/20 shadow-2xl transition-all active:scale-90 hover:scale-110 z-20 backdrop-blur-md"
                title="Next Photo Swipe (Right Arrow Key)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          <div className="w-full pt-4 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>AES Key: {selectedPhoto.aesKeyId}</span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-4 h-4" /> Cloud Encrypted
            </span>
          </div>
        </div>

        {/* Right Side: Details & Actions */}
        <div className="md:col-span-5 p-6 flex flex-col justify-between space-y-6 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PHOTO BRANCH ASSET
              </span>
              <span className="text-xs text-slate-400 font-mono">{(selectedPhoto.sizeBytes / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <h3 className="text-xl font-bold text-white">{selectedPhoto.title}</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">Uploaded: {new Date(selectedPhoto.uploadedAt).toLocaleString()}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> AI Vision Caption
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">{selectedPhoto.aiCaption}</p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-purple-400" /> AI Vision Tags
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedPhoto.aiTags.map((t, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-300 text-[11px] font-medium">
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {selectedPhoto.ocrText && (
            <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
                <FileText className="w-3.5 h-3.5" /> OCR Extracted Text
              </div>
              <p className="text-[11px] font-mono text-purple-100">{selectedPhoto.ocrText}</p>
            </div>
          )}

          {selectedPhoto.exif && (
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Camera className="w-3.5 h-3.5 text-cyan-400" /> EXIF Metadata
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
                <div>Camera: <span className="text-slate-200">{selectedPhoto.exif.camera}</span></div>
                <div>Location: <span className="text-slate-200">{selectedPhoto.exif.location}</span></div>
                <div>Taken: <span className="text-slate-200">{selectedPhoto.exif.dateTaken}</span></div>
                <div>Dimensions: <span className="text-slate-200">{selectedPhoto.exif.dimensions}</span></div>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <select
                value={targetMoveNodeId}
                onChange={(e) => setTargetMoveNodeId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
              >
                <option value="">Move photo to another node...</option>
                {nodes.filter(n => n.id !== selectedNode.id).map(n => (
                  <option key={n.id} value={n.id}>{n.title}</option>
                ))}
              </select>
              <button
                onClick={handleMove}
                disabled={!targetMoveNodeId}
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Move className="w-3.5 h-3.5" /> Move
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-4 h-4" /> Download Original
              </button>
              <button
                onClick={handleDelete}
                className="py-2.5 px-4 rounded-xl bg-rose-600/20 border border-rose-500/30 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
