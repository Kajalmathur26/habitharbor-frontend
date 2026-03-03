import React, { useState, useEffect, useCallback, useRef } from 'react';
import { journalService ,aiService } from '@/services';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Image as ImageIcon, Type, Smile, Trash2, Save, ChevronLeft } from 'lucide-react';

const FONTS = [
  { label: 'Default', value: 'Inter, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: 'Courier New, monospace' },
  { label: 'Handwritten', value: 'cursive' },
];

const STICKER_EMOJIS = ['⭐','🎉','🔥','💡','❤️','😊','🌟','✅','📌','🎯','🌈','💪','🍀','🎵','🌸'];

export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // list | editor
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '', content: '', mood: '',
    images: [], stickers: [],
    font_family: 'Inter, sans-serif',
    font_color: '#1f2937',
    font_size: 16,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showFormatBar, setShowFormatBar] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const imgRef = useRef();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await journalAPI.getAll();
      setEntries(res.data.data || []);
    } catch { toast.error('Failed to load journal'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', content: '', mood: '', images: [], stickers: [], font_family: 'Inter, sans-serif', font_color: '#1f2937', font_size: 16 });
    setView('editor');
  };

  const openEdit = async (id) => {
    try {
      const res = await journalAPI.getOne(id);
      const e = res.data.data;
      setEditing(e);
      setForm({
        title: e.title || '',
        content: e.content || '',
        mood: e.mood || '',
        images: e.images || [],
        stickers: e.stickers || [],
        font_family: e.font_family || 'Inter, sans-serif',
        font_color: e.font_color || '#1f2937',
        font_size: e.font_size || 16,
      });
      setView('editor');
    } catch { toast.error('Failed to open entry'); }
  };

  const handleSave = async () => {
    if (!form.title.trim() && !form.content.trim()) { toast.error('Add a title or content'); return; }
    try {
      if (editing) {
        const res = await journalAPI.update(editing.id, form);
        setEntries(prev => prev.map(e => e.id === editing.id ? res.data.data : e));
        toast.success('Entry updated!');
      } else {
        const res = await journalAPI.create(form);
        setEntries(prev => [res.data.data, ...prev]);
        toast.success('Entry saved!');
      }
      setView('list');
    } catch { toast.error('Failed to save entry'); }
  };

  const handleDelete = async (id) => {
    try {
      await journalAPI.delete(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      if (view === 'editor') setView('list');
      toast.success('Entry deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Max 10MB'); return; }
    try {
      setUploadingImage(true);
      const res = await journalAPI.uploadImage(file);
      setForm(p => ({ ...p, images: [...p.images, res.data.data.url] }));
      toast.success('Image uploaded!');
    } catch { toast.error('Upload failed'); }
    finally { setUploadingImage(false); }
  };

  const removeImage = (url) => {
    setForm(p => ({ ...p, images: p.images.filter(i => i !== url) }));
  };

  const addSticker = (emoji) => {
    const sticker = { id: Date.now(), emoji, x: Math.random() * 80, y: Math.random() * 20 };
    setForm(p => ({ ...p, stickers: [...p.stickers, sticker] }));
    setShowStickerPicker(false);
  };

  const removeSticker = (id) => {
    setForm(p => ({ ...p, stickers: p.stickers.filter(s => s.id !== id) }));
  };

  // ── LIST VIEW ──
  if (view === 'list') return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Journal</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{entries.length} entries</p>
          </div>
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-violet-500/20"
          >
            <Plus className="h-4 w-4" /> New Entry
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array(4).fill(0).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-gray-200 dark:bg-gray-700/50 animate-pulse" />)}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <Type className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No entries yet. Start writing!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map(e => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 shadow-sm p-5 hover:shadow-md transition-all cursor-pointer"
                onClick={() => openEdit(e.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900 dark:text-white truncate">{e.title || 'Untitled'}</p>
                      {e.stickers?.length > 0 && <span>{e.stickers[0]?.emoji}</span>}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {e.content?.replace(/<[^>]*>/g, '').slice(0, 120) || 'No content'}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-xs text-gray-400">
                        {new Date(e.created_at).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      {e.images?.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <ImageIcon className="h-3 w-3" /> {e.images.length}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={ev => { ev.stopPropagation(); handleDelete(e.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ── EDITOR VIEW ──
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">

        {/* Editor toolbar */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button onClick={() => setView('list')} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex-1" />
          {/* Font family */}
          <select
            value={form.font_family}
            onChange={e => setForm(p => ({ ...p, font_family: e.target.value }))}
            className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          {/* Font size */}
          <select
            value={form.font_size}
            onChange={e => setForm(p => ({ ...p, font_size: parseInt(e.target.value) }))}
            className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            {[12, 14, 16, 18, 20, 24].map(s => <option key={s} value={s}>{s}px</option>)}
          </select>
          {/* Font color */}
          <div className="relative">
            <input
              type="color"
              value={form.font_color}
              onChange={e => setForm(p => ({ ...p, font_color: e.target.value }))}
              className="h-8 w-8 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
              title="Text color"
            />
          </div>
          {/* Image upload */}
          <button
            onClick={() => imgRef.current?.click()}
            disabled={uploadingImage}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-violet-500 transition-colors"
            title="Upload image"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          {/* Stickers */}
          <div className="relative">
            <button
              onClick={() => setShowStickerPicker(s => !s)}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-violet-500 transition-colors"
              title="Add sticker"
            >
              <Smile className="h-4 w-4" />
            </button>
            <AnimatePresence>
              {showStickerPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 z-50 p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl grid grid-cols-5 gap-2 w-48"
                >
                  {STICKER_EMOJIS.map(e => (
                    <button key={e} onClick={() => addSticker(e)}
                      className="text-xl hover:scale-125 transition-transform"
                    >{e}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Save */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
          >
            <Save className="h-4 w-4" /> Save
          </button>
        </div>

        {/* Editor card */}
        <div className="rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
          {/* Stickers display */}
          {form.stickers.length > 0 && (
            <div className="relative h-16 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-violet-50/50 to-purple-50/50 dark:from-violet-900/10 dark:to-purple-900/10">
              {form.stickers.map(s => (
                <div
                  key={s.id}
                  className="absolute group cursor-pointer"
                  style={{ left: `${s.x}%`, top: '50%', transform: 'translateY(-50%)' }}
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <button
                    onClick={() => removeSticker(s.id)}
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center transition-all"
                  >×</button>
                </div>
              ))}
            </div>
          )}

          <div className="p-6">
            <input
              type="text"
              placeholder="Entry title..."
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              style={{ fontFamily: form.font_family, color: form.font_color }}
              className="w-full text-xl font-bold bg-transparent border-none outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600 mb-4"
            />
            <textarea
              placeholder="What's on your mind today?"
              value={form.content}
              onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              rows={12}
              style={{
                fontFamily: form.font_family,
                color: form.font_color,
                fontSize: `${form.font_size}px`,
              }}
              className="w-full bg-transparent border-none outline-none resize-none placeholder:text-gray-300 dark:placeholder:text-gray-600 leading-relaxed"
            />
          </div>

          {/* Uploaded Images */}
          {form.images.length > 0 && (
            <div className="px-6 pb-6">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Images</p>
              <div className="grid grid-cols-3 gap-2">
                {form.images.map(url => (
                  <div key={url} className="relative group">
                    <img src={url} alt="" className="h-24 w-full object-cover rounded-xl" />
                    <button
                      onClick={() => removeImage(url)}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition-all"
                    >×</button>
                  </div>
                ))}
                {uploadingImage && (
                  <div className="h-24 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-gray-400 animate-bounce" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}