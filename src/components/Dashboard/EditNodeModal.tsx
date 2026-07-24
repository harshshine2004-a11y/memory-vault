import React, { useState, useEffect } from 'react';
import { Edit3, Check, X, Palette, Box, Tag, Trash2 } from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import type { MemoryNode } from '../../types';

export const EditNodeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  node: MemoryNode | null;
}> = ({ isOpen, onClose, node }) => {
  const { updateNode, deleteNode } = useVault();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('#00f0ff');
  const [geometryShape, setGeometryShape] = useState<MemoryNode['geometryShape']>('sphere');

  useEffect(() => {
    if (node) {
      setTitle(node.title);
      setCategory(node.category);
      setColor(node.color);
      setGeometryShape(node.geometryShape || 'sphere');
    }
  }, [node]);

  if (!isOpen || !node) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateNode(node.id, {
      title: title.trim(),
      category: category.trim(),
      color,
      geometryShape
    });

    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete node "${node.title}"?`)) {
      deleteNode(node.id);
      onClose();
    }
  };

  const COLOR_OPTIONS = ['#00f0ff', '#00ff88', '#ffb700', '#ff0055', '#a855f7', '#ec4899', '#3b82f6'];
  const SHAPE_OPTIONS: { id: MemoryNode['geometryShape']; label: string }[] = [
    { id: 'sphere', label: 'Sphere' },
    { id: 'crystal', label: 'Dodecahedron Crystal' },
    { id: 'icosahedron', label: 'Icosahedron Star' },
    { id: 'torus', label: 'Torus Ring' },
    { id: 'octahedron', label: 'Octahedron Diamond' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl bg-slate-950/95 border border-cyan-500/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,240,255,0.3)] text-white overflow-hidden p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5 text-base font-bold text-white">
            <Edit3 className="w-5 h-5 text-cyan-400" />
            <span>Rename & Customize Node</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Node Title Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Node Title / Name
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Vacation Memories"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400"
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-purple-400" /> Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Travel, Family, Architecture"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-cyan-400" /> Node Accent Color
            </label>
            <div className="flex items-center gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all flex items-center justify-center ${
                    color === c ? 'scale-125 ring-2 ring-white shadow-lg' : 'hover:scale-110 opacity-70'
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-4 h-4 text-slate-950 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Geometry Shape Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-purple-400" /> 3D Node Mesh Geometry
            </label>
            <select
              value={geometryShape}
              onChange={(e) => setGeometryShape(e.target.value as MemoryNode['geometryShape'])}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs"
            >
              {SHAPE_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10 gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3.5 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-4 h-4" /> Delete Node
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xs shadow-lg hover:opacity-90 transition-all"
              >
                Save Name & Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
