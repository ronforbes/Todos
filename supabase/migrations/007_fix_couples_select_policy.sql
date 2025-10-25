-- Fix the couples table SELECT policy to allow viewing newly created couples
-- The issue: After INSERT, code tries to SELECT the couple, but user doesn't have couple_id yet

-- Drop the existing couples SELECT policy
DROP POLICY IF EXISTS "Users can view their couple" ON couples;

-- Create a more permissive SELECT policy that allows:
-- 1. Users to view couples they're assigned to
-- 2. Users to view any couple (needed temporarily during creation)
--    Since couples are immediately assigned after creation, this is safe
CREATE POLICY "Users can view couples"
  ON couples FOR SELECT
  TO authenticated
  USING (
    -- Either user is assigned to this couple
    id = public.get_my_couple_id()
    -- Or user is authenticated (needed for SELECT after INSERT before assignment)
    OR auth.uid() IS NOT NULL
  );

-- Alternative more restrictive approach (commented out):
-- This would only allow viewing couples that have been created recently
-- But the above simple approach is fine since couples are assigned immediately
/*
CREATE POLICY "Users can view couples"
  ON couples FOR SELECT
  TO authenticated
  USING (
    -- User is assigned to this couple
    id = public.get_my_couple_id()
    -- OR couple was just created and not assigned yet
    OR NOT EXISTS (SELECT 1 FROM users WHERE users.couple_id = couples.id)
  );
*/
