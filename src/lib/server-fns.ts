import { createServerFn } from '@tanstack/react-start';
import { eq, inArray, desc, sql } from 'drizzle-orm';
import { getDb } from './db';
import { hashPassword, comparePassword, signToken } from './auth-utils';
import { generateId } from './id';
import { sendPasswordResetEmail, sendSignupEmail } from './email';
import * as schema from '../../drizzle/schema';

const db = () => getDb();

function parseJsonFields(obj: any, fields: string[]): any {
  if (!obj || typeof obj !== 'object') return obj;
  for (const f of fields) {
    if (typeof obj[f] === 'string') {
      try { obj[f] = JSON.parse(obj[f]); } catch {}
    }
  }
  return obj;
}

function parseRows(rows: any[], fields: string[]): any[] {
  return rows.map((r) => parseJsonFields({ ...r }, fields));
}

// ======================= Auth =======================
export const authSignup = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { name: string; email: string; password: string; origin: string })
  .handler(async (ctx) => {
    const { name, email, password, origin } = ctx.data;
    const existing = await db().select().from(schema.profiles).where(eq(schema.profiles.email, email)).limit(1);
    if (existing.length > 0) throw new Error('An account with this email already exists');
    const passwordHash = await hashPassword(password);
    const id = generateId();
    await db().insert(schema.profiles).values({ id, name, email, passwordHash } as any);
    await db().insert(schema.userRoles).values({ id: generateId(), userId: id, role: 'customer' } as any);
    const verifyToken = generateId();
    const expires = new Date(Date.now() + 86400000).toISOString(); // 24 hours
    await db().update(schema.profiles).set({ verified: false, resetToken: verifyToken, resetTokenExpires: expires } as any)
      .where(eq(schema.profiles.id, id));
    const devLink = `${origin}/verify-email?token=${verifyToken}`;
    sendSignupEmail(email, name, origin, devLink);
    return { devLink };
  });

export const authLogin = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { email: string; password: string })
  .handler(async (ctx) => {
    const { email, password } = ctx.data;
    const rows = await db().select().from(schema.profiles).where(eq(schema.profiles.email, email)).limit(1);
    if (rows.length === 0) throw new Error('Invalid credentials');
    const profile = rows[0] as any;
    if (!profile.passwordHash) throw new Error('Password not set. Use forgot password.');
    const valid = await comparePassword(password, profile.passwordHash);
    if (!valid) throw new Error('Invalid credentials');
    if (!profile.verified) throw new Error('Please verify your email before logging in. Check your inbox or signup link.');
    const roles = await db().select().from(schema.userRoles).where(eq(schema.userRoles.userId, profile.id));
    const role = (roles as any[]).some((r) => r.role === 'admin') ? 'admin' : 'customer';
    if (profile.status === 'banned') throw new Error('Your account is banned. Please contact us.');
    const token = signToken({ userId: profile.id, role });
    return { id: profile.id, name: profile.name ?? '', email: profile.email ?? '', role: role as 'admin' | 'customer', status: profile.status as string, token };
  });

export const authUpdateProfile = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { id: string; name?: string; email?: string; billing?: any })
  .handler(async (ctx) => {
    const { id, name, email, billing } = ctx.data;
    const update: Record<string, any> = {};
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (billing !== undefined) update.billing = billing;
    if (Object.keys(update).length === 0) return;
    await db().update(schema.profiles).set(update as any).where(eq(schema.profiles.id, id));
  });

export const authChangePassword = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { userId: string; currentPassword: string; newPassword: string })
  .handler(async (ctx) => {
    const { userId, currentPassword, newPassword } = ctx.data;
    const rows = await db().select().from(schema.profiles).where(eq(schema.profiles.id, userId)).limit(1);
    if (rows.length === 0) throw new Error('User not found');
    const profile = rows[0] as any;
    if (profile.passwordHash) {
      const valid = await comparePassword(currentPassword, profile.passwordHash);
      if (!valid) throw new Error('Current password is incorrect');
    }
    const hash = await hashPassword(newPassword);
    await db().update(schema.profiles).set({ passwordHash: hash } as any).where(eq(schema.profiles.id, userId));
  });

