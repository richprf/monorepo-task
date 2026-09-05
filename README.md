# یادگیری Monorepo با Turborepo

این مخزن یک پروژه‌ی آموزشی است: دو اپ Next.js (`web` و `docs`) و یک کتابخانه‌ی UI مشترک (`@repo/ui`) داخل **یک ریپو** زندگی می‌کنند. Turborepo بیلد را هماهنگ می‌کند و با کش هوشمند، کار تکراری را حذف می‌کند.

پروژه با قالب رسمی ساخته شده:

```sh
npx create-turbo@latest . --package-manager npm
```

## Polyrepo در برابر Monorepo — مشکل چیست؟

**Polyrepo:** هر اپ یک ریپوی جداست. اگر دکمه‌ی مشترک عوض شود باید پکیج را publish کنید (یا با git submodule کپی کنید)، بعد در هر اپ bump نسخه بدهید. هماهنگی سخت است و بیلد هر ریپو از بقیه‌ بی‌خبر است.

**Monorepo:** همه‌ی اپ‌ها و پکیج‌های مشترک در یک ریپو هستند. تغییر در `packages/ui` همان لحظه در `apps/web` و `apps/docs` دیده می‌شود — بدون npm publish.

**Turborepo چه مشکلی را حل می‌کند؟** در مونوریپو اگر ساده‌لوحانه `build` همه را پشت‌سرهم اجرا کنید، کند می‌شود. Turborepo:

1. **گراف وابستگی** را می‌فهمد (`web` و `docs` به `@repo/ui` وابسته‌اند).
2. تسک‌های مستقل را **موازی** اجرا می‌کند.
3. خروجی بیلد را **کش** می‌کند. اگر ورودی یک پکیج عوض نشده باشد، بیلد را دوباره انجام نمی‌دهد و از کش برمی‌گرداند (`FULL TURBO`).

---

## ۱) ساختار پوشه‌ها — چرا این‌طور چیده شده؟

```
.
├── apps/
│   ├── web/          # اپ محصول (Next.js، پورت 3000)
│   └── docs/         # اپ مستندات (Next.js، پورت 3001)
├── packages/
│   ├── ui/           # کامپوننت‌های مشترک React  →  @repo/ui
│   ├── eslint-config # تنظیمات مشترک ESLint     →  @repo/eslint-config
│   └── typescript-config
├── package.json      # workspaces + اسکریپت‌های ریشه
├── package-lock.json
└── turbo.json        # گراف تسک‌ها و قوانین کش
```

- **`apps/`** = چیزهایی که *اجرا* می‌شوند (سایت، سرویس). هر کدام `package.json` خود را دارند.
- **`packages/`** = چیزهایی که *مصرف* می‌شوند (UI، کانفیگ). اپ‌ها به این‌ها وابسته‌اند.
- این جداسازی به Turborepo می‌گوید: اگر فقط `apps/web` عوض شد، لازم نیست `docs` دوباره بیلد شود. اگر `packages/ui` عوض شد، هر اپی که به آن وابسته است باید دوباره بیلد شود.

اسکریپت‌های ریشه در `package.json`:

```json
"workspaces": ["apps/*", "packages/*"]
```

این خط به npm می‌گوید همه‌ی پوشه‌های داخل `apps/` و `packages/` یک **workspace** هستند؛ پکیج‌های داخلی بدون publish روی npm به هم لینک می‌شوند.

---

## ۲) لینک `@repo/ui` بدون publish

هر دو اپ همین وابستگی را دارند:

```json
"dependencies": {
  "@repo/ui": "*"
}
```

`*` یعنی «هر نسخه‌ای که داخل workspace هست». npm به‌جای دانلود از registry، یک **symlink** می‌سازد:

```
node_modules/@repo/ui  →  ../../packages/ui
```

نام پکیج از فیلد `name` در `packages/ui/package.json` می‌آید (`@repo/ui`). پیشوند `@repo` فقط یک scope قراردادی است، نه یک سازمان روی npm.

خروجی واقعی `npm ls @repo/ui`:

```
monorepo-task@ /workspace
├── @repo/ui@0.0.0 -> ./packages/ui
├─┬ docs@0.1.0 -> ./apps/docs
│ └── @repo/ui@0.0.0 deduped -> ./packages/ui
└─┬ web@0.1.0 -> ./apps/web
  └── @repo/ui@0.0.0 deduped -> ./packages/ui
```

`deduped` یعنی هر دو اپ به **همان پوشه‌ی محلی** اشاره می‌کنند، نه دو کپی جدا.

در کد:

```ts
import { Button } from "@repo/ui/button";
```

