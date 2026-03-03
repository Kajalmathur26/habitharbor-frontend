import React, { useState, useEffect, useCallback } from 'react';
import { goalService } from '@/services';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Target, Trash2, CheckCircle2, Circle } from 'lucide-react';

const EMPTY_FORM = { title: '', description: '', target_date: '', targets: [] };

const GoalCard = ({ goal, onUpdateTargets, onDelete }) => {
  const [newTarget, setNewTarget] = useState('');
  const [targets, setTargets] = useState(goal.targets || []);
  const [expanded, setExpanded] = useState(false);

  const pct = targets.length > 0
    ? Math.round(targets.filter(t => t.done).length / targets.length * 100)
    : goal.progress || 0;

  const syncTargets = async (updated) => {
    setTargets(updated);
    await onUpdateTargets(goal.id, updated);
  };

  const addTarget = () => {
    if (!newTarget.trim()) return;
    syncTargets([...targets, { id: Date.now(), label: newTarget.trim(), done: false }]);
    setNewTarget('');
  };

  const toggleTarget = (id) => {
    syncTargets(targets.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const removeTarget = (id) => {
    syncTargets(targets.filter(t => t.id !== id));
  };

  const ringColor = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#8b5cf6';
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Ring progress */}
          <div className="flex-shrink-0 relative">
            <svg width="68" height="68" className="-rotate-90">
              <circle cx="34" cy="34" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-100 dark:text-gray-700" />
              <circle
                cx="34" cy="34" r="28" fill="none"
                stroke={ringColor} strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-gray-800 dark:text-white">
              {pct}%
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{goal.title}</h3>
                {goal.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{goal.description}</p>}
                {goal.target_date && (
                  <p className="text-xs text-gray-400 mt-1">
                    Target: {new Date(goal.target_date).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setExpanded(e => !e)}
                  className="text-xs px-2 py-1 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 font-medium hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
                >
                  {expanded ? 'Hide' : `${targets.length} targets`}
                </button>
                <button
                  onClick={() => onDelete(goal.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-100 dark:border-gray-700/50"
          >
            <div className="p-5 space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Intermediate Targets
              </p>
              {targets.length === 0 && (
                <p className="text-xs text-gray-400 py-2">No targets yet. Add milestones below.</p>
              )}
              {targets.map(t => (
                <div key={t.id} className="flex items-center gap-2.5 group">
                  <button onClick={() => toggleTarget(t.id)} className="flex-shrink-0">
                    {t.done
                      ? <CheckCircle2 className="h-4.5 w-4.5 text-green-500" />
                      : <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600 hover:text-violet-500 transition-colors" />
                    }
                  </button>
                  <span className={`text-sm flex-1 ${t.done ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                    {t.label}
                  </span>
                  <button
                    onClick={() => removeTarget(t.id)}
                    className="opacity-0 group-hover:opacity-100 transition-all text-gray-400 hover:text-red-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={newTarget}
                  onChange={e => setNewTarget(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTarget()}
                  placeholder="Add a milestone..."
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
                <button onClick={addTarget} className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await goalService.getAll();
      setGoals(res.data.data || []);
    } catch { toast.error('Failed to load goals'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error('Title required'); return; }
    try {
      setSubmitting(true);
      const res = await goalService.create(form);
      setGoals(prev => [res.data.data, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      toast.success('Goal created!');
    } catch { toast.error('Failed to create goal'); }
    finally { setSubmitting(false); }
  };

  const handleUpdateTargets = async (id, targets) => {
    try {
      const res = await goalService.updateTargets(id, targets);
      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...res.data.data } : g));
    } catch { toast.error('Failed to update targets'); }
  };

  const handleDelete = async (id) => {
    try {
      await goalService.delete(id);
      setGoals(prev => prev.filter(g => g.id !== id));
      toast.success('Goal deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const overallProgress = goals.length > 0
    ? Math.round(goals.reduce((s, g) => {
        const targets = g.targets || [];
        const pct = targets.length > 0
          ? targets.filter(t => t.done).length / targets.length * 100
          : g.progress || 0;
        return s + pct;
      }, 0) / goals.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Goals</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {goals.length} goal{goals.length !== 1 ? 's' : ''} · {overallProgress}% overall
            </p>
          </div>
          <button
            onClick={() => setShowForm(s => !s)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-violet-500/20"
          >
            <Plus className="h-4 w-4" /> New Goal
          </button>
        </div>

        {/* Overall progress bar */}
        {goals.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</p>
              <span className="text-sm font-black text-violet-600 dark:text-violet-400">{overallProgress}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600"
              />
            </div>
          </div>
        )}

        {/* Create Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-5"
            >
              <div className="rounded-2xl bg-white dark:bg-gray-800/60 border border-violet-200 dark:border-violet-700/50 p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800 dark:text-white">New Goal</h3>
                  <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <input type="text" placeholder="Goal title *" value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                  <textarea placeholder="Description" value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                  />
                  <input type="date" value={form.target_date}
                    onChange={e => setForm(p => ({ ...p, target_date: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                  <button onClick={handleCreate} disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> {submitting ? 'Creating...' : 'Create Goal'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goals List */}
        {loading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-gray-200 dark:bg-gray-700/50 animate-pulse" />)}
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-16">
            <Target className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No goals yet. Set your first goal!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {goals.map(goal => (
                <GoalCard key={goal.id} goal={goal} onUpdateTargets={handleUpdateTargets} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}