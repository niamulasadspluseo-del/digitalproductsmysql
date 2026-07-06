-- Lock down SECURITY DEFINER functions
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.update_updated_at_column() from public, anon, authenticated;

-- Seed products
insert into public.products (slug, title, description, price, sale_price, category_slug, tags, image, file_url, variations, featured, new_release, best_seller) values
('notion-productivity-os','Notion Productivity OS','All-in-one productivity workspace template for Notion. Includes tasks, projects, habits, journal, and weekly review dashboard.',49,29,'templates',array['new','trending'],'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800','https://example.com/files/notion-os.zip','[{"id":"v1","name":"Personal","price":29},{"id":"v2","name":"Team","price":79}]'::jsonb,true,true,true),
('ai-prompt-pack','Ultimate AI Prompt Pack','1000+ curated prompts for marketing, sales, coding and creative writing across ChatGPT, Claude and Gemini.',19,null,'ebooks',array['popular'],'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800','https://example.com/files/prompts.pdf','[]'::jsonb,true,false,true),
('indie-saas-starter','Indie SaaS Starter Kit','Production-ready Next.js + Stripe + Auth boilerplate to ship your SaaS in a weekend.',99,69,'software',array['premium'],'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800','https://example.com/files/saas-kit.zip','[]'::jsonb,true,true,false),
('icon-pack-pro','Icon Pack Pro — 2000 Icons','2000+ pixel-perfect SVG icons in 6 styles. Figma + sprite + React components.',29,null,'graphics',array['trending'],'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800','https://example.com/files/icons.zip','[]'::jsonb,false,false,true),
('youtube-growth-course','YouTube Growth Course','12-hour course on growing a YouTube channel from 0 to 100k subs. Lifetime updates.',149,99,'courses',array['premium'],'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800','https://example.com/files/yt-course.zip','[]'::jsonb,true,false,false),
('minimal-resume-templates','Minimal Resume Templates','12 clean resume templates in Word, Pages, and Figma formats.',15,null,'templates',array['starter'],'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800','https://example.com/files/resume.zip','[]'::jsonb,false,true,false)
on conflict (slug) do nothing;

insert into public.coupons (code, type, value, usage_limit, used_count) values
('WELCOME10','percent',10,100,0),('SAVE5','fixed',5,null,0)
on conflict (code) do nothing;

insert into public.testimonials (name, role, text, rating) values
('Sarah K.','Designer','Best store I''ve bought templates from. Instant delivery and great support.',5),
('Marcus D.','Indie Hacker','The SaaS Starter saved me weeks. Solid quality.',5),
('Priya R.','Marketer','The prompt pack pays for itself in one day.',5);

insert into public.faqs (question, answer, sort_order) values
('How do I receive my purchase?','Instantly — your download link appears in your dashboard and is emailed to you after checkout.',1),
('Do you offer refunds?','Yes, within 7 days if the product doesn''t match its description. See our Refund Policy.',2),
('Can I pay with crypto?','Yes, we accept multiple networks. Choose Crypto at checkout and submit your TXID.',3),
('Is there a license for commercial use?','Most products include a commercial license. Check the product page for specifics.',4);

insert into public.blog_posts (slug, title, excerpt, content, cover, author, published_at) values
('selling-digital-products-2026','Selling Digital Products in 2026: What''s Working','The playbook for creators shipping templates, ebooks and SaaS in the AI era.','Long-form content here. Replace from the admin panel.','https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1200','Admin', now() - interval '3 days'),
('stripe-vs-crypto-payments','Stripe vs Crypto: Which Should You Offer?','A practical comparison of cards and on-chain payments for digital sellers.','Long-form content here.','https://images.unsplash.com/photo-1620266757065-5814239881fd?w=1200','Admin', now() - interval '10 days')
on conflict (slug) do nothing;
