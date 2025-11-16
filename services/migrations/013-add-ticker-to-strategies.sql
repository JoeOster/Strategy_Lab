ALTER TABLE strategies ADD COLUMN ticker TEXT;
ALTER TABLE strategies ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
