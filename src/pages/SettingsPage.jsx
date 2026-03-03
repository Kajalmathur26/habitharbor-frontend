import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services';
import { Sun, Moon, Palette, User, Save, Camera, Phone, Trash2, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const THEMES = ['dark', 'light'];
const ACCENTS = [
  { name: 'violet', color: '#8B5CF6' },
  { name: 'indigo', color: '#6366F1' },
  { name: 'blue', color: '#3B82F6' },
  { name: 'emerald', color: '#10B981' },
  { name: 'rose', color: '#F43F5E' },
  { name: 'amber', color: '#F59E0B' },
];

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const { theme, accent, setTheme, setAccent } = useTheme();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Image must be under 2MB');
    const reader = new FileReader();
    reader.onload = (ev) => setProfile(p => ({ ...p, avatar: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await authService.updateProfile({
        name: profile.name,
        phone: profile.phone,
        avatar: profile.avatar
      });
      updateUser(res.data.user);
      toast.success('Profile updated! ✨');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return toast.error('Type DELETE to confirm');
    setDeleting(true);
    try {
      await authService.deleteAccount();
      toast.success('Account deleted');
      logout();
    } catch {
      toast.error('Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-foreground mb-5 flex items-center gap-2">
          <User size={18} className="text-violet-400" />
          Profile
        </h2>
        <div className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-border/50">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileRef.current.click()}
                className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-violet-600 border-2 border-background flex items-center justify-center hover:bg-violet-500 transition-colors"
              >
                <Camera size={13} className="text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
              <button
                onClick={() => fileRef.current.click()}
                className="text-xs text-violet-400 hover:text-violet-300 mt-1 transition-colors"
              >
                Change photo
              </button>
            </div>
          </div>

          {/* Fields */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Display Name</label>
            <input
              className="input-field"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Email</label>
            <input className="input-field opacity-60 cursor-not-allowed" value={profile.email} disabled />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Phone size={12} /> Phone Number <span className="opacity-50">(optional)</span>
            </label>
            <input
              className="input-field"
              placeholder="+1 (555) 000-0000"
              value={profile.phone}
              onChange={e => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>

          <button onClick={saveProfile} disabled={saving} className="neon-button flex items-center gap-2 disabled:opacity-50">
            {saving ? <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Appearance */}
      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-foreground mb-5 flex items-center gap-2">
          <Palette size={18} className="text-violet-400" />
          Appearance
        </h2>
        <div className="space-y-5">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block">Theme</label>
            <div className="flex gap-3">
              {THEMES.map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all capitalize text-sm
                    ${theme === t
                      ? 'border-violet-500/50 bg-violet-600/20 text-violet-300'
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80'
                    }`}
                >
                  {t === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block">Accent Color</label>
            <div className="flex gap-3 flex-wrap">
              {ACCENTS.map(a => (
                <button key={a.name} onClick={() => setAccent(a.name)} className="flex flex-col items-center gap-1.5 transition-all">
                  <div
                    className={`w-8 h-8 rounded-xl transition-all hover:scale-110 ${accent === a.name ? 'ring-2 ring-white scale-110' : ''}`}
                    style={{ background: a.color, boxShadow: accent === a.name ? `0 0 12px ${a.color}80` : 'none' }}
                  />
                  <span className="text-xs text-muted-foreground capitalize">{a.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-foreground mb-2">About Planora</h2>
        <p className="text-sm text-muted-foreground">
          Planora is your intelligent digital planner and journal. Built with React, Node.js, Supabase, and powered by Google Gemini AI.
        </p>
        <div className="flex gap-2 mt-4 flex-wrap">
          {['React', 'Node.js', 'Supabase', 'Gemini AI', 'Tailwind CSS'].map(tech => (
            <span key={tech} className="text-xs px-2 py-1 rounded-lg bg-secondary text-muted-foreground border border-border">{tech}</span>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-6 border border-red-500/20">
        <h2 className="font-display font-semibold text-red-400 mb-2 flex items-center gap-2">
          <AlertTriangle size={18} />
          Danger Zone
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Deleting your account will permanently remove all your data including tasks, journals, habits, moods, goals, and settings. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all text-sm"
        >
          <Trash2 size={15} />
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 border border-red-500/30 animate-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-red-400 flex items-center gap-2">
                <AlertTriangle size={18} /> Delete Account
              </h2>
              <button onClick={() => setShowDeleteModal(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently delete your Planora account and all associated data. To confirm, type <strong className="text-foreground">DELETE</strong> below.
            </p>
            <input
              className="input-field mb-4 border-red-500/30 focus:border-red-500"
              placeholder="Type DELETE to confirm"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground text-sm hover:text-foreground transition-all">
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirm !== 'DELETE'}
                className="flex-1 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium transition-all disabled:opacity-40"
              >
                {deleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
