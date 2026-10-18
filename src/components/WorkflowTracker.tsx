import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type TaskStatus, type TaskPriority, type WorkflowTask } from '@/db/db';
import { getTodayISO } from '@/lib/utils';
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
  ListTodo,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  CircleDot
} from 'lucide-react';

const STATUS_COLUMNS: TaskStatus[] = ['Todo', 'In Progress', 'Done'];

export const WorkflowTracker: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISO());
  const [showAllDates, setShowAllDates] = useState<boolean>(false);
  const [activeStatusTab, setActiveStatusTab] = useState<'ALL' | TaskStatus>('ALL');

  // New Task Form State
  const [title, setTitle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Todo');

  const allTasks =
    useLiveQuery(() => db.tasks.orderBy('createdAt').reverse().toArray(), []) ?? [];

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await db.tasks.add({
      date: selectedDate || getTodayISO(),
      title: title.trim(),
      notes: notes.trim() || undefined,
      status,
      priority,
      createdAt: Date.now()
    });

    setTitle('');
    setNotes('');
  };

  const handleStatusChange = async (task: WorkflowTask, nextStatus: TaskStatus) => {
    if (!task.id) return;
    await db.tasks.update(task.id, { status: nextStatus });
  };

  const handleDeleteTask = async (id?: number) => {
    if (!id) return;
    await db.tasks.delete(id);
  };

  const filteredTasks = allTasks.filter((t) => {
    if (!showAllDates && t.date !== selectedDate) return false;
    if (activeStatusTab !== 'ALL' && t.status !== activeStatusTab) return false;
    return true;
  });

  return (
    <div className="space-y-4 pb-6">
      {/* Add Daily Task Card */}
      <Card className="gold-border-glow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-colosseum-gold" />
            New Gym Workflow Task
          </CardTitle>
          <CardDescription>
            Schedule daily operations, coaching sessions, or maintenance tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTask} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-title">Task Title *</Label>
              <Input
                id="task-title"
                type="text"
                placeholder="e.g., Inspect Heavy Bag Chains & Ring Ropes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="space-y-1.5">
                <Label htmlFor="task-date">Target Date</Label>
                <Input
                  id="task-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="task-priority">Priority</Label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="flex h-11 w-full rounded-lg border border-colosseum-gold/30 bg-[#0a0a0a] px-2.5 text-xs text-[#f5f5f5] focus:outline-none focus:border-colosseum-gold"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="task-status">Initial State</Label>
                <select
                  id="task-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="flex h-11 w-full rounded-lg border border-colosseum-gold/30 bg-[#0a0a0a] px-2.5 text-xs text-[#f5f5f5] focus:outline-none focus:border-colosseum-gold"
                >
                  {STATUS_COLUMNS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-notes">Notes (Optional)</Label>
              <Input
                id="task-notes"
                type="text"
                placeholder="Additional details or assigned coach..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4" />
              Add Task to Workflow
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Date Filter & Status Tabs */}
      <Card>
        <CardContent className="p-3.5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-colosseum-gold">
              <Calendar className="h-4 w-4" />
              <span>{showAllDates ? 'Showing All Dates' : `Date: ${selectedDate}`}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(getTodayISO());
                  setShowAllDates(false);
                }}
                className="rounded-md border border-colosseum-gold/30 bg-[#121212] px-2.5 py-1 text-[11px] font-bold text-colosseum-gold hover:bg-colosseum-gold/15"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setShowAllDates(!showAllDates)}
                className={`rounded-md border px-2.5 py-1 text-[11px] font-bold transition-colors ${
                  showAllDates
                    ? 'border-colosseum-gold bg-colosseum-gold text-[#0a0a0a]'
                    : 'border-neutral-700 bg-[#121212] text-neutral-300'
                }`}
              >
                {showAllDates ? 'Filter by Date' : 'All Dates'}
              </button>
            </div>
          </div>

          {/* Status Filter Pill Bar */}
          <div className="grid grid-cols-4 gap-1.5 rounded-lg bg-[#0a0a0a] p-1 border border-neutral-800">
            {(['ALL', 'Todo', 'In Progress', 'Done'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveStatusTab(tab)}
                className={`py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                  activeStatusTab === tab
                    ? 'bg-colosseum-gold text-[#0a0a0a]'
                    : 'text-neutral-400 hover:text-colosseum-gold'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-xs text-neutral-500">
              No workflow tasks for this view. Add a new task above to start tracking.
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="bg-[#171717]">
              <CardContent className="p-3.5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={
                          task.priority === 'High'
                            ? 'destructive'
                            : task.priority === 'Medium'
                            ? 'default'
                            : 'outline'
                        }
                      >
                        {task.priority}
                      </Badge>
                      <span className="text-[11px] font-mono text-neutral-400">{task.date}</span>
                    </div>
                    <h4
                      className={`text-sm font-bold mt-1.5 break-words ${
                        task.status === 'Done'
                          ? 'line-through text-neutral-500'
                          : 'text-foreground'
                      }`}
                    >
                      {task.title}
                    </h4>
                    {task.notes && (
                      <p className="text-xs text-neutral-400 mt-1 break-words">{task.notes}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    aria-label="Delete task"
                    className="p-1.5 rounded-md text-neutral-500 hover:text-red-400 hover:bg-red-950/40 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Touch-Friendly Status Switcher */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-800/80">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(task, 'Todo')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-bold uppercase transition-all ${
                      task.status === 'Todo'
                        ? 'bg-neutral-800 text-white border border-neutral-600'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    <CircleDot className="h-3 w-3" />
                    Todo
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(task, 'In Progress')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-bold uppercase transition-all ${
                      task.status === 'In Progress'
                        ? 'bg-colosseum-gold/20 text-colosseum-gold border border-colosseum-gold/50'
                        : 'text-neutral-500 hover:text-colosseum-gold'
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    In Progress
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(task, 'Done')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-bold uppercase transition-all ${
                      task.status === 'Done'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                        : 'text-neutral-500 hover:text-emerald-400'
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Done
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
