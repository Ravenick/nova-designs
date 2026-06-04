
ALTER TABLE public.downloads
  ADD COLUMN IF NOT EXISTS downloads_remaining integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS downloads_used integer NOT NULL DEFAULT 0;

-- Allow users to update their own downloads (to decrement counter)
DROP POLICY IF EXISTS "own downloads update" ON public.downloads;
CREATE POLICY "own downloads update" ON public.downloads
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, plan_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own favorites all" ON public.favorites
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
