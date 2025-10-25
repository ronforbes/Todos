-- Complete fix for infinite recursion in RLS policies
-- This uses a SECURITY DEFINER function to break the circular reference

-- First, drop all existing policies
DROP POLICY IF EXISTS "Users can view own and partner profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile and partner's profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their couple" ON couples;
DROP POLICY IF EXISTS "Authenticated users can create couples" ON couples;
DROP POLICY IF EXISTS "Users can view their categories" ON categories;
DROP POLICY IF EXISTS "Users can create their categories" ON categories;
DROP POLICY IF EXISTS "Users can create categories for their couple" ON categories;
DROP POLICY IF EXISTS "Users can view categories for their couple" ON categories;
DROP POLICY IF EXISTS "Users can update their categories" ON categories;
DROP POLICY IF EXISTS "Users can update categories for their couple" ON categories;
DROP POLICY IF EXISTS "Users can delete their categories" ON categories;
DROP POLICY IF EXISTS "Users can delete categories for their couple" ON categories;
DROP POLICY IF EXISTS "Users can view their items" ON items;
DROP POLICY IF EXISTS "Users can create their items" ON items;
DROP POLICY IF EXISTS "Users can view items for their couple" ON items;
DROP POLICY IF EXISTS "Users can create items for their couple" ON items;
DROP POLICY IF EXISTS "Users can update their items" ON items;
DROP POLICY IF EXISTS "Users can update items for their couple" ON items;
DROP POLICY IF EXISTS "Users can delete their items" ON items;
DROP POLICY IF EXISTS "Users can delete items for their couple" ON items;
DROP POLICY IF EXISTS "Users can view their item photos" ON item_photos;
DROP POLICY IF EXISTS "Users can create their item photos" ON item_photos;
DROP POLICY IF EXISTS "Users can view photos for items in their couple" ON item_photos;
DROP POLICY IF EXISTS "Users can create photos for items in their couple" ON item_photos;
DROP POLICY IF EXISTS "Users can delete their item photos" ON item_photos;
DROP POLICY IF EXISTS "Users can delete photos for items in their couple" ON item_photos;

-- Create a SECURITY DEFINER function to get user's couple_id without triggering RLS
CREATE OR REPLACE FUNCTION auth.get_user_couple_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT couple_id FROM public.users WHERE id = auth.uid());
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION auth.get_user_couple_id() TO authenticated;

-- Now create simple policies that use this function

-- Users table policies (NO self-referencing queries)
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can view partner profile"
  ON users FOR SELECT
  USING (
    couple_id IS NOT NULL
    AND couple_id = auth.get_user_couple_id()
  );

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Couples table policies
CREATE POLICY "Users can view their couple"
  ON couples FOR SELECT
  USING (id = auth.get_user_couple_id());

CREATE POLICY "Authenticated users can create couples"
  ON couples FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Categories table policies
CREATE POLICY "Users can view their categories"
  ON categories FOR SELECT
  USING (couple_id = auth.get_user_couple_id());

CREATE POLICY "Users can create their categories"
  ON categories FOR INSERT
  WITH CHECK (
    couple_id = auth.get_user_couple_id()
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their categories"
  ON categories FOR UPDATE
  USING (couple_id = auth.get_user_couple_id());

CREATE POLICY "Users can delete their categories"
  ON categories FOR DELETE
  USING (couple_id = auth.get_user_couple_id());

-- Items table policies
CREATE POLICY "Users can view their items"
  ON items FOR SELECT
  USING (couple_id = auth.get_user_couple_id());

CREATE POLICY "Users can create their items"
  ON items FOR INSERT
  WITH CHECK (
    couple_id = auth.get_user_couple_id()
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their items"
  ON items FOR UPDATE
  USING (couple_id = auth.get_user_couple_id());

CREATE POLICY "Users can delete their items"
  ON items FOR DELETE
  USING (couple_id = auth.get_user_couple_id());

-- Item photos table policies
CREATE POLICY "Users can view their item photos"
  ON item_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = item_photos.item_id
      AND items.couple_id = auth.get_user_couple_id()
    )
  );

CREATE POLICY "Users can create their item photos"
  ON item_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = item_photos.item_id
      AND items.couple_id = auth.get_user_couple_id()
    )
  );

CREATE POLICY "Users can delete their item photos"
  ON item_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = item_photos.item_id
      AND items.couple_id = auth.get_user_couple_id()
    )
  );
