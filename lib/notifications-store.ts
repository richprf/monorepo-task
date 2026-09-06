export const NOTIFICATION_TYPES = ["info", "success", "warning", "error"] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type Notification = {
  id: string;
  userId: string;
  message: string;
  type: NotificationType;
  createdAt: string;
};

/**
 * In-memory store for Stage 1.
 * Lives in this Node.js process only — no database, no disk.
 * `globalThis` keeps the array alive across Next.js hot reloads in `next dev`.
 */
const globalForStore = globalThis as typeof globalThis & {
  notificationStore?: Notification[];
};

if (!globalForStore.notificationStore) {
  globalForStore.notificationStore = [];
}

export function getStore(): Notification[] {
  return globalForStore.notificationStore!;
}

export function addNotification(input: {
  userId: string;
  message: string;
  type: NotificationType;
}): Notification {
  const notification: Notification = {
    id: crypto.randomUUID(),
    userId: input.userId,
    message: input.message,
    type: input.type,
    createdAt: new Date().toISOString(),
  };

  getStore().unshift(notification);
  return notification;
}

export function listByUser(userId: string): Notification[] {
  return getStore().filter((item) => item.userId === userId);
}

export function isNotificationType(value: string): value is NotificationType {
  return (NOTIFICATION_TYPES as readonly string[]).includes(value);
}
