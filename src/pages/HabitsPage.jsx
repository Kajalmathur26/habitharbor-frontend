import { useState, useEffect } from 'react';
import { habitService } from '../services';
import { Plus, Flame, Trash2, X, RotateCcw, History } from 'lucide-react';
import { format, eachDayOfInterval, subDays } from 'date-fns';
import toast from 'react-hot-toast';

const ICONS = ['⭐', '💪', '🏃', '📚', '💧', '🧘', '🍎', '💤', '🎯', '🎨', '🎵', '💊'];
const COLORS = ['#8B5CF6', '#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6'];

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [historyHabit, setHistoryHabit] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '⭐', color: '#8B5CF6', frequency: 'daily', target_count: 1 });
  const today = new Date().toISOString().split('T')[0];
  const last7Days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
  const last30Days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });

  useEffect(() => { loadHabits(); }, []);

  const loadHabits = async () => {
    try {
      const res = await habitService.getAll();
      setHabits(res.data.habits);
    } catch { toast.error('Failed to load habits'); }
    finally { setLoading(false); }
  };

  const createHabit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Name required');
    try {
      const res = await habitService.create(form);
      setHabits([...habits, res.data.habit]);
      toast.success('Habit created! 🔥');
      setShowForm(false);
      setForm({ name: '', description: '', icon: '⭐', color: '#8B5CF6', frequency: 'daily', target_count: 1 });
    } catch { toast.error('Failed to create habit'); }
  };

  const logHabit = async (habit) => {
    const alreadyDone = habit.habit_logs?.some(l => l.log_date === today && l.completed);
    if (alreadyDone) return;
    try {
      await habitService.log(habit.id, {});
      await loadHabits();
      toast.success(`${habit.icon} ${habit.name} logged!`);
    } catch { toast.error('Failed to log'); }
  };

  const unlogHabit = async (habit) => {
    try {
      await habitService.unlog(habit.id);
      await loadHabits();
      toast.success(`↩️ ${habit.name} unmarked`);
    } catch { toast.error('Failed to unlog'); }
  };

  const deleteHabit = async (id) => {
    if (!confirm('Delete habit?')) return;
    try {
      await habitService.delete(id);
      setHabits(habits.filter(h => h.id !== id));
      toast.success('Habit deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const isLoggedOn = (habit, date) => {
    const d = format(date, 'yyyy-MM-dd');
    return habit.habit_logs?.some(l => l.log_date === d && l.completed);
  };

  const completedToday = habits.filter(h => h.habit_logs?.some(l => l.log_date === today && l.completed)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Habits</h1>
          <p className="text-muted-foreground text-sm">{completedToday}/{habits.length} done today</p>
        </div>
        <button onClick={() => setShowForm(true)} className="neon-button flex items-center gap-2">
          <Plus size={16} /> New Habit
        </button>
      </div>

      {/* Today's Progress Bar */}
      {habits.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">Today's Progress</span>
            <span className="text-sm text-violet-400 font-semibold">
              {habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0}%
            </span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
              style={{ width: `${habits.length > 0 ? (completedToday / habits.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" /></div>
      ) : habits.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Flame size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">No habits yet</p>
          <button onClick={() => setShowForm(true)} className="neon-button mt-4 inline-flex items-center gap-2"><Plus size={16} /> Create Habit</button>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map(habit => {
            const doneToday = habit.habit_logs?.some(l => l.log_date === today && l.completed);
            return (
              <div key={habit.id} className={`glass-card p-4 group transition-all ${doneToday ? 'opacity-80' : ''}`}>
                <div className="flex items-center gap-4">
                  {/* Complete / Undo button */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => doneToday ? unlogHabit(habit) : logHabit(habit)}
                      className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95"
                      style={{ background: doneToday ? habit.color + '40' : habit.color + '20', border: `2px solid ${habit.color}${doneToday ? '80' : '40'}` }}
                      title={doneToday ? 'Click to undo' : 'Mark as done'}
                    >
                      {doneToday ? '✅' : habit.icon}
                    </button>
                    {doneToday && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <RotateCcw size={9} /> undo
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold text-foreground ${doneToday ? 'line-through opacity-60' : ''}`}>{habit.name}</h3>
                      {doneToday && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Done!</span>}
                    </div>
                    {habit.description && <p className="text-xs text-muted-foreground truncate">{habit.description}</p>}

                    {/* 7-day grid */}
                    <div className="flex gap-1 mt-2">
                      {last7Days.map(day => (
                        <div
                          key={day.toISOString()}
                          className="w-5 h-5 rounded-md flex items-center justify-center"
                          style={{
                            background: isLoggedOn(habit, day) ? habit.color + '60' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${isLoggedOn(habit, day) ? habit.color + '80' : 'rgba(255,255,255,0.1)'}`
                          }}
                          title={format(day, 'EEE, MMM d')}
                        >
                          {isLoggedOn(habit, day) && <div className="w-2 h-2 rounded-full" style={{ background: habit.color }} />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="text-center flex-shrink-0">
                    <p className="text-xl font-bold" style={{ color: habit.color }}>🔥 {habit.current_streak}</p>
                    <p className="text-xs text-muted-foreground">streak</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                    <button
                      onClick={() => setHistoryHabit(habit)}
                      className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground"
                      title="View history"
                    >
                      <History size={14} />
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-rose-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History Modal */}
      {historyHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 glow-border animate-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                {historyHabit.icon} {historyHabit.name} — 30 Day History
              </h2>
              <button onClick={() => setHistoryHabit(null)} className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground"><X size={18} /></button>
            </div>
            <div className="mb-4">
              <div className="flex items-center gap-4 text-sm mb-4">
                <span className="text-muted-foreground">🔥 Current streak: <strong className="text-foreground">{historyHabit.current_streak}</strong></span>
                <span className="text-muted-foreground">Best: <strong className="text-foreground">{historyHabit.longest_streak}</strong></span>
              </div>
              <div className="grid grid-cols-10 gap-1">
                {last30Days.map(day => {
                  const logged = isLoggedOn(historyHabit, day);
                  return (
                    <div
                      key={day.toISOString()}
                      className="aspect-square rounded-md"
                      style={{
                        background: logged ? historyHabit.color + '80' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${logged ? historyHabit.color + '60' : 'rgba(255,255,255,0.08)'}`
                      }}
                      title={`${format(day, 'MMM d')} — ${logged ? '✅ Done' : 'Not done'}`}
                    />
                  );
                })}
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-sm" style={{ background: historyHabit.color + '80' }} />
                <span>Completed</span>
                <div className="w-3 h-3 rounded-sm bg-white/5 ml-2" />
                <span>Missed</span>
              </div>
            </div>
            <button onClick={() => setHistoryHabit(null)} className="w-full py-2.5 rounded-xl border border-border text-muted-foreground text-sm hover:text-foreground transition-all">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 glow-border animate-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-semibold text-foreground">New Habit</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground"><X size={18} /></button>
            </div>
            <form onSubmit={createHabit} className="space-y-4">
              <input className="input-field" placeholder="Habit name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="input-field text-sm" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Choose Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(icon => (
                    <button type="button" key={icon} onClick={() => setForm({ ...form, icon })}
                      className={`text-2xl p-1.5 rounded-lg transition-all ${form.icon === icon ? 'bg-violet-600/30 ring-1 ring-violet-500' : 'hover:bg-white/5'}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Color</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button type="button" key={c} onClick={() => setForm({ ...form, color: c })}
                      className={`w-7 h-7 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground text-sm">Cancel</button>
                <button type="submit" className="flex-1 neon-button py-2.5">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
