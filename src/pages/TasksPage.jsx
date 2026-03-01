import { useState, useEffect } from 'react';
import { taskService } from '../services';
import { Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const CATEGORIES = ['Personal', 'Work', 'Health', 'Learning', 'Finance', 'Other'];
const FILTERS = ['All', 'To Do', 'In Progress', 'Done'];

const priorityColor = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const statusMap = { 'All': '', 'To Do': 'todo', 'In Progress': 'in_progress', 'Done': 'done' };

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', category: '', due_date: '' });

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    try {
      const res = await taskService.getAll();
      setTasks(res.data.tasks || []);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  const createTask = async () => {
    if (!form.title.trim()) return toast.error('Title required');
    try {
      const res = await taskService.create({ ...form, status: 'todo' });
      setTasks([res.data.task, ...tasks]);
      setForm({ title: '', description: '', priority: 'medium', category: '', due_date: '' });
      setShowForm(false);
      toast.success('Task added!');
    } catch { toast.error('Failed to create task'); }
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in_progress' : 'done';
    try {
      const res = await taskService.update(task.id, { status: newStatus });
      setTasks(tasks.map(t => t.id === task.id ? res.data.task : t));
    } catch { toast.error('Failed to update task'); }
  };

  const deleteTask = async (id) => {
    try {
      await taskService.delete(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch { toast.error('Failed to delete task'); }
  };

  const filtered = filter === 'All' ? tasks : tasks.filter(t => t.status === statusMap[filter]);
  const completed = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="space-y-5 page-transition">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground">{completed}/{tasks.length} completed</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <div className="hh-card p-5 border-teal-200 border-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">New Task</h2>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
          </div>
          <div className="space-y-3">
            <input className="hh-input" placeholder="Task title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <input className="hh-input" placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-3 gap-3">
              <select className="hh-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select className="hh-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="date" className="hh-input" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button onClick={createTask} className="btn-primary text-sm">Add Task</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-teal-600 text-white' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="hh-card p-12 text-center">
          <p className="text-muted-foreground">No tasks yet. Add one above!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => (
            <div key={task.id} className="hh-card p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleStatus(task)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    task.status === 'done' ? 'bg-teal-500 border-teal-500' : 'border-gray-300 hover:border-teal-400'
                  }`}
                >
                  {task.status === 'done' && <span className="text-white text-xs">✓</span>}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </p>
                  {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {task.priority && (
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${priorityColor[task.priority] || 'bg-gray-100 text-gray-600'}`}>
                        {task.priority}
                      </span>
                    )}
                    {task.category && (
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                        {task.category}
                      </span>
                    )}
                    {task.due_date && (
                      <span className="text-xs text-muted-foreground">
                        Due: {format(new Date(task.due_date), 'yyyy-MM-dd')}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-muted-foreground hover:text-red-500 transition-colors p-1 flex-shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
