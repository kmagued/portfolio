-- ============================================
-- PORTFOLIO DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Quotes table (from portfolio quote form)
CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  project_types TEXT[] DEFAULT '{}',
  budget TEXT,
  timeline TEXT,
  description TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'accepted', 'declined', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table (admin tracking + portfolio display)
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  client TEXT,
  description TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  budget NUMERIC(12, 2),
  currency TEXT DEFAULT 'EGP' CHECK (currency IN ('EGP', 'USD', 'EUR')),
  paid NUMERIC(12, 2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  tech TEXT[] DEFAULT '{}',
  links JSONB DEFAULT '[]',
  cover_image TEXT,
  published BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'EGP' CHECK (currency IN ('EGP', 'USD', 'EUR')),
  category TEXT DEFAULT 'general' CHECK (category IN ('hosting', 'tools', 'marketing', 'salary', 'equipment', 'general', 'other')),
  date DATE DEFAULT CURRENT_DATE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  notes TEXT,
  recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revenue/Income table
CREATE TABLE IF NOT EXISTS income (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'EGP' CHECK (currency IN ('EGP', 'USD', 'EUR')),
  source TEXT DEFAULT 'project' CHECK (source IN ('project', 'freelance', 'subscription', 'other')),
  date DATE DEFAULT CURRENT_DATE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER quotes_updated_at BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;

-- Public can INSERT quotes (from portfolio form)
CREATE POLICY "Anyone can submit quotes" ON quotes
  FOR INSERT TO anon WITH CHECK (true);

-- Only authenticated users can read/update/delete
CREATE POLICY "Auth users can view quotes" ON quotes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Auth users can update quotes" ON quotes
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth users can delete quotes" ON quotes
  FOR DELETE USING (auth.role() = 'authenticated');

-- Auth-only for projects, expenses, income
CREATE POLICY "Auth users full access projects" ON projects
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view published projects" ON projects
  FOR SELECT TO anon USING (published = true);

CREATE POLICY "Auth users full access expenses" ON expenses
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Auth users full access income" ON income
  FOR ALL USING (auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created ON quotes(created_at DESC);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_expenses_date ON expenses(date DESC);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_income_date ON income(date DESC);
