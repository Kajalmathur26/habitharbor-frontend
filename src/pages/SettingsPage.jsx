import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { authService } from '@/services';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Phone, Lock, Palette, Trash2, Upload,
  Sun, Moon, Save, LogOut, AlertTriangle, Camera, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ACCENT_COLORS = [
  { name: 'Violet', value: 'violet' },
  { name: 'Blue', value: 'blue' },
  { name: 'Green', value: 'green' },
  { name: 'Rose', value: 'rose' },
  { name: 'Amber', value: 'amber' },
  { name: 'Teal', value: 'teal' },
];

const ACCENT_HEX = {
  violet: '#8b5cf6', blue: '#3b82f6', green: '#10b981',
  rose: '#f43f5e', amber: '#f59e0b', teal: '#14b8a6',
};

const Section = ({ title, icon: Icon, children }) => (
  <div className="rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50">
      <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-900/20">
        <Icon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
      </div>
      <h2 className="font-bold text-gray-800 dark:text-white">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const Input = ({ label, type = 'text', value, onChange, placeholder, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
    />
  </div>
);

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme, accent, setAccent } = useTheme();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar_url: user?.avatar_url || '',
  });

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Avatar selection
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max file size is 5MB'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      let avatar_url = profile.avatar_url;

      // Upload avatar if changed
      if (avatarFile) {
        const res = await authService.uploadAvatar(avatarFile);
        avatar_url = res.data.data.avatar_url;
      }

      const res = await authService.updateProfile({ name: profile.name, phone: profile.phone, avatar_url });
      updateUser?.(res.data.data);
      toast.success('Profile saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') { toast.error('Type DELETE to confirm'); return; }
    try {
      await authService.deleteAccount();
      logout();
      navigate('/');
      toast.success('Account deleted');
    } catch (err) {
      toast.error('Failed to delete account');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your account and preferences</p>
        </div>

        {/* ── Profile Section ── */}
        <Section title="Profile" icon={User}>
          {/* Avatar */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative flex-shrink-0">
              <div className="h-20 w-20 rounded-2xl overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center border-2 border-violet-200 dark:border-violet-700">
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" />
                  : <span className="text-white font-black text-2xl">{profile.name?.[0]?.toUpperCase() || 'U'}</span>
                }
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white shadow-lg transition-colors"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white">{profile.name || 'Your Name'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
              <button
                onClick={() => fileRef.current?.click()}
                className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-500 mt-1 flex items-center gap-1"
              >
                <Upload className="h-3 w-3" /> Upload photo
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              placeholder="Your full name"
              required
            />
            <Input label="Email" value={profile.email} placeholder={profile.email} />
            <Input
              label="Phone (optional)"
              type="tel"
              value={profile.phone}
              onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
              placeholder="+91 98765 43210"
            />
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="mt-5 w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </Section>

        {/* ── Appearance Section ── */}
        <Section title="Appearance" icon={Palette}>
          {/* Dark/Light Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Theme</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Switch between light and dark mode</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative h-8 w-16 rounded-full transition-colors duration-300 ${
                theme === 'dark' ? 'bg-violet-600' : 'bg-gray-200'
              }`}
            >
              <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center ${
                theme === 'dark' ? 'left-9' : 'left-1'
              }`}>
                {theme === 'dark'
                  ? <Moon className="h-3.5 w-3.5 text-violet-600" />
                  : <Sun className="h-3.5 w-3.5 text-amber-500" />
                }
              </span>
            </button>
          </div>

          {/* Accent Colors */}
          <div>
            <p className="font-medium text-gray-800 dark:text-white mb-3">Accent Color</p>
            <div className="flex gap-3 flex-wrap">
              {ACCENT_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setAccent?.(c.value)}
                  className={`h-9 w-9 rounded-xl border-2 transition-all hover:scale-110 ${
                    accent === c.value ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: ACCENT_HEX[c.value] }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </Section>

        {/* ── Security Section ── */}
        <Section title="Security" icon={Lock}>
          <div className="space-y-4">
            <Input label="Current Password" type="password" value={passwords.current}
              onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} placeholder="••••••••" />
            <Input label="New Password" type="password" value={passwords.next}
              onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))} placeholder="••••••••" />
            <Input label="Confirm New Password" type="password" value={passwords.confirm}
              onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} placeholder="••••••••" />
          </div>
          <button className="mt-5 w-full py-2.5 rounded-xl bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
            <Lock className="h-4 w-4" /> Update Password
          </button>
        </Section>

        {/* ── Danger Zone ── */}
        <Section title="Danger Zone" icon={AlertTriangle}>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={logout}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="h-4 w-4" /> Delete Account
            </button>
          </div>
        </Section>

      </div>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Delete Account</h3>
                </div>
                <button onClick={() => setShowDeleteModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This will permanently delete all your tasks, goals, habits, journals, and account data.
                Type <strong className="text-red-500">DELETE</strong> to confirm.
              </p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="Type DELETE"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== 'DELETE'}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
                >
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}