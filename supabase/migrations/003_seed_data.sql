-- This migration will seed default categories when a couple is created
-- Default categories: Restaurants, Places to Visit, Activities, Movies/Shows

-- Function to seed default categories for a new couple
CREATE OR REPLACE FUNCTION seed_default_categories(p_couple_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO categories (couple_id, name, created_by)
  VALUES
    (p_couple_id, 'Restaurants', p_user_id),
    (p_couple_id, 'Places to Visit', p_user_id),
    (p_couple_id, 'Activities', p_user_id),
    (p_couple_id, 'Movies/Shows', p_user_id);
END;
$$ LANGUAGE plpgsql;
