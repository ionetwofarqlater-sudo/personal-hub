# 🚀 Personal Hub — MVP 1

Персональний модульний хаб з авторизацією та дашбордом.

## Стек

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Lucide React**
- **Supabase** (Auth: Email + Google + GitHub + MFA TOTP)

## Швидкий старт

### 1. Встановлення залежностей

```bash
npm install
```

### 2. Налаштування змінних середовища

```bash
cp .env.local.example .env.local
```

Заповни `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` — URL твого Supabase проєкту
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Anon Key з Supabase
- `NEXT_PUBLIC_OPENWEATHER_API_KEY` — ключ з openweathermap.org (безкоштовно)
- `NEXT_PUBLIC_SITE_URL` — базовий URL сайту (`http://localhost:3000` для локалки)

### 3. Налаштування Supabase

У Supabase Dashboard:

1. **Authentication → Providers** → увімкни Google і GitHub (додай Client ID та Secret)
2. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000` (dev) або твій Vercel URL
   - Redirect URLs: додай `http://localhost:3000/auth/callback`
3. (Опційно) **Authentication → Multi-Factor Auth** → дозволити TOTP

### 3.1 OTP-коди для реєстрації/відновлення

- Реєстрація та відновлення підтримують підтвердження **по коду з email** (без обовʼязкового переходу за посиланням).
- Для гарних листів відкрий **Authentication → Email Templates** і встав:
  - `supabase/email-templates/signup-otp.html` у шаблон підтвердження signup
  - `supabase/email-templates/recovery-otp.html` у шаблон recovery/reset
- У шаблонах лишай `{{ .Token }}` (код) і `{{ .ConfirmationURL }}` (fallback-посилання).

### 4. Запуск

```bash
npm run dev
```

### 5. P0 перевірки безпеки

```bash
npm run check:p0
```

Команда перевіряє:

- у клієнтських компонентах використовуються лише `NEXT_PUBLIC_*` змінні;
- Supabase REST endpoint повертає CORS заголовок для `NEXT_PUBLIC_SITE_URL`.

## Supabase SQL (RLS + таблиці)

Додано міграцію:

- `supabase/migrations/20260323_000001_p0_saved_admin_rls.sql`

Вона створює таблиці `saved_items`, `user_settings`, `user_roles`, `admin_audit_logs` і явні RLS policy для `SELECT / INSERT / UPDATE / DELETE`.

## Робота з GitHub

### Перший раз (нове репо)

```bash
# 1. Ініціалізувати git (якщо ще не зроблено)
git init

# 2. Додати всі файли
git add .

# 3. Зробити перший коміт
git commit -m "initial commit"

# 4. Підключити GitHub репо (замінити URL на своє)
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# 5. Запушити
git push -u origin main
```

> Репо треба створити на [github.com/new](https://github.com/new) перед кроком 4.

---

### Звичайна робота (після змін у коді)

```bash
# 1. Переглянути що змінилось
git status

# 2. Додати файли
git add .
# або конкретний файл:
git add src/app/login/page.tsx

# 3. Зробити коміт із описом
git commit -m "опис що зробив"

# 4. Завантажити на GitHub
git push
```

---

### Корисні команди

| Команда                 | Що робить                             |
| ----------------------- | ------------------------------------- |
| `git status`            | Показує змінені файли                 |
| `git log --oneline`     | Список останніх комітів               |
| `git diff`              | Показує конкретні зміни в коді        |
| `git pull`              | Завантажити зміни з GitHub            |
| `git checkout -b назва` | Створити нову гілку                   |
| `git stash`             | Тимчасово зберегти незакомічені зміни |

---

## Деплой на Vercel

```bash
npx vercel
```

Додай усі змінні з `.env.local` у Vercel Environment Variables.

## Структура

```
src/
├── app/
│   ├── auth/callback/route.ts   # OAuth callback
│   ├── dashboard/
│   │   ├── layout.tsx           # Захищений layout
│   │   ├── page.tsx             # Головна дашборду
│   │   ├── clouddrop/page.tsx
│   │   ├── notes/page.tsx
│   │   └── settings/page.tsx
│   ├── login/page.tsx           # Сторінка логіну
│   └── layout.tsx
├── components/dashboard/
│   ├── DashboardHeader.tsx      # Хедер з годинником та погодою
│   ├── WeatherWidget.tsx        # Віджет погоди
│   └── AppGrid.tsx              # Сітка додатків
├── lib/supabase/
│   ├── client.ts                # Браузерний клієнт
│   └── server.ts                # Серверний клієнт
└── middleware.ts                # Захист маршрутів
```
