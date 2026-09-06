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

| متد | مسیر NestJS | کار |
| --- | --- | --- |
| `POST` | `http://localhost:3001/notifications` | `{ userId, message, type }` |
| `GET` | `http://localhost:3001/notifications/:userId` | لیست اعلان‌های همان کاربر |

`type`: `info` | `success` | `warning` | `error`
