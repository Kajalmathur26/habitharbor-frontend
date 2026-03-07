import { useState, useEffect } from 'react';
import { goalService, aiService, taskService } from '../services';
import {
  Target, Plus, Trash2, ChevronDown, ChevronUp, Sparkles, Check,
  X, Edit3, Zap, CheckCircle2, Circle, Milestone, TrendingUp, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const CATEGORIES = ['personal', 'work', 'health', 'education', 'finance', 'relationships', 'other'];
const STATUS_COLORS = { active: 'text-violet-400', completed: 'text-emerald-400', paused: 'text-amber-400' };

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(null);
  const [expandedGoals, setExpandedGoals] = useState({});
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [suggestingAI, setSuggestingAI] = useState(false);
  const [milestoneInputs, setMilestoneInputs] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [form, setForm] = useState({ title: '', description: '', category: 'personal', target_date: '', target_value: 100, unit: '%' });

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    try {
      const res = await goalService.getAll();
      setGoals(res.data.goals);
    } catch { toast.error('Failed to load goals'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('Title is required');
    try {
      const res = await goalService.create(form);
      setGoals([res.data.goal, ...goals]);
      setShowForm(false);
      setForm({ title: '', description: '', category: 'personal', target_date: '', target_value: 100, unit: '%' });
      toast.success('Goal created! 🎯');
    } catch { toast.error('Failed to create goal'); }
  };

  const handleUpdateProgress = async (goal, newValue) => {
    try {
      const isCompleted = newValue >= goal.target_value;
      const res = await goalService.update(goal.id, {
        current_value: newValue,
        status: isCompleted ? 'completed' : 'active',
      });
      setGoals(goals.map(g => g.id === goal.id ? { ...g, ...res.data.goal } : g));
      setShowProgressModal(null);
      if (isCompleted) toast.success('🎉 Goal completed! Amazing!');
      else toast.success('Progress updated!');
    } catch { toast.error('Failed to update progress'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return;
    try {
      await goalService.delete(id);
      setGoals(goals.filter(g => g.id !== id));
      toast.success('Goal deleted');
    } catch { toast.error('Failed to delete goal'); }
  };

  const handleAddMilestone = async (goalId) => {
    const title = milestoneInputs[goalId]?.trim();
    if (!title) return;
    try {
      const res = await goalService.addMilestone(goalId, { title });
      setGoals(goals.map(g => {
        if (g.id !== goalId) return g;
        const milestones = [...(g.goal_milestones || []), res.data.milestone];
        const total = milestones.length;
        const completed = milestones.filter(m => m.completed).length;
        return { ...g, goal_milestones: milestones, milestone_count: total, milestone_completed: completed, milestone_progress: total > 0 ? Math.round((completed / total) * 100) : null };
      }));
      setMilestoneInputs({ ...milestoneInputs, [goalId]: '' });
      toast.success('Sub-goal added!');
    } catch { toast.error('Failed to add sub-goal'); }
  };

  const handleToggleMilestone = async (goalId, milestoneId, currentCompleted) => {
    try {
      await goalService.toggleMilestone(milestoneId, !currentCompleted);
      setGoals(goals.map(g => {
        if (g.id !== goalId) return g;
        const milestones = g.goal_milestones.map(m => m.id === milestoneId ? { ...m, completed: !currentCompleted } : m);
        const total = milestones.length;
        const completed = milestones.filter(m => m.completed).length;
        return { ...g, goal_milestones: milestones, milestone_count: total, milestone_completed: completed, milestone_progress: total > 0 ? Math.round((completed / total) * 100) : null };
      }));
    } catch { toast.error('Failed to update'); }
  };

  const handleDeleteMilestone = async (goalId, milestoneId) => {
    try {
      await goalService.deleteMilestone(milestoneId);
      setGoals(goals.map(g => {
        if (g.id !== goalId) return g;
        const milestones = g.goal_milestones.filter(m => m.id !== milestoneId);
        const total = milestones.length;
        const completed = milestones.filter(m => m.completed).length;
        return { ...g, goal_milestones: milestones, milestone_count: total, milestone_completed: completed, milestone_progress: total > 0 ? Math.round((completed / total) * 100) : null };
      }));
    } catch { toast.error('Failed to delete sub-goal'); }
  };

  const handleAISuggest = async () => {
    setSuggestingAI(true);
    try {
      const [tasksRes, res] = await Promise.all([
        taskService.getAll({ status: 'pending' }),
        goalService.getAll(),
      ]);
      const aiRes = await aiService.suggestGoals({ context: 'suggest 3 new goals', current_goals: res.data.goals.map(g => g.title), tasks: tasksRes.data.tasks.map(t => t.title) });
      setAiSuggestions(aiRes.data.goals || []);
    } catch { toast.error('AI failed to suggest goals'); }
    finally { setSuggestingAI(false); }
  };

  const addSuggestedGoal = async (suggestion) => {
    try {
      const res = await goalService.create({ title: suggestion.title, description: suggestion.description || '', category: suggestion.category || 'personal', target_value: 100, unit: '%' });
      setGoals([res.data.goal, ...goals]);
      setAiSuggestions(aiSuggestions.filter(s => s.title !== suggestion.title));
      toast.success('Goal added! 🎯');
    } catch { toast.error('Failed to add goal'); }
  };

  const toggleExpand = (id) => setExpandedGoals(prev => ({ ...prev, [id]: !prev[id] }));

  const filteredGoals = activeTab === 'all' ? goals : goals.filter(g => g.status === activeTab);

  const progressPercent = (g) => {
    if (g.milestone_progress !== null && g.milestone_progress !== undefined) return g.milestone_progress;
    return Math.min(Math.round((g.current_value / g.target_value) * 100), 100);
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Goals</h1>
          <p className="text-muted-foreground text-sm">Track your milestones and achievements</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAISuggest} disabled={suggestingAI}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-violet-500/30 bg-violet-600/10 text-violet-300 hover:bg-violet-600/20 transition-all text-sm disabled:opacity-50">
            {suggestingAI ? <div className="w-4 h-4 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" /> : <Sparkles size={15} />}
            AI Suggest
          </button>
          <button onClick={() => setShowForm(true)} className="neon-button flex items-center gap-2">
            <Plus size={16} /> New Goal
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: goals.length, color: 'violet', emoji: '🎯' },
          { label: 'Active', value: goals.filter(g => g.status === 'active').length, color: 'blue', emoji: '🚀' },
          { label: 'Completed', value: goals.filter(g => g.status === 'completed').length, color: 'emerald', emoji: '✅' },
          { label: 'Avg Progress', value: goals.length ? `${Math.round(goals.reduce((s, g) => s + progressPercent(g), 0) / goals.length)}%` : '0%', color: 'amber', emoji: '📈' },
        ].map(({ label, value, color, emoji }) => (
          <div key={label} className="stat-card">
            <p className="text-2xl mb-1">{emoji}</p>
            <p className={`text-xl font-bold text-${color}-400`}>{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="glass-card p-5 border border-violet-500/20">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
            <Sparkles size={16} className="text-violet-400" /> AI Suggested Goals
          </h2>
          <div className="space-y-2">
            {aiSuggestions.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-violet-600/10 border border-violet-500/20">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{s.title}</p>
                  {s.description && <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>}
                </div>
                <button onClick={() => addSuggestedGoal(s)} className="ml-3 flex-shrink-0 p-1.5 rounded-lg bg-violet-600/20 text-violet-400 hover:bg-violet-600/40 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'active', 'completed', 'paused'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-violet-600 text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <div className="text-center py-16">
          <Target size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium mb-2">No goals yet</p>
          <button onClick={() => setShowForm(true)} className="neon-button inline-flex items-center gap-2 mt-2">
            <Plus size={16} /> Create your first goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGoals.map(goal => {
            const pct = progressPercent(goal);
            const isExpanded = expandedGoals[goal.id];
            const milestones = goal.goal_milestones || [];
            return (
              <div key={goal.id} className="glass-card p-5 hover:border-violet-500/20 transition-all">
                {/* Goal header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium capitalize ${STATUS_COLORS[goal.status] || 'text-muted-foreground'}`}>
                        {goal.status}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-xs text-muted-foreground capitalize">{goal.category}</span>
                      {goal.target_date && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar size={10} />{format(new Date(goal.target_date + 'T00:00:00'), 'dd MMM yyyy')}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground truncate">{goal.title}</h3>
                    {goal.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setShowProgressModal(goal)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-violet-400 transition-colors" title="Update progress">
                      <TrendingUp size={14} />
                    </button>
                    <button onClick={() => toggleExpand(goal.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button onClick={() => handleDelete(goal.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-rose-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 mb-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>
                      {goal.milestone_count > 0
                        ? `${goal.milestone_completed}/${goal.milestone_count} sub-goals`
                        : `${goal.current_value}/${goal.target_value} ${goal.unit}`}
                    </span>
                    <span className={pct >= 100 ? 'text-emerald-400' : 'text-violet-400'}>{pct}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-violet-600 to-indigo-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Sub-goals (milestones) */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Sub-Goals</p>

                    {/* Milestone Timeline */}
                    {milestones.length > 0 && (
                      <div className="space-y-2">
                        {milestones.map((m, idx) => (
                          <div key={m.id} className="flex items-center gap-3 group">
                            <button
                              onClick={() => handleToggleMilestone(goal.id, m.id, m.completed)}
                              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${m.completed ? 'border-emerald-500 bg-emerald-500/20' : 'border-border hover:border-violet-500'}`}
                            >
                              {m.completed && <Check size={10} className="text-emerald-400" />}
                            </button>
                            <span className={`text-sm flex-1 ${m.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {m.title}
                            </span>
                            <button onClick={() => handleDeleteMilestone(goal.id, m.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-rose-400 transition-all">
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Timeline visualization for 3+ milestones */}
                    {milestones.length >= 2 && (
                      <div className="mt-3 pt-3 border-t border-border/30">
                        <p className="text-xs text-muted-foreground mb-2">Roadmap</p>
                        <div className="flex items-center gap-1 overflow-x-auto pb-1">
                          {milestones.map((m, i) => (
                            <div key={m.id} className="flex items-center flex-shrink-0">
                              <div className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg text-center min-w-[70px] ${m.completed ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-secondary border border-border/50'}`}>
                                <span className={`text-xs ${m.completed ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                                  {m.completed ? '✅' : '○'}
                                </span>
                                <span className="text-xs font-medium leading-tight" style={{ maxWidth: '68px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {m.title}
                                </span>
                              </div>
                              {i < milestones.length - 1 && (
                                <div className={`h-0.5 w-4 flex-shrink-0 ${milestones[i + 1]?.completed ? 'bg-emerald-500/50' : 'bg-border/50'}`} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add sub-goal input */}
                    <div className="flex items-center gap-2">
                      <input
                        className="input-field text-sm py-2 flex-1"
                        placeholder="Add sub-goal..."
                        value={milestoneInputs[goal.id] || ''}
                        onChange={e => setMilestoneInputs({ ...milestoneInputs, [goal.id]: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && handleAddMilestone(goal.id)}
                      />
                      <button onClick={() => handleAddMilestone(goal.id)}
                        className="flex-shrink-0 p-2 rounded-xl bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 transition-colors">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Goal Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 glow-border animate-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-semibold text-foreground">New Goal</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Goal Title *</label>
                <input className="input-field" placeholder="What do you want to achieve?" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <textarea className="input-field resize-none" rows={2} placeholder="Why is this goal important?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                  <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Target Date</label>
                  <input type="date" className="input-field" value={form.target_date} onChange={e => setForm({ ...form, target_date: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Target Value</label>
                  <input type="number" className="input-field" min="1" value={form.target_value} onChange={e => setForm({ ...form, target_value: parseInt(e.target.value) })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Unit</label>
                  <input className="input-field" placeholder="%, books, km..." value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground text-sm hover:text-foreground transition-all">Cancel</button>
                <button type="submit" className="flex-1 neon-button py-2.5">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-sm p-6 glow-border animate-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-semibold text-foreground">Update Progress</h2>
              <button onClick={() => setShowProgressModal(null)} className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground"><X size={18} /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{showProgressModal.title}</p>
            <ProgressSlider goal={showProgressModal} onSave={handleUpdateProgress} />
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressSlider({ goal, onSave }) {
  const [value, setValue] = useState(goal.current_value || 0);
  const pct = Math.min(Math.round((value / goal.target_value) * 100), 100);
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-foreground">
        <span>{value} {goal.unit}</span>
        <span>{pct}%</span>
      </div>
      <input type="range" min="0" max={goal.target_value} value={value}
        onChange={e => setValue(parseInt(e.target.value))}
        className="w-full accent-violet-600" />
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <button onClick={() => onSave(goal, value)} className="w-full neon-button py-2.5">Save Progress</button>
    </div>
  );
}
