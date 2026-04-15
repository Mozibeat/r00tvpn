# RootVPN

Современный production-ready сайт для продажи VPN-подписок с автоматической выдачей доступа через 3x-ui после подтвержденной оплаты.

## Стек

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL
- NextAuth (credentials: email/password)
- Stripe (через payment provider abstraction)
- Server-side API routes + server actions

## Возможности

- Премиальный лендинг (dark SaaS стиль) на русском
- Тарифы 30/90/180/365 дней из БД (легко менять)
- Регистрация / вход / выход
- Личный кабинет:
  - статус подписки
  - дата окончания
  - payment status
  - VPN-ключ + subscription URL + копирование
  - QR-код для быстрого подключения
  - история заказов
- Webhook-процессинг Stripe с верификацией подписи и защитой от дублей
- Автоматическое продление подписки и синхронизация срока в 3x-ui
- Admin panel (роль ADMIN):
  - пользователи/подписки/заказы/платежи
  - поиск по email
  - фильтр по статусу
  - ручное продление и деактивация доступа
- Proxy-мидлварь защиты `/dashboard`, `/admin`, `/api/admin/*`

## Архитектура проекта

```txt
app/
  api/
    auth/
    checkout/
    webhooks/stripe/
    admin/subscriptions/[id]/(extend|deactivate)/
  admin/
  dashboard/
  pricing/
  login/
  register/
  checkout/(success|cancel)/
  faq/
  how-to-connect/
  terms/
  privacy/
  contact/
components/
  forms/
  layout/
  ui/
  checkout-button.tsx
  copy-button.tsx
  pricing-grid.tsx
  qr-code-card.tsx
lib/
  auth.ts
  env.ts
  prisma.ts
  rate-limit.ts
  session.ts
  validators/
services/
  payments/
    provider.ts
    stripe.ts
    types.ts
  subscription.ts
  threeXui.ts
config/
  plans.ts
  site.ts
prisma/
  schema.prisma
  seed.ts
  migrations/0001_init/migration.sql
types/
  index.ts
proxy.ts
```

## Prisma models

- `User`
- `Account` / `Session` / `VerificationToken`
- `Plan`
- `Order`
- `Payment`
- `Subscription`
- `VpnAccess`
- `WebhookEvent`

## Настройка окружения

1. Скопируйте `.env.example` в `.env`.
2. Заполните значения:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `THREEXUI_*` или `3XUI_*`

## Установка и запуск

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Откройте `http://localhost:3000`.

## Тест webhook локально

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Скопируйте `whsec_...` в `STRIPE_WEBHOOK_SECRET`.

## Логика подписки и выдачи доступа

1. Пользователь выбирает тариф.
2. Создается `Order` + `Payment(PENDING)`.
3. Создается Stripe checkout session.
4. Stripe webhook `checkout.session.completed`:
   - проверяет подпись
   - проверяет дубликаты через `WebhookEvent`
   - помечает заказ как `PAID`
   - помечает платеж как `SUCCEEDED`
   - вызывает `provisionVpnAccessForPaidOrder(orderId)`
5. `extendVpnAccessForUser(userId, planId)`:
   - если подписка активна -> продление от `expiresAt`
   - если неактивна/истекла -> продление от текущего момента
6. Через `services/threeXui.ts`:
   - `login()`
   - `getInbounds()`
   - `getClientByEmail()`
   - `createClient()`
   - `updateClientExpiry()`
   - `disableClient()`

## Важные заметки по 3x-ui API

- В зависимости от версии панели endpoint/payload могут отличаться.
- Все интеграционные точки изолированы в `services/threeXui.ts`.
- В файле оставлены комментарии, где менять endpoint и payload под ваш 3x-ui.

## Админ доступ

После `npm run prisma:seed` создается admin:

- email: `admin@rootvpn.local`
- password: `Admin12345!`

Смените пароль и/или удалите тестового админа в production.

## Проверка качества

```bash
npm run lint
npm run build
```
