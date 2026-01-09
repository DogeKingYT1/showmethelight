-- Seed articles for Climate Summit story
INSERT INTO public.articles (title, description, url, image_url, source_id, category_id, story_id, published_at)
SELECT 
  'Climate Summit Victory: World Agrees to Cut Emissions 50% by 2035',
  'Historic agreement represents major step forward in global climate action.',
  'https://example.com/climate-1',
  '/placeholder.svg?height=200&width=300',
  (SELECT id FROM public.news_sources WHERE slug = 'cnn'),
  (SELECT id FROM public.categories WHERE slug = 'world'),
  (SELECT id FROM public.stories WHERE slug = 'climate-summit-agreement'),
  NOW() - INTERVAL '2 hours';

INSERT INTO public.articles (title, description, url, image_url, source_id, category_id, story_id, published_at)
SELECT 
  'Climate Deal Costs Could Impact American Jobs, Critics Warn',
  'Analysis shows potential economic impacts of new climate commitments.',
  'https://example.com/climate-2',
  '/placeholder.svg?height=200&width=300',
  (SELECT id FROM public.news_sources WHERE slug = 'fox-news'),
  (SELECT id FROM public.categories WHERE slug = 'world'),
  (SELECT id FROM public.stories WHERE slug = 'climate-summit-agreement'),
  NOW() - INTERVAL '3 hours';

INSERT INTO public.articles (title, description, url, image_url, source_id, category_id, story_id, published_at)
SELECT 
  'World Leaders Sign Climate Accord in Geneva',
  'Representatives from 195 countries approve new emissions targets.',
  'https://example.com/climate-3',
  '/placeholder.svg?height=200&width=300',
  (SELECT id FROM public.news_sources WHERE slug = 'reuters'),
  (SELECT id FROM public.categories WHERE slug = 'world'),
  (SELECT id FROM public.stories WHERE slug = 'climate-summit-agreement'),
  NOW() - INTERVAL '4 hours';

-- Seed articles for Tech Earnings story
INSERT INTO public.articles (title, description, url, image_url, source_id, category_id, story_id, published_at)
SELECT 
  'Apple, Microsoft, Google All Beat Expectations in Q4',
  'Tech sector shows resilience with strong earnings across the board.',
  'https://example.com/tech-1',
  '/placeholder.svg?height=200&width=300',
  (SELECT id FROM public.news_sources WHERE slug = 'wsj'),
  (SELECT id FROM public.categories WHERE slug = 'technology'),
  (SELECT id FROM public.stories WHERE slug = 'tech-giants-earnings'),
  NOW() - INTERVAL '5 hours';

INSERT INTO public.articles (title, description, url, image_url, source_id, category_id, story_id, published_at)
SELECT 
  'Big Tech''s AI Spending Concerns Investors Despite Earnings Beat',
  'Questions remain about return on massive AI infrastructure investments.',
  'https://example.com/tech-2',
  '/placeholder.svg?height=200&width=300',
  (SELECT id FROM public.news_sources WHERE slug = 'nyt'),
  (SELECT id FROM public.categories WHERE slug = 'technology'),
  (SELECT id FROM public.stories WHERE slug = 'tech-giants-earnings'),
  NOW() - INTERVAL '6 hours';

-- Seed articles for Fed Rate Decision story
INSERT INTO public.articles (title, description, url, image_url, source_id, category_id, story_id, published_at)
SELECT 
  'Federal Reserve Holds Rates, Signals Patience on Future Cuts',
  'Central bank maintains current policy amid economic uncertainty.',
  'https://example.com/fed-1',
  '/placeholder.svg?height=200&width=300',
  (SELECT id FROM public.news_sources WHERE slug = 'ap'),
  (SELECT id FROM public.categories WHERE slug = 'business'),
  (SELECT id FROM public.stories WHERE slug = 'fed-interest-rate'),
  NOW() - INTERVAL '1 hour';

INSERT INTO public.articles (title, description, url, image_url, source_id, category_id, story_id, published_at)
SELECT 
  'Markets React to Fed Decision: What It Means for Your Wallet',
  'Breaking down the impact of the Fed''s latest move on consumers.',
  'https://example.com/fed-2',
  '/placeholder.svg?height=200&width=300',
  (SELECT id FROM public.news_sources WHERE slug = 'cnn'),
  (SELECT id FROM public.categories WHERE slug = 'business'),
  (SELECT id FROM public.stories WHERE slug = 'fed-interest-rate'),
  NOW() - INTERVAL '2 hours';

-- Seed articles for Immigration Policy story
INSERT INTO public.articles (title, description, url, image_url, source_id, category_id, story_id, published_at)
SELECT 
  'Bipartisan Immigration Bill Faces Uncertain Future in House',
  'Moderate lawmakers push for compromise as hardliners dig in.',
  'https://example.com/immigration-1',
  '/placeholder.svg?height=200&width=300',
  (SELECT id FROM public.news_sources WHERE slug = 'nyt'),
  (SELECT id FROM public.categories WHERE slug = 'politics'),
  (SELECT id FROM public.stories WHERE slug = 'immigration-policy-debate'),
  NOW() - INTERVAL '4 hours';

INSERT INTO public.articles (title, description, url, image_url, source_id, category_id, story_id, published_at)
SELECT 
  'Border Security Must Be Priority in Any Immigration Deal',
  'Republicans demand stronger enforcement measures in negotiations.',
  'https://example.com/immigration-2',
  '/placeholder.svg?height=200&width=300',
  (SELECT id FROM public.news_sources WHERE slug = 'fox-news'),
  (SELECT id FROM public.categories WHERE slug = 'politics'),
  (SELECT id FROM public.stories WHERE slug = 'immigration-policy-debate'),
  NOW() - INTERVAL '5 hours';

INSERT INTO public.articles (title, description, url, image_url, source_id, category_id, story_id, published_at)
SELECT 
  'Immigration Reform: A Path Forward for Dreamers',
  'Advocates push for protections for undocumented youth in new bill.',
  'https://example.com/immigration-3',
  '/placeholder.svg?height=200&width=300',
  (SELECT id FROM public.news_sources WHERE slug = 'msnbc'),
  (SELECT id FROM public.categories WHERE slug = 'politics'),
  (SELECT id FROM public.stories WHERE slug = 'immigration-policy-debate'),
  NOW() - INTERVAL '6 hours';

-- Seed articles for AI story
INSERT INTO public.articles (title, description, url, image_url, source_id, category_id, story_id, published_at)
SELECT 
  'New AI System Matches Human Experts on Complex Reasoning Tasks',
  'Benchmark results show significant leap in artificial intelligence capabilities.',
  'https://example.com/ai-1',
  '/placeholder.svg?height=200&width=300',
  (SELECT id FROM public.news_sources WHERE slug = 'bbc'),
  (SELECT id FROM public.categories WHERE slug = 'technology'),
  (SELECT id FROM public.stories WHERE slug = 'ai-human-level-performance'),
  NOW() - INTERVAL '8 hours';

INSERT INTO public.articles (title, description, url, image_url, source_id, category_id, story_id, published_at)
SELECT 
  'AI Breakthrough Raises Questions About Future of Work',
  'Economists debate implications of rapidly advancing AI systems.',
  'https://example.com/ai-2',
  '/placeholder.svg?height=200&width=300',
  (SELECT id FROM public.news_sources WHERE slug = 'economist'),
  (SELECT id FROM public.categories WHERE slug = 'technology'),
  (SELECT id FROM public.stories WHERE slug = 'ai-human-level-performance'),
  NOW() - INTERVAL '10 hours';
