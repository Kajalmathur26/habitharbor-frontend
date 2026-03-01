import { useState, useEffect } from 'react';
import { journalService, aiService } from '../services';
import { Plus, Trash2, Search, Sparkles, X, ChevronLeft, Image, Smile, Type } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const MOODS = ['great', 'good', 'okay', 'bad', 'terrible'];
const MOOD_EMOJIS = { great: '😄', good: '🙂', okay: '😐', bad: '😕', terrible: '😢' };

const STICKERS = [
  '⭐', '🌟', '🎉', '🎊', '❤️', '💙', '💚', '💛', '🧡', '💜',
  '🌈', '☀️', '🌙', '⚡', '🔥', '💧', '🌸', '🌺', '🍀', '🌿',
  '🦋', '🐝', '🦄', '🐉', '🏆', '🎯', '💡', '📚', '✏️', '🎨',
  '🎵', '🎶', '🍕', '☕', '🌊', '🏔️', '🌲', '🌻', '💎', '🚀',
];

const FONTS = [
  { label: 'Default', value: 'inherit' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: 'monospace' },
  { label: 'Cursive', value: 'cursive' },
  { label: 'Fantasy', value: 'fantasy' },
];

export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [current, setCurrent] = useState(null);
  const [search, setSearch] = useState('');
  const [aiPrompts, setAiPrompts] = useState([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showFonts, setShowFonts] = useState(false);
  const [selectedFont, setSelectedFont] = useState('inherit');
  const [images, setImages] = useState([]); // {url, name}
  const [form, setForm] = useState({
    title: '',
    content: '',
    mood: '',
    tags: '',
    entry_date: new Date().toISOString().split('T')[0],
    stickers: [],
  });

  useEffect(() => { loadEntries(); }, [search]);

  const loadEntries = async () => {
    try {
      const params = search ? { search } : {};
      const res = await journalService.getAll(params);
      setEntries(res.data.entries || []);
    } catch { toast.error('Failed to load entries'); }
    finally { setLoading(false); }
  };

  const newEntry = () => {
    setCurrent(null);
    setForm({ title: '', content: '', mood: '', tags: '', entry_date: new Date().toISOString().split('T')[0], stickers: [] });
    setImages([]);
    setSelectedFont('inherit');
    setView('editor');
  };

  const editEntry = async (entry) => {
    try {
      const res = await journalService.getOne(entry.id);
      const e = res.data.entry;
      setCurrent(e);
      setForm({
        title: e.title,
        content: e.content,
        mood: e.mood || '',
        tags: e.tags?.join(', ') || '',
        entry_date: e.entry_date,
        stickers: e.stickers || [],
      });
      setImages([]);
      setSelectedFont('inherit');
      setView('editor');
    } catch { toast.error('Failed to load entry'); }
  };

  const saveEntry = async () => {
    if (!form.title.trim()) return toast.error('Title required');
    try {
      const data = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        font: selectedFont,
      };
      if (current) {
        const res = await journalService.update(current.id, data);
        setEntries(entries.map(e => e.id === current.id ? res.data.entry : e));
        toast.success('Entry updated!');
      } else {
        const res = await journalService.create(data);
        setEntries([res.data.entry, ...entries]);
        toast.success('Journal entry saved! ✨');
      }
      setView('list');
    } catch { toast.error('Failed to save entry'); }
  };

  const deleteEntry = async (id) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await journalService.delete(id);
      setEntries(entries.filter(e => e.id !== id));
      toast.success('Entry deleted');
    } catch { toast.error('Failed to delete entry'); }
  };

  const generatePrompts = async () => {
    setLoadingPrompts(true);
    try {
      const res = await aiService.generateJournalPrompts({ mood: form.mood || 'reflective' });
      setAiPrompts(res.data.prompts || []);
    } catch { toast.error('Failed to generate prompts'); }
    finally { setLoadingPrompts(false); }
  };

  const addSticker = (sticker) => {
    setForm({ ...form, stickers: [...(form.stickers || []), sticker] });
    setShowStickers(false);
  };

  const removeSticker = (idx) => {
    setForm({ ...form, stickers: form.stickers.filter((_, i) => i !== idx) });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
      const url = URL.createObjectURL(file);
      setImages(prev => [...prev, { url, name: file.name }]);
    });
  };

  const removeImage = (idx) => setImages(images.filter((_, i) => i !== idx));

  if (view === 'editor') {
    return (
      <div className="space-y-4 page-transition max-w-3xl">
        {/* Editor header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setView('list')} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-foreground">{current ? 'Edit Entry' : 'New Entry'}</h1>
          <div className="flex-1" />
          <button onClick={saveEntry} className="btn-primary text-sm">
            Save Entry
          </button>
        </div>

        <div className="hh-card p-5 space-y-4">
          {/* Title & Date */}
          <div className="grid grid-cols-2 gap-3">
            <input
              className="hh-input col-span-2 text-base font-semibold"
              placeholder="Entry title..."
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
            <input type="date" className="hh-input" value={form.entry_date} onChange={e => setForm({ ...form, entry_date: e.target.value })} />
            <select className="hh-input" value={form.mood} onChange={e => setForm({ ...form, mood: e.target.value })}>
              <option value="">Mood...</option>
              {MOODS.map(m => <option key={m} value={m}>{MOOD_EMOJIS[m]} {m}</option>)}
            </select>
          </div>

          {/* Editor toolbar */}
          <div className="flex items-center gap-2 py-2 border-y border-border">
            {/* Image upload */}
            <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors">
              <Image size={15} />
              <span>Image</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            </label>

            {/* Stickers */}
            <div className="relative">
              <button
                onClick={() => setShowStickers(!showStickers)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Smile size={15} />
                <span>Stickers</span>
              </button>
              {showStickers && (
                <div className="absolute top-full left-0 mt-1 z-30 bg-card border border-border rounded-xl p-3 shadow-lg w-64">
                  <div className="grid grid-cols-8 gap-1.5">
                    {STICKERS.map(s => (
                      <button key={s} onClick={() => addSticker(s)} className="text-xl hover:scale-125 transition-transform leading-none py-0.5">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Font selector */}
            <div className="relative">
              <button
                onClick={() => setShowFonts(!showFonts)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Type size={15} />
                <span>Font</span>
              </button>
              {showFonts && (
                <div className="absolute top-full left-0 mt-1 z-30 bg-card border border-border rounded-xl p-2 shadow-lg w-40">
                  {FONTS.map(f => (
                    <button
                      key={f.value}
                      onClick={() => { setSelectedFont(f.value); setShowFonts(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedFont === f.value ? 'bg-teal-100 text-teal-700 font-medium' : 'hover:bg-muted text-foreground'}`}
                      style={{ fontFamily: f.value }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stickers display */}
          {form.stickers && form.stickers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.stickers.map((s, i) => (
                <div key={i} className="relative group">
                  <span className="text-2xl">{s}</span>
                  <button onClick={() => removeSticker(i)} className="absolute -top-1 -right-1 hidden group-hover:flex w-4 h-4 bg-red-500 text-white rounded-full items-center justify-center text-xs">×</button>
                </div>
              ))}
            </div>
          )}

          {/* Content textarea */}
          <textarea
            className="hh-input resize-none"
            rows={12}
            placeholder="Write your thoughts..."
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
            style={{ fontFamily: selectedFont }}
          />

          {/* Uploaded images */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative rounded-lg overflow-hidden">
                  <img src={img.url} alt={img.name} className="w-full h-28 object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-500 transition-colors"
                  >×</button>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          <input
            className="hh-input"
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={e => setForm({ ...form, tags: e.target.value })}
          />
        </div>

        {/* AI Prompts */}
        <div className="hh-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles size={16} className="text-teal-500" /> AI Journal Prompts
            </h3>
            <button
              onClick={generatePrompts}
              disabled={loadingPrompts}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50"
            >
              {loadingPrompts ? 'Generating...' : 'Generate'}
            </button>
          </div>
          {aiPrompts.length > 0 && (
            <div className="space-y-2">
              {aiPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setForm({ ...form, content: form.content + (form.content ? '\n\n' : '') + p.prompt })}
                  className="w-full text-left p-3 rounded-lg bg-teal-50 border border-teal-100 text-sm text-foreground hover:bg-teal-100 transition-colors"
                >
                  {p.prompt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 page-transition">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Journal</h1>
          <p className="text-sm text-muted-foreground">{entries.length} entries</p>
        </div>
        <button onClick={newEntry} className="btn-primary text-sm">
          <Plus size={16} /> New Entry
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          className="hh-input pl-9"
          placeholder="Search entries..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Entries */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="hh-card p-12 text-center">
          <p className="text-muted-foreground">No journal entries yet. Start writing!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <div
              key={entry.id}
              className="hh-card p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => editEntry(entry)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {entry.mood && <span className="text-lg">{MOOD_EMOJIS[entry.mood]}</span>}
                    {entry.stickers && entry.stickers.slice(0, 3).map((s, i) => (
                      <span key={i} className="text-base">{s}</span>
                    ))}
                    <h3 className="font-semibold text-foreground truncate">{entry.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {entry.content?.replace(/<[^>]+>/g, '')}
                  </p>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-700 text-xs font-medium">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {entry.entry_date ? format(new Date(entry.entry_date), 'MMM d') : ''}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); deleteEntry(entry.id); }}
                    className="text-muted-foreground hover:text-red-500 p-1 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
