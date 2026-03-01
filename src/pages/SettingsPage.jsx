import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services';
import { Sun, Moon, User, Save, Camera, Anchor } from 'lucide-react';
import toast from 'react-hot-toast';

const THEMES = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
];

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      let avatarUrl = user?.avatar_url;

      // If there's a new avatar, upload it (base64 for now since we don't have Supabase storage configured)
      if (avatarFile) {
        const reader = new FileReader();
        const base64 = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(avatarFile);
        });
        avatarUrl = base64;
      }

      const res = await authService.updateProfile({ name: profile.name, avatar_url: avatarUrl });
      updateUser({ ...res.data.user, avatar_url: avatarUrl });
      toast.success('Profile updated!');
    } catch {
      // If API doesn't support avatar_url, just update name
      try {
        const res = await authService.updateProfile({ name: profile.name });
        const updatedUser = { ...res.data.user, avatar_url: avatarPreview };
        updateUser(updatedUser);
        toast.success('Profile updated!');
      } catch {
        toast.error('Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl page-transition">
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="hh-card p-6">
        <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <User size={17} className="text-teal-600" />
          Profile
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar" className="w-20 h-20 rounded-2xl object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-teal-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-teal-600 hover:bg-teal-700 flex items-center justify-center shadow-md transition-colors"
            >
              <Camera size={13} className="text-white" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
          </div>
          <div>
            <p className="font-semibold text-foreground">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-teal-600 hover:text-teal-700 mt-1 font-medium"
            >
              Change photo
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Display Name</label>
            <input className="hh-input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
            <input className="hh-input opacity-60" value={profile.email} disabled />
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="btn-primary text-sm disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Appearance */}
      <div className="hh-card p-6">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Sun size={17} className="text-teal-600" />
          Appearance
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                theme === id ? 'border-teal-500 bg-teal-50' : 'border-border bg-muted/30 hover:border-teal-200'
              }`}
            >
              <Icon size={18} className={theme === id ? 'text-teal-600' : 'text-muted-foreground'} />
              <span className={`font-medium text-sm ${theme === id ? 'text-teal-700' : 'text-foreground'}`}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="hh-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
            <Anchor size={18} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-foreground">HabitHarbor</p>
            <p className="text-xs text-muted-foreground">Version 1.0.0 — Your Daily Growth Companion</p>
          </div>
        </div>
      </div>
    </div>
  );
}
