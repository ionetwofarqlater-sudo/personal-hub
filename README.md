# 🚀 Personal Hub — MVP 1

Персональний модульний хаб з авторизацією та дашбордом.

## Стек
- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Lucide React**
- **Supabase** (Auth: Google + Email)

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

### 3. Налаштування Supabase
У Supabase Dashboard:
1. **Authentication → Providers** → увімкни Google (додай Client ID та Secret)
2. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000` (dev) або твій Vercel URL
   - Redirect URLs: додай `http://localhost:3000/auth/callback`

### 4. Запуск
```bash
npm run dev
```

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
