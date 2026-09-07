# Gateway Layer در Next.js

فرانت فقط **یک** درخواست به Next.js می‌زند. Route Handler دو سرویس داخلی را با `Promise.all` موازی صدا می‌زند و یک JSON واحد برمی‌گرداند.

| فرآیند | پورت | تأخیر مصنوعی |
| --- | --- | --- |
| Accounts Service | 4001 | 200ms |
| Transactions Service | 4002 | 400ms |
| Next.js Gateway | 3000 | موازی ≈ ۴۰۰ms (نه ۶۰۰ms) |

```sh
npm install
npm run service:accounts        # ترمینال ۱
npm run service:transactions    # ترمینال ۲
npm run dev                     # ترمینال ۳
curl http://localhost:3000/api/profile/123456
```

صفحه: [http://localhost:3000](http://localhost:3000)
