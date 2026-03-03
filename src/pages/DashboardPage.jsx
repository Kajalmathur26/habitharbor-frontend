import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  CheckSquare, Target, Smile, BookOpen, RefreshCw,
  Calendar, DollarSign, TrendingUp, TrendingDown,
  BarChart2, Plus, ChevronRight, Zap, Clock,
  Sun, CloudRain, Star, Activity,
} from 'lucide-react';

// ─── Sub-components ────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sub, color, trend, linkTo }) => (
  <motion.div
    whileHover={{ y: -2, scale: 1.01 }}
    transition={{ type: 'spring', stiffness: 400 }}
    className="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 shadow-sm group cursor-default"
  >
    {/* Ambient glow */}
    <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full ${color.replace('text-', 'bg-').replace('-500', '-500/10')} blur-2xl`} />
    
    <div className="relative">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${color.replace('text-', 'bg-').replace('-500', '-500/10')} border ${color.replace('text-', 'border-').replace('-500', '-500/20')}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-1">
        {value ?? '—'}
      </p>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
    
    {linkTo && (
      <Link to={linkTo} className="absolute inset-0 rounded-2xl" aria-label={label} />
    )}
  </motion.div>
);

const SectionHeader = ({ title, linkTo, linkLabel = 'View all' }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-base font-bold text-gray-800 dark:text-white">{title}</h2>
    {linkTo && (
      <Link
        to={linkTo}
        className="flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors"
      >
        {linkLabel} <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    )}
  </div>
);

const card = "rounded-2xl p-5 bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 shadow-sm";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Notes Widget ──────────────────────────────────────────────────────────
const QuickNotes = () => {
  const STORAGE_KEY = 'planora_quick_notes';
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [input, setInput] = useState('');

  const addNote = () => {
    if (!input.trim()) return;
    const updated = [{ id: Date.now(), text: input.trim(), time: new Date().toISOString() }, ...notes].slice(0, 10);
    setNotes(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setInput('');
  };

  const removeNote = (id) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className={card}>
      <SectionHeader title="📝 Quick Notes" />
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addNote()}
          placeholder="Jot something down..."
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
        />
        <button
          onClick={addNote}
          className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-1.5 max-h-44 overflow-y-auto">
        <AnimatePresence initial={false}>
          {notes.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">No notes yet. Add one above!</p>
          )}
          {notes.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="group flex items-start justify-between gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
            >
              <p className="text-sm text-gray-700 dark:text-gray-300 flex-1 leading-relaxed">{n.text}</p>
              <button
                onClick={() => removeNote(n.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all flex-shrink-0 mt-0.5"
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── Plan & Schedule Widget ────────────────────────────────────────────────
const PlanSchedule = ({ events = [] }) => {
  const now = new Date();
  const timeOfDay = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening';
  const greetings = { morning: '☀️ Good morning!', afternoon: '🌤️ Good afternoon!', evening: '🌙 Good evening!' };

  return (
    <div className={card}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
            {now.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h2 className="text-base font-bold text-gray-800 dark:text-white">{greetings[timeOfDay]}</h2>
        </div>
        <Link to="/calendar" className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 flex items-center gap-1">
          Calendar <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-6">
          <Calendar className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-xs text-gray-400">No upcoming events</p>
          <Link to="/calendar" className="text-xs text-violet-500 hover:text-violet-400 mt-1 inline-block">Add one →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {events.slice(0, 4).map((ev, i) => {
            const start = new Date(ev.start_date);
            return (
              <div key={ev.id || i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors">
                <div
                  className="w-1 self-stretch rounded-full flex-shrink-0"
                  style={{ backgroundColor: ev.color || '#8b5cf6' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{ev.title}</p>
                  <p className="text-xs text-gray-400">
                    {start.toLocaleDateString('default', { month: 'short', day: 'numeric' })} ·{' '}
                    {start.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <Clock className="h-3.5 w-3.5 text-gray-300 dark:text-gray-500 flex-shrink-0" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Goals Progress Widget ─────────────────────────────────────────────────
const GoalsWidget = ({ goals = [] }) => (
  <div className={card}>
    <SectionHeader title="🎯 Goals Progress" linkTo="/goals" />
    {goals.length === 0 ? (
      <div className="text-center py-6">
        <Target className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <p className="text-xs text-gray-400">No goals yet</p>
        <Link to="/goals" className="text-xs text-violet-500 hover:text-violet-400 mt-1 inline-block">Set a goal →</Link>
      </div>
    ) : (
      <div className="space-y-4">
        {goals.map((g, i) => (
          <div key={g.id || i}>
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1 mr-2">{g.title}</p>
              <span className="text-xs font-bold text-violet-600 dark:text-violet-400 flex-shrink-0">
                {g.completionPct}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${g.completionPct}%` }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600"
              />
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─── Activity Feed ─────────────────────────────────────────────────────────
const ActivityFeed = ({ activities = [] }) => (
  <div className={card}>
    <SectionHeader title="⚡ Recent Activity" />
    {activities.length === 0 ? (
      <p className="text-xs text-gray-400 text-center py-6">No recent activity</p>
    ) : (
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {activities.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
          >
            <span className="text-lg leading-none flex-shrink-0 mt-0.5">{a.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{a.text}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(a.time).toLocaleDateString('default', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </div>
);

// ─── Main Dashboard ────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/dashboard');
      setData(res.data.data);
    } catch (err) {
      setError('Failed to load dashboard');
      toast.error('Could not load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const firstName = user?.name?.split(' ')[0] || 'there';

  if (loading) return <DashboardSkeleton />;

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600" />
      <p className="text-gray-500 dark:text-gray-400">{error}</p>
      <button onClick={load} className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors flex items-center gap-2">
        <RefreshCw className="h-4 w-4" /> Retry
      </button>
    </div>
  );

  const { stats, weeklyData, moodData, taskDistribution, upcomingEvents,
    recentJournal, recentActivities, goals, finance } = data;

  const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              Hey, {firstName} 👋
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Here's your life at a glance — {new Date().toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={load}
            className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </motion.div>

        {/* ── Stat Cards (row 1) ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
        >
          <StatCard
            icon={CheckSquare}
            label="Total Tasks"
            value={stats.totalTasks}
            sub={`${stats.tasksCompletedToday} done`}
            color="text-violet-500"
            linkTo="/tasks"
          />
          <StatCard
            icon={RefreshCw}
            label="Habits Today"
            value={`${stats.habitsCompletedToday}/${stats.habitsTotal}`}
            sub="completed"
            color="text-green-500"
            linkTo="/habits"
          />
          <StatCard
            icon={Target}
            label="Avg Goal"
            value={`${stats.avgGoalProgress}%`}
            sub={`${stats.goalsTotal} active`}
            color="text-blue-500"
            linkTo="/goals"
          />
          <StatCard
            icon={Smile}
            label="Avg Mood"
            value={stats.avgMood ? `${stats.avgMood}/10` : '—'}
            sub="last 30 days"
            color="text-amber-500"
            linkTo="/mood"
          />
          <StatCard
            icon={TrendingUp}
            label="Income"
            value={`₹${Math.round(finance.monthlyIncome / 1000)}k`}
            sub="this month"
            color="text-teal-500"
            linkTo="/finance"
          />
          <StatCard
            icon={TrendingDown}
            label="Expenses"
            value={`₹${Math.round(finance.monthlyExpense / 1000)}k`}
            sub={`₹${Math.round(finance.netBalance / 1000)}k net`}
            color="text-red-500"
            linkTo="/finance"
          />
        </motion.div>

        {/* ── Charts (row 2) ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {/* Weekly Activity Chart */}
          <div className={`${card} lg:col-span-2`}>
            <SectionHeader title="📊 Weekly Activity" linkTo="/tasks" />
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradAdded" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.15)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gradCompleted)" dot={{ r: 3, fill: '#8b5cf6' }} />
                <Area type="monotone" dataKey="added" name="Added" stroke="#06b6d4" strokeWidth={2.5} fill="url(#gradAdded)" dot={{ r: 3, fill: '#06b6d4' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Task Distribution Pie */}
          <div className={card}>
            <SectionHeader title="📋 Tasks" linkTo="/tasks" />
            {taskDistribution.every(d => d.value === 0) ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <CheckSquare className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs">No tasks yet</p>
                <Link to="/tasks" className="text-xs text-violet-500 mt-1">Add a task →</Link>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={taskDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                    >
                      {taskDistribution.map((entry, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {taskDistribution.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{d.name}</span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-auto">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* ── Mood Chart ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={card}
        >
          <SectionHeader title="😊 Mood — Last 7 Days" linkTo="/mood" />
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={moodData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.15)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} ticks={[0, 5, 10]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-xs">
                      <p className="text-white/50">{label}</p>
                      <p className="text-amber-400 font-bold">
                        {payload[0].value !== null ? `${payload[0].value}/10` : 'No entry'}
                      </p>
                    </div>
                  ) : null
                }
              />
              <Bar dataKey="score" name="Mood" radius={[6, 6, 0, 0]}>
                {moodData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.score === null ? 'rgba(156,163,175,0.2)' :
                      entry.score >= 8 ? '#10b981' :
                      entry.score >= 6 ? '#f59e0b' :
                      entry.score >= 4 ? '#f97316' : '#ef4444'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-end">
            {[{ label: 'Great (8-10)', color: 'bg-green-500' }, { label: 'Good (6-7)', color: 'bg-amber-400' }, { label: 'Low (<6)', color: 'bg-red-400' }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${l.color}`} />
                <span className="text-xs text-gray-400">{l.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Bottom Grid (row 3) ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {/* Quick Notes */}
          <div className="sm:col-span-1">
            <QuickNotes />
          </div>

          {/* Plan & Schedule */}
          <div className="sm:col-span-1">
            <PlanSchedule events={upcomingEvents} />
          </div>

          {/* Goals */}
          <div className="sm:col-span-1">
            <GoalsWidget goals={goals} />
          </div>

          {/* Activity Feed */}
          <div className="sm:col-span-1">
            <ActivityFeed activities={recentActivities} />
          </div>
        </motion.div>

        {/* ── Recent Journal ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={card}
        >
          <SectionHeader title="📓 Recent Journal Entries" linkTo="/journal" />
          {recentJournal.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-400 mb-2">No journal entries yet</p>
              <Link to="/journal" className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-500 font-medium">
                Write your first entry →
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentJournal.map((j, i) => (
                <Link
                  key={j.id || i}
                  to="/journal"
                  className="group p-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 hover:bg-violet-50 dark:hover:bg-violet-900/20 border border-transparent hover:border-violet-200 dark:hover:border-violet-700/40 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-400">
                      {new Date(j.created_at).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                    </p>
                    {j.mood && <span className="text-sm">{getMoodEmoji(j.mood)}</span>}
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate mb-1">
                    {j.title || 'Untitled Entry'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {j.content?.replace(/<[^>]*>/g, '').slice(0, 100) || 'No content...'}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Quick Actions ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
            {[
              { to: '/tasks', icon: CheckSquare, label: 'New Task', color: 'text-violet-500', bg: 'bg-violet-500/10 hover:bg-violet-500/15 border-violet-500/20' },
              { to: '/goals', icon: Target, label: 'Add Goal', color: 'text-blue-500', bg: 'bg-blue-500/10 hover:bg-blue-500/15 border-blue-500/20' },
              { to: '/journal', icon: BookOpen, label: 'Write', color: 'text-pink-500', bg: 'bg-pink-500/10 hover:bg-pink-500/15 border-pink-500/20' },
              { to: '/mood', icon: Smile, label: 'Log Mood', color: 'text-amber-500', bg: 'bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/20' },
              { to: '/habits', icon: RefreshCw, label: 'Habits', color: 'text-green-500', bg: 'bg-green-500/10 hover:bg-green-500/15 border-green-500/20' },
              { to: '/calendar', icon: Calendar, label: 'Event', color: 'text-indigo-500', bg: 'bg-indigo-500/10 hover:bg-indigo-500/15 border-indigo-500/20' },
              { to: '/finance', icon: DollarSign, label: 'Finance', color: 'text-teal-500', bg: 'bg-teal-500/10 hover:bg-teal-500/15 border-teal-500/20' },
              { to: '/ai-assistant', icon: Zap, label: 'Ask AI', color: 'text-red-500', bg: 'bg-red-500/10 hover:bg-red-500/15 border-red-500/20' },
            ].map(({ to, icon: Icon, label, color, bg }) => (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border ${bg} transition-all group`}
              >
                <div className={`p-2 rounded-xl bg-white/50 dark:bg-white/5 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color}`} />
                </div>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

// ─── Skeleton Loader ───────────────────────────────────────────────────────
const DashboardSkeleton = () => {
  const Bone = ({ className }) => (
    <div className={`animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700/50 ${className}`} />
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Bone className="h-8 w-48" />
            <Bone className="h-4 w-72" />
          </div>
          <Bone className="h-10 w-10 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array(6).fill(0).map((_, i) => <Bone key={i} className="h-28" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <Bone className="h-72 lg:col-span-2" />
          <Bone className="h-72" />
        </div>
        <Bone className="h-44" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <Bone key={i} className="h-64" />)}
        </div>
        <Bone className="h-48" />
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {Array(8).fill(0).map((_, i) => <Bone key={i} className="h-20" />)}
        </div>
      </div>
    </div>
  );
};

// Helper used in journal cards
const getMoodEmoji = (mood) => {
  if (!mood) return null;
  const score = typeof mood === 'number' ? mood : 5;
  if (score >= 9) return '🌟';
  if (score >= 7) return '😊';
  if (score >= 5) return '😐';
  if (score >= 3) return '😔';
  return '😢';
};

export default DashboardPage;