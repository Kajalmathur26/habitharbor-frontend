import { useState, useEffect } from 'react';
import { habitService } from '../services';
import { Plus, X, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, startOfWeek, addDays } from 'date-fns';

const FREQUENCIES = ['daily', 'weekly'];
const HABIT_EMOJIS = ['🧘', '💪', '📚', '🏃', '💧', '🎯', '✍️', '🎨', '🍎', '😴'];

const getDayLabels = () => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => format(addDays(start, i), 'EEE'));
};

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', frequency: 'daily', icon: '🎯' });

  useEffect(() => { loadHabits(); }, []);

  const loadHabits = async () => {
    try {
      const res = await habitService.getAll();
      setHabits(res.data.habits || []);
    } catch { toast.error('Failed to load habits'); }
    finally { setLoading(false); }
  };

  const createHabit = async () => {
    if (!form.name.trim()) return toast.error('Name required');
    try {
      const res = await habitService.create(form);
      setHabits([res.data.habit, ...habits]);
      setForm({ name: '', description: '', frequency: 'daily', icon: '🎯' });
      setShowForm(false);
      toast.success('Habit created!');
    } catch { toast.error('Failed to create habit'); }
  };

  const logHabit = async (habit) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await habitService.log(habit.id, { log_date: today, completed: true });
      await loadHabits();
      toast.success('Habit logged! 🔥');
    } catch { toast.error('Failed to log habit'); }
  };

  const isLoggedToday = (habit) => {
    if (!habit.last_logged_at) return false;
    const today = new Date().toISOString().split('T')[0];
    const lastLog = habit.last_logged_at.split('T')[0];
    return lastLog === today;
  };

  const dayLabels = getDayLabels();
  const todayCompleted = habits.filter(h => h.is_active && isLoggedToday(h)).length;
  const activeHabits = habits.filter(h => h.is_active !== false);
  const progressPct = activeHabits.length ? Math.round((todayCompleted / activeHabits.length) * 100) : 0;

  return (
    <div className="space-y-5 page-transition">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Habits</h1>
          <p className="text-sm text-muted-foreground">{todayCompleted}/{activeHabits.length} completed today</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
          <Plus size={16} /> New Habit
        </button>
      </div>

      {/* Today's Progress */}
      <div className="hh-card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">Today's Progress</span>
          <span className="text-sm font-bold text-teal-600">{progressPct}%</span>
        </div>
        <div className="w-full h-3 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="hh-card p-5 border-2 border-teal-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">New Habit</h2>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground"><X size={18} /></button>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap mb-1">
              {HABIT_EMOJIS.map(e => (
                <button key={e} onClick={() => setForm({ ...form, icon: e })}
                  className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-colors ${form.icon === e ? 'bg-teal-100 ring-2 ring-teal-500' : 'bg-muted hover:bg-muted/80'}`}>
                  {e}
                </button>
              ))}
            </div>
            <input className="hh-input" placeholder="Habit name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input className="hh-input" placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <select className="hh-input" value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}>
              {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={createHabit} className="btn-primary text-sm">Create Habit</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Habits Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
        </div>
      ) : activeHabits.length === 0 ? (
        <div className="hh-card p-12 text-center">
          <p className="text-muted-foreground">No habits yet. Create one above!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {activeHabits.map(habit => {
            const logged = isLoggedToday(habit);
            return (
              <div key={habit.id} className="hh-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{habit.icon || '🎯'}</span>
                    <div>
                      <p className={`font-semibold text-foreground ${logged ? 'line-through text-muted-foreground' : ''}`}>{habit.name}</p>
                      <div className="flex items-center gap-1 text-xs text-orange-500 font-medium mt-0.5">
                        <Flame size={12} />
                        <span>{habit.current_streak || 0} day streak</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => !logged && logHabit(habit)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      logged ? 'bg-teal-500 text-white' : 'bg-muted border border-border hover:border-teal-400 text-muted-foreground'
                    }`}
                  >
                    {logged ? '✓' : ''}
                  </button>
                </div>
                {/* Week dots */}
                <div className="flex gap-1 mt-2">
                  {dayLabels.map((day, i) => (
                    <div key={i} className="flex-1 text-center">
                      <p className="text-xs text-muted-foreground mb-1">{day}</p>
                      <div className={`w-full aspect-square max-w-[28px] mx-auto rounded-full ${i < 6 || logged ? 'bg-teal-500' : 'bg-border'}`} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
