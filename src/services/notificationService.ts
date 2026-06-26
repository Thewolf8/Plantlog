import type { Plant } from '@/types/plant';

export async function scheduleWateringReminder(plant: Plant): Promise<void> {
  try {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return;
    const schedule = plant.wateringSchedule;
    if (!schedule?.enabled || !schedule.reminderEnabled) return;

    const title = `PlantLog: Water ${plant.name}`;
    const body = `Time to water your ${plant.name}!`;

    if (schedule.preferredTimeHHMM) {
      const [h, m] = schedule.preferredTimeHHMM.split(':').map(Number);
      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(h, m, 0, 0);
      if (reminderTime <= now) reminderTime.setDate(reminderTime.getDate() + 1);
      const delay = reminderTime.getTime() - now.getTime();
      setTimeout(() => {
        new Notification(title, { body, icon: '/assets/icon.png' });
      }, delay);
    }
  } catch {
    // Notifications are best-effort
  }
}

export function cancelWateringReminder(_plant: Plant): Promise<void> {
  return Promise.resolve();
}

export function rescheduleAll(): Promise<void> {
  return Promise.resolve();
}
