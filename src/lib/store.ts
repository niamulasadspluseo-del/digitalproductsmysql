import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector";
import * as fns from "@/lib/server-fns";
import { generateId } from "@/lib/id";

export type Role = "admin" | "customer";
export type UserStatus = "active" | "suspended" | "banned";
export type OrderStatus = "Pending" | "Payment Received" | "Payment Not Received" | "In Progress" | "Ready For Delivery" | "Delivered" | "Refunded" | "Cancel";

export interface User {
  id: string; name: string; email: string; password: string;
  role: Role; status: UserStatus; verified: boolean;
  billing?: { country?: string; address?: string; city?: string; zip?: string };
  createdAt: number;
}
export interface Variation { id: string; name: string; price: number }
export interface Product {
  id: string; slug: string; title: string; description: string;
  price: number; salePrice?: number;
  category: string; tags: string[];
  image: string; gallery?: string[];
  fileUrl: string;
  variations: Variation[];
  featured?: boolean; newRelease?: boolean; bestSeller?: boolean;
  createdAt: number;
}
export interface Category { id: string; name: string; slug: string; icon?: string }
export interface CartItem { productId: string; variationId?: string; qty: number }
export interface Cart { items: CartItem[]; couponCode?: string }
export interface OrderItem { productId: string; title: string; price: number; qty: number; variationName?: string; fileUrl: string }
export interface Order {
  id: string; userId: string; userName: string; userEmail: string;
  telegram?: string; whatsapp?: string;
  items: OrderItem[]; subtotal: number; discount: number; total: number;
  status: OrderStatus;
  payment: { method: "crypto"; txid?: string; network?: string; cardLast4?: string };
  createdAt: number;
}
export interface Coupon {
  code: string; type: "percent" | "fixed"; value: number;
  expiresAt?: number; usageLimit?: number; usedCount: number;
}
export interface Review { id: string; productId: string; userId: string; userName: string; rating: number; text: string; approved: boolean; createdAt: number }
export interface BlogPost { id: string; slug: string; title: string; excerpt: string; content: string; cover: string; author: string; publishedAt: number }
export interface Testimonial { id: string; name: string; role: string; text: string; avatar?: string; rating: number }
export interface FAQ { id: string; question: string; answer: string }
export interface Pages { terms: string; privacy: string; refund: string; about: string; contact: string }
export interface CryptoNetwork { id: string; name: string; chain: string; address: string }
export interface Settings {
  brand: { name: string; logo?: string; favicon?: string; metaTitle: string; metaDesc: string };
  hero: { eyebrow: string; title: string; subtitle: string; ctaText: string };
  integrations: { ga4?: string; gtm?: string; metaPixel?: string; googleAdsId?: string; tiktokPixel?: string; clarityId?: string; headerScript?: string; footerScript?: string };
  payments: {
    crypto: { enabled: boolean; networks: CryptoNetwork[] };
  };
}
export interface ContactMessage { id: string; name: string; email: string; message: string; read: boolean; createdAt: number }

interface DB {
  users: User[]; sessionUserId: string | null; sessionRole: Role;
  products: Product[]; categories: Category[]; tags: string[];
  orders: Order[]; coupons: Coupon[]; reviews: Review[];
  blog: BlogPost[]; testimonials: Testimonial[]; faqs: FAQ[];
  pages: Pages; settings: Settings; cart: Cart;
  contactMessages: ContactMessage[];
  ready: boolean;
}

const CART_KEY = "ds.cart.v1";
const SETTINGS_KEY = "ds.settings.v1";
const TOKEN_KEY = "ds.auth.token";
const isBrowser = typeof window !== "undefined";

