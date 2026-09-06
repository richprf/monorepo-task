# سیستم اعلان — مرحله ۱ (Polling)

یک اپ Next.js ساده (بدون مونوریپو و بدون دیتابیس). اعلان‌ها در یک آرایهٔ **in-memory** روی سرور ذخیره می‌شوند و فرانت‌اند هر ۳ ثانیه با **Polling** لیست را می‌گیرد.

## اجرا

```sh
npm install
npm run dev
```

باز کن: [http://localhost:3000](http://localhost:3000)

- دکمهٔ **ارسال اعلان تستی** یک `POST` به `/api/notifications` می‌زند.
- صفحه هر ۳ ثانیه `GET /api/notifications?userId=demo-user` می‌زند.

## API

| متد | مسیر | کار |
| --- | --- | --- |
| `POST` | `/api/notifications` | بدنه: `{ userId, message, type }` — اعلان جدید |
| `GET` | `/api/notifications?userId=...` | لیست اعلان‌های همان کاربر |

`type` یکی از `info` | `success` | `warning` | `error` است.

## محدودیت in-memory

آرایه فقط تا وقتی زنده است که پروسهٔ `next dev` / `next start` در حال اجرا باشد. ری‌استارت سرور همه را پاک می‌کند. این برای یادگیری کافی است؛ مرحله‌های بعد وضعیت خوانده‌شده و سپس realtime را اضافه می‌کنند.
