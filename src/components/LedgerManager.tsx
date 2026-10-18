import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  db,
  CHART_OF_ACCOUNTS,
  type AccountCategory,
  type EntryType
} from '@/db/db';
import { formatLKR, getTodayISO } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Plus,
  Trash2,
  Search,
  Scale,
  ArrowLeftRight
} from 'lucide-react';

export const LedgerManager: React.FC = () => {
  // Entry Mode: 'single' (explicit Debit or Credit line) or 'paired' (simultaneous Dr & Cr pair)
  const [entryMode, setEntryMode] = useState<'single' | 'paired'>('single');
  const [date, setDate] = useState<string>(getTodayISO());
  const [description, setDescription] = useState<string>('');
  const [account, setAccount] = useState<AccountCategory>('Cash');
  const [type, setType] = useState<EntryType>('Debit');
  const [creditAccount, setCreditAccount] = useState<AccountCategory>('Income - Membership Dues');
  const [amount, setAmount] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter & Sub-view state
  const [activeSubTab, setActiveSubTab] = useState<'entries' | 'trial-balance'>('entries');
  const [filterType, setFilterType] = useState<'ALL' | EntryType>('ALL');
  const [filterAccount, setFilterAccount] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const ledgerEntries =
    useLiveQuery(() => db.ledger.orderBy('date').reverse().toArray(), []) ?? [];

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsedAmount = parseFloat(amount);
    if (!date) {
      setErrorMsg('Please select a valid transaction date.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please enter a transaction description.');
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Amount must be greater than Rs. 0.00.');
      return;
    }

    const now = Date.now();

    if (entryMode === 'single') {
      await db.ledger.add({
        date,
        description: description.trim(),
        account,
        type,
        amount: parsedAmount,
        createdAt: now
      });
    } else {
      if (account === creditAccount) {
        setErrorMsg('Debit and Credit accounts must be different.');
        return;
      }
      const pairId = `JRN-${now.toString(36).toUpperCase()}`;
      await db.ledger.bulkAdd([
        {
          date,
          description: description.trim(),
          account,
          type: 'Debit',
          amount: parsedAmount,
          journalGroupId: pairId,
          createdAt: now
        },
        {
          date,
          description: description.trim(),
          account: creditAccount,
          type: 'Credit',
          amount: parsedAmount,
          journalGroupId: pairId,
          createdAt: now + 1
        }
      ]);
    }

    setDescription('');
    setAmount('');
  };

  const handleDeleteEntry = async (id?: number) => {
    if (!id) return;
    await db.ledger.delete(id);
  };

  // Filtered entries
  const filteredEntries = ledgerEntries.filter((item) => {
    if (filterType !== 'ALL' && item.type !== filterType) return false;
    if (filterAccount !== 'ALL' && item.account !== filterAccount) return false;
    if (
      searchTerm.trim() &&
      !item.description.toLowerCase().includes(searchTerm.trim().toLowerCase()) &&
      !item.account.toLowerCase().includes(searchTerm.trim().toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const totalDebits = ledgerEntries
    .filter((e) => e.type === 'Debit')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalCredits = ledgerEntries
    .filter((e) => e.type === 'Credit')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4 pb-6">
      {/* Ledger Entry Form Card */}
      <Card className="gold-border-glow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-colosseum-gold" />
              Record Double-Entry Transaction
            </CardTitle>
            <button
              type="button"
              onClick={() => setEntryMode(entryMode === 'single' ? 'paired' : 'single')}
              className="inline-flex items-center gap-1 rounded-md border border-colosseum-gold/40 bg-colosseum-gold/10 px-2.5 py-1 text-[11px] font-bold uppercase text-colosseum-gold hover:bg-colosseum-gold/20"
            >
              <ArrowLeftRight className="h-3 w-3" />
              {entryMode === 'single' ? 'Single Line' : 'Paired Dr/Cr'}
            </button>
          </div>
          <CardDescription>
            {entryMode === 'single'
              ? 'Record an individual Debit or Credit ledger line in Sri Lankan Rupees (LKR).'
              : 'Auto-pair mode: simultaneously posts matching Debit and Credit lines in LKR.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleAddEntry} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tx-date">Date *</Label>
                <Input
                  id="tx-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tx-amount">Amount (LKR / Rs.) *</Label>
                <Input
                  id="tx-amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="font-mono font-bold text-colosseum-gold"
                  required
                />
              </div>
            </div>

            {entryMode === 'single' ? (
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="tx-account">Account *</Label>
                  <select
                    id="tx-account"
                    value={account}
                    onChange={(e) => setAccount(e.target.value as AccountCategory)}
                    className="flex h-11 w-full rounded-lg border border-colosseum-gold/30 bg-[#0a0a0a] px-3 py-2 text-sm text-[#f5f5f5] focus:outline-none focus:border-colosseum-gold"
                  >
                    {CHART_OF_ACCOUNTS.map((acct) => (
                      <option key={acct.name} value={acct.name}>
                        {acct.name} ({acct.classification} • {acct.normalBalance})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label>Entry Type (Debit / Credit) *</Label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setType('Debit')}
                      className={`h-11 rounded-lg border font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all ${
                        type === 'Debit'
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm'
                          : 'border-neutral-800 bg-[#0a0a0a] text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      DEBIT (DR)
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('Credit')}
                      className={`h-11 rounded-lg border font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all ${
                        type === 'Credit'
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-sm'
                          : 'border-neutral-800 bg-[#0a0a0a] text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      CREDIT (CR)
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="dr-account" className="text-emerald-400">
                    Debit Account (Dr) *
                  </Label>
                  <select
                    id="dr-account"
                    value={account}
                    onChange={(e) => setAccount(e.target.value as AccountCategory)}
                    className="flex h-11 w-full rounded-lg border border-emerald-500/40 bg-[#0a0a0a] px-3 py-2 text-sm text-[#f5f5f5] focus:outline-none focus:border-emerald-400"
                  >
                    {CHART_OF_ACCOUNTS.map((acct) => (
                      <option key={acct.name} value={acct.name}>
                        [DR] {acct.name} ({acct.classification})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cr-account" className="text-amber-300">
                    Credit Account (Cr) *
                  </Label>
                  <select
                    id="cr-account"
                    value={creditAccount}
                    onChange={(e) => setCreditAccount(e.target.value as AccountCategory)}
                    className="flex h-11 w-full rounded-lg border border-amber-500/40 bg-[#0a0a0a] px-3 py-2 text-sm text-[#f5f5f5] focus:outline-none focus:border-amber-400"
                  >
                    {CHART_OF_ACCOUNTS.map((acct) => (
                      <option key={acct.name} value={acct.name}>
                        [CR] {acct.name} ({acct.classification})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="tx-desc">Description / Narration *</Label>
              <Input
                id="tx-desc"
                type="text"
                placeholder="e.g., Monthly Membership Renewal - Kasun P."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {errorMsg && (
              <div className="rounded-lg border border-red-500/50 bg-red-950/50 px-3 py-2 text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4" />
              {entryMode === 'single'
                ? `Post ${type} Entry (LKR)`
                : 'Post Balanced Dr & Cr Pair (LKR)'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* View Switcher: General Ledger vs Trial Balance */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#121212] p-1 border border-colosseum-gold/20">
        <button
          type="button"
          onClick={() => setActiveSubTab('entries')}
          className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeSubTab === 'entries'
              ? 'bg-colosseum-gold text-[#0a0a0a]'
              : 'text-neutral-400 hover:text-colosseum-gold'
          }`}
        >
          Ledger Entries ({ledgerEntries.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('trial-balance')}
          className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeSubTab === 'trial-balance'
              ? 'bg-colosseum-gold text-[#0a0a0a]'
              : 'text-neutral-400 hover:text-colosseum-gold'
          }`}
        >
          Trial Balance & Accounts
        </button>
      </div>

      {activeSubTab === 'entries' ? (
        <Card>
          <CardHeader className="pb-3 space-y-3">
            <div className="flex items-center justify-between">
              <CardTitle>General Ledger Journal</CardTitle>
              <Badge variant="outline">{filteredEntries.length} Shown</Badge>
            </div>

            {/* Search & Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="h-4 w-4 text-neutral-500 absolute left-3 top-3.5" />
                <Input
                  type="text"
                  placeholder="Search narration or account..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'ALL' | EntryType)}
                  className="h-9 rounded-lg border border-colosseum-gold/25 bg-[#0a0a0a] px-2.5 text-xs text-neutral-200"
                >
                  <option value="ALL">All Types (Dr & Cr)</option>
                  <option value="Debit">Debits Only (Dr)</option>
                  <option value="Credit">Credits Only (Cr)</option>
                </select>

                <select
                  value={filterAccount}
                  onChange={(e) => setFilterAccount(e.target.value)}
                  className="h-9 rounded-lg border border-colosseum-gold/25 bg-[#0a0a0a] px-2.5 text-xs text-neutral-200"
                >
                  <option value="ALL">All Accounts</option>
                  {CHART_OF_ACCOUNTS.map((acct) => (
                    <option key={acct.name} value={acct.name}>
                      {acct.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-xs text-neutral-500">
                No matching ledger records found.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg bg-[#121212] border border-neutral-800 hover:border-colosseum-gold/30 p-3 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={entry.type === 'Debit' ? 'debit' : 'credit'}>
                            {entry.type}
                          </Badge>
                          <span className="text-xs font-bold text-colosseum-gold">
                            {entry.account}
                          </span>
                          {entry.journalGroupId && (
                            <span className="text-[10px] font-mono text-neutral-500">
                              #{entry.journalGroupId}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground font-medium mt-1.5 break-words">
                          {entry.description}
                        </p>
                        <p className="text-[11px] font-mono text-neutral-500 mt-1">
                          Date: {entry.date}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span
                          className={`font-mono text-sm font-extrabold ${
                            entry.type === 'Debit' ? 'text-emerald-400' : 'text-amber-300'
                          }`}
                        >
                          {formatLKR(entry.amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry.id)}
                          aria-label="Delete entry"
                          className="p-1.5 rounded-md text-neutral-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-colosseum-gold" />
                Trial Balance (LKR)
              </CardTitle>
              <Badge
                variant={Math.abs(totalDebits - totalCredits) < 0.01 ? 'debit' : 'destructive'}
              >
                {Math.abs(totalDebits - totalCredits) < 0.01 ? 'BALANCED' : 'UNBALANCED'}
              </Badge>
            </div>
            <CardDescription>
              Total Dr: {formatLKR(totalDebits)} • Total Cr: {formatLKR(totalCredits)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {CHART_OF_ACCOUNTS.map((acct) => {
              const acctEntries = ledgerEntries.filter((e) => e.account === acct.name);
              const dr = acctEntries
                .filter((e) => e.type === 'Debit')
                .reduce((s, e) => s + e.amount, 0);
              const cr = acctEntries
                .filter((e) => e.type === 'Credit')
                .reduce((s, e) => s + e.amount, 0);
              const net = acct.normalBalance === 'Debit' ? dr - cr : cr - dr;

              if (dr === 0 && cr === 0) return null;

              return (
                <div
                  key={acct.name}
                  className="rounded-lg bg-[#121212] border border-neutral-800 p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-colosseum-gold">{acct.name}</div>
                    <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                      Dr: {formatLKR(dr)} | Cr: {formatLKR(cr)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-extrabold text-foreground">
                      {formatLKR(net)}
                    </div>
                    <div className="text-[10px] uppercase text-neutral-500">
                      {acct.normalBalance} Normal
                    </div>
                  </div>
                </div>
              );
            })}

            {ledgerEntries.length === 0 && (
              <div className="text-center py-6 text-xs text-neutral-500">
                No account balances yet. Post a transaction to populate the Trial Balance.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
