import { useState, useEffect, useRef } from 'react';
import { journalService, aiService } from '../services';
import { Plus, BookOpen, Trash2, Edit3, Search, Sparkles, X, Calendar, ChevronLeft, Image, Smile } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const MOODS = ['great', 'good', 'okay', 'bad', 'terrible'];
const MOOD_EMOJIS = { great: '😄', good: '🙂', okay: '😐', bad: '😕', terrible: '😢' };

const STICKERS = ['🌟', '🔥', '✨', '💯', '🎉', '❤️', '🌈', '☀️', '🌙', '⚡', '🦋', '🌸', '🍀', '🎵', '🎨', '📖', '💡', '🏆', '🎯', '💎'];

const FONTS = [
  { label: 'Sans', value: 'font-sans' },
  { label: 'Serif', value: 'font-serif' },
  { label: 'Mono', value: 'font-mono' },
  { label: 'Cursive', style: { fontFamily: 'cursive' } },
];

const TEXT_COLORS = [
  '#e2e8f0', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316',
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
  const [fontClass, setFontClass] = useState('font-sans');
  const [fontStyle, setFontStyle] = useState({});
  const [textColor, setTextColor] = useState('#e2e8f0');
  const [images, setImages] = useState([]); // base64 array
  const imageRef = useRef(null);
  const textareaRef = useRef(null);

  const [form, setForm] = useState({
    title: '', content: '', mood: '', tags: '',
    entry_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => { loadEntries(); }, [search]);

  const loadEntries = async () => {
    try {
      const params = search ? { search } : {};
      const res = await journalService.getAll(params);
      setEntries(res.data.entries);
    } catch { toast.error('Failed to load entries'); }
    finally { setLoading(false); }
  };

  const newEntry = () => {
    setCurrent(null);
    setForm({ title: '', content: '', mood: '', tags: '', entry_date: new Date().toISOString().split('T')[0] });
    setImages([]); setFontClass('font-sans'); setFontStyle({}); setTextColor('#e2e8f0');
    setView('editor');
  };

  const editEntry = async (entry) => {
    const res = await journalService.getOne(entry.id);
    const e = res.data.entry;
    setCurrent(e);
    setForm({ title: e.title, content: e.content, mood: e.mood || '', tags: e.tags?.join(', ') || '', entry_date: e.entry_date });
    setImages(e.images || []);
    setView('editor');
  };

  const saveEntry = async () => {
    if (!form.title.trim()) return toast.error('Title required');
    try {
      const data = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        images,
        font_class: fontClass,
        text_color: textColor
      };
      if (current) {
        const res = await journalService.update(current.id, data);
        setEntries(entries.map(e => e.id === current.id ? res.data.entry : e));
        toast.success('Entry updated');
      } else {
        const res = await journalService.create(data);
        setEntries([res.data.entry, ...entries]);
        toast.success('Journal entry saved ✨');
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

  const getAIPrompts = async () => {
    setLoadingPrompts(true);
    try {
      const res = await aiService.generateJournalPrompts({ mood: form.mood || 'reflective' });
      setAiPrompts(res.data.prompts);
    } catch { toast.error('AI prompts unavailable'); }
    finally { setLoadingPrompts(false); }
  };

  const usePrompt = (prompt) => {
    setForm(f => ({ ...f, content: f.content + (f.content ? '\n\n' : '') + prompt }));
    setAiPrompts([]);
    toast.success('Prompt added!');
  };

  const insertSticker = (sticker) => {
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart;
      const newContent = form.content.slice(0, start) + sticker + form.content.slice(start);
      setForm(f => ({ ...f, content: newContent }));
    } else {
      setForm(f => ({ ...f, content: f.content + sticker }));
    }
    setShowStickers(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) return toast.error('Image must be under 3MB');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImages(imgs => [...imgs, ev.target.result]);
      toast.success('Image added!');
    };
    reader.readAsDataURL(file);
  };

  const setFont = (font) => {
    setFontClass(font.value || 'font-sans');
    setFontStyle(font.style || {});
  };

  if (view === 'editor') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('list')} className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground"><ChevronLeft size={20} /></button>
          <h1 className="font-display text-2xl font-bold text-foreground">{current ? 'Edit Entry' : 'New Entry'}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor */}
          <div className="lg:col-span-2 space-y-4">
            <input
              className="input-field text-lg font-semibold"
              placeholder="Entry title..."
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />

            {/* Formatting toolbar */}
            <div className="glass-card p-3 flex flex-wrap items-center gap-3">
              {/* Font selector */}
              <div className="flex gap-1">
                {FONTS.map(f => (
                  <button
                    key={f.label}
                    onClick={() => setFont(f)}
                    className={`px-2 py-1 rounded text-xs transition-all ${(fontClass === (f.value || 'font-sans') && !f.style) || (f.style && fontStyle.fontFamily)
                      ? 'bg-violet-600 text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
                    style={f.style || {}}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="w-px h-5 bg-border/50" />

              {/* Text color */}
              <div className="flex gap-1 items-center">
                <span className="text-xs text-muted-foreground">Color:</span>
                {TEXT_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setTextColor(c)}
                    className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-110 ${textColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ background: c }}
                  />
                ))}
              </div>

              <div className="w-px h-5 bg-border/50" />

              {/* Add image */}
              <button
                onClick={() => imageRef.current.click()}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-white/5"
              >
                <Image size={13} /> Add Image
              </button>
              <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

              {/* Stickers */}
              <div className="relative">
                <button
                  onClick={() => setShowStickers(!showStickers)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-white/5"
                >
                  <Smile size={13} /> Sticker
                </button>
                {showStickers && (
                  <div className="absolute top-full left-0 mt-1 p-2 glass-card z-10 w-48 grid grid-cols-5 gap-1 glow-border">
                    {STICKERS.map(s => (
                      <button key={s} onClick={() => insertSticker(s)} className="text-xl hover:scale-125 transition-transform p-0.5">
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Images preview */}
            {images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt={`img-${i}`} className="w-28 h-28 object-cover rounded-xl border border-border/30" />
                    <button
                      onClick={() => setImages(imgs => imgs.filter((_, idx) => idx !== i))}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <textarea
              ref={textareaRef}
              className={`input-field resize-none min-h-[360px] text-sm leading-relaxed ${fontClass}`}
              style={{ color: textColor !== '#e2e8f0' ? textColor : undefined, ...fontStyle }}
              placeholder="Write your thoughts, feelings, ideas, reflections..."
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
            />

            <button onClick={saveEntry} className="neon-button w-full py-3 flex items-center justify-center gap-2">
              <BookOpen size={16} />
              {current ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="glass-card p-4">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">Entry Details</label>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Date</label>
                  <input type="date" className="input-field text-sm" value={form.entry_date} onChange={e => setForm({ ...form, entry_date: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Mood</label>
                  <div className="flex gap-2 flex-wrap">
                    {MOODS.map(m => (
                      <button key={m} onClick={() => setForm({ ...form, mood: m })}
                        className={`text-2xl transition-all hover:scale-110 ${form.mood === m ? 'scale-125 filter drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]' : 'opacity-60'}`}>
                        {MOOD_EMOJIS[m]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Tags</label>
                  <input className="input-field text-sm" placeholder="tag1, tag2..." value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
                </div>
              </div>
            </div>

            {/* AI Prompts */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} className="text-violet-400" /> AI Prompts
                </label>
                <button onClick={getAIPrompts} disabled={loadingPrompts} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  {loadingPrompts ? '...' : 'Generate'}
                </button>
              </div>
              {aiPrompts.length > 0 ? (
                <div className="space-y-2">
                  {aiPrompts.map((p, i) => (
                    <button key={i} onClick={() => usePrompt(p.prompt)}
                      className="w-full text-left p-3 rounded-xl bg-violet-600/10 border border-violet-500/20 hover:border-violet-500/40 transition-all">
                      <p className="text-xs text-foreground leading-relaxed">{p.prompt}</p>
                      <span className="text-xs text-violet-400 mt-1 block">{p.category}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Click Generate to get AI-powered writing prompts.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Journal</h1>
          <p className="text-muted-foreground text-sm">{entries.length} entries</p>
        </div>
        <button onClick={newEntry} className="neon-button flex items-center gap-2"><Plus size={16} /> New Entry</button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input className="input-field pl-10" placeholder="Search entries..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" /></div>
      ) : entries.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <BookOpen size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">Your journal is empty</p>
          <button onClick={newEntry} className="neon-button mt-4 inline-flex items-center gap-2"><Plus size={16} /> Write Something</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {entries.map(entry => (
            <div key={entry.id} className="glass-card-hover p-5 cursor-pointer group" onClick={() => editEntry(entry)}>
              {/* Image preview if exists */}
              {entry.images?.[0] && (
                <img src={entry.images[0]} alt="cover" className="w-full h-32 object-cover rounded-xl mb-3 border border-border/20" />
              )}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{format(new Date(entry.entry_date), 'MMM d, yyyy')}</span>
                </div>
                {entry.mood && <span className="text-xl">{MOOD_EMOJIS[entry.mood]}</span>}
              </div>
              <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{entry.title}</h3>
              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-1 flex-wrap">
                  {entry.tags?.slice(0, 2).map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded bg-violet-600/20 text-violet-300">{tag}</span>
                  ))}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); deleteEntry(entry.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-rose-400 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
