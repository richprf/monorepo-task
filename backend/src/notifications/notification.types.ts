export const NOTIFICATION_TYPES = ['info', 'success', 'warning', 'error'] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type Notification = {
  id: string;
  userId: string;
  message: string;
  type: NotificationType;
  createdAt: string;
};

export function isNotificationType(value: string): value is NotificationType {
  return (NOTIFICATION_TYPES as readonly string[]).includes(value);
}