این import مثل پکیج npm معمولی است، ولی فایل از `packages/ui/src/button.tsx` خوانده می‌شود (طبق `exports` در `packages/ui/package.json`).

---

## ۳) `turbo.json` — `dependsOn` و `outputs`

```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**", "!.next/dev/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "check-types": {
      "dependsOn": ["^check-types"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

| فیلد | معنی ساده |
| --- | --- |
| `dependsOn: ["^build"]` | قبل از بیلد این پکیج، اول `build` **وابستگی‌هایش** (`^` = dependencies) را اجرا کن. پس اگر `@repo/ui` اسکریپت `build` داشت، قبل از `web` اجرا می‌شد. |
| `outputs` | کدام فایل‌ها حاصل بیلد هستند و باید کش شوند. اینجا خروجی Next.js یعنی `.next/` (به‌جز کش داخلی Next). |
| `inputs` | اگر این فایل‌ها عوض شوند، کش باطل است. `$TURBO_DEFAULT$` یعنی سورس پکیج + قفل وابستگی‌ها. |
| `dev.cache: false` | سرور توسعه کش‌شدنی نیست؛ همیشه زنده اجرا می‌شود. |

گراف این پروژه برای تسک `build`:

```
packages/ui  (اسکریپت build ندارد → در گراف build نیست)
     ↑ وابسته
apps/web  ──┐
            ├──  هر دو @repo/ui را import می‌کنند
apps/docs ──┘
```

برای `turbo run build` فقط **دو تسک** وجود دارد: `web#build` و `docs#build`. به همین خاطر در خلاصه‌ی توربو عدد `2 total` می‌بینید.

---

## ۴) آزمایشگاه کش — دستورها

همه‌ی بیلدها با خروجی متنی اجرا شدند تا عبارت‌های `FULL TURBO` و `Cached` دیده شوند:

```sh
npx turbo run build --ui=stream
```

لاگ کامل هر مرحله در پوشه‌ی [`lab-outputs/`](./lab-outputs) ذخیره شده است.

### مرحله ۱ — بیلد اول (سرد، بدون کش)

همه‌چیز از صفر کامپایل شد. زمان تقریبی **ده‌ها ثانیه**.

### مرحله ۲ — همان دستور، بدون هیچ تغییری

توربو هش ورودی را با کش مقایسه می‌کند، هیچ فایلی عوض نشده، پس **هر دو اپ از کش** برمی‌گردند. زمان به **کسری از ثانیه** می‌رسد و در خروجی `>>> FULL TURBO` دیده می‌شود.

`FULL TURBO` یعنی ۱۰۰٪ تسک‌ها از کش آمده‌اند.

### مرحله ۳ — فقط `apps/web` عوض شد

یک متن روی صفحه‌ی وب اضافه شد. توربو فهمید `docs` ورودی یکسانی دارد → **Cached: 1 cached, 2 total** (فقط `web` دوباره بیلد شد).

### مرحله ۴ — کامپوننت مشترک `packages/ui/src/button.tsx` عوض شد

چون **هر دو اپ** `@repo/ui` را import می‌کنند، هش هر دو عوض می‌شود → **Cached: 0 cached, 2 total** (کش هر دو باطل).

---

## ۵) جدول خلاصه (بر اساس گراف وابستگی)

| چه فایلی عوض شد | کدام اپ‌ها دوباره بیلد شدند | چرا |
| --- | --- | --- |
| هیچ‌کدام (بیلد دوم) | هیچ‌کدام — هر دو Cached | ورودی‌ها با هش قبلی یکی است → `FULL TURBO` |
| `apps/web/app/page.tsx` | فقط `web` (`docs` از کش) | تغییر محلی است؛ `docs` به آن فایل وابسته نیست |
| `packages/ui/src/button.tsx` | هم `web` هم `docs` | هر دو `import { Button } from "@repo/ui/button"` دارند؛ تغییر پکیج مشترک کش هر دو را باطل می‌کند |

این همان فرق عملی Monorepo + Turborepo با دو ریپوی جداست: یک تغییر در UI مشترک **خودکار** به مصرف‌کننده‌ها منتشر می‌شود، و بیلد فقط برای همان‌هایی که واقعاً لازم است تکرار می‌شود.

---

## دستورهای روزمره

```sh
npm install              # نصب همه‌ی workspaceها از ریشه‌ی ریپو
npx turbo run build      # بیلد همه‌ی پکیج‌هایی که اسکریپت build دارند
npx turbo run dev        # web روی 3000 و docs روی 3001
npx turbo run lint
npx turbo run build --filter=web   # فقط یک اپ
```

دو بار پشت‌سرهم `build` بگیرید تا کش را خودتان ببینید.
