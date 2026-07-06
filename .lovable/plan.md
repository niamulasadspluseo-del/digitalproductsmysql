# Digital Products Marketplace — Build Plan

A complete frontend-only build using **localStorage** as the data layer so you can test every flow before wiring Laravel/MySQL later. All state is kept in a single typed store module so swapping to a real API later is a one-file change.

---

## 1. Tech Approach

- **Stack:** TanStack Start (already set up) + Tailwind + shadcn/ui
- **Data layer:** `src/lib/store.ts` — typed CRUD over `localStorage` with seeded demo data (products, categories, blog posts, testimonials, FAQs, coupons, settings)
- **Auth:** Mock auth in localStorage (signup, login, forgot password, "email verification" simulated). No real email sending in this phase.
- **Payments:** Stripe + Manual Crypto are simulated — Stripe shows a fake card form, crypto shows wallet addresses + TXID submission form. Orders are created locally.
- **File delivery:** Each product has a `downloadUrl`; after purchase it appears in "My Purchases" and the "email delivery" is simulated with a toast + visible in the user dashboard.

When you move to Laravel later, replace `src/lib/store.ts` calls with API calls — components stay untouched.

---

## 2. Routes

```text
Public:
  /                       Home (hero, featured, new, best-sellers, categories, testimonials, blog, FAQ)
  /shop                   Product grid + search/filter/category
  /product/$slug          Product details + reviews
  /blog                   Blog listing
  /blog/$slug             Blog post
  /about, /contact
  /terms, /privacy, /refund-policy
  /auth                   Sign up / login / forgot password tabs

User (gated):
  /account                Dashboard (purchases, downloads, recent orders)
  /account/orders         Orders list + status tracking
  /account/orders/$id     Order detail
  /account/settings       Profile, password, billing
  /cart, /checkout

Admin (gated, role=admin):
  /admin                  Dashboard (sales, revenue, orders, customers, best sellers)
  /admin/products         List + add/edit/delete + variations + file upload
  /admin/categories       Categories & tags
  /admin/orders           Orders + status flow + refunds
  /admin/customers        List, ban, suspend, purchase history
  /admin/coupons          % / fixed, expiry, usage limit
  /admin/reviews          Approve / delete
  /admin/blog             Blog CRUD
  /admin/testimonials     CRUD
  /admin/faqs             CRUD
  /admin/pages            Edit static pages (terms, privacy, etc.)
  /admin/branding         Logo, favicon, meta title/description
  /admin/integrations     GA4, GTM, Meta Pixel, Google Ads, TikTok, Clarity, custom header/footer scripts
  /admin/payments         Stripe keys + crypto networks/wallets
  /admin/settings         General + SEO
  /admin/analytics        Revenue / product / customer growth charts (recharts)
```

---

## 3. Data Model (localStorage keys)

```text
ds.users        {id, name, email, passwordHash, role, status, verified, billing}
ds.session      {userId}
ds.products     {id, slug, title, desc, price, category, tags, images[], files[], variations[], featured, newRelease, bestSeller}
ds.categories   {id, name, slug}
ds.tags         {id, name}
ds.orders       {id, userId, items[], total, status, payment{method,txid}, createdAt}
ds.coupons      {code, type, value, expiresAt, usageLimit, usedCount}
ds.reviews      {id, productId, userId, rating, text, approved}
ds.blog         {id, slug, title, excerpt, content, coverImage, publishedAt}
ds.testimonials {id, name, role, text, avatar}
ds.faqs         {id, question, answer}
ds.pages        {terms, privacy, refund, about, contact}
ds.settings     {brand{logo,favicon,metaTitle,metaDesc}, integrations{ga4,gtm,metaPixel,...,headerScript,footerScript}, payments{stripe{pk,sk,enabled}, crypto{networks[{name,address,chain}], enabled}}}
ds.cart         {items:[{productId,variationId,qty}], coupon}
```

A single `useStore()` hook subscribes components to changes via a tiny event bus.

---

## 4. Order Status Flow

`Pending → In Progress → Ready For Delivery → Delivered` (+ `Refunded`). Admin advances status from `/admin/orders`. User sees a progress tracker on `/account/orders/$id`. When status reaches **Delivered**, download links unlock.

---

## 5. Design Direction

Modern, conversion-focused commerce — large product cards, generous whitespace, accent color for CTAs, dark-text-on-light default. Built with the design system (semantic tokens in `src/styles.css`) so the admin can later theme it.

---

## 6. Out of Scope (this phase, by your instruction)

- Real email sending, real Stripe charges, real on-chain verification
- Server-side auth / RLS — added when you wire Laravel + MySQL
- File hosting — uploads are kept as data-URLs or external URLs in localStorage

---

## 7. Build Order

1. Store module + seed data + auth + route guards
2. Public site (home, shop, product, blog, static pages)
3. Cart, checkout, Stripe-mock, crypto-mock, order creation, email-mock
4. User dashboard, orders, reviews, settings
5. Admin: products, categories, orders, customers, coupons, reviews
6. Admin: blog, testimonials, FAQs, static pages, branding
7. Admin: integrations (inject scripts), payments, settings, analytics charts

This is a large scope (~40+ files). I'll build it in the order above and ship in this single turn. Ready to start?
