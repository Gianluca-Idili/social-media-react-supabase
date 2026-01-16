-- Create a function to fetch the leaderboard with advanced sorting and statistics
CREATE OR REPLACE FUNCTION get_leaderboard_v2(
  sort_by TEXT DEFAULT 'points',
  limit_val INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  avatar_url TEXT,
  points INTEGER,
  real_votes BIGINT,
  fake_votes BIGINT,
  completed_lists BIGINT,
  failed_lists BIGINT,
  total_lists BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.points,
    COALESCE(v_counts.real_v, 0) as real_votes,
    COALESCE(v_counts.fake_v, 0) as fake_votes,
    COALESCE(l_counts.comp, 0) as completed_lists,
    COALESCE(l_counts.fail, 0) as failed_lists,
    COALESCE(l_counts.tot, 0) as total_lists
  FROM 
    profiles p
  LEFT JOIN (
    -- Count Real and Fake votes for lists owned by each user
    SELECT 
      l.user_id,
      COUNT(*) FILTER (WHERE v.vote = 1) as real_v,
      COUNT(*) FILTER (WHERE v.vote = -1) as fake_v
    FROM 
      lists l
    JOIN 
      votes v ON v.list_id = l.id
    GROUP BY 
      l.user_id
  ) v_counts ON v_counts.user_id = p.id
  LEFT JOIN (
    -- Count completed, failed and total lists for each user
    SELECT 
      l.user_id,
      COUNT(*) FILTER (WHERE l.is_completed = true) as comp,
      COUNT(*) FILTER (WHERE l.is_completed = false AND l.expires_at < NOW()) as fail,
      COUNT(*) as tot
    FROM 
      lists l
    GROUP BY 
      l.user_id
  ) l_counts ON l_counts.user_id = p.id
  ORDER BY 
    CASE 
      WHEN sort_by = 'points' THEN p.points::float
      WHEN sort_by = 'real' THEN COALESCE(v_counts.real_v, 0)::float
      WHEN sort_by = 'fake' THEN COALESCE(v_counts.fake_v, 0)::float
      WHEN sort_by = 'completed' THEN COALESCE(l_counts.comp, 0)::float
      WHEN sort_by = 'failed' THEN COALESCE(l_counts.fail, 0)::float
      ELSE p.points::float
    END DESC
  LIMIT limit_val;
END;
$$;