const defaultSettings: Settings = {
  brand: { name: "PixelMart", metaTitle: "PixelMart — Premium Digital Products", metaDesc: "Templates, ebooks, software and courses for creators and founders." },
  hero: { eyebrow: "Premium Digital Goods", title: "Build faster with battle-tested digital products", subtitle: "Templates, ebooks, software and courses crafted by working pros. Instant download, lifetime updates.", ctaText: "Shop products" },
  integrations: {},
  payments: { crypto: { enabled: true, networks: [] } },
};

const empty = (): DB => ({
  users: [], sessionUserId: null, sessionRole: 'customer',
  products: [], categories: [], tags: [],
  orders: [], coupons: [], reviews: [],
  blog: [], testimonials: [], faqs: [],
  pages: { terms: "", privacy: "", refund: "", about: "", contact: "" },
  settings: defaultSettings,
  cart: { items: [] },
  contactMessages: [],
  ready: false,
});

let db: DB = empty();
const listeners = new Set<() => void>();

function emit() {
  db = { ...db,
    users: [...db.users], products: [...db.products], categories: [...db.categories], tags: [...db.tags],
    orders: [...db.orders], coupons: [...db.coupons], reviews: [...db.reviews],
    blog: [...db.blog], testimonials: [...db.testimonials], faqs: [...db.faqs],
    pages: { ...db.pages }, settings: { ...db.settings },
    cart: { ...db.cart, items: [...db.cart.items] },
    contactMessages: [...db.contactMessages],
  };
  if (isBrowser) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(db.cart)); } catch {}
  }
  listeners.forEach((l) => l());
}

export function subscribe(fn: () => void) {
  if (isBrowser && !hydrated) hydrate();
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
export function snapshot(): DB { return db; }
function shallowEq(a: any, b: any): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!Object.is(a[i], b[i])) return false;
    return true;
  }
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) if (!Object.is(a[k], b[k])) return false;
  return true;
}
export function useStore<T>(selector: (s: DB) => T): T {
  return useSyncExternalStoreWithSelector(subscribe, () => db, () => db, selector, shallowEq);
}

// ---------- Mapping helpers ----------
const ts = (d: string | null | undefined) => d ? new Date(d).getTime() : Date.now();
const statusOut = (s: string): OrderStatus => ({
  pending: "Pending", payment_received: "Payment Received", payment_not_received: "Payment Not Received",
  in_progress: "In Progress", ready_for_delivery: "Ready For Delivery",
  delivered: "Delivered", refunded: "Refunded", cancel: "Cancel",
} as Record<string, OrderStatus>)[s] ?? "Pending";
const statusIn = (s: OrderStatus): string => ({
  "Pending": "pending", "Payment Received": "payment_received", "Payment Not Received": "payment_not_received",
  "In Progress": "in_progress", "Ready For Delivery": "ready_for_delivery",
  "Delivered": "delivered", "Refunded": "refunded", "Cancel": "cancel",
}[s]);

