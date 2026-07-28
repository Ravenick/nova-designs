-- Drawing set enum
CREATE TYPE public.drawing_set_type AS ENUM ('architectural', 'structural', 'mechanical', 'electrical');

-- Plan drawing sets table
CREATE TABLE public.plan_drawing_sets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  set_type public.drawing_set_type NOT NULL,
  pdf_price numeric NOT NULL DEFAULT 0,
  cad_price numeric NOT NULL DEFAULT 0,
  pdf_zip_path text,
  cad_zip_path text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (plan_id, set_type)
);

GRANT SELECT ON public.plan_drawing_sets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_drawing_sets TO authenticated;
GRANT ALL ON public.plan_drawing_sets TO service_role;

ALTER TABLE public.plan_drawing_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drawing sets public read" ON public.plan_drawing_sets
  FOR SELECT USING (true);
CREATE POLICY "drawing sets admin insert" ON public.plan_drawing_sets
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "drawing sets admin update" ON public.plan_drawing_sets
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "drawing sets admin delete" ON public.plan_drawing_sets
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_plan_drawing_sets_updated_at
  BEFORE UPDATE ON public.plan_drawing_sets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add set_type to cart_items, order_items, downloads
ALTER TABLE public.cart_items ADD COLUMN set_type public.drawing_set_type;
ALTER TABLE public.order_items ADD COLUMN set_type public.drawing_set_type;
ALTER TABLE public.downloads ADD COLUMN set_type public.drawing_set_type;

-- include_architectural becomes optional for legacy compatibility
ALTER TABLE public.cart_items ALTER COLUMN include_architectural SET DEFAULT false;
ALTER TABLE public.order_items ALTER COLUMN include_architectural SET DEFAULT false;
ALTER TABLE public.downloads ALTER COLUMN include_architectural SET DEFAULT false;