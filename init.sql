-- Required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Required for future fuzzy/text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;