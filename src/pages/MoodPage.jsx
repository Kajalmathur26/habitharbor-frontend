import { useState, useEffect } from 'react';
import { moodService } from '../services';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const MOODS = [
  { label: 'Terrible', emoji: '😤', score: 1 },
  { label: 'Bad', emoji: '😔', score: 2 },
  { label: 'Neutral', emoji: '😶', score: 3 },
  { label: 'Good', emoji: '😊', score: 4 },
  { label: 'Great', emoji: '🤩', score: 5 },
];

export default function MoodPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState(null);
  const [energy, setEnergy] = useState(50);
  const [note, setNote] = useState('');
  const [logging, setLogging] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([moodService.getAll({ limit: 14 }), moodService.getStats()]);
      setLogs(logsRes.data.logs || []);
      setStats(statsRes.data);
    } catch { toast.error('Failed to load mood data'); }
    finally { setLoading(false); }
  };

  const logMood = async () => {
    if (!selectedMood) return toast.error('Select a mood first');
    setLogging(true);
    try {
      await moodService.log({
        mood_label: selectedMood.label.toLowerCase(),
        mood_score: selectedMood.score,
        energy_level: Math.round(energy / 10),
        note,
        log_date: new Date().toISOString().split('T')[0],
      });
      toast.success('Mood logged! 😊');
      setSelectedMood(null);
      setNote('');
      setEnergy(50);
      await loadData();
    } catch { toast.error('Failed to log mood'); }
    finally { setLogging(false); }
  };

  const chartData = logs.slice().reverse().map(l => ({
    day: l.log_date ? format(new Date(l.log_date), 'EEE') : '',
    score: l.mood_score || 3,
  }));

  const avgScore = stats?.average_score ? parseFloat(stats.average_score).toFixed(1) : '—';

  return (
    <div className="space-y-5 page-transition">
      <div>
        <h1 className="text-xl font-bold text-foreground">Mood Tracker</h1>
      </div>

      {/* Log mood card */}
      <div className="hh-card p-6">
        <h2 className="font-semibold text-foreground mb-5">How are you feeling today?</h2>
        <div className="flex gap-3 mb-6">
          {MOODS.map(m => (
            <button
              key={m.label}
              onClick={() => setSelectedMood(m)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-4 rounded-xl border-2 transition-all ${
                selectedMood?.label === m.label
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-border bg-muted/30 hover:border-teal-300'
              }`}
            >
              <span className="text-3xl">{m.emoji}</span>
              <span className="text-xs font-medium text-muted-foreground">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Energy Level</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Low</span>
            <input type="range" min="0" max="100" value={energy} onChange={e => setEnergy(e.target.value)} className="flex-1" />
            <span className="text-xs text-muted-foreground">High</span>
          </div>
        </div>

        <textarea
          className="hh-input mb-4 resize-none"
          rows={2}
          placeholder="Add a note..."
          value={note}
          onChange={e => setNote(e.target.value)}
        />

        <button
          onClick={logMood}
          disabled={logging || !selectedMood}
          className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          {logging ? 'Logging...' : 'Log Mood'}
        </button>
      </div>

      {/* Stats + Chart */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="hh-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Average Mood</h3>
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="text-center">
              <p className="text-5xl font-bold text-foreground">{avgScore}</p>
              <p className="text-muted-foreground text-sm mt-1">out of 5</p>
            </div>
            <div className="text-5xl">
              {avgScore >= 4 ? '😄' : avgScore >= 3 ? '🙂' : avgScore >= 2 ? '😐' : '😕'}
            </div>
          </div>
          <div className="flex justify-around text-center mt-2">
            <div>
              <p className="text-lg font-bold text-foreground">{stats?.total_logs || 0}</p>
              <p className="text-xs text-muted-foreground">Total Logs</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stats?.streak || 0}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </div>

        <div className="hh-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Mood Over Time</h3>
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(215,16%,47%)' }} />
                <YAxis domain={[1, 5]} hide />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid hsl(210,16%,88%)', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke="#0d9488" strokeWidth={2.5} dot={{ fill: '#0d9488', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-muted-foreground text-sm">
              Log more moods to see your trend
            </div>
          )}
        </div>
      </div>

      {/* Recent entries */}
      {logs.length > 0 && (
        <div className="hh-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Recent Entries</h3>
          <div className="space-y-3">
            {logs.slice(0, 7).map((log, i) => {
              const mood = MOODS.find(m => m.score === log.mood_score) || MOODS[2];
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                  <span className="text-2xl">{mood.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{mood.label}</p>
                    {log.note && <p className="text-xs text-muted-foreground mt-0.5">{log.note}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {log.log_date ? format(new Date(log.log_date), 'MMM d') : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
