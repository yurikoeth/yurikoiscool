-- Arc Raiders Raid History Schema
-- Run this in Supabase SQL Editor

-- Raids table
CREATE TABLE raids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  map TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('survived', 'kia', 'extract')),
  notes TEXT,
  total_value INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Raid items table
CREATE TABLE raid_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  raid_id UUID REFERENCES raids(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  value INTEGER DEFAULT 0,
  fir BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE raids ENABLE ROW LEVEL SECURITY;
ALTER TABLE raid_items ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access" ON raids FOR SELECT USING (true);
CREATE POLICY "Public read access" ON raid_items FOR SELECT USING (true);

-- Index for faster queries
CREATE INDEX idx_raids_date ON raids(date DESC);
CREATE INDEX idx_raid_items_raid_id ON raid_items(raid_id);