export const authVerifyEmail = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { token: string })
  .handler(async (ctx) => {
    const { token } = ctx.data;
    const rows = await db().select().from(schema.profiles)
      .where(eq(schema.profiles.resetToken, token))
      .limit(1);
    if (rows.length === 0) throw new Error('Invalid or expired verification link');
    const profile = rows[0] as any;
    if (!profile.resetTokenExpires || new Date(profile.resetTokenExpires).getTime() < Date.now())
      throw new Error('Verification link has expired');
    await db().update(schema.profiles).set({
      verified: true,
      resetToken: null,
      resetTokenExpires: null,
    } as any).where(eq(schema.profiles.id, profile.id));
    const jwtToken = signToken({ userId: profile.id, role: 'customer' });
    return { id: profile.id, name: profile.name ?? '', email: profile.email ?? '', token: jwtToken };
  });

export const authAdminResetPassword = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { userId: string; newPassword: string })
  .handler(async (ctx) => {
    const { userId, newPassword } = ctx.data;
    const hash = await hashPassword(newPassword);
    await db().update(schema.profiles).set({ passwordHash: hash } as any).where(eq(schema.profiles.id, userId));
  });

export const authForgotPassword = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { email: string; origin: string })
  .handler(async (ctx) => {
    const { email, origin } = ctx.data;
    const rows = await db().select().from(schema.profiles).where(eq(schema.profiles.email, email)).limit(1);
    if (rows.length === 0) return { ok: true, devLink: null };
    const profile = rows[0] as any;
    const token = generateId();
    const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour
    await db().update(schema.profiles).set({ resetToken: token, resetTokenExpires: expires } as any)
      .where(eq(schema.profiles.id, profile.id));
    const link = `${origin}/reset-password?token=${token}`;
    await sendPasswordResetEmail(email, link);
    return { ok: true, devLink: process.env.SMTP_HOST ? null : link };
  });

export const authResetPassword = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { token: string; newPassword: string })
  .handler(async (ctx) => {
    const { token, newPassword } = ctx.data;
    const rows = await db().select().from(schema.profiles)
      .where(eq(schema.profiles.resetToken, token))
      .limit(1);
    if (rows.length === 0) throw new Error('Invalid or expired reset token');
    const profile = rows[0] as any;
    if (!profile.resetTokenExpires || new Date(profile.resetTokenExpires).getTime() < Date.now())
      throw new Error('Reset token has expired');
    const hash = await hashPassword(newPassword);
    await db().update(schema.profiles).set({
      passwordHash: hash,
      resetToken: null,
      resetTokenExpires: null,
    } as any).where(eq(schema.profiles.id, profile.id));
  });

// ======================= Data Fetching =======================
export const fetchPublicData = createServerFn({ method: 'GET' }).handler(async () => {
  const [products, categories, tags, coupons, reviews, blog, testimonials, faqs, pages, settings] = await Promise.all([
    db().select().from(schema.products).orderBy(desc(schema.products.createdAt)),
    db().select().from(schema.categories).orderBy(schema.categories.name),
    db().select({ name: schema.tags.name }).from(schema.tags).orderBy(schema.tags.name),
    db().select().from(schema.coupons),
    db().select().from(schema.reviews).orderBy(desc(schema.reviews.createdAt)),
    db().select().from(schema.blogPosts).orderBy(desc(schema.blogPosts.publishedAt)),
    db().select().from(schema.testimonials).orderBy(desc(schema.testimonials.createdAt)),
    db().select().from(schema.faqs).orderBy(schema.faqs.sortOrder),
    db().select().from(schema.pages),
    db().select().from(schema.settings).where(eq(schema.settings.id, 'singleton')).limit(1),
  ]);
  return JSON.parse(JSON.stringify({
    products: parseRows(products as any[], ['tags', 'gallery', 'variations']),
    categories, tags: (tags as any[]).map((t) => t.name),
    coupons, reviews, blog, testimonials, faqs, pages,
    settings: parseJsonFields(settings[0] ?? null, ['brand', 'hero', 'integrations', 'payments']),
  }));
});

