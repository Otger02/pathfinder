-- Analytics helper functions for the admin dashboard

-- Conversations per day (last N days)
CREATE OR REPLACE FUNCTION conversations_per_day(days_back int DEFAULT 14)
RETURNS TABLE (day date, count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT date_trunc('day', created_at)::date AS day, count(*)
  FROM conversations
  WHERE created_at > now() - make_interval(days => days_back)
  GROUP BY day ORDER BY day;
$$;

-- Language distribution
CREATE OR REPLACE FUNCTION language_distribution()
RETURNS TABLE (language text, count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT language, count(*)
  FROM conversations
  GROUP BY language ORDER BY count DESC;
$$;

-- SOS summary stats
CREATE OR REPLACE FUNCTION sos_summary()
RETURNS TABLE (total bigint, unresolved bigint, today bigint)
LANGUAGE sql STABLE
AS $$
  SELECT
    count(*),
    count(*) FILTER (WHERE resolved = false),
    count(*) FILTER (WHERE timestamp::date = current_date)
  FROM sos_events;
$$;
