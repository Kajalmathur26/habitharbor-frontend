import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, CheckSquare, BookOpen, Calendar, Target, Repeat,
  Smile, Sparkles, Settings, LogOut, Menu, X, Moon, Sun, Anchor
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
  { to: '/mood', icon: Smile, label: 'Mood' },
  { to: '/habits', icon: Repeat, label: 'Habits' },
  { to: '/goals', icon: Target, label: 'Goals' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0">
          <Anchor size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-base text-white leading-none">HabitHarbor</h1>
          <p className="text-xs text-white/50 mt-0.5">Daily Growth</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileSidebarOpen(false)}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-3 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-semibold transition-all'
                : 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/8 text-sm font-medium transition-all'
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 border-t border-white/10 pt-3 space-y-0.5">
        <NavLink
          to="/settings"
          onClick={() => setMobileSidebarOpen(false)}
          className={({ isActive }) =>
            isActive
              ? 'flex items-center gap-3 px-3 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-semibold transition-all'
              : 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/8 text-sm font-medium transition-all'
          }
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-red-300 hover:bg-red-500/10 transition-all w-full text-sm font-medium"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-3 mt-1 rounded-xl bg-white/5 border border-white/10">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="avatar" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/50 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col flex-shrink-0 w-64 border-r border-white/5" style={{ backgroundColor: 'hsl(215,35%,14%)' }}>
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative w-64 flex flex-col z-10 border-r border-white/5" style={{ backgroundColor: 'hsl(215,35%,14%)' }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-border flex-shrink-0 bg-card">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="avatar" className="w-8 h-8 rounded-lg object-cover cursor-pointer" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center cursor-pointer">
                <span className="text-white text-xs font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="page-transition max-w-7xl mx-auto p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