export const fetchUserData = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { userId: string | null; isAdmin: boolean })
  .handler(async (ctx) => {
    const { userId, isAdmin } = ctx.data;
    if (!userId) return { users: [], orders: [], contactMessages: [] };
    if (isAdmin) {
      const [profiles, roles, orders, messages] = await Promise.all([
        db().select().from(schema.profiles),
        db().select().from(schema.userRoles),
        db().select().from(schema.orders).orderBy(desc(schema.orders.createdAt)),
        db().select().from(schema.contactMessages).orderBy(desc(schema.contactMessages.createdAt)),
      ]);
      const roleMap = new Map<string, string>();
      for (const r of roles as any[]) roleMap.set(r.userId, r.role);
      const users = (profiles as any[]).map((p) => ({ ...p, role: roleMap.get(p.id) ?? 'customer' }));
      return JSON.parse(JSON.stringify({
        users: parseRows(users, ['billing']),
        orders: parseRows(orders as any[], ['items', 'paymentMeta', 'billing']),
        contactMessages: messages,
      }));
    } else {
      const [profile, orders] = await Promise.all([
        db().select().from(schema.profiles).where(eq(schema.profiles.id, userId)).limit(1),
        db().select().from(schema.orders)
          .where(eq(schema.orders.userId, userId))
          .orderBy(desc(schema.orders.createdAt)),
      ]);
      return JSON.parse(JSON.stringify({
        users: parseRows(profile as any[], ['billing']),
        orders: parseRows(orders as any[], ['items', 'paymentMeta', 'billing']),
        contactMessages: [],
      }));
    }
  });

// ======================= Orders =======================
export const createOrder = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as any)
  .handler(async (ctx) => {
    const d = ctx.data;
    await db().insert(schema.orders).values({ id: generateId(), ...d } as any);
    const id = d.id;
    if (d.coupon_code) {
      await db().update(schema.coupons)
        .set({ usedCount: sql`used_count + 1` } as any)
        .where(eq(schema.coupons.code, d.coupon_code));
    }
    const order = await db().select().from(schema.orders).where(eq(schema.orders.id, id)).limit(1);
    return JSON.parse(JSON.stringify(parseJsonFields(order[0] ?? {}, ['items', 'paymentMeta', 'billing'])));
  });

export const updateOrderStatus = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { id: string; status: string })
  .handler(async (ctx) => {
    const { id, status } = ctx.data;
    await db().update(schema.orders).set({ status } as any).where(eq(schema.orders.id, id));
  });

export const updateOrderDelivered = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { id: string; items: any })
  .handler(async (ctx) => {
    const { id, items } = ctx.data;
    await db().update(schema.orders).set({ status: 'delivered', items } as any).where(eq(schema.orders.id, id));
  });

// ======================= Admin Mutations =======================
export const adminUpsertProduct = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as any)
  .handler(async (ctx) => {
    const d = ctx.data;
    if (d.id) {
      const { id, ...rest } = d;
      await db().update(schema.products).set(rest as any).where(eq(schema.products.id, id));
    } else {
      await db().insert(schema.products).values({ id: generateId(), ...d } as any);
    }
  });

export const adminDeleteProduct = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { id: string })
  .handler(async (ctx) => {
    const { id } = ctx.data;
    await db().delete(schema.products).where(eq(schema.products.id, id));
  });

export const adminUpsertCategory = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as any)
  .handler(async (ctx) => {
    const d = ctx.data;
    if (d.id) {
      const { id, ...rest } = d;
      await db().update(schema.categories).set(rest as any).where(eq(schema.categories.id, id));
    } else {
      await db().insert(schema.categories).values({ id: generateId(), ...d } as any);
    }
  });

export const adminDeleteCategory = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { id: string })
  .handler(async (ctx) => {
    const { id } = ctx.data;
    await db().delete(schema.categories).where(eq(schema.categories.id, id));
  });

export const adminUpsertTags = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { tags: string[] })
  .handler(async (ctx) => {
    const { tags } = ctx.data;
    const existing = await db().select({ name: schema.tags.name }).from(schema.tags);
    const existingNames = (existing as any[]).map((t) => t.name);
    const toAdd = tags.filter((t) => !existingNames.includes(t));
    const toRemove = existingNames.filter((t) => !tags.includes(t));
    if (toAdd.length) await db().insert(schema.tags).values(toAdd.map((name) => ({ id: generateId(), name })));
    if (toRemove.length) await db().delete(schema.tags).where(inArray(schema.tags.name, toRemove));
  });

export const adminUpsertCoupon = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as any)
  .handler(async (ctx) => {
    const d = ctx.data;
    await db().insert(schema.coupons).values({ id: generateId(), ...d } as any);
  });

