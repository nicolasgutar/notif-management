
export interface NotificationType {
  id: string;
  name: string;
  description: string;
  queryDescription: string;
  template: string;
  channels: string[];
}

export interface Channel {
  id: string;
  name: string;
  type: 'email' | 'apn' | 'in-app';
  enabled: boolean;
}

export interface Schedule {
  id: string;
  notificationId: string;
  cronExpression: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}

export const mockNotifications: NotificationType[] = [
  {
    id: 'digest_daily_action_items',
    name: 'Daily Action Items',
    description: 'Daily digest of items requiring attention (receipts, notes, attendees).',
    queryDescription: 'Users with missing receipts, notes, or attendees today',
    template: 'You have {totalActionItems} items requiring your attention today.',
    channels: ['in-app', 'email'],
  },
  {
    id: 'digest_weekly_summary',
    name: 'Weekly Summary',
    description: 'Weekly summary of transactions and incomplete items.',
    queryDescription: 'Users with transactions in the last week',
    template: 'You had {totalWeeklyTransactions} transactions this week. {incompleteTransactions} need attention.',
    channels: ['email'],
  },
  {
    id: 'notes_needed_general',
    name: 'Missing Notes',
    description: 'Transactions missing notes.',
    queryDescription: 'Users with transactions missing notes',
    template: 'You have {count} transactions missing notes.',
    channels: ['in-app'],
  },
  {
    id: 'notes_needed_meal_attendees',
    name: 'Missing Meal Attendees',
    description: 'Meal expenses missing attendees.',
    queryDescription: 'Users with meal expenses > $25 missing attendees',
    template: 'Please add attendees for {count} meal expenses.',
    channels: ['in-app'],
  },
  {
    id: 'receipt_needed_marketplace',
    name: 'Missing Marketplace Receipts',
    description: 'Marketplace purchases missing receipts.',
    queryDescription: 'Users with marketplace purchases > $25 missing receipts',
    template: 'We found {count} marketplace purchases missing receipts.',
    channels: ['in-app', 'email'],
  },
  {
    id: 'receipt_needed_special_category',
    name: 'Missing Special Category Receipts',
    description: 'Special category expenses missing receipts.',
    queryDescription: 'Users with travel, food (>25), or event (>25) expenses missing receipts',
    template: 'You have {count} special category expenses missing receipts.',
    channels: ['in-app', 'email'],
  },
];

export const mockChannels: Channel[] = [
  { id: 'email', name: 'Email', type: 'email', enabled: true },
  { id: 'apn', name: 'Apple Push Notification', type: 'apn', enabled: true },
  { id: 'in-app', name: 'In-App Message', type: 'in-app', enabled: true },
];

export const mockSchedules: Schedule[] = [
  {
    id: 'sched-1',
    notificationId: 'receipt-reminder',
    cronExpression: '0 9 * * 1', // Every Monday at 9am
    enabled: true,
    lastRun: '2025-11-24T09:00:00Z',
    nextRun: '2025-12-01T09:00:00Z',
  },
  {
    id: 'sched-2',
    notificationId: 'weekly-summary',
    cronExpression: '0 18 * * 5', // Every Friday at 6pm
    enabled: true,
    lastRun: '2025-11-21T18:00:00Z',
    nextRun: '2025-11-28T18:00:00Z',
  },
];
