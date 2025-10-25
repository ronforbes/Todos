-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create couples table
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  couple_id UUID REFERENCES couples(id) ON DELETE SET NULL
);

-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(couple_id, name)
);

-- Create items table with status enum
CREATE TYPE item_status AS ENUM ('incomplete', 'complete');

CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  do_by_date DATE,
  status item_status NOT NULL DEFAULT 'incomplete',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT CHECK (char_length(notes) <= 1000),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create item_photos table
CREATE TABLE item_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_users_couple_id ON users(couple_id);
CREATE INDEX idx_categories_couple_id ON categories(couple_id);
CREATE INDEX idx_items_couple_id ON items(couple_id);
CREATE INDEX idx_items_category_id ON items(category_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_item_photos_item_id ON item_photos(item_id);
CREATE INDEX idx_couples_invitation_code ON couples(invitation_code);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at on items
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on all tables
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for couples table
CREATE POLICY "Users can view their own couple"
  ON couples FOR SELECT
  USING (
    id IN (
      SELECT couple_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create couples"
  ON couples FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile and partner's profile"
  ON users FOR SELECT
  USING (
    id = auth.uid() OR
    couple_id IN (
      SELECT couple_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- RLS Policies for categories table
CREATE POLICY "Users can view categories for their couple"
  ON categories FOR SELECT
  USING (
    couple_id IN (
      SELECT couple_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create categories for their couple"
  ON categories FOR INSERT
  WITH CHECK (
    couple_id IN (
      SELECT couple_id FROM users WHERE id = auth.uid()
    ) AND
    created_by = auth.uid()
  );

CREATE POLICY "Users can update categories for their couple"
  ON categories FOR UPDATE
  USING (
    couple_id IN (
      SELECT couple_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete categories for their couple"
  ON categories FOR DELETE
  USING (
    couple_id IN (
      SELECT couple_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for items table
CREATE POLICY "Users can view items for their couple"
  ON items FOR SELECT
  USING (
    couple_id IN (
      SELECT couple_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create items for their couple"
  ON items FOR INSERT
  WITH CHECK (
    couple_id IN (
      SELECT couple_id FROM users WHERE id = auth.uid()
    ) AND
    created_by = auth.uid()
  );

CREATE POLICY "Users can update items for their couple"
  ON items FOR UPDATE
  USING (
    couple_id IN (
      SELECT couple_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items for their couple"
  ON items FOR DELETE
  USING (
    couple_id IN (
      SELECT couple_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for item_photos table
CREATE POLICY "Users can view photos for items in their couple"
  ON item_photos FOR SELECT
  USING (
    item_id IN (
      SELECT id FROM items WHERE couple_id IN (
        SELECT couple_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create photos for items in their couple"
  ON item_photos FOR INSERT
  WITH CHECK (
    item_id IN (
      SELECT id FROM items WHERE couple_id IN (
        SELECT couple_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete photos for items in their couple"
  ON item_photos FOR DELETE
  USING (
    item_id IN (
      SELECT id FROM items WHERE couple_id IN (
        SELECT couple_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
