/*
  # Create password reset codes table for OTP flow

  1. New Tables
    - `password_reset_codes`
      - `id` (uuid, primary key)
      - `email` (text, email address)
      - `code` (text, 6-digit OTP code)
      - `expires_at` (timestamptz, expiration time)
      - `used` (boolean, whether code has been used)
      - `created_at` (timestamptz, creation timestamp)
  
  2. Security
    - Enable RLS on `password_reset_codes` table
    - No policies needed (only Edge Functions will access this table via service role)
  
  3. Indexes
    - Index on email for fast lookup
    - Index on expires_at for cleanup queries
*/

CREATE TABLE IF NOT EXISTS password_reset_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE password_reset_codes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_password_reset_codes_email ON password_reset_codes(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_expires_at ON password_reset_codes(expires_at);
