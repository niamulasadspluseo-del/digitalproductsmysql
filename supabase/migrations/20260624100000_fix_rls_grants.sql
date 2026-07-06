-- Fix: Grant table-level DML permissions to authenticated users for admin-managed tables
-- The original migration only granted SELECT, so INSERT/UPDATE/DELETE were denied at table level
-- before RLS policies could be evaluated.

grant insert, update, delete on public.categories to authenticated;
grant insert, update, delete on public.tags to authenticated;
grant insert, update, delete on public.products to authenticated;
grant insert, update, delete on public.coupons to authenticated;
grant insert, update, delete on public.blog_posts to authenticated;
grant insert, update, delete on public.testimonials to authenticated;
grant insert, update, delete on public.faqs to authenticated;
grant insert, update, delete on public.pages to authenticated;
grant insert, update, delete on public.settings to authenticated;

-- Fix: Restore EXECUTE on has_role for authenticated users
-- The previous migration revoked it, which broke all RLS policies using has_role()
-- because the calling user needs EXECUTE permission even on SECURITY DEFINER functions.

grant execute on function public.has_role(uuid, public.app_role) to authenticated;