function rowToProduct(r: any): Product {
  return {
    id: r.id, slug: r.slug, title: r.title, description: r.description ?? "",
    price: Number(r.price), salePrice: r.salePrice != null ? Number(r.salePrice) : undefined,
    category: r.categorySlug ?? "", tags: r.tags ?? [],
    image: r.image ?? "", gallery: r.gallery ?? [],
    fileUrl: r.fileUrl ?? "", variations: r.variations ?? [],
    featured: !!r.featured, newRelease: !!r.newRelease, bestSeller: !!r.bestSeller,
    createdAt: ts(r.createdAt),
  };
}
function productToRow(p: Product): any {
  const row: any = {
    slug: p.slug || p.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    title: p.title, description: p.description,
    price: p.price, salePrice: p.salePrice ?? null,
    categorySlug: p.category, tags: p.tags, image: p.image, gallery: p.gallery ?? [],
    fileUrl: p.fileUrl, variations: p.variations,
    featured: !!p.featured, newRelease: !!p.newRelease, bestSeller: !!p.bestSeller,
  };
  if (p.id) row.id = p.id;
  return row;
}
function rowToOrder(r: any): Order {
  const meta = r.paymentMeta ?? {};
  return {
    id: r.id, userId: r.userId ?? "", userName: r.userName ?? "", userEmail: r.userEmail ?? "",
    telegram: r.telegram ?? undefined, whatsapp: r.whatsapp ?? undefined,
    items: r.items ?? [], subtotal: Number(r.subtotal), discount: Number(r.discount), total: Number(r.total),
    status: statusOut(r.status),
    payment: { method: r.paymentMethod ?? "crypto", txid: r.paymentTxid ?? undefined, network: meta.network, cardLast4: meta.cardLast4 },
    createdAt: ts(r.createdAt),
  };
}
function rowToCoupon(r: any): Coupon {
  return { code: r.code, type: r.type, value: Number(r.value),
    expiresAt: r.expiresAt ? new Date(r.expiresAt).getTime() : undefined,
    usageLimit: r.usageLimit ?? undefined, usedCount: r.usedCount };
}
function rowToReview(r: any): Review {
  return { id: r.id, productId: r.productId, userId: r.userId, userName: r.userName ?? "User",
    rating: r.rating, text: r.text ?? "", approved: !!r.approved, createdAt: ts(r.createdAt) };
}
function rowToBlog(r: any): BlogPost {
  return { id: r.id, slug: r.slug, title: r.title, excerpt: r.excerpt ?? "", content: r.content ?? "",
    cover: r.cover ?? "", author: r.author ?? "", publishedAt: ts(r.publishedAt ?? r.createdAt) };
}
function rowToTestimonial(r: any): Testimonial {
  return { id: r.id, name: r.name, role: r.role ?? "", text: r.text, avatar: r.avatar ?? undefined, rating: r.rating ?? 5 };
}
function rowToFaq(r: any): FAQ { return { id: r.id, question: r.question, answer: r.answer }; }
function rowToCategory(r: any): Category { return { id: r.id, name: r.name, slug: r.slug, icon: r.icon ?? undefined }; }
function rowToMessage(r: any): ContactMessage {
  return { id: r.id, name: r.name, email: r.email, message: r.message, read: !!r.read, createdAt: ts(r.createdAt) };
}

function profileToUser(p: any, role: Role): User {
  return {
    id: p.id, name: p.name ?? p.email ?? "User", email: p.email ?? "", password: "",
    role, status: p.status ?? "active", verified: !!p.verified, billing: p.billing ?? undefined,
    createdAt: ts(p.createdAt),
  };
}

// ---------- Token ----------
export function getToken(): string | null {
  if (!isBrowser) return null;
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
function setToken(token: string | null) {
  if (!isBrowser) return;
  try { if (token) localStorage.setItem(TOKEN_KEY, token); else localStorage.removeItem(TOKEN_KEY); } catch {}
}
function parseToken(token: string): { userId: string; role: string } | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch { return null; }
}

// ---------- Hydration ----------
let hydrated = false;

async function loadPublicData() {
  const result = await fns.fetchPublicData();
  db.products = (result.products ?? []).map(rowToProduct);
  db.categories = (result.categories ?? []).map(rowToCategory);
  db.tags = (result.tags ?? []).map((t: string) => t);
  db.coupons = (result.coupons ?? []).map(rowToCoupon);
  db.reviews = (result.reviews ?? []).map(rowToReview);
  db.blog = (result.blog ?? []).map(rowToBlog);
  db.testimonials = (result.testimonials ?? []).map(rowToTestimonial);
  db.faqs = (result.faqs ?? []).map(rowToFaq);
  const pageMap: Pages = { terms: "", privacy: "", refund: "", about: "", contact: "" };
  for (const p of (result.pages ?? [])) {
    if (p.slug in pageMap) (pageMap as any)[p.slug] = p.content ?? "";
  }
  db.pages = pageMap;
  if (result.settings) {
    const s = result.settings as any;
    db.settings = {
      brand: { ...defaultSettings.brand, ...(s.brand ?? {}) },
      hero: { ...defaultSettings.hero, ...(s.hero ?? {}) },
      integrations: s.integrations ?? {},
      payments: { crypto: { enabled: true, networks: [], ...(s.payments?.crypto ?? {}) } },
    };
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(db.settings)); } catch {}
  }
}

