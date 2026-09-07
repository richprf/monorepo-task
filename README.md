# سیستم اعلان Real-time — NestJS + Next.js

دو پروژهٔ جدا: بک‌اند NestJS روی پورت **3001** و فرانت‌اند Next.js روی پورت **3000**. بدون Redis و بدون Queue؛ همه چیز in-memory است.

## دو حافظهٔ جدا روی سرور

1. **آرایهٔ اعلان‌ها** — محتوا + `read`
2. **Map آنلاین‌ها** — `userId → socket.id` (چه کسی الان WebSocket باز دارد)

وقتی `POST /notifications` می‌آید، سرویس اول Map را می‌پرسد. اگر کاربر آنلاین باشد فقط به **همان یک نفر** رویداد `newNotification` می‌فرستد. اگر آفلاین باشد فقط ذخیره می‌کند و در کنسول می‌نویسد «کاربر آفلاین است».

## اجرا

```sh
cd backend && npm install && npm run start:dev   # :3001
cd frontend && npm install && npm run dev        # :3000
```

باز کن: [http://localhost:3000](http://localhost:3000)

اتصال فرانت: `io(API_URL, { query: { userId } })`. در کنسول Nest باید ببینی: `کاربر آنلاین شد`.

| متد | مسیر | کار |
| --- | --- | --- |
| `POST` | `/notifications` | `{ userId, message }` |
| `GET` | `/notifications/:userId` | لیست اعلان‌های قبلی |
| `PATCH` | `/notifications/:id/read` | خوانده‌شده |
