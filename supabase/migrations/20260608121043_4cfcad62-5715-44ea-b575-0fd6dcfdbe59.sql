ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS pdf_file_path text,
  ADD COLUMN IF NOT EXISTS cad_file_path text;