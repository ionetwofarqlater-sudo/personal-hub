# TODO List — Personal Hub

> Останнє оновлення: 2026-03-23
> Легенда: P0 = блокер, P1 = важливо, P2 = бажано

---

## P0 — Критично (блокери)

- [x] Оновити `next` і `eslint-config-next` до безпечного патча в межах `14.x`
- [x] Заповнити `.env.local` реальними `NEXT_PUBLIC_SUPABASE_URL` і `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] Перевірити Supabase Redirect URLs (`http://localhost:3000/auth/callback` + прод URL)
- [x] Увімкнути RLS для всіх таблиць користувацьких даних
- [x] Прописати явні RLS policies (`SELECT / INSERT / UPDATE / DELETE`) для кожної таблиці
- [x] Переконатися, що секрети не потрапляють у клієнт (лише `NEXT_PUBLIC_*`)
- [x] Перевірити CORS і Allowed Origins у Supabase для прод URL


---

## Auth і акаунт

- [x] Додати повний flow підтвердження email + resend
- [x] Реалізувати forgot/reset password
- [x] Полірувати session UX (редіректи для auth/guest)
- [x] Додати сторінку профілю (ім'я, аватар, timezone)
- [x] Додати базові account security дії (зміна пароля, активні сесії)
- [x] Реалізувати logout з усіх сесій (revoke всіх Supabase refresh tokens)
- [x] Додати OAuth провайдери (Google / GitHub)
- [x] Увімкнути Supabase Auth MFA (TOTP) як опцію в налаштуваннях акаунту
- [x] Додати rate limiting на auth endpoints (login, forgot password)


---

## Admin Dashboard

- [ ] Визначити ролі та права доступу (мінімум: `admin`, `user`)
- [ ] Додати таблицю ролей (`user_roles`) і прив'язку до `auth.users`
- [ ] Захистити `admin` роут (`/dashboard/admin`) через middleware + server-side перевірку ролі
- [ ] Додати RLS policies для адмін-операцій (окремо від user-політик)
- [ ] Реалізувати базові адмін-в'ю: список користувачів, статус акаунта, дата реєстрації
- [ ] Додати адмін-дії: блок/розблок, примусовий logout, reset MFA (лише через сервер)
- [ ] Додати аудит-лог адмін-дій (`admin_audit_logs`: `actor_id`, `action`, `target_user_id`, `created_at`)
- [ ] Додати safe-guard UX: confirm dialogs для небезпечних дій + toast/error стани
- [ ] Додати сторінку доступу `403` для не-адмінів


---

## База даних (Supabase)

- [ ] Створити таблиці `saved_items`, `user_settings`
- [ ] Додати поля `created_at`, `updated_at`, `user_id` до всіх таблиць
- [ ] Додати soft delete (`deleted_at`) там, де потрібно
- [ ] Розглянути `ulid` або `uuid v7` замість дефолтного uuid
- [ ] Додати індекси під ключові запити
- [ ] Перейти на міграції схеми (SQL migrations)
- [ ] Розділити Supabase dev / prod проекти


---

## Модулі продукту

- [x] **Settings MVP**: тема / мова / місто / формат часу
- [ ] Персоналізація dashboard (порядок плиток)
- [ ] Quick actions (`+`) для швидкого створення сейву
- [ ] Почистити код і тексти від згадок старих модулів (`Notes`, `CloudDrop`) перед заміною на єдиний `Saved`


---

## UI/UX

- [ ] Додати skeleton/loading стани
- [ ] Додати дружні error стани + retry
- [ ] Додати empty стани з CTA
- [ ] Покращити accessibility (`aria`, focus trap, keyboard nav)
- [ ] Перевірити responsive брейкпоінти
- [ ] Перевірити, чи не витікають чутливі дані через `console.log` у прод-білді


---

## Безпека

- [x] Налаштувати CSP (Content Security Policy) заголовки у `next.config`
- [x] Перевірити `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`
- [ ] Переконатися, що `NEXT_PUBLIC_*` не містять нічого приватного


---

## Якість і надійність

- [x] Винести доменні типи в `src/types/*`
- [ ] Додати валідацію форм (`zod`) + server-side валідацію
- [ ] Централізувати обробку помилок API/auth
- [ ] Додати структурований лог на сервері
- [ ] Додати retry/backoff для зовнішніх API (погода тощо)


---

## Тести

- [ ] Unit тести утиліт і компонентів (Vitest / Jest)
- [ ] Integration тести auth/middleware
- [ ] E2E smoke-сценарії ключових flow (Playwright)
- [ ] CI smoke checks (`lint`, `build`, critical routes)


---

## Продуктивність (Perf)

- [ ] Зменшити кількість `use client`, де можливо
- [ ] Додати lazy/code-splitting для важких блоків
- [ ] Додати `@next/bundle-analyzer` і переглянути важкі чанки
- [ ] Дополірувати оптимізацію зображень (`next/image`)
- [ ] Додати стратегії cache/revalidation (`revalidatePath`, `revalidateTag`)


---

## DevEx / Процеси

- [x] Налаштувати `prettier` + `lint-staged` + pre-commit hooks (Husky)
- [x] Додати GitHub Actions CI (`lint`, `build`, тести)
- [x] Підключити Dependabot або Renovate для автооновлень залежностей
- [ ] Додати `knip` для виявлення невикористаного коду
- [ ] Розширити `README.md`: повний setup, auth, env
- [ ] Додати `CONTRIBUTING.md`
- [ ] Додати issue templates (bug report, feature request)
- [ ] Вести короткий `CHANGELOG.md`


---

## Продакшн

- [x] Налаштувати Vercel проект і preview environments
- [x] Виконати production deploy (`npx vercel --prod --yes`) і перевірити health endpoint
- [ ] Підключити custom domain + HTTPS
- [ ] Додати моніторинг помилок (Sentry) + налаштувати alerts і пороги
- [x] Додати `robots.txt` і `sitemap.xml` (якщо є публічні сторінки)
- [ ] Налаштувати бекапи БД (Supabase scheduled backups)


---

## Backlog / Відкладено

> Ідеї, які не беремо зараз, але не хочемо забути.

- [ ] PWA / offline режим
- [ ] Push-сповіщення
- [ ] Публічні профілі користувачів
- [ ] API key management для зовнішніх інтеграцій
- [ ] Мобільний застосунок (React Native / Expo)
- [ ] Collaboration (shared saved items)


---

## Поточний спринт

- [x] Оновити Next.js до патча `14.x` і перевірити сумісність
- [x] Заповнити `.env.local` і перевірити Supabase redirect URLs
- [x] Написати RLS policies для таблиць
- [x] Додати forgot-password flow
- [x] Налаштувати CI (`npm run lint` + `npm run build`)
- [x] Зробити production deploy на Vercel і перевірити `/api/health`
- [x] Зафіксувати результат у цьому файлі (позначити виконане ✅)

### Примітка

- `next` оновлено до `^14.2.35`, `eslint-config-next` до `^14.2.35`.
- Додано CI workflow: `.github/workflows/ci.yml` (`npm ci`, `npm run lint`, `npm run build`).
- Пункти з `.env.local`, Supabase Redirect URLs і RLS потребують ручного налаштування у твоєму Supabase проєкті.
- Додано `deploy-vercel` workflow: `.github/workflows/deploy-vercel.yml` (preview для PR, production для push у `main/master`).
- Додано автооновлення залежностей через `.github/dependabot.yml`.
- Додано health endpoint: `GET /api/health` для smoke-перевірки деплою.
- Product-фокус змінено: цільовий один модуль `Saved` у стилі Telegram (деталізація в окремому `TODO.saved.md`).
- Додано P0 migration: `supabase/migrations/20260323_000001_p0_saved_admin_rls.sql` (таблиці + явні RLS policy).
- Додано перевірки: `npm run check:client-env`, `npm run check:supabase-cors`, `npm run check:p0`.
- `npm run check:p0` успішно пройшов після оновлення `.env.local` (client env + Supabase CORS).

