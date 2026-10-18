import * as XLSX from 'xlsx';
import { db, CHART_OF_ACCOUNTS } from '@/db/db';
import { getTodayISO } from '@/lib/utils';

export async function exportColosseumWorkbook(): Promise<{
  ledgerCount: number;
  taskCount: number;
  fileName: string;
}> {
  const [ledgerEntries, tasks] = await Promise.all([
    db.ledger.orderBy('date').toArray(),
    db.tasks.orderBy('date').toArray()
  ]);

  const wb = XLSX.utils.book_new();

  // 1. DOUBLE-ENTRY LEDGER SHEET
  let totalDebit = 0;
  let totalCredit = 0;

  const ledgerRows = ledgerEntries.map((entry, idx) => {
    const isDebit = entry.type === 'Debit';
    const debitVal = isDebit ? entry.amount : 0;
    const creditVal = !isDebit ? entry.amount : 0;
    totalDebit += debitVal;
    totalCredit += creditVal;

    const accountMeta = CHART_OF_ACCOUNTS.find((a) => a.name === entry.account);

    return {
      'Entry #': entry.id ?? idx + 1,
      Date: entry.date,
      Description: entry.description,
      Account: entry.account,
      Classification: accountMeta?.classification ?? 'General',
      Type: entry.type,
      'Debit (LKR)': debitVal,
      'Credit (LKR)': creditVal,
      'Journal Pair ID': entry.journalGroupId ?? 'SINGLE'
    };
  });

  // Append Totals Row
  ledgerRows.push({
    'Entry #': '' as unknown as number,
    Date: 'TOTAL',
    Description: 'Trial Balance Check (Debits vs Credits)',
    Account: '' as any,
    Classification: '' as any,
    Type: '' as any,
    'Debit (LKR)': totalDebit,
    'Credit (LKR)': totalCredit,
    'Journal Pair ID': Math.abs(totalDebit - totalCredit) < 0.01 ? 'BALANCED' : 'UNBALANCED'
  });

  const ledgerSheet = XLSX.utils.json_to_sheet(
    ledgerRows.length > 1
      ? ledgerRows
      : [
          {
            'Entry #': '-',
            Date: '-',
            Description: 'No ledger records entered yet',
            Account: '-',
            Classification: '-',
            Type: '-',
            'Debit (LKR)': 0,
            'Credit (LKR)': 0,
            'Journal Pair ID': '-'
          }
        ]
  );

  ledgerSheet['!cols'] = [
    { wch: 10 },
    { wch: 13 },
    { wch: 36 },
    { wch: 30 },
    { wch: 15 },
    { wch: 10 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 }
  ];
  XLSX.utils.book_append_sheet(wb, ledgerSheet, 'Double_Entry_Ledger');

  // 2. TRIAL BALANCE & ACCOUNT SUMMARY SHEET
  const accountSummaryRows = CHART_OF_ACCOUNTS.map((acct) => {
    const entries = ledgerEntries.filter((e) => e.account === acct.name);
    const dr = entries
      .filter((e) => e.type === 'Debit')
      .reduce((sum, e) => sum + e.amount, 0);
    const cr = entries
      .filter((e) => e.type === 'Credit')
      .reduce((sum, e) => sum + e.amount, 0);
    const closingBalance = acct.normalBalance === 'Debit' ? dr - cr : cr - dr;

    return {
      Account: acct.name,
      Classification: acct.classification,
      'Normal Side': acct.normalBalance,
      'Total Debits (LKR)': dr,
      'Total Credits (LKR)': cr,
      'Closing Balance (LKR)': closingBalance
    };
  });

  const tbSheet = XLSX.utils.json_to_sheet(accountSummaryRows);
  tbSheet['!cols'] = [
    { wch: 32 },
    { wch: 15 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, tbSheet, 'Trial_Balance_LKR');

  // 3. WORKFLOW TASKS SHEET
  const taskRows =
    tasks.length > 0
      ? tasks.map((t, idx) => ({
          'Task #': t.id ?? idx + 1,
          Date: t.date,
          Title: t.title,
          Status: t.status,
          Priority: t.priority,
          Notes: t.notes ?? ''
        }))
      : [
          {
            'Task #': '-',
            Date: '-',
            Title: 'No workflow tasks recorded yet',
            Status: '-',
            Priority: '-',
            Notes: '-'
          }
        ];

  const taskSheet = XLSX.utils.json_to_sheet(taskRows);
  taskSheet['!cols'] = [
    { wch: 10 },
    { wch: 13 },
    { wch: 34 },
    { wch: 15 },
    { wch: 12 },
    { wch: 40 }
  ];
  XLSX.utils.book_append_sheet(wb, taskSheet, 'Workflow_Tasks');

  const fileName = `Colosseum_Fight_Club_LKR_${getTodayISO()}.xlsx`;
  XLSX.writeFile(wb, fileName);

  return {
    ledgerCount: ledgerEntries.length,
    taskCount: tasks.length,
    fileName
  };
}
