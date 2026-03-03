import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { financeService } from '@/services';
import toast from 'react-hot-toast';
import {
  PlusCircle, Trash2, TrendingUp, TrendingDown,
  DollarSign, Filter, BarChart2, RefreshCw, Edit2, X, Check
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Utilities', 'Education', 'Rent', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investment', 'Rental', 'Gift', 'Other'];
const CHART_COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#6366f1'];

const todayStr = () => new Date().toISOString().split('T')[0];
const currentMonth = () => new Date().toISOString().slice(0, 7);

const EMPTY_FORM = { type: 'expense', description: '', amount: '', category: 'Food', entry_date: todayStr(), notes: '' };

// ─── Inline Edit Row ────────────────────────────────────────────────────────
const EntryRow = ({ entry, onDelete, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ description: entry.description, amount: entry.amount, category: entry.category });

  const save = async () => {
    await onUpdate(entry.id, { ...form, amount: parseFloat(form.amount) });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
        <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          className="flex-1 px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-sm focus:outline-none text-white" />
        <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
          className="w-24 px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-sm focus:outline-none text-white" />
        <button onClick={save} className="p-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"><Check className="h-4 w-4" /></button>
        <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 transition-colors"><X className="h-4 w-4" /></button>
      </div>
    );
  }

  return (
    <div className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-lg ${entry.type === 'income' ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
          {entry.type === 'income'
            ? <TrendingUp className="h-3.5 w-3.5 text-green-400" />
            : <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
        </div>
        <div>
          <p className="text-sm font-medium text-white/90">{entry.description}</p>
          <p className="text-xs text-white/35">{entry.category} · {entry.entry_date}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${entry.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
          {entry.type === 'income' ? '+' : '-'}₹{parseFloat(entry.amount).toLocaleString()}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)} className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors">
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onDelete(entry.id)} className="p-1 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
const FinancePage = () => {
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0, byCategory: {} });
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterMonth, setFilterMonth] = useState(currentMonth());
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [entriesRes, summaryRes, trendRes] = await Promise.all([
        financeAPI.getEntries({ month: filterMonth }),
        financeAPI.getSummary(filterMonth),
        financeAPI.getMonthlyTrend(),
      ]);
      setEntries(entriesRes.data.data || []);
      setSummary(summaryRes.data.data || {});
      setMonthlyTrend(trendRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load finance data');
    } finally {
      setLoading(false);
    }
  }, [filterMonth]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async () => {
    if (!form.description.trim() || !form.amount || parseFloat(form.amount) <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      setSubmitting(true);
      const res = await financeAPI.createEntry({ ...form, amount: parseFloat(form.amount) });
      setEntries(prev => [res.data.data, ...prev]);
      setForm({ ...EMPTY_FORM, type: form.type }); // preserve type
      await loadData(); // refresh summary
      toast.success(`${form.type === 'income' ? 'Income' : 'Expense'} added!`);
    } catch (err) {
      toast.error('Failed to save entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await financeAPI.deleteEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      await loadData();
      toast.success('Entry deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      const res = await financeAPI.updateEntry(id, updates);
      setEntries(prev => prev.map(e => e.id === id ? res.data.data : e));
      await loadData();
      toast.success('Updated');
    } catch {
      toast.error('Failed to update');
    }
  };

  const categoryData = useMemo(() =>
    Object.entries(summary.byCategory || {}).map(([name, value]) => ({ name, value })),
    [summary]
  );

  const filteredExpenses = entries.filter(e => e.type === 'expense');
  const filteredIncomes = entries.filter(e => e.type === 'income');

  // ── Shared styles ──
  const card = "rounded-2xl p-5 bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 shadow-sm";
  const input = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
              <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20">
                <DollarSign className="h-6 w-6 text-teal-500" />
              </div>
              Finance
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track your income, expenses & monthly trends</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <input
              type="month"
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-gray-900 dark:text-white"
            />
            <button onClick={loadData} className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <RefreshCw className={`h-4 w-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Income', value: summary.totalIncome, color: 'text-green-600 dark:text-green-400', border: 'border-l-green-500', icon: TrendingUp, iconColor: 'text-green-400' },
            { label: 'Total Spent', value: summary.totalExpense, color: 'text-red-600 dark:text-red-400', border: 'border-l-red-500', icon: TrendingDown, iconColor: 'text-red-400' },
            { label: 'Net Balance', value: summary.netBalance, color: summary.netBalance >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-orange-600 dark:text-orange-400', border: summary.netBalance >= 0 ? 'border-l-teal-500' : 'border-l-orange-500', icon: DollarSign, iconColor: summary.netBalance >= 0 ? 'text-teal-400' : 'text-orange-400' },
          ].map(s => (
            <div key={s.label} className={`${card} border-l-4 ${s.border}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
                  <p className={`text-2xl font-black ${s.color}`}>
                    {loading ? '—' : `₹${Math.abs(parseFloat(s.value || 0)).toLocaleString('en-IN')}`}
                  </p>
                </div>
                <s.icon className={`h-8 w-8 ${s.iconColor} opacity-40`} />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl w-fit">
          {['overview', 'add entry', 'expenses', 'income'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="grid sm:grid-cols-2 gap-6">
            <div className={card}>
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <BarChart2 className="h-4 w-4 text-violet-500" /> 6-Month Trend
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyTrend} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `₹${v >= 1000 ? `${v/1000}k` : v}`} />
                  <Tooltip
                    formatter={v => `₹${parseFloat(v).toLocaleString('en-IN')}`}
                    contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4,4,0,0]} />
                  <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={card}>
              <h3 className="font-bold text-sm mb-4 text-gray-700 dark:text-gray-200">
                Expense Breakdown — {filterMonth}
              </h3>
              {categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No expenses this month</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={35} paddingAngle={2}>
                      {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => `₹${parseFloat(v).toLocaleString('en-IN')}`} contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Recent transactions */}
            <div className={`${card} sm:col-span-2`}>
              <h3 className="font-bold text-sm mb-4 text-gray-700 dark:text-gray-200">Recent Transactions</h3>
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {[...entries]
                  .sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date))
                  .slice(0, 20)
                  .map(e => <EntryRow key={e.id} entry={e} onDelete={handleDelete} onUpdate={handleUpdate} />)
                }
                {entries.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-8">No transactions this month</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── ADD ENTRY TAB ── */}
        {activeTab === 'add entry' && (
          <div className="max-w-lg">
            <div className={card}>
              <h3 className="font-bold mb-5 text-gray-800 dark:text-white">New Entry</h3>
              
              {/* Type toggle */}
              <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl mb-5">
                {['expense', 'income'].map(t => (
                  <button
                    key={t}
                    onClick={() => setForm(p => ({ ...p, type: t, category: t === 'income' ? 'Salary' : 'Food' }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                      form.type === t
                        ? t === 'expense' ? 'bg-red-500 text-white shadow' : 'bg-green-500 text-white shadow'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {t === 'expense' ? '💸 Expense' : '💰 Income'}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder={form.type === 'expense' ? 'What did you spend on?' : 'Income source / description'}
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className={input}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                    <input
                      type="number"
                      placeholder="Amount"
                      min="0"
                      step="0.01"
                      value={form.amount}
                      onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                      className={`${input} pl-7`}
                    />
                  </div>
                  <input
                    type="date"
                    value={form.entry_date}
                    onChange={e => setForm(p => ({ ...p, entry_date: e.target.value }))}
                    className={input}
                  />
                </div>
                <select
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className={input}
                >
                  {(form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <textarea
                  placeholder="Notes (optional)"
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  className={input}
                />
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    form.type === 'expense'
                      ? 'bg-red-500 hover:bg-red-600 disabled:bg-red-500/50'
                      : 'bg-green-500 hover:bg-green-600 disabled:bg-green-500/50'
                  } text-white`}
                >
                  {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                  {submitting ? 'Saving...' : `Add ${form.type === 'expense' ? 'Expense' : 'Income'}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── EXPENSES TAB ── */}
        {activeTab === 'expenses' && (
          <div className={card}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-gray-700 dark:text-gray-200">
                Expenses — {filterMonth}
              </h3>
              <span className="text-sm font-black text-red-500">
                -₹{parseFloat(summary.totalExpense || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="space-y-1 max-h-[60vh] overflow-y-auto">
              {filteredExpenses.length === 0
                ? <p className="text-center text-gray-400 text-sm py-10">No expenses this month</p>
                : filteredExpenses
                    .sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date))
                    .map(e => <EntryRow key={e.id} entry={e} onDelete={handleDelete} onUpdate={handleUpdate} />)
              }
            </div>
          </div>
        )}

        {/* ── INCOME TAB ── */}
        {activeTab === 'income' && (
          <div className={card}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-gray-700 dark:text-gray-200">
                Income — {filterMonth}
              </h3>
              <span className="text-sm font-black text-green-500">
                +₹{parseFloat(summary.totalIncome || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="space-y-1 max-h-[60vh] overflow-y-auto">
              {filteredIncomes.length === 0
                ? <p className="text-center text-gray-400 text-sm py-10">No income logged this month</p>
                : filteredIncomes
                    .sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date))
                    .map(e => <EntryRow key={e.id} entry={e} onDelete={handleDelete} onUpdate={handleUpdate} />)
              }
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FinancePage;