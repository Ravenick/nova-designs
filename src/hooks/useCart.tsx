import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Plan, FileType, DrawingSetType, PlanDrawingSet } from "@/types/plan";

export type CartRow = {
  id: string;
  plan_id: string;
  file_type: FileType;
  include_architectural: boolean;
  set_type: DrawingSetType | null;
  unit_price: number;
  plan: Pick<Plan, "id" | "name" | "plan_number" | "image_url" | "base_price">;
};

export type AddCartItem = {
  set_type: DrawingSetType;
  file_type: FileType;
  unit_price: number;
};

type CartCtx = {
  items: CartRow[];
  count: number;
  total: number;
  refresh: () => Promise<void>;
  addSets: (plan: Plan, items: AddCartItem[]) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
};

const Ctx = createContext<CartCtx>({} as CartCtx);

export const computeSetPrice = (set: PlanDrawingSet, file_type: FileType) =>
  file_type === "cad_pdf" ? Number(set.cad_price) : Number(set.pdf_price);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartRow[]>([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    const { data } = await supabase
      .from("cart_items")
      .select(
        "id, plan_id, file_type, include_architectural, set_type, unit_price, plan:plans(id,name,plan_number,image_url,base_price)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems((data as unknown as CartRow[]) ?? []);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addSets: CartCtx["addSets"] = async (plan, list) => {
    if (!user) throw new Error("Please sign in to add to cart.");
    if (list.length === 0) throw new Error("Select at least one drawing set.");
    const rows = list.map((it) => ({
      user_id: user.id,
      plan_id: plan.id,
      set_type: it.set_type,
      file_type: it.file_type,
      include_architectural: false,
      unit_price: it.unit_price,
    }));
    const { error } = await supabase.from("cart_items").insert(rows);
    if (error) throw error;
    await refresh();
  };

  const remove = async (id: string) => {
    await supabase.from("cart_items").delete().eq("id", id);
    await refresh();
  };

  const clear = async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    await refresh();
  };

  const total = items.reduce((a, b) => a + Number(b.unit_price), 0);
  return (
    <Ctx.Provider value={{ items, count: items.length, total, refresh, addSets, remove, clear }}>{children}</Ctx.Provider>
  );
}

export const useCart = () => useContext(Ctx);