export const adminDeleteCoupon = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { code: string })
  .handler(async (ctx) => {
    const { code } = ctx.data;
    await db().delete(schema.coupons).where(eq(schema.coupons.code, code));
  });

export const adminUpsertReview = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as any)
  .handler(async (ctx) => {
    const d = ctx.data;
    if (d.id) {
      const { id, ...rest } = d;
      await db().update(schema.reviews).set(rest as any).where(eq(schema.reviews.id, id));
    } else {
      await db().insert(schema.reviews).values({ id: generateId(), ...d } as any);
    }
  });

export const adminDeleteReview = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { id: string })
  .handler(async (ctx) => {
    const { id } = ctx.data;
    await db().delete(schema.reviews).where(eq(schema.reviews.id, id));
  });

export const adminUpsertBlog = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as any)
  .handler(async (ctx) => {
    const d = ctx.data;
    if (d.id) {
      const { id, ...rest } = d;
      await db().update(schema.blogPosts).set(rest as any).where(eq(schema.blogPosts.id, id));
    } else {
      await db().insert(schema.blogPosts).values({ id: generateId(), ...d } as any);
    }
  });

export const adminDeleteBlog = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { id: string })
  .handler(async (ctx) => {
    const { id } = ctx.data;
    await db().delete(schema.blogPosts).where(eq(schema.blogPosts.id, id));
  });

export const adminUpsertTestimonial = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as any)
  .handler(async (ctx) => {
    const d = ctx.data;
    if (d.id) {
      const { id, ...rest } = d;
      await db().update(schema.testimonials).set(rest as any).where(eq(schema.testimonials.id, id));
    } else {
      await db().insert(schema.testimonials).values({ id: generateId(), ...d } as any);
    }
  });

export const adminDeleteTestimonial = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { id: string })
  .handler(async (ctx) => {
    const { id } = ctx.data;
    await db().delete(schema.testimonials).where(eq(schema.testimonials.id, id));
  });

export const adminUpsertFaq = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as any)
  .handler(async (ctx) => {
    const d = ctx.data;
    if (d.id) {
      const { id, ...rest } = d;
      await db().update(schema.faqs).set(rest as any).where(eq(schema.faqs.id, id));
    } else {
      await db().insert(schema.faqs).values({ id: generateId(), ...d } as any);
    }
  });

export const adminDeleteFaq = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { id: string })
  .handler(async (ctx) => {
    const { id } = ctx.data;
    await db().delete(schema.faqs).where(eq(schema.faqs.id, id));
  });

export const adminSavePages = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as any)
  .handler(async (ctx) => {
    const d = ctx.data;
    const slugs = Object.keys(d);
    for (const slug of slugs) {
      const existing = await db().select().from(schema.pages).where(eq(schema.pages.slug, slug)).limit(1);
      if (existing.length > 0) {
        await db().update(schema.pages).set({ content: d[slug] } as any).where(eq(schema.pages.slug, slug));
      } else {
        await db().insert(schema.pages).values({ slug, title: slug, content: d[slug] });
      }
    }
  });

export const adminSetUserStatus = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { id: string; status: string })
  .handler(async (ctx) => {
    const { id, status } = ctx.data;
    await db().update(schema.profiles).set({ status } as any).where(eq(schema.profiles.id, id));
  });

export const adminSaveSettings = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as any)
  .handler(async (ctx) => {
    const d = ctx.data;
    await db().update(schema.settings).set(d as any).where(eq(schema.settings.id, 'singleton'));
  });

export const adminMarkMessageRead = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { id: string; read: boolean })
  .handler(async (ctx) => {
    const { id, read } = ctx.data;
    await db().update(schema.contactMessages).set({ read } as any).where(eq(schema.contactMessages.id, id));
  });

export const adminDeleteMessage = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { id: string })
  .handler(async (ctx) => {
    const { id } = ctx.data;
    await db().delete(schema.contactMessages).where(eq(schema.contactMessages.id, id));
  });

// ======================= Contact / Reviews =======================
export const submitContact = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { name: string; email: string; message: string })
  .handler(async (ctx) => {
    const d = ctx.data;
    await db().insert(schema.contactMessages).values({ id: generateId(), ...d });
  });

export const addReviewFn = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as any)
  .handler(async (ctx) => {
    const d = ctx.data;
    await db().insert(schema.reviews).values({ id: generateId(), ...d } as any);
  });
