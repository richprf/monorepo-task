"use client";

import { useCallback, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

const DEMO_USER_ID = "demo-user";
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:3001";

type NotificationType = "info" | "success" | "warning" | "error";

type Notification = {
  id: string;
  userId: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
};

type SocketStatus = "connecting" | "connected" | "disconnected";

const SAMPLE_MESSAGES: { type: NotificationType; message: string }[] = [
  { type: "info", message: "گزارش روزانه آماده است." },
  { type: "success", message: "پرداخت با موفقیت ثبت شد." },
  { type: "warning", message: "ظرفیت دیسک به ۸۰٪ رسیده." },
  { type: "error", message: "همگام‌سازی با سرور ناموفق بود." },
];

const TYPE_LABEL: Record<NotificationType, string> = {
  info: "اطلاع",
  success: "موفق",
  warning: "هشدار",
  error: "خطا",
};

const TYPE_CLASS: Record<NotificationType, string> = {
  info: "bg-sky-100 text-sky-800",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-900",
  error: "bg-rose-100 text-rose-800",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function BellBadge({ unread }: { unread: number }) {
  return (
    <div className="relative inline-flex" aria-label={`${unread} اعلان نخونده`}>
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-800 shadow-sm">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0m6 0H9"
          />
        </svg>
      </span>
      {unread > 0 ? (
        <span className="absolute -top-1 -left-1 min-w-5 rounded-full bg-rose-600 px-1.5 py-0.5 text-center text-[11px] font-bold leading-none text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      ) : null}
    </div>
  );
}

function prependUnique(
  list: Notification[],
  incoming: Notification,
): Notification[] {
  if (list.some((item) => item.id === incoming.id)) {
    return list;
  }
  return [incoming, ...list];
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socketStatus, setSocketStatus] = useState<SocketStatus>("connecting");
  const [pushCount, setPushCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE}/notifications/${encodeURIComponent(DEMO_USER_ID)}`,
      );
      if (!response.ok) {
        throw new Error(`GET failed: ${response.status}`);
      }
      const data = (await response.json()) as Notification[];
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "نتوانست به بک‌اند NestJS وصل شود",
      );
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();

    const socket: Socket = io(API_BASE, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      setSocketStatus("connected");
      socket.emit("join", { userId: DEMO_USER_ID });
    });
    socket.on("disconnect", () => {
      setSocketStatus("disconnected");
    });
    socket.on("connect_error", () => {
      setSocketStatus("disconnected");
    });
    socket.on("notification", (incoming: Notification) => {
      setNotifications((current) => prependUnique(current, incoming));
      setPushCount((count) => count + 1);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [fetchNotifications]);

  async function sendTestNotification() {
    setSending(true);
    const sample =
      SAMPLE_MESSAGES[Math.floor(Math.random() * SAMPLE_MESSAGES.length)];

    try {
      const response = await fetch(`${API_BASE}/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          message: sample.message,
          type: sample.type,
        }),
      });
      if (!response.ok) {
        throw new Error(`POST failed: ${response.status}`);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارسال ناموفق بود");
    } finally {
      setSending(false);
    }
  }

  async function markAsRead(id: string, alreadyRead: boolean) {
    if (alreadyRead) return;
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
    try {
      const response = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: "PATCH",
      });
      if (!response.ok) {
        throw new Error(`PATCH failed: ${response.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "علامت‌گذاری ناموفق بود");
      await fetchNotifications();
    }
  }

  const statusLabel =
    socketStatus === "connected"
      ? "WebSocket وصل است"
      : socketStatus === "connecting"
        ? "در حال اتصال WebSocket…"
        : "WebSocket قطع است";

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-violet-700">
            مرحله ۳ — Real-time با WebSocket
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            سیستم اعلان ساده
          </h1>
          <p className="text-sm leading-7 text-zinc-600">
            Polling حذف شد. یک GET اول لیست را می‌آورد؛ بعد از آن NestJS از طریق
            Gateway هر اعلان جدید را فوری Push می‌کند.
          </p>
        </div>
        <BellBadge unread={unreadCount} />
      </header>

      <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => void sendTestNotification()}
            disabled={sending}
            className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "در حال ارسال…" : "ارسال اعلان تستی"}
          </button>
          <div className="text-xs text-zinc-500">
            userId:{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">
              {DEMO_USER_ID}
            </code>
          </div>
        </div>
        <p className="text-xs text-zinc-500">
          <span
            className={
              socketStatus === "connected" ? "text-emerald-700" : "text-amber-700"
            }
          >
            {statusLabel}
          </span>
          {" · "}
          push دریافتی: {pushCount} · نخونده: {unreadCount}
        </p>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-700">
          اعلان‌ها ({notifications.length})
        </h2>
        {notifications.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-500">
            هنوز اعلانی نیست. دکمه را بزن؛ باید بدون انتظار ۳ ثانیه‌ای از
            WebSocket برسد.
          </p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => void markAsRead(item.id, item.read)}
                  className={`w-full rounded-2xl border p-4 text-right shadow-sm transition ${
                    item.read
                      ? "border-zinc-200 bg-white text-zinc-600"
                      : "cursor-pointer border-violet-200 bg-violet-50 hover:bg-violet-100"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_CLASS[item.type]}`}
                      >
                        {TYPE_LABEL[item.type]}
                      </span>
                      {!item.read ? (
                        <span className="text-xs font-medium text-violet-700">
                          نخونده
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400">خوانده‌شده</span>
                      )}
                    </div>
                    <time
                      className="text-xs text-zinc-400"
                      dateTime={item.createdAt}
                    >
                      {formatTime(item.createdAt)}
                    </time>
                  </div>
                  <p
                    className={`text-sm leading-6 ${item.read ? "font-normal" : "font-medium text-zinc-900"}`}
                  >
                    {item.message}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
