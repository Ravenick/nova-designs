## Overview

Major restructure of the purchase and file delivery model. Customers buy individual drawing sets (Architectural, Structural, Mechanical, Electrical), each in PDF or PDF+CAD variant. After payment they get a single master ZIP named after the plan, containing each purchased set's ZIP.

## 1. Database changes (migration)

New table `plan_drawing_sets`:
- `plan_id` (fk plans)
- `set_type` (enum: architectural, structural, mechanical, electrical)
- `pdf_price` numeric
- `cad_price` numeric (extra on top of pdf, or total for PDF+CAD — pick: total PDF+CAD price)
- `pdf_zip_path` (storage path in `plan-files`)
- `cad_zip_path` (storage path in `plan-files`, nullable)
- unique(plan_id, set_type)

New enum `drawing_set_type`.

Alter `plans`:
- add `gallery jsonb` already exists — reuse for slideshow images.
- Deprecate `pdf_file_path`, `cad_file_path`, `architectural_addon_price`, `cad_addon_price`, `base_price` for purchase math (keep columns for back-compat; new purchases use drawing sets).

Alter `cart_items` / `order_items` / `downloads`:
- Add `set_type drawing_set_type` (nullable initially for back-compat) 
- `file_type` stays ('pdf' | 'cad_pdf')
- Drop `include_architectural` reliance (keep col nullable).

RLS + GRANTs for `plan_drawing_sets` (public read, admin write).

## 2. Types

Update `src/types/plan.ts`:
- Add `DrawingSetType`, `PlanDrawingSet` type.
- Extend `Plan` with optional `drawing_sets: PlanDrawingSet[]`.

## 3. Plan detail modal (customer)

Replace single image with carousel:
- Use existing shadcn `carousel` (embla) if available, else simple state-driven carousel.
- Prev/Next buttons, dot indicators, autoplay (5s).
- Source: `plan.gallery` array (fall back to `image_url`).

Replace file-type/arch toggle with:
- List of available drawing sets (from `plan_drawing_sets`).
- Each row: checkbox + segmented control PDF / PDF+CAD, showing price.
- Live total = sum of selected sets' chosen variant price.
- "Add to Cart" adds one cart_items row per selected set with `{plan_id, set_type, file_type, unit_price}`.

## 4. Cart / checkout / order

- Cart row displays set label and PDF or PDF+CAD.
- Checkout unchanged except order_items include `set_type`.
- Downloads row per purchased set.

## 5. Downloads page — master ZIP

Client-side merge using `jszip`:
- Fetch signed URLs for every purchased set's ZIP(s) for that plan (grouped by order+plan).
- Build outer zip named `<Plan Name>.zip` containing inner files named e.g. `Architectural PDF.zip`, `Mechanical PDF + CAD.zip` (for PDF+CAD purchases, include both inner ZIPs or a combined one — spec says one inner ZIP per set: name accordingly, include both pdf and cad zips inside a folder or as two files).
- Interpretation: one inner entry per purchased set. For PDF+CAD, include both source ZIPs inside a subfolder `<Set> PDF + CAD/` OR name two files. Simplest: subfolder containing the pdf zip and cad zip.
- Trigger single browser download.

Install `jszip`.

Group downloads UI by plan (one download button per plan per order producing master zip).

## 6. Admin panel — multi-step plan upload

Refactor `src/routes/admin.tsx` plan modal into 4 steps with a stepper:

**Step 1** – Metadata: name, plan_number, description, sqft, beds, baths, half_baths, cars, stories, width, depth, style, featured. (existing NumField fix stays)

**Step 2** – Toggle which drawing sets are available (4 checkboxes). Per selected set, input PDF price and PDF+CAD price.

**Step 3** – For each enabled set: two file inputs (PDF zip, CAD zip), `accept=".zip,application/zip"`, validate extension.

**Step 4** – Multiple preview images (jpg/jpeg/png/webp), stored in `plan-images` bucket, saved to `gallery` jsonb array. First image also becomes `image_url`.

Save flow: insert/update plan row → upload files → upsert `plan_drawing_sets` rows.

## 7. Storage

Reuse existing `plan-files` (private) for ZIPs and `plan-images` (public) for images. Paths:
- `plan-files/<plan_id>/<set>/pdf.zip`
- `plan-files/<plan_id>/<set>/cad.zip`
- `plan-images/<plan_id>/<uuid>.<ext>`

## 8. Back-compat

Existing plans without drawing_sets rows: modal shows a small "Purchase options coming soon" state or falls back to legacy PDF/CAD toggle using existing columns. Admin can edit and add sets.

## Technical notes

- `jszip` added as dep.
- Carousel: use shadcn Carousel (embla-carousel-react) — check if installed; else install.
- All price math server-verifiable via `plan_drawing_sets` (unit_price still stored on cart/order).
- `set_type` column added as nullable for smooth migration; new inserts always set it.

## Out of scope

- Actual payment provider live processing (still records order like today).
- Email delivery of the ZIP.
