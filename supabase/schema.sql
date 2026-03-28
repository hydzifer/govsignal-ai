-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users preferences (Clerk manages auth, we store preferences)
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  product_category TEXT NOT NULL,
  daily_digest_enabled BOOLEAN DEFAULT true,
  watchlist_alerts_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sources (RSS feeds, APIs, manual)
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('rss', 'api', 'manual')),
  active BOOLEAN DEFAULT true,
  last_fetched TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  raw_content TEXT,

  -- AI classifications
  topics TEXT[] DEFAULT '{}',
  product_categories TEXT[] DEFAULT '{}',
  impact_level TEXT CHECK (impact_level IN ('high', 'medium', 'low')),
  impact_note TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_articles_published ON articles(published_at DESC);
CREATE INDEX idx_articles_topics ON articles USING GIN(topics);
CREATE INDEX idx_articles_categories ON articles USING GIN(product_categories);
CREATE INDEX idx_articles_impact ON articles(impact_level) WHERE impact_level IS NOT NULL;

-- Watchlists
CREATE TABLE watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(clerk_user_id, topic)
);

-- Digests (daily compilations)
CREATE TABLE digests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  digest_date DATE UNIQUE NOT NULL,
  article_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User digest views (analytics)
CREATE TABLE user_digest_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT NOT NULL,
  digest_id UUID REFERENCES digests(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) setup
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic - we'll refine later)
CREATE POLICY user_preferences_policy ON user_preferences
  FOR ALL USING (true);

CREATE POLICY watchlists_policy ON watchlists
  FOR ALL USING (true);
