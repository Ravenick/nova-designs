export type Plan = {
  id: string;
  plan_number: string;
  name: string;
  description: string | null;
  image_url: string | null;
  gallery: string[] | null;
  base_price: number;
  architectural_addon_price: number;
  cad_addon_price: number;
  sqft: number;
  beds: number;
  baths: number;
  half_baths: number;
  cars: number;
  stories: number;
  width_ft: number;
  width_in: number;
  depth_ft: number;
  depth_in: number;
  style: string | null;
  featured: boolean;
  pdf_file_path?: string | null;
  cad_file_path?: string | null;
  created_at: string;
  drawing_sets?: PlanDrawingSet[];
};

export type FileType = "pdf" | "cad_pdf";

export type DrawingSetType = "architectural" | "structural" | "mechanical" | "electrical";

export const DRAWING_SET_LABELS: Record<DrawingSetType, string> = {
  architectural: "Architectural",
  structural: "Structural",
  mechanical: "Mechanical",
  electrical: "Electrical",
};

export const DRAWING_SET_ORDER: DrawingSetType[] = [
  "architectural",
  "structural",
  "mechanical",
  "electrical",
];

export type PlanDrawingSet = {
  id: string;
  plan_id: string;
  set_type: DrawingSetType;
  pdf_price: number;
  cad_price: number;
  pdf_zip_path: string | null;
  cad_zip_path: string | null;
};
