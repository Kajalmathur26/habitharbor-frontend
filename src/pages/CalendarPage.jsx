import { useState, useEffect, useCallback } from 'react';
import { eventService } from '../services';
import { Plus, X, MapPin, ChevronLeft, ChevronRight, Search, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, isSameMonth } from 'date-fns';
import toast from 'react-hot-toast';

const EVENT_COLORS = ['#8B5CF6', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#F97316'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const [form, setForm] = useState({
    title: '', description: '', start_time: '', end_time: '', color: '#8B5CF6',
    location: '', city: ''
  });

  useEffect(() => { loadEvents(); }, [currentDate]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      const res = await eventService.getAll({ start_date: start, end_date: end });
      setEvents(res.data.events);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  const searchLocation = useCallback((query) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!query.trim() || query.length < 3) { setLocationResults([]); return; }
    const t = setTimeout(async () => {
      setLocationLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`, {
          headers: { 'Accept-Language': 'en' }
        });
        const data = await res.json();
        setLocationResults(data);
      } catch { toast.error('Location search unavailable'); }
      finally { setLocationLoading(false); }
    }, 600);
    setSearchTimeout(t);
  }, [searchTimeout]);

  const selectLocation = (result) => {
    const city = result.address?.city || result.address?.town || result.address?.village || result.address?.county || '';
    const country = result.address?.country_code?.toUpperCase() || '';
    const display = result.display_name.split(',').slice(0, 2).join(',').trim();
    setForm(f => ({ ...f, location: display, city: city || result.display_name.split(',')[0].trim() }));
    setLocationSearch(display);
    setLocationResults([]);
    setShowLocationPicker(false);
    toast.success(`📍 Location set: ${city || display}${country ? ', ' + country : ''}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title required');
    if (!form.start_time) return toast.error('Start time required');
    try {
      await eventService.create(form);
      toast.success('Event created! 📅');
      resetForm();
      loadEvents();
    } catch { toast.error('Failed to create event'); }
  };

  const deleteEvent = async (id) => {
    if (!confirm('Delete event?')) return;
    try {
      await eventService.delete(id);
      setEvents(events.filter(e => e.id !== id));
      toast.success('Event deleted');
    } catch { toast.error('Failed to delete event'); }
  };

  const resetForm = () => {
    setShowForm(false);
    setForm({ title: '', description: '', start_time: '', end_time: '', color: '#8B5CF6', location: '', city: '' });
    setLocationSearch(''); setLocationResults([]);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);
  const dayEvents = (day) => events.filter(e => {
    const d = new Date(e.start_time);
    return isSameDay(d, day);
  });
  const selectedEvents = dayEvents(selectedDay);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground text-sm">{format(currentDate, 'MMMM yyyy')} · {events.length} events</p>
        </div>
        <button onClick={() => setShowForm(true)} className="neon-button flex items-center gap-2"><Plus size={16} /> Add Event</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 glass-card p-5">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => setCurrentDate(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })}
              className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground"><ChevronLeft size={18} /></button>
            <h2 className="font-display text-lg font-semibold text-foreground">{format(currentDate, 'MMMM yyyy')}</h2>
            <button onClick={() => setCurrentDate(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })}
              className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground"><ChevronRight size={18} /></button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array(startPad).fill(null).map((_, i) => <div key={`pad-${i}`} />)}
            {calDays.map(day => {
              const evs = dayEvents(day);
              const selected = isSameDay(day, selectedDay);
              const today = isToday(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={`aspect-square flex flex-col items-center justify-between p-1 rounded-xl transition-all relative text-sm
                    ${selected ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                      : today ? 'border border-violet-500/40 text-violet-300 bg-violet-600/10'
                        : 'hover:bg-white/5 text-foreground'}`}
                >
                  <span className={`text-xs font-medium ${!selected && !today && !isSameMonth(day, currentDate) ? 'opacity-30' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {evs.length > 0 && (
                    <div className="flex gap-0.5 justify-center">
                      {evs.slice(0, 3).map((ev, i) => (
                        <span key={i} className="w-1 h-1 rounded-full" style={{ background: ev.color || '#8B5CF6' }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Today button */}
          <div className="mt-4 flex justify-center">
            <button onClick={() => { setCurrentDate(new Date()); setSelectedDay(new Date()); }} className="text-xs text-muted-foreground hover:text-violet-400 transition-colors">
              Today
            </button>
          </div>
        </div>

        {/* Selected Day Panel */}
        <div className="glass-card p-5">
          <h2 className="font-display font-semibold text-foreground mb-4">
            {format(selectedDay, 'EEEE, MMMM d')}
            {isToday(selectedDay) && <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300">Today</span>}
          </h2>
          {selectedEvents.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No events</p>
              <button
                onClick={() => { setShowForm(true); const dt = format(selectedDay, "yyyy-MM-dd'T'HH:mm"); setForm(f => ({ ...f, start_time: dt })); }}
                className="neon-button mt-4 inline-flex items-center gap-2 text-sm"
              >
                <Plus size={14} /> Add event
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map(ev => (
                <div key={ev.id} className="p-3 rounded-xl bg-secondary/60 border border-border/30 group">
                  <div className="flex items-start gap-2">
                    <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: ev.color || '#8B5CF6' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{ev.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(ev.start_time), 'h:mm a')}
                        {ev.end_time && ` – ${format(new Date(ev.end_time), 'h:mm a')}`}
                      </p>
                      {(ev.location || ev.city) && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin size={10} />
                          {ev.city && <span className="font-medium text-violet-300">{ev.city} · </span>}
                          {ev.location}
                        </p>
                      )}
                    </div>
                    <button onClick={() => deleteEvent(ev.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-rose-400 transition-all">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 glow-border animate-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-semibold text-foreground">New Event</h2>
              <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className="input-field" placeholder="Event title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <textarea className="input-field resize-none h-16 text-sm" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Start *</label>
                  <input type="datetime-local" className="input-field" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">End</label>
                  <input type="datetime-local" className="input-field" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
                </div>
              </div>

              {/* Location picker */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <MapPin size={11} /> Location (search map)
                </label>
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        className="input-field pr-8"
                        placeholder="Search location..."
                        value={locationSearch}
                        onChange={e => { setLocationSearch(e.target.value); searchLocation(e.target.value); setShowLocationPicker(true); }}
                        onFocus={() => setShowLocationPicker(true)}
                      />
                      {locationLoading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />}
                    </div>
                    <button type="button" onClick={() => { setLocationSearch(''); setForm(f => ({ ...f, location: '', city: '' })); }} className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground">
                      <X size={14} />
                    </button>
                  </div>

                  {showLocationPicker && locationResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 glass-card border border-border/60 z-20 rounded-xl overflow-hidden">
                      {locationResults.map((result) => {
                        const city = result.address?.city || result.address?.town || result.address?.village || '';
                        const displayName = result.display_name.split(',').slice(0, 3).join(',');
                        return (
                          <button
                            type="button"
                            key={result.place_id}
                            onClick={() => selectLocation(result)}
                            className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors border-b border-border/20 last:border-0"
                          >
                            <div className="flex items-center gap-2">
                              <MapPin size={12} className="text-violet-400 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-foreground">{city || result.display_name.split(',')[0]}</p>
                                <p className="text-xs text-muted-foreground truncate">{displayName}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {form.city && (
                  <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-violet-600/10 border border-violet-500/20">
                    <MapPin size={12} className="text-violet-400" />
                    <span className="text-xs text-violet-300">📍 Auto-tagged: {form.city}</span>
                  </div>
                )}
              </div>

              {/* Color picker */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Color</label>
                <div className="flex gap-2">
                  {EVENT_COLORS.map(c => (
                    <button type="button" key={c} onClick={() => setForm({ ...form, color: c })}
                      className={`w-7 h-7 rounded-xl transition-all hover:scale-105 ${form.color === c ? 'ring-2 ring-white scale-110' : ''}`}
                      style={{ background: c, boxShadow: form.color === c ? `0 0 10px ${c}80` : 'none' }} />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground text-sm transition-all">Cancel</button>
                <button type="submit" className="flex-1 neon-button py-2.5">Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
