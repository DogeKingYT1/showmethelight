-- Seed categories
INSERT INTO public.categories (name, slug, icon, color) VALUES
  ('Politics', 'politics', 'landmark', '#DC2626'),
  ('Technology', 'technology', 'cpu', '#2563EB'),
  ('Business', 'business', 'briefcase', '#059669'),
  ('Science', 'science', 'flask', '#7C3AED'),
  ('Health', 'health', 'heart', '#EC4899'),
  ('Sports', 'sports', 'trophy', '#F59E0B'),
  ('Entertainment', 'entertainment', 'film', '#8B5CF6'),
  ('World', 'world', 'globe', '#0891B2')
ON CONFLICT (slug) DO NOTHING;

-- Seed news sources with bias ratings
INSERT INTO public.news_sources (name, slug, logo_url, website_url, bias_rating, reliability_score, description) VALUES
  ('CNN', 'cnn', '/placeholder.svg?height=40&width=40', 'https://cnn.com', 'left', 75, 'Cable News Network - American news network'),
  ('Fox News', 'fox-news', '/placeholder.svg?height=40&width=40', 'https://foxnews.com', 'right', 70, 'Fox News Channel - American news network'),
  ('Reuters', 'reuters', '/placeholder.svg?height=40&width=40', 'https://reuters.com', 'center', 95, 'International news organization'),
  ('Associated Press', 'ap', '/placeholder.svg?height=40&width=40', 'https://apnews.com', 'center', 95, 'American news agency'),
  ('The New York Times', 'nyt', '/placeholder.svg?height=40&width=40', 'https://nytimes.com', 'center_left', 85, 'American daily newspaper'),
  ('The Wall Street Journal', 'wsj', '/placeholder.svg?height=40&width=40', 'https://wsj.com', 'center_right', 88, 'American business-focused newspaper'),
  ('BBC', 'bbc', '/placeholder.svg?height=40&width=40', 'https://bbc.com', 'center', 90, 'British Broadcasting Corporation'),
  ('MSNBC', 'msnbc', '/placeholder.svg?height=40&width=40', 'https://msnbc.com', 'left', 72, 'American news network'),
  ('The Guardian', 'guardian', '/placeholder.svg?height=40&width=40', 'https://theguardian.com', 'center_left', 82, 'British daily newspaper'),
  ('Breitbart', 'breitbart', '/placeholder.svg?height=40&width=40', 'https://breitbart.com', 'far_right', 55, 'American far-right news website'),
  ('NPR', 'npr', '/placeholder.svg?height=40&width=40', 'https://npr.org', 'center_left', 88, 'National Public Radio'),
  ('The Economist', 'economist', '/placeholder.svg?height=40&width=40', 'https://economist.com', 'center', 92, 'British weekly newspaper')
ON CONFLICT (slug) DO NOTHING;

-- Seed sample stories
INSERT INTO public.stories (id, title, slug, summary, image_url, category_id, coverage_score, left_count, center_count, right_count, is_featured)
SELECT 
  gen_random_uuid(),
  'Major Climate Summit Reaches Historic Agreement',
  'climate-summit-agreement',
  'World leaders have reached a groundbreaking agreement on climate action, committing to significant emissions reductions.',
  '/placeholder.svg?height=400&width=600',
  id,
  85,
  12,
  8,
  5,
  TRUE
FROM public.categories WHERE slug = 'world'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.stories (id, title, slug, summary, image_url, category_id, coverage_score, left_count, center_count, right_count, is_featured)
SELECT 
  gen_random_uuid(),
  'Tech Giants Report Record Quarterly Earnings',
  'tech-giants-earnings',
  'Major technology companies exceed analyst expectations with strong revenue growth driven by AI investments.',
  '/placeholder.svg?height=400&width=600',
  id,
  72,
  6,
  10,
  8,
  TRUE
FROM public.categories WHERE slug = 'technology'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.stories (id, title, slug, summary, image_url, category_id, coverage_score, left_count, center_count, right_count, is_featured)
SELECT 
  gen_random_uuid(),
  'Federal Reserve Announces Interest Rate Decision',
  'fed-interest-rate',
  'The Federal Reserve holds rates steady amid mixed economic signals, signaling potential changes ahead.',
  '/placeholder.svg?height=400&width=600',
  id,
  90,
  8,
  15,
  9,
  TRUE
FROM public.categories WHERE slug = 'business'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.stories (id, title, slug, summary, image_url, category_id, coverage_score, left_count, center_count, right_count, is_featured)
SELECT 
  gen_random_uuid(),
  'Breakthrough in Cancer Research Shows Promise',
  'cancer-research-breakthrough',
  'Scientists announce significant progress in immunotherapy treatment showing remarkable results in clinical trials.',
  '/placeholder.svg?height=400&width=600',
  id,
  65,
  5,
  12,
  4,
  FALSE
FROM public.categories WHERE slug = 'health'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.stories (id, title, slug, summary, image_url, category_id, coverage_score, left_count, center_count, right_count, is_featured)
SELECT 
  gen_random_uuid(),
  'Congress Debates New Immigration Policy',
  'immigration-policy-debate',
  'Lawmakers from both parties propose competing bills on immigration reform with key differences on border security.',
  '/placeholder.svg?height=400&width=600',
  id,
  95,
  15,
  6,
  18,
  TRUE
FROM public.categories WHERE slug = 'politics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.stories (id, title, slug, summary, image_url, category_id, coverage_score, left_count, center_count, right_count, is_featured)
SELECT 
  gen_random_uuid(),
  'New AI Model Achieves Human-Level Performance',
  'ai-human-level-performance',
  'Leading AI lab releases new model demonstrating unprecedented capabilities in reasoning and problem-solving.',
  '/placeholder.svg?height=400&width=600',
  id,
  78,
  7,
  14,
  6,
  FALSE
FROM public.categories WHERE slug = 'technology'
ON CONFLICT (slug) DO NOTHING;
