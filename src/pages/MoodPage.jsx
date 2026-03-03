import { useState, useEffect } from 'react';
import { moodService } from '../services';
import { Heart, TrendingUp, Edit2 } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import toast from 'react-hot-toast';

const MOODS = [
  { score: 10, label: 'amazing', emoji: '🤩', color: '#10B981' },
  { score: 8, label: 'great', emoji: '😄', color: '#34D399' },
  { score: 6, label: 'good', emoji: '🙂', color: '#60A5FA' },
  { score: 5, label: 'okay', emoji: '😐', color: '#A78BFA' },
  { score: 3, label: 'bad', emoji: '😕', color: '#F59E0B' },
  { score: 1, label: 'terrible', emoji: '😢', color: '#EF4444' },
];

const EMOTIONS = ['Happy', 'Calm', 'Anxious', 'Excited', 'Sad', 'Frustrated', 'Grateful', 'Tired', 'Focused', 'Hopeful'];

export default function MoodPage() {
  const [moods, setMoods] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false); // editing today's mood
  const [chartRange, setChartRange] = useState('30'); // '7' or '30'
  const today = new Date().toISOString().split('T')[0];
  const todayMood = moods.find(m => m.log_date === today);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [moodsRes, statsRes] = await Promise.all([moodService.getAll(), moodService.getStats()]);
      setMoods(moodsRes.data.moods);
      setStats(statsRes.data);
    } catch { toast.error('Failed to load mood data'); }
    finally { setLoading(false); }
  };

  const startEdit = () => {
    if (!todayMood) return;
    setSelectedMood(MOODS.find(m => m.label === todayMood.mood_label) || null);
    setSelectedEmotions(todayMood.emotions || []);
    setNotes(todayMood.notes || '');
    setEditMode(true);
  };

  const logMood = async () => {
    if (!selectedMood) return toast.error('Please select a mood');
    setSaving(true);
    try {
      if (editMode && todayMood) {
        await moodService.update(todayMood.id, {
          mood_score: selectedMood.score,
          mood_label: selectedMood.label,
          emotions: selectedEmotions,
          notes
        });
        toast.success(`Mood updated! ${selectedMood.emoji}`);
      } else {
        await moodService.log({ mood_score: selectedMood.score, mood_label: selectedMood.label, emotions: selectedEmotions, notes });
        toast.success(`Mood logged! ${selectedMood.emoji}`);
      }
      setSelectedMood(null); setSelectedEmotions([]); setNotes(''); setEditMode(false);
      await loadData();
    } catch { toast.error('Failed to save mood'); }
    finally { setSaving(false); }
  };

  const toggleEmotion = (emotion) => {
    setSelectedEmotions(prev => prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]);
  };

  const days = parseInt(chartRange);
  const dateRange = eachDayOfInterval({ start: subDays(new Date(), days - 1), end: new Date() });
  const chartData = dateRange.map(day => {
    const d = format(day, 'yyyy-MM-dd');
    const log = moods.find(m => m.log_date === d);
    return { date: format(day, days <= 7 ? 'EEE' : 'MM/dd'), score: log?.mood_score || null, label: log?.mood_label };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const mood = MOODS.find(m => m.score === payload[0]?.value);
    return (
      <div className="glass-card p-2.5 text-xs border border-border/50">
        <p className="font-semibold text-foreground">{label}</p>
        {mood && <p className="mt-1">{mood.emoji} {mood.label} ({payload[0].value}/10)</p>}
      </div>
    );
  };

  const showLogger = !todayMood || editMode;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Mood Tracker</h1>
        <p className="text-muted-foreground text-sm">How are you feeling today?</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" /></div>
      ) : (
        <>
          {/* Today's Mood Logging / Display */}
          {showLogger ? (
            <div className="glass-card p-6 glow-border">
              <h2 className="font-display font-semibold text-foreground mb-5">
                {editMode ? '✏️ Update Today\'s Mood' : 'Log Today\'s Mood'}
              </h2>

              <div className="flex justify-center gap-2 md:gap-4 mb-6 flex-wrap">
                {MOODS.map(mood => (
                  <button
                    key={mood.label}
                    onClick={() => setSelectedMood(mood)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-200 hover:scale-110
                      ${selectedMood?.label === mood.label ? 'scale-125 ring-2 bg-white/10' : 'opacity-60 hover:opacity-90'}`}
                    style={selectedMood?.label === mood.label ? { ringColor: mood.color } : {}}
                  >
                    <span className="text-4xl">{mood.emoji}</span>
                    <span className="text-xs capitalize text-muted-foreground">{mood.label}</span>
                  </button>
                ))}
              </div>

              {selectedMood && (
                <div className="space-y-4 animate-in">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">Emotions</label>
                    <div className="flex flex-wrap gap-2">
                      {EMOTIONS.map(e => (
                        <button key={e} onClick={() => toggleEmotion(e)}
                          className={`text-xs px-3 py-1.5 rounded-full transition-all ${selectedEmotions.includes(e)
                            ? 'bg-violet-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                            : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    className="input-field resize-none h-20 text-sm"
                    placeholder="Add notes about your day... (optional)"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />

                  <div className="flex gap-3">
                    {editMode && (
                      <button onClick={() => { setEditMode(false); setSelectedMood(null); }} className="flex-1 py-3 rounded-xl border border-border text-muted-foreground text-sm hover:text-foreground transition-all">
                        Cancel
                      </button>
                    )}
                    <button onClick={logMood} disabled={saving} className="flex-1 neon-button py-3 flex items-center justify-center gap-2">
                      {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>
                        <Heart size={16} /> {editMode ? 'Update' : 'Save'} Mood {selectedMood.emoji}
                      </>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-5 border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{MOODS.find(m => m.label === todayMood.mood_label)?.emoji || '😊'}</span>
                  <div>
                    <p className="font-semibold text-foreground capitalize">Feeling {todayMood.mood_label} today</p>
                    <p className="text-sm text-muted-foreground">Score: {todayMood.mood_score}/10</p>
                    {todayMood.emotions?.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {todayMood.emotions.map(e => <span key={e} className="text-xs px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300">{e}</span>)}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={startEdit}
                  className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-violet-500/50 transition-all"
                >
                  <Edit2 size={14} /> Edit
                </button>
              </div>
              {todayMood.notes && <p className="mt-3 text-sm text-muted-foreground italic">"{todayMood.notes}"</p>}
            </div>
          )}

          {/* Stats Row */}
          {stats && (
            <div className="grid grid-cols-3 gap-4">
              <div className="stat-card text-center">
                <p className="text-3xl font-bold gradient-text">{stats.average || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Avg Score</p>
              </div>
              <div className="stat-card text-center">
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">Days Tracked</p>
              </div>
              <div className="stat-card text-center">
                <p className="text-3xl font-bold text-foreground">
                  {stats.average >= 7 ? '🌟' : stats.average >= 5 ? '😊' : '💙'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.average >= 7 ? 'Thriving' : stats.average >= 5 ? 'Stable' : 'Needs care'}
                </p>
              </div>
            </div>
          )}

          {/* Mood Chart with 7/30 toggle */}
          {chartData.filter(d => d.score).length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp size={18} className="text-violet-400" />
                  Mood Trend
                </h2>
                <div className="flex rounded-xl border border-border overflow-hidden">
                  {['7', '30'].map(r => (
                    <button
                      key={r}
                      onClick={() => setChartRange(r)}
                      className={`px-3 py-1.5 text-xs font-medium transition-all ${chartRange === r ? 'bg-violet-600 text-white' : 'text-muted-foreground hover:bg-white/5'}`}
                    >
                      {r}d
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                {chartRange === '7' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#666' }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#666' }} width={20} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} />
                    <YAxis domain={[1, 10]} tick={{ fontSize: 10, fill: '#666' }} width={20} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#moodFill)" dot={{ fill: '#8B5CF6', r: 3 }} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent entries */}
          <div className="glass-card p-5">
            <h2 className="font-display font-semibold text-foreground mb-4">Recent Entries</h2>
            {moods.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No mood entries yet. Start tracking above!</p>
            ) : (
              <div className="space-y-3">
                {moods.slice(0, 10).map(mood => (
                  <div key={mood.id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50">
                    <span className="text-2xl">{MOODS.find(m => m.label === mood.mood_label)?.emoji || '😊'}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground capitalize">{mood.mood_label}</span>
                        <span className="text-xs text-muted-foreground">Score: {mood.mood_score}/10</span>
                      </div>
                      {mood.emotions?.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {mood.emotions.slice(0, 4).map((e, i, arr) => (
                            <span key={e} className="text-xs text-muted-foreground">{e}{i < Math.min(3, arr.length - 1) ? ' ·' : ''}</span>
                          ))}
                        </div>
                      )}
                      {mood.notes && <p className="text-xs text-muted-foreground mt-0.5 truncate italic">"{mood.notes}"</p>}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(mood.log_date), 'MMM d')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
