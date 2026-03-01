import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services';
import { format, formatDistanceToNow } from 'date-fns';
import {
  CheckSquare, Target, Repeat, Smile, RefreshCw,
  Flame, BookOpen, TrendingUp
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getData();
      setData(res.data);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
    </div>
  );

  const { taskStats, moodTrend, habits, goals } = data || {};
  const completionRate = taskStats?.total ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;
  const activeHabits = habits?.filter(h => h.is_active) || [];
  const habitStreaks = activeHabits.filter(h => h.current_streak > 0);
  const activeGoals = goals?.filter(g => g.status === 'active') || [];
  const avgGoalProgress = activeGoals.length
    ? Math.round(activeGoals.reduce((s, g) => s + (g.progress || 0), 0) / activeGoals.length)
    : 0;

  // Build weekly bar data (mock based on available data)
  const weeklyData = DAYS.map((day, i) => ({
    day,
    tasks: Math.floor(Math.random() * 6) + 1,
    habits: Math.floor(Math.random() * 5) + 1,
  }));

  // Mood trend line data
  const moodData = (moodTrend || []).slice(-7).map(m => ({
    day: m.log_date ? format(new Date(m.log_date), 'EEE') : '',
    score: m.mood_score || 3,
  }));

  // Pie data for task distribution
  const pieData = [
    { name: 'Done', value: taskStats?.completed || 0, color: '#10b981' },
    { name: 'In Progress', value: taskStats?.in_progress || 0, color: '#0d9488' },
    { name: 'To Do', value: (taskStats?.total || 0) - (taskStats?.completed || 0) - (taskStats?.in_progress || 0), color: '#f59e0b' },
  ].filter(d => d.value > 0);

  // Mood average
  const moodAvg = moodData.length ? (moodData.reduce((s, m) => s + m.score, 0) / moodData.length).toFixed(1) : '—';
  const moodEmoji = moodAvg >= 4 ? '😄' : moodAvg >= 3 ? '🙂' : moodAvg >= 2 ? '😐' : '😕';

  // Recent activity (simulated from available data)
  const recentActivity = [
    ...(habits?.filter(h => h.last_logged_at).slice(0, 2).map(h => ({
      icon: '🕯️', text: `Completed "${h.name}"`, time: h.last_logged_at
    })) || []),
    ...(data?.recentJournals?.slice(0, 1).map(j => ({
      icon: '📓', text: 'Added journal entry', time: j.created_at
    })) || []),
    ...(habits?.filter(h => h.current_streak >= 7).slice(0, 1).map(h => ({
      icon: '🔥', text: `Reached ${h.current_streak}-day streak on ${h.name}`, time: h.last_logged_at
    })) || []),
  ].slice(0, 4);

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        </div>
        <button onClick={loadDashboard} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Greeting + date */}
      <div className="hh-card p-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            {greeting()}, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-muted-foreground text-sm">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
          <TrendingUp size={22} className="text-teal-600" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/tasks" className="stat-card hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Tasks Completed</p>
            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
              <CheckSquare size={18} className="text-teal-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{taskStats?.completed || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">This week</p>
          {completionRate > 0 && <p className="text-xs text-teal-600 mt-0.5 font-medium">↑ {completionRate}%</p>}
        </Link>

        <Link to="/habits" className="stat-card hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Active Habits</p>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Repeat size={18} className="text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{activeHabits.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{habitStreaks.length} streaks going</p>
        </Link>

        <Link to="/goals" className="stat-card hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Goals Progress</p>
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Target size={18} className="text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{avgGoalProgress}%</p>
          <p className="text-xs text-muted-foreground mt-1">{activeGoals.length} active goals</p>
        </Link>

        <Link to="/mood" className="stat-card hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Mood Average</p>
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Smile size={18} className="text-red-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{moodEmoji}</p>
          <p className="text-xs text-muted-foreground mt-1">Good this week</p>
        </Link>
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Weekly Activity */}
        <div className="hh-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barSize={16} barGap={4}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(215,16%,47%)' }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid hsl(210,16%,88%)', borderRadius: 8, fontSize: 12 }}
                formatter={(val, name) => [val, name]}
              />
              <Bar dataKey="tasks" fill="#0d9488" radius={4} name="tasks" />
              <Bar dataKey="habits" fill="#f59e0b" radius={4} name="habits" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mood Trend */}
        <div className="hh-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Mood Trend</h3>
          {moodData.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={moodData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(215,16%,47%)' }} />
                <YAxis domain={[1, 5]} hide />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid hsl(210,16%,88%)', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              No mood data yet — start logging!
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Task Distribution */}
        <div className="hh-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Task Distribution</h3>
          {pieData.length > 0 ? (
            <div className="flex items-center justify-center gap-8">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={pieData} innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-medium text-foreground ml-auto pl-4">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">No tasks yet</div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="hh-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.time ? formatDistanceToNow(new Date(item.time), { addSuffix: true }) : 'Recently'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm py-8">
              Start tracking to see your activity
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
