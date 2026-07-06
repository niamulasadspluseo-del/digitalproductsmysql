import { mysqlTable, varchar, text, timestamp, decimal, json, int, boolean, uniqueIndex, primaryKey, mysqlEnum, index } from 'drizzle-orm/mysql-core';

export const profiles = mysqlTable('profiles', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: text('name'),
  email: text('email'),
  passwordHash: text('password_hash'),
  avatarUrl: text('avatar_url'),
  resetToken: text('reset_token'),
  resetTokenExpires: text('reset_token_expires'),
  verified: boolean('verified').notNull().default(false),
  status: mysqlEnum('status', ['active', 'suspended', 'banned']).notNull().default('active'),
  billing: json('billing').notNull().default('{}'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

export const userRoles = mysqlTable('user_roles', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  role: mysqlEnum('role', ['admin', 'customer']).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
}, (table) => ({
  userRoleUnique: uniqueIndex('user_role_unique').on(table.userId, table.role),
}));

export const categories = mysqlTable('categories', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: text('name').notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  icon: text('icon'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

export const tags = mysqlTable('tags', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

export const products = mysqlTable('products', {
  id: varchar('id', { length: 36 }).primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull().default('0'),
  salePrice: decimal('sale_price', { precision: 10, scale: 2 }),
  categorySlug: text('category_slug'),
  tags: json('tags').notNull().default('[]'),
  image: text('image'),
  gallery: json('gallery').notNull().default('[]'),
  fileUrl: text('file_url'),
  variations: json('variations').notNull().default('[]'),
  featured: boolean('featured').notNull().default(false),
  newRelease: boolean('new_release').notNull().default(false),
  bestSeller: boolean('best_seller').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

export const coupons = mysqlTable('coupons', {
  id: varchar('id', { length: 36 }).primaryKey(),
  code: varchar('code', { length: 255 }).notNull().unique(),
  type: mysqlEnum('type', ['percent', 'fixed']).notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  expiresAt: timestamp('expires_at', { mode: 'string' }),
  usageLimit: int('usage_limit'),
  usedCount: int('used_count').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

export const orders = mysqlTable('orders', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }),
  userName: text('user_name'),
  userEmail: text('user_email'),
  telegram: text('telegram'),
  whatsapp: text('whatsapp'),
  items: json('items').notNull().default('[]'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull().default('0'),
  discount: decimal('discount', { precision: 10, scale: 2 }).notNull().default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull().default('0'),
  couponCode: text('coupon_code'),
  status: mysqlEnum('status', ['pending', 'payment_received', 'payment_not_received', 'in_progress', 'ready_for_delivery', 'delivered', 'refunded', 'cancel']).notNull().default('pending'),
  paymentMethod: mysqlEnum('payment_method', ['crypto']),
  paymentTxid: text('payment_txid'),
  paymentMeta: json('payment_meta').notNull().default('{}'),
  billing: json('billing').notNull().default('{}'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

export const reviews = mysqlTable('reviews', {
  id: varchar('id', { length: 36 }).primaryKey(),
  productId: varchar('product_id', { length: 36 }).notNull(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  userName: text('user_name'),
  rating: int('rating').notNull(),
  text: text('text'),
  approved: boolean('approved').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

export const blogPosts = mysqlTable('blog_posts', {
  id: varchar('id', { length: 36 }).primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  content: text('content'),
  cover: text('cover'),
  author: text('author'),
  publishedAt: timestamp('published_at', { mode: 'string' }),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

export const testimonials = mysqlTable('testimonials', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: text('name').notNull(),
  role: text('role'),
  text: text('text').notNull(),
  avatar: text('avatar'),
  rating: int('rating').notNull().default(5),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

export const faqs = mysqlTable('faqs', {
  id: varchar('id', { length: 36 }).primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  sortOrder: int('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

export const pages = mysqlTable('pages', {
  slug: varchar('slug', { length: 255 }).primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

export const contactMessages = mysqlTable('contact_messages', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject'),
  message: text('message').notNull(),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

export const settings = mysqlTable('settings', {
  id: varchar('id', { length: 36 }).primaryKey().default('singleton'),
  brand: json('brand').notNull().default('{}'),
  hero: json('hero').notNull().default('{}'),
  integrations: json('integrations').notNull().default('{}'),
  payments: json('payments').notNull().default('{}'),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});
