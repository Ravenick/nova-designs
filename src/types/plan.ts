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
  created_at: string;
};

export type FileType = "pdf" | "cad_pdf";
