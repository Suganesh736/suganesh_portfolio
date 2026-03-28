-- Single key-value table for all portfolio content sections
CREATE TABLE public.portfolio_content (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_content ENABLE ROW LEVEL SECURITY;

-- Everyone can read portfolio content (it's a public portfolio)
CREATE POLICY "Portfolio content is publicly readable"
  ON public.portfolio_content FOR SELECT
  USING (true);

-- Anyone can insert (admin password checked client-side)
CREATE POLICY "Allow insert portfolio content"
  ON public.portfolio_content FOR INSERT
  WITH CHECK (true);

-- Anyone can update (admin password checked client-side)
CREATE POLICY "Allow update portfolio content"
  ON public.portfolio_content FOR UPDATE
  USING (true);