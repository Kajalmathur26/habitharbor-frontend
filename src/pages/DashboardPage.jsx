import { useState, useEffect } from 'react';
import { dashboardService, taskService, habitService, moodService } from '../services';
import { useAuth } from '../context/AuthContext';
import {
  CheckSquare, Heart, Flame, Target, Sparkles, Plus,
  Calendar, BookOpen, TrendingUp, List, Star
} from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem('planora_quicknotes') || '[]'));
  const [noteInput, setNoteInput] = useState('');
  const today = new Date();
  const dayOfWeek = format(today, 'EEEE');
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => { loadDashboard(); }, []);
  useEffect(() => { localStorage.setItem('planora_quicknotes', JSON.stringify(notes)); }, [notes]);

  const loadDashboard = async () => {
    try {
      const res = await dashboardService.getData();
      setData(res.data);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  const addNote = () => {
    if (!noteInput.trim()) return;
    const newNote = { id: Date.now(), text: noteInput.trim(), date: format(today, 'MMM d, h:mm a') };
    setNotes(n => [newNote, ...n]);
    setNoteInput('');
    toast.success('Note saved!');
  };

  const deleteNote = (id) => setNotes(n => n.filter(note => note.id !== id));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center animate-pulse">
            <span className="text-white text-xl font-bold">P</span>
          </div>
          <p className="text-muted-foreground text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const tasks = data?.tasks || {};
  const habits = data?.habits || {};
  const mood = data?.mood || {};
  const goals = data?.goals || {};

  // Build chart data
  const last7 = eachDayOfInterval({ start: subDays(today, 6), end: today });
  const weeklyData = last7.map(d => ({
    day: format(d, 'EEE'),
    tasks: Math.floor(Math.random() * 5),  // Replace with real data if available
    habits: Math.floor(Math.random() * 4),
  }));

  const taskDistribution = [
    { name: 'Pending', value: tasks.pending || 0, color: '#F59E0B' },
    { name: 'In Progress', value: tasks.in_progress || 0, color: '#3B82F6' },
    { name: 'Completed', value: tasks.completed || 0, color: '#10B981' },
  ].filter(d => d.value > 0);

  const moodData = (data?.recentMoods || []).slice(0, 7).reverse().map(m => ({
    day: format(new Date(m.log_date), 'EEE'),
    score: m.mood_score
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass-card p-2.5 text-xs border border-border/50">
        <p className="font-semibold text-foreground">{label}</p>
        {payload.map(p => <p key={p.name} style={{ color: p.color || p.fill }}>{p.name}: {p.value}</p>)}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {dayOfWeek}, {format(today, 'MMMM d, yyyy')} — Let's make it count.
          </p>
        </div>
        {user?.avatar && (
          <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-border/50">
            <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: CheckSquare, label: 'Tasks Done', value: tasks.completed || 0, sub: `${tasks.pending || 0} pending`, color: 'emerald', emoji: '✅' },
          { icon: Flame, label: 'Active Habits', value: habits.active || 0, sub: `${habits.completedToday || 0} done today`, color: 'orange', emoji: '🔥' },
          { icon: Target, label: 'Goals', value: goals.active || 0, sub: `${goals.completed || 0} completed`, color: 'violet', emoji: '🎯' },
          { icon: Heart, label: 'Mood Today', value: mood.today?.mood_score ? `${mood.today.mood_score}/10` : '—', sub: mood.today?.mood_label || 'Not logged', color: 'rose', emoji: '💜' },
        ].map(({ icon: Icon, label, value, sub, color, emoji }) => (
          <div key={label} className="stat-card group hover:scale-[1.02] transition-all">
            <div className={`inline-flex p-2 rounded-xl bg-${color}-500/15 mb-3 group-hover:bg-${color}-500/25 transition-colors`}>
              <Icon size={18} className={`text-${color}-400`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{emoji} {value}</p>
            <p className="text-sm font-medium text-foreground mt-0.5">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Activity */}
        <div className="lg:col-span-2 glass-card p-5">
          <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-violet-400" />
            Weekly Activity
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#666' }} />
              <YAxis tick={{ fontSize: 11, fill: '#666' }} width={25} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="tasks" name="Tasks" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="habits" name="Habits" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task Distribution Pie */}
        <div className="glass-card p-5">
          <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <List size={18} className="text-violet-400" />
            Task Status
          </h2>
          {taskDistribution.length === 0 ? (
            <div className="flex items-center justify-center h-36 text-sm text-muted-foreground">No tasks yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={taskDistribution} cx="50%" cy="50%" outerRadius={50} innerRadius={28} dataKey="value" paddingAngle={3}>
                    {taskDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {taskDistribution.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-xs text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="text-xs font-medium text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mood Trend */}
      {moodData.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Heart size={18} className="text-rose-400" />
            7-Day Mood Trend
          </h2>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={moodData}>
              <defs>
                <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#F43F5E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#666' }} />
              <YAxis domain={[1, 10]} tick={{ fontSize: 11, fill: '#666' }} width={20} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="score" stroke="#F43F5E" strokeWidth={2} fill="url(#moodGrad)" dot={{ fill: '#F43F5E', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bottom 2-col: Quick Notes + Plan & Schedules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Notes */}
        <div className="glass-card p-5">
          <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-amber-400" />
            Quick Notes
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              className="input-field flex-1 text-sm py-2"
              placeholder="Capture a thought..."
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addNote()}
            />
            <button onClick={addNote} className="neon-button px-3 py-2"><Plus size={15} /></button>
          </div>
          {notes.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">Notes you jot here stay on this device</p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {notes.map(n => (
                <div key={n.id} className="flex items-start gap-2 p-2.5 rounded-xl bg-secondary/50 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">{n.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.date}</p>
                  </div>
                  <button onClick={() => deleteNote(n.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-rose-400 transition-all flex-shrink-0 mt-0.5">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Plan & Schedules */}
        <div className="glass-card p-5">
          <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-indigo-400" />
            Plan & Schedules
          </h2>
          <div className="space-y-3">
            {/* Today's events from dashboard data */}
            {(data?.todayEvents || []).length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={28} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No events scheduled today</p>
                <a href="/calendar" className="text-xs text-violet-400 hover:text-violet-300 mt-1 inline-block transition-colors">→ Open Calendar</a>
              </div>
            ) : (
              (data?.todayEvents || []).slice(0, 4).map(ev => (
                <div key={ev.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ev.color || '#8B5CF6' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{ev.title}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(ev.start_time), 'h:mm a')}</p>
                  </div>
                </div>
              ))
            )}

            {/* Upcoming goals */}
            {(data?.upcomingGoals || []).length > 0 && (
              <>
                <div className="border-t border-border/30 pt-3 mt-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Goal Deadlines</p>
                  {(data?.upcomingGoals || []).slice(0, 2).map(g => (
                    <div key={g.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-secondary/50 transition-all">
                      <Target size={14} className="text-amber-400 flex-shrink-0" />
                      <p className="text-xs text-foreground flex-1 truncate">{g.title}</p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {g.target_date ? format(new Date(g.target_date), 'MMM d') : 'No date'}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {data?.recentActivity?.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Star size={18} className="text-amber-400" />
            Recent Activity
          </h2>
          <div className="space-y-2">
            {data.recentActivity.slice(0, 5).map((activity, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50">
                <span className="text-base">{activity.icon || '📌'}</span>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{activity.text}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
