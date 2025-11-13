/*
  # Create custom dictionary table

  1. New Tables
    - `custom_dictionary`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `incorrect_word` (text) - The word to be replaced (case-insensitive matching)
      - `correct_word` (text) - The correct replacement word
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Indexes
    - Index on user_id for fast lookups
    - Unique constraint on (user_id, incorrect_word) to prevent duplicates
  
  3. Security
    - Enable RLS on `custom_dictionary` table
    - Add policy for authenticated users to read their own dictionary entries
    - Add policy for authenticated users to insert their own dictionary entries
    - Add policy for authenticated users to update their own dictionary entries
    - Add policy for authenticated users to delete their own dictionary entries
*/

CREATE TABLE IF NOT EXISTS custom_dictionary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  incorrect_word text NOT NULL,
  correct_word text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, incorrect_word)
);

CREATE INDEX IF NOT EXISTS idx_custom_dictionary_user_id ON custom_dictionary(user_id);

ALTER TABLE custom_dictionary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own dictionary"
  ON custom_dictionary FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dictionary"
  ON custom_dictionary FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dictionary"
  ON custom_dictionary FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dictionary"
  ON custom_dictionary FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);