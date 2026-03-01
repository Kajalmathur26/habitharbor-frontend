import { useState, useEffect } from 'react';
import { goalService, aiService } from '../services';
import { Plus, Trash2, X, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['personal', 'career', 'health', 'learning', 'financial'];
const categoryColors = {
  personal: 'bg-purple-100 text-purple-700',
  career: 'bg-blue-100 text-blue-700',
  health: 'bg-green-100 text-green-700',
  learning: 'bg-amber-100 text-amber-700',
  financial: 'bg-teal-100 text-teal-700',
};
const progressColors = ['#f59e0b', '#0d9488', '#10b981', '#3b82f6', '#8b5cf6'];

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'personal', target_date: '', target_value: '', unit: '' });
  const [milestoneInputs, setMilestoneInputs] = useState({});

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    try {
      const res = await goalService.getAll();
      setGoals(res.data.goals || []);
    } catch { toast.error('Failed to load goals'); }
    finally { setLoading(false); }
  };

  const createGoal = async () => {
    if (!form.title.trim()) return toast.error('Title required');
    try {
      const res = await goalService.create({ ...form, status: 'active', progress: 0 });
      setGoals([res.data.goal, ...goals]);
      setForm({ title: '', description: '', category: 'personal', target_date: '', target_value: '', unit: '' });
      setShowForm(false);
      toast.success('Goal created! 🎯');
    } catch { toast.error('Failed to create goal'); }
  };

  const updateProgress = async (goal, progress) => {
    try {
      const res = await goalService.update(goal.id, { progress: Math.min(100, Math.max(0, progress)) });
      setGoals(goals.map(g => g.id === goal.id ? res.data.goal : g));
    } catch { toast.error('Failed to update'); }
  };

  const addMilestone = async (goalId) => {
    const text = milestoneInputs[goalId]?.trim();
    if (!text) return;
    try {
      const res = await goalService.addMilestone(goalId, { title: text });
      setGoals(goals.map(g => g.id === goalId ? { ...g, milestones: [...(g.milestones || []), res.data.milestone] } : g));
      setMilestoneInputs({ ...milestoneInputs, [goalId]: '' });
    } catch { toast.error('Failed to add milestone'); }
  };

  const toggleMilestone = async (goal, milestone) => {
    const updated = { ...milestone, completed: !milestone.completed };
    try {
      // optimistic update
      setGoals(goals.map(g => g.id === goal.id ? {
        ...g,
        milestones: g.milestones.map(m => m.id === milestone.id ? updated : m)
      } : g));
      const completedCount = goal.milestones.filter(m => m.id === milestone.id ? updated.completed : m.completed).length;
      const newProgress = Math.round((completedCount / goal.milestones.length) * 100);
      await updateProgress(goal, newProgress);
    } catch { toast.error('Failed to update milestone'); }
  };

  const deleteGoal = async (id) => {
    try {
      await goalService.delete(id);
      setGoals(goals.filter(g => g.id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  const activeGoals = goals.filter(g => g.status === 'active');

  return (
    <div className="space-y-5 page-transition">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Goals</h1>
          <p className="text-sm text-muted-foreground">{activeGoals.length} active goals</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
          <Plus size={16} /> New Goal
        </button>
      </div>

      {showForm && (
        <div className="hh-card p-5 border-2 border-teal-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">New Goal</h2>
            <button onClick={() => setShowForm(false)}><X size={18} className="text-muted-foreground" /></button>
          </div>
          <div className="space-y-3">
            <input className="hh-input" placeholder="Goal title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <input className="hh-input" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <select className="hh-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="date" className="hh-input" value={form.target_date} onChange={e => setForm({ ...form, target_date: e.target.value })} />
              <input className="hh-input" placeholder="Target value (e.g. 24)" value={form.target_value} onChange={e => setForm({ ...form, target_value: e.target.value })} />
              <input className="hh-input" placeholder="Unit (e.g. books)" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button onClick={createGoal} className="btn-primary text-sm">Create Goal</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
        </div>
      ) : goals.length === 0 ? (
        <div className="hh-card p-12 text-center">
          <Target size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No goals yet. Set one above!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal, idx) => (
            <div key={goal.id} className="hh-card p-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground text-base">{goal.title}</h3>
                    {goal.category && (
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${categoryColors[goal.category] || 'bg-gray-100 text-gray-600'}`}>
                        {goal.category}
                      </span>
                    )}
                  </div>
                  {goal.description && <p className="text-sm text-muted-foreground mt-0.5">{goal.description}</p>}
                  {goal.target_date && <p className="text-xs text-muted-foreground mt-0.5">Target: {goal.target_date}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span className="text-lg font-bold" style={{ color: progressColors[idx % progressColors.length] }}>
                    {goal.progress || 0}%
                  </span>
                  <button onClick={() => deleteGoal(goal.id)} className="text-muted-foreground hover:text-red-500 p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-border rounded-full overflow-hidden mb-4">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${goal.progress || 0}%`, backgroundColor: progressColors[idx % progressColors.length] }}
                />
              </div>

              {/* Progress input */}
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="range" min="0" max="100"
                  value={goal.progress || 0}
                  onChange={e => updateProgress(goal, parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-10 text-right">{goal.progress || 0}%</span>
              </div>

              {/* Milestones */}
              {goal.milestones && goal.milestones.length > 0 && (
                <div className="space-y-2 mb-3">
                  {goal.milestones.map(m => (
                    <div key={m.id} className="flex items-center gap-2">
                      <button
                        onClick={() => toggleMilestone(goal, m)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          m.completed ? 'bg-teal-500 border-teal-500' : 'border-gray-300 hover:border-teal-400'
                        }`}
                      >
                        {m.completed && <span className="text-white text-xs">✓</span>}
                      </button>
                      <span className={`text-sm ${m.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{m.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Add milestone */}
              <div className="flex gap-2 mt-2">
                <input
                  className="hh-input text-xs py-1.5"
                  placeholder="Add milestone..."
                  value={milestoneInputs[goal.id] || ''}
                  onChange={e => setMilestoneInputs({ ...milestoneInputs, [goal.id]: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && addMilestone(goal.id)}
                />
                <button onClick={() => addMilestone(goal.id)} className="btn-primary text-xs py-1.5 px-3 flex-shrink-0">Add</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
