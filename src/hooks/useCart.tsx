import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Plan, FileType } from "@/types/plan";

export type CartRow = {
  id: string;
  plan_id: string;
  file_type: FileType;
  include_architectural: boolean;
  unit_price: number;
  plan: Pick<Plan, "id" | "name" | "plan_number" | "image_url" | "base_price">;
};

type CartCtx = {
  items: CartRow[];
  count: number;
  total: number;
  refresh: () => Promise<void>;
  add: (plan: Plan, file_type: FileType, include_architectural: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
};

const Ctx = createContext<CartCtx>({} as CartCtx);

export const computePrice = (plan: Plan, file_type: FileType, include_architectural: boolean) => {
  let p = Number(plan.base_price);
  if (file_type === "cad_pdf") p += Number(plan.cad_addon_price);
  if (include_architectural) p += Number(plan.architectural_addon_price);
  return p;
};

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
      .select("id, plan_id, file_type, include_architectural, unit_price, plan:plans(id,name,plan_number,image_url,base_price)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems((data as unknown as CartRow[]) ?? []);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add: CartCtx["add"] = async (plan, file_type, include_architectural) => {
    if (!user) throw new Error("Please sign in to add to cart.");
    const unit_price = computePrice(plan, file_type, include_architectural);
    await supabase.from("cart_items").insert({
      user_id: user.id,
      plan_id: plan.id,
      file_type,
      include_architectural,
      unit_price,
    });
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
    <Ctx.Provider value={{ items, count: items.length, total, refresh, add, remove, clear }}>{children}</Ctx.Provider>
  );
}

export const useCart = () => useContext(Ctx);
