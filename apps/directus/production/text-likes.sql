CREATE TABLE IF NOT EXISTS text_likes (
  text_id VARCHAR(128) PRIMARY KEY,
  likes INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
  date_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE text_likes IS 'Public like counters for blog texts';