async function loadUserScopedData() {
  const token = getToken();
  if (!token) {
    db.sessionUserId = null; db.sessionRole = 'customer';
    db.users = []; db.orders = []; db.contactMessages = [];
    return;
  }
  const parsed = parseToken(token);
  if (!parsed) { db.sessionUserId = null; db.sessionRole = 'customer'; return; }
  db.sessionUserId = parsed.userId;
  db.sessionRole = parsed.role as Role;
  const isAdmin = parsed.role === 'admin';
  try {
    const result = await fns.fetchUserData({ data: { userId: parsed.userId, isAdmin } });
    if (isAdmin) {
      db.users = (result.users ?? []).map((p: any) => profileToUser(p, p.role));
      db.orders = (result.orders ?? []).map(rowToOrder);
      db.contactMessages = (result.contactMessages ?? []).map(rowToMessage);
    } else {
      const userData = result.users?.length ? result.users[0] : null;
      db.users = userData ? [profileToUser(userData, 'customer')] : [];
      db.orders = (result.orders ?? []).map(rowToOrder);
      db.contactMessages = [];
    }
  } catch {
    db.sessionUserId = null; db.sessionRole = 'customer';
    setToken(null);
  }
}

export function hydrate() {
  if (!isBrowser || hydrated) return;
  hydrated = true;
  (async () => {
    try { const raw = localStorage.getItem(CART_KEY); if (raw) db.cart = JSON.parse(raw); } catch {}
    try { const raw = localStorage.getItem(SETTINGS_KEY); if (raw) { db.settings = JSON.parse(raw); emit(); } } catch {}
    await Promise.all([loadPublicData(), loadUserScopedData()]);
    db.ready = true;
    emit();
  })();
}

// ---------- Auth ----------
export const auth = {
  async signup(name: string, email: string, password: string) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const result = await fns.authSignup({ data: { name, email, password, origin } });
    return result.devLink as string | null;
  },
  async login(email: string, password: string) {
    const result = await fns.authLogin({ data: { email, password } });
    setToken(result.token);
    db.sessionUserId = result.id;
    db.sessionRole = result.role as Role;
    await loadUserScopedData();
    emit();
    const user = profileToUser({ id: result.id, name: result.name, email: result.email, status: result.status }, result.role as Role);
    if (user.email.toLowerCase() !== email.toLowerCase()) {
      setToken(null); db.sessionUserId = null; db.sessionRole = 'customer';
      emit();
      throw new Error("Login failed: email mismatch. Please contact support.");
    }
    if (user.status === "banned") {
      setToken(null); db.sessionUserId = null; db.sessionRole = 'customer';
      emit();
      throw new Error("Your account is banned. Please contact us.");
    }
    return user;
  },
  async logout() {
    setToken(null);
    db.sessionUserId = null; db.sessionRole = 'customer';
    db.users = []; db.orders = []; db.contactMessages = [];
    emit();
  },
  async forgot(email: string): Promise<string | null> {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const res = await fns.authForgotPassword({ data: { email, origin } });
    return (res as any)?.devLink ?? null;
  },
  async resetPassword(token: string, newPassword: string) {
    await fns.authResetPassword({ data: { token, newPassword } });
  },
  async verifyEmail(token: string) {
    const result = await fns.authVerifyEmail({ data: { token } });
    setToken(result.token);
    db.sessionUserId = result.id;
    db.sessionRole = 'customer';
    await loadUserScopedData();
    emit();
  },
  current(): User | null {
    if (!db.sessionUserId) return null;
    return db.users.find((u) => u.id === db.sessionUserId) ?? null;
  },
  async updatePassword(userId: string, newPassword: string) {
    await fns.authAdminResetPassword({ data: { userId, newPassword } });
  },
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    await fns.authChangePassword({ data: { userId, currentPassword, newPassword } });
  },
  async updateProfile(patch: Partial<User>) {
    if (!db.sessionUserId) return;
    await fns.authUpdateProfile({ data: { id: db.sessionUserId, ...patch } as any });
    db.users = db.users.map((u) => u.id === db.sessionUserId ? { ...u, ...patch } : u);
    emit();
  },
};

