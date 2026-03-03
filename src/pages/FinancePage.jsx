import { useState, useEffect } from 'react';
import { financeService } from '../services';
import {
    Plus, Trash2, TrendingUp, TrendingDown, DollarSign,
    X, Filter, Calendar, BarChart2, List
} from 'lucide-react';
import { format } from 'date-fns';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from 'recharts';
import toast from 'react-hot-toast';

const EXPENSE_CATEGORIES = ['food', 'transport', 'entertainment', 'health', 'shopping', 'utilities', 'other'];
const INCOME_CATEGORIES = ['salary', 'freelance', 'investment', 'gift', 'other'];
const PERIODS = [
    { value: '', label: 'All Time' },
    { value: 'daily', label: 'Today' },
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
];

export default function FinancePage() {
    const [tab, setTab] = useState('expense'); // expense | income
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('monthly');
    const [showForm, setShowForm] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // list | chart
    const [form, setForm] = useState({
        item: '', amount: '', type: 'expense', category: 'other',
        date: new Date().toISOString().split('T')[0], notes: ''
    });

    useEffect(() => { loadData(); }, [tab, period]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [txRes, sumRes] = await Promise.all([
                financeService.getAll({ type: tab, period }),
                financeService.getSummary()
            ]);
            setTransactions(txRes.data.transactions);
            setSummary(sumRes.data);
        } catch {
            toast.error('Failed to load finance data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.item || !form.amount) return toast.error('Item and amount required');
        if (isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) return toast.error('Enter a valid amount');
        try {
            const data = { ...form, type: tab };
            await financeService.create(data);
            toast.success(tab === 'income' ? '💰 Income added!' : '💸 Expense recorded!');
            setShowForm(false);
            setForm({ item: '', amount: '', type: 'expense', category: 'other', date: new Date().toISOString().split('T')[0], notes: '' });
            loadData();
        } catch {
            toast.error('Failed to save');
        }
    };

    const deleteTransaction = async (id) => {
        if (!confirm('Delete this entry?')) return;
        try {
            await financeService.delete(id);
            setTransactions(transactions.filter(t => t.id !== id));
            toast.success('Deleted');
            loadData();
        } catch {
            toast.error('Failed to delete');
        }
    };

    const totalShown = transactions.reduce((s, t) => s + t.amount, 0);

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="glass-card p-3 text-xs border border-border/50">
                <p className="font-semibold text-foreground mb-2">{label}</p>
                {payload.map(p => (
                    <p key={p.name} style={{ color: p.color }}>
                        {p.name}: ₹{p.value?.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-foreground">Finance Manager</h1>
                    <p className="text-muted-foreground text-sm">Track your money in & out</p>
                </div>
                <button onClick={() => setShowForm(true)} className="neon-button flex items-center gap-2">
                    <Plus size={16} /> Add Entry
                </button>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="stat-card">
                        <div className="inline-flex p-2 rounded-lg bg-emerald-500/15 mb-3">
                            <TrendingUp size={18} className="text-emerald-400" />
                        </div>
                        <p className="text-2xl font-bold text-emerald-400">₹{summary.totalIncome.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Total Income</p>
                    </div>
                    <div className="stat-card">
                        <div className="inline-flex p-2 rounded-lg bg-rose-500/15 mb-3">
                            <TrendingDown size={18} className="text-rose-400" />
                        </div>
                        <p className="text-2xl font-bold text-rose-400">₹{summary.totalExpense.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Total Expenses</p>
                    </div>
                    <div className="stat-card">
                        <div className={`inline-flex p-2 rounded-lg mb-3 ${summary.netBalance >= 0 ? 'bg-violet-500/15' : 'bg-amber-500/15'}`}>
                            <DollarSign size={18} className={summary.netBalance >= 0 ? 'text-violet-400' : 'text-amber-400'} />
                        </div>
                        <p className={`text-2xl font-bold ${summary.netBalance >= 0 ? 'text-violet-400' : 'text-amber-400'}`}>
                            ₹{summary.netBalance.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">Net Balance</p>
                    </div>
                </div>
            )}

            {/* Tabs + Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex rounded-xl border border-border overflow-hidden">
                    {[
                        { key: 'expense', label: '💸 Expenses' },
                        { key: 'income', label: '💰 Income' }
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`px-5 py-2.5 text-sm font-medium transition-all ${tab === key
                                    ? 'bg-violet-600 text-white'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <select
                        className="input-field py-2 text-sm"
                        value={period}
                        onChange={e => setPeriod(e.target.value)}
                    >
                        {PERIODS.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                    <div className="flex rounded-xl border border-border overflow-hidden">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 transition-all ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-muted-foreground hover:bg-white/5'}`}
                        >
                            <List size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('chart')}
                            className={`p-2.5 transition-all ${viewMode === 'chart' ? 'bg-violet-600 text-white' : 'text-muted-foreground hover:bg-white/5'}`}
                        >
                            <BarChart2 size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Monthly Chart */}
            {viewMode === 'chart' && summary?.monthlyBreakdown?.length > 0 && (
                <div className="glass-card p-5">
                    <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                        <BarChart2 size={18} className="text-violet-400" />
                        Monthly Breakdown
                    </h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={summary.monthlyBreakdown} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#888' }} width={50} tickFormatter={v => `₹${v}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" name="Expense" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Transactions List */}
            <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                        {tab === 'income' ? <TrendingUp size={18} className="text-emerald-400" /> : <TrendingDown size={18} className="text-rose-400" />}
                        {tab === 'income' ? 'Income' : 'Expenses'}
                    </h2>
                    <span className={`text-sm font-bold ${tab === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ₹{totalShown.toLocaleString()}
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-7 h-7 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="py-12 text-center">
                        <DollarSign size={36} className="text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No {tab} entries yet</p>
                        <button onClick={() => setShowForm(true)} className="neon-button mt-4 inline-flex items-center gap-2 text-sm">
                            <Plus size={14} /> Add {tab}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {transactions.map(tx => (
                            <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-all group">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-500/15' : 'bg-rose-500/15'
                                    }`}>
                                    {tx.type === 'income' ? <TrendingUp size={16} className="text-emerald-400" /> : <TrendingDown size={16} className="text-rose-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{tx.item}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground capitalize">{tx.category}</span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar size={10} />
                                            {format(new Date(tx.date + 'T00:00:00'), 'MMM d, yyyy')}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => deleteTransaction(tx.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-rose-400 transition-all flex-shrink-0"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-md p-6 glow-border animate-in">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-display text-lg font-semibold text-foreground">
                                {tab === 'income' ? '💰 Add Income' : '💸 Add Expense'}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">{tab === 'income' ? 'Source / Description' : 'Item / Description'} *</label>
                                <input
                                    className="input-field"
                                    placeholder={tab === 'income' ? 'e.g. Monthly Salary' : 'e.g. Grocery Shopping'}
                                    value={form.item}
                                    onChange={e => setForm({ ...form, item: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Amount (₹) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="input-field"
                                        placeholder="0.00"
                                        value={form.amount}
                                        onChange={e => setForm({ ...form, amount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Date</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        value={form.date}
                                        onChange={e => setForm({ ...form, date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                                <select
                                    className="input-field"
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                >
                                    {(tab === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Notes (optional)</label>
                                <input
                                    className="input-field"
                                    placeholder="Any notes..."
                                    value={form.notes}
                                    onChange={e => setForm({ ...form, notes: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground text-sm hover:text-foreground transition-all">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 neon-button py-2.5">
                                    Add {tab === 'income' ? 'Income' : 'Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
