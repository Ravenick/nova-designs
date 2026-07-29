-- Rebuild foreign keys on plan_id with ON DELETE CASCADE
ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_plan_id_fkey;
ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_plan_id_fkey
  FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE CASCADE;

ALTER TABLE public.favorites DROP CONSTRAINT IF EXISTS favorites_plan_id_fkey;
ALTER TABLE public.favorites ADD CONSTRAINT favorites_plan_id_fkey
  FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE CASCADE;

ALTER TABLE public.plan_drawing_sets DROP CONSTRAINT IF EXISTS plan_drawing_sets_plan_id_fkey;
ALTER TABLE public.plan_drawing_sets ADD CONSTRAINT plan_drawing_sets_plan_id_fkey
  FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE CASCADE;

ALTER TABLE public.downloads DROP CONSTRAINT IF EXISTS downloads_plan_id_fkey;
ALTER TABLE public.downloads ADD CONSTRAINT downloads_plan_id_fkey
  FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE CASCADE;

ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_plan_id_fkey;
ALTER TABLE public.order_items ADD CONSTRAINT order_items_plan_id_fkey
  FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE CASCADE;

-- Keep a readable record of what was sold even after a plan is deleted
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS plan_name text;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS plan_number text;

UPDATE public.order_items oi
SET plan_name = p.name, plan_number = p.plan_number
FROM public.plans p
WHERE p.id = oi.plan_id AND oi.plan_name IS NULL;

-- Folder-based delivery: store storage folder prefixes per drawing set
ALTER TABLE public.plan_drawing_sets ADD COLUMN IF NOT EXISTS pdf_folder_path text;
ALTER TABLE public.plan_drawing_sets ADD COLUMN IF NOT EXISTS cad_folder_path text;