// ---------- Cart (local) ----------
export const cart = {
  add(productId: string, variationId?: string, qty = 1, openDrawer = true) {
    const items = db.cart.items.slice();
    const idx = items.findIndex((i) => i.productId === productId && i.variationId === variationId);
    if (idx >= 0) items[idx] = { ...items[idx], qty: items[idx].qty + qty };
    else items.push({ productId, variationId, qty });
    db.cart = { ...db.cart, items }; emit(); if (openDrawer) cartDrawer.open();
  },
  remove(productId: string, variationId?: string) {
    db.cart = { ...db.cart, items: db.cart.items.filter((i) => !(i.productId === productId && i.variationId === variationId)) };
    emit();
  },
  setQty(productId: string, variationId: string | undefined, qty: number) {
    db.cart = { ...db.cart, items: db.cart.items.map((i) => i.productId === productId && i.variationId === variationId ? { ...i, qty: Math.max(1, qty) } : i) };
    emit();
  },
  clear() { db.cart = { items: [] }; emit(); },
  applyCoupon(code: string) {
    const c = db.coupons.find((x) => x.code.toLowerCase() === code.toLowerCase());
    if (!c) throw new Error("Invalid coupon");
    if (c.expiresAt && c.expiresAt < Date.now()) throw new Error("Coupon expired");
    if (c.usageLimit && c.usedCount >= c.usageLimit) throw new Error("Coupon limit reached");
    db.cart = { ...db.cart, couponCode: c.code }; emit();
  },
  removeCoupon() { db.cart = { ...db.cart, couponCode: undefined }; emit(); },
};

export function totals(c: Cart = db.cart) {
  const items = c.items.map((it) => {
    const p = db.products.find((x) => x.id === it.productId);
    if (!p) return null;
    const v = it.variationId ? p.variations.find((x) => x.id === it.variationId) : undefined;
    const price = v?.price ?? p.salePrice ?? p.price;
    return { product: p, variation: v, qty: it.qty, line: price * it.qty, unit: price };
  }).filter(Boolean) as Array<{ product: Product; variation?: Variation; qty: number; line: number; unit: number }>;
  const subtotal = items.reduce((s, i) => s + i.line, 0);
  let discount = 0;
  const coupon = c.couponCode ? db.coupons.find((x) => x.code === c.couponCode) : undefined;
  if (coupon) discount = coupon.type === "percent" ? subtotal * (coupon.value / 100) : Math.min(subtotal, coupon.value);
  return { items, subtotal, discount, total: Math.max(0, subtotal - discount), coupon };
}

