import Dexie, { type EntityTable } from 'dexie';

export type EntryType = 'Debit' | 'Credit';

export type AccountCategory =
  | 'Cash'
  | 'Bank'
  | 'Income - Membership Dues'
  | 'Income - Personal Training'
  | 'Income - Merchandise & Gear'
  | 'Income - Fight Night & Events'
  | 'Income - Other'
  | 'Expense - Rent & Facility'
  | 'Expense - Boxing Equipment'
  | 'Expense - Utilities'
  | 'Expense - Marketing'
  | 'Expense - Coach & Staff Payouts'
  | 'Expense - Miscellaneous'
  | 'Equity - Owner Capital'
  | 'Equity - Owner Drawings'
  | 'Liability - Accounts Payable';

export interface AccountMetadata {
  name: AccountCategory;
  classification: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
  normalBalance: EntryType;
}

export const CHART_OF_ACCOUNTS: AccountMetadata[] = [
  { name: 'Cash', classification: 'Asset', normalBalance: 'Debit' },
  { name: 'Bank', classification: 'Asset', normalBalance: 'Debit' },
  { name: 'Income - Membership Dues', classification: 'Income', normalBalance: 'Credit' },
  { name: 'Income - Personal Training', classification: 'Income', normalBalance: 'Credit' },
  { name: 'Income - Merchandise & Gear', classification: 'Income', normalBalance: 'Credit' },
  { name: 'Income - Fight Night & Events', classification: 'Income', normalBalance: 'Credit' },
  { name: 'Income - Other', classification: 'Income', normalBalance: 'Credit' },
  { name: 'Expense - Rent & Facility', classification: 'Expense', normalBalance: 'Debit' },
  { name: 'Expense - Boxing Equipment', classification: 'Expense', normalBalance: 'Debit' },
  { name: 'Expense - Utilities', classification: 'Expense', normalBalance: 'Debit' },
  { name: 'Expense - Marketing', classification: 'Expense', normalBalance: 'Debit' },
  { name: 'Expense - Coach & Staff Payouts', classification: 'Expense', normalBalance: 'Debit' },
  { name: 'Expense - Miscellaneous', classification: 'Expense', normalBalance: 'Debit' },
  { name: 'Equity - Owner Capital', classification: 'Equity', normalBalance: 'Credit' },
  { name: 'Equity - Owner Drawings', classification: 'Equity', normalBalance: 'Debit' },
  { name: 'Liability - Accounts Payable', classification: 'Liability', normalBalance: 'Credit' }
];

export interface LedgerEntry {
  id?: number;
  date: string; // YYYY-MM-DD
  description: string;
  account: AccountCategory;
  type: EntryType; // 'Debit' | 'Credit'
  amount: number; // Strictly in LKR
  journalGroupId?: string; // Links balanced double-entry pairs when entered together
  createdAt: number;
}

export type TaskStatus = 'Todo' | 'In Progress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface WorkflowTask {
  id?: number;
  date: string; // YYYY-MM-DD
  title: string;
  notes?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: number;
}

/**
 * Offline-First IndexedDB Database powered by Dexie.js.
 * Initializes strictly EMPTY with zero dummy or placeholder records.
 */
class ColosseumDatabase extends Dexie {
  ledger!: EntityTable<LedgerEntry, 'id'>;
  tasks!: EntityTable<WorkflowTask, 'id'>;

  constructor() {
    super('ColosseumFightClubDB');

    this.version(1).stores({
      ledger: '++id, date, account, type, journalGroupId, createdAt',
      tasks: '++id, date, status, priority, createdAt'
    });
  }
}

export const db = new ColosseumDatabase();
