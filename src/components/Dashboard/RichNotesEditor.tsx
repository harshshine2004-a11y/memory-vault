import React, { useState } from 'react';
import { FileText, CheckSquare, History, Pin, Save, Plus, Trash2, X } from 'lucide-react';
import { useVault } from '../../context/VaultContext';

export const RichNotesEditor: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { selectedNode, updateNode } = useVault();
  const [activeTab, setActiveTab] = useState<'notes' | 'checklist' | 'history'>('notes');
  const [newCheckitem, setNewCheckitem] = useState('');

  if (!isOpen || !selectedNode) return null;

  const handleNotesChange = (text: string) => {
    updateNode(selectedNode.id, { notes: text });
  };

  const handleToggleChecklist = (checkId: string) => {
    const updated = selectedNode.checklists.map(c => c.id === checkId ? { ...c, completed: !c.completed } : c);
    updateNode(selectedNode.id, { checklists: updated });
  };

  const handleAddCheckitem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckitem.trim()) return;
    const newItem = { id: `c-${Date.now()}`, text: newCheckitem.trim(), completed: false };
    updateNode(selectedNode.id, { checklists: [...selectedNode.checklists, newItem] });
    setNewCheckitem('');
  };

  const handleDeleteCheckitem = (checkId: string) => {
    const updated = selectedNode.checklists.filter(c => c.id !== checkId);
    updateNode(selectedNode.id, { checklists: updated });
  };

  return (
    <div className="fixed right-6 top-20 bottom-6 z-40 w-96 rounded-3xl bg-slate-950/95 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col justify-between overflow-hidden shadow-purple-950/30">
      {/* Panel Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedNode.color }} />
          <h3 className="text-sm font-bold text-white truncate max-w-[180px]">{selectedNode.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateNode(selectedNode.id, { pinned: !selectedNode.pinned })}
            className={`p-1.5 rounded-lg transition-colors ${selectedNode.pinned ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-white'}`}
          >
            <Pin className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'notes' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Markdown Notes
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'checklist' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" /> Checklist ({selectedNode.checklists.filter(c => c.completed).length}/{selectedNode.checklists.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'history' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" /> History
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {activeTab === 'notes' && (
          <div className="h-full flex flex-col">
            <textarea
              value={selectedNode.notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Write rich markdown notes..."
              className="w-full flex-1 p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
            />
            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-emerald-400">
              <span className="flex items-center gap-1">
                <Save className="w-3 h-3" /> Auto-saved to Vault
              </span>
              <span className="text-slate-500">Markdown enabled</span>
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-3">
            <form onSubmit={handleAddCheckitem} className="flex gap-2">
              <input
                type="text"
                value={newCheckitem}
                onChange={(e) => setNewCheckitem(e.target.value)}
                placeholder="Add to-do item..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
              />
              <button type="submit" className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold">
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-2">
              {selectedNode.checklists.map(item => (
                <div key={item.id} className="p-2.5 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklist(item.id)}
                      className="rounded bg-slate-950 border-white/20 text-cyan-500"
                    />
                    <span className={item.completed ? 'line-through text-slate-500' : 'text-slate-200'}>{item.text}</span>
                  </label>
                  <button onClick={() => handleDeleteCheckitem(item.id)} className="text-slate-500 hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3 font-mono text-xs">
            <h4 className="text-slate-400 font-semibold text-[11px]">Version Revisions Timeline</h4>
            {selectedNode.versionHistory.map((v, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
                <div className="flex justify-between text-cyan-300 text-[11px]">
                  <span>{v.author}</span>
                  <span>{v.timestamp}</span>
                </div>
                <p className="text-slate-300 text-[11px]">{v.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