// ---------- Orders ----------
export const orders = {
  async create(payment: Order["payment"], contact?: { name: string; email: string; telegram?: string; whatsapp?: string }) {
    const user = auth.current(); if (!user) throw new Error("Login required");
    if (user.status === "suspended") throw new Error("Your account is suspended. Please contact us.");
    if (user.status === "banned") throw new Error("Your account is banned. Please contact us.");
    const t = totals(); if (!t.items.length) throw new Error("Cart is empty");
    const items: OrderItem[] = t.items.map((i) => ({
      productId: i.product.id, title: i.product.title, price: i.unit, qty: i.qty,
      variationName: i.variation?.name, fileUrl: i.product.fileUrl,
    }));
    const orderData = {
      id: generateId(),
      userId: user.id, userName: contact?.name ?? user.name, userEmail: contact?.email ?? user.email,
      telegram: contact?.telegram ?? null, whatsapp: contact?.whatsapp ?? null,
      items: items as any, subtotal: t.subtotal, discount: t.discount, total: t.total,
      couponCode: t.coupon?.code ?? null, status: "pending",
      paymentMethod: payment.method, paymentTxid: payment.txid ?? null,
      paymentMeta: { network: payment.network ?? null, cardLast4: payment.cardLast4 ?? null } as any,
    };
    const result = await fns.createOrder({ data: orderData });
    const order = rowToOrder(result);
    db.orders = [order, ...db.orders];
    db.cart = { items: [] };
    emit();
    return order;
  },
  async setStatus(id: string, status: OrderStatus) {
    db.orders = db.orders.map((o) => o.id === id ? { ...o, status } : o); emit();
    try { await fns.updateOrderStatus({ data: { id, status: statusIn(status) } }); } catch {}
  },
  async setDeliveredWithFiles(id: string, fileUrls: Record<string, string>) {
    const order = db.orders.find((o) => o.id === id);
    if (!order) return;
    const updatedItems = order.items.map((item) => {
      const url = fileUrls[item.productId];
      return url ? { ...item, fileUrl: url } : item;
    });
    db.orders = db.orders.map((o) =>
      o.id === id ? { ...o, status: "Delivered" as OrderStatus, items: updatedItems } : o
    );
    emit();
    try { await fns.updateOrderDelivered({ data: { id, items: updatedItems as any } }); } catch {}
  },
  forUser(userId: string) { return db.orders.filter((o) => o.userId === userId); },
  delivered(userId: string) { return db.orders.filter((o) => o.userId === userId && o.status === "Delivered"); },
};

// ---------- Admin ----------
async function refreshAll() { await Promise.all([loadPublicData(), loadUserScopedData()]); emit(); }

