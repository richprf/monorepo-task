"use client";

import { useEffect, useState } from "react";

const ACCOUNT_ID = "123456";

export default function Home() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/profile/${ACCOUNT_ID}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`gateway ${res.status}`);
        return res.json();
      })
      .then(setProfile)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="mx-auto flex min-h-full w-full max-w-xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <p className="text-sm font-medium text-violet-700">Gateway Layer</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          پروفایل حساب بانکی
        </h1>
        <p className="text-sm leading-7 text-zinc-600">
          این صفحه فقط یک بار به Gateway در Next.js درخواست می‌زند. Gateway دو
          میکروسرویس (حساب روی ۴۰۰۱، تراکنش روی ۴۰۰۲) را موازی صدا می‌زند و یک
          JSON واحد برمی‌گرداند.
        </p>
      </header>

      {error ? (
        <p className="text-sm text-rose-600">{error}</p>
      ) : !profile ? (
        <p className="text-sm text-zinc-500">در حال گرفتن پروفایل از Gateway…</p>
      ) : (
        <section className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-zinc-500">صاحب حساب</p>
            <p className="mt-1 text-lg font-medium">{profile.accountHolder}</p>
            <p className="mt-3 text-xs text-zinc-500">موجودی</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {Number(profile.balance).toLocaleString("fa-IR")}{" "}
              <span className="text-sm font-normal text-zinc-500">USD</span>
            </p>
            <p className="mt-3 text-xs text-zinc-400">
              زمان Gateway: {profile.elapsedMs}ms
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-sm font-medium text-zinc-700">
              تراکنش‌های اخیر
            </h2>
            <ul className="space-y-2">
              {profile.recentTransactions.map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm"
                >
                  <span>{tx.desc}</span>
                  <span
                    className={
                      tx.amount < 0 ? "text-rose-600" : "text-emerald-700"
                    }
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
