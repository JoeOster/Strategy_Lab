ALTER TABLE transactions ADD COLUMN limit_low REAL;
ALTER TABLE transactions ADD COLUMN limit_high REAL;
ALTER TABLE transactions ADD COLUMN exchange TEXT;
ALTER TABLE transactions ADD COLUMN "time" TEXT;
