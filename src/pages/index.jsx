import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
  CheckSquare, Target, Smile, BookOpen, RefreshCw,
  Calendar, DollarSign, BarChart2, Sparkles, ArrowRight,
  Shield, Zap, Heart
} from 'lucide-react';

const FEATURES = [
  { icon: CheckSquare, label: 'Tasks', desc: 'Kanban board with priorities', color: 'from-violet-500 to-purple-600', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { icon: Target, label: 'Goals', desc: 'Track with milestones', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { icon: Smile, label: 'Mood', desc: '30-day trend insights', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  { icon: BookOpen, label: 'Journal', desc: 'AI-powered prompts', color: 'from-pink-500 to-rose-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  { icon: RefreshCw, label: 'Habits', desc: 'Streak tracking', color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  { icon: Calendar, label: 'Calendar', desc: 'Smart scheduling', color: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { icon: DollarSign, label: 'Finance', desc: 'Income & expense tracker', color: 'from-teal-500 to-green-500', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
  { icon: BarChart2, label: 'Dashboard', desc: 'Unified analytics', color: 'from-red-500 to-pink-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
];

const TESTIMONIALS = [
  { name: 'Priya S.', text: 'Planora changed how I manage my entire life. Everything in one place!', role: 'Student' },
  { name: 'Rahul M.', text: 'The AI assistant is incredible. It actually helps me stay on track.', role: 'Software Engineer' },
  { name: 'Ananya K.', text: 'Finance tracking + habit tracker combo is exactly what I needed.', role: 'Freelancer' },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const Index = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-[#070711] text-white font-sans overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 sm:px-10 py-4 bg-white/[0.03] backdrop-blur-xl border-b border-white/[0.06]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2.5"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-900/40">
            <span className="text-white font-black text-lg leading-none">P</span>
          </div>
          <span className="text-lg font-bold tracking-tight">Planora</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/login" // ✅ Changed from /register
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:brightness-110 transition-all shadow-lg shadow-purple-900/30"
          >
            Get Started
          </Link>
        </motion.div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 text-sm font-medium"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered digital planner
          </motion.div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-6">
            Plan your life,
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              own your day.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Planora unifies tasks, goals, habits, journal, mood, calendar, and finance into one intelligent workspace — powered by Gemini AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20">
            <Link
              to="/login" // ✅ Changed from /register
              className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition-all shadow-2xl shadow-purple-900/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started — Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-base font-medium rounded-2xl bg-white/[0.06] hover:bg-white/[0.09] border border-white/[0.09] transition-all"
            >
              Sign In
            </Link>
          </div>

          {/* Feature grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.label}
                variants={item}
                className={`group flex flex-col items-center gap-2 p-4 rounded-2xl ${f.bg} border ${f.border} hover:scale-[1.03] transition-all cursor-default`}
              >
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${f.color}`}>
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-white/90">{f.label}</span>
                <span className="text-xs text-white/40 text-center leading-tight hidden sm:block">{f.desc}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="py-8 border-y border-white/[0.05] bg-white/[0.01]">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8 sm:gap-16 text-center">
          {[
            { stat: '8+', label: 'Integrated modules' },
            { stat: 'AI', label: 'Gemini-powered insights' },
            { stat: '∞', label: 'Goals & habits' },
          ].map(({ stat, label }) => (
            <div key={label}>
              <div className="text-3xl font-black text-white mb-1">{stat}</div>
              <div className="text-sm text-white/40">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINANCE HIGHLIGHT ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/25 text-teal-400 text-xs font-semibold mb-6 uppercase tracking-wider">
              <DollarSign className="h-3 w-3" /> New Feature
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">
              Smart Finance<br />
              <span className="text-teal-400">Tracking</span>
            </h2>
            <p className="text-white/50 leading-relaxed mb-6">
              Track every rupee in and out. Filter by day, week, or month. Visualize spending trends and maintain a healthy net balance — all with dark/light mode support.
            </p>
            <ul className="space-y-2.5 text-sm">
              {[
                'One-click expense & income logging',
                'Category-wise spending breakdown',
                'Monthly expenditure charts',
                'Real-time net balance calculation',
              ].map(t => (
                <li key={t} className="flex items-center gap-2.5 text-white/60">
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-400" />
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Mock Finance UI card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-6 rounded-3xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm"
          >
            <div className="flex justify-between items-start mb-5">
              <div>
                <p className="text-xs text-white/40 mb-1">Net Balance — March 2026</p>
                <p className="text-3xl font-black text-teal-400">₹12,450</p>
              </div>
              <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20">
                <DollarSign className="h-5 w-5 text-teal-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3.5 rounded-2xl bg-green-500/10 border border-green-500/15">
                <p className="text-xs text-white/40 mb-1.5">Income</p>
                <p className="text-xl font-bold text-green-400">₹25,000</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/15">
                <p className="text-xs text-white/40 mb-1.5">Expenses</p>
                <p className="text-xl font-bold text-red-400">₹12,550</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Groceries', amount: '₹2,100', pct: 42, color: 'bg-orange-400' },
                { label: 'Transport', amount: '₹850', pct: 17, color: 'bg-blue-400' },
                { label: 'Entertainment', amount: '₹1,200', pct: 24, color: 'bg-pink-400' },
              ].map(e => (
                <div key={e.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">{e.label}</span>
                    <span className="text-white/80 font-medium">{e.amount}</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                    <div className={`h-full ${e.color} rounded-full`} style={{ width: `${e.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHY PLANORA ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-black mb-3">Why Planora?</h2>
            <p className="text-white/40">Everything you need, nothing you don't.</p>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: Zap, title: 'All in one place', desc: 'No more juggling 5 different apps. Planora is your single source of truth.', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
              { icon: Sparkles, title: 'AI-powered', desc: 'Gemini AI gives you journal prompts, goal suggestions, and productivity analysis.', color: 'text-violet-400', bg: 'bg-violet-400/10' },
              { icon: Shield, title: 'Your data, secure', desc: 'Built on Supabase with row-level security. Your entries are private by default.', color: 'text-teal-400', bg: 'bg-teal-400/10' },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all"
              >
                <div className={`w-11 h-11 rounded-2xl ${card.bg} flex items-center justify-center mb-4`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-center mb-10 text-white/80">Loved by planners</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.07]"
              >
                <div className="flex mb-3">
                  {Array(5).fill(0).map((_, j) => (
                    <span key={j} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-sm text-white/60 mb-4 leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-white/35">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center p-10 rounded-3xl bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/20"
        >
          <Heart className="h-10 w-10 text-pink-400 mx-auto mb-5" />
          <h2 className="text-4xl font-black mb-4">
            Start your planning<br />
            <span className="text-violet-400">journey today</span>
          </h2>
          <p className="text-white/50 mb-8">Free forever. No credit card required.</p>
          <Link
            to="/login" // ✅ Changed from /register
            className="inline-flex items-center gap-2 px-10 py-4 text-base font-semibold rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:brightness-110 transition-all shadow-2xl shadow-purple-900/50 hover:scale-[1.02]"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/[0.05] text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
            <span className="text-white font-black text-xs">P</span>
          </div>
          <span className="font-bold text-white/70 text-sm">Planora</span>
        </div>
        <p className="text-white/25 text-xs">© {new Date().getFullYear()} Planora. Built with ♥</p>
      </footer>
    </div>
  );
};

export default Index;