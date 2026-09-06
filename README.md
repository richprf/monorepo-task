# سیستم اعلان — NestJS + Next.js

دو پروژهٔ جدا (بدون مونوریپو): بک‌اند NestJS و فرانت‌اند Next.js.

## مرحله ۱ — In-memory + Polling

اعلان‌ها در آرایهٔ حافظهٔ NestJS ذخیره می‌شوند. Next.js هر ۳ ثانیه لیست را GET می‌کند.

### اجرا

ترمینال ۱ — بک‌اند (پورت ۳۰۰۱):

```sh
cd backend
npm install
npm run start:dev
```

ترمینال ۲ — فرانت‌اند (پورت ۳۰۰۰):

```sh
cd frontend
npm install
npm run dev
```

باز کن: [http://localhost:3000](http://localhost:3000)

## مرحله ۲ — خوانده‌شده / نخونده

هر اعلان فیلد `read` دارد (پیش‌فرض `false`). ورودی POST با DTO و `class-validator` چک می‌شود.

| متد | مسیر NestJS | کار |
| --- | --- | --- |
| `POST` | `/notifications` | `{ userId, message, type }` — اعلان نخونده |
| `GET` | `/notifications/:userId` | لیست اعلان‌های همان کاربر |
| `PATCH` | `/notifications/:id/read` | همان اعلان را خوانده‌شده می‌کند |

روی فرانت: زنگوله با عدد قرمز = تعداد نخونده. کلیک روی یک اعلان → `PATCH`.
