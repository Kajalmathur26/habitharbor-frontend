import { useState, useEffect } from 'react';
import { taskService } from '../services';
import { Plus, CheckCircle2, Circle, Trash2, Edit3, AlertTriangle, X, ListTodo, Star } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const CATEGORIES = ['all', 'work', 'personal', 'health', 'learning', 'hobbies'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const PRIORITY_COLORS = { low: 'emerald', medium: 'amber', high: 'orange', urgent: 'rose' };
const PRIORITY_ICONS = { low: '🟢', medium: '🟡', high: '🟠', urgent: '🔴' };

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: 'all', status: '', priority: '' });
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [activePanel, setActivePanel] = useState('board'); // board | priority | todo
  const [todos, setTodos] = useState(() => JSON.parse(localStorage.getItem('planora_todos') || '[]'));
  const [todoInput, setTodoInput] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: 'personal', priority: 'medium', status: 'pending', due_date: '' });

  useEffect(() => { loadTasks(); }, [filter]);
  useEffect(() => { localStorage.setItem('planora_todos', JSON.stringify(todos)); }, [todos]);

  const loadTasks = async () => {
    try {
      const params = {};
      if (filter.category !== 'all') params.category = filter.category;
      if (filter.status) params.status = filter.status;
      if (filter.priority) params.priority = filter.priority;
      const res = await taskService.getAll(params);
      setTasks(res.data.tasks);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Task title required');
    try {
      if (editTask) {
        const res = await taskService.update(editTask.id, form);
        setTasks(tasks.map(t => t.id === editTask.id ? res.data.task : t));
        toast.success('Task updated');
      } else {
        const res = await taskService.create(form);
        setTasks([res.data.task, ...tasks]);
        toast.success('Task created! ✅');
      }
      resetForm();
    } catch { toast.error('Failed to save task'); }
  };

  const toggleComplete = async (task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      const res = await taskService.update(task.id, { status: newStatus });
      setTasks(tasks.map(t => t.id === task.id ? res.data.task : t));
    } catch { toast.error('Failed to update task'); }
  };

  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskService.delete(id);
      setTasks(tasks.filter(t => t.id !== id));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
  };

  const startEdit = (task) => {
    setEditTask(task);
    setForm({ title: task.title, description: task.description || '', category: task.category, priority: task.priority, status: task.status, due_date: task.due_date || '' });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false); setEditTask(null);
    setForm({ title: '', description: '', category: 'personal', priority: 'medium', status: 'pending', due_date: '' });
  };

  // Quick to-do list
  const addTodo = () => {
    if (!todoInput.trim()) return;
    setTodos([...todos, { id: Date.now(), text: todoInput.trim(), done: false }]);
    setTodoInput('');
  };
  const toggleTodo = (id) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTodo = (id) => setTodos(todos.filter(t => t.id !== id));

  const groupedTasks = {
    pending: tasks.filter(t => t.status === 'pending'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed'),
  };

  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  const prioritySorted = [...tasks].filter(t => t.status !== 'completed').sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground text-sm">{tasks.filter(t => t.status === 'pending').length} pending · {tasks.filter(t => t.status === 'completed').length} done</p>
        </div>
        <button onClick={() => setShowForm(true)} className="neon-button flex items-center gap-2">
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Panel Tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-xl p-1 w-fit">
        {[
          { key: 'board', label: 'Board' },
          { key: 'priority', label: '🔴 Priority List' },
          { key: 'todo', label: '📝 Things To Do' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActivePanel(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activePanel === tab.key ? 'bg-violet-600 text-white shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters (visible in board mode) */}
      {activePanel === 'board' && (
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(f => ({ ...f, category: cat }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter.category === cat ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
            >
              {cat}
            </button>
          ))}
          <select
            className="px-3 py-1.5 rounded-lg text-xs bg-secondary text-muted-foreground border-none outline-none"
            value={filter.status}
            onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            className="px-3 py-1.5 rounded-lg text-xs bg-secondary text-muted-foreground border-none outline-none"
            value={filter.priority}
            onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}
          >
            <option value="">All Priority</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_ICONS[p]} {p}</option>)}
          </select>
        </div>
      )}

      {/* BOARD VIEW */}
      {activePanel === 'board' && (
        loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" /></div>
        ) : tasks.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <CheckCircle2 size={40} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">No tasks yet</p>
            <button onClick={() => setShowForm(true)} className="neon-button mt-4 inline-flex items-center gap-2"><Plus size={16} /> New Task</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: 'pending', label: 'To Do', color: 'amber' },
              { key: 'in_progress', label: 'In Progress', color: 'blue' },
              { key: 'completed', label: 'Done', color: 'emerald' },
            ].map(({ key, label, color }) => (
              <div key={key} className="glass-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-${color}-400`} />
                    {label}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-${color}-500/15 text-${color}-400`}>
                    {groupedTasks[key]?.length || 0}
                  </span>
                </div>
                <div className="space-y-3">
                  {groupedTasks[key]?.map(task => (
                    <TaskCard key={task.id} task={task} onToggle={toggleComplete} onEdit={startEdit} onDelete={deleteTask} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* PRIORITY LIST VIEW */}
      {activePanel === 'priority' && (
        <div className="glass-card p-5">
          <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Star size={18} className="text-amber-400" />
            Priority Queue
          </h2>
          {prioritySorted.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No pending tasks</p>
          ) : (
            <div className="space-y-3">
              {prioritySorted.map((task, i) => {
                const isOverdue = task.due_date && task.due_date < new Date().toISOString().split('T')[0];
                return (
                  <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isOverdue ? 'border-rose-500/30 bg-rose-500/5' : 'border-transparent bg-secondary/50'}`}>
                    <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                    <span className="text-base">{PRIORITY_ICONS[task.priority]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground capitalize">{task.category}</span>
                        {task.due_date && (
                          <span className={`text-xs flex items-center gap-0.5 ${isOverdue ? 'text-rose-400' : 'text-muted-foreground'}`}>
                            {isOverdue && <AlertTriangle size={10} />}
                            {format(new Date(task.due_date + 'T00:00:00'), 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => toggleComplete(task)} className="flex-shrink-0">
                      <Circle size={18} className="text-muted-foreground hover:text-violet-400 transition-colors" />
                    </button>
                    <button onClick={() => startEdit(task)} className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground flex-shrink-0">
                      <Edit3 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* THINGS TO DO VIEW */}
      {activePanel === 'todo' && (
        <div className="glass-card p-5">
          <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <ListTodo size={18} className="text-violet-400" />
            Quick To-Do List
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">Saved locally</span>
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              className="input-field flex-1"
              placeholder="Add a quick to-do..."
              value={todoInput}
              onChange={e => setTodoInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTodo()}
            />
            <button onClick={addTodo} className="neon-button px-4"><Plus size={16} /></button>
          </div>
          {todos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No items yet — add something above!</p>
          ) : (
            <div className="space-y-2">
              {todos.map(todo => (
                <div key={todo.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 group">
                  <button onClick={() => toggleTodo(todo.id)} className="flex-shrink-0">
                    {todo.done ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Circle size={18} className="text-muted-foreground hover:text-violet-400 transition-colors" />}
                  </button>
                  <span className={`flex-1 text-sm ${todo.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{todo.text}</span>
                  <button onClick={() => deleteTodo(todo.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-rose-400 transition-all flex-shrink-0">
                    <X size={14} />
                  </button>
                </div>
              ))}
              {todos.some(t => t.done) && (
                <button onClick={() => setTodos(todos.filter(t => !t.done))} className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-2">
                  Clear completed ({todos.filter(t => t.done).length})
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Task Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 glow-border animate-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-semibold text-foreground">{editTask ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className="input-field" placeholder="Task title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <textarea className="input-field resize-none h-20" placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="input-field" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_ICONS[p]} {p}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                  <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="pending">⏳ Pending</option>
                    <option value="in_progress">🔄 In Progress</option>
                    <option value="completed">✅ Completed</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Due Date</label>
                  <input type="date" className="input-field" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground text-sm transition-all">Cancel</button>
                <button type="submit" className="flex-1 neon-button py-2.5">{editTask ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const isOverdue = task.due_date && task.due_date < new Date().toISOString().split('T')[0] && task.status !== 'completed';
  return (
    <div className={`p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-all group border ${isOverdue ? 'border-rose-500/30' : 'border-transparent'}`}>
      <div className="flex items-start gap-2">
        <button onClick={() => onToggle(task)} className="mt-0.5 flex-shrink-0">
          {task.status === 'completed'
            ? <CheckCircle2 size={18} className="text-emerald-400" />
            : <Circle size={18} className="text-muted-foreground hover:text-violet-400 transition-colors" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-tight ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</p>
          {task.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground capitalize">{task.category}</span>
            <span className="text-xs">{PRIORITY_ICONS[task.priority]}</span>
            {task.due_date && (
              <span className={`text-xs flex items-center gap-0.5 ${isOverdue ? 'text-rose-400' : 'text-muted-foreground'}`}>
                {isOverdue && <AlertTriangle size={10} />}
                {format(new Date(task.due_date + 'T00:00:00'), 'MMM d')}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
        <button onClick={() => onEdit(task)} className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground"><Edit3 size={13} /></button>
        <button onClick={() => onDelete(task.id)} className="p-1 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-rose-400"><Trash2 size={13} /></button>
      </div>
    </div>
  );
}
