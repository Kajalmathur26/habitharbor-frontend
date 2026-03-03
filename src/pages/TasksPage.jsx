import React, { useState, useEffect, useCallback } from 'react';
import { taskService } from '@/services';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, CheckCircle2, Circle, Clock, Flag,
  Trash2, ChevronDown, Filter, Star, ListTodo
} from 'lucide-react';

const STATUSES = [
  { value: 'todo', label: 'To Do', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700', dot: 'bg-gray-400' },
  { value: 'in_progress', label: 'In Progress', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', dot: 'bg-amber-400' },
  { value: 'done', label: 'Done', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', dot: 'bg-green-400' },
  { value: 'blocked', label: 'Blocked', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', dot: 'bg-red-400' },
];

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const PRIORITY_COLORS = { low: 'text-gray-400', medium: 'text-blue-500', high: 'text-orange-500', urgent: 'text-red-500' };

const EMPTY_FORM = { title: '', description: '', status: 'todo', priority: 'medium', category: '', due_date: '', is_priority: false, things_to_do: [] };

const StatusBadge = ({ status }) => {
  const s = STATUSES.find(x => x.value === status) || STATUSES[0];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const TaskCard = ({ task, onUpdate, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [newTodo, setNewTodo] = useState('');

  const cycleStatus = () => {
    const idx = STATUSES.findIndex(s => s.value === task.status);
    const next = STATUSES[(idx + 1) % STATUSES.length].value;
    onUpdate(task.id, { status: next });
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const updated = [...(task.things_to_do || []), { id: Date.now(), text: newTodo, done: false }];
    onUpdate(task.id, { things_to_do: updated });
    setNewTodo('');
  };

  const toggleTodo = (id) => {
    const updated = (task.things_to_do || []).map(t => t.id === id ? { ...t, done: !t.done } : t);
    onUpdate(task.id, { things_to_do: updated });
  };

  const removeTodo = (id) => {
    const updated = (task.things_to_do || []).filter(t => t.id !== id);
    onUpdate(task.id, { things_to_do: updated });
  };

  const doneTodos = (task.things_to_do || []).filter(t => t.done).length;
  const totalTodos = (task.things_to_do || []).length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`rounded-2xl bg-white dark:bg-gray-800/60 border shadow-sm transition-all ${
        task.is_priority ? 'border-amber-300 dark:border-amber-600/50' : 'border-gray-100 dark:border-gray-700/50'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Status toggle button */}
          <button onClick={cycleStatus} className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110">
            {task.status === 'done'
              ? <CheckCircle2 className="h-5 w-5 text-green-500" />
              : <Circle className="h-5 w-5 text-gray-300 dark:text-gray-600 hover:text-violet-500 transition-colors" />
            }
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {task.is_priority && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />}
                  <p className={`font-semibold text-gray-900 dark:text-white ${task.status === 'done' ? 'line-through opacity-50' : ''}`}>
                    {task.title}
                  </p>
                </div>
                {task.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Flag className={`h-3.5 w-3.5 ${PRIORITY_COLORS[task.priority] || 'text-gray-400'}`} />
                <button onClick={() => setExpanded(e => !e)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
                <button onClick={() => onDelete(task.id)} className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <StatusBadge status={task.status} />
              {task.due_date && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {new Date(task.due_date).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                </span>
              )}
              {totalTodos > 0 && (
                <span className="text-xs text-gray-400">
                  {doneTodos}/{totalTodos} subtasks
                </span>
              )}
            </div>

            {/* Progress bar for todos */}
            {totalTodos > 0 && (
              <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${(doneTodos / totalTodos) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded: Things To Do */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-100 dark:border-gray-700/50"
          >
            <div className="p-4 space-y-3">
              {/* Status selector */}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Status</p>
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.map(s => (
                    <button
                      key={s.value}
                      onClick={() => onUpdate(task.id, { status: s.value })}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        task.status === s.value
                          ? `${s.bg} ${s.color} border-transparent`
                          : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority selector */}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Priority</p>
                <div className="flex gap-2 flex-wrap">
                  {PRIORITIES.map(p => (
                    <button
                      key={p}
                      onClick={() => onUpdate(task.id, { priority: p })}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize border transition-all ${
                        task.priority === p
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400'
                          : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      <Flag className={`h-3 w-3 inline mr-1 ${PRIORITY_COLORS[p]}`} />
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Things to do */}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-1">
                  <ListTodo className="h-3 w-3" /> Subtasks
                </p>
                <div className="space-y-1.5 mb-2">
                  {(task.things_to_do || []).map(todo => (
                    <div key={todo.id} className="flex items-center gap-2 group">
                      <button onClick={() => toggleTodo(todo.id)}>
                        {todo.done
                          ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                          : <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                        }
                      </button>
                      <span className={`text-sm flex-1 ${todo.done ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {todo.text}
                      </span>
                      <button
                        onClick={() => removeTodo(todo.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTodo}
                    onChange={e => setNewTodo(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTodo()}
                    placeholder="Add subtask..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                  <button onClick={addTodo} className="p-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-colors">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Priority star toggle */}
              <button
                onClick={() => onUpdate(task.id, { is_priority: !task.is_priority })}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  task.is_priority ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'
                }`}
              >
                <Star className={`h-4 w-4 ${task.is_priority ? 'fill-amber-400' : ''}`} />
                {task.is_priority ? 'Remove from priority' : 'Mark as priority'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeView, setActiveView] = useState('all'); // all | priority

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await tasksAPI.getAll();
      setTasks(res.data.data || []);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error('Title required'); return; }
    try {
      setSubmitting(true);
      const res = await tasksAPI.create(form);
      setTasks(prev => [res.data.data, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      toast.success('Task created!');
    } catch { toast.error('Failed to create task'); }
    finally { setSubmitting(false); }
  };

  const handleUpdate = async (id, updates) => {
    try {
      const res = await tasksAPI.update(id, updates);
      setTasks(prev => prev.map(t => t.id === id ? res.data.data : t));
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    try {
      await tasksAPI.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const priorityTasks = tasks.filter(t => t.is_priority && t.status !== 'done');
  const filteredTasks = tasks.filter(t =>
    (filterStatus === 'all' || t.status === filterStatus) &&
    (activeView === 'priority' ? t.is_priority : true)
  );

  const counts = STATUSES.reduce((acc, s) => {
    acc[s.value] = tasks.filter(t => t.status === s.value).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Tasks</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{tasks.length} total · {counts.done} done</p>
          </div>
          <button
            onClick={() => setShowForm(s => !s)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-violet-500/20"
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>

        {/* Status summary pills */}
        <div className="flex gap-2 flex-wrap mb-5">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              filterStatus === 'all' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
            }`}
          >
            All ({tasks.length})
          </button>
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => setFilterStatus(s.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                filterStatus === s.value ? `${s.bg} ${s.color} border-transparent` : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {s.label} ({counts[s.value]})
            </button>
          ))}
        </div>

        {/* Priority list toggle */}
        {priorityTasks.length > 0 && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                Priority List ({priorityTasks.length})
              </p>
              <button
                onClick={() => setActiveView(v => v === 'priority' ? 'all' : 'priority')}
                className="text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline"
              >
                {activeView === 'priority' ? 'Show all' : 'View only'}
              </button>
            </div>
            <div className="space-y-1">
              {priorityTasks.slice(0, 3).map(t => (
                <div key={t.id} className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
                  <Circle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                  <span className="truncate">{t.title}</span>
                </div>
              ))}
              {priorityTasks.length > 3 && (
                <p className="text-xs text-amber-600/70 dark:text-amber-500/70">+{priorityTasks.length - 3} more</p>
              )}
            </div>
          </div>
        )}

        {/* Add Task Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-5"
            >
              <div className="rounded-2xl bg-white dark:bg-gray-800/60 border border-violet-200 dark:border-violet-700/50 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 dark:text-white">New Task</h3>
                  <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Task title *"
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <select
                      value={form.status}
                      onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                      className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    >
                      {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <select
                      value={form.priority}
                      onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                      className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 capitalize"
                    >
                      {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                    </select>
                    <input
                      type="text"
                      placeholder="Category"
                      value={form.category}
                      onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                      className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                    <input
                      type="date"
                      value={form.due_date}
                      onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                      className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_priority}
                      onChange={e => setForm(p => ({ ...p, is_priority: e.target.checked }))}
                      className="h-4 w-4 rounded accent-violet-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-400" /> Mark as priority
                    </span>
                  </label>
                  <button
                    onClick={handleCreate}
                    disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    {submitting ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task List */}
        {loading ? (
          <div className="space-y-3">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-gray-200 dark:bg-gray-700/50 animate-pulse" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {filterStatus === 'all' ? 'No tasks yet. Create your first one!' : `No ${filterStatus} tasks.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map(task => (
                <TaskCard key={task.id} task={task} onUpdate={handleUpdate} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}