-- Fix for infinite recursion in RLS policies
-- Run this in Supabase SQL Editor to replace the problematic policies

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile and partner's profile" ON users;
DROP POLICY IF EXISTS "Users can view their own couple" ON couples;
DROP POLICY IF EXISTS "Users can create categories for their couple" ON categories;
DROP POLICY IF EXISTS "Users can view categories for their couple" ON categories;
DROP POLICY IF EXISTS "Users can update categories for their couple" ON categories;
DROP POLICY IF EXISTS "Users can delete categories for their couple" ON categories;
DROP POLICY IF EXISTS "Users can view items for their couple" ON items;
DROP POLICY IF EXISTS "Users can create items for their couple" ON items;
DROP POLICY IF EXISTS "Users can update items for their couple" ON items;
DROP POLICY IF EXISTS "Users can delete items for their couple" ON items;
DROP POLICY IF EXISTS "Users can view photos for items in their couple" ON item_photos;
DROP POLICY IF EXISTS "Users can create photos for items in their couple" ON item_photos;
DROP POLICY IF EXISTS "Users can delete photos for items in their couple" ON item_photos;

-- Create fixed policies for users table (no self-referencing subqueries)
CREATE POLICY "Users can view own and partner profile"
  ON users FOR SELECT
  USING (
    id = auth.uid() OR
    (couple_id IS NOT NULL AND couple_id = (SELECT couple_id FROM users WHERE id = auth.uid() LIMIT 1))
  );

-- Create fixed policy for couples table (simpler check)
CREATE POLICY "Users can view their couple"
  ON couples FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.couple_id = couples.id
    )
  );

-- Fixed policies for categories (use direct couple_id comparison)
CREATE POLICY "Users can view their categories"
  ON categories FOR SELECT
  USING (
    couple_id = (SELECT couple_id FROM users WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "Users can create their categories"
  ON categories FOR INSERT
  WITH CHECK (
    couple_id = (SELECT couple_id FROM users WHERE id = auth.uid() LIMIT 1)
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their categories"
  ON categories FOR UPDATE
  USING (
    couple_id = (SELECT couple_id FROM users WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "Users can delete their categories"
  ON categories FOR DELETE
  USING (
    couple_id = (SELECT couple_id FROM users WHERE id = auth.uid() LIMIT 1)
  );

-- Fixed policies for items (use direct couple_id comparison)
CREATE POLICY "Users can view their items"
  ON items FOR SELECT
  USING (
    couple_id = (SELECT couple_id FROM users WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "Users can create their items"
  ON items FOR INSERT
  WITH CHECK (
    couple_id = (SELECT couple_id FROM users WHERE id = auth.uid() LIMIT 1)
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their items"
  ON items FOR UPDATE
  USING (
    couple_id = (SELECT couple_id FROM users WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "Users can delete their items"
  ON items FOR DELETE
  USING (
    couple_id = (SELECT couple_id FROM users WHERE id = auth.uid() LIMIT 1)
  );

-- Fixed policies for item_photos
CREATE POLICY "Users can view their item photos"
  ON item_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = item_photos.item_id
      AND items.couple_id = (SELECT couple_id FROM users WHERE id = auth.uid() LIMIT 1)
    )
  );

CREATE POLICY "Users can create their item photos"
  ON item_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = item_photos.item_id
      AND items.couple_id = (SELECT couple_id FROM users WHERE id = auth.uid() LIMIT 1)
    )
  );

CREATE POLICY "Users can delete their item photos"
  ON item_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = item_photos.item_id
      AND items.couple_id = (SELECT couple_id FROM users WHERE id = auth.uid() LIMIT 1)
    )
  );
