import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Lock, Unlock, Key, Copy, Check, Eye, EyeOff, Plus, Trash2, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { VaultEntry } from '../types/orion';

export const PasswordVaultView: React.FC = () => {
  const [masterPassword, setMasterPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Show/Hide password toggles per entry ID
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add Item Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newCategory, setNewCategory] = useState('Logins');
  const [newNotes, setNewNotes] = useState('');

  // Password Generator
  const [genLength, setGenLength] = useState(16);
  const [genSymbols, setGenSymbols] = useState(true);
  const [generatedPass, setGeneratedPass] = useState('');

  const handleUnlock = () => {
    if (!masterPassword.trim()) {
      setErrorMsg('Please enter master password');
      return;
    }
    invoke<VaultEntry[]>('unlock_vault', { masterPass: masterPassword })
      .then((items) => {
        setEntries(items);
        setIsUnlocked(true);
        setErrorMsg(null);
      })
      .catch((err) => {
        setErrorMsg(`Unlock error: ${err}`);
      });
  };

  const handleSaveItem = () => {
    if (!newTitle.trim() || !newPassword.trim()) {
      alert('Title and Password are required');
      return;
    }

    const item: VaultEntry = {
      id: Date.now().toString(),
      title: newTitle,
      username: newUsername,
      password_encrypted: newPassword,
      website: newWebsite,
      category: newCategory,
      notes: newNotes,
      updated_at: new Date().toISOString(),
    };

    invoke<VaultEntry[]>('save_vault_item', { masterPass: masterPassword, item })
      .then((updatedItems) => {
        setEntries(updatedItems);
        setIsAddModalOpen(false);
        setNewTitle('');
        setNewUsername('');
        setNewPassword('');
        setNewWebsite('');
        setNewNotes('');
      })
      .catch((err) => alert(`Error saving item: ${err}`));
  };

  const handleDeleteItem = (id: string) => {
    if (!confirm('Are you sure you want to delete this credential?')) return;
    invoke<VaultEntry[]>('delete_vault_item', { masterPass: masterPassword, id })
      .then((updatedItems) => setEntries(updatedItems))
      .catch((err) => alert(`Error deleting item: ${err}`));
  };

  const handleGeneratePass = () => {
    invoke<string>('generate_password', { length: genLength, includeSymbols: genSymbols })
      .then(setGeneratedPass)
      .catch(console.error);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || e.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-white/10 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            AES-256 Encrypted Password Vault
          </h2>
          <p className="text-xs text-gray-400">
            Zero-Knowledge Local Encrypted Credential Vault & Strength Generator
          </p>
        </div>
        {isUnlocked && (
          <button
            onClick={() => {
              setIsUnlocked(false);
              setMasterPassword('');
              setEntries([]);
            }}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" /> Lock Vault
          </button>
        )}
      </div>

      {/* Lock Screen */}
      {!isUnlocked ? (
        <div className="glass-panel p-8 rounded-2xl border border-white/10 max-w-md mx-auto space-y-6 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
            <Key className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Unlock Orion Vault</h3>
            <p className="text-xs text-gray-400 mt-1">
              Enter your master password to decrypt local credentials (AES-256)
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="password"
              placeholder="Enter Master Password..."
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 text-center"
            />
            <button
              onClick={handleUnlock}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" /> Unlock Encrypted Vault
            </button>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl font-mono">
              {errorMsg}
            </p>
          )}

          <div className="pt-2 text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero-Knowledge local AES-256 encryption active</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search credentials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 w-64"
              />
              <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
                {['All', 'Logins', 'Cards', 'Notes'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedCategory === cat ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Add Credential
            </button>
          </div>

          {/* Credential Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntries.map((item) => {
              const isVisible = visiblePasswords.has(item.id);
              return (
                <div key={item.id} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3 relative group">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Key className="w-4 h-4 text-emerald-400" />
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">{item.website || 'No website specified'}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-gray-500 hover:text-rose-400 p-1 rounded-lg transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs pt-1">
                    <div className="flex items-center justify-between bg-white/5 p-2 rounded-xl border border-white/5">
                      <span className="text-gray-400 truncate">{item.username}</span>
                      <button
                        onClick={() => copyToClipboard(item.username, `usr-${item.id}`)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Copy Username"
                      >
                        {copiedId === `usr-${item.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-white/5 p-2 rounded-xl border border-white/5 font-mono">
                      <span className="text-emerald-400 font-bold truncate">
                        {isVisible ? item.password_encrypted : '••••••••••••'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePasswordVisibility(item.id)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(item.password_encrypted, `pass-${item.id}`)}
                          className="text-gray-400 hover:text-white transition-colors"
                          title="Copy Password"
                        >
                          {copiedId === `pass-${item.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-gray-400 italic bg-white/5 p-2 rounded-xl border border-white/5">
                      {item.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Password Generator Panel */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Password Generator Tool
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-4 text-xs">
              <div className="flex items-center gap-2 flex-1 w-full">
                <span className="text-gray-400">Length: {genLength}</span>
                <input
                  type="range"
                  min="8"
                  max="32"
                  value={genLength}
                  onChange={(e) => setGenLength(Number(e.target.value))}
                  className="flex-1 accent-emerald-500"
                />
              </div>
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={genSymbols}
                  onChange={(e) => setGenSymbols(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span>Include Symbols (!@#$)</span>
              </label>
              <button
                onClick={handleGeneratePass}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-semibold text-white transition-all flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Generate
              </button>
            </div>

            {generatedPass && (
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 font-mono text-sm text-cyan-300">
                <span className="font-bold tracking-wider">{generatedPass}</span>
                <button
                  onClick={() => copyToClipboard(generatedPass, 'gen-pass')}
                  className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-xs text-cyan-200 border border-cyan-500/30 transition-all flex items-center gap-1"
                >
                  {copiedId === 'gen-pass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Credential Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-panel border border-white/20 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" /> Add New Credential
            </h3>

            <div className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Title (e.g. GitHub)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Username / Email"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
              />
              <input
                type="password"
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Website URL (optional)"
                value={newWebsite}
                onChange={(e) => setNewWebsite(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option value="Logins">Category: Logins</option>
                <option value="Cards">Category: Cards</option>
                <option value="Notes">Category: Notes</option>
              </select>
              <textarea
                placeholder="Notes (optional)"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none h-20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-xs text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItem}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white"
              >
                Save Credential
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
