-- Create table for Reddit users/accounts
CREATE TABLE public.reddit_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  account_created_utc BIGINT,
  comment_karma INTEGER DEFAULT 0,
  link_karma INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  has_verified_email BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  account_age_days INTEGER,
  subreddit_activity JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for Reddit posts
CREATE TABLE public.reddit_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reddit_id TEXT NOT NULL UNIQUE,
  author_username TEXT,
  title TEXT,
  content TEXT,
  subreddit TEXT,
  score INTEGER DEFAULT 0,
  upvote_ratio REAL,
  num_comments INTEGER DEFAULT 0,
  created_utc BIGINT,
  is_self BOOLEAN DEFAULT FALSE,
  domain TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for Reddit comments
CREATE TABLE public.reddit_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reddit_id TEXT NOT NULL UNIQUE,
  post_id TEXT,
  author_username TEXT,
  body TEXT,
  score INTEGER DEFAULT 0,
  created_utc BIGINT,
  is_submitter BOOLEAN DEFAULT FALSE,
  parent_id TEXT,
  subreddit TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for bot detection results
CREATE TABLE public.bot_detection_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  bot_probability REAL NOT NULL,
  confidence_score REAL NOT NULL,
  detection_method TEXT NOT NULL,
  features_analyzed JSONB,
  risk_factors JSONB,
  analysis_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for analysis sessions
CREATE TABLE public.analysis_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_name TEXT NOT NULL,
  subreddit TEXT,
  status TEXT DEFAULT 'pending',
  total_accounts_analyzed INTEGER DEFAULT 0,
  bots_detected INTEGER DEFAULT 0,
  analysis_parameters JSONB,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reddit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reddit_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reddit_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_detection_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a testing/research tool)
CREATE POLICY "Allow public access to reddit_accounts" 
ON public.reddit_accounts FOR ALL USING (true);

CREATE POLICY "Allow public access to reddit_posts" 
ON public.reddit_posts FOR ALL USING (true);

CREATE POLICY "Allow public access to reddit_comments" 
ON public.reddit_comments FOR ALL USING (true);

CREATE POLICY "Allow public access to bot_detection_results" 
ON public.bot_detection_results FOR ALL USING (true);

CREATE POLICY "Allow public access to analysis_sessions" 
ON public.analysis_sessions FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_reddit_accounts_username ON public.reddit_accounts(username);
CREATE INDEX idx_reddit_posts_author ON public.reddit_posts(author_username);
CREATE INDEX idx_reddit_posts_subreddit ON public.reddit_posts(subreddit);
CREATE INDEX idx_reddit_comments_author ON public.reddit_comments(author_username);
CREATE INDEX idx_bot_detection_results_username ON public.bot_detection_results(username);
CREATE INDEX idx_bot_detection_results_probability ON public.bot_detection_results(bot_probability);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_reddit_accounts_updated_at
  BEFORE UPDATE ON public.reddit_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bot_detection_results_updated_at
  BEFORE UPDATE ON public.bot_detection_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();