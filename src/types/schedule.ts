export type WateringFrequency =
  | 'once_daily'
  | 'every_x_days'
  | 'weekly'
  | 'monthly'
  | 'specific_days';

export interface WateringSchedule {
  enabled: boolean;
  frequency: WateringFrequency;
  intervalDays?: number;
  specificDays?: number[];
  preferredTimeHHMM?: string;
  reminderEnabled: boolean;
  notificationIds?: number[];
  lastWateredAt?: string;
}