export const admin = {
  async saveProduct(p: Product) {
    const row: any = productToRow(p);
    await fns.adminUpsertProduct({ data: row });
    await refreshAll();
  },
  async deleteProduct(id: string) {
    await fns.adminDeleteProduct({ data: { id } });
    db.products = db.products.filter((x) => x.id !== id); emit();
  },
  async saveCategory(c: Category) {
    const row: any = { name: c.name, slug: c.slug || c.name.toLowerCase().replace(/\s+/g, "-"), icon: c.icon ?? null };
    if (c.id) row.id = c.id;
    await fns.adminUpsertCategory({ data: row });
    await refreshAll();
  },
  async deleteCategory(id: string) {
    await fns.adminDeleteCategory({ data: { id } });
    db.categories = db.categories.filter((c) => c.id !== id); emit();
  },
  async saveTags(tags: string[]) {
    await fns.adminUpsertTags({ data: { tags } });
    db.tags = tags; emit();
  },
  async saveCoupon(c: Coupon) {
    const row: any = {
      id: generateId(),
      code: c.code, type: c.type, value: c.value,
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString() : null,
      usageLimit: c.usageLimit ?? null, usedCount: c.usedCount,
    };
    await fns.adminUpsertCoupon({ data: row });
    await refreshAll();
  },
  async deleteCoupon(code: string) {
    await fns.adminDeleteCoupon({ data: { code } });
    db.coupons = db.coupons.filter((c) => c.code !== code); emit();
  },
  async saveReview(r: Review) {
    const row: any = {
      productId: r.productId, userId: r.userId, userName: r.userName,
      rating: r.rating, text: r.text, approved: r.approved,
    };
    if (r.id) row.id = r.id;
    await fns.adminUpsertReview({ data: row });
    await refreshAll();
  },
  async deleteReview(id: string) {
    await fns.adminDeleteReview({ data: { id } });
    db.reviews = db.reviews.filter((r) => r.id !== id); emit();
  },
  async saveBlog(p: BlogPost) {
    const row: any = {
      slug: p.slug || p.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      title: p.title, excerpt: p.excerpt, content: p.content, cover: p.cover, author: p.author,
      publishedAt: new Date(p.publishedAt || Date.now()).toISOString(),
    };
    if (p.id) row.id = p.id;
    await fns.adminUpsertBlog({ data: row });
    await refreshAll();
  },
  async deleteBlog(id: string) {
    await fns.adminDeleteBlog({ data: { id } });
    db.blog = db.blog.filter((b) => b.id !== id); emit();
  },
  async saveTestimonial(t: Testimonial) {
    const row: any = { name: t.name, role: t.role, text: t.text, avatar: t.avatar ?? null, rating: t.rating };
    if (t.id) row.id = t.id;
    await fns.adminUpsertTestimonial({ data: row });
    await refreshAll();
  },
  async deleteTestimonial(id: string) {
    await fns.adminDeleteTestimonial({ data: { id } });
    db.testimonials = db.testimonials.filter((t) => t.id !== id); emit();
  },
  async saveFaq(f: FAQ) {
    const row: any = { question: f.question, answer: f.answer };
    if (f.id) row.id = f.id;
    await fns.adminUpsertFaq({ data: row });
    await refreshAll();
  },
  async deleteFaq(id: string) {
    await fns.adminDeleteFaq({ data: { id } });
    db.faqs = db.faqs.filter((f) => f.id !== id); emit();
  },
  async savePages(p: Pages) {
    await fns.adminSavePages({ data: p });
    db.pages = { ...p }; emit();
  },
  async adminResetPassword(userId: string, newPassword: string) {
    await fns.authAdminResetPassword({ data: { userId, newPassword } });
  },
  async saveUser(_u: User) {},
  async deleteUser(_id: string) {},
  async setUserStatus(id: string, s: UserStatus) {
    await fns.adminSetUserStatus({ data: { id, status: s } });
    db.users = db.users.map((u) => u.id === id ? { ...u, status: s } : u); emit();
  },
  async saveSettings(s: Settings) {
    await fns.adminSaveSettings({ data: {
      brand: s.brand as any, hero: s.hero as any, integrations: s.integrations as any, payments: s.payments as any,
    } });
    db.settings = s; emit();
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
  },
  async markMessageRead(id: string, read = true) {
    await fns.adminMarkMessageRead({ data: { id, read } });
    db.contactMessages = db.contactMessages.map((m) => m.id === id ? { ...m, read } : m); emit();
  },
  async deleteMessage(id: string) {
    await fns.adminDeleteMessage({ data: { id } });
    db.contactMessages = db.contactMessages.filter((m) => m.id !== id); emit();
  },
};

export async function submitContactMessage(name: string, email: string, message: string) {
  await fns.submitContact({ data: { name, email, message } });
}

export async function addReview(productId: string, rating: number, text: string) {
  const u = auth.current(); if (!u) throw new Error("Login to review");
  await fns.addReviewFn({ data: {
    id: generateId(), productId: productId, userId: u.id, userName: u.name, rating, text,
  } });
  await loadPublicData(); emit();
}

export function resetStore() {}

// ---------- Cart Drawer ----------
let drawerOpen = false;
const drawerListeners = new Set<() => void>();
export const cartDrawer = {
  open() { drawerOpen = true; drawerListeners.forEach((l) => l()); },
  close() { drawerOpen = false; drawerListeners.forEach((l) => l()); },
  set(v: boolean) { drawerOpen = v; drawerListeners.forEach((l) => l()); },
};
export function useCartDrawer(): [boolean, (v: boolean) => void] {
  const o = useSyncExternalStoreWithSelector(
    (fn) => { drawerListeners.add(fn); return () => { drawerListeners.delete(fn); }; },
    () => drawerOpen, () => false, (s) => s, Object.is,
  );
  return [o, cartDrawer.set];
}
