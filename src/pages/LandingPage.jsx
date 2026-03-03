import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
    CheckSquare, BookOpen, Calendar, Target, Flame, Heart,
    Sparkles, ArrowRight, Sun, Moon, TrendingUp, Shield, Zap, Star
} from 'lucide-react';

const features = [
    { icon: CheckSquare, title: 'Smart Tasks', desc: 'Organize tasks by priority with Kanban-style boards', color: 'violet' },
    { icon: BookOpen, title: 'Rich Journal', desc: 'Write, add images, stickers & custom fonts', color: 'rose' },
    { icon: Calendar, title: 'Calendar', desc: 'Schedule events with map-based location tagging', color: 'indigo' },
    { icon: Target, title: 'Goal Tracking', desc: 'Set goals with milestones & auto progress tracking', color: 'amber' },
    { icon: Flame, title: 'Habit Streaks', desc: 'Build habits with streak tracking & history heatmap', color: 'orange' },
    { icon: Heart, title: 'Mood Analytics', desc: '7 & 30-day mood trend charts with emotion tagging', color: 'pink' },
    { icon: TrendingUp, title: 'Finance Manager', desc: 'Track income & expenses with monthly charts', color: 'emerald' },
    { icon: Sparkles, title: 'AI Insights', desc: 'Gemini-powered productivity analysis & journal prompts', color: 'blue' },
];

const stats = [
    { value: '10+', label: 'Productivity Features' },
    { value: '100%', label: 'Privacy Focused' },
    { value: 'AI', label: 'Powered Insights' },
    { value: '∞', label: 'Possibilities' },
];

export default function LandingPage() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                            <span className="text-white text-sm font-bold">P</span>
                        </div>
                        <span className="font-bold text-lg text-foreground">Planora</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
                        <Link to="/login" className="neon-button text-sm px-4 py-2">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative pt-32 pb-24 px-6">
                {/* Background blobs */}
                <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center relative">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-600/10 text-violet-300 text-sm mb-8">
                        <Sparkles size={14} />
                        AI-Powered Digital Planner
                    </div>

                    <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6">
                        Your life,{' '}
                        <span className="gradient-text">organized.</span>
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                        Planora combines journaling, task management, habit tracking, mood analytics, and AI insights — all in one beautiful workspace.
                    </p>

                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Link
                            to="/login"
                            className="neon-button flex items-center gap-2 px-8 py-4 text-base font-semibold"
                        >
                            Get Started Free <ArrowRight size={18} />
                        </Link>
                        <Link to="/login" className="flex items-center gap-2 px-8 py-4 text-base text-muted-foreground hover:text-foreground transition-colors border border-border/50 rounded-2xl hover:border-border">
                            Sign in <ArrowRight size={16} />
                        </Link>
                    </div>

                    {/* Trust line */}
                    <p className="text-xs text-muted-foreground mt-8 flex items-center justify-center gap-2">
                        <Shield size={12} />
                        No credit card required · Your data stays private
                    </p>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 px-6 border-y border-border/30">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map(({ value, label }) => (
                        <div key={label} className="text-center">
                            <p className="text-3xl md:text-4xl font-bold gradient-text mb-1">{value}</p>
                            <p className="text-sm text-muted-foreground">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Everything you need to thrive
                        </h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Planora is a complete productivity ecosystem designed around your personal growth.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {features.map(({ icon: Icon, title, desc, color }) => (
                            <div
                                key={title}
                                className="glass-card p-5 group hover:scale-[1.02] transition-all duration-300 cursor-default"
                            >
                                <div className={`inline-flex p-2.5 rounded-xl bg-${color}-500/15 mb-4 group-hover:bg-${color}-500/25 transition-colors`}>
                                    <Icon size={20} className={`text-${color}-400`} />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="glass-card p-12 glow-border">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(139,92,246,0.4)] animate-[float_3s_ease-in-out_infinite]">
                            <Zap size={28} className="text-white" />
                        </div>
                        <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                            Start your journey today
                        </h2>
                        <p className="text-muted-foreground mb-8">
                            Join thousands of people using Planora to build better habits, achieve goals, and live more intentionally.
                        </p>
                        <Link to="/login" className="neon-button inline-flex items-center gap-2 px-8 py-4 text-base font-semibold">
                            Get Started — It's Free <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border/30 py-8 px-6">
                <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">P</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Planora © 2026</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Star size={12} className="text-amber-400" />
                        Built with React, Node.js &amp; Gemini AI
                    </div>
                </div>
            </footer>
        </div>
    );
}
