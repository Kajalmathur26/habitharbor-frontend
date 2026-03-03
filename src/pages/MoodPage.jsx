import React, { useState, useEffect, useCallback } from 'react';
import { moodService } from '@/services';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, BarChart, Bar
} from 'recharts';
import { Smile, TrendingUp, Edit2, Check, X } from 'lucide-react';

const MOODS = [
  { score: 10, emoji: '🌟', label: 'Amazing' },
  { score: 8, emoji: '😊', label: 'Happy' },
  { score: 6, emoji: '😐', label: 'Neutral' },
  { score: 4, emoji: '😔', label: 'Sad' },
  { score: 2, emoji: '😢', label: 'Terrible' },
];

const EMOTION_TAGS = ['Anxious', 'Calm', 'Energetic', 'Tired', 'Focused', 'Distracted', 'Grateful', 'Stressed', 'Excited', 'Lonely', 'Motivated', 'Overwhelmed'];

const scoreColor = (s) => {
  if (!s) return '#e5e7eb';
  if (s >= 8) return '#10b981';
  if (s >= 6) return '#f59e0b';
  if (s >= 4) return '#f97316';
  return '#ef4444';
};

export default function MoodPage() {
  const [moods, setMoods] = useState([]);
  const [trend7, setTrend7] = useState([]);
  const [trend30, setTrend30] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendDays, setTrendDays] = useState(7);

  const [score, setScore] = useState(7);
  const [emotions, setEmotions] = useState([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editScore, setEditScore] = useState(7);
  const [editNotes, setEditNotes] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [moodsRes, t7, t30] = await Promise.all([
        moodAPI.getAll(),
        moodAPI.getTrend(7),
        moodAPI.getTrend(30),
      ]);
      setMoods(moodsRes.data.data || []);
      setTrend7(t7.data.data || []);
      setTrend30(t30.data.data || []);
    } catch { toast.error('Failed to load mood data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleLog = async () => {
    try {
      setSubmitting(true);
      const res = await moodAPI.create({ mood_score: score, emotions, notes });
      setMoods(prev => [res.data.data, ...prev]);
      setNotes('');
      setEmotions([]);
      await load(); // refresh trends
      toast.success('Mood logged!');
    } catch { toast.error('Failed to log mood'); }
    finally { setSubmitting(false); }
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setEditScore(m.mood_score);
    setEditNotes(m.notes || '');
  };

  const saveEdit = async (id) => {
    try {
      const res = await moodAPI.update(id, { mood_score: editScore, notes: editNotes });
      setMoods(prev => prev.map(m => m.id === id ? res.data.data : m));
      setEditingId(null);
      await load();
      toast.success('Mood updated!');
    } catch { toast.error('Failed to update'); }
  };

  const toggleEmotion = (tag) => {
    setEmotions(prev => prev.includes(tag) ? prev.filter(e => e !== tag) : [...prev, tag]);
  };

  const trendData = trendDays === 7 ? trend7 : trend30;
  const avgScore = moods.length > 0
    ? (moods.reduce((s, m) => s + m.mood_score, 0) / moods.length).toFixed(1)
    : null;

  const currentMood = MOODS.find(m => m.score <= score) || MOODS[MOODS.length - 1];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Mood Tracker</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {avgScore ? `Your average mood: ${avgScore}/10` : 'Start tracking your mood'}
          </p>
        </div>

        {/* ── Log Mood Card ── */}
        <div className="rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 dark:text-white mb-5">How are you feeling?</h2>

          {/* Big emoji display */}
          <div className="text-center mb-5">
            <motion.span
              key={score}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl"
            >
              {currentMood.emoji}
            </motion.span>
            <p className="text-lg font-bold text-gray-700 dark:text-gray-300 mt-2">{currentMood.label}</p>
          </div>

          {/* Slider */}
          <div className="mb-5">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>😢 Terrible</span>
              <span className="font-bold text-gray-700 dark:text-gray-300">{score}/10</span>
              <span>🌟 Amazing</span>
            </div>
            <input
              type="range"
              min={1} max={10}
              value={score}
              onChange={e => setScore(parseInt(e.target.value))}
              className="w-full h-3 rounded-full appearance-none cursor-pointer accent-violet-500"
              style={{ background: `linear-gradient(to right, ${scoreColor(score)} ${score * 10}%, #e5e7eb ${score * 10}%)` }}
            />
          </div>

          {/* Emotion Tags */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Emotions (optional)</p>
            <div className="flex flex-wrap gap-2">
              {EMOTION_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleEmotion(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                    emotions.includes(tag)
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <textarea
            placeholder="What's on your mind? (optional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none mb-4"
          />

          <button
            onClick={handleLog}
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Smile className="h-4 w-4" />
            {submitting ? 'Logging...' : 'Log Mood'}
          </button>
        </div>

        {/* ── Trend Charts ── */}
        <div className="rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-500" /> Mood Trend
            </h2>
            <div className="flex gap-2">
              {[7, 30].map(d => (
                <button
                  key={d}
                  onClick={() => setTrendDays(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    trendDays === d
                      ? 'bg-violet-600 text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {trendData.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No mood data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.15)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false} tickLine={false}
                  interval={trendDays === 30 ? 5 : 0}
                />
                <YAxis domain={[0, 10]} ticks={[0, 5, 10]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length && payload[0].value !== null ? (
                      <div className="bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
                        <p className="text-white/50">{label}</p>
                        <p className="font-bold" style={{ color: scoreColor(payload[0].value) }}>
                          {payload[0].value}/10
                        </p>
                      </div>
                    ) : null
                  }
                />
                <Line
                  type="monotone" dataKey="score"
                  stroke="#8b5cf6" strokeWidth={2.5}
                  dot={({ cx, cy, payload }) =>
                    payload.score !== null ? (
                      <circle key={cx} cx={cx} cy={cy} r={4}
                        fill={scoreColor(payload.score)} stroke="white" strokeWidth={1.5}
                      />
                    ) : <g key={cx} />
                  }
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── History ── */}
        <div className="rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 dark:text-white mb-4">History</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {moods.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No entries yet</p>
            ) : moods.map(m => (
              <div key={m.id} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                {editingId === m.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input type="range" min={1} max={10} value={editScore}
                      onChange={e => setEditScore(parseInt(e.target.value))}
                      className="w-24 accent-violet-500"
                    />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 w-8">{editScore}/10</span>
                    <input type="text" value={editNotes}
                      onChange={e => setEditNotes(e.target.value)}
                      placeholder="Notes..."
                      className="flex-1 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white focus:outline-none"
                    />
                    <button onClick={() => saveEdit(m.id)} className="p-1 text-green-500 hover:text-green-400">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:text-gray-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-2xl flex-shrink-0">
                      {MOODS.find(x => x.score <= m.mood_score)?.emoji || '😐'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: scoreColor(m.mood_score) }}>
                          {m.mood_score}/10
                        </span>
                        {m.emotions?.length > 0 && (
                          <span className="text-xs text-gray-400 truncate">
                            {m.emotions.slice(0, 3).join(', ')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-400">
                          {new Date(m.log_date || m.created_at).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {m.notes && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{m.notes}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => startEdit(m)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-violet-500 transition-all"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}