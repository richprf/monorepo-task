"use client";

import { useCallback, useEffect, useState } from "react";

const DEMO_USER_ID = "demo-user";
const POLL_MS = 3000;
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:3001";

type NotificationType = "info" | "success" | "warning" | "error";

type Notification = {
  id: string;
  userId: string;
  message: string;
  type: NotificationType;
  createdAt: string;
};

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

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastPolledAt, setLastPolledAt] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setLastPolledAt(new Date().toISOString());
      setPollCount((count) => count + 1);
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
    const timer = window.setInterval(() => {
      void fetchNotifications();
    }, POLL_MS);
    return () => window.clearInterval(timer);
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
      await fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارسال ناموفق بود");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <p className="text-sm font-medium text-violet-700">
          مرحله ۱ — NestJS + Next.js
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          سیستم اعلان ساده
        </h1>
        <p className="text-sm leading-7 text-zinc-600">
          فرانت‌اند Next.js است؛ API روی NestJS در{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">
            {API_BASE}
          </code>{" "}
          اجرا می‌شود. اعلان‌ها در آرایهٔ in-memory بک‌اند ذخیره می‌شوند و صفحه
          هر <strong>{POLL_MS / 1000} ثانیه</strong> با GET می‌پرسد «چیز جدیدی
          هست؟» (Polling).
        </p>
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
          آخرین GET:{" "}
          {lastPolledAt ? formatTime(lastPolledAt) : "هنوز انجام نشده"} · تعداد
          polling: {pollCount}
        </p>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-700">
          اعلان‌ها ({notifications.length})
        </h2>
        {notifications.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-500">
            هنوز اعلانی نیست. دکمه را بزن یا تا ۳ ثانیه صبر کن تا لیست از NestJS
            آپدیت شود.
          </p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_CLASS[item.type]}`}
                  >
                    {TYPE_LABEL[item.type]}
                  </span>
                  <time
                    className="text-xs text-zinc-400"
                    dateTime={item.createdAt}
                  >
                    {formatTime(item.createdAt)}
                  </time>
                </div>
                <p className="text-sm leading-6 text-zinc-800">{item.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
