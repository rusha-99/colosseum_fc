import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, CHART_OF_ACCOUNTS } from '@/db/db';
import { formatLKR, getTodayISO } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Scale,
  Wallet,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  ListTodo,
  PlusCircle,
  Download
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: 'dashboard' | 'ledger' | 'workflow') => void;
  onExport: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onExport }) => {
  const today = getTodayISO();

  const ledgerEntries = useLiveQuery(() => db.ledger.orderBy('date').reverse().toArray(), []) ?? [];
  const tasks = useLiveQuery(() => db.tasks.toArray(), []) ?? [];

  // Double-entry totals
  const totalDebits = ledgerEntries
    .filter((e) => e.type === 'Debit')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalCredits = ledgerEntries
    .filter((e) => e.type === 'Credit')
    .reduce((sum, e) => sum + e.amount, 0);

  const imbalance = Math.abs(totalDebits - totalCredits);
  const isBalanced = imbalance < 0.01;

  // Liquid Cash + Bank balance (Debit increases Asset, Credit decreases Asset)
  const cashAndBankBalance = ledgerEntries
    .filter((e) => e.account === 'Cash' || e.account === 'Bank')
    .reduce((sum, e) => (e.type === 'Debit' ? sum + e.amount : sum - e.amount), 0);

  // Total Income (Credit normal) & Total Expense (Debit normal)
  const incomeAccounts = new Set(
    CHART_OF_ACCOUNTS.filter((a) => a.classification === 'Income').map((a) => a.name)
  );
  const expenseAccounts = new Set(
    CHART_OF_ACCOUNTS.filter((a) => a.classification === 'Expense').map((a) => a.name)
  );

  const totalIncome = ledgerEntries
    .filter((e) => incomeAccounts.has(e.account))
    .reduce((sum, e) => (e.type === 'Credit' ? sum + e.amount : sum - e.amount), 0);

  const totalExpenses = ledgerEntries
    .filter((e) => expenseAccounts.has(e.account))
    .reduce((sum, e) => (e.type === 'Debit' ? sum + e.amount : sum - e.amount), 0);

  const netProfit = totalIncome - totalExpenses;

  // Workflow task metrics
  const todayTasks = tasks.filter((t) => t.date === today);
  const todoCount = tasks.filter((t) => t.status === 'Todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const doneCount = tasks.filter((t) => t.status === 'Done').length;

  return (
    <div className="space-y-4 pb-6">
      {/* Trial Balance Banner */}
      <div className="rounded-xl bg-gradient-to-r from-[#171717] via-[#1c180d] to-[#171717] p-4 gold-border-glow flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-colosseum-gold/15 border border-colosseum-gold/40 flex items-center justify-center text-colosseum-gold">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
              Double-Entry Ledger Status
            </div>
            <div className="text-sm font-bold text-foreground mt-0.5">
              {ledgerEntries.length === 0
                ? 'Empty Production Ledger — Ready'
                : isBalanced
                ? 'Trial Balance Strictly Equal'
                : `Imbalance: ${formatLKR(imbalance)}`}
            </div>
          </div>
        </div>
        <Badge variant={isBalanced ? 'debit' : 'destructive'}>
          {isBalanced ? 'BALANCED' : 'CHECK DR/CR'}
        </Badge>
      </div>

      {/* Primary LKR KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="col-span-2 bg-gradient-to-br from-[#171717] to-[#121212]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-colosseum-gold-muted">
                Liquid Cash & Bank (LKR)
              </p>
              <p className="font-mono text-2xl font-extrabold text-colosseum-gold mt-1">
                {formatLKR(cashAndBankBalance)}
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Net Asset Position (Cash + Bank Accounts)
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-colosseum-gold/10 border border-colosseum-gold/30 flex items-center justify-center text-colosseum-gold">
              <Wallet className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Total Debits (Dr)
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">DR</span>
            </div>
            <p className="font-mono text-base font-bold text-emerald-400 mt-1.5 truncate">
              {formatLKR(totalDebits)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Total Credits (Cr)
              </span>
              <span className="text-[10px] font-mono text-amber-300 font-bold">CR</span>
            </div>
            <p className="font-mono text-base font-bold text-amber-300 mt-1.5 truncate">
              {formatLKR(totalCredits)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Gym Revenue
              </span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="font-mono text-base font-bold text-foreground mt-1.5 truncate">
              {formatLKR(totalIncome)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Gym Expenses
              </span>
              <TrendingDown className="h-4 w-4 text-red-400" />
            </div>
            <p className="font-mono text-base font-bold text-foreground mt-1.5 truncate">
              {formatLKR(totalExpenses)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Net Operating Profit Bar */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Net Operating Profit (LKR)
            </span>
            <p
              className={`font-mono text-xl font-extrabold mt-0.5 ${
                netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {formatLKR(netProfit)}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-3.5 w-3.5" />
            Export .XLSX
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => onNavigate('ledger')} className="w-full">
          <PlusCircle className="h-4 w-4" />
          New Ledger Entry
        </Button>
        <Button variant="outline" onClick={() => onNavigate('workflow')} className="w-full">
          <ListTodo className="h-4 w-4" />
          Daily Workflow
        </Button>
      </div>

      {/* Workflow Status Summary */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Gladiator Daily Operations</CardTitle>
            <Badge variant="outline">{todayTasks.length} Today</Badge>
          </div>
          <CardDescription>Active task pipeline across all dates</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2 pt-3">
          <div className="rounded-lg bg-[#121212] border border-neutral-800 p-2.5 text-center">
            <ListTodo className="h-4 w-4 text-neutral-400 mx-auto mb-1" />
            <div className="font-mono text-lg font-bold text-foreground">{todoCount}</div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-400">Todo</div>
          </div>
          <div className="rounded-lg bg-[#121212] border border-colosseum-gold/30 p-2.5 text-center">
            <Clock className="h-4 w-4 text-colosseum-gold mx-auto mb-1" />
            <div className="font-mono text-lg font-bold text-colosseum-gold">{inProgressCount}</div>
            <div className="text-[10px] uppercase tracking-wider text-colosseum-gold-muted">
              In Progress
            </div>
          </div>
          <div className="rounded-lg bg-[#121212] border border-emerald-500/30 p-2.5 text-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
            <div className="font-mono text-lg font-bold text-emerald-400">{doneCount}</div>
            <div className="text-[10px] uppercase tracking-wider text-emerald-400/80">Done</div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Double-Entry Postings */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Recent Ledger Postings</CardTitle>
            <CardDescription>Latest debits & credits recorded offline</CardDescription>
          </div>
          {ledgerEntries.length > 0 && (
            <button
              onClick={() => onNavigate('ledger')}
              className="text-xs font-bold uppercase text-colosseum-gold hover:underline"
            >
              View All
            </button>
          )}
        </CardHeader>
        <CardContent className="pt-3">
          {ledgerEntries.length === 0 ? (
            <div className="text-center py-6 text-neutral-500 text-xs">
              No transactions recorded yet. Tap <strong>New Ledger Entry</strong> to begin.
            </div>
          ) : (
            <div className="space-y-2.5">
              {ledgerEntries.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg bg-[#121212] border border-neutral-800/90 px-3 py-2.5"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={entry.type === 'Debit' ? 'debit' : 'credit'}>
                        {entry.type}
                      </Badge>
                      <span className="text-xs font-bold text-colosseum-gold truncate">
                        {entry.account}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 truncate mt-1">{entry.description}</p>
                    <p className="text-[10px] text-neutral-500 font-mono">{entry.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`font-mono text-sm font-bold ${
                        entry.type === 'Debit' ? 'text-emerald-400' : 'text-amber-300'
                      }`}
                    >
                      {formatLKR(entry.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
