import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type FavCtx = {
  ids: Set<string>;
  toggle: (planId: string) => Promise<void>;
  isFav: (planId: string) => boolean;
  refresh: () => Promise<void>;
};

const Ctx = createContext<FavCtx>({} as FavCtx);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!user) { setIds(new Set()); return; }
    const { data } = await supabase.from("favorites").select("plan_id").eq("user_id", user.id);
    setIds(new Set((data ?? []).map((r: { plan_id: string }) => r.plan_id)));
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggle = async (planId: string) => {
    if (!user) throw new Error("Please sign in to save favorites.");
    if (ids.has(planId)) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("plan_id", planId);
      setIds((s) => { const n = new Set(s); n.delete(planId); return n; });
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, plan_id: planId });
      setIds((s) => new Set(s).add(planId));
    }
  };

  return <Ctx.Provider value={{ ids, toggle, isFav: (id) => ids.has(id), refresh }}>{children}</Ctx.Provider>;
}

export const useFavorites = () => useContext(Ctx);
