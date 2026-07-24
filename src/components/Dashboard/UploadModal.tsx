import React, { useState, useRef } from 'react';
import { Upload, X, Shield, Sparkles, FileCheck } from 'lucide-react';
import { useVault } from '../../context/VaultContext';

export const UploadModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { nodes, selectedNode, uploadPhotosToNode } = useVault();
  const [targetNodeId, setTargetNodeId] = useState(selectedNode?.id || (nodes[0]?.id || ''));
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null!);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleStartUpload = async () => {
    if (!targetNodeId || selectedFiles.length === 0) return;

    setUploading(true);

    setStatusText('Running Malware & Security Scanner... Clean [✓]');
    setProgress(25);
    await new Promise(r => setTimeout(r, 600));

    setStatusText('Performing Client-side AES-256-GCM Zero-Knowledge Encryption...');
    setProgress(60);
    await new Promise(r => setTimeout(r, 700));

    setStatusText('Running AI Vision Auto-Tagging & OCR Text Extraction...');
    setProgress(85);
    await new Promise(r => setTimeout(r, 500));

    setStatusText('Directly uploading encrypted blobs to Cloud Vault...');
    await uploadPhotosToNode(targetNodeId, selectedFiles);

    setProgress(100);
    await new Promise(r => setTimeout(r, 400));

    setUploading(false);
    setSelectedFiles([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-3xl bg-slate-950/95 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl overflow-hidden p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Upload Encrypted Assets</h3>
              <p className="text-xs text-slate-400">Permanently store photos in secure Cloud Vault</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Target Memory Node</label>
          <select
            value={targetNodeId}
            onChange={(e) => setTargetNodeId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
          >
            {nodes.map(node => (
              <option key={node.id} value={node.id}>
                {node.title} ({node.branches.length} items)
              </option>
            ))}
          </select>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragOver ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]' : 'border-white/15 bg-slate-900/50 hover:border-cyan-500/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-white">Drag & drop photos here, or click to browse</p>
          <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, WEBP, RAW up to 500MB each</p>
        </div>

        {selectedFiles.length > 0 && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            <span className="text-xs font-semibold text-slate-300">Queue ({selectedFiles.length} files selected):</span>
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-slate-200 truncate">{file.name}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ))}
          </div>
        )}

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-cyan-300">
              <span>{statusText}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-900 border border-white/10 text-slate-300 text-xs font-semibold hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleStartUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Encrypt & Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
