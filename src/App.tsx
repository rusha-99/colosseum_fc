import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { Dashboard } from '@/components/Dashboard';
import { LedgerManager } from '@/components/LedgerManager';
import { WorkflowTracker } from '@/components/WorkflowTracker';
import { exportColosseumWorkbook } from '@/utils/exportExcel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  BookOpen,
  ListTodo,
  FileSpreadsheet,
  ShieldCheck,
  Download,
  CheckCircle2
} from 'lucide-react';

type ActiveTab = 'dashboard' | 'ledger' | 'workflow' | 'export';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [exportBanner, setExportBanner] = useState<string | null>(null);

  const ledgerCount = useLiveQuery(() => db.ledger.count(), []) ?? 0;
  const taskCount = useLiveQuery(() => db.tasks.count(), []) ?? 0;

  const handleExportExcel = async () => {
    const result = await exportColosseumWorkbook();
    setExportBanner(
      `Exported ${result.fileName} (${result.ledgerCount} ledger lines, ${result.taskCount} tasks)`
    );
    setTimeout(() => setExportBanner(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex flex-col">
      {/* Top Gladiator Header */}
      <header className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-colosseum-gold/30 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#8a6f20] flex items-center justify-center text-[#0a0a0a] font-display font-black text-sm shadow-gold-sm">
              CFC
            </div>
            <div>
              <h1 className="font-display text-base font-black tracking-wider uppercase gold-gradient-text leading-none">
                Colosseum Fight Club
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <ShieldCheck className="h-3 w-3 text-colosseum-gold" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Offline Vault • LKR (Rs.)
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="h-8 px-2.5 text-[11px]"
          >
            <Download className="h-3.5 w-3.5" />
            .XLSX
          </Button>
        </div>
      </header>

      {/* Toast Notification for Export */}
      {exportBanner && (
        <div className="max-w-md mx-auto w-full px-4 pt-3">
          <div className="rounded-lg border border-colosseum-gold bg-[#171717] px-3 py-2 text-xs text-colosseum-gold flex items-center gap-2 shadow-gold-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{exportBanner}</span>
          </div>
        </div>
      )}

      {/* Main Mobile Viewport */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4 pb-24">
        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onExport={handleExportExcel}
          />
        )}

        {activeTab === 'ledger' && <LedgerManager />}

        {activeTab === 'workflow' && <WorkflowTracker />}

        {activeTab === 'export' && (
          <div className="space-y-4">
            <Card className="gold-border-glow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-colosseum-gold" />
                    Excel Backup & Audit Export
                  </CardTitle>
                  <Badge>LKR ONLY</Badge>
                </div>
                <CardDescription>
                  Generate a multi-sheet .xlsx workbook containing your Double-Entry Ledger,
                  Trial Balance, and Daily Workflow History.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-[#121212] border border-neutral-800 p-3">
                    <div className="text-[11px] uppercase text-neutral-400 font-bold">
                      Ledger Postings
                    </div>
                    <div className="font-mono text-2xl font-extrabold text-colosseum-gold mt-1">
                      {ledgerCount}
                    </div>
                  </div>
                  <div className="rounded-lg bg-[#121212] border border-neutral-800 p-3">
                    <div className="text-[11px] uppercase text-neutral-400 font-bold">
                      Workflow Tasks
                    </div>
                    <div className="font-mono text-2xl font-extrabold text-colosseum-gold mt-1">
                      {taskCount}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-[#121212] border border-colosseum-gold/20 p-3 text-xs text-neutral-300 space-y-1">
                  <p className="font-bold text-colosseum-gold uppercase tracking-wider">
                    Included Worksheets:
                  </p>
                  <p>1. Double_Entry_Ledger (Chronological Debits & Credits in LKR)</p>
                  <p>2. Trial_Balance_LKR (Account-by-Account Closing Balances)</p>
                  <p>3. Workflow_Tasks (Complete Daily Task Log)</p>
                </div>

                <Button onClick={handleExportExcel} className="w-full" size="lg">
                  <Download className="h-4 w-4" />
                  Download Full .XLSX Report
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-colosseum-gold/30">
        <div className="max-w-md mx-auto grid grid-cols-4 h-16">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'dashboard'
                ? 'text-colosseum-gold'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'ledger'
                ? 'text-colosseum-gold'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Ledger</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('workflow')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'workflow'
                ? 'text-colosseum-gold'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <ListTodo className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Workflow</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'export'
                ? 'text-colosseum-gold'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <FileSpreadsheet className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Export</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
